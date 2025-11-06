import React, { useEffect, useState, useCallback } from "react";
import { IUser } from "@/pages/karaoke/shared/types/user.types";
import { UserServices } from "./services/user-services";
import { DataTable } from "./components/data-table";
import { createColumns } from "./components/columns";
import { UserHistoryModal } from "./components/user-history-modal";
import { UserDataModal } from "./components/user-data-modal";
import { DeleteUserConfirmModal } from "./components/delete-user-confirm-modal";

export const UserPage: React.FC = () => {
  const [users, setUsers] = useState<IUser[]>();
  const [showOnlyOnline, setShowOnlyOnline] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const userServices = useCallback(() => new UserServices(), []);

  useEffect(() => {
    const unsubscribe = userServices().getAllUsersOnSnapshot((usersData) => {
      setUsers(usersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userServices]);

  const handleViewHistory = (user: IUser) => {
    setSelectedUser(user);
    setIsHistoryModalOpen(true);
  };

  const handleViewData = (user: IUser) => {
    setSelectedUser(user);
    setIsDataModalOpen(true);
  };

  const handleCloseHistoryModal = () => {
    setIsHistoryModalOpen(false);
    setSelectedUser(null);
  };

  const handleCloseDataModal = () => {
    setIsDataModalOpen(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = (user: IUser) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
    setIsDeleting(false);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) {
      return;
    }

    // Validar que el usuario tenga un ID válido
    if (!selectedUser.id || selectedUser.id.trim() === "") {
      alert(
        "❌ Error: El usuario no tiene un ID válido. No se puede eliminar."
      );
      return;
    }

    setIsDeleting(true);

    try {
      // Intentar eliminar por ID primero
      if (selectedUser.id && selectedUser.id.trim() !== "") {
        await userServices().deleteUser(selectedUser.id);
      } else if (
        selectedUser.generatedUsername &&
        selectedUser.generatedUsername.trim() !== ""
      ) {
        // Fallback: eliminar por username si no tiene ID
        await userServices().deleteUserByUsername(
          selectedUser.generatedUsername
        );
      } else {
        throw new Error(
          "No se puede eliminar: usuario sin ID ni username válido"
        );
      }

      // Cerrar modal y mostrar mensaje de éxito
      handleCloseDeleteModal();
    } catch (error) {
      alert(
        `❌ Error al eliminar usuario: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
      setIsDeleting(false);
    }
  };

  // Filtrar usuarios según el estado del switch
  const filteredUsers = showOnlyOnline
    ? users?.filter((user) => user.additionalInfo.isOnline)
    : users;

  return (
    <div className="bg-gray-900 text-white min-h-full">
      <div className="container mx-auto">
        <DataTable<IUser, unknown>
          columns={createColumns({
            onViewHistory: handleViewHistory,
            onViewData: handleViewData,
            onDeleteUser: handleDeleteUser,
          })}
          data={filteredUsers || []}
          showOnlyOnline={showOnlyOnline}
          onToggleOnline={setShowOnlyOnline}
          loading={loading}
        />
      </div>

      <UserHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={handleCloseHistoryModal}
        user={selectedUser}
      />

      <UserDataModal
        isOpen={isDataModalOpen}
        onClose={handleCloseDataModal}
        user={selectedUser}
      />

      <DeleteUserConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        user={selectedUser}
        isDeleting={isDeleting}
      />
    </div>
  );
};
