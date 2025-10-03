import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
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
      orderBy("status", "asc")
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
      }
    );

    return unsubscribe;
  }

  async updateVisitStatus(
    visitId: string,
    newStatus: TVisitStatus
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

  async completeVisitWithPoints(
    visitId: string,
    points: number,
    totalConsumption: number
  ): Promise<void> {
    try {
      const visitRef = doc(db, "Visits", visitId);
      await updateDoc(visitRef, {
        status: "completed" as TVisitStatus,
        points: points,
        totalPayment: totalConsumption,
      });
      console.log(
        `Visita ${visitId} completada con ${points} puntos y S/ ${totalConsumption} de consumo`
      );
    } catch (error) {
      console.error(`Error completando visita ${visitId}:`, error);
      throw error;
    }
  }

  async updateLocationStatus(
    location: string,
    status: TLocationStatus
  ): Promise<void> {
    try {
      const q = query(collection(db, "Tables"), where("name", "==", location));
      const snapshot = await getDocs(q);
      if (snapshot.empty)
        return console.error(
          `No se encontró una tabla con el nombre ${location}`
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
    status: TSongStatus
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

  // Obtener visitas por usuario
  getVisitsByUserOnSnapshot(
    userId: string,
    callback: (visits: IVisits[]) => void
  ): () => void {
    const visitsQuery = query(
      collection(db, "Visits"),
      where("usersIds", "array-contains", userId),
      orderBy("date", "desc")
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
        console.error("Error obteniendo visitas del usuario:", error);
      }
    );

    return unsubscribe;
  }

  // Actualizar usersIds de una visita
  async updateVisitUsersIds(
    visitId: string,
    usersIds: string[]
  ): Promise<void> {
    try {
      const visitRef = doc(db, "Visits", visitId);
      await updateDoc(visitRef, { usersIds });
      console.log(`Visita ${visitId} actualizada con nuevos usersIds`);
    } catch (error) {
      console.error(`Error actualizando usersIds de visita ${visitId}:`, error);
      throw error;
    }
  }

  // Actualizar estado de llamada a la mesera
  async updateCallWaiterStatus(
    visitId: string,
    callWaiter: boolean
  ): Promise<void> {
    try {
      const visitRef = doc(db, "Visits", visitId);
      await updateDoc(visitRef, { callWaiter });
      console.log(
        `Visita ${visitId} actualizada - Llamada a mesera: ${callWaiter}`
      );
    } catch (error) {
      console.error(
        `Error actualizando llamada a mesera de visita ${visitId}:`,
        error
      );
      throw error;
    }
  }

  // Eliminar canción de una visita
  async removeSongFromVisit(
    visitId: string,
    songId: string,
    numberSong: number
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
      const songs: TSongsRequested[] = data?.songs || [];

      const updatedSongs = songs.filter(
        (song) => !(song.id === songId && song.numberSong === numberSong)
      );

      await updateDoc(visitRef, { songs: updatedSongs });

      console.log("Song removed successfully!");
    } catch (error) {
      console.error("Error removing song:", error);
      throw error;
    }
  }

  // Obtener una visita específica en tiempo real
  getVisitByIdOnSnapshot(
    visitId: string,
    callback: (visit: IVisits | null) => void
  ): () => void {
    const visitRef = doc(db, "Visits", visitId);

    const unsubscribe = onSnapshot(
      visitRef,
      (doc) => {
        if (doc.exists()) {
          const visitData = { id: doc.id, ...doc.data() } as IVisits;
          callback(visitData);
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error("Error obteniendo visita:", error);
        callback(null);
      }
    );

    return unsubscribe;
  }

  // Nuevo método para obtener solo visitas pendientes (para notificaciones)
  getPendingVisitsOnSnapshot(
    callback: (visits: IVisits[]) => void
  ): () => void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Calcular el inicio del día de ayer (15 si hoy es 16)
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    // Calcular el inicio del día siguiente a hoy (por ejemplo, 17 si hoy es 16)
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const startOfYesterday = Timestamp.fromDate(yesterday);
    const startOfTomorrow = Timestamp.fromDate(tomorrow);
    const pendingVisitsQuery = query(
      collection(db, "Visits"),
      where("date", ">=", startOfYesterday),
      where("date", "<", startOfTomorrow),
      where("status", "in", ["pending"]),
      orderBy("date", "desc"),
      orderBy("status", "asc")
    );

    const unsubscribe = onSnapshot(
      pendingVisitsQuery,
      (snapshot) => {
        const allVisits = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        callback(allVisits as IVisits[]);
      },
      (error) => {
        console.error(
          "Error en tiempo real obteniendo visitas pendientes:",
          error
        );
      }
    );

    return unsubscribe;
  }

  /**
   * Rechaza una visita de forma atómica usando transacción
   * @param visitId - ID de la visita a rechazar
   * @param location - Nombre de la ubicación/mesa
   * @param usersIds - Array de IDs de usuarios a actualizar
   */
  async rejectVisitWithTransaction(
    visitId: string,
    location: string,
    usersIds: string[]
  ): Promise<void> {
    try {
      // Buscar la mesa por nombre (fuera de transacción, como updateLocationStatus)
      const tablesRef = collection(db, "Tables");
      const q = query(tablesRef, where("name", "==", location));
      const tableSnapshot = await getDocs(q);

      if (tableSnapshot.empty) {
        console.error(`No se encontró una tabla con el nombre ${location}`);
        throw new Error(`No se encontró una tabla con el nombre ${location}`);
      }

      const tableRef = tableSnapshot.docs[0].ref;

      // Transacción que replica exactamente los 3 métodos originales
      await runTransaction(db, async (transaction) => {
        // 1. updateLocationStatus(location, "available")
        // Busca la mesa por nombre y actualiza su estado
        transaction.update(tableRef, {
          status: "available" as TLocationStatus,
        });

        // 2. updateVisitStatus(visitId, "cancelled")
        // Actualiza el estado de la visita
        const visitRef = doc(db, "Visits", visitId);
        transaction.update(visitRef, {
          status: "cancelled" as TVisitStatus,
        });

        // 3. updateStatusUser(userId, false) para cada usuario
        // Actualiza isOnline y lastVisit de cada usuario
        usersIds?.forEach((userId) => {
          const userRef = doc(db, "Users", userId);
          transaction.update(userRef, {
            "additionalInfo.isOnline": false,
            "additionalInfo.lastVisit": new Date(),
          });
        });
      });

      console.log(`Tabla ${location} actualizada con estado: available`);
      console.log(`Visita ${visitId} actualizada con estado: cancelled`);
      console.log(
        `✅ Visita ${visitId} rechazada exitosamente con transacción`
      );
    } catch (error) {
      console.error(`Error actualizando location ${location}:`, error);
      console.error(`Error actualizando visita ${visitId}:`, error);
      console.error(
        `❌ Error rechazando visita ${visitId} con transacción:`,
        error
      );
      throw error;
    }
  }

  /**
   * Completa una visita de forma atómica usando transacción
   * @param visitId - ID de la visita a completar
   * @param location - Nombre de la ubicación/mesa
   * @param usersIds - Array de IDs de usuarios a actualizar
   * @param points - Puntos a asignar
   * @param totalConsumption - Consumo total
   */
  async completeVisitWithTransaction(
    visitId: string,
    location: string,
    usersIds: string[],
    points: number,
    totalConsumption: number
  ): Promise<void> {
    try {
      // Buscar la mesa por nombre (fuera de transacción, como updateLocationStatus)
      const tablesRef = collection(db, "Tables");
      const q = query(tablesRef, where("name", "==", location));
      const tableSnapshot = await getDocs(q);

      if (tableSnapshot.empty) {
        console.error(`No se encontró una tabla con el nombre ${location}`);
        throw new Error(`No se encontró una tabla con el nombre ${location}`);
      }

      const tableRef = tableSnapshot.docs[0].ref;

      // Transacción que replica exactamente handleCompleteVisitWithPoints
      await runTransaction(db, async (transaction) => {
        // 1. updateLocationStatus(location, "available")
        transaction.update(tableRef, {
          status: "available" as TLocationStatus,
        });

        // 2. completeVisitWithPoints(visitId, points, totalConsumption)
        const visitRef = doc(db, "Visits", visitId);
        transaction.update(visitRef, {
          status: "completed" as TVisitStatus,
          points: points,
          totalPayment: totalConsumption,
        });

        // 3. updateStatusUser(userId, false) + incrementUserVisitsWithPoints(userId, points)
        // Para cada usuario: poner offline + incrementar visitas y puntos
        usersIds?.forEach((userId) => {
          const userRef = doc(db, "Users", userId);
          transaction.update(userRef, {
            "additionalInfo.isOnline": false,
            "additionalInfo.lastVisit": new Date(),
            "additionalInfo.visits": increment(1),
            "additionalInfo.points": increment(points),
          });
        });
      });

      console.log(`Tabla ${location} actualizada con estado: available`);
      console.log(
        `Visita ${visitId} completada con ${points} puntos y S/ ${totalConsumption} de consumo`
      );
      console.log(
        `✅ Visita ${visitId} completada exitosamente con transacción: ${usersIds.length} usuarios actualizados con ${points} puntos y S/ ${totalConsumption} de consumo`
      );
    } catch (error) {
      console.error(`Error actualizando location ${location}:`, error);
      console.error(`Error completando visita ${visitId}:`, error);
      console.error("Error al completar la visita:", error);
      throw error;
    }
  }
}
