export type TLocationStatus = "available" | "occupied" | "inactive";

export enum ELocationsStatus {
  "available" = "Disponible",
  "occupied" = "Ocupado",
  "inactive" = "Inactivo",
}

export interface ILocations {
  id?: string;
  name: string;
  abbreviation: string;
  status: TLocationStatus;
}
