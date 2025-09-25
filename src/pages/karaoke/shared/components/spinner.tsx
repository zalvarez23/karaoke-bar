import React from "react";
import { cn } from "@/lib/utils";

type SpinnerProps = {
  size?: number;
  color?: string;
  className?: string;
};

const Spinner: React.FC<SpinnerProps> = ({
  size = 35,
  color = "white",
  className,
}) => {
  const spinnerSize = size <= 20 ? "w-4 h-4" : size <= 30 ? "w-6 h-6" : size <= 40 ? "w-8 h-8" : "w-10 h-10";
  
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-current border-t-transparent",
          spinnerSize
        )}
        style={{ color }}
      />
    </div>
  );
};

export default Spinner;




