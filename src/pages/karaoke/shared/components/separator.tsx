import React from "react";
import { cn } from "@/lib/utils";

interface SeparatorProps {
  className?: string;
  orientation?: "horizontal" | "vertical";
  thickness?: number;
}

const Separator: React.FC<SeparatorProps> = ({ 
  className, 
  orientation = "horizontal",
  thickness = 1 
}) => {
  const baseClasses = "bg-gray-600";
  const orientationClasses = orientation === "horizontal" 
    ? `w-full h-${thickness}` 
    : `h-full w-${thickness}`;
  
  return (
    <div 
      className={cn(baseClasses, orientationClasses, className)}
      style={{ [orientation === "horizontal" ? "height" : "width"]: `${thickness}px` }}
    />
  );
};

export default Separator;



