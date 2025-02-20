import React, { useEffect, useState } from "react";
import { Modal } from "@/shared/components/ui/modal";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { DialogFooter } from "@/shared/components/ui/dialog";
import { Switch } from "@/shared/components/ui/switch";
import { IUser } from "@/shared/types/user-types";
import { UserServices } from "./services/user-services";
import { DataTable } from "./components/data-table";
import { columns } from "./components/columns";

export const UserPage: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [users, setUsers] = useState<IUser[]>();
  const userServices = new UserServices();

  useEffect(() => {
    const unsubscribe = userServices.getAllUsersOnSnapshot(setUsers);

    return () => unsubscribe();
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleAdd = () => {
    setIsOpen(true);
    setModalTitle("Nuevo Registro");
  };

  const handleEdit = () => {
    setIsOpen(true);
    setModalTitle("Editar Registro");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const percentage = formData.get("percentage") as string;
  };

  return (
    <div>
      <div className="container mx-auto">
        <DataTable<IUser, unknown>
          columns={columns}
          data={users || []}
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
