"use client";

import React from "react";
import { Play, Loader2, Check } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { formatDateToTime } from "@/shared/utils/format-date";

export interface RequestSong {
  id: string;
  visitId: string;
  title: string;
  userName: string;
  tableName: string;
  timestamp: Date;
}

interface RequestCardSongProps {
  request: RequestSong;
  onViewSong: (requestId: string) => void;
  onMarkAsRead: (requestId: string) => void;
  isProcessing?: boolean;
}

export const RequestCardSong: React.FC<RequestCardSongProps> = ({
  request,
  onViewSong,
  onMarkAsRead,
  isProcessing = false,
}) => {
  return (
    <Card className="w-full border border-gray-700 bg-gray-800 border-l-4 border-l-blue-400 rounded-md">
      <CardContent className="p-3">
        {/* Texto descriptivo */}
        <div className="mb-2">
          <p className="text-sm text-gray-300">
            <span className="font-medium text-white">{request.userName}</span> ha realizado
            un pedido de canción{" "}
            <span className="font-medium text-white">{request.title}</span> en la{" "}
            <span className="font-medium text-white">{request.tableName}</span>
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Hora:{" "}
            <span className="font-medium text-gray-300">
              {formatDateToTime(
                request.timestamp instanceof Date
                  ? {
                      seconds: Math.floor(request.timestamp.getTime() / 1000),
                      nanoseconds:
                        (request.timestamp.getTime() % 1000) * 1000000,
                    }
                  : request.timestamp
              )}
            </span>
          </p>
        </div>

        {/* Loading state */}
        {isProcessing && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            <span className="ml-2 text-sm text-gray-400">Procesando...</span>
          </div>
        )}

        {/* Botones de acción (solo si no está procesando) */}
        {!isProcessing && (
          <div className="flex gap-1">
            <Button
              onClick={() => onViewSong(request.id)}
              className="flex-1 border-blue-500 text-blue-400 hover:bg-blue-900/30 h-8"
              variant="outline"
              size="sm"
            >
              <Play className="h-3 w-3 mr-1" />
              Ver canción
            </Button>
            <Button
              onClick={() => onMarkAsRead(request.id)}
              className="flex-1 border-green-500 text-green-400 hover:bg-green-900/30 h-8"
              variant="outline"
              size="sm"
            >
              <Check className="h-3 w-3 mr-1" />
              Marcar como leído
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
