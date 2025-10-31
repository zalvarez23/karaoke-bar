import React, { useState, useEffect, useCallback, useMemo } from "react";
import { X, Users, Music, UserPlus } from "lucide-react";
import { KaraokeColors } from "../../karaoke/colors";
import {
  Typography,
  Button,
  Spinner,
  StatusModal,
  UserItemSong,
  Input,
} from "../../karaoke/shared/components";
import { ModalSearchSongs } from "../../karaoke/pages/visit-manage/components/modal-search-songs";
import { VisitsServices } from "../../visits-manage/services/visits-services";
import { LocationServices } from "../../karaoke/shared/services";
import { IVisits } from "@/shared/types/visit-types";
import { ILocations } from "../../karaoke/shared/types/location.types";
import { TSongsRequested } from "../../karaoke/shared/types/visits.types";
import { TSongsRequested as TSongsRequestedService } from "@/shared/types/visit-types";

type SongData = {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  duration?: string;
};

type AddSongsModalProps = {
  visible: boolean;
  onClose: () => void;
  onSongsAdded: (songs: unknown[]) => void;
};

export const AddSongsModal: React.FC<AddSongsModalProps> = ({
  visible,
  onClose,
  onSongsAdded,
}) => {
  const [tables, setTables] = useState<ILocations[]>([]);
  const [selectedTable, setSelectedTable] = useState<ILocations | undefined>(
    undefined
  );
  const [activeVisit, setActiveVisit] = useState<IVisits | null>(null);
  const [loadingTables, setLoadingTables] = useState(false);
  const [loadingVisit, setLoadingVisit] = useState(false);
  const [showSongSearch, setShowSongSearch] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [guestName, setGuestName] = useState<string | undefined>(undefined);
  const [isCreatingVisit, setIsCreatingVisit] = useState(false);

  const visitsServices = useMemo(() => new VisitsServices(), []);
  const locationServices = useMemo(() => new LocationServices(), []);

  const loadTables = useCallback(() => {
    setLoadingTables(true);
    console.log("🔍 Cargando mesas usando LocationServices...");

    locationServices.listenToLocations((newLocations) => {
      console.log("📋 Mesas obtenidas:", newLocations);
      // Filtrar solo mesas disponibles y ocupadas (como en karaoke/mesas)
      const availableTables = newLocations.filter(
        (location) =>
          location.status === "available" || location.status === "occupied"
      );
      console.log("✅ Mesas filtradas:", availableTables);
      setTables(availableTables);
      setLoadingTables(false);
    });
  }, [locationServices]);

  const findActiveVisit = useCallback(
    (tableName: string, tableId?: string) => {
      setLoadingVisit(true);
      const unsubscribe = visitsServices.listenToActiveVisitByTable(
        tableName,
        tableId,
        (visit) => {
          console.log("🔄 Visita actualizada en tiempo real:", visit);
          setActiveVisit(visit);
          setLoadingVisit(false);
        }
      );
      return unsubscribe;
    },
    [visitsServices]
  );

  useEffect(() => {
    if (visible) {
      loadTables();
    }
  }, [visible, loadTables]);

  useEffect(() => {
    if (selectedTable && visible) {
      console.log("🔄 Iniciando listener para mesa:", selectedTable.name);
      const unsubscribe = findActiveVisit(selectedTable.name, selectedTable.id);
      return () => {
        console.log("🧹 Limpiando listener de visita");
        if (unsubscribe) {
          unsubscribe();
        }
      };
    }
  }, [selectedTable, visible, findActiveVisit]);

  const handleSongSelected = async (song: SongData, greeting?: string) => {
    if (!activeVisit) return;

    try {
      const visitId =
        (activeVisit as { visitId?: string; id?: string }).visitId ||
        (activeVisit as { visitId?: string; id?: string }).id ||
        "";

      // Convertir SongData a TSongsRequestedService
      const songToAdd: TSongsRequestedService = {
        id: song.id,
        title: song.title,
        description: song.description || "",
        thumbnail: song.thumbnail || "",
        duration: song.duration || "0:00",
        note: "",
        round: 1,
        numberSong: 1,
        date: new Date(),
        status: "pending",
        greeting: greeting?.trim() || "",
        visitId: visitId,
      };

      // Si no hay canciones en la lista, se inicia la ronda 1
      if (!activeVisit.songs || activeVisit.songs.length === 0) {
        songToAdd.round = 1;
        songToAdd.numberSong = 1;
        songToAdd.date = new Date();
        await visitsServices.addSongToVisit(visitId, songToAdd);
        console.log("✅ Canción agregada - Ronda 1, Canción 1");
        onSongsAdded([song]);
        return;
      }

      // Determinar la ÚLTIMA canción por numeración global (mayor numberSong)
      const lastSong = [...activeVisit.songs].sort(
        (a, b) => b.numberSong - a.numberSong
      )[0];
      console.log("🔄 Última canción:", lastSong);

      // Si la última canción global está completada, iniciar nueva ronda
      if (lastSong.status === "completed") {
        songToAdd.round = lastSong.round + 1;
        // Mantener numeración acumulativa para orden global
        songToAdd.numberSong = lastSong.numberSong + 1;
        songToAdd.date = new Date();
        await visitsServices.addSongToVisit(visitId, songToAdd);
        console.log(`✅ Canción agregada - Nueva ronda ${lastSong.round + 1}`);
        onSongsAdded([song]);
        return;
      }

      // Filtramos las canciones que pertenecen a la ronda actual
      const currentRoundSongs = activeVisit.songs.filter(
        (s) => s.round === lastSong.round
      );

      // Si ya hay el límite de canciones en la ronda actual
      if (currentRoundSongs.length >= (selectedTable?.songLimit || 2)) {
        // Verificamos si todas están completadas
        const allCompleted = currentRoundSongs.every(
          (s) => s.status === "completed"
        );

        if (!allCompleted) {
          // Si alguna no está completada, se impide agregar otra
          console.log("❌ Límite de canciones alcanzado en la ronda actual");
          setShowLimitModal(true);
          return;
        } else {
          // Si todas están completadas, iniciamos una nueva ronda
          songToAdd.round = lastSong.round + 1;
          songToAdd.numberSong = lastSong.numberSong + 1;
          songToAdd.date = new Date();
          await visitsServices.addSongToVisit(visitId, songToAdd);
          console.log(
            `✅ Canción agregada - Nueva ronda ${
              lastSong.round + 1
            } (todas completadas)`
          );
          onSongsAdded([song]);
          return;
        }
      } else {
        // Si hay menos canciones que el límite en la ronda actual, agregamos la canción a esa ronda
        songToAdd.round = lastSong.round;
        songToAdd.numberSong = lastSong.numberSong + 1;
        songToAdd.date = lastSong.date;
        console.log("🎵 Agregando canción a ronda actual:", songToAdd);
        await visitsServices.addSongToVisit(visitId, songToAdd);
        console.log(`✅ Canción agregada - Ronda ${lastSong.round} actual`);
        onSongsAdded([song]);
        return;
      }
    } catch (error) {
      console.error("❌ Error agregando canción:", error);
    }
  };

  const handleDeleteSong = async (songId: string, numberSong: number) => {
    try {
      if (!activeVisit) return;

      const visitId =
        (activeVisit as { visitId?: string; id?: string }).visitId ||
        (activeVisit as { visitId?: string; id?: string }).id ||
        "";

      await visitsServices.removeSongFromVisit(visitId, songId, numberSong);
      console.log("✅ Canción eliminada exitosamente");
    } catch (error) {
      console.error("❌ Error eliminando canción:", error);
    }
  };

  const canAddMoreSongs = useCallback(() => {
    if (!activeVisit || !selectedTable) {
      console.log("❌ No hay visita activa o mesa seleccionada");
      return false;
    }

    // Si no hay canciones, se puede agregar
    if (!activeVisit.songs || activeVisit.songs.length === 0) {
      console.log("✅ No hay canciones, se puede agregar");
      return true;
    }

    // Determinar la ÚLTIMA canción por numeración global (mayor numberSong)
    const lastSong = [...activeVisit.songs].sort(
      (a, b) => b.numberSong - a.numberSong
    )[0];

    console.log("🔄 Última canción:", lastSong);

    // Si la última canción global está completada, se puede agregar
    if (lastSong.status === "completed") {
      console.log("✅ Última canción completada, se puede agregar");
      return true;
    }

    // Filtramos las canciones que pertenecen a la ronda actual
    const currentRoundSongs = activeVisit.songs.filter(
      (s) => s.round === lastSong.round
    );

    console.log("📊 Ronda actual:", {
      round: lastSong.round,
      songsInRound: currentRoundSongs.length,
      songLimit: selectedTable.songLimit,
    });

    // Si ya hay canciones en la ronda actual
    if (currentRoundSongs.length >= (selectedTable.songLimit || 2)) {
      // Verificamos si todas están completadas
      const allCompleted = currentRoundSongs.every(
        (s) => s.status === "completed"
      );

      console.log("🔍 Todas completadas:", allCompleted);
      return allCompleted; // Solo se puede agregar si todas están completadas
    }

    console.log("✅ Menos canciones que el límite, se puede agregar");
    return true; // Si hay menos canciones que el límite, se puede agregar
  }, [activeVisit, selectedTable]);

  const handleCreateVisit = async () => {
    if (!selectedTable || !guestName?.trim()) {
      console.log("❌ Falta mesa seleccionada o nombre del invitado");
      return;
    }

    setIsCreatingVisit(true);
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000; // 1 segundo

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        // Generar un ID único para el invitado usando timestamp + random (como en karaoke)
        const guestId = `guest_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;

        console.log("🆕 Creando nueva visita para invitado:", {
          guestId,
          guestName: guestName?.trim(),
          tableName: selectedTable.name,
          tableId: selectedTable.id,
          attempt,
        });

        // Crear la nueva visita
        const newVisit: IVisits = {
          userId: guestId,
          userName: guestName?.trim(),
          location: selectedTable.name,
          locationId: selectedTable.id,
          status: "online",
        };

        // Crear visita y actualizar mesa usando transacción atómica
        const visitId = await visitsServices.createWebVisitWithTransaction(
          newVisit,
          selectedTable.name,
          selectedTable.id || ""
        );
        console.log(
          `✅ Visita ${visitId} creada y mesa ${selectedTable.name} actualizada con transacción (intento ${attempt})`
        );

        // Limpiar el formulario
        setGuestName("");
        setIsCreatingVisit(false);

        // La visita se detectará automáticamente por el listener
        return; // Éxito, salir del bucle
      } catch (error) {
        console.error(`❌ Intento ${attempt} de crear visita falló:`, error);

        if (attempt === MAX_RETRIES) {
          // Último intento falló
          console.error(
            `❌ No se pudo crear la visita después de ${MAX_RETRIES} intentos`
          );
          setIsCreatingVisit(false);
          return;
        }

        // Esperar antes del siguiente intento
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      }
    }
  };

  const handleOpenSongSearch = () => {
    if (activeVisit) {
      const canAdd = canAddMoreSongs();
      console.log("🔍 Validando límite de canciones:", {
        activeVisit: activeVisit.id,
        songsCount: activeVisit.songs?.length || 0,
        selectedTable: selectedTable?.name,
        songLimit: selectedTable?.songLimit,
        canAddMore: canAdd,
      });

      // Validar si se puede agregar más canciones antes de abrir el modal
      if (!canAdd) {
        console.log(
          "❌ Límite de canciones alcanzado, mostrando modal de advertencia"
        );
        setShowLimitModal(true);
        return;
      }

      console.log("✅ Límite OK, abriendo modal de búsqueda");
      setShowSongSearch(true);
    } else {
      console.log("❌ No hay visita activa");
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className="w-full h-full bg-gray-900 relative flex flex-col border border-gray-700"
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
          paddingLeft: "env(safe-area-inset-left)",
          paddingRight: "env(safe-area-inset-right)",
        }}
      >
        {/* Header Fixed */}
        <div
          className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 px-6 border-b border-gray-700 bg-gray-900"
          style={{
            paddingTop: "calc(1rem + env(safe-area-inset-top))",
            paddingLeft: "calc(1.5rem + env(safe-area-inset-left))",
            paddingRight: "calc(1.5rem + env(safe-area-inset-right))",
          }}
        >
          <Typography
            variant="headline-sm-semi"
            color={KaraokeColors.base.white}
          >
            Agregar Canciones
          </Typography>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded-full transition-colors"
          >
            <X size={24} color={KaraokeColors.base.white} />
          </button>
        </div>

        {/* Content */}
        <div
          className="flex-1 overflow-y-auto p-4 px-6 pt-24"
          style={{
            paddingLeft: "calc(1.5rem + env(safe-area-inset-left))",
            paddingRight: "calc(1.5rem + env(safe-area-inset-right))",
            paddingBottom: "calc(1rem + env(safe-area-inset-bottom))",
          }}
        >
          {/* Layout de 2 columnas */}
          <div className="flex gap-6">
            {/* Columna izquierda: Selección de Mesas */}
            <div className="w-1/2">
              <Typography
                variant="body-md-semi"
                color={KaraokeColors.base.white}
                className="mb-3"
              >
                Seleccionar Mesa
              </Typography>

              {loadingTables ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner size={24} color={KaraokeColors.primary.primary500} />
                  <Typography
                    variant="body-sm"
                    color={KaraokeColors.gray.gray400}
                    className="ml-3"
                  >
                    Cargando mesas...
                  </Typography>
                </div>
              ) : tables.length === 0 ? (
                <div className="text-center py-8">
                  <Typography
                    variant="body-md"
                    color={KaraokeColors.gray.gray400}
                  >
                    No se encontraron mesas disponibles
                  </Typography>
                  <Button
                    onClick={loadTables}
                    theme="secondary"
                    className="mt-4"
                  >
                    Reintentar
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {tables
                    .sort((a, b) => {
                      // "server" siempre primero
                      const aIsServer = a.name.toLowerCase() === "server";
                      const bIsServer = b.name.toLowerCase() === "server";
                      if (aIsServer && !bIsServer) return -1;
                      if (!aIsServer && bIsServer) return 1;

                      // Ordenar: Mesas primero, luego Barras
                      const aIsBar = a.name.toLowerCase().includes("barra");
                      const bIsBar = b.name.toLowerCase().includes("barra");

                      if (aIsBar && !bIsBar) return 1; // a es barra, b es mesa -> b va primero
                      if (!aIsBar && bIsBar) return -1; // a es mesa, b es barra -> a va primero

                      // Si ambos son del mismo tipo, ordenar alfabéticamente
                      return a.name.localeCompare(b.name);
                    })
                    .map((table) => {
                      const isServer = table.name.toLowerCase() === "server";
                      return (
                        <button
                          key={table.id}
                          onClick={() => {
                            setSelectedTable(table);
                            setGuestName(table.name || "");
                          }}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            selectedTable?.id === table.id
                              ? "border-purple-500 bg-purple-500/10"
                              : isServer
                              ? "border-red-500 bg-red-500/20"
                              : table.status === "available"
                              ? "border-green-500 bg-green-500/10"
                              : table.status === "occupied"
                              ? "border-blue-500 bg-blue-500/10"
                              : "border-gray-600 bg-gray-800 hover:border-gray-500"
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <Users
                              size={20}
                              color={
                                isServer
                                  ? "#DC2626"
                                  : table.status === "available"
                                  ? "#10B981"
                                  : table.status === "occupied"
                                  ? "#3B82F6"
                                  : KaraokeColors.primary.primary400
                              }
                            />
                            <div className="text-center">
                              <Typography
                                variant="body-sm-semi"
                                color={KaraokeColors.base.white}
                                className="text-sm font-semibold"
                              >
                                {table.name}
                              </Typography>
                              <Typography
                                variant="body-sm"
                                color={KaraokeColors.gray.gray400}
                                className="text-xs"
                              >
                                {table.status === "available"
                                  ? "Disponible"
                                  : "Ocupada"}
                              </Typography>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Columna derecha: Pedir Canciones */}
            <div className="w-1/2">
              <Typography
                variant="body-md-semi"
                color={KaraokeColors.base.white}
                className="mb-3"
              >
                Agregar canciones
              </Typography>

              {!selectedTable ? (
                <div className="bg-gray-800 rounded-lg p-6 text-center">
                  <Typography
                    variant="body-md"
                    color={KaraokeColors.gray.gray400}
                  >
                    Selecciona una mesa para comenzar
                  </Typography>
                </div>
              ) : loadingVisit ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner size={24} color={KaraokeColors.primary.primary500} />
                  <Typography
                    variant="body-sm"
                    color={KaraokeColors.gray.gray400}
                    className="ml-3"
                  >
                    Buscando visita activa...
                  </Typography>
                </div>
              ) : activeVisit ? (
                <div className="bg-[#191720] rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Music size={20} color={KaraokeColors.primary.primary400} />
                    <Typography
                      variant="headline-lg-semi"
                      color={KaraokeColors.base.white}
                    >
                      Mesa: {selectedTable?.name || "Sin nombre"}
                    </Typography>
                  </div>
                  <Typography
                    variant="body-sm"
                    color={KaraokeColors.gray.gray400}
                  >
                    Canciones en cola: {activeVisit.songs?.length || 0}
                  </Typography>

                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={handleOpenSongSearch}
                      theme="primary"
                      className="flex-1"
                    >
                      <Music size={16} className="mr-2" />
                      Pedir Canciones
                    </Button>
                  </div>

                  {/* Lista de canciones */}
                  {activeVisit.songs && activeVisit.songs.length > 0 && (
                    <div className="mt-4">
                      <Typography
                        variant="body-sm-semi"
                        color={KaraokeColors.base.white}
                        className="mb-2"
                      >
                        Canciones en cola:
                      </Typography>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {activeVisit.songs
                          .sort((a, b) => b.numberSong - a.numberSong)
                          .map((song, index) => (
                            <UserItemSong
                              key={`${song.id}-${index}`}
                              {...(song as TSongsRequested)}
                              onDelete={handleDeleteSong}
                            />
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="text-center mb-6">
                    <Typography
                      variant="headline-lg-semi"
                      color={KaraokeColors.base.white}
                      className="mb-2"
                    >
                      {`Mesa: ${selectedTable?.name || "Sin nombre"}`}
                    </Typography>
                    <Typography
                      variant="body-md"
                      color={KaraokeColors.gray.gray400}
                      className="mb-2"
                    >
                      No hay visita activa para esta mesa
                    </Typography>
                    <Typography
                      variant="body-sm"
                      color={KaraokeColors.gray.gray500}
                    >
                      Crea una nueva visita para comenzar a pedir canciones
                    </Typography>
                  </div>

                  {/* Formulario para crear nueva visita */}
                  <div className="space-y-4">
                    <div>
                      <Typography
                        variant="body-sm-semi"
                        color={KaraokeColors.base.white}
                        className="mb-2"
                      >
                        Nombre del invitado
                      </Typography>
                      <Input
                        value={guestName}
                        onChangeText={setGuestName}
                        placeholder="Ingresa el nombre del invitado"
                        className="w-full"
                      />
                    </div>

                    <Button
                      onClick={handleCreateVisit}
                      theme="primary"
                      className="w-full"
                      disabled={!guestName?.trim() || isCreatingVisit}
                    >
                      {isCreatingVisit ? (
                        <>
                          <Spinner size={16} color={KaraokeColors.base.white} />
                          <span className="ml-2">Creando visita...</span>
                        </>
                      ) : (
                        <>
                          <UserPlus size={16} className="mr-2" />
                          Ingresar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal de búsqueda de canciones */}
        <ModalSearchSongs
          visible={showSongSearch}
          onClose={() => setShowSongSearch(false)}
          onSongSelected={handleSongSelected}
          tableName={selectedTable?.name || ""}
        />

        {/* Modal de límite de canciones */}
        <StatusModal
          visible={showLimitModal}
          status="warning"
          description={`¡Entendemos que quieres cantar más! Ya tienes ${
            selectedTable?.songLimit || 2
          } ${
            (selectedTable?.songLimit || 2) === 1 ? "canción" : "canciones"
          } en tu ronda. Espera un momento a que se canten para agregar más.`}
          onClose={() => setShowLimitModal(false)}
          onConfirm={() => setShowLimitModal(false)}
        />
      </div>
    </div>
  );
};
