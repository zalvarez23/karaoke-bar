import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { KaraokeColors } from "../../colors";
import { Avatar, Typography } from "./index";
import { useUsersContext } from "../context";
import { KARAOKE_ROUTES } from "../types";
import { IUser } from "../types/user.types";
import { X } from "lucide-react";

type THeaderScreenProps = {
  user: IUser;
};

export const HeaderScreen = ({ user }: THeaderScreenProps) => {
  const { logout } = useUsersContext();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = async () => {
    try {
      await logout();
      setShowLogoutModal(false);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleGoToProfile = () => {
    // Solo permitir navegación a perfil si no es invitado
    if (!user?.isGuest) {
      navigate(KARAOKE_ROUTES.PROFILE);
    }
  };

  return (
    <>
      <div className="w-full flex flex-row justify-between items-center mt-5 mb-7">
        <div
          className={`flex flex-row items-center gap-5 transition-opacity w-full`}
          onClick={handleGoToProfile}
        >
          <div className="w-full">
            <div className="flex w-full flex-row items-center gap-5 justify-between mb-1">
              <div className="flex flex-row items-center gap-7">
                <Avatar
                  className="w-10 h-10 rounded-full"
                  image={"avatarGirl"}
                />
                <div className="flex flex-col ">
                  <Typography
                    variant="headline-sm-semi"
                    color={KaraokeColors.base.white}
                  >
                    Bienvenido,
                  </Typography>
                  <Typography
                    variant="body-sm-semi"
                    color={KaraokeColors.base.white}
                  >
                    {
                      user?.isGuest
                        ? user.name // Para invitados mostrar el nombre completo
                        : `${user?.name.split(" ")[0]} ${
                            user?.lastName.split(" ")[0]
                          }` // Para usuarios normales mostrar nombre y apellido abreviados
                    }
                  </Typography>
                </div>
              </div>
              <X
                size={25}
                color={KaraokeColors.base.secondaryLight}
                className="cursor-pointer hover:opacity-80 transition-opacity "
                onClick={handleLogout}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={handleCancelLogout}
          />
          <div
            className="relative bg-[#1e1c24] rounded-lg p-6 w-full max-w-md mx-4"
            style={{ backgroundColor: KaraokeColors.base.darkPrimary }}
          >
            <Typography
              variant="headline-md-semi"
              color={KaraokeColors.base.white}
              className="mb-4"
            >
              Cerrar Sesión
            </Typography>
            <Typography
              variant="body-md"
              color={KaraokeColors.gray.gray300}
              className="mb-6"
            >
              ¿Estás seguro de que quieres cerrar sesión?
            </Typography>
            <div className="flex gap-3">
              <button
                onClick={handleCancelLogout}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-600 text-white hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmLogout}
                className="flex-1 px-4 py-2 rounded-lg text-white transition-colors"
                style={{ backgroundColor: KaraokeColors.red.red500 }}
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
