import React, { useEffect, useState, useCallback } from "react";
import { DataTable } from "./components/data-table";
import { columns } from "./components/columns";
import {
  TSongsRequested,
  TSongStatus,
  TVisitResponseDto,
} from "@/shared/types/visit-types";
import { SongsServices } from "./services/songs-services";
import { ElevenLabsService } from "./services/elevenlabs-service";
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
  const [loading, setLoading] = useState(true);
  const [showYouTube] = useState(false); // Control para mostrar/ocultar YouTube - actualmente oculto

  const songsServices = useCallback(() => new SongsServices(), []);
  const visitsServices = useCallback(() => new VisitsServices(), []);
  const elevenLabsService = useCallback(() => new ElevenLabsService(), []);

  useEffect(() => {
    const unsubscribe = songsServices().getAllSongsOnSnapshot((data) => {
      setSongs(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [songsServices]);

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
    await visitsServices().updateSongStatus(
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
    console.log(selectedSong);
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
          onOpenYouTube: (songId: string) => {
            // Abrir el video de YouTube en una nueva pestaña
            window.open(songId, "_blank");
          },
          onPlaySong: async (
            songId: string,
            visitId: string,
            numberSong: number
          ) => {
            // Si la canción está en "pending", la cambiamos a "singing"
            // Si la canción está en "singing", la cambiamos a "completed"
            const currentSong = songs?.songs?.find(
              (song) => song.id === songId && song.numberSong === numberSong
            );

            if (currentSong) {
              const songStatus = currentSong.status as TSongStatus;

              if (songStatus === "pending") {
                // Primero, completar cualquier canción que esté cantando actualmente
                const currentlySinging = songs?.songs?.find(
                  (song) => (song.status as TSongStatus) === "singing"
                );

                if (currentlySinging) {
                  await visitsServices().updateSongStatus(
                    currentlySinging.visitId,
                    currentlySinging.id,
                    currentlySinging.numberSong,
                    "completed"
                  );
                }

                // Luego, cambiar la nueva canción a "singing"
                await visitsServices().updateSongStatus(
                  visitId,
                  songId,
                  numberSong,
                  "singing"
                );
              } else if (songStatus === "singing") {
                // Cambiar a "completed"
                await visitsServices().updateSongStatus(
                  visitId,
                  songId,
                  numberSong,
                  "completed"
                );
              }
            }
          },
          onCancelSong: async (
            songId: string,
            visitId: string,
            numberSong: number
          ) => {
            // Solo permitir eliminar canciones que estén en estado "pending"
            const currentSong = songs?.songs?.find(
              (song) => song.id === songId && song.numberSong === numberSong
            );

            if (
              currentSong &&
              (currentSong.status as TSongStatus) === "pending"
            ) {
              // Eliminar la canción del array de la visita
              await visitsServices().removeSongFromVisit(
                visitId,
                songId,
                numberSong
              );
            }
          },
          onPlayGreeting: async (greeting: string) => {
            try {
              console.log("🎤 Generando audio con ElevenLabs para:", greeting);

              // Generar audio con ElevenLabs (voz aleatoria)
              const audioBlob = await elevenLabsService().textToSpeech(
                greeting
              );

              // Reproducir el audio
              elevenLabsService().playAudio(audioBlob, 0.9);

              console.log("✅ Audio reproducido exitosamente");
            } catch (error) {
              console.error("❌ Error reproduciendo saludo:", error);

              // Fallback a Web Speech API si ElevenLabs falla
              if ("speechSynthesis" in window) {
                console.log("🔄 Usando fallback: Web Speech API");
                const utterance = new SpeechSynthesisUtterance(greeting);
                utterance.lang = "es-ES";
                utterance.rate = 0.85;
                utterance.pitch = 1.1;
                utterance.volume = 1;

                // Función para obtener voces con retraso para asegurar que estén cargadas
                const getVoicesWithDelay = () => {
                  return new Promise<SpeechSynthesisVoice[]>((resolve) => {
                    let voices = speechSynthesis.getVoices();

                    if (voices.length > 0) {
                      resolve(voices);
                    } else {
                      // Si no hay voces, esperar un poco y reintentar
                      setTimeout(() => {
                        voices = speechSynthesis.getVoices();
                        resolve(voices);
                      }, 100);
                    }
                  });
                };

                // Usar la función asíncrona para obtener voces
                getVoicesWithDelay().then((voices) => {
                  // Priorizar voces femeninas que suenen como las de navegación en español
                  const femaleNavigationVoice = voices.find(
                    (voice) =>
                      voice.lang.includes("es") &&
                      (voice.name.toLowerCase().includes("female") ||
                        voice.name.toLowerCase().includes("mujer") ||
                        voice.name.toLowerCase().includes("maria") ||
                        voice.name.toLowerCase().includes("ana") ||
                        voice.name.toLowerCase().includes("carmen") ||
                        voice.name.toLowerCase().includes("sofia") ||
                        voice.name.toLowerCase().includes("lucia") ||
                        voice.name.toLowerCase().includes("isabella") ||
                        voice.name.toLowerCase().includes("elena") ||
                        voice.name.toLowerCase().includes("patricia") ||
                        voice.name.toLowerCase().includes("paulina"))
                  );

                  // Si no encuentra voz femenina específica, buscar cualquier voz en español
                  const spanishVoice = !femaleNavigationVoice
                    ? voices.find((voice) => voice.lang.includes("es"))
                    : null;

                  const selectedVoice = femaleNavigationVoice || spanishVoice;

                  if (selectedVoice) {
                    utterance.voice = selectedVoice;
                    console.log(
                      "🎤 Fallback usando voz femenina:",
                      selectedVoice.name
                    );
                  } else {
                    console.log("🎤 Fallback usando voz por defecto");
                  }

                  speechSynthesis.speak(utterance);
                });
              }
            }
          },
        })}
        data={songs?.songs || []}
        loading={loading}
      />
      <div className="flex justify-center gap-5 py-5">
        <Button variant="outline" size="sm" onClick={handleOnPlay}>
          Iniciar
        </Button>
        <Button variant="outline" size="sm" onClick={handleOnPause}>
          Pause
        </Button>
      </div>
      {showYouTube && (
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
      )}
    </div>
  );
};
