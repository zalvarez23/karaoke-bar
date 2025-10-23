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
import { googleTtsService } from "./services/google-tts-service";
import {
  TTS_CONFIG,
  getRandomVoice,
  improveTextForTTS,
} from "../layout/config/tts-config";
import ReactPlayer from "react-player";
import { Button } from "@/shared/components/ui/button";
import { VisitsServices } from "../visits-manage/services/visits-services";
import { Play, Pause } from "lucide-react";

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
  const [showYouTube] = useState(true); // Mostrar reproductor siempre
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(false); // Control de reproducción automática
  const [currentRound, setCurrentRound] = useState(1);
  const [songsInCurrentRound, setSongsInCurrentRound] = useState(0);
  const [limitSong] = useState(2); // Límite de canciones por ronda

  // URL del video de intermedio
  const INTERMISSION_VIDEO_URL = "https://www.youtube.com/watch?v=W6Kq20xYRk0";

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

  // Actualizar información de la ronda actual
  useEffect(() => {
    if (selectedSong && songs?.songs) {
      setCurrentRound(selectedSong.round);

      // Contar canciones en la misma ronda (solo para display)
      const songsInRound = songs.songs.filter(
        (song) => song.round === selectedSong.round
      ).length;
      setSongsInCurrentRound(songsInRound);
    }
  }, [selectedSong, songs?.songs]);

  useEffect(() => {
    if (!autoPlayEnabled) return;

    console.log("🔄 useEffect ejecutándose - showBreak:", showBreak);

    // Si estamos en break y hay canciones, salir del break
    if (showBreak && songs?.songs && songs.songs.length > 0) {
      console.log("🎵 Hay canciones disponibles, saliendo del break");
      setShowBreak(false);
      setPlayingBreak(false);
      // Continuar con la lógica normal de selección de canciones
    }

    // NO hacer nada si estamos en break y no hay canciones (mantener bucle)
    if (showBreak && (!songs?.songs || songs.songs.length === 0)) {
      console.log("⏸️ En break sin canciones, manteniendo bucle");
      return;
    }

    if (!songs?.songs || songs.songs.length === 0) {
      console.log("📭 No hay canciones, activando break en bucle");
      setSelectedSong(undefined);
      setPlaying(false);
      setShowBreak(true);
      setPlayingBreak(true);
      return;
    }

    // Si ya hay una canción seleccionada, verificar si todavía existe en la lista
    if (selectedSong) {
      const stillExists = songs.songs.find(
        (song) =>
          song.id === selectedSong.id &&
          song.numberSong === selectedSong.numberSong
      );

      // Si la canción todavía existe, NO hacer nada (continuar reproduciéndola)
      if (stillExists) {
        console.log("✅ Canción actual todavía existe, continuando");
        return;
      }

      // Si la canción fue eliminada, buscar la siguiente
      console.log(
        "🔄 La canción seleccionada fue eliminada, buscando siguiente"
      );
    }

    // Solo seleccionar una nueva canción si NO hay ninguna seleccionada actualmente
    if (!selectedSong) {
      // Buscar la PRIMERA canción pendiente en el orden exacto de la lista
      const nextPendingSong = songs.songs.find(
        (song) => song.status === "pending"
      );

      if (nextPendingSong) {
        console.log("🎵 Seleccionando nueva canción:", nextPendingSong.title);
        setSelectedSong({ ...nextPendingSong, index: 0 });
        setCurrentVisitId(nextPendingSong.visitId);
        setShowBreak(false);
        setPlayingBreak(false);
        if (autoPlayEnabled) {
          setPlaying(true);
        }
      } else {
        // No hay canciones pendientes, mostrar intermedio
        console.log("🎬 No hay canciones pendientes, mostrando intermedio");
        setShowBreak(true);
        setPlayingBreak(true);
      }
    }
  }, [songs?.songs, autoPlayEnabled, selectedSong, showBreak]);

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

  // Función para iniciar reproducción automática
  const handleStartAutoPlay = () => {
    setAutoPlayEnabled(true);
    if (!showBreak && songs?.songs && songs.songs.length > 0) {
      // Buscar la primera canción pendiente en el orden de la lista
      const nextPendingSong = songs.songs.find(
        (song) => song.status === "pending"
      );
      if (nextPendingSong) {
        console.log("▶️ Iniciando Auto Play con:", nextPendingSong.title);
        setSelectedSong({ ...nextPendingSong, index: 0 });
        setCurrentVisitId(nextPendingSong.visitId);
        setShowBreak(false);
        setPlayingBreak(false);
        setPlaying(true);
      }
    }
  };

  // Función para detener reproducción automática
  const handleStopAutoPlay = () => {
    setAutoPlayEnabled(false);
    setPlaying(false);
    setPlayingBreak(false);
  };

  const handleOnSongStart = () => {
    if (!selectedSong) return;
    console.log("🎵 Iniciando canción:", selectedSong.title);
    if (selectedSong.status !== "pending") return;
    updateSongStatus("singing");
  };

  const handleOnEnded = async () => {
    if (!selectedSong || !songs?.songs) return;
    console.log("✅ Terminando canción:", selectedSong.title);

    if (!autoPlayEnabled) return;

    // Guardar el visitId actual ANTES de cambiar el estado
    const currentVisitId = selectedSong.visitId;

    // Buscar la siguiente canción pendiente ANTES de marcar esta como completada
    const nextPendingSong = songs.songs.find(
      (song) => song.status === "pending"
    );

    // Ahora sí marcar como completada
    await updateSongStatus("completed");

    if (nextPendingSong) {
      // Verificar si la siguiente canción es de una mesa diferente
      const isDifferentTable = nextPendingSong.visitId !== currentVisitId;

      if (isDifferentTable) {
        console.log("🎬 Mostrando intermedio - Cambio de mesa");
        console.log(
          `   Mesa actual: ${selectedSong.location} (${currentVisitId})`
        );
        console.log(
          `   Próxima mesa: ${nextPendingSong.location} (${nextPendingSong.visitId})`
        );

        // Limpiar canción actual y mostrar intermedio
        console.log("🔄 Estados antes del break:");
        console.log("  - showBreak:", showBreak);
        console.log("  - playingBreak:", playingBreak);
        console.log("  - selectedSong:", selectedSong?.title);

        setSelectedSong(undefined);
        setPlaying(false);
        setShowBreak(true);
        setPlayingBreak(true);

        console.log("▶️ Estados después del break:");
        console.log("  - showBreak: true");
        console.log("  - playingBreak: true");
        console.log("  - selectedSong: undefined");
        console.log(
          "🎬 Iniciando reproducción del video de intermedio:",
          INTERMISSION_VIDEO_URL
        );

        return;
      }

      // Misma mesa, continuar sin intermedio
      console.log("🎵 Siguiente canción (misma mesa):", nextPendingSong.title);
      setSelectedSong({ ...nextPendingSong, index: 0 });
      setCurrentVisitId(nextPendingSong.visitId);
      setShowBreak(false);
      setPlayingBreak(false);
      setPlaying(true);
    } else {
      // No hay más canciones pendientes, mostrar intermedio
      console.log("🎬 No hay más canciones pendientes");
      setSelectedSong(undefined);
      setPlaying(false);
      setShowBreak(true);
      setPlayingBreak(true);
      console.log("▶️ Iniciando reproducción del video de intermedio");
    }
  };

  const handleBreakEnded = () => {
    if (!autoPlayEnabled) {
      console.log("⏸️ Auto play desactivado, no continuar");
      return;
    }

    console.log("🎬 Intermedio terminado, buscando siguiente canción");

    // Buscar la siguiente canción pendiente en el orden de la lista
    const nextPendingSong = songs?.songs?.find(
      (song) => song.status === "pending"
    );

    if (nextPendingSong) {
      console.log("🎵 Continuando con:", nextPendingSong.title);
      setSelectedSong({ ...nextPendingSong, index: 0 });
      setCurrentVisitId(nextPendingSong.visitId);
      setShowBreak(false);
      setPlayingBreak(false);
      setPlaying(true);
    } else {
      // No hay más canciones, mantener en estado de espera
      console.log("⏸️ No hay más canciones pendientes, manteniendo break");
      setPlayingBreak(false);
      // NO cambiar showBreak para mantener el break visible
    }
  };

  // Debug log para ver el estado actual
  console.log("🔍 Estado actual del reproductor:");
  console.log("  - showBreak:", showBreak);
  console.log("  - playingBreak:", playingBreak);
  console.log("  - playing:", playing);
  console.log("  - selectedSong:", selectedSong?.title || "undefined");
  console.log("  - autoPlayEnabled:", autoPlayEnabled);

  // Log específico para debug del break
  if (showBreak) {
    console.log("🎬 BREAK ACTIVO - URL:", INTERMISSION_VIDEO_URL);
    console.log("🎬 BREAK ACTIVO - playingBreak:", playingBreak);
  }

  return (
    <div className="container mx-auto">
      <DataTable<TSongsRequested, unknown>
        columns={columns({
          onOpenYouTube: (song: TSongsRequested) => {
            // Verificar si el ID es un link de YouTube válido
            const isYouTubeLink =
              song.id.startsWith("http") && song.id.includes("youtube.com");

            if (isYouTubeLink) {
              // Si es un link válido, abrirlo directamente
              window.open(song.id, "_blank");
            } else {
              // Si no es un link válido, buscar en YouTube con el título de la canción
              const searchQuery = encodeURIComponent(song.title);
              const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;
              window.open(youtubeSearchUrl, "_blank");
            }
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
              // 🎤 1. Intentar ElevenLabs primero (mejor calidad)
              console.log("🎤 Intentando ElevenLabs primero para saludo");
              try {
                const audioBlob = await elevenLabsService().textToSpeech(
                  greeting
                );
                elevenLabsService().playAudio(
                  audioBlob,
                  TTS_CONFIG.elevenlabs.rate
                );
                return; // Éxito, salir de la función
              } catch (elevenLabsError) {
                console.log(
                  "❌ ElevenLabs falló para saludo, intentando Google TTS:",
                  elevenLabsError
                );
              }

              // 🎤 2. Fallback a Google Cloud TTS
              console.log(
                "🎤 Usando Google Cloud TTS como fallback para saludo"
              );
              const randomVoice = getRandomVoice();
              console.log("🎲 Voz seleccionada:", randomVoice);

              // Mejorar el texto para mejor pronunciación
              const improvedGreeting = improveTextForTTS(greeting);
              console.log("📝 Texto mejorado:", improvedGreeting);

              await googleTtsService.synthesizeAndPlay(improvedGreeting, {
                ...TTS_CONFIG.google,
                voice: randomVoice,
              });
            } catch (error) {
              console.error("❌ Error reproduciendo saludo:", error);

              // 🔄 Fallback a Web Speech API si el servicio principal falla
              if ("speechSynthesis" in window) {
                console.log("🔄 Usando fallback: Web Speech API");
                const utterance = new SpeechSynthesisUtterance(greeting);
                utterance.lang = TTS_CONFIG.webSpeech.language;
                utterance.rate = TTS_CONFIG.webSpeech.rate;
                utterance.pitch = TTS_CONFIG.webSpeech.pitch;
                utterance.volume = TTS_CONFIG.webSpeech.volume;

                // Obtener voz femenina si está disponible
                const getVoicesWithDelay = () => {
                  return new Promise<SpeechSynthesisVoice[]>((resolve) => {
                    let voices = speechSynthesis.getVoices();
                    if (voices.length > 0) {
                      resolve(voices);
                    } else {
                      setTimeout(() => {
                        voices = speechSynthesis.getVoices();
                        resolve(voices);
                      }, 100);
                    }
                  });
                };

                getVoicesWithDelay().then((voices) => {
                  const femaleVoice = voices.find(
                    (voice) =>
                      voice.lang.includes("es") &&
                      voice.name.toLowerCase().includes("female")
                  );

                  if (femaleVoice) {
                    utterance.voice = femaleVoice;
                  } else {
                    console.log(
                      "No se encontró voz femenina, usando voz por defecto"
                    );
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
      {/* Controles de reproducción */}
      <div className="flex justify-center gap-4 py-4 bg-gray-50 rounded-lg mb-4">
        <Button
          variant={autoPlayEnabled ? "primary" : "outline"}
          size="sm"
          onClick={autoPlayEnabled ? handleStopAutoPlay : handleStartAutoPlay}
          className="flex items-center gap-2"
        >
          {autoPlayEnabled ? (
            <>
              <Pause className="h-4 w-4" />
              Detener Auto
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Iniciar Auto
            </>
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleOnPlay}
          disabled={!selectedSong}
        >
          <Play className="h-4 w-4 mr-1" />
          Play
        </Button>

        <Button variant="outline" size="sm" onClick={handleOnPause}>
          <Pause className="h-4 w-4 mr-1" />
          Pause
        </Button>

        {/* Información de estado */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          {autoPlayEnabled && (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
              🎵 Auto Play: ON
            </span>
          )}
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            Ronda: {currentRound}
          </span>
          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
            Canciones: {songsInCurrentRound}/{limitSong}
          </span>
          {currentVisitId && (
            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
              Mesa: {currentVisitId}
            </span>
          )}
        </div>
      </div>

      {/* Reproductor YouTube */}
      {showYouTube && (
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-gray-800">
              {showBreak ? (
                <span className="flex items-center gap-2">
                  🎬 Video de Intermedio
                </span>
              ) : selectedSong ? (
                <span className="flex items-center gap-2">
                  🎵 {selectedSong.title}
                  <span className="text-sm text-gray-500">
                    - {selectedSong.userName} ({selectedSong.location})
                  </span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  ⏸️ Esperando canciones...
                </span>
              )}
            </h3>
          </div>

          <div className="aspect-video w-full">
            {showBreak ? (
              <ReactPlayer
                key="break-player"
                url={INTERMISSION_VIDEO_URL}
                playing={playingBreak}
                controls
                width="100%"
                height="100%"
                loop={!songs?.songs || songs.songs.length === 0} // Loop si no hay canciones
                onStart={() => {
                  console.log("🎬 Video de intermedio iniciado");
                }}
                onEnded={() => {
                  console.log("🎬 Video de intermedio terminado");
                  // Solo llamar handleBreakEnded si hay canciones disponibles
                  if (songs?.songs && songs.songs.length > 0) {
                    handleBreakEnded();
                  } else {
                    console.log(
                      "🔄 No hay canciones, manteniendo bucle del video"
                    );
                  }
                }}
                onReady={() => {
                  console.log("🎬 Video de intermedio listo");
                }}
                onPlay={() => {
                  console.log("▶️ Video de intermedio reproduciendo");
                }}
                config={{
                  youtube: {
                    playerVars: {
                      autoplay: 1,
                      controls: 1,
                      rel: 0,
                      modestbranding: 1,
                      loop: !songs?.songs || songs.songs.length === 0 ? 1 : 0, // Loop en YouTube si no hay canciones
                    },
                  },
                }}
              />
            ) : (
              <ReactPlayer
                key="song-player"
                url={selectedSong?.id}
                playing={playing}
                controls
                width="100%"
                height="100%"
                onStart={handleOnSongStart}
                onEnded={handleOnEnded}
                onReady={() => {
                  console.log("🎵 Canción lista");
                }}
                onPlay={() => {
                  console.log("▶️ Canción reproduciendo");
                }}
                config={{
                  youtube: {
                    playerVars: {
                      autoplay: 0,
                      controls: 1,
                      rel: 0,
                      modestbranding: 1,
                    },
                  },
                }}
              />
            )}
          </div>

          {/* Información adicional */}
          <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded">
            {showBreak ? (
              <div className="space-y-2">
                <p className="font-semibold text-blue-600">
                  🎬 Video de Intermedio
                </p>
                <p>Reproduciendo música de transición entre mesas</p>
                <p>
                  <strong>Estado:</strong>{" "}
                  <span className="text-blue-600">En reproducción</span>
                </p>
                <p>
                  <strong>URL:</strong> {INTERMISSION_VIDEO_URL}
                </p>
                <p>
                  <strong>Auto Play:</strong>{" "}
                  {autoPlayEnabled ? "✅ Activado" : "❌ Desactivado"}
                </p>
              </div>
            ) : selectedSong ? (
              <div className="space-y-1">
                <p className="font-semibold text-green-600">
                  🎵 Canción Actual
                </p>
                <p>
                  <strong>Estado:</strong>{" "}
                  <span
                    className={
                      selectedSong.status === "pending"
                        ? "text-yellow-600"
                        : selectedSong.status === "completed"
                        ? "text-gray-600"
                        : "text-green-600"
                    }
                  >
                    {selectedSong.status === "pending"
                      ? "Pendiente"
                      : selectedSong.status === "completed"
                      ? "Completada"
                      : "Cantando"}
                  </span>
                </p>
                <p>
                  <strong>Ronda:</strong> {selectedSong.round}
                </p>
                <p>
                  <strong>Número:</strong> {selectedSong.numberSong}
                </p>
                <p>
                  <strong>Mesa:</strong> {selectedSong.location} (
                  {selectedSong.visitId})
                </p>
                <p>
                  <strong>Auto Play:</strong>{" "}
                  {autoPlayEnabled ? "✅ Activado" : "❌ Desactivado"}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="font-semibold text-gray-600">
                  ⏸️ Estado de Espera
                </p>
                <p>No hay canciones seleccionadas</p>
                <p>
                  <strong>Auto Play:</strong>{" "}
                  {autoPlayEnabled ? "✅ Activado" : "❌ Desactivado"}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
