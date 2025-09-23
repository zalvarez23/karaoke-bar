// 🎤 Configuración de Text-to-Speech
// Cambiar a true para usar Google Cloud TTS, false para ElevenLabs
export const USE_GOOGLE_TTS = true;

// Voces disponibles para español latino (expandible)
const AVAILABLE_VOICES = [
  // APROVECHANDO CRÉDITO GRATUITO - Solo Ultra Premium
  "es-US-Chirp3-HD-Laomedeia", // Ultra premium (gratis con $300 crédito)
  "es-US-Chirp3-HD-Pulcherrima",
  // Otras voces (comentadas para usar solo la mejor calidad)
  // "es-US-Standard-A", // Femenina latina
  // "es-US-Standard-B", // Masculina latina
  // "es-US-Standard-C", // Masculina latina
  // "es-US-Neural2-A", // Femenina latina premium
  // "es-US-Neural2-B", // Masculina latina premium
  // "es-US-Wavenet-A", // Femenina latina premium
  // "es-US-Wavenet-B", // Masculina latina premium
  // "es-US-Wavenet-C", // Masculina latina premium
];

// Función para obtener una voz aleatoria
export const getRandomVoice = () => {
  return AVAILABLE_VOICES[Math.floor(Math.random() * AVAILABLE_VOICES.length)];
};

// Función para mejorar la pronunciación del texto
export const improveTextForTTS = (text: string): string => {
  let improvedText = text.trim();

  // Agregar tildes comunes
  improvedText = improvedText
    .replace(/microfono/gi, "micrófono")
    .replace(/cancion/gi, "canción")
    .replace(/salud/gi, "salud")
    .replace(/musica/gi, "música")
    .replace(/felicitaciones/gi, "felicitaciones")
    .replace(/especial/gi, "especial")
    .replace(/fantastico/gi, "fantástico")
    .replace(/increible/gi, "increíble")
    .replace(/maravilloso/gi, "maravilloso")
    .replace(/excelente/gi, "excelente")
    .replace(/perfecto/gi, "perfecto")
    .replace(/magnifico/gi, "magnífico")
    .replace(/espectacular/gi, "espectacular")
    .replace(/extraordinario/gi, "extraordinario")
    .replace(/increiblemente/gi, "increíblemente")
    .replace(/maravillosamente/gi, "maravillosamente")
    .replace(/espectacularmente/gi, "espectacularmente")
    .replace(/fantasticamente/gi, "fantásticamente")
    .replace(/magnificamente/gi, "magníficamente")
    .replace(/excelentemente/gi, "excelentemente")
    .replace(/perfectamente/gi, "perfectamente")
    .replace(/extraordinariamente/gi, "extraordinariamente");

  // Mejorar puntuación
  improvedText = improvedText
    // Agregar comas después de saludos
    .replace(
      /^(Hola|Buenas|Buenos|Que tal|Saludos|Hey|Hola a todos|Bienvenidos)/i,
      (match) => `${match},`
    )
    // Agregar comas antes de "mi amigo", "amigos", etc.
    .replace(/(\w+)\s+(mi amigo|amigos|todos|chicos|chicas|gente)/gi, "$1, $2")
    // Agregar comas antes de "le gusta", "les gusta", etc.
    .replace(/(\w+)\s+(le gusta|les gusta|le encanta|les encanta)/gi, "$1, $2")
    // Mejorar risas
    .replace(/\b(ja|jaja|jajaja|haha|hahaha)\b/gi, (match) => {
      const count = match.length;
      if (count <= 4) return "¡jajá!";
      if (count <= 6) return "¡jajajá!";
      return "¡jajajajá!";
    })
    // Agregar signos de exclamación al final si no los tiene
    .replace(/([^.!?¡¿])$/, "$1!")
    // Limpiar espacios múltiples
    .replace(/\s+/g, " ")
    .trim();

  return improvedText;
};

// Configuración adicional
export const TTS_CONFIG = {
  // Configuración para Google TTS
  google: {
    language: "es-US",
    voice: "es-US-Chirp3-HD-Laomedeia", // Voz ultra premium (gratis con crédito)
    speed: 1.0,
    pitch: 0.0,
    volume: 1.0,
    audioEncoding: "MP3", // o "LINEAR16" si prefieres
    voiceClone: {}, // Objeto vacío para voiceClone
  },

  // Configuración para ElevenLabs (fallback)
  elevenlabs: {
    volume: 0.8,
    rate: 0.9,
    pitch: 1.2,
  },

  // Configuración para Web Speech API (fallback final)
  webSpeech: {
    language: "es-US",
    rate: 0.9,
    pitch: 1.2,
    volume: 1,
  },
} as const;
