import React, { useEffect, useState } from "react";
import { Modal } from "@/shared/components/ui/modal";
import { IUser } from "@/pages/karaoke/shared/types/user.types";
import { IVisits, getStatusValue } from "@/shared/types/visit-types";
import { VisitsServices } from "../../visits-manage/services/visits-services";
import { formatDateLarge } from "@/shared/utils/format-date";
import { cn } from "@/lib/utils";
import { Timestamp } from "firebase/firestore";

interface UserHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: IUser | null;
}

export const UserHistoryModal: React.FC<UserHistoryModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const [visits, setVisits] = useState<IVisits[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !user?.id) return;

    setLoading(true);
    const visitsServices = new VisitsServices();

    const unsubscribe = visitsServices.getVisitsByUserOnSnapshot(
      user.id,
      (userVisits: IVisits[]) => {
        setVisits(userVisits);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
      setLoading(false);
    };
  }, [isOpen, user?.id]);

  const handleClose = () => {
    setVisits([]);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      title={`Historial de visitas - ${user?.name} ${user?.lastName}`}
      subTitle="Lista de todas las visitas realizadas por este usuario"
      onClose={handleClose}
    >
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-gray-500">Cargando historial...</div>
          </div>
        ) : visits.length === 0 ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-gray-500">
              No se encontraron visitas para este usuario
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {visits.map((visit) => (
              <div
                key={visit.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {visit.location || "Sin ubicación"}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {visit.date
                        ? formatDateLarge(visit.date as Timestamp)
                        : "Sin fecha"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {visit.status && (
                      <span
                        className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          getStatusValue[visit.status]?.color || "text-gray-500"
                        )}
                      >
                        {getStatusValue[visit.status]?.statusName ||
                          visit.status}
                      </span>
                    )}
                  </div>
                </div>

                {visit.songs && visit.songs.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Canciones ({visit.songs.length}):
                    </p>
                    <div className="space-y-1">
                      {visit.songs.slice(0, 3).map((song, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          • {song.title} - {song.status}
                        </div>
                      ))}
                      {visit.songs.length > 3 && (
                        <div className="text-sm text-gray-500">
                          ... y {visit.songs.length - 3} más
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {visit.points && (
                  <div className="mt-2">
                    <span className="text-sm text-gray-600">
                      Puntos:{" "}
                      <span className="font-medium">{visit.points}</span>
                    </span>
                  </div>
                )}

                {visit.totalPayment && (
                  <div className="mt-1">
                    <span className="text-sm text-gray-600">
                      Pago total:{" "}
                      <span className="font-medium">${visit.totalPayment}</span>
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};
