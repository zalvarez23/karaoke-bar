import React from "react";
import { cn } from "@/lib/utils";
import { KaraokeColors } from "../../colors";
// import Typography from "./typography";

interface BadgeProps {
  text: string;
  color?: string;
  backgroundColor?: string;
  size?: "small" | "medium" | "large";
  variant?:
    | "warning"
    | "pending"
    | "success"
    | "error"
    | "info"
    | "neutral"
    | "singing";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  text,
  color,
  backgroundColor,
  size = "small",
  variant,
  className,
}) => {
  // Use variant colors if provided, otherwise use custom colors
  const badgeColors = variant
    ? KaraokeColors.badges[variant]
    : { background: backgroundColor, text: color };

  const finalBackgroundColor =
    badgeColors.background || backgroundColor || KaraokeColors.yellow.yellow400;
  const finalTextColor = badgeColors.text || color || KaraokeColors.base.white;

  const getSizeClasses = () => {
    switch (size) {
      case "small":
        return "px-2 py-1 text-xs font-semibold";
      case "medium":
        return "px-2.5 py-1.5 text-xs font-bold";
      case "large":
        return "px-3 py-2 text-sm font-bold";
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-xl",
        getSizeClasses(),
        className
      )}
      style={{
        backgroundColor: finalBackgroundColor,
        color: finalTextColor,
      }}
    >
      {text}
    </span>
  );
};
