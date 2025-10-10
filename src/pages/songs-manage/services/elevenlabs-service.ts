import axios from "axios";

export class ElevenLabsService {
  private apiKeys: string[];
  private currentKeyIndex: number = 0;
  private baseUrl: string = "https://api.elevenlabs.io/v1";

  // Array de voces latinas femeninas
  private artistVoices = ["CR1lq7ib1ppidMQ84stE"];

  // Array de voces latinas masculinas (para opción futura)

  constructor() {
    // Array de API keys con fallback
    this.apiKeys = [
      "sk_63c88917e29d931461411b03815cd3792af1832cf26553f8",
    ].filter((key) => key !== ""); // Filtrar keys vacías
  }

  // Método para obtener la API key actual
  private getCurrentApiKey(): string {
    if (this.apiKeys.length === 0) {
      throw new Error("No hay API keys configuradas");
    }
    return this.apiKeys[this.currentKeyIndex];
  }

  // Método para cambiar a la siguiente API key en caso de fallo
  private switchToNextApiKey(): boolean {
    if (this.currentKeyIndex < this.apiKeys.length - 1) {
      this.currentKeyIndex++;
      console.log(
        `🔄 Cambiando a API key de respaldo (${this.currentKeyIndex + 1}/${
          this.apiKeys.length
        })`
      );
      return true;
    }
    console.log("❌ No hay más API keys disponibles");
    return false;
  }

  // Método para obtener una voz aleatoria
  private getRandomVoice(): string {
    const randomIndex = Math.floor(Math.random() * this.artistVoices.length);
    const selectedVoice = this.artistVoices[randomIndex];
    console.log(`🎲 Voz natural aleatoria seleccionada: ${selectedVoice}`);
    return selectedVoice;
  }

  async textToSpeech(
    text: string,
    voiceId?: string // Ahora es opcional
  ): Promise<Blob> {
    let lastError: Error | null = null;

    // Intentar con cada API key hasta que una funcione
    for (let attempt = 0; attempt < this.apiKeys.length; attempt++) {
      try {
        const currentApiKey = this.getCurrentApiKey();

        if (!currentApiKey) {
          throw new Error("ElevenLabs API key no configurada");
        }

        // Usar voz aleatoria si no se especifica una
        const selectedVoiceId = voiceId || this.getRandomVoice();

        const response = await axios.post(
          `${this.baseUrl}/text-to-speech/${selectedVoiceId}`,
          {
            text: text,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.7,
              style: 0.5,
              use_speaker_boost: true,
            },
          },
          {
            headers: {
              Accept: "audio/mpeg",
              "Content-Type": "application/json",
              "xi-api-key": currentApiKey,
            },
            responseType: "blob",
          }
        );

        // Si llegamos aquí, la API key funcionó
        return response.data;
      } catch (error) {
        lastError = error as Error;
        console.error(
          `❌ Error con API key ${this.currentKeyIndex + 1}:`,
          error
        );

        // Intentar con la siguiente API key si está disponible
        if (!this.switchToNextApiKey()) {
          // No hay más API keys disponibles
          break;
        }
      }
    }

    // Si llegamos aquí, todas las API keys fallaron
    console.error("❌ Todas las API keys fallaron");
    throw lastError || new Error("Error generando audio con ElevenLabs");
  }

  async getAvailableVoices(): Promise<unknown[]> {
    let lastError: Error | null = null;

    // Intentar con cada API key hasta que una funcione
    for (let attempt = 0; attempt < this.apiKeys.length; attempt++) {
      try {
        const currentApiKey = this.getCurrentApiKey();

        if (!currentApiKey) {
          throw new Error("ElevenLabs API key no configurada");
        }

        const response = await axios.get(`${this.baseUrl}/voices`, {
          headers: {
            "xi-api-key": currentApiKey,
          },
        });

        return response.data.voices;
      } catch (error) {
        lastError = error as Error;
        console.error(
          `❌ Error obteniendo voces con API key ${this.currentKeyIndex + 1}:`,
          error
        );

        // Intentar con la siguiente API key si está disponible
        if (!this.switchToNextApiKey()) {
          // No hay más API keys disponibles
          break;
        }
      }
    }

    // Si llegamos aquí, todas las API keys fallaron
    console.error("❌ Todas las API keys fallaron al obtener voces");
    throw lastError || new Error("Error obteniendo voces de ElevenLabs");
  }

  // Obtener voces masculinas suaves/afeminadas disponibles
  async getSoftMaleVoices(): Promise<unknown[]> {
    let lastError: Error | null = null;

    // Intentar con cada API key hasta que una funcione
    for (let attempt = 0; attempt < this.apiKeys.length; attempt++) {
      try {
        const currentApiKey = this.getCurrentApiKey();

        if (!currentApiKey) {
          throw new Error("ElevenLabs API key no configurada");
        }

        const response = await axios.get(`${this.baseUrl}/voices`, {
          headers: {
            "xi-api-key": currentApiKey,
          },
        });

        // Filtrar voces masculinas suaves
        const softMaleVoices = response.data.voices.filter((voice: unknown) => {
          const voiceData = voice as {
            labels?: { gender?: string; accent?: string };
          };
          return (
            voiceData.labels?.gender === "male" &&
            (voiceData.labels?.accent?.toLowerCase().includes("soft") ||
              voiceData.labels?.accent?.toLowerCase().includes("gentle") ||
              voiceData.labels?.accent?.toLowerCase().includes("warm"))
          );
        });

        return softMaleVoices;
      } catch (error) {
        lastError = error as Error;
        console.error(
          `❌ Error obteniendo voces suaves con API key ${
            this.currentKeyIndex + 1
          }:`,
          error
        );

        // Intentar con la siguiente API key si está disponible
        if (!this.switchToNextApiKey()) {
          // No hay más API keys disponibles
          break;
        }
      }
    }

    // Si llegamos aquí, todas las API keys fallaron
    console.error("❌ Todas las API keys fallaron al obtener voces suaves");
    throw lastError || new Error("Error obteniendo voces masculinas suaves");
  }

  // Método para reproducir audio desde un Blob
  playAudio(audioBlob: Blob, playbackRate: number = 1.1): void {
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    // Configurar velocidad de reproducción
    audio.playbackRate = playbackRate;

    audio.onended = () => {
      URL.revokeObjectURL(audioUrl); // Limpiar memoria
    };

    audio.play().catch((error) => {
      console.error("Error reproduciendo audio:", error);
    });
  }
}
