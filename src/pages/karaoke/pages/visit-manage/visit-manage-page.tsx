import { FC, useEffect, useState } from "react";
import { KaraokeColors } from "../../colors";
import {
  Header,
  Typography,
  Spinner,
  StatusModal,
} from "../../shared/components";
import { LocationServices, ReservationServices } from "../../shared/services";
import { ILocations } from "../../shared/types/location.types";
import { UserServices } from "../../shared/services";
import { useUsersContext } from "../../shared/context";
import { VisitsServices } from "../../shared/services";
import {
  IVisits,
  TSongsRequested,
  TGuestUsers,
} from "../../shared/types/visits.types";
import { Circle } from "lucide-react";
import {
  ICON_TABLE_COLOR_AVAILABLE,
  ICON_TABLE_COLOR_NOT_AVAILABLE,
} from "./constants/visit-manage.constants";
import {
  TableLocation,
  BottomSelectLocation,
  VisitOnline,
  VisitPendingState,
} from "./components";
import { getFirestore, addDoc, collection } from "firebase/firestore";
import { KARAOKE_ROUTES } from "../../shared/types";

export const KaraokeVisitManagePage: FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMesas, setIsLoadingMesas] = useState(true);
  const [locations, setLocations] = useState<ILocations[]>([]);
  const [tableSelected, setTableSelected] = useState<ILocations | undefined>(
    undefined
  );
  const [currentVisit, setCurrentVisit] = useState<IVisits | null>(null);
  const [showSearchSongsModal, setShowSearchSongsModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showCallWaiterModal, setShowCallWaiterModal] = useState(false);
  const [pendingGuestUsers, setPendingGuestUsers] = useState<TGuestUsers[]>([]);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitSong, setLimitSong] = useState(2);
  const {
    state: { user },
  } = useUsersContext();

  // Identificar si es host o invitado (igual que en el móvil)
  const isHost = currentVisit?.userId === user.id;
  const locationServices = new LocationServices();
  const userServices = new UserServices();
  const visitServices = new VisitsServices();
  const reservationServices = new ReservationServices();
  const db = getFirestore();

  // Función para loggear errores a Firebase
  const logErrorToFirebase = async (error: Error, context: string) => {
    const errorData = {
      error_message: error.message,
      error_name: error.name,
      error_stack: error.stack,
      context: context,
      user_id: user.id,
      user_name: `${user.name} ${user.lastName}`,
      table_selected: tableSelected?.name || "none",
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      url: window.location.href,
    };

    try {
      // Intentar guardar en Firebase
      await addDoc(collection(db, "reservation_errors"), errorData);
      console.log("✅ Error loggeado en Firebase");
    } catch (logError) {
      console.error("❌ Error loggeando a Firebase:", logError);
    }
  };

  useEffect(() => {
    const loadLocations = () => {
      setIsLoadingMesas(true);
      locationServices.listenToLocations((newLocations) => {
        setLocations(newLocations);
        setIsLoadingMesas(false);
      });
    };

    loadLocations();

    return () => {
      locationServices.stopListening();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (currentVisit?.status === "online") {
      const location = locations.find(
        (location) => location.id === currentVisit?.locationId
      );
      setLimitSong(location?.songLimit || 2);
    }
  }, [locations, currentVisit]);

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
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        setIsLoading(true);
        console.log(`🔄 Intento ${attempt}/${maxRetries} de reserva`);

        // Realizar reserva atómica
        const reservationData = {
          userId: user.id,
          userName: `${user.name} ${user.lastName}`,
          location: tableSelected?.name || "",
          locationId: tableSelected?.id || "",
        };

        console.log("🔄 Creando reserva:", reservationData);
        const visitId = await reservationServices.createReservation(
          reservationData
        );
        console.log("✅ Reserva creada exitosamente con ID:", visitId);

        // Actualizar el estado online en el contexto y localStorage
        // await updateOnlineStatus(true);

        console.log(`✅ Reserva completada exitosamente en intento ${attempt}`);
        setTableSelected(undefined);
        return; // Éxito, salir del loop
      } catch (error) {
        lastError = error as Error;
        console.error(`❌ Intento ${attempt} falló:`, error);

        // Loggear error a Firebase (no bloqueante)
        logErrorToFirebase(
          error as Error,
          `Intento ${attempt} de reserva`
        ).catch((logError) => {
          console.error("❌ Error en logging (no crítico):", logError);
        });

        if (attempt < maxRetries) {
          console.log(`⏳ Esperando 1 segundo antes del siguiente intento...`);
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } finally {
        setIsLoading(false);
      }
    }

    // Si llegamos aquí, todos los intentos fallaron
    console.error(`❌ Todos los intentos fallaron. Último error:`, lastError);
    alert("Tenemos inconvenientes con la conexión, inténtelo nuevamente.");
  };

  const handleReservedOperations = () => {
    locationReservedOperations();
  };

  // Funciones para la pantalla de karaoke
  const handleOnStart = () => {
    setShowSearchSongsModal(true);
  };

  // const handleCallWaiter = () => {
  //   setShowCallWaiterModal(true);
  // };

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
    try {
      // Usar transacción atómica para salir de la mesa
      // La búsqueda por nombre se hace dentro de la transacción si no hay locationId
      await reservationServices.hostExitTable({
        visitId: currentVisit!.id!,
        locationId: currentVisit?.locationId,
        locationName: currentVisit?.location,
        userIds: currentVisit?.usersIds || [],
      });

      console.log("✅ Host salió de mesa correctamente");
    } catch (error) {
      console.error("❌ Error al salir de la mesa:", error);
      await logErrorToFirebase(
        error as Error,
        "handleHostExitTable - Error en transacción"
      );
      throw error;
    }
  };

  const handleGuestExitTable = async () => {
    console.log("🚪 Invitado saliendo de mesa...");

    try {
      // Usar transacción atómica para salir de la mesa
      await reservationServices.guestExitTable({
        visitId: currentVisit!.id!,
        userId: user.id,
      });

      console.log("✅ Invitado salió de mesa correctamente");
    } catch (error) {
      console.error("❌ Error al salir de la mesa:", error);
      await logErrorToFirebase(
        error as Error,
        "handleGuestExitTable - Error en transacción"
      );
      throw error;
    }
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
      if (currentRoundSongs.length >= limitSong) {
        // Verificamos si todas están completadas
        const allCompleted = currentRoundSongs.every(
          (s) => s.status === "completed"
        );

        console.log(allCompleted);

        if (!allCompleted) {
          // Si alguna no está completada, se impide agregar otra
          setShowLimitModal(true);
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
        className="min-h-screen pt-2.5 px-9"
        style={{
          backgroundColor: KaraokeColors.base.darkPrimary,
          paddingTop: "env(safe-area-inset-top, 0px)",
        }}
      >
        <Header title="Excelente," showBackIcon={true} />
        <VisitPendingState />
      </div>
    );
  }

  // Si hay una visita activa (online), mostrar pantalla de karaoke
  if (currentVisit?.status === "online") {
    return (
      <div>
        <VisitOnline
          currentVisit={currentVisit}
          pendingGuestUsers={pendingGuestUsers}
          showExitModal={showExitModal}
          showCallWaiterModal={showCallWaiterModal}
          showSearchSongsModal={showSearchSongsModal}
          handleOnStart={handleOnStart}
          handleExitTable={handleExitTable}
          handleConfirmExitTable={handleConfirmExitTable}
          handleCancelExitTable={handleCancelExitTable}
          handleConfirmCallWaiter={handleConfirmCallWaiter}
          handleCancelCallWaiter={handleCancelCallWaiter}
          handleOnConfirmGuestUser={handleOnConfirmGuestUser}
          handleOnCloseGuestUser={handleOnCloseGuestUser}
          handleOnSelectSong={handleOnSelectSong}
          handleOnDelete={handleOnDelete}
          handleOnSendGreeting={handleOnSendGreeting}
          setShowSearchSongsModal={setShowSearchSongsModal}
          limitSong={limitSong}
        />
        <StatusModal
          visible={showLimitModal}
          status="warning"
          description={`¡Entendemos que quieres cantar más! Ya tienes ${limitSong} ${
            limitSong === 1 ? "canción" : "canciones"
          } en tu ronda. Espera un momento a que se canten para agregar más.`}
          onClose={() => setShowLimitModal(false)}
          onConfirm={() => setShowLimitModal(false)}
        />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pb-20"
      style={{
        backgroundColor: KaraokeColors.base.extraDark,
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}
    >
      {/* Header */}
      <div className="pt-2.5 px-9">
        <Header
          title="Mis Mesas"
          description="Es hora de seleccionar tu mesa y vivir la experiencia."
          showBackIcon={true}
          redirectTo={KARAOKE_ROUTES.HOME}
        />
        <Typography
          variant="body-md-semi"
          color={KaraokeColors.base.white}
          className="my-5"
        >
          Locaciones
        </Typography>
      </div>
      {/* Body */}
      <div className="flex-1 px-6">
        {/* Grid de Mesas */}
        <div className="mt-2.5">
          {isLoadingMesas ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Spinner size={30} color={KaraokeColors.base.white} />
              <Typography
                variant="body-sm-semi"
                className="mt-3 text-center"
                color={KaraokeColors.gray.gray300}
              >
                Cargando mesas...
              </Typography>
            </div>
          ) : (
            <>
              {tableRows.map((row, rowIndex) => (
                <div key={rowIndex} className="flex justify-between gap-2 mb-2">
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
            </>
          )}
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
    </div>
  );
};
