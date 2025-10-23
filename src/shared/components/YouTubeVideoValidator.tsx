import React, { useEffect, useRef, useState, useCallback } from "react";
import ReactPlayer from "react-player/youtube";
import { YouTubeValidationResult } from "../hooks/useReactPlayerValidation";

interface YouTubeVideoValidatorProps {
  videoUrl: string;
  videoId: string;
  onValidationComplete: (result: YouTubeValidationResult) => void;
  onValidationStart?: () => void;
  autoStart?: boolean;
  isActive?: boolean; // Solo validar si está activo
}

export const YouTubeVideoValidator: React.FC<YouTubeVideoValidatorProps> = ({
  videoUrl,
  videoId,
  onValidationComplete,
  onValidationStart,
  autoStart = true,
  isActive = false,
}) => {
  const [isValidating, setIsValidating] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const playerRef = useRef<ReactPlayer>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const onValidationCompleteRef = useRef(onValidationComplete);
  const onValidationStartRef = useRef(onValidationStart);

  // Actualizar refs cuando cambien las props
  useEffect(() => {
    onValidationCompleteRef.current = onValidationComplete;
    onValidationStartRef.current = onValidationStart;
  }, [onValidationComplete, onValidationStart]);

  // Efecto para iniciar validación cuando se activa
  useEffect(() => {
    if (autoStart && videoUrl && !hasStarted && !isValidating && isActive) {
      setIsValidating(true);
      setHasStarted(true);
      onValidationStartRef.current?.();

      // Timeout de 5 segundos para la validación
      timeoutRef.current = setTimeout(() => {
        setIsValidating(false);
        onValidationCompleteRef.current({
          isAvailable: false,
          error: "Timeout de validación - video no responde",
          videoId,
        });
      }, 5000);
    }
  }, [isActive, autoStart, videoUrl, hasStarted, isValidating, videoId]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [videoId]);

  const handleReady = useCallback(() => {
    // Cuando el video esté listo, intentar reproducir para validar
    if (isValidating && playerRef.current) {
      playerRef.current.seekTo(0);
    }
  }, [videoId, isValidating]);

  const handleStart = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsValidating(false);
    onValidationCompleteRef.current({
      isAvailable: true,
      videoId,
    });
  }, [videoId]);

  const handleError = useCallback(
    (error: unknown) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setIsValidating(false);

      // Detectar tipos de error específicos
      let errorMessage = "Error de reproducción";
      if (error && typeof error === "object" && "data" in error) {
        const errorData = error as { data?: number };
        if (errorData.data === 150) {
          errorMessage =
            "Video no disponible para reproducción embebida (derechos de autor)";
        } else if (errorData.data === 101) {
          errorMessage = "Video no disponible";
        } else if (errorData.data === 2) {
          errorMessage = "Solicitud inválida";
        } else if (errorData.data === 5) {
          errorMessage = "Error de reproducción HTML5";
        } else if (errorData.data === 100) {
          errorMessage = "Video no encontrado o privado";
        }
      }

      onValidationCompleteRef.current({
        isAvailable: false,
        error: errorMessage,
        videoId,
      });
    },
    [videoId]
  );

  const handleDuration = useCallback(
    (duration: number) => {
      // Si detectamos duración, el video está disponible
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setIsValidating(false);
      onValidationCompleteRef.current({
        isAvailable: true,
        videoId,
        duration: `${Math.floor(duration / 60)}:${(duration % 60)
          .toString()
          .padStart(2, "0")}`,
      });
    },
    [videoId]
  );

  if (!videoUrl) {
    return null;
  }

  return (
    <div style={{ display: "none" }}>
      <ReactPlayer
        ref={playerRef}
        url={videoUrl}
        playing={isValidating} // Solo reproducir cuando está validando
        controls={false}
        width={1}
        height={1}
        volume={0} // Sin audio para validación
        muted={true} // Silenciado
        onReady={handleReady}
        onStart={handleStart}
        onError={handleError}
        onDuration={handleDuration}
        config={
          {
            youtube: {
              playerVars: {
                autoplay: 0,
                controls: 0,
                rel: 0,
                modestbranding: 1,
                enablejsapi: 1,
                origin: window.location.origin,
                mute: 1, // Silenciar en YouTube
              },
            },
          } as React.ComponentProps<typeof ReactPlayer>["config"]
        }
      />
    </div>
  );
};
