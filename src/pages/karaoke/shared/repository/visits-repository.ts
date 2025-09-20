import {
  IVisits,
  TSongsRequested,
  TVisitResponseDto,
  TVisitStatus,
} from "../types/visits.types";

export interface IVisitsRepository {
  getVisitsByUser(userId: string): Promise<IVisits[]>;
  getCompletedVisitsByUser(userId: string): Promise<IVisits[]>;
  saveVisit(visit: IVisits): Promise<string>;
  updateStatus(visitId: string, newStatus: TVisitStatus): Promise<void>;
  getVisitByUserAndStatus(
    updateCallback: (visit: IVisits | null) => void,
    userId: string
  ): void;
  addSongToVisit(
    visitId: string | undefined,
    song: TSongsRequested
  ): Promise<void>;
  getAllVisits(updateCallback: (songs: TVisitResponseDto | null) => void): void;
  updateCallWaiter(visitId: string, callWaiter: boolean): Promise<void>;
}
