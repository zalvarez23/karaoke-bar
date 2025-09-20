import axios from "axios";

export class ElevenLabsService {
  private apiKey: string;
  private baseUrl: string = "https://api.elevenlabs.io/v1";

  // Array de voces más naturales y realistas
  private artistVoices = [
    "EXAVITQu4vr4xnSDxMaL", // Bella (voz femenina suave)
    "pNInz6obpgDQGcFmaJgB", // Adam (voz masculina madura)
    "yoZ06aMxZJJ28mfd3POQ", // Charlie (voz masculina clara)
    // "ThT5KcBeYPX3keUQqHPh", // Clyde (voz masculina profunda)
  ];

  constructor() {
    // Obtener la API key desde variables de entorno o config
    this.apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY || "";
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
    try {
      if (!this.apiKey) {
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
            similarity_boost: 0.5,
            style: 0.0,
            use_speaker_boost: true,
          },
        },
        {
          headers: {
            Accept: "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": this.apiKey,
          },
          responseType: "blob",
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error generando audio con ElevenLabs:", error);
      throw error;
    }
  }

  async getAvailableVoices(): Promise<unknown[]> {
    try {
      if (!this.apiKey) {
        throw new Error("ElevenLabs API key no configurada");
      }

      const response = await axios.get(`${this.baseUrl}/voices`, {
        headers: {
          "xi-api-key": this.apiKey,
        },
      });

      return response.data.voices;
    } catch (error) {
      console.error("Error obteniendo voces de ElevenLabs:", error);
      throw error;
    }
  }

  // Obtener voces masculinas suaves/afeminadas disponibles
  async getSoftMaleVoices(): Promise<unknown[]> {
    try {
      if (!this.apiKey) {
        throw new Error("ElevenLabs API key no configurada");
      }

      const response = await axios.get(`${this.baseUrl}/voices`, {
        headers: {
          "xi-api-key": this.apiKey,
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
      console.error("Error obteniendo voces masculinas suaves:", error);
      throw error;
    }
  }

  // Método para reproducir audio desde un Blob
  playAudio(audioBlob: Blob, playbackRate: number = 0.6): void {
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
