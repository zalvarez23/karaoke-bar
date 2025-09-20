import { FC } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

type ButtonIconProps = {
  icon: LucideIcon;
  color?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "ghost" | "outline";
  className?: string;
  onClick?: () => void;
};

export const ButtonIcon: FC<ButtonIconProps> = ({
  icon: Icon,
  color = "#333333",
  size = "md",
  variant = "default",
  className,
  onClick,
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "w-8 h-8 p-2";
      case "md":
        return "w-10 h-10 p-2.5";
      case "lg":
        return "w-12 h-12 p-3";
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case "default":
        return "bg-white hover:bg-gray-50 shadow-md";
      case "ghost":
        return "hover:bg-gray-100";
      case "outline":
        return "border border-gray-300 hover:bg-gray-50";
    }
  };

  const getIconSize = () => {
    switch (size) {
      case "sm":
        return 16;
      case "md":
        return 20;
      case "lg":
        return 24;
    }
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
        getSizeClasses(),
        getVariantClasses(),
        className
      )}
      onClick={onClick}
      style={{ color }}
    >
      <Icon size={getIconSize()} />
    </button>
  );
};
