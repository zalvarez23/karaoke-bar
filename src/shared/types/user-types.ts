import { Timestamp } from "firebase/firestore";
import { TCardType } from "./card-types";

export type TUserStatus = "active" | "inactive";
export type TGenders = "M" | "F" | "O";
export type TUserVisitStatus = "pending" | "active" | "inactive";
export type TUserStatusByOnline = "true" | "false";

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
  lastVisit: Timestamp;
  cardType: TCardType;
  visits: number;
}

export interface IUser {
  id: string;
  name: string;
  lastName: string;
  phone: number;
  documentNumber: number;
  email: string;
  gender: EGenders;
  status: EUserStatus;
  creationDate: Date;
  password?: string;
  additionalInfo: IAdditionalInfo;
}

export interface IUserLogin {
  documentNumber: string;
  password: string;
}
type TUserStatusByOnlineValues = {
  status: string;
  color: "text-red" | "text-green";
};

export const getStatusValuesByIsOnline: Record<
  TUserStatusByOnline,
  TUserStatusByOnlineValues
> = {
  true: { status: "Online", color: "text-green" },
  false: { status: "Offline", color: "text-red" },
};
