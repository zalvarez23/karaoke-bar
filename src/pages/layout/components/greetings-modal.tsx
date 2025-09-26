import React, { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Megaphone, Volume2, Loader2 } from "lucide-react";
import { ElevenLabsService } from "@/pages/songs-manage/services/elevenlabs-service";
import { googleTtsService } from "@/pages/songs-manage/services/google-tts-service";
import {
  USE_GOOGLE_TTS,
  TTS_CONFIG,
  getRandomVoice,
  improveTextForTTS,
} from "../config/tts-config";
import { Modal } from "@/shared/components/ui/modal";

interface GreetingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GreetingsModal: React.FC<GreetingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [message, setMessage] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Reutilizar el servicio de ElevenLabs del song manager
  const elevenLabsService = useCallback(() => new ElevenLabsService(), []);

  // Autofocus cuando se abre el modal
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    // Detener cualquier reproducción de audio en curso
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();
    }

    setIsPlaying(false);
    setIsLoading(false);
    setMessage("");
    onClose();
  }, [onClose]);

  const handleSendGreeting = async () => {
    if (!message.trim() || isLoading || isPlaying) return;

    setIsLoading(true);
    setIsPlaying(true);

    try {
      if (USE_GOOGLE_TTS) {
        // 🎤 Usar Google Cloud TTS (nuevo servicio)
        console.log("🎤 Usando Google Cloud TTS");
        const randomVoice = getRandomVoice();
        console.log("🎲 Voz seleccionada:", randomVoice);

        // Mejorar el texto para mejor pronunciación
        const improvedMessage = improveTextForTTS(message);
        console.log("📝 Texto mejorado:", improvedMessage);

        await googleTtsService.synthesizeAndPlay(improvedMessage, {
          ...TTS_CONFIG.google,
          voice: randomVoice,
        });

        // Simular el tiempo de reproducción para actualizar el estado
        setTimeout(() => {
          setIsPlaying(false);
        }, message.length * 100);
      } else {
        // 🎤 Usar ElevenLabs (servicio original)
        console.log("🎤 Usando ElevenLabs");
        const audioBlob = await elevenLabsService().textToSpeech(message);
        elevenLabsService().playAudio(audioBlob, TTS_CONFIG.elevenlabs.volume);

        // Simular el tiempo de reproducción para actualizar el estado
        setTimeout(() => {
          setIsPlaying(false);
        }, message.length * 100);
      }
    } catch (error) {
      console.error("❌ Error enviando saludo:", error);

      // 🔄 Fallback a Web Speech API si el servicio principal falla
      if ("speechSynthesis" in window) {
        console.log("🔄 Usando fallback: Web Speech API");
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = TTS_CONFIG.webSpeech.language;
        utterance.rate = TTS_CONFIG.webSpeech.rate;
        utterance.pitch = TTS_CONFIG.webSpeech.pitch;
        utterance.volume = TTS_CONFIG.webSpeech.volume;

        // Obtener voz femenina si está disponible
        const getVoicesWithDelay = () => {
          return new Promise<SpeechSynthesisVoice[]>((resolve) => {
            let voices = speechSynthesis.getVoices();
            if (voices.length > 0) {
              resolve(voices);
            } else {
              setTimeout(() => {
                voices = speechSynthesis.getVoices();
                resolve(voices);
              }, 100);
            }
          });
        };

        getVoicesWithDelay().then((voices) => {
          const femaleVoice = voices.find(
            (voice) =>
              voice.lang.includes("es") &&
              voice.name.toLowerCase().includes("female")
          );

          if (femaleVoice) {
            utterance.voice = femaleVoice;
          } else {
            console.log("No se encontró voz femenina, usando voz por defecto");
          }

          speechSynthesis.speak(utterance);
        });

        // Actualizar estado cuando termine la reproducción
        utterance.onend = () => {
          setIsPlaying(false);
        };
      } else {
        setIsPlaying(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Megaphone className="h-5 w-5 text-blue-600" />
            Enviar Saludo
          </h2>

          {/* Indicador de servicio TTS */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Usando:</span>
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${
                USE_GOOGLE_TTS
                  ? "bg-green-100 text-green-700"
                  : "bg-purple-100 text-purple-700"
              }`}
            >
              {USE_GOOGLE_TTS ? "Google TTS" : "ElevenLabs"}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Mensaje del saludo:
            </label>
            <Textarea
              ref={textareaRef}
              placeholder="Escribe tu saludo aquí..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="resize-none"
              disabled={isLoading || isPlaying}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSendGreeting}
              disabled={!message.trim() || isLoading || isPlaying}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : isPlaying ? (
                <>
                  <Volume2 className="h-4 w-4 mr-2" />
                  Reproduciendo...
                </>
              ) : (
                <>
                  <Megaphone className="h-4 w-4 mr-2" />
                  Enviar Saludo
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
