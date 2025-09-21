import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { KaraokeColors } from "../../colors";
import { HeaderScreen, BottomNavigation } from "../../shared/components";
import { CardUserHome, RecentUsers, HistoryUser } from "./components";
import { useUsersContext } from "../../shared/context";
import { UseGetVisits } from "../../shared/hooks";
import { UserServices } from "../../shared/services";
import { useUserStorage } from "../../shared/hooks";
import { KARAOKE_ROUTES } from "../../shared/types";

export const KaraokeHomePage: React.FC = () => {
  const {
    state: { user },
    setUser,
  } = useUsersContext();

  const { getVisitsByUser, visits, isLoading, isError } = UseGetVisits(
    user?.id || ""
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const startY = useRef(0);
  const currentY = useRef(0);
  const userServices = new UserServices();
  const { setUser: setUserStorage } = useUserStorage();
  const navigate = useNavigate();

  const handleOnStart = () => {
    navigate(KARAOKE_ROUTES.MESAS);
  };

  const handleOnRetry = async () => {
    getVisitsByUser();
  };

  const handleRefresh = async () => {
    if (!user?.id) return;

    setIsRefreshing(true);
    try {
      // Refrescar datos de visitas
      await getVisitsByUser();

      // Refrescar información del usuario
      userServices.getToUserById((updatedUser) => {
        if (updatedUser) {
          setUser(updatedUser);
          setUserStorage(updatedUser);
        }
      }, user.id);

      console.log("🔄 Datos del home actualizados");
    } catch (error) {
      console.error("Error al refrescar datos:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Pull to refresh handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    setIsPulling(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling) return;

    currentY.current = e.touches[0].clientY;
    const distance = currentY.current - startY.current;

    // Solo permitir pull hacia abajo y máximo 100px
    if (distance > 0 && distance < 100) {
      setPullDistance(distance);
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > 50) {
      handleRefresh();
    }
    setPullDistance(0);
    setIsPulling(false);
  };

  return (
    <div
      className="min-h-screen pb-20"
      style={{
        backgroundColor: KaraokeColors.base.darkPrimary,
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
      {(isPulling || isRefreshing) && (
        <div
          className="flex justify-center items-center w-full transition-all duration-300"
          style={{
            height: `${Math.min(pullDistance * 0.6, 60)}px`,
            transform: `translateY(${Math.min(pullDistance * 0.6, 60) - 60}px)`,
          }}
        >
          <div className="relative">
            {/* Círculo de fondo */}
            <div
              className="rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(pullDistance * 0.8, 40)}px`,
                height: `${Math.min(pullDistance * 0.8, 40)}px`,
                backgroundColor: KaraokeColors.purple.purple500,
                opacity: isRefreshing ? 1 : Math.min(pullDistance / 50, 1),
              }}
            >
              {/* Loader spinner */}
              {(isRefreshing || pullDistance > 20) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 animate-spin text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{
                      opacity: isRefreshing
                        ? 1
                        : Math.min(pullDistance / 30, 1),
                    }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="px-9 py-5">
        <HeaderScreen user={user} />
        <CardUserHome additionalInfo={user.additionalInfo} />
        <RecentUsers />

        <HistoryUser
          isLoading={isLoading}
          isError={isError}
          visits={visits}
          onStart={handleOnStart}
          onRetry={handleOnRetry}
        />
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};
