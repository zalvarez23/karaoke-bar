import { useState, useEffect, useCallback } from "react";

interface PWAUpdateState {
  isUpdateAvailable: boolean;
  isUpdating: boolean;
  updateVersion: string | null;
}

export const usePWAUpdate = () => {
  const [state, setState] = useState<PWAUpdateState>({
    isUpdateAvailable: false,
    isUpdating: false,
    updateVersion: null,
  });

  const checkForUpdate = useCallback(async () => {
    if (!("serviceWorker" in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) return;

      // Verificar si hay una nueva versión disponible
      await registration.update();

      // Verificar si hay un service worker esperando
      if (registration.waiting) {
        setState((prev) => ({
          ...prev,
          isUpdateAvailable: true,
          updateVersion: "Nueva versión disponible",
        }));
      }
    } catch (error) {
      console.error("Error checking for updates:", error);
    }
  }, []);

  const applyUpdate = useCallback(async () => {
    if (!("serviceWorker" in navigator)) return;

    try {
      setState((prev) => ({ ...prev, isUpdating: true }));

      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration || !registration.waiting) return;

      // Enviar mensaje al service worker para que aplique la actualización
      registration.waiting.postMessage({ type: "SKIP_WAITING" });

      // Esperar a que se aplique la actualización
      await new Promise<void>((resolve) => {
        const handleControllerChange = () => {
          navigator.serviceWorker.removeEventListener(
            "controllerchange",
            handleControllerChange
          );
          resolve();
        };
        navigator.serviceWorker.addEventListener(
          "controllerchange",
          handleControllerChange
        );
      });

      // Recargar la página para aplicar los cambios
      window.location.reload();
    } catch (error) {
      console.error("Error applying update:", error);
      setState((prev) => ({ ...prev, isUpdating: false }));
    }
  }, []);

  const dismissUpdate = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isUpdateAvailable: false,
      updateVersion: null,
    }));
  }, []);

  // Verificar actualizaciones al montar el componente
  useEffect(() => {
    checkForUpdate();

    // Verificar actualizaciones cada 5 minutos
    const interval = setInterval(checkForUpdate, 5 * 60 * 1000);

    // Escuchar eventos del service worker
    if ("serviceWorker" in navigator) {
      const handleControllerChange = () => {
        // Recargar automáticamente si hay un cambio de controlador
        window.location.reload();
      };

      navigator.serviceWorker.addEventListener(
        "controllerchange",
        handleControllerChange
      );

      return () => {
        clearInterval(interval);
        navigator.serviceWorker.removeEventListener(
          "controllerchange",
          handleControllerChange
        );
      };
    }

    return () => clearInterval(interval);
  }, [checkForUpdate]);

  return {
    ...state,
    checkForUpdate,
    applyUpdate,
    dismissUpdate,
  };
};
