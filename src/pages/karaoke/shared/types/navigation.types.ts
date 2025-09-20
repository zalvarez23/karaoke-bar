// Rutas principales de karaoke
export const KARAOKE_ROUTES = {
  LOGIN: "/karaoke/login",
  REGISTER: "/karaoke/register",
  HOME: "/karaoke/home",
  MESAS: "/karaoke/mesas",
  MESAS_ONLINE: "/karaoke/mesas-online",
  LIVE: "/karaoke/live",
  PROFILE: "/karaoke/profile",
} as const;

export type KaraokeRoute = (typeof KARAOKE_ROUTES)[keyof typeof KARAOKE_ROUTES];

// Hook de navegación personalizado para karaoke
export interface UseKaraokeNavigationReturn {
  navigate: (route: KaraokeRoute) => void;
  currentRoute: KaraokeRoute;
}
