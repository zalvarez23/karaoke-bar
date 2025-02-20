import { IVisits, TVisitStatus } from "@/shared/types/visit-types";

export interface IVisitsRepository {
  getAllVisitsOnSnapshot(callback: (users: IVisits[]) => void): () => void;
  updateVisitStatus(visitId: string, newStatus: TVisitStatus): Promise<void>;
}
