import { FC, useState, useRef, useEffect } from "react";
import { Megaphone } from "lucide-react";
import { KaraokeColors } from "../../colors";
import { Typography } from "./index";
import { TSongsRequested } from "../types/visits.types";

interface SongGreetingModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (song: TSongsRequested, greeting?: string) => void;
  song: TSongsRequested | null;
}

export const SongGreetingModal: FC<SongGreetingModalProps> = ({
  visible,
  onClose,
  onConfirm,
  song,
}) => {
  const [greetingText, setGreetingText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Autofocus cuando se abre el modal
  useEffect(() => {
    if (visible && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [visible]);

  // Resetear el texto cuando se abre/cierra el modal
  useEffect(() => {
    if (!visible) {
      setGreetingText("");
      setIsSending(false);
    }
  }, [visible]);

  const handleConfirm = async () => {
    if (!song) return;

    setIsSending(true);

    try {
      // Si hay texto de saludo, lo enviamos; si no, enviamos undefined
      const greeting = greetingText.trim() || undefined;
      await onConfirm(song, greeting);
      setGreetingText("");
    } catch (error) {
      console.error("❌ Error confirmando canción:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setGreetingText("");
    onClose();
  };

  if (!visible || !song) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center gap-2 mb-4">
          <Megaphone size={20} color={KaraokeColors.primary.primary500} />
          <Typography variant="body-lg-semi" color={KaraokeColors.base.white}>
            Agregar Canción
          </Typography>
        </div>

        {/* Información de la canción */}
        <div className="bg-gray-700 rounded-lg p-3 mb-4">
          <div className="flex gap-3">
            {song.thumbnail && (
              <img
                src={song.thumbnail}
                alt={song.title}
                className="w-12 h-12 rounded-lg object-cover"
              />
            )}
            <div className="flex-1 min-w-0">
              <Typography
                variant="body-sm-semi"
                color={KaraokeColors.base.white}
                className="line-clamp-2"
              >
                {song.title}
              </Typography>
              <Typography
                variant="body-sm"
                color={KaraokeColors.gray.gray400}
                className="mt-1"
              >
                {song.duration}
              </Typography>
            </div>
          </div>
        </div>

        <Typography
          variant="body-sm"
          color={KaraokeColors.gray.gray300}
          className="text-center mb-4"
        >
          ¿Quieres enviar un saludo antes de cantar? (Opcional)
        </Typography>

        <textarea
          ref={textareaRef}
          value={greetingText}
          onChange={(e) => setGreetingText(e.target.value)}
          placeholder="Escribe tu mensaje de saludo... (opcional)"
          className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 resize-none h-20 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
          maxLength={200}
        />

        <div className="flex justify-between items-center pt-2">
          <button
            onClick={handleClose}
            disabled={isSending}
            className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
          >
            <Typography variant="body-sm-semi" color={KaraokeColors.red.red400}>
              Cancelar
            </Typography>
          </button>

          <button
            onClick={handleConfirm}
            disabled={isSending}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <Typography variant="body-sm-semi" color={KaraokeColors.base.white}>
              {isSending ? "Agregando..." : "Agregar Canción"}
            </Typography>
          </button>
        </div>
      </div>
    </div>
  );
};
