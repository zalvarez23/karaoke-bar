export type TDefaultStatus = 0 | 1;
export type TDefaultStatusColors = "text-red" | "text-green";

export enum EDefaultStatusDescriptionEnum {
  Inactivo = 0,
  Activo = 1,
}

type TDefaultStatusValues = {
  statusName: string;
  color: TDefaultStatusColors;
};

export const defaultStatusValues: Record<TDefaultStatus, TDefaultStatusValues> =
  {
    0: { statusName: "Inactivo", color: "text-red" },
    1: { statusName: "Activo", color: "text-green" },
  };
