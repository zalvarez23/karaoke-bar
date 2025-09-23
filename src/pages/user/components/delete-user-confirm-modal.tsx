import React from "react";
import { Modal } from "@/shared/components/ui/modal";
import { Button } from "@/shared/components/ui/button";
import { Trash2, User, AlertTriangle } from "lucide-react";
import { IUser } from "@/pages/karaoke/shared/types/user.types";

interface DeleteUserConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  user: IUser | null;
  isDeleting?: boolean;
}

export const DeleteUserConfirmModal: React.FC<DeleteUserConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  user,
  isDeleting = false,
}) => {
  if (!user) return null;

  const isGuest = user.isGuest;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">
            ¿Eliminar usuario?
          </h2>

          <div className="flex items-center justify-center gap-3 p-3 bg-gray-50 rounded-lg">
            <User className="h-6 w-6 text-gray-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">
                {user.name} {user.lastName}
              </p>
              <p className="text-sm text-gray-500">
                {isGuest ? "Usuario Invitado" : "Usuario Registrado"}
              </p>
            </div>
          </div>

          <div className="text-sm text-gray-600 space-y-2">
            <p>
              Esta acción <strong>no se puede deshacer</strong> y eliminará:
            </p>
            <ul className="text-left space-y-1 ml-4">
              <li>• Datos personales del usuario</li>
              <li>• Historial de visitas</li>
              <li>• Puntos acumulados</li>
              <li>• Todas las canciones solicitadas</li>
            </ul>
          </div>

          {isGuest && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-700">
                <strong>Nota:</strong> Este es un usuario invitado. Sus datos
                son mínimos y la eliminación será permanente.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-red-600 text-red-600 hover:bg-red-50"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar Usuario
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
