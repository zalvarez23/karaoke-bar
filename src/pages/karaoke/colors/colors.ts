/**
 * Colores de KantoBar Karaoke
 * Migrados desde movile-karaoke y adaptados para web con Tailwind CSS
 */

export const KaraokeColors = {
  base: {
    black: "#000000",
    white: "#FFFFFF",
    primary: "#13141e",
    darkPrimary: "#191720",
    lightPrimary: "#1e1c24",
    extraDark: "#0A0A0A",
    secondary: "#c49b5e",
    secondaryLight: "rgb(245 221 172)",
  },
  gray: {
    gray950: "#141414",
    gray900: "#1A1C1E",
    gray800: "#27272A",
    gray700: "#3F3F46",
    gray600: "#52525B",
    gray500: "#71717A",
    gray400: "#A1A1AA",
    gray300: "#D4D4D8",
    gray200: "#E4E4E7",
    gray100: "#EDEDEE",
    gray50: "#FAFAFA",
  },
  lime: {
    lime950: "#1A2E05",
    lime900: "#365314",
    lime800: "#3F6212",
    lime700: "#4D7C0F",
    lime600: "#65A30D",
    lime500: "#84CC16",
    lime400: "#A3E635",
    lime300: "#BEF264",
    lime200: "#D9F99D",
    lime100: "#ECFCCB",
    lime50: "#F7FEE7",
  },
  green: {
    green950: "#002117",
    green900: "#003829",
    green800: "#00513D",
    green700: "#006C52",
    green600: "#008768",
    green500: "#00A47F",
    green400: "#00C296",
    green300: "#00E1AE",
    green200: "#45FEC9",
    green100: "#BBFFE3",
    green50: "#E7FFF3",
  },
  purple: {
    purple950: "#1A0063",
    purple900: "#2E009C",
    purple800: "#440DD3",
    purple700: "#5D3AEA",
    purple600: "#6E4FFC",
    purple500: "#7F64FC",
    purple400: "#927BFD",
    purple300: "#B7A7FE",
    purple200: "#DBD3FE",
    purple100: "#E9E5FF",
    purple50: "#F3F1FF",
  },
  red: {
    red950: "#340000",
    red900: "#480803",
    red800: "#4F150F",
    red700: "#75160C",
    red600: "#A1160A",
    red500: "#D91F11",
    red400: "#FA5343",
    red300: "#FC9086",
    red200: "#FABBB4",
    red100: "#FADCD9",
    red50: "#FCF0F0",
  },
  orange: {
    orange950: "#560000",
    orange900: "#880000",
    orange800: "#B01900",
    orange700: "#C42D00",
    orange600: "#D84111",
    orange500: "#F05223",
    orange400: "#FF8B6A",
    orange300: "#FFB5A0",
    orange200: "#FFDBD1",
    orange100: "#FFEDE8",
    orange50: "#FFF8F6",
  },
  yellow: {
    yellow950: "#744700",
    yellow900: "#B37006",
    yellow800: "#D7890C",
    yellow700: "#F9A825",
    yellow600: "#FBC02D",
    yellow500: "#FDD835",
    yellow400: "#FFEB3B",
    yellow300: "#FFF176",
    yellow200: "#FFF59D",
    yellow100: "#FFF9C4",
    yellow50: "#FFFDE7",
  },
  primary: {
    primary950: "#1A0063",
    primary900: "#2E009C",
    primary800: "#440DD3",
    primary700: "#4E3AB1",
    primary600: "#45338E",
    primary500: "#7F64FC",
    primary400: "#927BFD",
    primary300: "#B7A7FE",
    primary200: "#DBD3FE",
    primary100: "#E9E5FF",
    primary50: "#F3F1FF",
  },
  baseOpacity: {
    "white-4": "rgba(255, 255, 255, 0.04)",
    "white-8": "rgba(255, 255, 255, 0.08)",
    "white-16": "rgba(255, 255, 255, 0.16)",
    "white-20": "rgba(255, 255, 255, 0.20)",
    "primary-4": "rgba(110, 79, 252, 0.04)",
    "primary-8": "rgba(110, 79, 252, 0.08)",
    "primary-20": "rgba(110, 79, 252, 0.20)",
    "gray-4": "rgba(20, 20, 20, 0.04)",
    "gray-8": "rgba(20, 20, 20, 0.08)",
    "gray-20": "rgba(20, 20, 20, 0.20)",
  },
  gradients: {
    neutral: ["#E4E4E7", "#D4D4D8"],
    primary: ["#927BFD", "#5D3AEA"],
    secondary: ["#00E1AE", "#008768"],
    tertiary: ["#F9A825", "#B37006"],
  },
  badges: {
    // Badge colors with proper contrast ratios
    warning: {
      background: "#F59E0B", // Amber-500
      text: "#FFFFFF",
    },
    pending: {
      background: "#fde0c2", // Light Orange
      text: "#9f4b1f",
    },
    success: {
      background: "#d8fdfe", // Emerald-500
      text: "#269597",
    },
    error: {
      background: "#f7dbe2", // Red-500
      text: "#be3e63",
    },
    info: {
      background: "#ddf0f5", // Blue-500
      text: "#4594a6",
    },
    neutral: {
      background: "#6B7280", // Gray-500
      text: "#FFFFFF",
    },
    singing: {
      background: "#efdfff", // Purple
      text: "#6f1ee3",
    },
  },
} as const;

/**
 * Clases de Tailwind CSS para colores de KantoBar Karaoke
 * Utiliza las clases personalizadas que se pueden agregar al tailwind.config.js
 */
export const KaraokeTailwindClasses = {
  // Backgrounds
  bgDarkPrimary: "bg-[#191720]",
  bgLightPrimary: "bg-[#1e1c24]",
  bgExtraDark: "bg-[#0A0A0A]",

  // Text colors
  textPrimary: "text-[#7F64FC]",
  textSecondary: "text-[#00E1AE]",
  textAccent: "text-[#F05223]",

  // Border colors
  borderPrimary: "border-[#7F64FC]",
  borderSecondary: "border-[#00E1AE]",

  // Hover states
  hoverPrimary: "hover:bg-[#6E4FFC]",
  hoverSecondary: "hover:bg-[#00C296]",
} as const;

/**
 * CSS Custom Properties para colores de KantoBar Karaoke
 * Se pueden usar en CSS con var(--karaoke-color-name)
 */
export const KaraokeCSSVars = {
  "--karaoke-dark-primary": "#191720",
  "--karaoke-light-primary": "#1e1c24",
  "--karaoke-primary": "#7F64FC",
  "--karaoke-primary-hover": "#6E4FFC",
  "--karaoke-secondary": "#00E1AE",
  "--karaoke-secondary-hover": "#00C296",
  "--karaoke-accent": "#F05223",
  "--karaoke-accent-hover": "#D84111",
  "--karaoke-success": "#00A47F",
  "--karaoke-warning": "#F05223",
  "--karaoke-error": "#D91F11",
  "--karaoke-info": "#927BFD",
} as const;
