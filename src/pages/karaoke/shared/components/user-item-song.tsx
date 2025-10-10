import { FC, useCallback, useState, useRef, useEffect } from "react";
import { Heart, Trash2, Clock, X, Mic2 } from "lucide-react";
import { KaraokeColors } from "../../colors";
import { Typography, Badge } from "./index";
import { TSongsRequested } from "../types/visits.types";

interface UserItemSongProps extends TSongsRequested {
  onDelete?: (songId: string, numberSong: number) => void;
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
  likes,
}) => {
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
        return KaraokeColors.base.secondaryLight;
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

  const getStatusIcon = () => {
    switch (status) {
      case "singing":
        return (
          <div className="flex items-center gap-1 bg-green-500/20 px-2 py-1 rounded-full">
            <Mic2
              size={14}
              color={KaraokeColors.green.green500}
              strokeWidth={3}
            />
            <Typography variant="label-xs" color={KaraokeColors.green.green500}>
              Cantando
            </Typography>
          </div>
        );
      case "pending":
        return (
          <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded-full">
            <Clock
              size={13}
              strokeWidth={3}
              color={KaraokeColors.yellow.yellow500}
            />
            <Typography
              variant="label-xs"
              color={KaraokeColors.yellow.yellow500}
            >
              Espera
            </Typography>
          </div>
        );
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
          className="relative bg-gray-800 rounded-lg p-4 flex items-center gap-4 z-10 transition-transform duration-150 ease-out min-h-[100px]"
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
                className="w-16 h-16 rounded-lg object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-gray-700 flex items-center justify-center">
                <Typography
                  variant="body-md-semi"
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

              {/* Delete Button - Only for pending songs */}
              {status === "pending" && onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  className="flex-shrink-0 bg-red-500/20 p-2 hover:bg-red-500 rounded-full transition-all hover:scale-110 active:scale-95 relative -top-1.5 left-1.5"
                >
                  <X
                    size={20}
                    color={KaraokeColors.red.red500}
                    className="hover:text-white"
                  />
                </button>
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

            {/* Status Icon */}
            {getStatusIcon()}
          </div>
        </div>
      </div>
    </>
  );
};
