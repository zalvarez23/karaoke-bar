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
import { Textarea } from "@/shared/components/ui/textarea";
import { ICompany, TCompanyType } from "@/shared/types/company-types";
import { CompanyServices } from "./services/company-services";
import { DataTable } from "./components/data-table";
import { columns } from "./components/columns";

export const CompanyPage: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [companies, setCompanies] = useState<ICompany[]>();
  const [selectedCompanyType, setSelectedCompanyType] =
    useState<TCompanyType>("corporation");
  const companyServices = new CompanyServices();

  useEffect(() => {
    const unsubscribe = companyServices.getAllCompaniesOnSnapshot(setCompanies);

    return () => unsubscribe();
  }, [companyServices]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleAdd = () => {
    setIsOpen(true);
    setModalTitle("Nueva Empresa");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const taxId = formData.get("taxId") as string;
    const contactPerson = formData.get("contactPerson") as string;
    const website = formData.get("website") as string;
    const description = formData.get("description") as string;

    try {
      await companyServices.createCompany({
        name,
        email,
        phone,
        address,
        taxId,
        companyType: selectedCompanyType,
        contactPerson,
        website: website || undefined,
        description: description || undefined,
      });

      setIsOpen(false);
      // Reset form
      (event.target as HTMLFormElement).reset();
      setSelectedCompanyType("corporation");
    } catch (error) {
      console.error("Error creando empresa:", error);
    }
  };

  return (
    <div>
      <div className="container mx-auto">
        <DataTable<ICompany, unknown>
          columns={columns}
          data={companies || []}
          onAdd={handleAdd}
        />
      </div>
      <Modal
        isOpen={isOpen}
        title={modalTitle}
        subTitle="Complete la información de la empresa. Haga clic en Guardar cuando haya terminado."
        onClose={handleClose}
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 pt-1 pb-4">
            <div>
              <Label htmlFor="name" className="text-right font-normal text-2sm">
                Nombre de la Empresa *
              </Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue=""
                className="col-span-3"
              />
            </div>
            <div>
              <Label
                htmlFor="email"
                className="text-right font-normal text-2sm"
              >
                Correo Electrónico *
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                defaultValue=""
                className="col-span-3"
              />
            </div>
            <div>
              <Label
                htmlFor="phone"
                className="text-right font-normal text-2sm"
              >
                Teléfono *
              </Label>
              <Input
                id="phone"
                name="phone"
                required
                defaultValue=""
                className="col-span-3"
              />
            </div>
            <div>
              <Label
                htmlFor="taxId"
                className="text-right font-normal text-2sm"
              >
                RUC/Tax ID *
              </Label>
              <Input
                id="taxId"
                name="taxId"
                required
                defaultValue=""
                className="col-span-3"
              />
            </div>
            <div>
              <Label
                htmlFor="contactPerson"
                className="text-right font-normal text-2sm"
              >
                Persona de Contacto *
              </Label>
              <Input
                id="contactPerson"
                name="contactPerson"
                required
                defaultValue=""
                className="col-span-3"
              />
            </div>
            <div>
              <Label
                htmlFor="companyType"
                className="text-right font-normal text-2sm"
              >
                Tipo de Empresa *
              </Label>
              <Select
                value={selectedCompanyType}
                onValueChange={(value: TCompanyType) =>
                  setSelectedCompanyType(value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="corporation">Corporación</SelectItem>
                  <SelectItem value="llc">LLC</SelectItem>
                  <SelectItem value="partnership">Sociedad</SelectItem>
                  <SelectItem value="sole_proprietorship">
                    Unipersonal
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 pb-4">
            <div>
              <Label
                htmlFor="address"
                className="text-right font-normal text-2sm"
              >
                Dirección *
              </Label>
              <Input
                id="address"
                name="address"
                required
                defaultValue=""
                className="col-span-3"
              />
            </div>
            <div>
              <Label
                htmlFor="website"
                className="text-right font-normal text-2sm"
              >
                Sitio Web
              </Label>
              <Input
                id="website"
                name="website"
                type="url"
                defaultValue=""
                className="col-span-3"
              />
            </div>
            <div>
              <Label
                htmlFor="description"
                className="text-right font-normal text-2sm"
              >
                Descripción
              </Label>
              <Textarea
                id="description"
                name="description"
                defaultValue=""
                className="col-span-3"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" variant="primary" size="smallWeb">
              Guardar Empresa
            </Button>
          </DialogFooter>
        </form>
      </Modal>
    </div>
  );
};
