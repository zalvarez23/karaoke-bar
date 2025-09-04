import React, { useEffect, useState, useCallback } from "react";
import { IUser } from "@/shared/types/user-types";
import { UserServices } from "./services/user-services";
import { DataTable } from "./components/data-table";
import { createColumns } from "./components/columns";
import { UserHistoryModal } from "./components/user-history-modal";
import { UserDataModal } from "./components/user-data-modal";

export const UserPage: React.FC = () => {
  const [users, setUsers] = useState<IUser[]>();
  const [showOnlyOnline, setShowOnlyOnline] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

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

  // Filtrar usuarios según el estado del switch
  const filteredUsers = showOnlyOnline
    ? users?.filter((user) => user.additionalInfo.isOnline)
    : users;

  return (
    <div>
      <div className="container mx-auto">
        <DataTable<IUser, unknown>
          columns={createColumns({
            onViewHistory: handleViewHistory,
            onViewData: handleViewData,
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
    </div>
  );
};
