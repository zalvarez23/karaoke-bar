// API Configuration for Karaoke
export const API_CONFIG = {
  // Always use proxy to avoid CORS issues
  YOUTUBE_BASE_URL: "/api/youtube",

  ENDPOINTS: {
    SUGGESTIONS: "/suggestions",
    SEARCH: "/search-youtube",
  },
} as const;

// Helper function to build API URLs
export const buildApiUrl = (endpoint: string, query?: string): string => {
  const baseUrl = API_CONFIG.YOUTUBE_BASE_URL;
  const url = `${baseUrl}${endpoint}`;

  if (query) {
    return `${url}?query=${encodeURIComponent(query)}`;
  }

  return url;
};
