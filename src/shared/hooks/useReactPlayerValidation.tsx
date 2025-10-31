import { useState, useCallback } from "react";

// Definir la interfaz aquí ya que eliminamos el servicio
export interface YouTubeValidationResult {
  isAvailable: boolean;
  error?: string;
  videoId: string;
  title?: string;
  duration?: string;
}

interface UseReactPlayerValidationReturn {
  validationResults: Map<string, YouTubeValidationResult>;
  isValidating: boolean;
  startValidation: (urls: string[]) => void;
  getValidationStatus: (
    url: string
  ) => "pending" | "validating" | "available" | "unavailable" | "error";
  handleValidationComplete: (
    result: YouTubeValidationResult,
    url: string
  ) => void;
  resetValidation: () => void;
}

export const useReactPlayerValidation = (): UseReactPlayerValidationReturn => {
  const [validationResults, setValidationResults] = useState(
    new Map<string, YouTubeValidationResult>()
  );
  const [isValidating, setIsValidating] = useState(false);
  const [validatingUrls, setValidatingUrls] = useState(new Set<string>());

  const resetValidation = useCallback(() => {
    setValidationResults(new Map());
    setIsValidating(false);
    setValidatingUrls(new Set());
  }, []);

  const startValidation = useCallback((urls: string[]) => {
    // Resetear estado anterior
    setValidationResults(new Map());
    setIsValidating(true);

    // Marcar todos como validando al mismo tiempo
    setValidatingUrls(new Set(urls));
  }, []);

  const getValidationStatus = useCallback(
    (url: string) => {
      if (validatingUrls.has(url)) {
        return "validating";
      }

      const result = validationResults.get(url);
      if (!result) {
        return "pending";
      }

      if (result.isAvailable === true) {
        return "available";
      } else if (result.isAvailable === false) {
        return "unavailable";
      }

      return "error";
    },
    [validationResults, validatingUrls]
  );

  const handleValidationComplete = useCallback(
    (result: YouTubeValidationResult, url: string) => {
      // Actualizar resultados
      setValidationResults((prev) => {
        const newResults = new Map(prev);
        newResults.set(url, result);
        return newResults;
      });

      // Remover de URLs en validación
      setValidatingUrls((prev) => {
        const newUrls = new Set(prev);
        newUrls.delete(url);

        // Si no hay más URLs validándose, marcar como completado
        if (newUrls.size === 0) {
          setIsValidating(false);
        }

        return newUrls;
      });
    },
    []
  );

  return {
    validationResults,
    isValidating,
    startValidation,
    getValidationStatus,
    handleValidationComplete,
    resetValidation,
  };
};
