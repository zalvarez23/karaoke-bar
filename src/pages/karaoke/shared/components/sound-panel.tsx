import React, { useState } from "react";
import { X, Play, Volume2 } from "lucide-react";
import { KaraokeColors } from "../../colors";
import { Button } from "../../../../shared/components/ui/button";
import Typography from "./typography";

interface SoundItem {
  id: string;
  name: string;
  description?: string;
}

interface SoundCategory {
  id: string;
  name: string;
  character: string;
  sounds: SoundItem[];
}

interface SoundPanelProps {
  visible: boolean;
  onClose: () => void;
}

const SOUND_CATEGORIES: SoundCategory[] = [
  {
    id: "karaoke-sonidos",
    name: "Karaoke Sonidos",
    character: "🎤",
    sounds: [
      {
        id: "aplausos/aplausos_TyJ2iVv",
        name: "Aplausos 1",
        description: "Aplausos de audiencia",
      },
      {
        id: "aplausos/aplausos-1_GrqkPux",
        name: "Aplausos 2",
        description: "Aplausos entusiastas",
      },
      {
        id: "aplausos/aplausos-eric-andre",
        name: "Aplausos Eric Andre",
        description: "Aplausos estilo show",
      },
      {
        id: "aplausos/transicion-musica-y-aplausos",
        name: "Transición Música y Aplausos",
        description: "Transición musical con aplausos",
      },
      {
        id: "aplausos/mostacero",
        name: "Mostacero",
        description: "Expresión característica",
      },
      {
        id: "aplausos/que-rricoh-eh",
        name: "¡Qué rico eh!",
        description: "Expresión de satisfacción",
      },
    ],
  },
  {
    id: "melcochita",
    name: "Melcochita",
    character: "🎭",
    sounds: [
      {
        id: "melcochita/apurate-oye-gusaano-tierno-melcocha",
        name: "Apúrate oye gusaano tierno",
        description: "Frase característica",
      },
      {
        id: "melcochita/full-no-melcocha",
        name: "Full no",
        description: "Expresión de negación",
      },
      {
        id: "melcochita/melcocha-a-ver-quiero-ver",
        name: "A ver, quiero ver",
        description: "Curiosidad",
      },
      {
        id: "melcochita/melcocha-alpaca",
        name: "Alpaca",
        description: "Referencia animal",
      },
      {
        id: "melcochita/melcocha-basura",
        name: "Basura",
        description: "Expresión de desaprobación",
      },
      {
        id: "melcochita/melcocha-bonito",
        name: "Bonito",
        description: "Elogio",
      },
      {
        id: "melcochita/melcocha-concurso",
        name: "Concurso",
        description: "Referencia a competencia",
      },
      {
        id: "melcochita/melcocha-talon",
        name: "Talón",
        description: "Expresión casual",
      },
      {
        id: "melcochita/melcocha-vuelve-a-tu-jaula",
        name: "Vuelve a tu jaula",
        description: "Frase icónica",
      },
    ],
  },
];

export const SoundPanel: React.FC<SoundPanelProps> = ({ visible, onClose }) => {
  const [activeTab, setActiveTab] = useState<string>("karaoke-sonidos");
  const [playingSound, setPlayingSound] = useState<string | null>(null);

  const activeCategory = SOUND_CATEGORIES.find((cat) => cat.id === activeTab);

  const handlePlaySound = (sound: SoundItem, category: SoundCategory) => {
    try {
      // Marcar como reproduciendo
      setPlayingSound(sound.id);

      // Crear una instancia de Audio con el archivo MP3
      const audio = new Audio(`/audios/${sound.id}.mp3`);

      // Configurar el volumen (opcional)
      audio.volume = 0.8;

      // Event listeners para el audio
      audio.onended = () => {
        setPlayingSound(null);
      };

      audio.onerror = () => {
        setPlayingSound(null);
        console.error("Error reproduciendo el sonido");
        alert(
          `🎵 Error reproduciendo: "${sound.name}" de ${category.name}\n${
            sound.description || ""
          }`
        );
      };

      // Reproducir el sonido
      audio.play().catch((error) => {
        setPlayingSound(null);
        console.error("Error reproduciendo el sonido:", error);
        // Fallback: mostrar alerta si no se puede reproducir
        alert(
          `🎵 Error reproduciendo: "${sound.name}" de ${category.name}\n${
            sound.description || ""
          }`
        );
      });

      // Log para debugging
      console.log(`🎵 Reproduciendo: "${sound.name}" de ${category.name}`);
    } catch (error) {
      setPlayingSound(null);
      console.error("Error creando el audio:", error);
      alert(
        `🎵 Error reproduciendo: "${sound.name}" de ${category.name}\n${
          sound.description || ""
        }`
      );
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
        style={{ backgroundColor: KaraokeColors.base.darkPrimary }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Volume2 size={24} color={KaraokeColors.base.white} />
            <Typography
              variant="headline-lg-semi"
              color={KaraokeColors.base.white}
            >
              Panel de Sonidos
            </Typography>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
          >
            <X size={24} color={KaraokeColors.base.white} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          {SOUND_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveTab(category.id)}
              className={`flex-1 px-6 py-4 text-center transition-colors ${
                activeTab === category.id ? "border-b-2" : "hover:bg-gray-800"
              }`}
              style={{
                borderBottomColor:
                  activeTab === category.id
                    ? KaraokeColors.base.secondary
                    : "transparent",
                backgroundColor:
                  activeTab === category.id
                    ? "rgba(196, 155, 94, 0.1)"
                    : "transparent",
              }}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl">{category.character}</span>
                <Typography
                  variant="body-lg-semi"
                  color={KaraokeColors.base.white}
                >
                  {category.name}
                </Typography>
              </div>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeCategory && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeCategory.sounds.map((sound) => (
                <div
                  key={sound.id}
                  className={`bg-gray-800 rounded-xl p-4 hover:bg-gray-700 transition-colors cursor-pointer group ${
                    playingSound === sound.id
                      ? "ring-2 ring-base-secondary"
                      : ""
                  }`}
                  onClick={() => handlePlaySound(sound, activeCategory)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <Typography
                        variant="body-md-semi"
                        color={KaraokeColors.base.white}
                        className="mb-1"
                      >
                        {sound.name}
                        {playingSound === sound.id && (
                          <span className="ml-2 text-base-secondary animate-pulse">
                            🔊
                          </span>
                        )}
                      </Typography>
                      {sound.description && (
                        <Typography
                          variant="body-sm"
                          color={KaraokeColors.gray.gray300}
                        >
                          {sound.description}
                        </Typography>
                      )}
                    </div>
                    <div className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play size={20} color={KaraokeColors.base.secondary} />
                    </div>
                  </div>

                  {/* Play button overlay */}
                  <div className="flex justify-center">
                    <div
                      className={`bg-base-secondary rounded-full p-3 transition-opacity ${
                        playingSound === sound.id
                          ? "opacity-100 animate-pulse"
                          : "opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      <Play size={16} color="white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <Typography variant="body-sm" color={KaraokeColors.gray.gray400}>
              Selecciona un sonido para reproducirlo
            </Typography>
            <Button variant="secondary" size="sm" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
