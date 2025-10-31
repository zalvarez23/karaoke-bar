import React, { useEffect, useState, useCallback, useRef } from "react";
import { DataTable } from "./components/data-table";
import { columns } from "./components/columns";
import { AddSongsModal } from "./components/add-songs-modal";
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
import { useFirebaseFlag } from "@/shared/hooks/useFirebaseFlag";

/**
 * Mapeo de mesas y barras a sus URLs de YouTube
 */
const WELCOME_VIDEOS_MAP: Record<string, string> = {
  mesa1: "https://youtu.be/VB6NbWhUysw?si=YyZFpB08MJKxw2Mb",
  mesa2: "https://www.youtube.com/watch?v=aYUclFOgOi4",
  mesa3: "https://youtu.be/1KnQ9PG_RkE?si=O3_0fWXZDZ80Wrxl",
  mesa4: "https://youtu.be/CeisK8kMdL8?si=bZP2Kxunur3uXSL5",
  mesa5: "https://youtu.be/UeFLtl6CbDU?si=_GgogCTREHjgPapq",
  mesa6: "https://youtu.be/6GpH-NNeMbc?si=gQKchdvOoKN-QwYQ",
  mesa7: "https://www.youtube.com/watch?v=TX66XHccOhI",
  mesa8: "https://youtu.be/VXk1iEjqnQk?si=dHcLmmzrfTIw3Nft",
  mesa9: "https://youtu.be/KdM3OlA9tTI?si=6IRM_OwpD7Wftdva",
  mesa10: "https://youtu.be/yzvrvLXV2Z8?si=pYq5izJ8EjMVLm3F",
  barra1: "https://youtu.be/5-sn3UPCwL8?si=_mrYTnRwyXjt8ukS",
  barra2: "https://youtu.be/7TJxnX64uqQ?si=V-_3RlM6EaKnvqIW",
};

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
  const [showAddSongsModal, setShowAddSongsModal] = useState(false);
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

  // URL del video de intermedio (YouTube)
  const INTERMISSION_VIDEO_URL = "https://www.youtube.com/watch?v=W6Kq20xYRk0";
  // URL del video de bienvenida cuando no se encuentra la mesa/barra
  const WELCOME_FALLBACK_URL = "https://www.youtube.com/watch?v=wK0h9-1dJRM";

  // Leer flag de Firebase: disabledSongValidation
  // Si es true, ocultar el botón de reproducción automática
  const DISABLED_SONG_VALIDATION = useFirebaseFlag(
    "disabledSongValidation",
    false
  );

  const songsServices = useCallback(() => new SongsServices(), []);
  const visitsServices = useCallback(() => new VisitsServices(), []);
  const elevenLabsService = useCallback(() => new ElevenLabsService(), []);

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // Saludo por voz eliminado: solo se mantiene break al cambiar de mesa

  const isServerTable = (location?: string) =>
    (location || "").toLowerCase() === "server";

  /**
   * Construye la URL del video de bienvenida basado en el nombre de la mesa
   * Normaliza diferentes formatos: "mesa 1", "MESA 1", "MESA1", "Mesa 1" → "mesa1"
   * También maneja "barra 1", "BARRA 1", etc.
   * Retorna: URL de YouTube correspondiente o video de fallback
   */
  const getWelcomeVideoUrl = useCallback((location?: string): string => {
    if (!location) {
      console.warn("⚠️ No hay location, usando video de fallback");
      return WELCOME_FALLBACK_URL;
    }

    // Normalizar: convertir a minúsculas y eliminar espacios extra
    const normalized = location.toLowerCase().trim().replace(/\s+/g, "");

    // Detectar si es "mesa" o "barra"
    const mesaMatch = normalized.match(/^mesa(\d+)$/);
    const barraMatch = normalized.match(/^barra(\d+)$/);

    let key: string | undefined;

    if (mesaMatch) {
      key = `mesa${mesaMatch[1]}`;
    } else if (barraMatch) {
      key = `barra${barraMatch[1]}`;
    } else {
      // Si no coincide, intentar extraer número de cualquier formato
      const numeroMatch = normalized.match(/(\d+)/);
      if (
        numeroMatch &&
        (normalized.includes("mesa") || normalized.includes("barra"))
      ) {
        const numero = numeroMatch[1];
        const tipo = normalized.includes("barra") ? "barra" : "mesa";
        key = `${tipo}${numero}`;
      }
    }

    // Buscar en el mapeo primero - si existe, usar ese video
    if (key && WELCOME_VIDEOS_MAP[key]) {
      return WELCOME_VIDEOS_MAP[key];
    }

    // Si no se encuentra en el mapeo (ej: barra4, mesa15, etc), usar fallback
    console.warn(
      "⚠️ Location no encontrada en mapeo:",
      location,
      "(key:",
      key,
      ") → usando video de fallback"
    );
    return WELCOME_FALLBACK_URL;
  }, []);

  // Trackear cambios de fullscreen del navegador
  useEffect(() => {
    const onFsChange = () => {
      wasFullscreenRef.current = !!document.fullscreenElement;
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

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

    // Si estamos en break o en bienvenida, NO cambiar selección; dejar que terminen
    if (showBreak || showWelcome) {
      // Si estamos en break y aparecieron canciones nuevas, preparar bienvenida
      if (
        showBreak &&
        !selectedSong &&
        songs?.songs &&
        songs.songs.length > 0 &&
        !welcomePendingRef.current
      ) {
        const firstByOrder = songs.songs[0];
        const location = (
          firstByOrder as TSongsRequested & { location?: string }
        ).location;
        const shouldWelcome = !isServerTable(location);

        if (shouldWelcome) {
          // Guardar la canción que se reproducirá después del welcome
          nextSongAfterWelcomeRef.current = firstByOrder;
          // Pre-calcular la URL del video de bienvenida
          const videoUrl = getWelcomeVideoUrl(location);
          console.log(
            "🙌 Detectadas canciones durante break → preparar Bienvenida para:",
            location,
            "→",
            videoUrl,
            "| Canción después del welcome:",
            firstByOrder.title
          );
          // Resetear el flag de error antes de preparar el welcome
          welcomeVideoFailedRef.current = false;
          setWelcomeVideoUrl(videoUrl);
          welcomePendingRef.current = true;
        }
      }
      console.log("🎬 En break/bienvenida, esperando a que termine");
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
        console.log("🎵 Canción actual sigue existiendo, continuando");
        return;
      } else {
        console.log(
          "🔄 Canción actual ya no existe, verificando cambio de mesa antes de seleccionar"
        );

        // Verificar si hay cambio de mesa antes de seleccionar automáticamente
        const nextSong = songs.songs[0];
        if (nextSong && lastVisitIdRef.current !== null) {
          const isNewTable = nextSong.visitId !== lastVisitIdRef.current;
          if (isNewTable) {
            // Hay cambio de mesa, NO seleccionar automáticamente
            // Dejar que handleOnEnded maneje el break y welcome
            console.log(
              "🔄 Detectado cambio de mesa, esperando handleOnEnded para activar break"
            );
            return;
          }
        }
        // La canción ya no existe, buscar la siguiente
      }
    }

    // Tomar la primera por ORDEN del array
    const firstByOrder = songs.songs[0];

    if (firstByOrder) {
      // Verificar si hay cambio de mesa antes de seleccionar
      if (
        lastVisitIdRef.current !== null &&
        firstByOrder.visitId !== lastVisitIdRef.current
      ) {
        // Hay cambio de mesa, NO seleccionar automáticamente
        // Dejar que handleOnEnded maneje el break y welcome
        console.log(
          "🔄 Detectado cambio de mesa en primera canción, esperando handleOnEnded"
        );
        return;
      }

      console.log("🎵 Seleccionando primera por orden:", firstByOrder.title);
      setSelectedSong({ ...firstByOrder, index: 0 });
      setCurrentVisitId(firstByOrder.visitId);
      setShowBreak(false);
      setPlayingBreak(false);
      setPlaying(true);
    } else {
      console.log("⏸️ No hay canciones pendientes o cantando");
      setSelectedSong(undefined);
      setPlaying(false);
      setShowBreak(true);
      setPlayingBreak(true);
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
        // pequeña espera para asegurar que el nuevo iframe está listo
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

  const handleStartAutoPlay = () => {
    console.log("▶️ Iniciando reproducción automática");
    setAutoPlayEnabled(true);
    // Reproducir intro (break) siempre al iniciar auto
    setSelectedSong(undefined);
    setPlaying(false);
    setShowBreak(true);
    setPlayingBreak(true);
    // Marcar bienvenida pendiente para el primer ciclo
    welcomePendingRef.current = true;
  };

  const handleStopAutoPlay = () => {
    console.log("⏸️ Deteniendo reproducción automática");
    setAutoPlayEnabled(false);
    setPlaying(false);
    setPlayingBreak(false);
    setSelectedSong(undefined);
    setShowBreak(false);
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
      audio.volume = 0.7; // Volumen moderado
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

    // Reproducir sonido de aplausos solo si NO es mesa "server"
    if (!isServerTable(selectedSong.location)) {
      playApplauseSound();
    }

    console.log("🔍 Esperando 3 segundos antes de continuar");

    // Esperar 3 segundos antes de continuar
    await delay(3000);

    console.log("🔍 continuando...");

    // Buscar la siguiente canción por ORDEN en la lista (sin importar estado)
    const listInOrder = songs.songs;
    const currentIdx = listInOrder.findIndex(
      (s) =>
        s.id === selectedSong.id && s.numberSong === selectedSong.numberSong
    );
    const nextSong = currentIdx >= 0 ? listInOrder[currentIdx + 1] : undefined;

    // No validar estado ni anunciar aquí

    // Ahora sí marcar como completada
    await updateSongStatus("completed");

    // Continuar según sea misma mesa o nueva mesa
    if (nextSong) {
      const isNewTable =
        lastVisitIdRef.current !== null &&
        nextSong.visitId !== lastVisitIdRef.current;
      if (isNewTable) {
        console.log("🎬 Cambio de mesa → activar break y preparar bienvenida");
        const location = (nextSong as TSongsRequested & { location?: string })
          .location;
        const isServer = isServerTable(location);

        // Solo preparar bienvenida si la siguiente mesa NO es "server"
        if (!isServer) {
          const videoUrl = getWelcomeVideoUrl(location);
          console.log(
            "🎬 Preparando bienvenida para mesa:",
            location,
            "→",
            videoUrl
          );
          setWelcomeVideoUrl(videoUrl);
          welcomePendingRef.current = true;
        } else {
          welcomePendingRef.current = false;
        }

        setSelectedSong(undefined);
        setPlaying(false);
        setShowBreak(true);
        setPlayingBreak(true);
        return;
      }
      console.log("🎵 Siguiente canción (misma mesa):", nextSong.title);
      setSelectedSong({ ...nextSong, index: 0 });
      setCurrentVisitId(nextSong.visitId);
      lastVisitIdRef.current = nextSong.visitId;
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

  const handleBreakEnded = async () => {
    if (!autoPlayEnabled) {
      console.log("⏸️ Auto play desactivado, no continuar");
      return;
    }

    console.log("🎬 Intermedio terminado, buscando siguiente canción");

    // Esperar 3 segundos de cortinilla post-break
    await delay(3000);

    // Si hay bienvenida pendiente, validarla contra mesa "server"
    if (welcomePendingRef.current) {
      const listPreview = songs?.songs || [];
      const nextCandidate = !selectedSong
        ? listPreview[0]
        : (() => {
            const idx = listPreview.findIndex(
              (s) =>
                s.id === selectedSong.id &&
                s.numberSong === selectedSong.numberSong
            );
            return idx >= 0 ? listPreview[idx + 1] : listPreview[0];
          })();

      if (
        nextCandidate &&
        isServerTable(
          (nextCandidate as TSongsRequested & { location?: string }).location
        )
      ) {
        // No mostrar bienvenida para mesa server; continuar por orden normal
        welcomePendingRef.current = false;
      } else if (nextCandidate) {
        // Guardar la canción que se reproducirá después del welcome
        nextSongAfterWelcomeRef.current = nextCandidate;
        // Construir URL del video de bienvenida según la mesa
        const location = (
          nextCandidate as TSongsRequested & { location?: string }
        ).location;
        const videoUrl = getWelcomeVideoUrl(location);

        console.log(
          "🙌 Mostrando Bienvenida tras el break para:",
          location,
          "→",
          videoUrl,
          "| Canción después del welcome:",
          nextCandidate.title
        );
        // Resetear el flag de error antes de intentar reproducir el welcome
        welcomeVideoFailedRef.current = false;
        setWelcomeVideoUrl(videoUrl);
        welcomePendingRef.current = false;
        setShowBreak(false);
        setPlayingBreak(false);
        setShowWelcome(true);
        setPlayingWelcome(true);
        return;
      }
    }

    // Bienvenida: si se marcó pendiente al cambiar de mesa o al iniciar auto
    if (welcomePendingRef.current) {
      // Obtener la siguiente canción para determinar la mesa
      const listPreview = songs?.songs || [];
      const nextCandidate = !selectedSong
        ? listPreview[0]
        : (() => {
            const idx = listPreview.findIndex(
              (s) =>
                s.id === selectedSong.id &&
                s.numberSong === selectedSong.numberSong
            );
            return idx >= 0 ? listPreview[idx + 1] : listPreview[0];
          })();

      if (
        nextCandidate &&
        !isServerTable(
          (nextCandidate as TSongsRequested & { location?: string }).location
        )
      ) {
        // Guardar la canción que se reproducirá después del welcome
        nextSongAfterWelcomeRef.current = nextCandidate;
        const location = (
          nextCandidate as TSongsRequested & { location?: string }
        ).location;
        const videoUrl = getWelcomeVideoUrl(location);

        console.log(
          "🙌 Mostrando Bienvenida tras el break para:",
          location,
          "→",
          videoUrl,
          "| Canción después del welcome:",
          nextCandidate.title
        );
        // Resetear el flag de error antes de intentar reproducir el welcome
        welcomeVideoFailedRef.current = false;
        setWelcomeVideoUrl(videoUrl);
        welcomePendingRef.current = false;
        setShowBreak(false);
        setPlayingBreak(false);
        setShowWelcome(true);
        setPlayingWelcome(true);
        return;
      }

      // Si no hay nextCandidate, continuar sin welcome
      welcomePendingRef.current = false;
    }

    // Continuar por orden luego del break
    const list = songs?.songs || [];
    let nextAfterBreak: TSongsRequested | undefined;
    if (!selectedSong) {
      nextAfterBreak = list[0];
    } else {
      const idx = list.findIndex(
        (s) =>
          s.id === selectedSong.id && s.numberSong === selectedSong.numberSong
      );
      nextAfterBreak = idx >= 0 ? list[idx + 1] : list[0];
    }

    if (nextAfterBreak) {
      console.log("🎵 Continuando con:", nextAfterBreak.title);
      setSelectedSong({ ...nextAfterBreak, index: 0 });
      setCurrentVisitId(nextAfterBreak.visitId);
      lastVisitIdRef.current = nextAfterBreak.visitId;
      setShowBreak(false);
      setPlayingBreak(false);
      setPlaying(true);
    } else {
      console.log("⏸️ No hay más canciones pendientes, manteniendo break");
      setPlayingBreak(false);
    }
  };

  const handleWelcomeEnded = async () => {
    console.log("🙌 Bienvenida terminada, continuando en orden");

    setShowWelcome(false);
    setPlayingWelcome(false);
    // Resetear el flag de error cuando termina el welcome
    welcomeVideoFailedRef.current = false;

    // Usar la canción que se guardó cuando se preparó el welcome
    const nextAfterWelcome = nextSongAfterWelcomeRef.current;

    if (nextAfterWelcome) {
      console.log("🎵 Continuando con:", nextAfterWelcome.title);
      setSelectedSong({ ...nextAfterWelcome, index: 0 });
      setCurrentVisitId(nextAfterWelcome.visitId);
      lastVisitIdRef.current = nextAfterWelcome.visitId;
      // Limpiar la referencia después de usarla
      nextSongAfterWelcomeRef.current = undefined;
      setPlaying(true);
    } else {
      console.log("⏸️ No hay canción guardada, buscando primera de la lista");
      // Fallback: si no hay canción guardada, buscar la primera
      const list = songs?.songs || [];
      const firstSong = list[0];
      if (firstSong) {
        console.log("🎵 Usando primera canción de la lista:", firstSong.title);
        setSelectedSong({ ...firstSong, index: 0 });
        setCurrentVisitId(firstSong.visitId);
        lastVisitIdRef.current = firstSong.visitId;
        setPlaying(true);
      } else {
        console.log("⏸️ No hay más canciones, quedando en espera");
        setShowBreak(true);
        setPlayingBreak(false);
      }
    }
  };

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
        onAddSongs={() => setShowAddSongsModal(true)}
      />

      {/* Controles de reproducción - Solo mostrar si la validación NO está deshabilitada */}
      {!DISABLED_SONG_VALIDATION && (
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
        </div>
      )}

      {/* Información de estado - Solo mostrar si la validación NO está deshabilitada */}
      {!DISABLED_SONG_VALIDATION && (
        <div className="bg-gray-100 p-4 rounded-lg mb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-semibold">Auto Play:</span>{" "}
              {autoPlayEnabled ? "✅ ON" : "❌ OFF"}
            </div>
            <div>
              <span className="font-semibold">Ronda:</span> {currentRound}
            </div>
            <div>
              <span className="font-semibold">Canciones en Ronda:</span>{" "}
              {songsInCurrentRound}
            </div>
            <div>
              <span className="font-semibold">Mesa ID:</span>{" "}
              {currentVisitId || "N/A"}
            </div>
          </div>
        </div>
      )}

      {/* Reproductor de YouTube - Solo mostrar si la validación NO está deshabilitada */}
      {!DISABLED_SONG_VALIDATION && showYouTube && (
        <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
          <h3 className="text-lg font-semibold mb-3">Reproductor</h3>
          <div
            ref={playerContainerRef}
            className="aspect-video bg-gray-900 rounded-lg overflow-hidden"
          >
            {(() => {
              const isSongMode = !showBreak && !showWelcome;
              const currentUrl = showBreak
                ? INTERMISSION_VIDEO_URL
                : showWelcome
                ? welcomeVideoUrl || undefined
                : selectedSong?.id || undefined;
              const currentPlaying = showBreak
                ? playingBreak
                : showWelcome
                ? playingWelcome
                : playing;
              const currentOnEnded = showBreak
                ? handleBreakEnded
                : showWelcome
                ? handleWelcomeEnded
                : handleOnEnded;
              const loopBreak =
                showBreak && (!songs?.songs || songs.songs.length === 0);

              // Solo renderizar si hay una URL válida
              if (!currentUrl) {
                return null;
              }

              // Handler para errores del player
              const handleError = (error: Error | unknown) => {
                console.error("❌ Error en reproductor:", error);

                // Si es un video de bienvenida que falló y no hemos intentado el fallback
                if (showWelcome && !welcomeVideoFailedRef.current) {
                  console.warn(
                    "⚠️ Video de bienvenida falló, usando fallback:",
                    WELCOME_FALLBACK_URL
                  );
                  welcomeVideoFailedRef.current = true;
                  setWelcomeVideoUrl(WELCOME_FALLBACK_URL);
                } else if (showWelcome && welcomeVideoFailedRef.current) {
                  // Si ya intentamos el fallback y también falló, continuar sin welcome
                  console.error(
                    "❌ Video de fallback también falló, continuando sin welcome"
                  );
                  handleWelcomeEnded();
                }
              };

              return (
                <ReactPlayer
                  url={currentUrl}
                  playing={currentPlaying}
                  controls
                  width="100%"
                  height="100%"
                  onStart={isSongMode ? handleOnSongStart : undefined}
                  onEnded={currentOnEnded}
                  onError={handleError}
                  onReady={() => {
                    console.log(
                      showBreak
                        ? "🎬 Video de intermedio listo"
                        : showWelcome
                        ? "🙌 Video de bienvenida listo"
                        : "🎵 Canción lista"
                    );
                  }}
                  onPlay={() => {
                    console.log(
                      showBreak
                        ? "▶️ Video de intermedio reproduciendo"
                        : showWelcome
                        ? "▶️ Video de bienvenida reproduciendo"
                        : "▶️ Canción reproduciendo"
                    );
                  }}
                  loop={loopBreak}
                  config={{
                    youtube: {
                      playerVars: {
                        autoplay: 0,
                        controls: 1,
                        rel: 0,
                        modestbranding: 1,
                        loop: loopBreak ? 1 : 0,
                      },
                    },
                  }}
                />
              );
            })()}
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

      {/* Modal para agregar canciones */}
      <AddSongsModal
        visible={showAddSongsModal}
        onClose={() => setShowAddSongsModal(false)}
        onSongsAdded={(newSongs) => {
          console.log("Canciones agregadas:", newSongs);
          // No cerrar el modal automáticamente para permitir agregar más canciones
          // setShowAddSongsModal(false);
        }}
      />
    </div>
  );
};
