"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Bell, X, UserPlus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/lib/utils";
import { RequestCardVisit, RequestVisit } from "./request-card-visit";
import { RequestCardSong, RequestSong } from "./request-card-song";
import { VisitsServices } from "@/pages/visits-manage/services/visits-services";
import { SongsServices } from "@/pages/songs-manage/services/songs-services";
import { UserServices } from "@/pages/user/services/user-services";
import { IVisits, TSongsRequested } from "@/shared/types/visit-types";

export const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const [processingCardId, setProcessingCardId] = useState<string | null>(null);
  const [pendingVisits, setPendingVisits] = useState<IVisits[]>([]);
  const [pendingSongs, setPendingSongs] = useState<TSongsRequested[]>([]);

  const visitsServices = useCallback(() => new VisitsServices(), []);
  const songsServices = useCallback(() => new SongsServices(), []);
  const userServices = useCallback(() => new UserServices(), []);

  // Click fuera para cerrar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Escuchar visitas pendientes
  useEffect(() => {
    const unsubscribe = visitsServices().getPendingVisitsOnSnapshot(
      (visits) => {
        setPendingVisits(visits);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [visitsServices]);

  // Escuchar canciones pendientes
  useEffect(() => {
    const unsubscribe = songsServices().getPendingSongsOnSnapshot((songs) => {
      console.log(
        "🔔 NotificationCenter recibió canciones:",
        songs.songs.length
      );
      setPendingSongs(songs.songs);
    });

    return () => {
      unsubscribe();
    };
  }, [songsServices]);

  // Contar notificaciones totales
  const totalNotifications = pendingVisits.length + pendingSongs.length;

  // Convertir visitas pendientes al formato RequestVisit
  const convertVisitsToRequests = (visits: IVisits[]): RequestVisit[] => {
    return visits.map((visit) => ({
      id: visit.id || "",
      userId: visit.userId || "",
      userName: visit.userName || "Usuario desconocido",
      userEmail: undefined,
      tableId: visit.location || "",
      tableName: visit.location || "Mesa desconocida",
      timestamp: visit.date instanceof Date ? visit.date : new Date(),
      status: "pending" as const,
    }));
  };

  // Convertir canciones pendientes al formato RequestSong
  const convertSongsToRequests = (songs: TSongsRequested[]): RequestSong[] => {
    return songs.map((song) => ({
      id: song.id || "",
      visitId: song.visitId || "",
      title: song.title || "",
      tableName: song.location || "Mesa desconocida",
      userName: song.userName || "",
      timestamp: song.date instanceof Date ? song.date : new Date(),
    }));
  };

  // Funciones para aceptar y rechazar visitas
  const handleAcceptVisit = async (visitId: string) => {
    setProcessingCardId(visitId);
    try {
      await visitsServices().updateVisitStatus(visitId, "online");
    } catch (error) {
      console.error("Error al aceptar visita:", error);
    } finally {
      setProcessingCardId(null);
    }
  };

  const handleRejectVisit = async (
    visitId: string,
    location: string,
    usersIds: string[]
  ) => {
    setProcessingCardId(visitId);
    try {
      // Liberar la mesa
      await visitsServices().updateLocationStatus(location, "available");
      // Cambiar status de la visita a cancelled
      await visitsServices().updateVisitStatus(visitId, "cancelled");
      // Poner usuarios offline
      usersIds?.forEach((userId) => {
        userServices().updateStatusUser(userId, false);
      });
    } catch (error) {
      console.error("Error al rechazar visita:", error);
    } finally {
      setProcessingCardId(null);
    }
  };

  // Función para manejar canciones - redirigir a YouTube
  const handleViewSong = (songId: string) => {
    // Buscar la canción en pendingSongs para obtener el título
    const song = pendingSongs.find((s) => s.id === songId);
    if (!song) return;

    // Verificar si el ID es un link de YouTube válido
    const isYouTubeLink =
      songId.startsWith("http") && songId.includes("youtube.com");

    if (isYouTubeLink) {
      // Si es un link válido, abrirlo directamente
      window.open(songId, "_blank");
    } else {
      // Si no es un link válido, buscar en YouTube con el título de la canción
      const searchQuery = encodeURIComponent(song.title);
      const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;
      window.open(youtubeSearchUrl, "_blank");
    }
  };

  // Función para marcar canción como leída
  const handleMarkAsRead = async (songId: string) => {
    setProcessingCardId(songId);
    try {
      // Buscar la canción en pendingSongs para obtener los datos necesarios
      const song = pendingSongs.find((s) => s.id === songId);
      if (!song) return;

      await songsServices().markSongAsRead(
        song.visitId || "",
        song.id,
        song.numberSong || 0
      );
    } catch (error) {
      console.error("Error al marcar canción como leída:", error);
    } finally {
      setProcessingCardId(null);
    }
  };

  // Convertir datos a requests
  const visitRequests = convertVisitsToRequests(pendingVisits);
  const songRequests = convertSongsToRequests(pendingSongs);

  // Mostrar total de notificaciones en el contador
  const totalUnreadCount = totalNotifications;

  return (
    <div className="relative">
      {/* Botón de la campana */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100"
      >
        <Bell className="text-gray-600 !w-6 !h-6" />
        {totalUnreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold"
          >
            {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
          </Badge>
        )}
      </Button>

      {/* Panel deslizante de notificaciones */}
      <div
        ref={panelRef}
        className={cn(
          "fixed top-0 right-0 h-full w-96 bg-white shadow-2xl border-l border-gray-200 z-50 transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Contenido del panel */}
        <div className="h-full flex flex-col">
          {/* Header del panel */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Notificaciones
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="p-2 h-8 w-8 hover:bg-gray-200"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Contenido principal */}
          <div className="flex-1 overflow-y-auto">
            {/* Mostrar solicitudes de visitas y canciones */}
            {visitRequests.length === 0 && songRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <UserPlus className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay notificaciones
                </h3>
                <p className="text-sm text-gray-500">
                  Las visitas pendientes y canciones aparecerán aquí.
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {/* Visitas pendientes */}
                {visitRequests.map((request) => (
                  <RequestCardVisit
                    key={`visit-${request.id}`}
                    request={request}
                    onAccept={handleAcceptVisit}
                    onReject={(requestId) => {
                      const visit = pendingVisits.find(
                        (v) => v.id === requestId
                      );
                      if (visit && visit.location) {
                        handleRejectVisit(
                          requestId,
                          visit.location,
                          visit.usersIds || []
                        );
                      }
                    }}
                    isProcessing={processingCardId === request.id}
                  />
                ))}

                {/* Canciones pendientes */}
                {songRequests.map((request) => (
                  <RequestCardSong
                    key={`song-${request.id}`}
                    request={request}
                    onViewSong={handleViewSong}
                    onMarkAsRead={handleMarkAsRead}
                    isProcessing={processingCardId === request.id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
