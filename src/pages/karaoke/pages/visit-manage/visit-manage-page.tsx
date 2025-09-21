import { FC, useEffect, useState } from "react";
import { KaraokeColors } from "../../colors";
import {
  Header,
  Typography,
  ConfirmModal,
  UserItemSong,
} from "../../shared/components";
import { LocationServices } from "../../shared/services";
import { ILocations } from "../../shared/types/location.types";
import { UserServices } from "../../shared/services";
import { useUsersContext } from "../../shared/context";
import { VisitsServices } from "../../shared/services";
import {
  IVisits,
  TSongsRequested,
  TGuestUsers,
} from "../../shared/types/visits.types";
import { Circle, MapPin } from "lucide-react";
import { TableRequestCard } from "./components/table-request-card";
import { BottomNavigation } from "../../shared/components";
import {
  ICON_TABLE_COLOR_AVAILABLE,
  ICON_TABLE_COLOR_NOT_AVAILABLE,
} from "./constants/visit-manage.constants";
import {
  TableLocation,
  BottomSelectLocation,
  VisitPendingState,
  ModalSearchSongs,
} from "./components";

export const KaraokeVisitManagePage: FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [locations, setLocations] = useState<ILocations[]>([]);
  const [tableSelected, setTableSelected] = useState<ILocations | undefined>(
    undefined
  );
  const [currentVisit, setCurrentVisit] = useState<IVisits | null>(null);
  const [showSearchSongsModal, setShowSearchSongsModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showCallWaiterModal, setShowCallWaiterModal] = useState(false);
  const [pendingGuestUsers, setPendingGuestUsers] = useState<TGuestUsers[]>([]);

  const {
    state: { user },
  } = useUsersContext();

  // Identificar si es host o invitado (igual que en el móvil)
  const isHost = currentVisit?.userId === user.id;
  const isGuest = currentVisit?.userId !== user.id;

  const locationServices = new LocationServices();
  const userServices = new UserServices();
  const visitServices = new VisitsServices();

  useEffect(() => {
    locationServices.listenToLocations(setLocations);

    return () => {
      locationServices.stopListening();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Escuchar el estado de la visita del usuario
  useEffect(() => {
    visitServices.getVisitByUserAndStatus(setCurrentVisit, user.id);

    return () => {
      visitServices.stopListening();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filtrar solicitudes pendientes (igual que en el móvil)
  useEffect(() => {
    if (currentVisit?.guestUsers) {
      const pendingGuests = currentVisit.guestUsers.filter(
        (guest) => guest.status === "pending"
      );
      setPendingGuestUsers(pendingGuests);
    } else {
      setPendingGuestUsers([]);
    }
  }, [currentVisit]);

  const handleSelectTable = (item: ILocations) => {
    setTableSelected(item);
  };

  const locationReservedOperations = async () => {
    try {
      setIsLoading(true);

      // Actualizar el estado del usuario a online
      await userServices.updateStatusUser(user.id, true);

      // Cambiar el estado de la mesa a ocupada (igual que en móvil)
      await locationServices.changeStatusLocation(
        tableSelected?.id || "",
        "occupied"
      );

      // Determinar el estado inicial de la visita
      const initialVisitStatus = "pending" as const;

      // Guardar la visita con estado inicial
      const visitData = {
        userId: user.id,
        userName: `${user.name} ${user.lastName}`,
        location: tableSelected?.name,
        locationId: tableSelected?.id,
        status: initialVisitStatus,
      };

      console.log("🔄 Guardando visita:", visitData);
      const visitId = await visitServices.saveVisit(visitData);
      console.log("✅ Visita guardada con ID:", visitId);

      setTableSelected(undefined);
    } catch {
      alert("Tenemos inconvenientes con la conexión, inténtelo en un momento.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReservedOperations = () => {
    locationReservedOperations();
  };

  // Funciones para la pantalla de karaoke
  const handleOnStart = () => {
    setShowSearchSongsModal(true);
  };

  const handleCallWaiter = () => {
    setShowCallWaiterModal(true);
  };

  const handleExitTable = () => {
    setShowExitModal(true);
  };

  const handleConfirmCallWaiter = async () => {
    try {
      console.log("🔔 Llamando a la mesera...");
      if (currentVisit?.id) {
        await visitServices.updateCallWaiter(currentVisit.id, true);
        setShowCallWaiterModal(false);
      } else {
        alert("No se pudo enviar la llamada a la mesera");
      }
    } catch (error) {
      console.error("❌ Error al llamar a la mesera:", error);
      alert("No se pudo enviar la llamada a la mesera");
    }
  };

  const handleCancelCallWaiter = () => {
    setShowCallWaiterModal(false);
  };

  const handleConfirmExitTable = async () => {
    try {
      if (isHost) {
        // Comportamiento para HOST
        await handleHostExitTable();
      } else {
        // Comportamiento para INVITADO
        await handleGuestExitTable();
      }
      setShowExitModal(false);
    } catch (error) {
      console.error("❌ Error al salir de la mesa:", error);
    }
  };

  const handleHostExitTable = async () => {
    console.log("🚪 Host saliendo de mesa...");
    console.log("📊 currentVisit:", currentVisit);

    // 1. Poner a TODOS los usuarios (host + invitados) como offline
    if (currentVisit?.usersIds) {
      console.log("👥 Usuarios en la mesa:", currentVisit.usersIds);
      for (const userId of currentVisit.usersIds) {
        console.log(`🔄 Poniendo usuario ${userId} como offline`);
        await userServices.updateStatusUser(userId, false);
      }
    }

    // 2. Cancelar la visita
    if (currentVisit?.id) {
      console.log(`📝 Cancelando visita ${currentVisit.id}`);
      await visitServices.updateStatus(currentVisit.id, "cancelled");
    }

    // 3. Liberar la mesa
    if (currentVisit?.locationId) {
      console.log(`🪑 Liberando mesa por ID: ${currentVisit.locationId}`);
      await locationServices.changeStatusLocation(
        currentVisit.locationId,
        "available"
      );
    } else if (currentVisit?.location) {
      console.log(`🪑 Liberando mesa por nombre: ${currentVisit.location}`);
      await locationServices.changeStatusLocationByName(
        currentVisit.location,
        "available"
      );
    } else {
      console.log(
        "⚠️ No se pudo liberar la mesa: no hay locationId ni location"
      );
    }

    console.log("✅ Host salió de mesa correctamente");
  };

  const handleGuestExitTable = async () => {
    console.log("🚪 Invitado saliendo de mesa...");

    // 1. Solo el invitado se pone offline
    await userServices.updateStatusUser(user.id, false);

    // 2. Remover al invitado de la visita
    if (currentVisit?.id) {
      await visitServices.removeUserFromVisit(currentVisit.id, user.id);
    }

    // 3. NO cancelar la visita (sigue activa para el host)
    // 4. NO liberar la mesa (el host sigue ahí)

    console.log("✅ Invitado salió de mesa correctamente");
  };

  const handleCancelExitTable = () => {
    setShowExitModal(false);
  };

  // Métodos para manejar solicitudes de mesa (igual que en el móvil)
  const handleOnConfirmGuestUser = async (userId: string) => {
    await visitServices.acceptGuestUser(currentVisit?.id || "", userId);
    userServices.updateStatusUser(userId, true);

    // Remover de la lista de pendientes
    setPendingGuestUsers((prev) =>
      prev.filter((guest) => guest.userId !== userId)
    );
  };

  const handleOnCloseGuestUser = async (userId: string) => {
    await visitServices.rejectGuestUser(currentVisit?.id || "", userId);

    // Remover de la lista de pendientes
    setPendingGuestUsers((prev) =>
      prev.filter((guest) => guest.userId !== userId)
    );
  };

  const handleOnSelectSong = async (song: TSongsRequested) => {
    if (!currentVisit?.songs) {
      return;
    }

    try {
      // Si no hay canciones en la lista, se inicia la ronda 1
      if (currentVisit.songs.length === 0) {
        song.round = 1;
        song.numberSong = 1;
        song.date = new Date();
        await visitServices.addSongToVisit(currentVisit.id, song);
        return;
      }

      // Determinar la ÚLTIMA canción por numeración global (mayor numberSong)
      const lastSong = [...currentVisit.songs].sort(
        (a, b) => b.numberSong - a.numberSong
      )[0];
      console.log("🔄 Última canción:", lastSong);

      // Si la última canción global está completada, iniciar nueva ronda
      if (lastSong.status === "completed") {
        song.round = lastSong.round + 1;
        // Mantener numeración acumulativa para orden global
        song.numberSong = lastSong.numberSong + 1;
        song.date = new Date();
        await visitServices.addSongToVisit(currentVisit.id, song);
        return;
      }

      // Filtramos las canciones que pertenecen a la ronda actual
      const currentRoundSongs = currentVisit.songs.filter(
        (s) => s.round === lastSong.round
      );

      // Si ya hay 2 canciones en la ronda actual
      if (currentRoundSongs.length >= 2) {
        // Verificamos si todas están completadas
        const allCompleted = currentRoundSongs.every(
          (s) => s.status === "completed"
        );

        if (!allCompleted) {
          // Si alguna no está completada, se impide agregar otra
          alert("Solo puedes tener 2 canciones pendientes o en canto.");
          return;
        } else {
          // Si todas están completadas, iniciamos una nueva ronda
          song.round = lastSong.round + 1;
          song.numberSong = lastSong.numberSong + 1;
          song.date = new Date();
          await visitServices.addSongToVisit(currentVisit.id, song);
          return;
        }
      } else {
        // Si hay menos de 2 canciones en la ronda actual, agregamos la canción a esa ronda
        song.round = lastSong.round;
        song.numberSong = lastSong.numberSong + 1;
        song.date = lastSong.date;
        console.log(song);
        console.log("Nuevo");
        await visitServices.addSongToVisit(currentVisit.id, song);
        return;
      }
    } catch (error) {
      console.error("Error adding song:", error);
      alert("No se pudo agregar la canción");
    }
  };

  const handleOnDelete = async (songId: string, numberSong: number) => {
    if (!currentVisit?.id) {
      return;
    }

    try {
      await visitServices.removeSongFromVisit(
        currentVisit.id,
        songId,
        numberSong
      );
      console.log("✅ Canción eliminada correctamente");
    } catch (error) {
      console.error("❌ Error eliminando canción:", error);
      alert("No se pudo eliminar la canción");
    }
  };

  const handleOnSendGreeting = async (
    greeting: string,
    songId: string
  ): Promise<boolean> => {
    if (!currentVisit?.id) {
      return false;
    }

    try {
      console.log("💬 Enviando saludo:", greeting, "para canción:", songId);
      await visitServices.updateSongGreeting(currentVisit.id, songId, greeting);
      console.log("✅ Saludo enviado correctamente");
      return true;
    } catch (error) {
      console.error("❌ Error enviando saludo:", error);
      alert("No se pudo enviar el saludo");
      return false;
    }
  };

  // Función para crear filas de mesas (5 columnas)
  const createTableRows = (locations: ILocations[]) => {
    const rows = [];
    for (let i = 0; i < locations.length; i += 5) {
      const row = locations.slice(i, i + 5);
      rows.push(row);
    }
    return rows;
  };

  const tableRows = createTableRows(locations);

  // Si hay una visita pendiente, mostrar pantalla de espera
  if (currentVisit?.status === "pending") {
    return (
      <div
        className="min-h-screen"
        style={{
          backgroundColor: KaraokeColors.base.darkPrimary,
          paddingTop: "env(safe-area-inset-top, 0px)",
        }}
      >
        {/* Header */}
        <div className="pt-2.5 px-9">
          <Header
            title="Excelente,"
            description="Solo un paso más para vivir nuestra experiencia !"
          />
          <VisitPendingState />
        </div>
      </div>
    );
  }

  // Si hay una visita activa (online), mostrar pantalla de karaoke
  if (currentVisit?.status === "online") {
    return (
      <div
        className="min-h-screen"
        style={{
          backgroundColor: KaraokeColors.base.darkPrimary,
          paddingTop: "env(safe-area-inset-top, 0px)",
        }}
      >
        {/* Header con avatar y rol */}
        <div className="pt-2.5 px-9">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center">
                <span className="text-white text-lg">🎤</span>
              </div>
              <div>
                <Typography
                  variant="body-md-semi"
                  color={KaraokeColors.base.white}
                >
                  Mix DJ - KantoBar
                </Typography>
                {isHost && (
                  <Typography
                    variant="body-sm"
                    color={KaraokeColors.green.green400}
                  >
                    🎤 Host de la mesa
                  </Typography>
                )}
                {isGuest && (
                  <Typography
                    variant="body-sm"
                    color={KaraokeColors.purple.purple400}
                  >
                    👥 Invitado en la mesa
                  </Typography>
                )}
              </div>
            </div>
            <button onClick={handleExitTable} className="p-2">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 px-6 py-4">
          {/* Estado vacío si no hay canciones */}
          {(!currentVisit?.songs || currentVisit.songs.length === 0) && (
            <div className="flex flex-col items-center justify-center mt-8">
              <Typography
                variant="body-lg-semi"
                color={KaraokeColors.base.white}
              >
                ¡Es hora de cantar!
              </Typography>
              <Typography
                variant="body-sm"
                color={KaraokeColors.gray.gray500}
                className="text-center mt-2.5"
              >
                Selecciona tus canciones favoritas para comenzar
              </Typography>
              <button
                onClick={handleOnStart}
                className="mt-5 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Buscar Canciones
              </button>
            </div>
          )}

          {/* Acciones */}
          <div className="mt-8">
            <Typography variant="body-lg-semi" color={KaraokeColors.base.white}>
              Acciones
            </Typography>
            <div className="flex gap-3 mt-4 overflow-x-auto">
              <button
                onClick={handleOnStart}
                className="flex-shrink-0 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
              >
                + Pedir canciones
              </button>
              <button
                onClick={handleCallWaiter}
                className="flex-shrink-0 px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm hover:bg-yellow-600 transition-colors"
              >
                + Llamar Mesero(a)
              </button>
              <button
                onClick={handleExitTable}
                className="flex-shrink-0 px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
              >
                - Salir de mesa
              </button>
            </div>
          </div>
          <BottomNavigation />

          {/* Mostrar lista de solicitudes pendientes (solo para hosts) */}
          {isHost && pendingGuestUsers.length > 0 && (
            <div className="mt-8">
              <Typography
                variant="body-lg-semi"
                color={KaraokeColors.base.white}
                className="mb-4"
              >
                Solicitudes de Mesa ({pendingGuestUsers.length})
              </Typography>
              <div className="space-y-3">
                {pendingGuestUsers.map((guest) => (
                  <TableRequestCard
                    key={`guest-${guest.userId}`}
                    guestUser={guest}
                    onAccept={() => handleOnConfirmGuestUser(guest.userId)}
                    onReject={() => handleOnCloseGuestUser(guest.userId)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Lista de canciones si las hay */}
          {currentVisit?.songs && currentVisit.songs.length > 0 && (
            <div className="mt-8">
              <Typography
                variant="body-lg-semi"
                color={KaraokeColors.base.white}
              >
                Mis canciones ({currentVisit.songs.length}) -{" "}
                {currentVisit.location}
              </Typography>
              <div className="mt-4 space-y-3">
                {currentVisit.songs
                  .sort((a, b) => b.round - a.round)
                  .map((song, index) => (
                    <UserItemSong
                      key={`song-${song.id}-${index}`}
                      {...song}
                      onDelete={handleOnDelete}
                      onSendGreeting={handleOnSendGreeting}
                    />
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Modales */}
        <ConfirmModal
          visible={showExitModal}
          title="Salir de Mesa"
          message={
            isHost
              ? "¿Estás seguro de que quieres salir de la mesa? Se cancelará la visita, se liberará la mesa y todos los invitados serán expulsados."
              : "¿Estás seguro de que quieres salir de la mesa? Saldrás de la visita pero la mesa seguirá activa para el host."
          }
          showCancelButton={true}
          type="warning"
          onConfirm={handleConfirmExitTable}
          onClose={handleCancelExitTable}
        />

        <ConfirmModal
          visible={showCallWaiterModal}
          title="Llamar a la Mesera"
          message="¿Estás seguro de que quieres llamar a la mesera?"
          showCancelButton={true}
          type="info"
          onConfirm={handleConfirmCallWaiter}
          onClose={handleCancelCallWaiter}
        />

        {/* Modal de búsqueda de canciones */}
        <ModalSearchSongs
          visible={showSearchSongsModal}
          onClose={() => setShowSearchSongsModal(false)}
          onSongSelected={handleOnSelectSong}
        />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pb-20"
      style={{
        backgroundColor: KaraokeColors.base.darkPrimary,
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}
    >
      {/* Header */}
      <div className="pt-2.5 px-9">
        <Header
          title="Excelente,"
          description="Es hora de seleccionar tu mesa y vivir la experiencia."
        />
        <Typography
          variant="body-lg-semi"
          color={KaraokeColors.base.white}
          className="my-2.5"
        >
          Locaciones
        </Typography>
      </div>
      {/* Body */}
      <div className="flex-1 px-6">
        {/* Grid de Mesas */}
        <div className="mt-2.5">
          {tableRows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-between mb-5">
              {row.map((location) => (
                <TableLocation
                  key={`location-${location.id || location.name}`}
                  item={location}
                  tableSelected={tableSelected?.id}
                  onSelectTable={handleSelectTable}
                />
              ))}
              {/* Rellenar espacios vacíos si la fila no tiene 5 elementos */}
              {Array.from({ length: 5 - row.length }).map((_, index) => (
                <div
                  key={`empty-${rowIndex}-${index}`}
                  className="flex-1 mx-2.5"
                />
              ))}
            </div>
          ))}
        </div>

        {/* Leyenda */}
        <div className="mt-6 flex flex-row justify-around items-center">
          <div className="flex items-center gap-2.5">
            <Circle
              size={20}
              color={ICON_TABLE_COLOR_AVAILABLE}
              fill={ICON_TABLE_COLOR_AVAILABLE}
            />
            <Typography variant="body-sm-semi" color={KaraokeColors.base.white}>
              Disponible
            </Typography>
          </div>
          <div className="flex items-center gap-2.5">
            <Circle
              size={20}
              color={ICON_TABLE_COLOR_NOT_AVAILABLE}
              fill={ICON_TABLE_COLOR_NOT_AVAILABLE}
            />
            <Typography variant="body-sm-semi" color={KaraokeColors.base.white}>
              No disponible
            </Typography>
          </div>
        </div>
      </div>
      {/* Bottom Section */}
      <div className="absolute bottom-24 left-0 right-0 mx-6.5 mb-8">
        <BottomSelectLocation
          item={tableSelected}
          onConfirm={handleReservedOperations}
          isLoading={isLoading}
        />
      </div>
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};
