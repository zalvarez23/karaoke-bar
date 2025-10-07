import { useEffect, useCallback, useState } from "react";

/**
 * Hook para detectar cambios de visibilidad de la página
 * Útil para detectar cuando la app regresa a primer plano desde segundo plano
 */
export const useVisibilityChange = (
  onVisibilityChange: (isVisible: boolean) => void
) => {
  const handleVisibilityChange = useCallback(() => {
    const isVisible = !document.hidden;
    console.log("🔍 Visibility change detected:", isVisible);
    onVisibilityChange(isVisible);
  }, [onVisibilityChange]);

  useEffect(() => {
    // Solo usar visibilitychange para evitar múltiples triggers
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [handleVisibilityChange]);
};

/**
 * Hook específico para detectar cuando la app regresa a primer plano
 * y ejecutar una función de actualización
 */
export const useAppForegroundRefresh = (
  refreshFunction: () => void | Promise<void>
) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleVisibilityChange = useCallback(
    async (isVisible: boolean) => {
      if (isVisible && !isProcessing) {
        const now = Date.now();
        // Solo actualizar si han pasado al menos 5 segundos desde la última actualización
        if (now - lastRefreshTime < 5000) {
          console.log("⏭️ Actualización omitida (muy reciente)");
          return;
        }

        console.log("🔄 App regresó a primer plano, actualizando datos...");
        setIsProcessing(true);
        setLastRefreshTime(now);
        setIsRefreshing(true);

        try {
          await refreshFunction();
          console.log("✅ Datos actualizados correctamente");
        } catch (error) {
          console.error(
            "❌ Error actualizando datos al regresar a primer plano:",
            error
          );
        } finally {
          // Pequeño delay para mostrar el indicador
          setTimeout(() => {
            setIsRefreshing(false);
            setIsProcessing(false);
          }, 1000);
        }
      }
    },
    [refreshFunction, lastRefreshTime, isProcessing]
  );

  useVisibilityChange(handleVisibilityChange);

  return { isRefreshing };
};
