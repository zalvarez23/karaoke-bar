import React, { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
// import { KaraokeColors } from "../../colors";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  theme?: "primary" | "secondary" | "destructive" | "contrast" | "accent";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  appearance?: "solid" | "outline" | "ghost";
  disabled?: boolean;
  icon?: ReactNode;
  onlyIcon?: boolean;
  children?: ReactNode;
  className?: string;
  title?: string;
  isLoading?: boolean;
};

const Button: React.FC<ButtonProps> = ({
  theme = "primary",
  children,
  size = "md",
  fullWidth = false,
  appearance = "solid",
  disabled = false,
  icon,
  onlyIcon = false,
  className,
  title,
  isLoading,
  onClick,
  ...props
}) => {
  // const [isPressed, setIsPressed] = useState<boolean>(false);

  const themes = {
    primary: {
      solid: "bg-[#7F64FC] hover:bg-[#6E4FFC] text-white",
      outline:
        "border border-[#7F64FC] text-[#7F64FC] hover:bg-[#7F64FC] hover:text-white",
      ghost: "text-[#7F64FC] hover:bg-[#7F64FC] hover:text-white",
    },
    secondary: {
      solid: "bg-[#00E1AE] hover:bg-[#00C296] text-white",
      outline:
        "border border-[#00E1AE] text-[#00E1AE] hover:bg-[#00E1AE] hover:text-white",
      ghost: "text-[#00E1AE] hover:bg-[#00E1AE] hover:text-white",
    },
    destructive: {
      solid: "bg-[#D91F11] hover:bg-[#A1160A] text-white",
      outline:
        "border border-[#D91F11] text-[#D91F11] hover:bg-[#D91F11] hover:text-white",
      ghost: "text-[#D91F11] hover:bg-[#D91F11] hover:text-white",
    },
    contrast: {
      solid: "bg-white hover:bg-gray-100 text-gray-900",
      outline:
        "border border-white text-white hover:bg-white hover:text-gray-900",
      ghost: "text-white hover:bg-white hover:text-gray-900",
    },
    accent: {
      solid: "bg-[#F05223] hover:bg-[#D84111] text-white",
      outline:
        "border border-[#F05223] text-[#F05223] hover:bg-[#F05223] hover:text-white",
      ghost: "text-[#F05223] hover:bg-[#F05223] hover:text-white",
    },
  };

  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
  };

  const baseClasses =
    "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

  const buttonClasses = cn(
    baseClasses,
    sizes[size],
    themes[theme][appearance],
    fullWidth && "w-full",
    onlyIcon && "rounded-full w-10 h-10 p-0",
    className
  );

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading) return;
    onClick?.(e);
  };

  return (
    <button
      className={buttonClasses}
      disabled={disabled}
      onClick={handleClick}
      // onMouseDown={() => setIsPressed(true)}
      // onMouseUp={() => setIsPressed(false)}
      // onMouseLeave={() => setIsPressed(false)}
      {...props}
    >
      {onlyIcon ? null : (
        <>
          {title ? (
            <>
              {children}
              <span className="ml-2">{title}</span>
            </>
          ) : (
            <>
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              ) : (
                children
              )}
            </>
          )}
          {icon && <span className="ml-2">{icon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;
