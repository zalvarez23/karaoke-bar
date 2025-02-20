import React, { useEffect, useState } from "react";
import { DataTable } from "./components/data-table";
import { columns } from "./components/columns";
import {
  TSongsRequested,
  TSongStatus,
  TVisitResponseDto,
} from "@/shared/types/visit-types";
import { SongsServices } from "./services/songs-services";
import ReactPlayer from "react-player";
import { Button } from "@/shared/components/ui/button";
import { VisitsServices } from "../visits-manage/services/visits-services";

export const SongsManagePage: React.FC = () => {
  const [songs, setSongs] = useState<TVisitResponseDto>();
  // selectedSong representa la canción que se está reproduciendo
  const [selectedSong, setSelectedSong] = useState<
    (TSongsRequested & { index: number }) | undefined
  >();
  // currentVisitId almacena el visitId actual para determinar si hay cambio de mesa
  const [currentVisitId, setCurrentVisitId] = useState<string | null>(null);
  const [showBreak, setShowBreak] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [playingBreak, setPlayingBreak] = useState(false);

  const songsServices = new SongsServices();
  const visitsServices = new VisitsServices();

  // Escucha en tiempo real el snapshot de las canciones (pendientes o en singing)
  useEffect(() => {
    const unsubscribe = songsServices.getAllSongsOnSnapshot((data) => {
      setSongs(data);
    });
    return () => unsubscribe();
  }, []);

  // Efecto que administra la selección y transición según el snapshot.
  // Si ya está en break, no se actualiza para no interrumpir la reproducción del break.
  useEffect(() => {
    if (showBreak) return;

    if (!songs?.songs || songs.songs.length === 0) {
      setSelectedSong(undefined);
      setShowBreak(true);
      setPlaying(false);
      setPlayingBreak(true);
      return;
    }
    if (!selectedSong) {
      const firstSong = songs.songs[0];
      setSelectedSong({ ...firstSong, index: 0 });
      setCurrentVisitId(firstSong.visitId);
      setShowBreak(false);
      setPlayingBreak(false);
      setPlaying(true);
      return;
    }
    const exists = songs.songs.find(
      (song) =>
        song.id === selectedSong.id &&
        song.numberSong === selectedSong.numberSong,
    );
    if (!exists) {
      const nextSong = songs.songs[0];
      // Si el visitId cambia, se activa el break
      if (nextSong.visitId !== currentVisitId) {
        setShowBreak(true);
        setPlaying(false);
        setPlayingBreak(true);
      } else {
        setSelectedSong({ ...nextSong, index: 0 });
        setShowBreak(false);
        setPlaying(true);
      }
    }
  }, [songs?.songs, showBreak, selectedSong, currentVisitId]);

  const handleOnPlay = () => {
    // Si hay canción y no está en break, activa la reproducción
    if (!showBreak && selectedSong) {
      setPlaying(true);
    }
  };

  const handleOnPause = () => {
    setPlaying(false);
  };

  // Actualiza el status de la canción en Firestore
  const updateSongStatus = async (status: TSongStatus) => {
    if (!selectedSong) return;
    await visitsServices.updateSongStatus(
      selectedSong.visitId,
      selectedSong.id,
      selectedSong.numberSong,
      status,
    );
  };

  // Cuando inicia la canción, se marca como "singing"
  const handleOnSongStart = () => {
    if (!selectedSong) return;
    updateSongStatus("singing");
  };

  // Cuando termina la canción, se marca como "completed"
  const handleOnEnded = async () => {
    await updateSongStatus("completed");
    setPlaying(false);
  };

  // Al terminar el video de break, se pasa a la siguiente canción
  const handleBreakEnded = () => {
    if (songs?.songs && songs.songs.length > 0) {
      setPlayingBreak(false);
      setShowBreak(false);
      const nextSong = songs.songs[0];
      setSelectedSong({ ...nextSong, index: 0 });
      setCurrentVisitId(nextSong.visitId);
      setPlaying(true);
    }
    // Si no hay canciones, el reproductor de break sigue en loop
  };

  return (
    <div className="container mx-auto">
      <DataTable<TSongsRequested, unknown>
        columns={columns({
          onAcceptClient: (visitId: string) => console.log("visitId", visitId),
          onRejectClient: (visitId: string, userId: string) => {
            console.log("visitId", visitId);
            console.log("userId", userId);
          },
          onCompletedClient: (visitId: string, usersIds: string[]) => {
            console.log("visitId", visitId);
            console.log("usersIds", usersIds);
          },
        })}
        data={songs?.songs || []}
      />
      <div className="flex justify-center gap-5 py-5">
        <Button variant="outline" size="sm" onClick={handleOnPlay}>
          Iniciar
        </Button>
        <Button variant="outline" size="sm" onClick={handleOnPause}>
          Pause
        </Button>
        <Button variant="outline" size="sm" onClick={() => setPlaying(false)}>
          Siguiente
        </Button>
      </div>

      <div className="flex justify-center">
        {/* Reproductor principal: se monta usando key para forzar reinicio al cambiar la canción */}
        {!showBreak && selectedSong && (
          <ReactPlayer
            key={selectedSong.id}
            url={selectedSong.id}
            playing={playing}
            controls
            width="100%"
            onStart={handleOnSongStart}
            onEnded={handleOnEnded}
          />
        )}

        {/* Reproductor de break */}
        {showBreak && (
          <ReactPlayer
            // url="https://www.youtube.com/watch?v=yDw2ZTZTA8I" // URL del video de break
            url="https://www.youtube.com/watch?v=kOMCg_3eMO4"
            playing={playingBreak}
            loop={songs?.songs?.length === 0}
            controls
            width="100%"
            onEnded={handleBreakEnded}
          />
        )}
      </div>
    </div>
  );
};
