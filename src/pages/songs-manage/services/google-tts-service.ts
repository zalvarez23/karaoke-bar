// Servicio para Google Cloud TTS desde el frontend
export interface GoogleTtsRequest {
  text: string;
  language?: string;
  voice?: string;
  speed?: number;
  pitch?: number;
}

export interface GoogleTtsResponse {
  success: boolean;
  audioData?: string; // Base64 encoded audio
  error?: string;
  message?: string;
  timestamp: string;
}

export class GoogleTtsService {
  private baseUrl: string;

  constructor() {
    // URL del backend de Cloudflare Workers
    this.baseUrl = "https://shrill-snowflake-ecac.alvarez23.workers.dev";
  }

  /**
   * Sintetiza texto a audio usando Google Cloud TTS
   */
  async synthesize(request: GoogleTtsRequest): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tts/synthesize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      const result: GoogleTtsResponse = await response.json();

      if (!result.success) {
        throw new Error(
          result.message || result.error || "Error en síntesis de voz"
        );
      }

      if (!result.audioData) {
        throw new Error("No se recibió audio del servidor");
      }

      // Convertir base64 a Blob
      const audioBytes = atob(result.audioData);
      const audioArray = new Uint8Array(audioBytes.length);
      for (let i = 0; i < audioBytes.length; i++) {
        audioArray[i] = audioBytes.charCodeAt(i);
      }

      return new Blob([audioArray], { type: "audio/mpeg" });
    } catch (error) {
      throw new Error(`Error en Google TTS: ${error}`);
    }
  }

  /**
   * Reproduce un blob de audio
   */
  playAudio(audioBlob: Blob, volume: number = 1.0): void {
    try {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.volume = volume;

      audio
        .play()
        .then(() => {
          // Limpiar URL después de cargar
          audio.addEventListener("ended", () => {
            URL.revokeObjectURL(audioUrl);
          });
        })
        .catch((error) => {
          console.error("Error reproduciendo audio:", error);
          URL.revokeObjectURL(audioUrl);
        });
    } catch (error) {
      throw new Error(`Error reproduciendo audio: ${error}`);
    }
  }

  /**
   * Sintetiza y reproduce texto en una sola función
   */
  async synthesizeAndPlay(
    text: string,
    options: {
      language?: string;
      voice?: string;
      speed?: number;
      pitch?: number;
      volume?: number;
    } = {}
  ): Promise<void> {
    try {
      const audioBlob = await this.synthesize({
        text,
        language: options.language || "es-ES",
        voice: options.voice || "es-ES-Wavenet-A",
        speed: options.speed || 1.0,
        pitch: options.pitch || 0.0,
      });

      this.playAudio(audioBlob, options.volume || 1.0); // Volumen máximo por defecto
    } catch (error) {
      throw new Error(`Error en síntesis y reproducción: ${error}`);
    }
  }
}

// Instancia singleton
export const googleTtsService = new GoogleTtsService();
