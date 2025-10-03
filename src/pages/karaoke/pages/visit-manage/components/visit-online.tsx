import { FC, useState } from "react";
import { KaraokeColors } from "../../../colors";
import {
  Typography,
  ConfirmModal,
  UserItemSong,
} from "../../../shared/components";
import { Switch } from "../../../../../shared/components/ui/switch";
import { useUsersContext } from "../../../shared/context";
import {
  IVisits,
  TSongsRequested,
  TGuestUsers,
} from "../../../shared/types/visits.types";
import { TableRequestCard } from "./table-request-card";
import { ModalSearchSongs } from "./modal-search-songs";
import { LayoutDashboard, MicVocal, Radio, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SectionCardHome } from "../../home/components";
import { KARAOKE_ROUTES } from "@/pages/karaoke/shared";

type TVisitOnlineProps = {
  currentVisit: IVisits;
  pendingGuestUsers: TGuestUsers[];
  showExitModal: boolean;
  showCallWaiterModal: boolean;
  showSearchSongsModal: boolean;
  handleOnStart: () => void;
  handleExitTable: () => void;
  handleConfirmExitTable: () => void;
  handleCancelExitTable: () => void;
  handleConfirmCallWaiter: () => void;
  handleCancelCallWaiter: () => void;
  handleOnConfirmGuestUser: (userId: string) => void;
  handleOnCloseGuestUser: (userId: string) => void;
  handleOnSelectSong: (song: TSongsRequested) => void;
  handleOnDelete: (songId: string, numberSong: number) => void;
  handleOnSendGreeting: (greeting: string, songId: string) => Promise<boolean>;
  setShowSearchSongsModal: (show: boolean) => void;
  limitSong: number;
};

export const VisitOnline: FC<TVisitOnlineProps> = ({
  currentVisit,
  pendingGuestUsers,
  showExitModal,
  showCallWaiterModal,
  showSearchSongsModal,
  handleOnStart,
  handleExitTable,
  handleConfirmExitTable,
  handleCancelExitTable,
  handleConfirmCallWaiter,
  handleCancelCallWaiter,
  handleOnConfirmGuestUser,
  handleOnCloseGuestUser,
  handleOnSelectSong,
  handleOnDelete,
  handleOnSendGreeting,
  setShowSearchSongsModal,
  limitSong,
}) => {
  const {
    state: { user },
  } = useUsersContext();

  const isHost = currentVisit?.userId === user.id;
  const isGuest = currentVisit?.userId !== user.id;

  const navigate = useNavigate();

  // Estado para controlar el filtro de canciones
  const [showOnlyActive, setShowOnlyActive] = useState(true);

  // Obtener la ronda más alta (última ronda)
  const maxRound = Math.max(
    ...(currentVisit?.songs?.map((song) => song.round) || [0])
  );

  // Filtrar canciones según el estado del switch
  const filteredSongs =
    currentVisit?.songs?.filter((song) => {
      if (showOnlyActive) {
        // Mostrar solo canciones de la última ronda
        return song.round === maxRound;
      }
      // Mostrar todas las canciones
      return true;
    }) || [];

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: KaraokeColors.base.darkPrimary,
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}
    >
      {/* Header con avatar y rol */}
      <div className="pt-4 px-7">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <LayoutDashboard
              size={23}
              color={KaraokeColors.base.white}
              onClick={() => navigate(KARAOKE_ROUTES.HOME)}
            />
            <div>
              <Typography
                variant="body-lg-semi"
                color={KaraokeColors.base.white}
              >
                Mi Mesa {currentVisit.location}
              </Typography>
              <div className="flex items-center gap-2">
                {isHost && (
                  <Typography
                    variant="label-sm"
                    color={KaraokeColors.base.secondaryLight}
                  >
                    Host
                  </Typography>
                )}
                {isGuest && (
                  <Typography
                    variant="label-sm"
                    color={KaraokeColors.base.secondaryLight}
                  >
                    Invitado
                  </Typography>
                )}
                {limitSong && (
                  <Typography
                    variant="label-sm"
                    color={KaraokeColors.base.secondaryLight}
                  >
                    - Límite de canciones: {limitSong}
                  </Typography>
                )}
              </div>
            </div>
          </div>
          <button onClick={handleExitTable} className="p-2">
            <X
              size={25}
              color={KaraokeColors.base.secondaryLight}
              className="cursor-pointer hover:opacity-80 transition-opacity "
              onClick={handleExitTable}
            />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 px-6 py-4">
        <SectionCardHome
          className="mt-3 "
          icon={MicVocal}
          description="Selecciona tus canciones favoritas para comenzar"
          title="Pedir canciones"
          highlight={true}
          onClick={handleOnStart}
        />
        <SectionCardHome
          className="mt-3 "
          icon={Radio}
          title="Ver Canciones en curso"
          onClick={() => navigate(KARAOKE_ROUTES.LIVE)}
        />

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
          <div className="mt-3">
            <div className="flex items-center justify-between mb-4">
              <Typography
                variant="body-lg-semi"
                color={KaraokeColors.base.white}
              >
                Mis canciones ({filteredSongs.length})
              </Typography>
              <div className="flex items-center gap-3">
                <Typography variant="label-sm" color={KaraokeColors.base.white}>
                  Ver histórico
                </Typography>
                <Switch
                  checked={!showOnlyActive}
                  onCheckedChange={(checked: boolean) =>
                    setShowOnlyActive(!checked)
                  }
                />
              </div>
            </div>
            <div className="space-y-3">
              {filteredSongs
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
};
