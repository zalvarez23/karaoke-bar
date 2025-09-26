import React from "react";
import { usePWAUpdate } from "../hooks/use-pwa-update";
import Typography from "./typography";
import { KaraokeColors } from "../../colors";

export const UpdateNotification: React.FC = () => {
  const { isUpdateAvailable, isUpdating, applyUpdate, dismissUpdate } =
    usePWAUpdate();

  if (!isUpdateAvailable) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50">
      <div
        className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg border border-purple-500/20 p-4"
        style={{ backgroundColor: KaraokeColors.base.darkPrimary }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
            </div>
            <div>
              <Typography
                variant="body-md-semi"
                color={KaraokeColors.base.white}
                className="text-white"
              >
                Nueva versión disponible
              </Typography>
              <Typography
                variant="body-sm"
                color={KaraokeColors.gray.gray300}
                className="text-gray-300"
              >
                Actualiza para obtener las últimas mejoras
              </Typography>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={dismissUpdate}
              className="px-3 py-1 text-sm text-gray-300 hover:text-white transition-colors"
            >
              Más tarde
            </button>
            <button
              onClick={applyUpdate}
              disabled={isUpdating}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Actualizando...</span>
                </div>
              ) : (
                "Actualizar"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
