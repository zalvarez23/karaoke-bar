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
  status: TSongStatus;
  userName?: string;
  location?: string;
  userId?: string;
  greeting?: string;
  likes?: number;
  visitId?: string;
};

export type TVisitStatus = "completed" | "pending" | "cancelled" | "online";

export type TGuestUsers = {
  status: "pending" | "online";
  userId: string;
  userName: string;
};

export interface IVisits {
  id?: string;
  userId?: string;
  usersIds?: string[];
  userName: string;
  img?: string;
  points?: number;
  date?: Date;
  totalPayment?: number;
  songs?: TSongsRequested[];
  location?: string;
  locationId?: string;
  status?: TVisitStatus;
  guestUsers?: TGuestUsers[];
  callWaiter?: boolean;
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



