import React, { useState } from "react";
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

  return (
    <div
      className="min-h-screen pb-20"
      style={{
        backgroundColor: KaraokeColors.base.darkPrimary,
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}
    >
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

      {/* Refresh Button */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50"
          style={{ backgroundColor: KaraokeColors.primary.primary500 }}
        >
          <svg
            className={`w-6 h-6 text-white ${
              isRefreshing ? "animate-spin" : ""
            }`}
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
        </button>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};
