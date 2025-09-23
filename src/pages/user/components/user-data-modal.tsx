import React from "react";
import { Modal } from "@/shared/components/ui/modal";
import {
  IUser,
  getStatusValuesByIsOnline,
  TUserStatusByOnline,
} from "@/pages/karaoke/shared/types/user.types";
import { formatDateLarge } from "@/shared/utils/format-date";
import { cn } from "@/lib/utils";

// Helper function to format user dates (handles both Date and Timestamp)
const formatUserDate = (
  date: Date | { seconds: number; nanoseconds: number } | string | null
): string => {
  if (!date) return "Sin fecha";

  try {
    if (
      typeof date === "object" &&
      "seconds" in date &&
      "nanoseconds" in date
    ) {
      // Firebase Timestamp - convert to Date first
      return formatDateLarge(date as { seconds: number; nanoseconds: number });
    }
    if (date instanceof Date) {
      // Convert Date to Timestamp format for formatDateLarge
      return formatDateLarge({
        seconds: Math.floor(date.getTime() / 1000),
        nanoseconds: (date.getTime() % 1000) * 1000000,
      });
    }
    if (typeof date === "string") {
      const dateObj = new Date(date);
      if (!isNaN(dateObj.getTime())) {
        return formatDateLarge({
          seconds: Math.floor(dateObj.getTime() / 1000),
          nanoseconds: (dateObj.getTime() % 1000) * 1000000,
        });
      }
    }
    return "Fecha inválida";
  } catch {
    return "Error al formatear fecha";
  }
};

interface UserDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: IUser | null;
}

export const UserDataModal: React.FC<UserDataModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  if (!user) return null;
  console.log(user);
  const isOnline =
    (String(user.additionalInfo.isOnline) as TUserStatusByOnline) || "false";
  const { color, status } = getStatusValuesByIsOnline[isOnline] || {
    color: "text-red",
    status: "Offline",
  };

  return (
    <Modal
      isOpen={isOpen}
      title={`Datos del usuario - ${user.name} ${user.lastName}`}
      subTitle="Información completa del usuario"
      onClose={onClose}
    >
      <div className="space-y-6">
        {/* Información personal */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Información Personal
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nombres
              </label>
              <p className="mt-1 text-sm text-gray-900">{user.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Apellidos
              </label>
              <p className="mt-1 text-sm text-gray-900">{user.lastName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <p className="mt-1 text-sm text-gray-900">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Número de documento
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {user.documentNumber}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <p className="mt-1 text-sm text-gray-900">{user.password}</p>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Información Adicional
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Total de visitas
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {user.additionalInfo.visits}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Puntos acumulados
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {user.additionalInfo.points || 0}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Última visita
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {user.additionalInfo.lastVisit
                  ? formatUserDate(user.additionalInfo.lastVisit)
                  : "Sin visitas"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Estado
              </label>
              <div className="mt-1">
                <span
                  className={cn(
                    "inline-flex px-2 py-1 text-xs font-medium rounded-full",
                    color
                  )}
                >
                  {status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Información del sistema */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Información del Sistema
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                ID del usuario
              </label>
              <p className="mt-1 text-sm text-gray-900 font-mono">{user.id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Fecha de registro
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {user.creationDate
                  ? formatUserDate(user.creationDate)
                  : "No disponible"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
