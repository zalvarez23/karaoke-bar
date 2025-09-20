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
import {
  MoreHorizontal,
  Play,
  Youtube,
  Check,
  X,
  Volume2,
  Heart,
} from "lucide-react";
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
import { useState } from "react";

// Componente para la celda de saludos
const GreetingCell = ({
  greeting,
  onPlayGreeting,
}: {
  greeting?: string;
  onPlayGreeting: (text: string) => void;
}) => {
  const hasGreeting = greeting && greeting.trim() !== "";
  const [isDisabled, setIsDisabled] = useState(false);

  const handlePlayGreeting = () => {
    if (hasGreeting && greeting) {
      // Deshabilitar botón por 4 segundos
      setIsDisabled(true);

      // Llamar a la función original
      onPlayGreeting(greeting);

      // Habilitar botón después de 5 segundos
      setTimeout(() => {
        setIsDisabled(false);
      }, 5000);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "h-8 w-8 p-0",
        hasGreeting
          ? isDisabled
            ? "text-gray-400 cursor-not-allowed"
            : "text-blue-500 hover:text-blue-600 hover:bg-blue-50"
          : "text-gray-400 cursor-not-allowed"
      )}
      disabled={!hasGreeting || isDisabled}
      onClick={handlePlayGreeting}
    >
      <Volume2 className="h-4 w-4" />
    </Button>
  );
};

type TSongsManageActions = {
  onOpenYouTube: (song: TSongsRequested) => void;
  onPlaySong: (songId: string, visitId: string, numberSong: number) => void;
  onCancelSong: (songId: string, visitId: string, numberSong: number) => void;
  onPlayGreeting: (greeting: string) => void;
};

export const columns = ({
  onOpenYouTube,
  onPlaySong,
  onCancelSong,
  onPlayGreeting,
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
            "font-regular tracking-wider  rounded-md min-w-[80px]",
            color
          )}
        >
          {statusName}
        </div>
      );
    },
  },
  {
    id: "play",
    header: () => <div className="tracking-wider">Reproducir</div>,
    cell: ({ row }) => {
      const isPending = (row.original.status as TSongStatus) === "pending";
      const isSinging = (row.original.status as TSongStatus) === "singing";

      return (
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 w-8 p-0",
            isPending
              ? "text-green-600 hover:text-green-700 hover:bg-green-50"
              : isSinging
              ? "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              : "text-gray-400 cursor-not-allowed"
          )}
          disabled={!isPending && !isSinging}
          onClick={() => {
            if (isPending || isSinging) {
              onPlaySong(
                row.original.id || "",
                row.original.visitId || "",
                row.original.numberSong || 0
              );
            }
          }}
        >
          {isPending ? (
            <Play className="h-4 w-4" />
          ) : isSinging ? (
            <Check className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
      );
    },
  },
  {
    id: "youtube",
    header: () => <div className="tracking-wider">YouTube</div>,
    cell: ({ row }) => {
      return (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={() => onOpenYouTube(row.original)}
        >
          <Youtube className="h-4 w-4" />
        </Button>
      );
    },
  },
  {
    id: "greeting",
    header: () => <div className="tracking-wider">Saludos</div>,
    cell: ({ row }) => {
      return (
        <GreetingCell
          greeting={row.original.greeting}
          onPlayGreeting={onPlayGreeting}
        />
      );
    },
  },
  {
    id: "likes",
    header: () => <div className="tracking-wider">Likes</div>,
    cell: ({ row }) => {
      const likes = row.original.likes || 0;
      return (
        <div className="flex items-center gap-1">
          <Heart className="h-4 w-4 text-red-500 fill-red-500" />
          <span className="font-medium text-gray-700">{likes}</span>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const isPending = (row.original.status as TSongStatus) === "pending";

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

            {isPending && (
              <DropdownMenuItem
                className="text-gray-600 tracking-wide text-2sm flex items-center"
                onClick={() =>
                  onCancelSong(
                    row.original.id || "",
                    row.original.visitId || "",
                    row.original.numberSong || 0
                  )
                }
              >
                <X className="h-4 w-4 text-red-500" />
                <div>Eliminar canción</div>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
