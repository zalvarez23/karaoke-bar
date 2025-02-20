import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { IVisitsRepository } from "../repository/user-repository";
import { db } from "@/config/firebase";
import {
  IVisits,
  TSongsRequested,
  TSongStatus,
  TVisitStatus,
} from "@/shared/types/visit-types";
import { TLocationStatus } from "@/shared/types/location-types";

export class VisitsServices implements IVisitsRepository {
  constructor() {}

  // Este método no retorna una Promise, sino la función de desuscripción
  getAllVisitsOnSnapshot(callback: (visits: IVisits[]) => void): () => void {
    // Obtener el inicio de hoy (00:00:00)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calcular el inicio del día de ayer (15 si hoy es 16)
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    // Calcular el inicio del día siguiente a hoy (por ejemplo, 17 si hoy es 16)
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Convertir las fechas a Timestamps
    const startOfYesterday = Timestamp.fromDate(yesterday);
    const startOfTomorrow = Timestamp.fromDate(tomorrow);

    // La consulta trae documentos cuya fecha es mayor o igual al inicio de ayer
    // y menor al inicio de mañana (esto abarca ayer y hoy completos)
    const visitsQuery = query(
      collection(db, "Visits"),
      where("date", ">=", startOfYesterday),
      where("date", "<", startOfTomorrow),
      where("status", "in", ["pending", "online"]),
      orderBy("date", "desc"),
      orderBy("status", "asc"),
    );

    const unsubscribe = onSnapshot(
      visitsQuery,
      (snapshot) => {
        const visits: IVisits[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        callback(visits);
      },
      (error) => {
        console.error("Error en tiempo real obteniendo visitas:", error);
      },
    );

    return unsubscribe;
  }

  async updateVisitStatus(
    visitId: string,
    newStatus: TVisitStatus,
  ): Promise<void> {
    try {
      const visitRef = doc(db, "Visits", visitId);
      await updateDoc(visitRef, { status: newStatus });
      console.log(`Visita ${visitId} actualizada con estado: ${newStatus}`);
    } catch (error) {
      console.error(`Error actualizando visita ${visitId}:`, error);
      throw error;
    }
  }

  async updateLocationStatus(
    location: string,
    status: TLocationStatus,
  ): Promise<void> {
    try {
      const q = query(collection(db, "Tables"), where("name", "==", location));
      const snapshot = await getDocs(q);
      if (snapshot.empty)
        return console.error(
          `No se encontró una tabla con el nombre ${location}`,
        );
      await updateDoc(snapshot.docs[0].ref, { status });
      console.log(`Tabla ${location} actualizada con estado: ${status}`);
    } catch (error) {
      console.error(`Error actualizando location ${location}:`, error);
      throw error;
    }
  }

  async updateSongStatus(
    visitId: string,
    songId: string,
    numberSong: number,
    status: TSongStatus,
  ): Promise<void> {
    try {
      if (!visitId) {
        throw new Error("visitId is undefined");
      }
      const visitRef = doc(db, "Visits", visitId);
      const visitDoc = await getDoc(visitRef);

      if (!visitDoc.exists()) {
        throw new Error("Visit not found");
      }

      const data = visitDoc.data();
      const songs = data?.songs || [];

      // Actualiza el status de la canción que coincide con songId y numberSong
      const updatedSongs = songs.map((song: TSongsRequested) => {
        if (song.id === songId && song.numberSong === numberSong) {
          return { ...song, status };
        }
        return song;
      });

      await updateDoc(visitRef, { songs: updatedSongs });

      console.log("Song status updated successfully!");
    } catch (error) {
      console.error("Error updating song status:", error);
      throw error;
    }
  }
}
