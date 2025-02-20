export type TCardType = "classic" | "silver" | "gold" | "platinum";

export enum ecards {
  "classic" = "clasica",
  "silver" = "plata",
  "gold" = "oro",
  "platinum" = "platino",
}

export enum ecarddiscount {
  "classic" = 4,
  "silver" = 5,
  "gold" = 7,
  "platinum" = 10,
}

export enum ecardvisitrequired {
  "classic" = 15,
  "silver" = 25,
  "gold" = 40,
  "platinum" = 0,
}

export interface icard {
  id: string;
  type: TCardType;
  name: string;
  visitrequired: number;
  benefits: string[];
  discount: number;
  status: boolean;
}
