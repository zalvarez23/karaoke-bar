export type TCardType = "classic" | "silver" | "gold" | "platinum";

export enum ECards {
  "classic" = "Clasica",
  "silver" = "Plata",
  "gold" = "Oro",
  "platinum" = "Platino",
}

export enum ECardDiscount {
  "classic" = 4,
  "silver" = 5,
  "gold" = 7,
  "platinum" = 10,
}

export enum ECardVisitRequired {
  "classic" = 15,
  "silver" = 25,
  "gold" = 40,
  "platinum" = 0,
}

export interface ICard {
  id: string;
  type: TCardType;
  name: string;
  visitRequired: number;
  benefits: string[];
  discount: number;
  status: boolean;
}




