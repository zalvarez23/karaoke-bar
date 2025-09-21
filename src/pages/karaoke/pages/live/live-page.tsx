import { FC, useEffect, useState, useCallback } from "react";
import { Music } from "lucide-react";
import { Typography, Badge, BottomNavigation } from "../../shared/components";
import { KaraokeColors } from "../../colors";
import { useUsersContext } from "../../shared/context/UsersContext";
import { VisitsServices } from "../../shared/services/visits.services";
import { TVisitResponseDto } from "../../shared/types/visits.types";
import { useNavigate } from "react-router-dom";
import EmptyStateLive from "./components/empty-state-live";
import { ModalPersonsLive } from "./components/modal-persons-live";
import { ItemSong } from "../../shared/components/item-song";

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
      className="min-h-screen bg-[#1e1c24] flex flex-col pb-20"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      {/* Header */}
      <div className="px-9 pt-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Music size={35} color={KaraokeColors.orange.orange400} />
            <div>
              <Typography
                variant="body-md-semi"
                color={KaraokeColors.base.white}
              >
                Mix DJ - KantoBar
              </Typography>
              <Typography
                variant="body-sm-semi"
                color={KaraokeColors.gray.gray500}
              >
                Todas las canciones aqui.
              </Typography>
            </div>
          </div>
          <div />
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

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};
