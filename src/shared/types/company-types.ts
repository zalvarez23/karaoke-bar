import { Timestamp } from "firebase/firestore";

export type TCompanyStatus = "active" | "inactive";
export type TCompanyType =
  | "corporation"
  | "llc"
  | "partnership"
  | "sole_proprietorship";

export enum ECompanyStatus {
  "active" = 1,
  "inactive" = 0,
}

export interface ICompany {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  taxId: string; // RUC o Tax ID
  companyType: TCompanyType;
  status: ECompanyStatus;
  creationDate: Timestamp;
  contactPerson: string;
  website?: string;
  description?: string;
}

export interface ICreateCompany {
  name: string;
  email: string;
  phone: string;
  address: string;
  taxId: string;
  companyType: TCompanyType;
  contactPerson: string;
  website?: string;
  description?: string;
}

type TCompanyStatusValues = {
  status: string;
  color: "text-red" | "text-green";
};

export const getStatusValuesByCompanyStatus: Record<
  TCompanyStatus,
  TCompanyStatusValues
> = {
  active: { status: "Activa", color: "text-green" },
  inactive: { status: "Inactiva", color: "text-red" },
};
