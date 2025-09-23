import { VisitsServices } from "../../services/visits.services";
import { IVisits } from "../../types/visits.types";
import { useEffect, useState } from "react";

export const UseGetVisits = (userId: string) => {
  const [visits, setVisits] = useState<IVisits[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  const visitsServices = new VisitsServices();

  const getVisitsByUser = async () => {
    try {
      setIsLoading(true);
      // Obtener solo las visitas completadas para el historial
      const result = await visitsServices.getCompletedVisitsByUser(userId);

      // Ordenar por fecha descendente (más recientes primero)
      const sortedVisits = result.sort((a, b) => {
        // Manejar Firebase Timestamp format
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const getTimestamp = (date: any) => {
          if (!date) return 0;

          // Si es Firebase Timestamp (objeto con seconds y nanoseconds)
          if (
            typeof date === "object" &&
            date.seconds &&
            date.nanoseconds !== undefined
          ) {
            // Convertir a milisegundos de forma segura
            const seconds = Number(date.seconds);
            const nanoseconds = Number(date.nanoseconds);

            // Verificar que los valores sean válidos
            if (isNaN(seconds) || isNaN(nanoseconds)) {
              return 0;
            }

            // Convertir de forma segura para evitar overflow
            const milliseconds = Math.floor(nanoseconds / 1000000);
            return seconds * 1000 + milliseconds;
          }

          // Si es Date normal
          if (date instanceof Date) {
            return date.getTime();
          }

          // Si es string, intentar convertir
          if (typeof date === "string") {
            const parsedDate = new Date(date);
            return isNaN(parsedDate.getTime()) ? 0 : parsedDate.getTime();
          }

          return 0;
        };

        const timestampA = getTimestamp(a.date);
        const timestampB = getTimestamp(b.date);

        return timestampB - timestampA; // Descendente (más recientes primero)
      });

      setVisits(sortedVisits);
    } catch (error) {
      console.error("Error fetching visits:", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getVisitsByUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { visits, isLoading, isError, getVisitsByUser };
};
