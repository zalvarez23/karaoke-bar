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
      setVisits(result);
    } catch (_) {
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
