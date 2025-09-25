import { ILocations, TLocationStatus } from "../types/location.types";

export interface ILocationsRepository {
  getLocations?(): Promise<ILocations[]>;
  /**
   * Escucha en tiempo real los cambios en la colección "Tables".
   * @param updateCallback Función que recibe los datos actualizados.
   */
  listenToLocations(updateCallback: (locations: ILocations[]) => void): void;

  /**
   * Detiene la escucha de los cambios en Firestore.
   */
  stopListening(): void;

  changeStatusLocation(idLocation: string, status: TLocationStatus): void;
}




