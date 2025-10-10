import { FC, useState, useEffect, useRef } from "react";
import { Search, X, Music, Clock } from "lucide-react";
import { KaraokeColors } from "../../../colors";
import { Typography, Button, Input, Spinner } from "../../../shared/components";
import { TSongsRequested } from "../../../shared/types/visits.types";
import useDebounce from "../../../shared/hooks/useDebounce";
import { buildApiUrl, API_CONFIG } from "../config/api.config";
import { SongGreetingModal } from "../../../shared/components/song-greeting-modal";

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
  const [showGreetingModal, setShowGreetingModal] = useState(false);
  const [selectedSong, setSelectedSong] = useState<TSongsRequested | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
      setShowGreetingModal(false);
      setSelectedSong(null);

      // Autofocus al input cuando se abre el modal
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  }, [visible]);

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
        setSongs(data.data);
        setActiveSuggestion(false);
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
      setSelectedSong(manualSong);
      setShowGreetingModal(true);
    }
  };

  const handleSongSelect = (song: TSongsRequested) => {
    setSelectedSong(song);
    setShowGreetingModal(true);
  };

  const handleBackToSuggestions = () => {
    setSongs([]);
    setShowFallbackUI(false);
    setActiveSuggestion(true);
    setManualSongText("");
  };

  const handleGreetingConfirm = (song: TSongsRequested, greeting?: string) => {
    onSongSelected(song, greeting);
    setShowGreetingModal(false);
    setSelectedSong(null);
    onClose();
  };

  const handleGreetingClose = () => {
    setShowGreetingModal(false);
    setSelectedSong(null);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
      <div className="w-full h-[80vh] bg-gray-900 rounded-t-lg overflow-hidden flex flex-col border border-gray-700 px-2">
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-2 pl-5  border-b border-gray-700 flex-shrink-0">
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Search Input */}
          <div className="mb-4">
            <Input
              ref={inputRef}
              value={search}
              placeholder="Ingresa tu canción favorita..."
              onChangeText={setSearch}
              customIcon={
                <Search size={20} color={KaraokeColors.primary.primary500} />
              }
              className="w-full"
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
                <Typography
                  variant="body-sm-semi"
                  color={KaraokeColors.gray.gray300}
                >
                  Resultados ({songs.length})
                </Typography>
                <button
                  onClick={handleBackToSuggestions}
                  className="text-sm text-purple-400 hover:text-purple-300"
                >
                  ← Volver
                </button>
              </div>

              <div className="space-y-2  overflow-y-auto">
                {songs.map((song, index) => (
                  <div
                    key={`${song.id}-${index}`}
                    className=" rounded-lg p-3 bg-base-darkPrimary hover:bg-gray-600 transition-colors cursor-pointer"
                    onClick={() => handleSongSelect(song)}
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
                        <Typography
                          variant="body-sm"
                          color={KaraokeColors.base.white}
                          className="line-clamp-2"
                        >
                          {song.title}
                        </Typography>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock size={12} color={KaraokeColors.gray.gray500} />
                          <Typography
                            variant="body-sm"
                            color={KaraokeColors.gray.gray500}
                          >
                            {song.duration}
                          </Typography>
                        </div>
                      </div>
                      <Music
                        size={16}
                        color={KaraokeColors.primary.primary400}
                      />
                    </div>
                  </div>
                ))}
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
        </div>
      </div>

      {/* Modal de saludo */}
      <SongGreetingModal
        visible={showGreetingModal}
        onClose={handleGreetingClose}
        onConfirm={handleGreetingConfirm}
        song={selectedSong}
      />
    </div>
  );
};
