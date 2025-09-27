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
import { UserServices } from "../user/services/user-services";
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
  } | null>(null);

  const visitsServices = useCallback(() => new VisitsServices(), []);
  const userServices = useCallback(() => new UserServices(), []);

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

  const handleOnAcceptClient = (visitId: string) => {
    visitsServices().updateVisitStatus(visitId, "online");
  };

  const handleOnRejectClient = (
    visitId: string,
    usersIds: string[],
    location: string
  ) => {
    visitsServices().updateLocationStatus(location, "available");
    visitsServices().updateVisitStatus(visitId, "cancelled");
    usersIds?.forEach((userId) => {
      userServices().updateStatusUser(userId, false);
    });
  };

  const handleOnCompletedClient = async (
    visitId: string,
    usersIds: string[],
    location: string
  ) => {
    // Encontrar la visita completa para mostrar en el modal
    const visit = visits?.find((v) => v.id === visitId);
    if (visit) {
      setVisitToComplete({
        visitId,
        usersIds,
        location,
        visit,
      });
      setIsCompleteVisitModalOpen(true);
    }
  };

  const handleCompleteVisitWithPoints = async (
    points: number,
    totalConsumption: number
  ) => {
    if (!visitToComplete) return;

    try {
      const { visitId, usersIds, location } = visitToComplete;

      // Actualizar estado de la ubicación y visita con puntos y consumo
      await visitsServices().updateLocationStatus(location, "available");
      await visitsServices().completeVisitWithPoints(
        visitId,
        points,
        totalConsumption
      );

      // Actualizar usuarios: poner offline e incrementar contador de visitas con puntos (EN PARALELO)
      console.log(`🚀 Procesando ${usersIds.length} usuarios en paralelo...`);

      const updateResults = await Promise.allSettled(
        usersIds.map(async (userId) => {
          try {
            await userServices().updateStatusUser(userId, false);
            await userServices().incrementUserVisitsWithPoints(userId, points);
            console.log(`✅ Usuario ${userId} actualizado correctamente`);
            return { success: true, userId };
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            console.error(`❌ Error con usuario ${userId}:`, errorMessage);
            return { success: false, userId, error: errorMessage };
          }
        })
      );

      // Procesar resultados de Promise.allSettled
      const successful = updateResults.filter(
        (result) => result.status === "fulfilled" && result.value.success
      ).length;

      const failed = updateResults
        .filter(
          (result) => result.status === "rejected" || !result.value.success
        )
        .map((result) => ({
          userId:
            result.status === "fulfilled" ? result.value.userId : "unknown",
          error:
            result.status === "fulfilled"
              ? result.value.error
              : result.reason?.message || "Unknown error",
        }));

      if (failed.length > 0) {
        console.warn(
          `⚠️ ${failed.length} usuarios no se pudieron actualizar:`,
          failed
        );
      }

      console.log(
        `✅ Visita completada: ${successful}/${usersIds.length} usuarios actualizados con ${points} puntos y S/ ${totalConsumption} de consumo`
      );
    } catch (error) {
      console.error("Error al completar la visita:", error);
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
    <div>
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
