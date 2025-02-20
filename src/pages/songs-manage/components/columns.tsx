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
  getStatusSongValue,
  TSongsRequested,
  TSongStatus,
} from "@/shared/types/visit-types";
import { formatDateToTime } from "@/shared/utils/format-date";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";

type TSongsManageActions = {
  onAcceptClient: (visitId: string) => void;
  onCompletedClient: (visitId: string, usersIds: string[]) => void;
  onRejectClient: (visitId: string, userId: string) => void;
};

export const columns = ({
  onAcceptClient,
  onCompletedClient,
  onRejectClient,
}: TSongsManageActions): ColumnDef<TSongsRequested>[] => [
  {
    accessorKey: "userName",
    header: () => <div className="tracking-wider">Cliente</div>,
  },
  {
    accessorKey: "title",
    header: () => <div className="tracking-wider">Cancion</div>,
    cell: ({ row }) => {
      return (
        <div className="font-normal tracking-wider flex gap-5 items-center">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={row.original.thumbnail}
              alt="Nombre del usuario"
            />
            <AvatarFallback>NN</AvatarFallback>
          </Avatar>
          {row.original.title} - {row.original.duration}
        </div>
      );
    },
  },

  {
    accessorKey: "date",
    header: () => <div className="tracking-wider">Hora</div>,
    cell: ({ row }) => {
      const formattedVisitDate = formatDateToTime(row.getValue("date"));
      return (
        <div className="font-normal tracking-wider">{formattedVisitDate}</div>
      );
    },
  },

  {
    accessorKey: "location",
    header: () => <div className="tracking-wider">Ubicacion</div>,
  },

  {
    accessorKey: "status",
    header: () => <div className="tracking-wider">Estado</div>,
    cell: ({ row }) => {
      const status = String(row.original.status) as TSongStatus;
      const { color, statusName } = getStatusSongValue[status];
      return (
        <div
          className={cn(
            "font-normal tracking-wider  rounded-md min-w-[80px]",
            color,
          )}
        >
          {statusName}
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

            <DropdownMenuSeparator />

            {row.original.status === "online" && (
              <DropdownMenuItem
                className="text-gray-600 tracking-wide text-2sm flex items-center"
                onClick={() =>
                  onCompletedClient(
                    row.original.id || "",
                    row.original.usersIds || "",
                  )
                }
              >
                <FilePenLine className="h-4 w-4 text-green-400" />
                <div>Completar Visita</div>
              </DropdownMenuItem>
            )}

            {row.original.status === "pending" && (
              <>
                <DropdownMenuItem
                  className="text-gray-600 tracking-wide text-2sm flex items-center"
                  onClick={() => onAcceptClient(row.original.id || "")}
                >
                  <FilePenLine className="h-4 w-4 text-green-400" />
                  <div>Aceptar Visita</div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-gray-600 tracking-wide text-2sm flex items-center"
                  onClick={() =>
                    onRejectClient(
                      row.original.id || "",
                      row.original.userId || "",
                    )
                  }
                >
                  <Trash className="h-4 w-4 text-red-300" />
                  <div>Cancelar Visita</div>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
