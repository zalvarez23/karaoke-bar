import React, { useEffect, useState, useCallback } from "react";
import { ILocations } from "@/shared/types/location-types";
import { LocationServices } from "./services/location-services";
import { DataTable } from "./components/data-table";
import { createColumns } from "./components/columns";
import { LocationModal } from "./components/location-modal";

export const MaintenancePage: React.FC = () => {
  const [locations, setLocations] = useState<ILocations[]>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<ILocations | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const locationServices = useCallback(() => new LocationServices(), []);

  useEffect(() => {
    const unsubscribe = locationServices().getAllLocationsOnSnapshot(
      (locationsData) => {
        setLocations(locationsData);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [locationServices]);

  const handleAdd = () => {
    setSelectedLocation(null);
    setModalTitle("Nueva Mesa");
    setIsModalOpen(true);
  };

  const handleEdit = (location: ILocations) => {
    setSelectedLocation(location);
    setModalTitle("Editar Mesa");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLocation(null);
  };

  const handleSaveLocation = async (locationData: ILocations) => {
    try {
      if (selectedLocation?.id) {
        // Editar mesa existente
        await locationServices().updateLocation(
          selectedLocation.id,
          locationData
        );
      } else {
        // Crear nueva mesa
        await locationServices().createLocation(locationData);
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error al guardar la mesa:", error);
    }
  };

  const handleDeleteLocation = async (locationId: string) => {
    try {
      await locationServices().deleteLocation(locationId);
    } catch (error) {
      console.error("Error al eliminar la mesa:", error);
    }
  };

  const handleToggleStatus = async (
    locationId: string,
    currentStatus: string
  ) => {
    try {
      const newStatus = currentStatus === "inactive" ? "available" : "inactive";
      await locationServices().updateLocationStatus(locationId, newStatus);
    } catch (error) {
      console.error("Error al cambiar el estado de la mesa:", error);
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-full">
      <div className="container mx-auto">
        <DataTable<ILocations, unknown>
          columns={createColumns({
            onEdit: handleEdit,
            onDelete: handleDeleteLocation,
            onToggleStatus: handleToggleStatus,
          })}
          data={locations || []}
          onAdd={handleAdd}
          loading={loading}
        />
      </div>

      <LocationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveLocation}
        title={modalTitle}
        location={selectedLocation}
      />
    </div>
  );
};
