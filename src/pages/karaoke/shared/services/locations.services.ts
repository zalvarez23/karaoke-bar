import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  updateDoc,
  query,
  where,
  getDocs,
  Unsubscribe,
} from "firebase/firestore";
import { ILocationsRepository } from "../repository/locations-repository";
import { ILocations, TLocationStatus } from "../types/location.types";

export class LocationServices implements ILocationsRepository {
  private unsubscribe: Unsubscribe | null = null;
  private db = getFirestore();

  constructor() {}

  /**
   * Escucha en tiempo real los cambios en la colección "Tables"
   */
  listenToLocations(updateCallback: (locations: ILocations[]) => void) {
    const tablesRef = collection(this.db, "Tables");

    this.unsubscribe = onSnapshot(
      tablesRef,
      (querySnapshot) => {
        if (querySnapshot.empty) {
          updateCallback([]);
          return;
        }

        const locations = querySnapshot.docs.map((doc) => ({
          ...(doc.data() as ILocations),
          id: doc.id,
        }));

        updateCallback(locations);
      },
      (error) => {
        console.error("Error al escuchar cambios en la base de datos:", error);
      }
    );
  }

  /**
   * Detiene la escucha de los cambios en Firestore
   */
  stopListening() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  /**
   * Actualiza el estado de una ubicación en Firestore
   * @param idLocation - ID de la ubicación en Firestore
   * @param status - Nuevo estado de la ubicación
   */
  async changeStatusLocation(
    idLocation: string,
    status: TLocationStatus
  ): Promise<void> {
    try {
      const locationRef = doc(this.db, "Tables", idLocation);

      await updateDoc(locationRef, { status });

      console.log(
        `Estado de la ubicación ${idLocation} actualizado a ${status}`
      );
    } catch (error) {
      console.error(`Error al actualizar el estado de la ubicación: ${error}`);
      throw new Error(
        `No se pudo actualizar el estado de la ubicación ${idLocation}`
      );
    }
  }

  /**
   * Actualiza el estado de una ubicación en Firestore por nombre
   * @param locationName - Nombre de la ubicación
   * @param status - Nuevo estado de la ubicación
   */
  async changeStatusLocationByName(
    locationName: string,
    status: TLocationStatus
  ): Promise<void> {
    try {
      console.log(`🔍 Buscando mesa por nombre: ${locationName}`);

      // Buscar la ubicación por nombre
      const tablesRef = collection(this.db, "Tables");
      const q = query(tablesRef, where("name", "==", locationName));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.error(`❌ No se encontró mesa con nombre: ${locationName}`);
        throw new Error(`No se encontró mesa con nombre: ${locationName}`);
      }

      // Actualizar el estado de la primera mesa encontrada
      const locationDoc = querySnapshot.docs[0];
      await updateDoc(locationDoc.ref, { status });

      console.log(
        `✅ Estado de la mesa "${locationName}" (ID: ${locationDoc.id}) actualizado a ${status}`
      );
    } catch (error) {
      console.error(
        `❌ Error al actualizar el estado de la mesa por nombre: ${error}`
      );
      throw new Error(
        `No se pudo actualizar el estado de la mesa "${locationName}"`
      );
    }
  }
}
