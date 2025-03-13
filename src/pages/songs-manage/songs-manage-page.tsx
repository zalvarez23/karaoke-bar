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
  const [selectedSong, setSelectedSong] = useState<
    (TSongsRequested & { index: number }) | undefined
  >();
  const [currentVisitId, setCurrentVisitId] = useState<string | null>(null);
  const [showBreak, setShowBreak] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [playingBreak, setPlayingBreak] = useState(false);

  const songsServices = new SongsServices();
  const visitsServices = new VisitsServices();

  useEffect(() => {
    const unsubscribe = songsServices.getAllSongsOnSnapshot((data) => {
      setSongs(data);
    });
    return () => unsubscribe();
  }, []);

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
    // Verificamos que la canción seleccionada siga en la lista.
    const exists = songs.songs.find(
      (song) =>
        song.id === selectedSong.id &&
        song.numberSong === selectedSong.numberSong
    );
    if (!exists) {
      const nextSong = songs.songs[0];
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

  const updateSongStatus = async (status: TSongStatus) => {
    if (!selectedSong) return;
    await visitsServices.updateSongStatus(
      selectedSong.visitId,
      selectedSong.id,
      selectedSong.numberSong,
      status
    );
  };

  const handleOnPlay = () => {
    if (!showBreak && selectedSong) {
      setPlaying(true);
    }
  };

  const handleOnPause = () => {
    setPlaying(false);
  };

  const handleOnSongStart = () => {
    if (!selectedSong) return;
    console.log(selectedSong)
    if (selectedSong.status !== "pending") return;
    updateSongStatus("singing");
  };

  const handleOnEnded = () => {
    if (!selectedSong || !songs?.songs) return;
    updateSongStatus("completed");

      // Siempre tomamos la primera canción de la lista, que ya viene ordenada.
      const nextSong = songs.songs[0];
      if (nextSong) {
        // Si la siguiente canción pertenece a la misma mesa, continuamos reproduciéndola.
        if (nextSong.visitId === currentVisitId) {
          setSelectedSong({ ...nextSong, index: 0 });
          setPlaying(true);
        } else {
          // Si la primera canción es de otra mesa, activamos el break.
          setSelectedSong(undefined);
          setShowBreak(true);
          setPlaying(false);
          setPlayingBreak(true);
        }
      } else {
        // No hay canciones disponibles, activamos el break.
        setSelectedSong(undefined);
        setShowBreak(true);
        setPlaying(false);
        setPlayingBreak(true);
      }
  };

  const handleBreakEnded = () => {
    if (songs?.songs && songs.songs.length > 0) {
      // Siempre tomamos la primera canción de la lista para continuar.
      const nextSong = songs.songs[0];
      if (nextSong) {
        setSelectedSong({ ...nextSong, index: 0 });
        setCurrentVisitId(nextSong.visitId);
        setShowBreak(false);
        setPlaying(true);
        setPlayingBreak(false);
      }
    }
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
      </div>
      <div className="flex justify-center">
        <ReactPlayer
          url={
            showBreak
              ? "https://www.youtube.com/watch?v=yDw2ZTZTA8I"
              : selectedSong?.id
          }
          playing={showBreak ? playingBreak : playing}
          controls
          width="100%"
          loop={showBreak && songs?.songs?.length === 0}
          onStart={handleOnSongStart}
          onEnded={showBreak ? handleBreakEnded : handleOnEnded}
        />
      </div>
    </div>
  );
};
