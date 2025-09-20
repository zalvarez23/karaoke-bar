import { KaraokeColors } from "../../colors";
import { Typography, Badge } from "./index";
import { ESongStatus, TSongsRequested } from "../types/visits.types";
import React, { FC, useCallback, useState } from "react";
import { Heart } from "lucide-react";

interface TItemSongProps extends TSongsRequested {
  style?: React.CSSProperties;
  onLikeSong?: (songId: string) => Promise<boolean>;
  isSearch?: boolean;
}

export const ItemSong: FC<TItemSongProps> = ({
  id,
  title,
  duration,
  thumbnail,
  style,
  status,
  userName,
  location,
  onLikeSong,
  isSearch,
  likes,
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const getColorByStatus = useCallback(() => {
    switch (status) {
      case "completed":
        return KaraokeColors.gray.gray500;
      case "singing":
        return KaraokeColors.purple.purple300;
      case "pending":
        return KaraokeColors.gray.gray200;
      default:
        return KaraokeColors.gray.gray500;
    }
  }, [status]);

  const handleHeartPress = useCallback(async () => {
    if (isDisabled) return; // No hacer nada si está deshabilitado

    try {
      setIsDisabled(true); // Deshabilitar inmediatamente
      setIsLiked(true); // Mostrar como liked visualmente

      if (onLikeSong) {
        await onLikeSong(id);
      }

      // Rehabilitar después de 3 segundos
      setTimeout(() => {
        setIsDisabled(false);
        setIsLiked(false);
      }, 3000);
    } catch (error) {
      console.error("Error al enviar like:", error);
      // En caso de error, rehabilitar inmediatamente
      setIsDisabled(false);
      setIsLiked(false);
    }
  }, [onLikeSong, id, isDisabled]);

  console.log("thumbnail", thumbnail);

  return (
    <div className="flex items-center gap-5 relative" style={style}>
      {thumbnail && thumbnail.trim() !== "" ? (
        <img
          src={thumbnail}
          alt={title}
          className="w-12 h-12 rounded-lg object-cover"
        />
      ) : (
        <div className="w-12 h-12 rounded-lg bg-gray-700 flex items-center justify-center">
          <Typography variant="body-md-semi" color={KaraokeColors.gray.gray400}>
            NN
          </Typography>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <Typography
          variant="body-sm-semi"
          color={getColorByStatus()}
          className={`${!isSearch ? "truncate pr-20" : ""} capitalize`}
        >
          {title}
        </Typography>
        <Typography variant="body-sm-semi" color={KaraokeColors.gray.gray500}>
          {duration}
        </Typography>
        {status && (
          <div className="flex justify-between items-center">
            <Typography variant="body-sm" color={KaraokeColors.base.white}>
              {location &&
                userName &&
                `${userName.split(" ")[0]} - ${location}`}
            </Typography>
            <div className="flex items-center gap-4">
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
              <Typography variant="body-sm-semi" color={getColorByStatus()}>
                {status === "singing" ? (
                  <Badge text="Cantando" variant="singing" size="small" />
                ) : status === "pending" ? (
                  <Badge text="En espera" variant="pending" size="small" />
                ) : (
                  ESongStatus[status]
                )}
              </Typography>
            </div>
          </div>
        )}
      </div>

      {/* Botón de corazón para canciones cantando */}
      {status === "singing" && (
        <button
          className={`absolute top-0 right-2 bg-red-500 px-3 py-1.5 rounded-full flex items-center justify-center z-10 transition-colors ${
            isDisabled ? "bg-gray-500 opacity-60" : "hover:bg-red-600"
          }`}
          onClick={handleHeartPress}
          disabled={isDisabled}
        >
          <Heart
            size={16}
            fill={isLiked ? KaraokeColors.red.red500 : KaraokeColors.base.white}
            color={
              isLiked ? KaraokeColors.red.red500 : KaraokeColors.base.white
            }
          />
        </button>
      )}
    </div>
  );
};
