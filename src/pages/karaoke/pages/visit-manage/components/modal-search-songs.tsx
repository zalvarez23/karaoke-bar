import { FC, useState, useEffect } from "react";
import { Search, X, Music, Clock, CheckCircle } from "lucide-react";
import { KaraokeColors } from "../../../colors";
import { Typography, Button, Input, Spinner } from "../../../shared/components";
import { TSongsRequested } from "../../../shared/types/visits.types";
import useDebounce from "../../../shared/hooks/useDebounce";
import { buildApiUrl, API_CONFIG } from "../config/api.config";
import { useReactPlayerValidation } from "@/shared/hooks/useReactPlayerValidation";
import { YouTubeVideoValidator } from "@/shared/components/YouTubeVideoValidator";

// Flag para habilitar/deshabilitar la validación de canciones
const ENABLE_SONG_VALIDATION = true; // Cambiar a false para deshabilitar validación

type ModalSearchSongsProps = {
  visible?: boolean;
  onClose: () => void;
  onSongSelected: (song: TSongsRequested, greeting?: string) => void;
};

export const ModalSearchSongs: FC<ModalSearchSongsProps> = ({
  visible,
  onClose,
  onSongSelected,
}) => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [songs, setSongs] = useState<TSongsRequested[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeSuggestion, setActiveSuggestion] = useState(true);
  const [isLoadingSongs, setIsLoadingSongs] = useState(false);
  const [showFallbackUI, setShowFallbackUI] = useState(false);
  const [manualSongText, setManualSongText] = useState("");
  const [greetingText, setGreetingText] = useState("");
  const [searchCounter, setSearchCounter] = useState(0); // Contador para forzar re-render de validadores
  // Estados para validación ReactPlayer (reemplazan la validación anterior)
  const {
    isValidating: isReactPlayerValidating,
    startValidation: startReactPlayerValidation,
    getValidationStatus,
    handleValidationComplete,
    resetValidation,
  } = useReactPlayerValidation();

  // Resetear todo cuando se abre el modal
  useEffect(() => {
    if (visible) {
      setSearch("");
      setSongs([]);
      setSuggestions([]);
      setActiveSuggestion(true);
      setIsLoadingSongs(false);
      setShowFallbackUI(false);
      setManualSongText("");
      setGreetingText("");
      resetValidation(); // Resetear validación ReactPlayer
    }
  }, [visible, resetValidation]);

  // Limpiar canciones y reactivar suggestions cuando se borra el texto
  useEffect(() => {
    if (search.trim() === "") {
      setSongs([]);
      setActiveSuggestion(true);
      setShowFallbackUI(false);
    }
  }, [search]);

  useEffect(() => {
    if (debouncedSearch.trim() !== "" && activeSuggestion) {
      handleSearchSuggestions(debouncedSearch);
    } else {
      setSuggestions([]);
    }
  }, [debouncedSearch, activeSuggestion]);

  const handleSearchSuggestions = async (query: string) => {
    try {
      const response = await fetch(
        buildApiUrl(API_CONFIG.ENDPOINTS.SUGGESTIONS, query)
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = (await response.json()) as {
        suggestions: string[];
      };
      setSuggestions(data?.suggestions || []);
    } catch (error) {
      console.error("❌ Error fetching suggestions:", error);
      setSuggestions([]);
    }
  };

  const handleSearchYoutube = async (query: string) => {
    if (isLoadingSongs) {
      return; // Evitar múltiples llamadas simultáneas
    }

    // Resetear validación anterior e incrementar contador
    resetValidation();
    setSearchCounter((prev) => prev + 1);

    // Agregar "karaoke" al final del query si no lo contiene
    const searchQuery = query.toLowerCase().includes("karaoke")
      ? query
      : `${query} karaoke`;

    setIsLoadingSongs(true);
    try {
      const response = await fetch(
        buildApiUrl(API_CONFIG.ENDPOINTS.SEARCH, searchQuery)
      );

      if (!response.ok) {
        try {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`
          );
        } catch {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const data = (await response.json()) as {
        success: boolean;
        data: TSongsRequested[];
        source: "youtube-search-api" | "googleapis-youtube";
        apiKeyUsed?: string;
        message?: string;
        timestamp: string;
      };

      console.log("✅ YouTube search successful:", {
        success: data.success,
        source: data.source,
        apiKeyUsed: data.apiKeyUsed,
        message: data.message,
        resultsCount: data.data?.length || 0,
        timestamp: data.timestamp,
        query: query,
      });

      if (data?.success && data.data && data.data.length > 0) {
        console.log("🎵 Setting songs:", data.data);

        // Mostrar canciones inmediatamente
        setSongs(data.data);
        setActiveSuggestion(false);

        // Iniciar validación ReactPlayer en segundo plano (solo si está habilitada)
        if (ENABLE_SONG_VALIDATION) {
          const urls = data.data.map((song) => song.id).filter(Boolean);
          if (urls.length > 0) {
            console.log(
              "🔍 Iniciando validación ReactPlayer para:",
              urls.length
            );
            startReactPlayerValidation(urls);
          }
        } else {
          console.log(
            "⚠️ Validación de canciones deshabilitada - mostrando todas las canciones"
          );
        }
      } else {
        setShowFallbackUI(true);
        setActiveSuggestion(false);
        setManualSongText(query);
      }
    } catch (error) {
      console.error("❌ Error fetching songs:", error);
      setShowFallbackUI(true);
      setActiveSuggestion(false);
      setManualSongText(query);
    } finally {
      setIsLoadingSongs(false);
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setSearch(suggestion);
    setActiveSuggestion(false);
    handleSearchYoutube(suggestion);
  };

  const handleManualSongSubmit = () => {
    if (manualSongText.trim()) {
      const manualSong: TSongsRequested = {
        id: `manual-${Date.now()}`,
        title: manualSongText.trim(),
        description: "Canción agregada manualmente",
        thumbnail: "",
        duration: "0:00",
        note: "",
        round: 1,
        numberSong: 1,
        date: new Date(),
        status: "pending",
      };
      onSongSelected(manualSong, greetingText.trim() || undefined);
      onClose();
    }
  };

  const handleSongSelect = (song: TSongsRequested) => {
    onSongSelected(song, greetingText.trim() || undefined);
    onClose();
  };

  const handleBackToSuggestions = () => {
    setSongs([]);
    setShowFallbackUI(false);
    setActiveSuggestion(true);
    setManualSongText("");
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className="w-full h-full bg-gray-900 overflow-hidden relative flex flex-col border border-gray-700"
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
          paddingLeft: "env(safe-area-inset-left)",
          paddingRight: "env(safe-area-inset-right)",
        }}
      >
        {/* Header Fixed */}
        <div
          className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 px-6 border-b border-gray-700 bg-gray-900"
          style={{
            paddingTop: "calc(1rem + env(safe-area-inset-top))",
            paddingLeft: "calc(1.5rem + env(safe-area-inset-left))",
            paddingRight: "calc(1.5rem + env(safe-area-inset-right))",
          }}
        >
          <Typography
            variant="headline-sm-semi"
            color={KaraokeColors.base.white}
          >
            Buscar canciones
          </Typography>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded-full transition-colors"
          >
            <X size={24} color={KaraokeColors.base.white} />
          </button>
        </div>

        {/* Content con scroll y padding-top para el header */}
        <div
          className="flex-1 overflow-y-auto p-4 px-6 pt-20"
          style={{
            paddingLeft: "calc(1.5rem + env(safe-area-inset-left))",
            paddingRight: "calc(1.5rem + env(safe-area-inset-right))",
            paddingBottom: "calc(1rem + env(safe-area-inset-bottom))",
          }}
        >
          {/* Greeting Input */}
          <div className="mb-4">
            <textarea
              value={greetingText}
              onChange={(e) => setGreetingText(e.target.value)}
              placeholder="Escribe aquí un saludo, dedicatoria o mensaje especial..."
              className="w-full bg-gray-800 border-2 border-purple-500 rounded-lg p-3 text-white placeholder-gray-400 resize-none h-22 focus:outline-none focus:ring-2 focus:ring-purple-500 animate-blink"
              maxLength={200}
            />
          </div>

          {/* Search Input */}
          <div className="mb-4">
            <Input
              value={search}
              placeholder="Ingresa tu canción favorita..."
              onChangeText={setSearch}
              customIcon={
                <Search size={20} color={KaraokeColors.primary.primary500} />
              }
              className="w-full"
              autoFocus={visible}
            />
          </div>

          {/* Loading State */}
          {isLoadingSongs && (
            <div className="flex items-center justify-center py-8">
              <Spinner size={40} color={KaraokeColors.primary.primary500} />
              <Typography
                variant="body-md"
                color={KaraokeColors.gray.gray400}
                className="ml-3"
              >
                Buscando canciones...
              </Typography>
            </div>
          )}

          {/* Suggestions */}
          {activeSuggestion && suggestions.length > 0 && !isLoadingSongs && (
            <div className="mb-4">
              <div className="space-y-1">
                {suggestions.slice(0, 5).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className="w-full text-left p-3 bg-base-darkPrimary hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <Typography
                      variant="body-sm"
                      color={KaraokeColors.base.white}
                    >
                      {suggestion}
                    </Typography>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Button */}
          {search.trim() && !isLoadingSongs && (
            <div className="mb-4">
              <Button
                onClick={() => handleSearchYoutube(search)}
                fullWidth
                theme="primary"
                isLoading={isLoadingSongs}
              >
                <Search size={20} className="mr-2" />
                <Typography
                  variant="body-md-semi"
                  color={KaraokeColors.base.white}
                >
                  Buscar
                </Typography>
              </Button>
            </div>
          )}

          {/* Songs Results */}
          {songs.length > 0 && !isLoadingSongs && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Typography
                    variant="body-sm-semi"
                    color={KaraokeColors.gray.gray300}
                  >
                    Resultados (
                    {ENABLE_SONG_VALIDATION
                      ? songs.filter(
                          (song) =>
                            getValidationStatus(song.id) !== "unavailable"
                        ).length
                      : songs.length}
                    )
                  </Typography>
                  {ENABLE_SONG_VALIDATION && isReactPlayerValidating && (
                    <div className="flex items-center gap-1">
                      <Spinner
                        size={12}
                        color={KaraokeColors.primary.primary500}
                      />
                      <Typography
                        variant="body-sm"
                        color={KaraokeColors.gray.gray400}
                      >
                        Validando disponibilidad...
                      </Typography>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleBackToSuggestions}
                  className="text-sm text-purple-400 hover:text-purple-300"
                >
                  ← Volver
                </button>
              </div>

              <div className="space-y-2">
                {songs
                  .filter((song) => {
                    if (!ENABLE_SONG_VALIDATION) {
                      // Si la validación está deshabilitada, mostrar todas las canciones
                      return true;
                    }
                    const validationStatus = getValidationStatus(song.id);
                    // Mostrar solo canciones disponibles o en validación
                    return validationStatus !== "unavailable";
                  })
                  .map((song, index) => {
                    const validationStatus = getValidationStatus(song.id);

                    const isAvailable = ENABLE_SONG_VALIDATION
                      ? validationStatus === "available"
                      : true; // Si la validación está deshabilitada, todas las canciones son clickeables

                    return (
                      <div
                        key={`${song.id}-${index}`}
                        className={`rounded-lg p-3 select-none touch-manipulation transition-all ${
                          isAvailable
                            ? "cursor-pointer bg-base-darkPrimary hover:bg-gray-600"
                            : "cursor-not-allowed bg-base-darkPrimary opacity-60"
                        }`}
                        style={{
                          WebkitTouchCallout: "none",
                          WebkitUserSelect: "none",
                          WebkitTapHighlightColor: "transparent",
                          outline: "none",
                        }}
                        onClick={() => isAvailable && handleSongSelect(song)}
                      >
                        <div className="flex gap-5 items-center">
                          {song.thumbnail && (
                            <img
                              src={song.thumbnail}
                              alt={song.title}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Typography
                                variant="body-sm"
                                color={KaraokeColors.base.white}
                                className="line-clamp-2"
                              >
                                {song.title}
                              </Typography>
                              {ENABLE_SONG_VALIDATION && (
                                <div className="flex items-center gap-1">
                                  {validationStatus === "available" ? (
                                    <CheckCircle size={14} color="#10B981" />
                                  ) : validationStatus === "validating" ? (
                                    <Spinner
                                      size={12}
                                      color={KaraokeColors.primary.primary500}
                                    />
                                  ) : (
                                    <Clock
                                      size={12}
                                      color={KaraokeColors.gray.gray500}
                                    />
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock
                                size={12}
                                color={KaraokeColors.gray.gray500}
                              />
                              <Typography
                                variant="body-sm"
                                color={KaraokeColors.gray.gray500}
                              >
                                {song.duration}
                              </Typography>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Music
                              size={16}
                              color={KaraokeColors.primary.primary400}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Fallback UI */}
          {showFallbackUI && !isLoadingSongs && (
            <div className="text-center py-8">
              <Music
                size={48}
                color={KaraokeColors.gray.gray500}
                className="mx-auto mb-4"
              />
              <Typography
                variant="body-md-semi"
                color={KaraokeColors.base.white}
                className="mb-2"
              >
                No se encontraron canciones
              </Typography>
              <Typography
                variant="body-sm"
                color={KaraokeColors.gray.gray400}
                className="mb-4"
              >
                ¿Quieres agregar "{manualSongText}" manualmente?
              </Typography>
              <div className="flex gap-3">
                <Button
                  onClick={handleBackToSuggestions}
                  theme="secondary"
                  appearance="outline"
                  fullWidth
                >
                  Buscar otra
                </Button>
                <Button
                  onClick={handleManualSongSubmit}
                  theme="primary"
                  fullWidth
                >
                  Agregar Manualmente
                </Button>
              </div>
            </div>
          )}

          {/* Validadores ReactPlayer ocultos para cada canción (solo si está habilitada la validación) */}
          {ENABLE_SONG_VALIDATION &&
            songs.map((song, index) => {
              const validationStatus = getValidationStatus(song.id);
              const isCurrentlyValidating = validationStatus === "validating";
              return (
                <YouTubeVideoValidator
                  key={`validator-${searchCounter}-${song.id}-${index}`}
                  videoUrl={song.id}
                  videoId={song.id}
                  onValidationComplete={(result) => {
                    handleValidationComplete(result, song.id);
                  }}
                  onValidationStart={() => {
                    console.log(`🔍 Iniciando validación para: ${song.title}`);
                  }}
                  autoStart={true}
                  isActive={isCurrentlyValidating}
                />
              );
            })}
        </div>
      </div>
    </div>
  );
};
