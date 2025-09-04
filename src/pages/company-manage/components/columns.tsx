import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { FilePenLine, MoreHorizontal, Trash } from "lucide-react";
import {
  getStatusValuesByCompanyStatus,
  ICompany,
  TCompanyStatus,
  ECompanyStatus,
} from "@/shared/types/company-types";
import { formatDateLarge } from "@/shared/utils/format-date";

export const columns: ColumnDef<ICompany>[] = [
  {
    accessorKey: "name",
    header: () => <div className="tracking-wider">Nombre</div>,
  },
  {
    accessorKey: "email",
    header: () => <div className="tracking-wider">Correo</div>,
  },
  {
    accessorKey: "phone",
    header: () => <div className="tracking-wider">Teléfono</div>,
  },
  {
    accessorKey: "taxId",
    header: () => <div className="tracking-wider">RUC/Tax ID</div>,
  },
  {
    accessorKey: "contactPerson",
    header: () => <div className="tracking-wider">Contacto</div>,
  },
  {
    accessorKey: "companyType",
    header: () => <div className="tracking-wider">Tipo</div>,
    cell: ({ row }) => {
      const type = row.original.companyType;
      const typeLabels = {
        corporation: "Corporación",
        llc: "LLC",
        partnership: "Sociedad",
        sole_proprietorship: "Unipersonal",
      };
      return typeLabels[type] || type;
    },
  },
  {
    accessorKey: "creationDate",
    header: () => <div className="tracking-wider">Fecha Creación</div>,
    cell: ({ row }) => {
      const formattedDate = formatDateLarge(row.original.creationDate);
      return <>{formattedDate}</>;
    },
  },
  {
    accessorKey: "status",
    header: () => <div className="tracking-wider">Estado</div>,
    cell: ({ row }) => {
      const status =
        row.original.status === ECompanyStatus.active ? "active" : "inactive";
      const { color, status: statusLabel } = getStatusValuesByCompanyStatus[
        status as TCompanyStatus
      ] || {
        color: "text-red",
        status: "Inactiva",
      };

      return (
        <div
          className={cn(
            "font-normal tracking-wider rounded-md min-w-[80px]",
            color
          )}
        >
          {statusLabel}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: () => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 bg-primary-40">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4 text-primary-600" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="font-normal tracking-wide">
              Acciones
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-gray-600 tracking-wide text-2sm flex items-center">
              <FilePenLine className="h-4 w-4 text-green-400" />
              <div>Actualizar</div>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-gray-600 tracking-wide text-2sm flex items-center">
              <Trash className="h-4 w-4 text-red-300" />
              <div>Eliminar</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
