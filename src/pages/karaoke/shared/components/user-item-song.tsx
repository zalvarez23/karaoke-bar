import { FC, useCallback, useState, useRef, useEffect } from "react";
import { Heart, Megaphone, Trash2 } from "lucide-react";
import { KaraokeColors } from "../../colors";
import { Typography, Badge } from "./index";
import { TSongsRequested } from "../types/visits.types";

interface UserItemSongProps extends TSongsRequested {
  onDelete?: (songId: string, numberSong: number) => void;
  onSendGreeting?: (greeting: string, songId: string) => Promise<boolean>;
}

export const UserItemSong: FC<UserItemSongProps> = ({
  id,
  title,
  duration,
  thumbnail,
  status,
  userName,
  location,
  onDelete,
  numberSong,
  round,
  onSendGreeting,
  likes,
}) => {
  const [isGreetingModalVisible, setIsGreetingModalVisible] = useState(false);
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);

  const getColorByStatus = useCallback(() => {
    switch (status) {
      case "completed":
        return KaraokeColors.gray.gray500;
      case "singing":
        return KaraokeColors.primary.primary300;
      case "pending":
        return KaraokeColors.gray.gray200;
      default:
        return KaraokeColors.gray.gray500;
    }
  }, [status]);

  const handleDelete = useCallback(async () => {
    if (onDelete && status === "pending") {
      await onDelete(id, numberSong);
    }
  }, [onDelete, status, id, numberSong]);

  // Drag handlers for slide delete
  const handleMouseDown = (e: React.MouseEvent) => {
    if (status !== "pending") return;

    setIsDragging(true);
    startXRef.current = e.clientX;
    currentXRef.current = translateX;
    e.preventDefault();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (status !== "pending") return;

    setIsDragging(true);
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = translateX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || status !== "pending") return;

    const deltaX = e.touches[0].clientX - startXRef.current;
    const newTranslateX = Math.min(0, currentXRef.current + deltaX);
    setTranslateX(newTranslateX);
  };

  const handleTouchEnd = () => {
    if (!isDragging || status !== "pending") return;

    setIsDragging(false);

    // Si se desliza más de 50px hacia la izquierda, eliminar
    if (translateX < -50) {
      handleDelete();
    }

    // Resetear posición
    setTranslateX(0);
  };

  // Global mouse events for drag
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging || status !== "pending") return;

      const deltaX = e.clientX - startXRef.current;
      const newTranslateX = Math.min(0, currentXRef.current + deltaX);
      setTranslateX(newTranslateX);
    };

    const handleGlobalMouseUp = () => {
      if (!isDragging || status !== "pending") return;

      setIsDragging(false);

      // Si se desliza más de 50px hacia la izquierda, eliminar
      if (translateX < -50) {
        handleDelete();
      }

      // Resetear posición
      setTranslateX(0);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleGlobalMouseMove);
      document.addEventListener("mouseup", handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isDragging, translateX, status, handleDelete]);

  const handleSendGreeting = async (greeting: string) => {
    if (onSendGreeting) {
      try {
        const success = await onSendGreeting(greeting, id);
        if (success) {
          setIsGreetingModalVisible(false);
        }
        return success;
      } catch (error) {
        console.error("Error sending greeting:", error);
        return false;
      }
    }
    return false;
  };

  const getStatusBadge = () => {
    switch (status) {
      case "singing":
        return <Badge text="Cantando" variant="success" size="small" />;
      case "pending":
        return <Badge text="En espera" variant="warning" size="small" />;
      case "completed":
        return <Badge text="Completado" variant="neutral" size="small" />;
      default:
        return null;
    }
  };

  return (
    <>
      <div
        className="relative mb-3 overflow-hidden rounded-lg"
        ref={containerRef}
      >
        {/* Delete Background - Only for pending songs */}
        {status === "pending" && (
          <div
            className="absolute inset-0 bg-red-500 flex items-center justify-end pr-6 z-0"
            style={{ opacity: Math.min(1, Math.abs(translateX) / 100) }}
          >
            <Trash2 size={24} color={KaraokeColors.base.white} />
          </div>
        )}

        {/* Main Content */}
        <div
          className="relative bg-gray-800 rounded-lg p-3 flex items-center gap-4 z-10 transition-transform duration-150 ease-out"
          style={{
            transform: `translateX(${translateX}px)`,
            cursor:
              status === "pending"
                ? isDragging
                  ? "grabbing"
                  : "grab"
                : "default",
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Thumbnail */}
          <div className="flex-shrink-0">
            {thumbnail && thumbnail.trim() !== "" ? (
              <img
                src={thumbnail}
                alt={title}
                className="w-12 h-12 rounded-lg object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-gray-700 flex items-center justify-center">
                <Typography
                  variant="body-sm-semi"
                  color={KaraokeColors.gray.gray400}
                >
                  NN
                </Typography>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title and Actions Row */}
            <div className="flex items-start justify-between mb-1">
              <Typography
                variant="body-sm-semi"
                color={getColorByStatus()}
                className="truncate flex-1 pr-3"
              >
                {title}
              </Typography>

              {/* Actions - Only for pending songs */}
              {status === "pending" && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Greeting Button */}
                  <button
                    onClick={() => setIsGreetingModalVisible(true)}
                    className="flex items-center gap-1 px-2 py-1 bg-purple-500 hover:bg-purple-600 rounded-full transition-colors"
                  >
                    <Megaphone size={12} color={KaraokeColors.base.white} />
                    <Typography
                      variant="body-sm"
                      color={KaraokeColors.base.white}
                    >
                      Saludo
                    </Typography>
                  </button>
                </div>
              )}
            </div>

            {/* Duration and Round */}
            <Typography
              variant="body-sm"
              color={KaraokeColors.gray.gray500}
              className="mb-2"
            >
              {duration} - ronda: {round}
            </Typography>

            {/* User and Location */}
            <Typography
              variant="body-sm"
              color={KaraokeColors.orange.orange300}
              className="mb-2"
            >
              {location && userName && `${userName} - ${location}`}
            </Typography>
          </div>

          {/* Status Badge with Likes - Absolute Position */}
          <div
            className="absolute flex items-center gap-2"
            style={{
              right: "15px",
              bottom: "10px",
            }}
          >
            {/* Likes */}
            {likes !== undefined && likes > 0 && (
              <div className="flex items-center gap-1">
                <Heart
                  size={12}
                  fill={KaraokeColors.red.red500}
                  color={KaraokeColors.red.red500}
                />
                <Typography
                  variant="body-sm-semi"
                  color={KaraokeColors.red.red500}
                >
                  {likes}
                </Typography>
              </div>
            )}

            {/* Status Badge */}
            {getStatusBadge()}
          </div>
        </div>
      </div>

      {/* Greeting Modal */}
      <GreetingModal
        visible={isGreetingModalVisible}
        onClose={() => setIsGreetingModalVisible(false)}
        onSendGreeting={handleSendGreeting}
      />
    </>
  );
};

// Greeting Modal Component
interface GreetingModalProps {
  visible: boolean;
  onClose: () => void;
  onSendGreeting: (greeting: string) => Promise<boolean>;
}

const GreetingModal: FC<GreetingModalProps> = ({
  visible,
  onClose,
  onSendGreeting,
}) => {
  const [greetingText, setGreetingText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Autofocus cuando se abre el modal
  useEffect(() => {
    if (visible && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [visible]);

  const handleSendGreeting = async () => {
    if (!greetingText.trim()) {
      alert("Por favor ingresa un mensaje de saludo");
      return;
    }

    setIsSending(true);

    try {
      const success = await onSendGreeting(greetingText.trim());

      if (success) {
        alert("¡Saludo enviado correctamente!");
        setGreetingText("");
        setIsSending(false);
        onClose();
        return;
      } else {
        alert("No se pudo enviar el saludo");
      }
    } catch (error) {
      console.error("❌ Error enviando saludo:", error);
      alert("No se pudo enviar el saludo");
    }

    setIsSending(false);
  };

  const handleClose = () => {
    setGreetingText("");
    onClose();
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <Typography
          variant="body-lg-semi"
          color={KaraokeColors.base.white}
          className="mb-2"
        >
          Saludos
        </Typography>

        <Typography
          variant="body-sm-semi"
          color={KaraokeColors.gray.gray300}
          className="text-center mb-4"
        >
          Envía un saludo antes de cantar
        </Typography>

        <textarea
          ref={textareaRef}
          value={greetingText}
          onChange={(e) => setGreetingText(e.target.value)}
          placeholder="Escribe tu mensaje de saludo..."
          className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 resize-none h-20 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
          maxLength={200}
        />

        <div className="flex justify-between items-center pt-2">
          <button
            onClick={handleClose}
            className="text-red-400 hover:text-red-300 transition-colors"
          >
            <Typography variant="body-sm-semi" color={KaraokeColors.red.red400}>
              Cancelar
            </Typography>
          </button>

          <button
            onClick={handleSendGreeting}
            disabled={isSending || !greetingText.trim()}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <Typography variant="body-sm-semi" color={KaraokeColors.base.white}>
              {isSending ? "Enviando..." : "Enviar"}
            </Typography>
          </button>
        </div>
      </div>
    </div>
  );
};
