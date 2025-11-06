import React, { useEffect, useState, useCallback } from "react";
import { DataTable } from "./components/data-table";
import { columns } from "./components/columns";
import { AddSongsModal } from "./components/add-songs-modal";
import {
  TSongsRequested,
  TSongStatus,
  TVisitResponseDto,
} from "@/shared/types/visit-types";
import { SongsServices } from "./services/songs-services";
import { ElevenLabsService } from "./services/elevenlabs-service";
import { googleTtsService } from "./services/google-tts-service";
import {
  TTS_CONFIG,
  getRandomVoice,
  improveTextForTTS,
} from "../layout/config/tts-config";
import { VisitsServices } from "../visits-manage/services/visits-services";

export const SongsManagePage: React.FC = () => {
  const [songs, setSongs] = useState<TVisitResponseDto>();
  const [loading, setLoading] = useState(true);
  const [showAddSongsModal, setShowAddSongsModal] = useState(false);

  const songsServices = useCallback(() => new SongsServices(), []);
  const visitsServices = useCallback(() => new VisitsServices(), []);
  const elevenLabsService = useCallback(() => new ElevenLabsService(), []);

  useEffect(() => {
    const unsubscribe = songsServices().getAllSongsOnSnapshot((data) => {
      setSongs(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [songsServices]);

  return (
    <div className="container mx-auto bg-gray-900 text-white min-h-full">
      <DataTable<TSongsRequested, unknown>
        columns={columns({
          onOpenYouTube: (song: TSongsRequested) => {
            // Verificar si el ID es un link de YouTube válido
            const isYouTubeLink =
              song.id.startsWith("http") && song.id.includes("youtube.com");

            if (isYouTubeLink) {
              // Si es un link válido, abrirlo directamente
              window.open(song.id, "_blank");
            } else {
              // Si no es un link válido, buscar en YouTube con el título de la canción
              const searchQuery = encodeURIComponent(song.title);
              const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;
              window.open(youtubeSearchUrl, "_blank");
            }
          },
          onPlaySong: async (
            songId: string,
            visitId: string,
            numberSong: number
          ) => {
            // Si la canción está en "pending", la cambiamos a "singing"
            // Si la canción está en "singing", la cambiamos a "completed"
            const currentSong = songs?.songs?.find(
              (song) => song.id === songId && song.numberSong === numberSong
            );

            if (currentSong) {
              const songStatus = currentSong.status as TSongStatus;

              if (songStatus === "pending") {
                // Primero, completar cualquier canción que esté cantando actualmente
                const currentlySinging = songs?.songs?.find(
                  (song) => (song.status as TSongStatus) === "singing"
                );

                if (currentlySinging) {
                  await visitsServices().updateSongStatus(
                    currentlySinging.visitId,
                    currentlySinging.id,
                    currentlySinging.numberSong,
                    "completed"
                  );
                }

                // Luego, cambiar la nueva canción a "singing"
                await visitsServices().updateSongStatus(
                  visitId,
                  songId,
                  numberSong,
                  "singing"
                );
              } else if (songStatus === "singing") {
                // Cambiar a "completed"
                await visitsServices().updateSongStatus(
                  visitId,
                  songId,
                  numberSong,
                  "completed"
                );
              }
            }
          },
          onCancelSong: async (
            songId: string,
            visitId: string,
            numberSong: number
          ) => {
            // Permitir eliminar canciones que estén en estado "pending" o "singing"
            const currentSong = songs?.songs?.find(
              (song) => song.id === songId && song.numberSong === numberSong
            );

            if (
              currentSong &&
              ((currentSong.status as TSongStatus) === "pending" ||
                (currentSong.status as TSongStatus) === "singing")
            ) {
              // Eliminar la canción del array de la visita
              await visitsServices().removeSongFromVisit(
                visitId,
                songId,
                numberSong
              );
            }
          },
          onPlayGreeting: async (greeting: string) => {
            try {
              // 🎤 1. Intentar ElevenLabs primero (mejor calidad)
              console.log("🎤 Intentando ElevenLabs primero para saludo");
              try {
                const audioBlob = await elevenLabsService().textToSpeech(
                  greeting
                );
                elevenLabsService().playAudio(
                  audioBlob,
                  TTS_CONFIG.elevenlabs.rate
                );
                return; // Éxito, salir de la función
              } catch (elevenLabsError) {
                console.log(
                  "❌ ElevenLabs falló para saludo, intentando Google TTS:",
                  elevenLabsError
                );
              }

              // 🎤 2. Fallback a Google Cloud TTS
              console.log(
                "🎤 Usando Google Cloud TTS como fallback para saludo"
              );
              const randomVoice = getRandomVoice();
              console.log("🎲 Voz seleccionada:", randomVoice);

              // Mejorar el texto para mejor pronunciación
              const improvedGreeting = improveTextForTTS(greeting);
              console.log("📝 Texto mejorado:", improvedGreeting);

              await googleTtsService.synthesizeAndPlay(improvedGreeting, {
                ...TTS_CONFIG.google,
                voice: randomVoice,
              });
            } catch (error) {
              console.error("❌ Error reproduciendo saludo:", error);

              // 🔄 Fallback a Web Speech API si el servicio principal falla
              if ("speechSynthesis" in window) {
                console.log("🔄 Usando fallback: Web Speech API");
                const utterance = new SpeechSynthesisUtterance(greeting);
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
                    console.log(
                      "No se encontró voz femenina, usando voz por defecto"
                    );
                  }

                  speechSynthesis.speak(utterance);
                });
              }
            }
          },
        })}
        data={songs?.songs || []}
        loading={loading}
        onAddSongs={() => setShowAddSongsModal(true)}
      />

      {/* Modal para agregar canciones */}
      <AddSongsModal
        visible={showAddSongsModal}
        onClose={() => setShowAddSongsModal(false)}
        onSongsAdded={(newSongs) => {
          console.log("Canciones agregadas:", newSongs);
        }}
      />
    </div>
  );
};
