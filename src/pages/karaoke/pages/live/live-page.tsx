import { FC, useEffect, useState, useCallback } from "react";
import { ChevronLeftIcon, LayoutDashboard } from "lucide-react";
import { Typography, Badge } from "../../shared/components";
import { KaraokeColors } from "../../colors";
import { useUsersContext } from "../../shared/context/UsersContext";
import { VisitsServices } from "../../shared/services/visits.services";
import { TVisitResponseDto } from "../../shared/types/visits.types";
import { useNavigate } from "react-router-dom";
import EmptyStateLive from "./components/empty-state-live";
import { ModalPersonsLive } from "./components/modal-persons-live";
import { ItemSong } from "../../shared/components/item-song";
import { KARAOKE_ROUTES } from "../../shared/types";

export const KaraokeLivePage: FC = () => {
  const [visitsDto, setVisitsDto] = useState<TVisitResponseDto | null>(null);
  const [isModalPersonsVisible, setIsModalPersonsVisible] = useState(false);
  const navigate = useNavigate();

  const {
    state: { user },
  } = useUsersContext();

  const visitServices = useCallback(() => new VisitsServices(), []);

  useEffect(() => {
    const services = visitServices();
    services.getAllVisits(setVisitsDto);

    return () => {
      services.stopListening();
    };
  }, [visitServices]);

  const handleOnStart = () => {
    navigate("/karaoke/mesas");
  };

  const handleOnViewTables = () => {
    setIsModalPersonsVisible(true);
  };

  const handleOnSelectLocation = (visitId: string) => {
    const services = visitServices();
    services.addUserToVisit(visitId, user.id, `${user.name} ${user.lastName}`);
  };

  const handleOnLikeSong = async (songId: string) => {
    try {
      const song = visitsDto?.songs.find((s) => s.id === songId);
      if (song?.visitId) {
        const services = visitServices();
        await services.updateSongLikes(song.visitId, songId);
        return true;
      } else {
        return false;
      }
    } catch {
      return false;
    }
  };

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
            <button
              onClick={() => navigate(-1)}
              className="hover:opacity-80 transition-opacity"
            >
              <ChevronLeftIcon size={30} color={KaraokeColors.base.white} />
            </button>
            <div>
              <Typography
                variant="label-lg-semi"
                color={KaraokeColors.base.white}
              >
                KantoBar Live
              </Typography>
              <Typography
                variant="label-xs"
                color={KaraokeColors.base.secondaryLight}
              >
                Todas las canciones aqui.
              </Typography>
            </div>
          </div>
          <LayoutDashboard
            size={20}
            color={KaraokeColors.base.white}
            onClick={() => navigate(KARAOKE_ROUTES.HOME)}
          />
        </div>
      </div>
      {/* Body */}
      <div className="flex-1 px-10">
        {(visitsDto?.songs.length === 0 || !visitsDto) && (
          <EmptyStateLive
            onStart={handleOnStart}
            onViewTables={handleOnViewTables}
          />
        )}

        {visitsDto && visitsDto?.songs?.length > 0 && (
          <>
            <div className="flex justify-between items-center mt-8 mb-5">
              <Typography
                variant="body-lg-semi"
                color={KaraokeColors.base.white}
              >
                Canciones ({visitsDto?.songs.length})
              </Typography>

              <button
                onClick={() => setIsModalPersonsVisible(true)}
                className="flex items-center gap-2"
              >
                <Badge text="+ Mesas en línea" variant="info" size="medium" />
              </button>
            </div>

            <div className="space-y-3">
              {visitsDto.songs.map((song) => (
                <ItemSong
                  key={`song-${song.id}`}
                  {...song}
                  onLikeSong={handleOnLikeSong}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <ModalPersonsLive
        visible={isModalPersonsVisible}
        onClose={() => setIsModalPersonsVisible(false)}
        visitDto={visitsDto}
        onSelectedLocation={handleOnSelectLocation}
      />
    </div>
  );
};
