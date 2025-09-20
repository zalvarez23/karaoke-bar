// Karaoke Shared Constants
export const KARAOKE_CONSTANTS = {
  // Test user configuration
  TEST_USER: {
    ID: "Test001",
    NAME: "Test001",
    LAST_NAME: "001",
    DOCUMENT_NUMBER: "12345678",
    EMAIL: "test001@example.com",
    PHONE: "1234567890",
  },

  // Application settings
  APP: {
    NAME: "KantoBar Karaoke",
    VERSION: "1.0.0",
    DESCRIPTION: "Sistema de karaoke web para KantoBar",
  },

  // API Configuration
  API: {
    BASE_URL: "http://localhost:3001",
    TIMEOUT: 10000,
  },

  // Firebase Configuration
  FIREBASE: {
    COLLECTIONS: {
      USERS: "Users",
      VISITS: "Visits",
      LOCATIONS: "Locations",
      SONGS: "Songs",
    },
  },
} as const;

// Storage keys for web
export const STORAGE_KEYS = {
  SESSION_USER: "kantobar_karaoke_session_user",
  USER_PREFERENCES: "kantobar_karaoke_user_preferences",
  THEME: "kantobar_karaoke_theme",
  LANGUAGE: "kantobar_karaoke_language",
} as const;

// Status messages
export const STATUS_MESSAGES = {
  LOADING: "Cargando...",
  SUCCESS: "Operación exitosa",
  ERROR: "Error en la operación",
  NETWORK_ERROR: "Error de conexión",
  VALIDATION_ERROR: "Error de validación",
} as const;
