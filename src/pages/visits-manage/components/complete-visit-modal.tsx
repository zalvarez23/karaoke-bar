import React, { useState, useEffect } from "react";
import { Modal } from "@/shared/components/ui/modal";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { IVisits } from "@/shared/types/visit-types";

interface CompleteVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (points: number, totalConsumption: number) => void;
  visit: IVisits | null;
}

export const CompleteVisitModal: React.FC<CompleteVisitModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  visit,
}) => {
  const [points, setPoints] = useState<number>(1);
  const [totalConsumption, setTotalConsumption] = useState<number>(0);
  const [consumptionInput, setConsumptionInput] = useState<string>("");

  // Resetear valores cada vez que se abre el modal
  useEffect(() => {
    if (isOpen) {
      setPoints(1);
      setTotalConsumption(0);
      setConsumptionInput("");
    }
  }, [isOpen]);

  const handleConfirm = () => {
    onConfirm(points, totalConsumption);
    onClose();
  };

  const handleClose = () => {
    setPoints(1); // Resetear a valor por defecto
    setTotalConsumption(0); // Resetear consumo total
    setConsumptionInput(""); // Resetear input
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Completar Visita
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Asigna los puntos que recibirá el usuario por esta visita
          </p>
        </div>

        {visit && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Mesa:</span> {visit.location}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Usuario:</span> {visit.userName}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Fecha:</span>{" "}
              {visit.date
                ? visit.date instanceof Date
                  ? visit.date.toLocaleDateString()
                  : new Date(visit.date.seconds * 1000).toLocaleDateString()
                : "No disponible"}
            </p>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="points" className="text-sm font-medium">
              Puntos a asignar
            </Label>
            <Input
              id="points"
              type="number"
              min="0"
              max="100"
              value={points}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                setPoints(isNaN(value) ? 1 : value);
              }}
              className="w-full"
              placeholder="Ingresa los puntos"
            />
            <p className="text-xs text-gray-500">
              Los puntos deben ser entre 0 y 100
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="consumption" className="text-sm font-medium">
              Consumo Total (S/)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                S/
              </span>
              <Input
                id="consumption"
                type="text"
                value={consumptionInput}
                onChange={(e) => {
                  const inputValue = e.target.value;

                  // Permitir solo números y punto decimal
                  if (
                    inputValue === "" ||
                    /^[0-9]*\.?[0-9]*$/.test(inputValue)
                  ) {
                    setConsumptionInput(inputValue);

                    if (inputValue === "") {
                      setTotalConsumption(0);
                    } else if (inputValue === ".") {
                      setTotalConsumption(0);
                    } else {
                      const value = parseFloat(inputValue);
                      if (!isNaN(value) && value >= 0) {
                        setTotalConsumption(value);
                      }
                    }
                  }
                }}
                onBlur={(e) => {
                  // Formatear al salir del campo si está vacío
                  if (e.target.value === "") {
                    setTotalConsumption(0);
                    setConsumptionInput("");
                  }
                }}
                className="w-full pl-8"
                placeholder="0.00"
              />
            </div>
            <p className="text-xs text-gray-500">
              Ingresa el monto total consumido en soles
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-green-600 hover:bg-green-700"
          >
            Completar Visita
          </Button>
        </div>
      </div>
    </Modal>
  );
};
