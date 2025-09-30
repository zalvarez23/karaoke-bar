import { KaraokeColors } from "@/pages/karaoke/colors";
import { Typography } from "@/pages/karaoke/shared/components";
import { LucideIcon } from "lucide-react";

interface SectionCardHomeProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick?: () => void;
  disabled?: boolean;
  comingSoon?: boolean;
  highlight?: boolean;
}

export const SectionCardHome = ({
  icon: Icon,
  title,
  description,
  onClick,
  disabled = false,
  comingSoon = false,
  highlight = false,
}: SectionCardHomeProps) => {
  const isDisabled = disabled || comingSoon;

  return (
    <div
      className={`flex flex-col gap-2 rounded-lg p-4 bg-base-blackLight  relative ${
        isDisabled
          ? "opacity-50 cursor-not-allowed"
          : "cursor-pointer hover:scale-102 hover:shadow-lg active:scale-98 active:translate-y-0.5 active:transition-all active:duration-75"
      } ${highlight ? "border-2 border-purple-500 animate-blink" : ""}`}
      onClick={isDisabled ? undefined : onClick}
    >
      <div className="flex flex-row gap-4 items-center">
        <Icon
          size={30}
          color={KaraokeColors.base.secondaryLight}
          className={highlight ? "animate-pulse-grow" : ""}
        />
        <Typography variant="body-md" color={KaraokeColors.base.secondaryLight}>
          {title}
        </Typography>
      </div>

      <Typography
        variant="body-sm"
        color={KaraokeColors.gray.gray500}
        className="mt-2.5 text-center"
      >
        {description}
      </Typography>

      {comingSoon && (
        <div className="absolute top-2 right-2">
          <div className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
            Próximamente
          </div>
        </div>
      )}
    </div>
  );
};
