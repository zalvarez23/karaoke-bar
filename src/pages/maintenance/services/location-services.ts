import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { ILocations, TLocationStatus } from "@/shared/types/location-types";

export class LocationServices {
  constructor() {}

  // Obtener todas las ubicaciones en tiempo real
  getAllLocationsOnSnapshot(
    callback: (locations: ILocations[]) => void
  ): () => void {
    const unsubscribe = onSnapshot(
      collection(db, "Tables"),
      (snapshot) => {
        const locations: ILocations[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ILocations[];
        callback(locations);
      },
      (error) => {
        console.error("Error obteniendo ubicaciones:", error);
      }
    );
    return unsubscribe;
  }

  // Crear nueva ubicación
  async createLocation(locationData: ILocations): Promise<void> {
    try {
      await addDoc(collection(db, "Tables"), {
        name: locationData.name,
        abbreviation: locationData.abbreviation,
        status: locationData.status || "available",
      });
      console.log("Ubicación creada exitosamente");
    } catch (error) {
      console.error("Error creando ubicación:", error);
      throw error;
    }
  }

  // Actualizar ubicación
  async updateLocation(
    locationId: string,
    locationData: ILocations
  ): Promise<void> {
    try {
      const locationRef = doc(db, "Tables", locationId);
      await updateDoc(locationRef, {
        name: locationData.name,
        abbreviation: locationData.abbreviation,
        status: locationData.status,
      });
      console.log("Ubicación actualizada exitosamente");
    } catch (error) {
      console.error("Error actualizando ubicación:", error);
      throw error;
    }
  }

  // Eliminar ubicación
  async deleteLocation(locationId: string): Promise<void> {
    try {
      const locationRef = doc(db, "Tables", locationId);
      await deleteDoc(locationRef);
      console.log("Ubicación eliminada exitosamente");
    } catch (error) {
      console.error("Error eliminando ubicación:", error);
      throw error;
    }
  }

  // Actualizar estado de ubicación
  async updateLocationStatus(
    locationId: string,
    status: TLocationStatus
  ): Promise<void> {
    try {
      const locationRef = doc(db, "Tables", locationId);
      await updateDoc(locationRef, { status });
      console.log(`Estado de ubicación ${locationId} actualizado a: ${status}`);
    } catch (error) {
      console.error("Error actualizando estado de ubicación:", error);
      throw error;
    }
  }
}
