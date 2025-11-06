import React from "react";
import { Check, X, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";

export interface RequestEntry {
  id: string;
  userId: string;
  userName: string;
  locationName: string;
  timestamp: Date;
  status: "pending" | "accepted" | "rejected";
}

export interface RequestCardEntryProps {
  request: RequestEntry;
  onAccept: (requestId: string) => void;
  onReject: (requestId: string) => void;
  isProcessing?: boolean;
}

export const RequestCardEntry: React.FC<RequestCardEntryProps> = ({
  request,
  onAccept,
  onReject,
  isProcessing = false,
}) => {
  return (
    <Card className="w-full border border-gray-700 bg-gray-800 border-l-4 border-l-green-400 rounded-md">
      <CardContent className="p-3">
        {/* Texto descriptivo */}
        <div className="mb-2">
          <p className="text-sm text-gray-300">
            <span className="font-medium text-white">{request.userName}</span> quiere
            ingresar a la{" "}
            <span className="font-medium text-white">{request.locationName}</span>
          </p>
        </div>

        {/* Loading state */}
        {isProcessing && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            <span className="ml-2 text-sm text-gray-400">Procesando...</span>
          </div>
        )}

        {/* Botones de acción (solo si está pendiente y no está procesando) */}
        {request.status === "pending" && !isProcessing && (
          <div className="flex gap-1">
            <Button
              onClick={() => onReject(request.id)}
              className="flex-1 border-red-500 text-red-400 hover:bg-red-900/30 h-8"
              variant="outline"
              size="sm"
            >
              <X className="h-3 w-3 mr-1" />
              Rechazar
            </Button>
            <Button
              onClick={() => onAccept(request.id)}
              className="flex-1 border-green-500 text-green-400 hover:bg-green-900/30 h-8"
              variant="outline"
              size="sm"
            >
              <Check className="h-3 w-3 mr-1" />
              Aceptar
            </Button>
          </div>
        )}

        {/* Estado simple */}
        {request.status !== "pending" && (
          <div className="text-center">
            <p className="text-sm text-gray-400">
              {request.status === "accepted" && "✅ Aceptado"}
              {request.status === "rejected" && "❌ Rechazado"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
