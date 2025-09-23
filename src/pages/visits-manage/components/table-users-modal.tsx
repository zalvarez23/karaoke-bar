import React, { useEffect, useState } from "react";
import { Modal } from "@/shared/components/ui/modal";
import { IVisits } from "@/shared/types/visit-types";
import { IUser } from "@/pages/karaoke/shared/types/user.types";
import { UserServices } from "../../user/services/user-services";
import { VisitsServices } from "../services/visits-services";
import { formatDateLarge } from "@/shared/utils/format-date";
import {
  getStatusValuesByIsOnline,
  TUserStatusByOnline,
} from "@/pages/karaoke/shared/types/user.types";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { MoreHorizontal, UserMinus } from "lucide-react";

interface TableUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  visit: IVisits | null;
}

export const TableUsersModal: React.FC<TableUsersModalProps> = ({
  isOpen,
  onClose,
  visit,
}) => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(false);

  // Helper function para formatear fechas
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
        return formatDateLarge(
          date as { seconds: number; nanoseconds: number }
        );
      }
      if (date instanceof Date) {
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

  useEffect(() => {
    if (!isOpen || !visit?.id) {
      setUsers([]);
      return;
    }

    setLoading(true);
    const userServices = new UserServices();
    const visitsServices = new VisitsServices();

    // Escuchar cambios en la visita específica
    const unsubscribeVisit = visitsServices.getVisitByIdOnSnapshot(
      visit.id,
      (updatedVisit) => {
        if (!updatedVisit?.usersIds || updatedVisit.usersIds.length === 0) {
          setUsers([]);
          setLoading(false);
          return;
        }

        // Obtener usuarios de la visita actualizada
        const unsubscribeUsers = userServices.getAllUsersOnSnapshot(
          (allUsers) => {
            // Filtrar solo los usuarios que están en esta visita
            const visitUsers = allUsers.filter((user) =>
              updatedVisit.usersIds?.includes(user.id || "")
            );

            // Ordenar usuarios: host primero, luego invitados
            const sortedUsers = visitUsers.sort((a, b) => {
              const aIsHost = updatedVisit.userId === a.id;
              const bIsHost = updatedVisit.userId === b.id;

              if (aIsHost && !bIsHost) return -1; // a (host) va primero
              if (!aIsHost && bIsHost) return 1; // b (host) va primero
              return 0; // mismo tipo, mantener orden original
            });

            setUsers(sortedUsers);
            setLoading(false);
          }
        );

        return unsubscribeUsers;
      }
    );

    return () => {
      unsubscribeVisit();
      setLoading(false);
    };
  }, [isOpen, visit?.id]);

  const handleClose = () => {
    setUsers([]);
    onClose();
  };

  const handleRemoveGuest = async (userId: string) => {
    if (!visit?.id || !visit?.usersIds) return;

    try {
      const userServices = new UserServices();
      const visitsServices = new VisitsServices();

      // Poner usuario offline
      await userServices.updateStatusUser(userId, false);

      // Quitar usuario del array usersIds de la visita
      const updatedUsersIds = visit.usersIds.filter((id) => id !== userId);
      await visitsServices.updateVisitUsersIds(visit.id, updatedUsersIds);

      console.log(`Usuario ${userId} removido de la visita ${visit.id}`);
    } catch (error) {
      console.error("Error al quitar invitado:", error);
    }
  };

  if (!visit) return null;

  // Calcular estadísticas de usuarios
  const hostCount = users.filter((user) => visit.userId === user.id).length;
  const guestCount = users.filter((user) => visit.userId !== user.id).length;

  return (
    <Modal
      isOpen={isOpen}
      title={`Usuarios en la mesa - ${visit.location}`}
      subTitle={`Lista de usuarios en la visita del ${
        visit.date
          ? visit.date instanceof Date
            ? visit.date.toLocaleDateString()
            : new Date(visit.date.seconds * 1000).toLocaleDateString()
          : "fecha no disponible"
      }`}
      onClose={handleClose}
    >
      {/* Resumen de usuarios */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
              <span className="text-gray-700">
                <span className="font-medium">{hostCount}</span> Host
                {hostCount !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              <span className="text-gray-700">
                <span className="font-medium">{guestCount}</span> Invitado
                {guestCount !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
          <div className="text-gray-600">
            Total: <span className="font-medium">{users.length}</span> usuario
            {users.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-gray-500">Cargando usuarios...</div>
          </div>
        ) : users.length === 0 ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-gray-500">
              No se encontraron usuarios en esta mesa
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => {
              const isOnline =
                (String(user.additionalInfo.isOnline) as TUserStatusByOnline) ||
                "false";
              const { color, status } = getStatusValuesByIsOnline[isOnline] || {
                color: "text-red",
                status: "Offline",
              };

              // Determinar si es el host o invitado
              const isHost = visit.userId === user.id;
              const roleBadge = isHost
                ? {
                    text: "Host",
                    color: "bg-purple-100 text-purple-800 border-purple-200",
                  }
                : {
                    text: "Invitado",
                    color: "bg-blue-100 text-blue-800 border-blue-200",
                  };

              return (
                <div
                  key={user.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">
                          {user.name} {user.lastName}
                        </h4>
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium border",
                            roleBadge.color
                          )}
                        >
                          {roleBadge.text}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-sm text-gray-500">
                        Documento: {user.documentNumber}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          color
                        )}
                      >
                        {status}
                      </span>

                      {/* Solo mostrar acciones para invitados */}
                      {!isHost && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel className="font-normal tracking-wide">
                              Acciones
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-gray-600 tracking-wide text-2sm flex items-center"
                              onClick={() => handleRemoveGuest(user.id || "")}
                            >
                              <UserMinus className="h-4 w-4 text-red-400" />
                              <div>Quitar invitado</div>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total visitas:</span>
                      <span className="ml-2 font-medium">
                        {user.additionalInfo.visits}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Última visita:</span>
                      <span className="ml-2 font-medium">
                        {formatUserDate(user.additionalInfo.lastVisit)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
};
