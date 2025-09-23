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
import { MoreHorizontal, History, Eye, User, Trash2 } from "lucide-react";
import {
  getStatusValuesByIsOnline,
  IUser,
  TUserStatusByOnline,
} from "@/pages/karaoke/shared/types/user.types";
import { formatDateLarge } from "@/shared/utils/format-date";

// Helper function to format user dates (handles both Date and Timestamp)
const formatUserDate = (
  date: Date | { seconds: number; nanoseconds: number } | string | null
): string => {
  if (!date) return "Sin fecha";

  try {
    if (
      typeof date === "object" &&
      "seconds" in date &&
      "nanoseconds" in date
    ) {
      // Firebase Timestamp - convert to Date first
      return formatDateLarge(date as { seconds: number; nanoseconds: number });
    }
    if (date instanceof Date) {
      // Convert Date to Timestamp format for formatDateLarge
      return formatDateLarge({
        seconds: Math.floor(date.getTime() / 1000),
        nanoseconds: (date.getTime() % 1000) * 1000000,
      });
    }
    if (typeof date === "string") {
      const dateObj = new Date(date);
      if (!isNaN(dateObj.getTime())) {
        return formatDateLarge({
          seconds: Math.floor(dateObj.getTime() / 1000),
          nanoseconds: (dateObj.getTime() % 1000) * 1000000,
        });
      }
    }
    return "Fecha inválida";
  } catch {
    return "Error al formatear fecha";
  }
};

interface ColumnsProps {
  onViewHistory: (user: IUser) => void;
  onViewData: (user: IUser) => void;
  onDeleteUser: (user: IUser) => void;
}

export const createColumns = ({
  onViewHistory,
  onViewData,
  onDeleteUser,
}: ColumnsProps): ColumnDef<IUser>[] => [
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
    accessorKey: "isGuest",
    header: () => <div className="tracking-wider">Tipo</div>,
    cell: ({ row }) => {
      const isGuest = row.original.isGuest;
      return (
        <div
          className={cn(
            "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
            isGuest
              ? "bg-orange-100 text-orange-700"
              : "bg-blue-100 text-blue-700"
          )}
        >
          <User className="h-3 w-3" />
          {isGuest ? "Guest" : "User"}
        </div>
      );
    },
  },

  {
    accessorKey: "additionalInfo.visits",
    header: () => <div className="tracking-wider">Visitas</div>,
  },

  {
    accessorKey: "additionalInfo.points",
    header: () => <div className="tracking-wider">Puntos</div>,
  },

  {
    accessorKey: "additionalInfo.lastVisit",
    header: () => <div className="tracking-wider">Ultima Visita</div>,
    cell: ({ row }) => {
      const formattedDate = formatUserDate(
        row.original.additionalInfo.lastVisit
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
            color
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
      const user = row.original;
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
              onClick={() => onViewData(user)}
            >
              <Eye className="h-4 w-4 text-blue-400" />
              <div>Ver datos</div>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-gray-600 tracking-wide text-2sm flex items-center"
              onClick={() => onViewHistory(user)}
            >
              <History className="h-4 w-4 text-green-400" />
              <div>Ver historia</div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 tracking-wide text-2sm flex items-center"
              onClick={() => onDeleteUser(user)}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
              <div>Eliminar usuario</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
