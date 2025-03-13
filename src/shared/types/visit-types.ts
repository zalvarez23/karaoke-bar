export type TSongStatus = "completed" | "singing" | "pending" | "cancelled";

export enum ESongStatus {
  "completed" = "Completado",
  "singing" = "Cantando",
  "pending" = "Pendiente",
  "cancelled" = "Cancelado",
}

export type TSongsRequested = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  note: string;
  round: number;
  numberSong: number;
  date: Date;
  status: TSongStatus | TVisitStatus;
  userName?: string;
  location?: string;
  userId?: string;
  visitId: string;
  usersIds?: string[];
};

export type TVisitStatus = "completed" | "pending" | "cancelled" | "online";
type TVisitStatusValue = {
  statusName: string;
  color: string;
};

export interface IVisits {
  id?: string;
  userId?: string;
  userName?: string;
  img?: string;
  points?: number;
  date?: Date;
  totalPayment?: number;
  songs?: TSongsRequested[];
  location?: string;
  status?: TVisitStatus;
  usersIds?: string[];
}

export type TVisitResponseDto = {
  visits: {
    id?: string;
    userId?: string;
    location?: string;
    userName?: string;
    img?: string;
  }[];
  songs: TSongsRequested[];
};

export const getStatusValue: Record<TVisitStatus, TVisitStatusValue> = {
  pending: { statusName: "Pendiente", color: "text-yellow-300" },
  online: { statusName: "En línea", color: "text-green-400" },
  cancelled: { statusName: "Cancelado", color: "text-red-400" },
  completed: { statusName: "Completado", color: "text-blue-400" },
};

export const getStatusSongValue: Record<TSongStatus, TVisitStatusValue> = {
  pending: { statusName: "Pendiente", color: "text-yellow-300" },
  singing: { statusName: "Cantando", color: "text-green-400" },
  cancelled: { statusName: "Cancelado", color: "text-red-400" },
  completed: { statusName: "Completado", color: "text-blue-400" },
};
