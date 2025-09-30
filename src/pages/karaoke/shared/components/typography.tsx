import React from "react";
import { cn } from "@/lib/utils";
// import { KaraokeColors } from "../../colors";

type TypographyVariant =
  | "headline-xl"
  | "headline-xl-semi"
  | "headline-lg"
  | "headline-lg-semi"
  | "headline-md"
  | "headline-md-semi"
  | "headline-sm"
  | "headline-sm-semi"
  | "body-xl"
  | "body-xl-semi"
  | "body-lg"
  | "body-lg-semi"
  | "body-md"
  | "body-md-semi"
  | "body-sm"
  | "body-sm-semi"
  | "label-lg"
  | "label-lg-semi"
  | "label-md"
  | "label-md-semi"
  | "label-sm"
  | "label-sm-semi"
  | "label-xs"
  | "label-xs-semi"
  | "link-lg"
  | "link-lg-semi"
  | "link-md"
  | "link-md-semi"
  | "link-sm"
  | "link-sm-semi";

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TypographyVariant;
  color?: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";
  children?: React.ReactNode;
}

const Typography: React.FC<TypographyProps> = ({
  variant = "body-md",
  color,
  className,
  as = "p",
  children,
  style,
  ...props
}) => {
  const getVariantClasses = (variant: TypographyVariant) => {
    const variants = {
      // Headlines
      "headline-xl": "text-5xl font-bold leading-[48px]",
      "headline-xl-semi": "text-5xl font-semibold leading-[48px]",
      "headline-lg": "text-4xl font-bold leading-[42px]",
      "headline-lg-semi": "text-4xl font-semibold leading-[42px]",
      "headline-md": "text-3xl font-bold leading-[38px]",
      "headline-md-semi": "text-3xl font-semibold leading-[38px]",
      "headline-sm": "text-2xl font-bold leading-[32px]",
      "headline-sm-semi": "text-2xl font-semibold leading-[32px]",

      // Body
      "body-xl": "text-xl font-normal leading-[28px]",
      "body-xl-semi": "text-xl font-semibold leading-[28px]",
      "body-lg": "text-lg font-normal leading-[26px]",
      "body-lg-semi": "text-lg font-semibold leading-[26px]",
      "body-md": "text-base font-normal leading-[24px]",
      "body-md-semi": "text-base font-semibold leading-[24px]",
      "body-sm": "text-sm font-normal leading-[20px]",
      "body-sm-semi": "text-sm font-semibold leading-[20px]",

      // Labels
      "label-lg": "text-lg font-medium leading-[26px]",
      "label-lg-semi": "text-lg font-semibold leading-[26px]",
      "label-md": "text-base font-medium leading-[24px]",
      "label-md-semi": "text-base font-semibold leading-[24px]",
      "label-sm": "text-sm font-medium leading-[20px]",
      "label-sm-semi": "text-sm font-semibold leading-[20px]",
      "label-xs": "text-xs font-medium leading-[16px]",
      "label-xs-semi": "text-xs font-semibold leading-[16px]",

      // Links
      "link-lg": "text-lg font-medium leading-[26px] underline",
      "link-lg-semi": "text-lg font-semibold leading-[26px] underline",
      "link-md": "text-base font-medium leading-[24px] underline",
      "link-md-semi": "text-base font-semibold leading-[24px] underline",
      "link-sm": "text-sm font-medium leading-[20px] underline",
      "link-sm-semi": "text-sm font-semibold leading-[20px] underline",
    };

    return variants[variant] || variants["body-md"];
  };

  const getColorClass = () => {
    if (color) return "";

    // Colores por defecto basados en el tema
    switch (variant) {
      case "headline-xl":
      case "headline-xl-semi":
      case "headline-lg":
      case "headline-lg-semi":
      case "headline-md":
      case "headline-md-semi":
        return "text-white";
      case "body-lg":
      case "body-lg-semi":
      case "body-md":
      case "body-md-semi":
        return "text-gray-300";
      case "body-sm":
      case "body-sm-semi":
        return "text-gray-400";
      case "label-lg":
      case "label-lg-semi":
      case "label-md":
      case "label-md-semi":
        return "text-gray-200";
      case "link-lg":
      case "link-lg-semi":
      case "link-md":
      case "link-md-semi":
        return "text-[#7F64FC] hover:text-[#6E4FFC]";
      default:
        return "text-white";
    }
  };

  const classes = cn(
    "font-hurme", // Usando la fuente HurmeGeometricSans4 del proyecto
    "font-hurme-styled", // Aplica automaticamente el letter-spacing global
    getVariantClasses(variant),
    getColorClass(),
    className
  );

  const Component = as;

  return (
    <Component
      className={classes}
      style={{
        color: color || undefined,
        ...style,
      }}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Typography;
