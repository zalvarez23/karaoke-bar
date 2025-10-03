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
import { MoreHorizontal, Edit, Trash, Power } from "lucide-react";
import {
  ILocations,
  ELocationsStatus,
  TLocationStatus,
} from "@/shared/types/location-types";

type TMaintenanceActions = {
  onEdit: (location: ILocations) => void;
  onDelete: (locationId: string) => void;
  onToggleStatus: (locationId: string, currentStatus: string) => void;
};

export const createColumns = ({
  onEdit,
  onDelete,
  onToggleStatus,
}: TMaintenanceActions): ColumnDef<ILocations>[] => [
  {
    accessorKey: "name",
    header: () => <div className="tracking-wider">Nombre de la Mesa</div>,
  },
  {
    accessorKey: "abbreviation",
    header: () => <div className="tracking-wider">Abreviatura</div>,
  },
  {
    accessorKey: "songLimit",
    header: () => <div className="tracking-wider">Límite de Canciones</div>,
    cell: ({ row }) => {
      const songLimit = row.original.songLimit || 0;
      return (
        <div className="font-normal tracking-wider text-center">
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
            {songLimit} canciones
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: () => <div className="tracking-wider">Estado</div>,
    cell: ({ row }) => {
      const status = String(row.original.status) as TLocationStatus;
      const statusName = ELocationsStatus[status] || status;

      let color = "text-gray-500";
      if (status === "available") color = "text-green-500";
      if (status === "occupied") color = "text-red-500";
      if (status === "inactive") color = "text-gray-400";

      return (
        <div
          className={cn(
            "font-normal tracking-wider rounded-md min-w-[80px]",
            color
          )}
        >
          {statusName}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => null,
    cell: ({ row }) => {
      const location = row.original;
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

            <DropdownMenuItem
              className="text-gray-600 tracking-wide text-2sm flex items-center"
              onClick={() => onEdit(location)}
            >
              <Edit className="h-4 w-4 text-blue-400" />
              <div>Editar</div>
            </DropdownMenuItem>

            <DropdownMenuItem
              className="text-gray-600 tracking-wide text-2sm flex items-center"
              onClick={() => onToggleStatus(location.id || "", location.status)}
            >
              <Power className="h-4 w-4 text-orange-400" />
              <div>
                {location.status === "inactive" ? "Activar" : "Desactivar"}
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem
              className="text-gray-600 tracking-wide text-2sm flex items-center"
              onClick={() => onDelete(location.id || "")}
            >
              <Trash className="h-4 w-4 text-red-400" />
              <div>Eliminar</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
