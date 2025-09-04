import React, { useEffect, useState } from "react";
import { Modal } from "@/shared/components/ui/modal";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { DialogFooter } from "@/shared/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { ILocations, TLocationStatus } from "@/shared/types/location-types";

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (locationData: ILocations) => void;
  title: string;
  location: ILocations | null;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  title,
  location,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    abbreviation: "",
    status: "available" as TLocationStatus,
  });

  useEffect(() => {
    if (location) {
      setFormData({
        name: location.name || "",
        abbreviation: location.abbreviation || "",
        status: location.status || "available",
      });
    } else {
      setFormData({
        name: "",
        abbreviation: "",
        status: "available",
      });
    }
  }, [location, isOpen]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave(formData);
  };

  const handleClose = () => {
    setFormData({
      name: "",
      abbreviation: "",
      status: "available",
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      title={title}
      subTitle="Completa la información de la mesa"
      onClose={handleClose}
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-right font-normal text-2sm">
              Nombre de la Mesa
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Ej: Mesa 1, Mesa VIP, etc."
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label
              htmlFor="abbreviation"
              className="text-right font-normal text-2sm"
            >
              Abreviatura
            </Label>
            <Input
              id="abbreviation"
              value={formData.abbreviation}
              onChange={(e) =>
                setFormData({ ...formData, abbreviation: e.target.value })
              }
              placeholder="Ej: M1, VIP, etc."
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="status" className="text-right font-normal text-2sm">
              Estado
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value: TLocationStatus) =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecciona el estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Disponible</SelectItem>
                <SelectItem value="occupied">Ocupado</SelectItem>
                <SelectItem value="inactive">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" size="smallWeb">
            {location ? "Actualizar" : "Crear"}
          </Button>
        </DialogFooter>
      </form>
    </Modal>
  );
};
