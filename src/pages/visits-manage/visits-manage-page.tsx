import React, { useEffect, useState } from "react";
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

export const VisitsManagePage: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [visits, setVisits] = useState<IVisits[]>();
  const visitsServices = new VisitsServices();
  const userServices = new UserServices();

  useEffect(() => {
    const unsubscribe = visitsServices.getAllVisitsOnSnapshot(setVisits);

    return () => unsubscribe();
  }, []);

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
    visitsServices.updateVisitStatus(visitId, "online");
  };

  const handleOnRejectClient = (
    visitId: string,
    usersIds: string[],
    location: string,
  ) => {
    visitsServices.updateLocationStatus(location, "available");
    visitsServices.updateVisitStatus(visitId, "cancelled");
    usersIds?.forEach((userId) => {
      userServices.updateStatusUser(userId, false);
    });
  };

  const handleOnCompletedClient = (
    visitId: string,
    usersIds: string[],
    location: string,
  ) => {
    visitsServices.updateLocationStatus(location, "available");
    visitsServices.updateVisitStatus(visitId, "completed");
    usersIds?.forEach((userId) => {
      userServices.updateStatusUser(userId, false);
    });
  };
  return (
    <div>
      <div className="container mx-auto">
        <DataTable<IVisits, unknown>
          columns={columns({
            onAcceptClient: handleOnAcceptClient,
            onRejectClient: handleOnRejectClient,
            onCompletedClient: handleOnCompletedClient,
          })}
          data={visits || []}
          onAdd={handleAdd}
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
    </div>
  );
};
