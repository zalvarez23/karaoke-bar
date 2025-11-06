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
import { FilePenLine, MoreHorizontal, Trash, Users, Bell } from "lucide-react";
import { formatDateTimeLarge } from "@/shared/utils/format-date";
import {
  getStatusValue,
  IVisits,
  TVisitStatus,
} from "@/shared/types/visit-types";

type TVisitManageActions = {
  onAcceptClient: (visitId: string) => void;
  onCompletedClient: (
    visitId: string,
    usersIds: string[],
    location: string,
    locationId: string,
    isWebVisit: boolean
  ) => void;
  onRejectClient: (
    visitId: string,
    usersIds: string[],
    location: string,
    locationId: string,
    isWebVisit: boolean
  ) => void;
  onViewTableUsers: (visit: IVisits) => void;
  onToggleCallWaiter: (visitId: string, currentStatus: boolean) => void;
};

export const columns = ({
  onAcceptClient,
  onCompletedClient,
  onRejectClient,
  onViewTableUsers,
  onToggleCallWaiter,
}: TVisitManageActions): ColumnDef<IVisits>[] => [
  {
    accessorKey: "userName",
    header: () => <div className="tracking-wider text-white">Cliente</div>,
  },
  {
    accessorKey: "date",
    header: () => <div className="tracking-wider text-white">Fecha</div>,
    cell: ({ row }) => {
      const formattedVisitDate = formatDateTimeLarge(row.getValue("date"));
      return <>{formattedVisitDate}</>;
    },
  },

  {
    accessorKey: "location",
    header: () => <div className="tracking-wider text-white">Ubicacion</div>,
  },

  {
    accessorKey: "status",
    header: () => <div className="tracking-wider text-white">Estado</div>,
    cell: ({ row }) => {
      const status = String(row.original.status) as TVisitStatus;
      const { color, statusName } = getStatusValue[status];

      return (
        <div
          className={cn(
            "font-normal tracking-wider  rounded-md min-w-[80px]",
            color
          )}
        >
          {statusName}
        </div>
      );
    },
  },
  {
    accessorKey: "callWaiter",
    header: () => null,
    cell: ({ row }) => {
      const callWaiter = row.original.callWaiter;

      return (
        <div>
          <button
            onClick={() =>
              onToggleCallWaiter(row.original.id || "", callWaiter || false)
            }
            className="rounded-full transition-colors"
            title={callWaiter ? "Desactivar llamada a mesera" : "Llamar mesera"}
          >
            <Bell
              className={cn(
                "h-5 w-5 transition-all duration-200",
                callWaiter
                  ? "text-danger-light fill-danger-light animate-pulse [animation-duration:2s]"
                  : "text-gray-400 hover:text-red-400"
              )}
            />
          </button>
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
          <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
            <DropdownMenuLabel className="font-normal tracking-wide text-white">
              Acciones
            </DropdownMenuLabel>

            <DropdownMenuSeparator className="bg-gray-700" />

            <DropdownMenuItem
              className="text-white tracking-wide text-2sm flex items-center hover:bg-gray-700"
              onClick={() => onViewTableUsers(row.original)}
            >
              <Users className="h-4 w-4 text-blue-400" />
              <div>Ver mesa</div>
            </DropdownMenuItem>

            {row.original.status === "pending" && (
              <DropdownMenuItem
                className="text-white tracking-wide text-2sm flex items-center hover:bg-gray-700"
                onClick={() => onAcceptClient(row.original.id || "")}
              >
                <FilePenLine className="h-4 w-4 text-green-400" />
                <div>Aceptar Visita</div>
              </DropdownMenuItem>
            )}

            {row.original.status === "online" && (
              <DropdownMenuItem
                className="text-white tracking-wide text-2sm flex items-center hover:bg-gray-700"
                onClick={() => {
                  onCompletedClient(
                    row.original.id || "",
                    row.original.usersIds || [],
                    row.original.location || "",
                    row.original.locationId || "",
                    row.original.isWebVisit || false
                  );
                }}
              >
                <FilePenLine className="h-4 w-4 text-blue-400" />
                <div>Completar Visita</div>
              </DropdownMenuItem>
            )}

            <DropdownMenuItem
              className="text-white tracking-wide text-2sm flex items-center hover:bg-gray-700"
              onClick={() =>
                onRejectClient(
                  row.original.id || "",
                  row.original.usersIds || [],
                  row.original.location || "",
                  row.original.locationId || "",
                  row.original.isWebVisit || false
                )
              }
            >
              <Trash className="h-4 w-4 text-red-300" />
              <div>Rechazar Visita</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
