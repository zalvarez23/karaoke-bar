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
import { defaultStatusValues, TDefaultStatus } from "@/shared/types/status";
import {
  getStatusValuesByIsOnline,
  IUser,
  TUserStatusByOnline,
} from "@/shared/types/user-types";
import { formatDateLarge } from "@/shared/utils/format-date";

export const columns: ColumnDef<IUser>[] = [
  {
    accessorKey: "name",
    header: () => <div className="tracking-wider">Nombres</div>,
    cell: ({ row }) => {
      const { name, lastName } = row.original;
      return (
        <>
          {name} {lastName}
        </>
      );
    },
  },
  {
    accessorKey: "email",
    header: () => <div className="tracking-wider">Correo</div>,
  },

  {
    accessorKey: "documentNumber",
    header: () => <div className="tracking-wider">Usuario</div>,
  },

  {
    accessorKey: "password",
    header: () => <div className="tracking-wider">Password</div>,
  },

  {
    accessorKey: "additionalInfo.visits",
    header: () => <div className="tracking-wider">Visitas</div>,
  },

  {
    accessorKey: "additionalInfo.lastVisit",
    header: () => <div className="tracking-wider">Ultima Visita</div>,
    cell: ({ row }) => {
      const formattedDate = formatDateLarge(
        row.original.additionalInfo.lastVisit,
      );
      return <>{formattedDate}</>;
    },
  },

  {
    accessorKey: "additionalInfo.isOnline",
    header: () => <div className="tracking-wider">Estado</div>,
    cell: ({ row }) => {
      const isOnline =
        (String(row.original.additionalInfo.isOnline) as TUserStatusByOnline) ||
        "false";

      const { color, status } = getStatusValuesByIsOnline[isOnline] || {
        color: "text-red",
        status: "Offline",
      };

      return (
        <div
          className={cn(
            "font-normal tracking-wider  rounded-md min-w-[80px]",
            color,
          )}
        >
          {status}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
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
            {/*}<DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(taxes?.id || "")}
            >
              Copy payment ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          {*/}

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
