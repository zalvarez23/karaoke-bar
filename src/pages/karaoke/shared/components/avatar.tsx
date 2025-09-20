import { FC } from "react";
import { cn } from "@/lib/utils";

type TImagesAvatar =
  | "avatarGirl"
  | "avatarBoy"
  | "default"
  | "image2"
  | "image3";

// Mapeo de imágenes de avatares
const getAvatarImage = (image: TImagesAvatar): string => {
  const avatarMap: Record<TImagesAvatar, string> = {
    avatarBoy: "/src/pages/karaoke/assets/images/avatars/default.png",
    avatarGirl: "/src/pages/karaoke/assets/images/avatars/avatar-girl.png",
    image2: "/src/pages/karaoke/assets/images/avatars/image2.jpeg",
    image3: "/src/pages/karaoke/assets/images/avatars/image3.jpeg",
    default: "/src/pages/karaoke/assets/images/avatars/default.png",
  };

  return avatarMap[image] || avatarMap.default;
};

type AvatarProps = {
  image: TImagesAvatar;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  alt?: string;
};

const Avatar: FC<AvatarProps> = ({
  image,
  size = "md",
  className,
  alt = "Avatar",
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "w-8 h-8";
      case "md":
        return "w-12 h-12";
      case "lg":
        return "w-16 h-16";
      case "xl":
        return "w-20 h-20";
    }
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <img
        src={getAvatarImage(image)}
        alt={alt}
        className={cn(
          "rounded-full object-cover bg-gray-600",
          getSizeClasses()
        )}
        onError={(e) => {
          // Fallback a un avatar por defecto si la imagen no carga
          (e.target as HTMLImageElement).src =
            "/src/pages/karaoke/assets/images/avatars/default.png";
        }}
      />
    </div>
  );
};

export default Avatar;
