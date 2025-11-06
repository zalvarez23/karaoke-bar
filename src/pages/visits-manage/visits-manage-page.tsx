import React, { useEffect, useState, useCallback } from "react";
import { Modal } from "@/shared/components/ui/modal";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { DialogFooter } from "@/shared/components/ui/dialog";
import { Switch } from "@/shared/components/ui/switch";
import { VisitsServices } from "./services/visits-services";
import { DataTable } from "./components/data-table";
import { columns } from "./components/columns";
import { IVisits } from "@/shared/types/visit-types";
import { TableUsersModal } from "./components/table-users-modal";
import { CompleteVisitModal } from "./components/complete-visit-modal";

export const VisitsManagePage: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [visits, setVisits] = useState<IVisits[]>();
  const [isTableUsersModalOpen, setIsTableUsersModalOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<IVisits | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCompleteVisitModalOpen, setIsCompleteVisitModalOpen] =
    useState(false);
  const [visitToComplete, setVisitToComplete] = useState<{
    visitId: string;
    usersIds: string[];
    location: string;
    visit: IVisits;
    locationId: string;
    isWebVisit: boolean;
  } | null>(null);

  const visitsServices = useCallback(() => new VisitsServices(), []);

  useEffect(() => {
    const unsubscribe = visitsServices().getAllVisitsOnSnapshot(
      (visitsData) => {
        console.log("📋 Visitas cargadas:", visitsData.length);
        visitsData.forEach((visit, index) => {
          console.log(
            `🔑 Visita ${index + 1} - ID: ${visit.id} | Estado: ${
              visit.status
            } | Ubicación: ${visit.location}`
          );
        });
        setVisits(visitsData);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [visitsServices]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleAdd = () => {
    setIsOpen(true);
    setModalTitle("Nuevo Registro");
  };

  // const handleEdit = () => {
  //   setIsOpen(true);
  //   setModalTitle("Editar Registro");
  // };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  const handleOnAcceptClient = async (visitId: string) => {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000; // 1 segundo

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        await visitsServices().updateVisitStatus(visitId, "online");
        console.log(
          `✅ Visita ${visitId} aceptada exitosamente (intento ${attempt})`
        );
        return; // Éxito, salir del bucle
      } catch (error) {
        console.error(`❌ Intento ${attempt} de aceptar visita falló:`, error);

        if (attempt === MAX_RETRIES) {
          // Último intento falló
          console.error(
            `❌ No se pudo aceptar la visita ${visitId} después de ${MAX_RETRIES} intentos`
          );
          return;
        }

        // Esperar antes del siguiente intento
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      }
    }
  };

  const handleOnRejectClient = async (
    visitId: string,
    usersIds: string[],
    location: string,
    locationId: string,
    isWebVisit: boolean = false
  ) => {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000; // 1 segundo

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        // Usar transacción atómica para rechazar la visita
        await visitsServices().rejectVisitWithTransaction(
          visitId,
          location,
          usersIds || [],
          locationId,
          isWebVisit
        );

        console.log(
          `✅ Visita ${visitId} rechazada exitosamente con transacción (intento ${attempt})`
        );
        return; // Éxito, salir del bucle
      } catch (error) {
        console.error(`❌ Intento ${attempt} de rechazar visita falló:`, error);

        if (attempt === MAX_RETRIES) {
          // Último intento falló
          console.error(
            `❌ No se pudo rechazar la visita ${visitId} después de ${MAX_RETRIES} intentos`
          );
          return;
        }

        // Esperar antes del siguiente intento
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      }
    }
  };

  const handleOnCompletedClient = async (
    visitId: string,
    usersIds: string[],
    location: string,
    locationId: string,
    isWebVisit: boolean = false
  ) => {
    // Encontrar la visita completa para mostrar en el modal
    const visit = visits?.find((v) => v.id === visitId);
    if (visit) {
      setVisitToComplete({
        visitId,
        usersIds,
        location,
        visit,
        locationId,
        isWebVisit,
      });
      setIsCompleteVisitModalOpen(true);
    }
  };

  const handleCompleteVisitWithPoints = async (
    points: number,
    totalConsumption: number
  ) => {
    if (!visitToComplete) return;

    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000; // 1 segundo

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const { visitId, usersIds, location, locationId, isWebVisit } =
          visitToComplete;

        // Usar transacción atómica para completar la visita
        await visitsServices().completeVisitWithTransaction(
          visitId,
          location,
          usersIds || [],
          points,
          totalConsumption,
          locationId,
          isWebVisit
        );

        console.log(
          `✅ Visita completada exitosamente con transacción (intento ${attempt})`
        );
        return; // Éxito, salir del bucle
      } catch (error) {
        console.error(
          `❌ Intento ${attempt} de completar visita falló:`,
          error
        );

        if (attempt === MAX_RETRIES) {
          // Último intento falló
          console.error(
            `❌ No se pudo completar la visita después de ${MAX_RETRIES} intentos`
          );
          return;
        }

        // Esperar antes del siguiente intento
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      }
    }
  };

  const handleCloseCompleteVisitModal = () => {
    setIsCompleteVisitModalOpen(false);
    setVisitToComplete(null);
  };

  const handleViewTableUsers = (visit: IVisits) => {
    setSelectedVisit(visit);
    setIsTableUsersModalOpen(true);
  };

  const handleCloseTableUsersModal = () => {
    setIsTableUsersModalOpen(false);
    setSelectedVisit(null);
  };

  const handleToggleCallWaiter = async (
    visitId: string,
    currentStatus: boolean
  ) => {
    try {
      await visitsServices().updateCallWaiterStatus(visitId, !currentStatus);
    } catch (error) {
      console.error("Error al cambiar estado de llamada a mesera:", error);
    }
  };
  return (
    <div className="bg-gray-900 text-white min-h-full">
      <div className="container mx-auto">
        <DataTable<IVisits, unknown>
          columns={columns({
            onAcceptClient: handleOnAcceptClient,
            onRejectClient: handleOnRejectClient,
            onCompletedClient: handleOnCompletedClient,
            onViewTableUsers: handleViewTableUsers,
            onToggleCallWaiter: handleToggleCallWaiter,
          })}
          data={visits || []}
          onAdd={handleAdd}
          loading={loading}
        />
      </div>
      <Modal
        isOpen={isOpen}
        title={modalTitle}
        subTitle="Haz cambios aquí. Haga clic en Guardar cuando haya terminado."
        onClose={handleClose}
      >
        <form onSubmit={handleSubmit}>
          <div className="flex gap-4 pt-1 pb-4">
            <div>
              <Label htmlFor="name" className="text-right font-normal text-2sm">
                Nombre
              </Label>
              <Input
                id="name"
                name="name"
                defaultValue=""
                className="col-span-3"
              />
            </div>
            <div>
              <Label
                htmlFor="percentage"
                className="text-right font-normal text-2sm"
              >
                Porcentaje
              </Label>
              <Input
                id="percentage"
                name="percentage"
                defaultValue=""
                className="col-span-3"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 pb-4">
            <Label htmlFor="status" className="text-right font-normal text-2sm">
              Estado
            </Label>
            <Switch name="status" id="status" />
          </div>

          <DialogFooter>
            <Button type="submit" variant="primary" size="smallWeb">
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </Modal>

      <TableUsersModal
        isOpen={isTableUsersModalOpen}
        onClose={handleCloseTableUsersModal}
        visit={selectedVisit}
      />

      <CompleteVisitModal
        isOpen={isCompleteVisitModalOpen}
        onClose={handleCloseCompleteVisitModal}
        onConfirm={handleCompleteVisitWithPoints}
        visit={visitToComplete?.visit || null}
      />
    </div>
  );
};
