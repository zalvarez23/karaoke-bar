import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  TSongsRequested,
  TSongStatus,
  TVisitResponseDto,
} from "@/shared/types/visit-types";
import { SongsServices } from "./services/songs-services";
import ReactPlayer from "react-player";
import { Button } from "@/shared/components/ui/button";
import { VisitsServices } from "../visits-manage/services/visits-services";
import { Play, Pause, Maximize2, ArrowLeft } from "lucide-react";
import { useFirebaseFlag } from "@/shared/hooks/useFirebaseFlag";

/**
 * Construye la ruta del video de bienvenida local basado en el nombre de la mesa/barra
 * Los videos están en /karaoke-wellcome/ con formato: karaoke-{mesa/barra}{número}.mp4
 */

// Tipos para fullscreen API con soporte de diferentes navegadores
interface FullscreenElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void>;
  mozRequestFullScreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
}

interface FullscreenDocument extends Document {
  webkitExitFullscreen?: () => Promise<void>;
  mozCancelFullScreen?: () => Promise<void>;
  msExitFullscreen?: () => Promise<void>;
}

export const SongsManageAutomaticPage: React.FC = () => {
  const navigate = useNavigate();
  const [songs, setSongs] = useState<TVisitResponseDto>();
  const [selectedSong, setSelectedSong] = useState<
    (TSongsRequested & { index: number }) | undefined
  >();
  const [showBreak, setShowBreak] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [showYouTube] = useState(true); // Mostrar reproductor siempre
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(false); // Control de reproducción automática
  const [isMuted, setIsMuted] = useState(true); // Control de mute para autoplay (política del navegador)
  // Refs para evitar condiciones de carrera
  const lastVisitIdRef = useRef<string | null>(null);
  const welcomePendingRef = useRef<boolean>(false);
  const nextSongAfterWelcomeRef = useRef<TSongsRequested | undefined>(
    undefined
  );
  const welcomeVideoFailedRef = useRef<boolean>(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [playingWelcome, setPlayingWelcome] = useState(false);
  const [welcomeVideoUrl, setWelcomeVideoUrl] = useState<string | null>(null);
  // Persistir Fullscreen aunque cambie la fuente del player
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const wasFullscreenRef = useRef<boolean>(false);
  const controlsRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<ReactPlayer | null>(null);

  // Flags simplificados para la transición
  const forcePlayAfterUrlChangeRef = useRef<boolean>(false);
  const isTransitioningToYouTubeRef = useRef<boolean>(false);
  const preventUseEffectInterferenceRef = useRef<boolean>(false);
  // Guardar el evento de interacción del usuario para poder reproducir con audio
  const userInteractionRef = useRef<boolean>(false);

  // Ruta del video de bienvenida cuando no se encuentra la mesa/barra
  const WELCOME_FALLBACK_URL = "/karaoke-wellcome/no-encontro.mp4";

  // Leer flag de Firebase: disabledSongValidation
  // Si es true, ocultar el botón de reproducción automática
  const DISABLED_SONG_VALIDATION = useFirebaseFlag(
    "disabledSongValidation",
    false
  );

  const songsServices = useCallback(() => new SongsServices(), []);
  const visitsServices = useCallback(() => new VisitsServices(), []);

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const isServerTable = (location?: string) =>
    (location || "").toLowerCase() === "server";

  const getWelcomeVideoUrl = useCallback((location?: string): string => {
    if (!location) {
      console.warn("⚠️ No hay location, usando video de fallback");
      return WELCOME_FALLBACK_URL;
    }

    const normalized = location.toLowerCase().trim().replace(/\s+/g, "");

    const mesaMatch = normalized.match(/^mesa(\d+)$/);
    const barraMatch = normalized.match(/^barra(\d+)$/);

    let videoPath: string | undefined;

    if (mesaMatch) {
      videoPath = `/karaoke-wellcome/karaoke-mesa${mesaMatch[1]}.mp4`;
    } else if (barraMatch) {
      videoPath = `/karaoke-wellcome/karaoke-barra${barraMatch[1]}.mp4`;
    } else {
      const numeroMatch = normalized.match(/(\d+)/);
      if (
        numeroMatch &&
        (normalized.includes("mesa") || normalized.includes("barra"))
      ) {
        const numero = numeroMatch[1];
        const tipo = normalized.includes("barra") ? "barra" : "mesa";
        videoPath = `/karaoke-wellcome/karaoke-${tipo}${numero}.mp4`;
      }
    }

    if (videoPath) {
      return videoPath;
    }

    console.warn(
      `⚠️ No se encontró video de bienvenida para "${location}", usando fallback`
    );
    return WELCOME_FALLBACK_URL;
  }, []);

  // Trackear cambios de fullscreen del navegador
  useEffect(() => {
    const onFsChange = () => {
      const isFs = !!document.fullscreenElement;
      wasFullscreenRef.current = isFs;

      if (controlsRef.current) {
        if (isFs) {
          controlsRef.current.style.display = "none";
        } else {
          controlsRef.current.style.display = "flex";
        }
      }
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  useEffect(() => {
    const unsubscribe = songsServices().getAllSongsOnSnapshot((data) => {
      setSongs(data);
    });
    return () => unsubscribe();
  }, [songsServices]);

  useEffect(() => {
    if (!autoPlayEnabled) return;

    if (
      preventUseEffectInterferenceRef.current ||
      isTransitioningToYouTubeRef.current
    ) {
      console.log("🚫 useEffect bloqueado durante transición");
      return;
    }

    console.log("🔄 useEffect ejecutándose - showBreak:", showBreak);

    if (showWelcome) {
      console.log("🙌 En bienvenida, esperando a que termine");
      return;
    }

    if (!songs?.songs || songs.songs.length === 0) {
      console.log("📭 No hay canciones, esperando...");
      setSelectedSong(undefined);
      setPlaying(false);
      setShowBreak(false);
      return;
    }

    if (selectedSong) {
      const stillExists = songs.songs.find(
        (song) =>
          song.id === selectedSong.id &&
          song.numberSong === selectedSong.numberSong
      );

      if (stillExists) {
        console.log("🎵 Canción actual sigue existiendo, continuando");
        if (forcePlayAfterUrlChangeRef.current) {
          console.log("⏸️ Esperando que YouTube esté listo, no tocar estado");
          return;
        }
        return;
      } else {
        console.log(
          "🔄 Canción actual ya no existe, verificando cambio de mesa antes de seleccionar"
        );

        const nextSong = songs.songs[0];
        if (nextSong && lastVisitIdRef.current !== null) {
          const isNewTable = nextSong.visitId !== lastVisitIdRef.current;
          if (isNewTable) {
            const location = (
              nextSong as TSongsRequested & { location?: string }
            ).location;
            const isServer = isServerTable(location);

            if (!isServer) {
              nextSongAfterWelcomeRef.current = nextSong;
              const videoUrl = getWelcomeVideoUrl(location);
              console.log(
                "🙌 Cambio de mesa detectado, mostrando Bienvenida para:",
                location,
                "→",
                videoUrl
              );
              welcomeVideoFailedRef.current = false;
              setWelcomeVideoUrl(videoUrl);
              setSelectedSong(undefined);
              setPlaying(false);
              setShowBreak(false);
              setShowWelcome(true);
              setPlayingWelcome(true);
              return;
            } else {
              setSelectedSong({ ...nextSong, index: 0 });
              lastVisitIdRef.current = nextSong.visitId;
              setPlaying(true);
              return;
            }
          }
        }
      }
    }

    const firstByOrder = songs.songs[0];

    if (firstByOrder) {
      const isNewTable =
        lastVisitIdRef.current !== null &&
        firstByOrder.visitId !== lastVisitIdRef.current;

      if (lastVisitIdRef.current === null || isNewTable) {
        const location = (
          firstByOrder as TSongsRequested & { location?: string }
        ).location;
        const isServer = isServerTable(location);

        const shouldWelcome =
          (lastVisitIdRef.current === null &&
            welcomePendingRef.current &&
            !isServer) ||
          (isNewTable && !isServer);

        if (shouldWelcome) {
          nextSongAfterWelcomeRef.current = firstByOrder;
          const videoUrl = getWelcomeVideoUrl(location);
          console.log(
            "🙌 Mostrando Bienvenida para:",
            location,
            "→",
            videoUrl,
            "| Canción después del welcome:",
            firstByOrder.title
          );
          welcomeVideoFailedRef.current = false;
          welcomePendingRef.current = false;
          setShowBreak(false);
          setShowWelcome(true);
          setPlayingWelcome(true);
          setWelcomeVideoUrl(videoUrl);
          return;
        }
      }

      console.log("🎵 Seleccionando primera por orden:", firstByOrder.title);
      setSelectedSong({ ...firstByOrder, index: 0 });
      lastVisitIdRef.current = firstByOrder.visitId;
      setShowBreak(false);
      setPlaying(true);
    } else {
      console.log("⏸️ No hay canciones pendientes o cantando");
      setSelectedSong(undefined);
      setPlaying(false);
      setShowBreak(false);
    }
  }, [
    autoPlayEnabled,
    songs?.songs,
    selectedSong,
    showBreak,
    showWelcome,
    getWelcomeVideoUrl,
  ]);

  // Reaplicar fullscreen tras cambios de fuente del player
  useEffect(() => {
    if (
      wasFullscreenRef.current &&
      playerContainerRef.current &&
      !document.fullscreenElement
    ) {
      const el = playerContainerRef.current as unknown as HTMLElement & {
        webkitRequestFullscreen?: () => Promise<void> | void;
        mozRequestFullScreen?: () => Promise<void> | void;
        msRequestFullscreen?: () => Promise<void> | void;
      };
      const req: (() => Promise<void> | void) | undefined =
        el.requestFullscreen ||
        el.webkitRequestFullscreen ||
        el.mozRequestFullScreen ||
        el.msRequestFullscreen;
      if (req) {
        setTimeout(() => {
          try {
            req.call(el);
          } catch {
            // no-op
          }
        }, 50);
      }
    }
  }, [showBreak, showWelcome, selectedSong?.id]);

  const handleStartAutoPlay = async () => {
    console.log("▶️ Iniciando reproducción automática");
    setAutoPlayEnabled(true);
    welcomePendingRef.current = true;

    // Marcar que hay interacción del usuario - esto permite reproducir con audio
    userInteractionRef.current = true;
    console.log(
      "👆 Interacción del usuario registrada - permitirá audio sin muted"
    );

    if (!document.fullscreenElement && playerContainerRef.current) {
      try {
        const el = playerContainerRef.current as FullscreenElement;

        if (el.requestFullscreen) {
          await el.requestFullscreen();
        } else if (el.webkitRequestFullscreen) {
          await el.webkitRequestFullscreen();
        } else if (el.mozRequestFullScreen) {
          await el.mozRequestFullScreen();
        } else if (el.msRequestFullscreen) {
          await el.msRequestFullscreen();
        }
        console.log("📺 Pantalla completa activada automáticamente");
      } catch (error) {
        console.warn(
          "⚠️ No se pudo activar pantalla completa automáticamente:",
          error
        );
      }
    }
  };

  const handleTogglePlayPause = async () => {
    if (playing || playingWelcome) {
      console.log("⏸️ Pausando reproducción actual");
      setPlaying(false);
      setPlayingWelcome(false);
    } else {
      console.log("▶️ Reanudando reproducción");

      if (!document.fullscreenElement && playerContainerRef.current) {
        try {
          const el = playerContainerRef.current as FullscreenElement;

          if (el.requestFullscreen) {
            await el.requestFullscreen();
          } else if (el.webkitRequestFullscreen) {
            await el.webkitRequestFullscreen();
          } else if (el.mozRequestFullScreen) {
            await el.mozRequestFullScreen();
          } else if (el.msRequestFullscreen) {
            await el.msRequestFullscreen();
          }
          console.log(
            "📺 Pantalla completa activada automáticamente al reanudar"
          );
        } catch (error) {
          console.warn(
            "⚠️ No se pudo activar pantalla completa automáticamente:",
            error
          );
        }
      }

      if (showWelcome) {
        setPlayingWelcome(true);
      } else if (selectedSong) {
        setPlaying(true);
      }
    }
  };

  const handleToggleFullscreen = async () => {
    if (!playerContainerRef.current) return;

    try {
      const doc = document as FullscreenDocument;
      const el = playerContainerRef.current as FullscreenElement;

      if (!document.fullscreenElement) {
        if (el.requestFullscreen) {
          await el.requestFullscreen();
        } else if (el.webkitRequestFullscreen) {
          await el.webkitRequestFullscreen();
        } else if (el.mozRequestFullScreen) {
          await el.mozRequestFullScreen();
        } else if (el.msRequestFullscreen) {
          await el.msRequestFullscreen();
        }
      } else {
        if (doc.exitFullscreen) {
          await doc.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen();
        } else if (doc.mozCancelFullScreen) {
          await doc.mozCancelFullScreen();
        } else if (doc.msExitFullscreen) {
          await doc.msExitFullscreen();
        }
      }
    } catch (error) {
      console.error("Error al cambiar fullscreen:", error);
    }
  };

  const updateSongStatus = async (status: TSongStatus) => {
    if (!selectedSong) return;

    try {
      await visitsServices().updateSongStatus(
        selectedSong.visitId,
        selectedSong.id,
        selectedSong.numberSong,
        status
      );
      console.log(`✅ Estado de canción actualizado a: ${status}`);
    } catch (error) {
      console.error("❌ Error actualizando estado de canción:", error);
    }
  };

  const handleOnSongStart = async () => {
    console.log("🎵 Canción iniciada");
    if (selectedSong?.visitId) {
      lastVisitIdRef.current = selectedSong.visitId;
    }
    await updateSongStatus("singing");
  };

  const playApplauseSound = () => {
    try {
      console.log("👏 Reproduciendo sonido de aplausos");
      const audio = new Audio("/audios/aplausos/aplausos-1_GrqkPux.mp3");
      audio.volume = 0.7;
      audio.play().catch((error) => {
        console.error("❌ Error reproduciendo aplausos:", error);
      });
    } catch (error) {
      console.error("❌ Error creando audio de aplausos:", error);
    }
  };

  const handleOnEnded = async () => {
    if (!selectedSong || !songs?.songs) return;

    console.log("🎵 Canción terminada:", selectedSong.title);

    if (!isServerTable(selectedSong.location)) {
      playApplauseSound();
    }

    console.log("🔍 Esperando 3 segundos antes de continuar");
    await delay(3000);
    console.log("🔍 continuando...");

    const listInOrder = songs.songs;
    const currentIdx = listInOrder.findIndex(
      (s) =>
        s.id === selectedSong.id && s.numberSong === selectedSong.numberSong
    );
    const nextSong = currentIdx >= 0 ? listInOrder[currentIdx + 1] : undefined;

    await updateSongStatus("completed");

    if (nextSong) {
      const isNewTable =
        lastVisitIdRef.current !== null &&
        nextSong.visitId !== lastVisitIdRef.current;
      if (isNewTable) {
        console.log("🎬 Cambio de mesa → mostrar bienvenida");
        const location = (nextSong as TSongsRequested & { location?: string })
          .location;
        const isServer = isServerTable(location);

        if (!isServer) {
          nextSongAfterWelcomeRef.current = nextSong;
          const videoUrl = getWelcomeVideoUrl(location);
          console.log(
            "🙌 Mostrando Bienvenida para nueva mesa:",
            location,
            "→",
            videoUrl,
            "| Canción después del welcome:",
            nextSong.title
          );
          welcomeVideoFailedRef.current = false;
          setWelcomeVideoUrl(videoUrl);
          setSelectedSong(undefined);
          setPlaying(false);
          setShowBreak(false);
          setShowWelcome(true);
          setPlayingWelcome(true);
          return;
        } else {
          console.log("🎵 Mesa server, continuando sin welcome");
          setSelectedSong({ ...nextSong, index: 0 });
          lastVisitIdRef.current = nextSong.visitId;
          setShowBreak(false);
          setPlaying(true);
          return;
        }
      }
      console.log("🎵 Siguiente canción (misma mesa):", nextSong.title);
      setSelectedSong({ ...nextSong, index: 0 });
      lastVisitIdRef.current = nextSong.visitId;
      setShowBreak(false);
      setPlaying(true);
    } else {
      console.log("📭 No hay más canciones pendientes");
      setSelectedSong(undefined);
      setPlaying(false);
      setShowBreak(false);
    }
  };

  const handleWelcomeEnded = async () => {
    console.log("🙌 Bienvenida terminada, continuando en orden");

    setShowWelcome(false);
    setPlayingWelcome(false);
    welcomeVideoFailedRef.current = false;

    const nextAfterWelcome = nextSongAfterWelcomeRef.current;

    if (nextAfterWelcome) {
      console.log("🎵 Continuando con:", nextAfterWelcome.title);
      isTransitioningToYouTubeRef.current = true;
      preventUseEffectInterferenceRef.current = true;
      setSelectedSong({ ...nextAfterWelcome, index: 0 });
      lastVisitIdRef.current = nextAfterWelcome.visitId;
      nextSongAfterWelcomeRef.current = undefined;

      // Forzar reproducción después del cambio de URL (ReactPlayer onReady lo actuará)
      forcePlayAfterUrlChangeRef.current = true;
      // Asegurar que playing queda false momentáneamente para que ReactPlayer haga remount y onReady controle el play
      setPlaying(false);
      // Si hay interacción del usuario, intentar sin muted primero (permitirá audio)
      // Si no hay interacción, usar muted para que el autoplay funcione
      setIsMuted(!userInteractionRef.current);
      console.log(
        `🔊 Iniciando video con muted=${!userInteractionRef.current} (hay interacción: ${
          userInteractionRef.current
        })`
      );
    } else {
      console.log("⏸️ No hay canción guardada, buscando primera de la lista");
      const list = songs?.songs || [];
      const firstSong = list[0];
      if (firstSong) {
        console.log("🎵 Usando primera canción de la lista:", firstSong.title);
        isTransitioningToYouTubeRef.current = true;
        preventUseEffectInterferenceRef.current = true;
        setSelectedSong({ ...firstSong, index: 0 });
        lastVisitIdRef.current = firstSong.visitId;
        forcePlayAfterUrlChangeRef.current = true;
        setPlaying(false);
        // Si hay interacción del usuario, intentar sin muted primero (permitirá audio)
        // Si no hay interacción, usar muted para que el autoplay funcione
        setIsMuted(!userInteractionRef.current);
        console.log(
          `🔊 Iniciando video con muted=${!userInteractionRef.current} (hay interacción: ${
            userInteractionRef.current
          })`
        );
      } else {
        console.log("⏸️ No hay más canciones, quedando en espera");
        setShowBreak(false);
        preventUseEffectInterferenceRef.current = false;
        isTransitioningToYouTubeRef.current = false;
      }
    }
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen w-full bg-black overflow-hidden relative">
      {/* Botón de retroceso */}

      {!DISABLED_SONG_VALIDATION && (
        <div
          ref={controlsRef}
          className="fixed top-0 left-0 right-0 z-50 flex justify-center items-center gap-4 py-3 bg-gray-900 border-b border-gray-800"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/songs-manage")}
            className="fixed top-4 left-4 z-50 bg-gray-800 hover:bg-gray-700 text-white border-gray-700 shadow-lg"
            title="Volver"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          {!autoPlayEnabled ? (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={handleStartAutoPlay}
                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
              >
                <Play className="h-4 w-4" />
                Iniciar Auto
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleFullscreen}
                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
                title="Pantalla completa"
              >
                <Maximize2 className="h-4 w-4" />
                Pantalla Completa
              </Button>
            </>
          ) : (
            <>
              <Button
                variant={
                  playing || playingWelcome || autoPlayEnabled
                    ? "primary"
                    : "outline"
                }
                size="sm"
                onClick={handleTogglePlayPause}
                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
              >
                {playing || playingWelcome || autoPlayEnabled ? (
                  <>
                    <Pause className="h-4 w-4" />
                    Pausar
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Reanudar
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleFullscreen}
                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
                title="Pantalla completa"
              >
                <Maximize2 className="h-4 w-4" />
                Pantalla Completa
              </Button>
            </>
          )}
        </div>
      )}

      {!DISABLED_SONG_VALIDATION && showYouTube && (
        <div
          className="w-full bg-black"
          style={{
            height: DISABLED_SONG_VALIDATION ? "100vh" : "calc(100vh - 57px)",
            marginTop: DISABLED_SONG_VALIDATION ? "0" : "57px",
            position: "relative",
          }}
        >
          <div
            ref={playerContainerRef}
            className="w-full h-full bg-black relative"
          >
            {(() => {
              const handleWelcomeError = (error: Error | unknown) => {
                console.error("❌ Error en reproductor de bienvenida:", error);
                if (!welcomeVideoFailedRef.current) {
                  console.warn(
                    "⚠️ Video de bienvenida falló, usando fallback:",
                    WELCOME_FALLBACK_URL
                  );
                  welcomeVideoFailedRef.current = true;
                  setWelcomeVideoUrl(WELCOME_FALLBACK_URL);
                } else {
                  console.error(
                    "❌ Video de fallback también falló, continuando sin welcome"
                  );
                  handleWelcomeEnded();
                }
              };

              const handleYouTubeError = (error: Error | unknown) => {
                console.error("❌ Error en reproductor de YouTube:", error);
                // Si hay error y estábamos en transición, liberar flags para no bloquear el useEffect
                if (isTransitioningToYouTubeRef.current) {
                  isTransitioningToYouTubeRef.current = false;
                  preventUseEffectInterferenceRef.current = false;
                  forcePlayAfterUrlChangeRef.current = false;
                }
              };

              if (!welcomeVideoUrl && !selectedSong?.id) {
                return (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <p>Esperando canciones...</p>
                  </div>
                );
              }

              return (
                <>
                  {showWelcome && welcomeVideoUrl && (
                    <ReactPlayer
                      key={`welcome-${welcomeVideoUrl}`}
                      url={welcomeVideoUrl}
                      playing={playingWelcome}
                      controls
                      width="100%"
                      height="100%"
                      style={{ position: "absolute", top: 0, left: 0 }}
                      onEnded={handleWelcomeEnded}
                      onError={handleWelcomeError}
                      onReady={() => {
                        console.log("🙌 Video de bienvenida listo");
                      }}
                      onPlay={() => {
                        console.log("▶️ Video de bienvenida reproduciendo");
                      }}
                      onPause={() => {
                        console.log("⏸️ Video de bienvenida pausado");
                      }}
                      loop={false}
                    />
                  )}

                  {!showWelcome && selectedSong?.id && (
                    <ReactPlayer
                      key={`youtube-${selectedSong.id}-${selectedSong.numberSong}`}
                      ref={playerRef}
                      url={selectedSong.id}
                      playing={playing}
                      controls
                      width="100%"
                      muted={isMuted}
                      height="100%"
                      style={{ position: "absolute", top: 0, left: 0 }}
                      onStart={handleOnSongStart}
                      onEnded={handleOnEnded}
                      onError={handleYouTubeError}
                      onReady={() => {
                        console.log("🎵 Canción de YouTube lista (onReady)");

                        // Si venimos de un MP4/welcome y forzamos reproducción, activar playing aquí
                        if (forcePlayAfterUrlChangeRef.current) {
                          // Si hay interacción del usuario, intentar reproducir SIN muted (con audio)
                          // Si no hay interacción, usar muted para que el autoplay funcione
                          const shouldMute = !userInteractionRef.current;

                          console.log(
                            `🔄 Estado: transición detectada, activando playing en onReady (muted=${shouldMute}, hay interacción: ${userInteractionRef.current})`
                          );

                          setIsMuted(shouldMute);

                          // Pequeño delay para asegurar que el iframe/iframe-player está completamente inicializado
                          setTimeout(() => {
                            setPlaying(true);
                            // liberar flags de transición
                            forcePlayAfterUrlChangeRef.current = false;
                            isTransitioningToYouTubeRef.current = false;
                            preventUseEffectInterferenceRef.current = false;
                            console.log(
                              `✅ playing=true aplicado desde onReady (muted=${shouldMute})`
                            );
                          }, 250);
                        } else {
                          // Si no es una transición forzada, si playing ya es true no hacemos nada
                          if (playing) {
                            console.log("▶ playing ya estaba activo");
                          }
                        }
                      }}
                      onBuffer={() => {
                        console.log("📦 Video de YouTube buffering...");
                      }}
                      onBufferEnd={() => {
                        console.log(
                          "✅ Buffer completado, video listo para reproducir"
                        );
                        // Si por alguna razón el navegador bloqueó autoplay, intenta setear playing
                        if (forcePlayAfterUrlChangeRef.current) {
                          console.log(
                            "🔁 ForcePlay sigue activo tras bufferEnd, intentando setPlaying(true)"
                          );
                          // Usar muted solo si NO hay interacción del usuario
                          const shouldMute = !userInteractionRef.current;
                          setIsMuted(shouldMute);
                          setTimeout(() => {
                            setPlaying(true);
                          }, 200);
                        }
                      }}
                      onProgress={(state) => {
                        if (
                          isTransitioningToYouTubeRef.current &&
                          state.playedSeconds > 1.0 &&
                          !playing
                        ) {
                          console.log(
                            "✅ Video confirmado reproduciéndose (progreso > 1s) - forzando playing=true"
                          );
                          setPlaying(true);
                        }
                      }}
                      onPlay={() => {
                        console.log(
                          "▶️ Canción de YouTube reproduciendo (onPlay)"
                        );

                        // Si el video está muted pero hay interacción del usuario, intentar desmutear
                        // Solo intentar si realmente hay interacción previa (para evitar que el navegador pause)
                        if (
                          isMuted &&
                          userInteractionRef.current &&
                          autoPlayEnabled
                        ) {
                          console.log(
                            "🔊 Hay interacción del usuario registrada, desmuteando usando player interno"
                          );
                          // Esperar un momento para asegurar que la reproducción está estable
                          setTimeout(() => {
                            if (playerRef.current?.getInternalPlayer) {
                              try {
                                const internalPlayer =
                                  playerRef.current.getInternalPlayer();
                                if (
                                  internalPlayer &&
                                  typeof internalPlayer.unMute === "function"
                                ) {
                                  internalPlayer.unMute();
                                  console.log(
                                    "✅ Video desmuteado usando player interno (hay interacción del usuario)"
                                  );
                                  // Sincronizar el estado (no causará pausa porque ya está reproduciendo)
                                  setIsMuted(false);
                                } else if (
                                  internalPlayer &&
                                  typeof internalPlayer.setVolume === "function"
                                ) {
                                  // Fallback: usar setVolume si unMute no está disponible
                                  internalPlayer.setVolume(100);
                                  console.log(
                                    "✅ Volumen restaurado usando player interno"
                                  );
                                  setIsMuted(false);
                                } else {
                                  console.warn(
                                    "⚠️ No se pudo desmutear usando player interno - manteniendo muted"
                                  );
                                  // NO cambiar la prop si no funciona el player interno (evitar pausa)
                                }
                              } catch (error) {
                                console.warn(
                                  "⚠️ Error al desmutear usando player interno:",
                                  error
                                );
                                // NO cambiar la prop si hay error (evitar pausa)
                              }
                            }
                          }, 800);
                        } else if (isMuted && !userInteractionRef.current) {
                          console.log(
                            "🔇 Video en mute (no hay interacción del usuario) - mantenerse así"
                          );
                        }

                        // Liberar flags si estaban activos
                        if (isTransitioningToYouTubeRef.current) {
                          isTransitioningToYouTubeRef.current = false;
                        }
                        if (preventUseEffectInterferenceRef.current) {
                          preventUseEffectInterferenceRef.current = false;
                        }
                        if (forcePlayAfterUrlChangeRef.current) {
                          forcePlayAfterUrlChangeRef.current = false;
                        }
                      }}
                      onPause={() => {
                        console.log("⏸️ Video de YouTube pausado");
                      }}
                      loop={false}
                      config={{
                        youtube: {
                          playerVars: {
                            autoplay: playing ? 1 : 0,
                            controls: 1,
                            rel: 0,
                            modestbranding: 1,
                            loop: 0,
                            enablejsapi: 1,
                            iv_load_policy: 3,
                          },
                        },
                      }}
                    />
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
