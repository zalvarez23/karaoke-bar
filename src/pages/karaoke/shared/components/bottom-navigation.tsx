import { FC } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Rocket, Tablets, Mic } from "lucide-react";
import { KaraokeColors } from "../../colors";

interface BottomNavigationProps {
  className?: string;
}

export const BottomNavigation: FC<BottomNavigationProps> = ({
  className = "",
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    {
      id: "inicio",
      label: "Inicio",
      icon: Rocket,
      path: "/karaoke/home",
    },
    {
      id: "mesas",
      label: "Mesas",
      icon: Tablets,
      path: "/karaoke/mesas",
    },
    {
      id: "live",
      label: "Live",
      icon: Mic,
      path: "/karaoke/live",
    },
  ];

  const isActiveTab = (path: string) => {
    // Para mesas, también considerar las rutas de estados específicos
    if (path === "/karaoke/mesas") {
      return (
        location.pathname === "/karaoke/mesas" ||
        location.pathname === "/karaoke/mesas-online"
      );
    }
    return location.pathname === path;
  };

  const handleTabClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 ${className}`}>
      {/* Blur background effect */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

      {/* Navigation container */}
      <div className="relative bg-black/80 rounded-t-2xl mx-4 mb-2 border-t border-gray-700">
        <div className="flex items-center justify-around py-3 px-4">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = isActiveTab(tab.path);

            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.path)}
                className="flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 hover:bg-white/10"
              >
                <IconComponent
                  size={20}
                  color={
                    isActive
                      ? KaraokeColors.red.red400
                      : KaraokeColors.gray.gray500
                  }
                  className="mb-1"
                />
                <span
                  className={`text-xs ${
                    isActive ? "font-bold" : "font-medium text-gray-500"
                  }`}
                  style={{
                    color: isActive
                      ? KaraokeColors.red.red400
                      : KaraokeColors.gray.gray500,
                  }}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
