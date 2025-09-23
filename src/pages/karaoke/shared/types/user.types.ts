import { TCardType } from "./card.types";

export type TUserStatus = "active" | "inactive";
export type TGenders = "M" | "F" | "O";
export type TUserVisitStatus = "pending" | "active" | "inactive";

export enum EUserStatus {
  "active" = 1,
  "inactive" = 0,
}

export enum EGenders {
  "male" = "M",
  "female" = "F",
  "other" = "O",
}

export interface IAdditionalInfo {
  isOnline: boolean;
  lastVisit: Date;
  cardType: TCardType;
  visits: number;
  points: number;
  currentVisit?: boolean;
}

export interface IUser {
  id: string;
  name: string;
  lastName: string;
  phone: number; // Obligatorio - se usa como usuario
  documentNumber: number;
  email?: string; // Opcional según requerimientos de Apple
  gender?: EGenders; // Opcional según requerimientos de Apple
  status: EUserStatus;
  creationDate: Date;
  password?: string;
  generatedUsername?: string; // Usuario generado automáticamente (teléfono)
  additionalInfo: IAdditionalInfo;
  accountDeletionRequest?: {
    requested: boolean;
    requestDate?: Date;
    reason?: string;
  };
}

export interface IUserLogin {
  username: string;
  password: string;
}



