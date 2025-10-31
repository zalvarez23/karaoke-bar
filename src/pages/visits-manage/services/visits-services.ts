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
  DocumentReference,
  arrayUnion,
  addDoc,
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

  /**
   * Obtiene todas las mesas disponibles
   */
  async getAllTables(): Promise<string[]> {
    try {
      console.log("🔍 Buscando mesas en Firebase...");
      const tablesRef = collection(db, "tables");

      // Primero intentar con filtro de status
      let q = query(tablesRef, where("status", "==", "active"));
      let querySnapshot = await getDocs(q);

      console.log("📊 Mesas con status 'active':", querySnapshot.docs.length);

      // Si no hay mesas con status active, obtener todas las mesas
      if (querySnapshot.empty) {
        console.log(
          "⚠️ No hay mesas con status 'active', obteniendo todas las mesas..."
        );
        q = query(tablesRef);
        querySnapshot = await getDocs(q);
      }

      const tables = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        console.log("📋 Mesa encontrada:", data);
        return data.name || data.tableName || `Mesa ${doc.id}`;
      });

      console.log("✅ Mesas obtenidas:", tables);

      // Si aún no hay mesas, usar fallback
      if (tables.length === 0) {
        console.log("🔄 No se encontraron mesas, usando fallback");
        return ["Mesa 1", "Mesa 2", "Mesa 3", "Mesa 4", "Mesa 5"];
      }

      return tables;
    } catch (error) {
      console.error("❌ Error obteniendo mesas:", error);
      // Fallback a mesas de ejemplo si hay error
      return ["Mesa 1", "Mesa 2", "Mesa 3", "Mesa 4", "Mesa 5"];
    }
  }

  /**
   * Busca una visita activa por ID de mesa o nombre de mesa
   */
  async getActiveVisitByTable(
    tableIdOrName: string,
    tableId?: string
  ): Promise<IVisits | null> {
    try {
      console.log(
        `🔍 Buscando visita activa para mesa: ${tableIdOrName}${
          tableId ? ` (ID: ${tableId})` : ""
        }`
      );

      // Primero intentar buscar por ID de la mesa si se proporciona
      if (tableId) {
        console.log(`🔍 Buscando visita por locationId: ${tableId}`);
        const visitsRef = collection(db, "Visits");
        const q = query(
          visitsRef,
          where("status", "==", "online"),
          where("locationId", "==", tableId)
        );

        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const visitDoc = querySnapshot.docs[0];
          console.log(`✅ Visita encontrada por locationId: ${tableId}`);
          return {
            id: visitDoc.id,
            ...visitDoc.data(),
          } as IVisits;
        }
        console.log(
          `⚠️ No se encontró visita por locationId: ${tableId}, intentando por nombre...`
        );
      }

      // Si no se encontró por ID, buscar por nombre normalizado
      console.log(
        `🔍 Buscando visita por nombre normalizado: ${tableIdOrName}`
      );

      // Normalizar el nombre de búsqueda
      const normalizedSearchName = tableIdOrName.toLowerCase().trim();

      const visitsRef = collection(db, "Visits");
      const allVisitsSnapshot = await getDocs(visitsRef);

      // Buscar coincidencia exacta normalizada
      const exactMatch = allVisitsSnapshot.docs.find((doc) => {
        const visitData = doc.data();
        if (visitData.status !== "active") return false;

        const tableName = visitData.tableName?.toLowerCase().trim();
        return tableName === normalizedSearchName;
      });

      if (exactMatch) {
        console.log(
          `✅ Visita encontrada por nombre exacto normalizado: ${tableIdOrName}`
        );
        return {
          id: exactMatch.id,
          ...exactMatch.data(),
        } as IVisits;
      }

      // Buscar coincidencia parcial (contiene)
      const partialMatch = allVisitsSnapshot.docs.find((doc) => {
        const visitData = doc.data();
        if (visitData.status !== "active") return false;

        const tableName = visitData.tableName?.toLowerCase().trim();
        return (
          tableName?.includes(normalizedSearchName) ||
          normalizedSearchName.includes(tableName)
        );
      });

      if (partialMatch) {
        console.log(
          `✅ Visita encontrada por coincidencia parcial: ${tableIdOrName}`
        );
        return {
          id: partialMatch.id,
          ...partialMatch.data(),
        } as IVisits;
      }

      console.log(
        `❌ No se encontró visita activa para mesa: ${tableIdOrName}`
      );
      return null;
    } catch (error) {
      console.error("Error buscando visita activa:", error);
      throw error;
    }
  }

  /**
   * Escuchar cambios en tiempo real para una visita activa por mesa
   */
  listenToActiveVisitByTable(
    tableIdOrName: string,
    tableId?: string,
    callback?: (visit: IVisits | null) => void
  ): () => void {
    console.log("🔍 Iniciando listener para mesa:", tableIdOrName, tableId);

    const unsubscribe = onSnapshot(
      collection(db, "Visits"),
      (snapshot) => {
        console.log("📡 Snapshot recibido, documentos:", snapshot.docs.length);

        const visits: IVisits[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as IVisits[];

        console.log("📋 Visitas encontradas:", visits.length);

        // Buscar visita activa para la mesa
        let activeVisit: IVisits | null = null;

        // Primero intentar por locationId si tenemos tableId
        if (tableId) {
          activeVisit =
            visits.find(
              (visit) =>
                visit.locationId === tableId && visit.status === "online"
            ) || null;
        }

        // Si no se encontró, buscar por location (nombre de mesa)
        if (!activeVisit) {
          activeVisit =
            visits.find(
              (visit) =>
                visit.location?.toLowerCase() === tableIdOrName.toLowerCase() &&
                visit.status === "online"
            ) || null;
        }

        console.log(
          "✅ Visita activa encontrada:",
          activeVisit?.id || "ninguna"
        );

        if (callback) {
          callback(activeVisit);
        }
      },
      (error) => {
        console.error("❌ Error en listener de visita:", error);
        if (callback) {
          callback(null);
        }
      }
    );

    return unsubscribe;
  }

  /**
   * Agrega una canción a una visita usando arrayUnion (como en karaoke)
   */
  async addSongToVisit(visitId: string, song: TSongsRequested): Promise<void> {
    try {
      const visitRef = doc(db, "Visits", visitId);

      // Usar el objeto song directamente (como en karaoke)
      const newSong = {
        ...song,
        status: "pending" as const,
        visitId,
      };

      // Usar arrayUnion para agregar la canción (como en karaoke)
      await updateDoc(visitRef, {
        songs: arrayUnion(newSong),
      });

      console.log("✅ Canción agregada exitosamente:", newSong.title);
    } catch (error) {
      console.error("❌ Error agregando canción a la visita:", error);
      throw error;
    }
  }

  /**
   * Busca una mesa por ID o por nombre normalizado
   * @param locationId - ID de la mesa (opcional)
   * @param location - Nombre de la mesa
   * @returns DocumentReference de la mesa encontrada o undefined
   */
  public async findTableByIdOrName(
    locationId?: string,
    location?: string
  ): Promise<DocumentReference | undefined> {
    let tableRef: DocumentReference | undefined;

    // Primero intentar buscar por ID
    if (locationId) {
      const tableDocRef = doc(db, "Tables", locationId);
      const tableSnapshot = await getDoc(tableDocRef);

      if (tableSnapshot.exists()) {
        tableRef = tableDocRef;
        console.log(`✅ Mesa encontrada por ID: ${locationId}`);
        return tableRef;
      }
    }

    // Si no se encontró por ID, buscar por nombre (normalizado)
    if (location) {
      console.log(
        `🔍 Mesa no encontrada por ID ${locationId}, buscando por nombre: ${location}`
      );
      const tablesRef = collection(db, "Tables");
      const allTablesSnapshot = await getDocs(tablesRef);

      // Normalizar el nombre de búsqueda
      const normalizedSearchName = location.toLowerCase().trim();

      // Buscar coincidencia exacta normalizada
      const exactMatch = allTablesSnapshot.docs.find((doc) => {
        const tableName = doc.data().name?.toLowerCase().trim();
        return tableName === normalizedSearchName;
      });

      if (exactMatch) {
        tableRef = exactMatch.ref;
        console.log(
          `✅ Mesa encontrada por nombre exacto normalizado: ${location} -> ${
            exactMatch.data().name
          }`
        );
        return tableRef;
      }

      // Buscar coincidencia parcial (contiene)
      const partialMatch = allTablesSnapshot.docs.find((doc) => {
        const tableName = doc.data().name?.toLowerCase().trim();
        return (
          tableName?.includes(normalizedSearchName) ||
          normalizedSearchName.includes(tableName)
        );
      });

      if (partialMatch) {
        tableRef = partialMatch.ref;
        console.log(
          `✅ Mesa encontrada por coincidencia parcial: ${location} -> ${
            partialMatch.data().name
          }`
        );
        return tableRef;
      }
    }

    return undefined;
  }

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

  /**
   * Escucha cambios en tiempo real para una visita específica por ID
   */
  getVisitByIdOnSnapshot(
    visitId: string,
    callback: (visit: IVisits | null) => void
  ): () => void {
    const visitRef = doc(db, "Visits", visitId);

    const unsubscribe = onSnapshot(
      visitRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const visit: IVisits = {
            id: docSnapshot.id,
            ...docSnapshot.data(),
          } as IVisits;
          callback(visit);
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error("Error escuchando visita:", error);
        callback(null);
      }
    );

    return unsubscribe;
  }

  /**
   * Actualiza el array de usersIds de una visita
   */
  async updateVisitUsersIds(
    visitId: string,
    usersIds: string[]
  ): Promise<void> {
    try {
      const visitRef = doc(db, "Visits", visitId);
      await updateDoc(visitRef, { usersIds });
      console.log(`Visita ${visitId} actualizada con usersIds:`, usersIds);
    } catch (error) {
      console.error(`Error actualizando usersIds de visita ${visitId}:`, error);
      throw error;
    }
  }

  /**
   * Escucha cambios en tiempo real para las visitas de un usuario específico
   */
  getVisitsByUserOnSnapshot(
    userId: string,
    callback: (visits: IVisits[]) => void
  ): () => void {
    const visitsRef = collection(db, "Visits");
    const visitsQuery = query(
      visitsRef,
      where("usersIds", "array-contains", userId)
    );

    const unsubscribe = onSnapshot(
      visitsQuery,
      (snapshot) => {
        const visits: IVisits[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as IVisits[];
        callback(visits);
      },
      (error) => {
        console.error("Error escuchando visitas del usuario:", error);
        callback([]);
      }
    );

    return unsubscribe;
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
   * @param locationId - ID de la mesa
   * @param isWebVisit - Indica si es una visita web (no actualiza usuarios)
   */
  async rejectVisitWithTransaction(
    visitId: string,
    location: string,
    usersIds: string[],
    locationId: string,
    isWebVisit: boolean = false
  ): Promise<void> {
    try {
      // Buscar mesa por ID o nombre normalizado
      const tableRef = await this.findTableByIdOrName(locationId, location);

      if (!tableRef) {
        console.error(
          `❌ No se encontró una tabla con ID ${locationId} ni con nombre ${location}`
        );
        throw new Error(
          `No se encontró una tabla con ID ${locationId} ni con nombre ${location}`
        );
      }

      console.log(
        `🔍 Procesando rechazo de visita ${visitId} - isWebVisit: ${isWebVisit}`
      );

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

        // 3. Solo actualizar usuarios si NO es una visita web
        if (!isWebVisit) {
          // updateStatusUser(userId, false) para cada usuario
          // Actualiza isOnline y lastVisit de cada usuario
          usersIds.forEach((userId) => {
            const userRef = doc(db, "Users", userId);
            transaction.update(userRef, {
              "additionalInfo.isOnline": false,
              "additionalInfo.lastVisit": new Date(),
            });
          });
        }
      });

      console.log(`Tabla ${location} actualizada con estado: available`);
      console.log(`Visita ${visitId} actualizada con estado: cancelled`);

      if (isWebVisit) {
        console.log(
          `✅ Visita web ${visitId} rechazada exitosamente - solo mesa liberada`
        );
      } else {
        console.log(
          `✅ Visita ${visitId} rechazada exitosamente con transacción - ${
            usersIds?.length || 0
          } usuarios actualizados`
        );
      }
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
   * @param locationId - ID de la mesa
   * @param isWebVisit - Indica si es una visita web (no actualiza usuarios)
   */
  async completeVisitWithTransaction(
    visitId: string,
    location: string,
    usersIds: string[],
    points: number,
    totalConsumption: number,
    locationId: string,
    isWebVisit: boolean = false
  ): Promise<void> {
    try {
      // Buscar mesa por ID o nombre normalizado
      const tableRef = await this.findTableByIdOrName(locationId, location);

      if (!tableRef) {
        console.error(
          `❌ No se encontró una tabla con ID ${locationId} ni con nombre ${location}`
        );
        throw new Error(
          `No se encontró una tabla con ID ${locationId} ni con nombre ${location}`
        );
      }

      console.log(
        `🔍 Procesando completado de visita ${visitId} - isWebVisit: ${isWebVisit}`
      );

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

        // 3. Solo actualizar usuarios si NO es una visita web
        if (!isWebVisit) {
          // updateStatusUser(userId, false) + incrementUserVisitsWithPoints(userId, points)
          // Para cada usuario: poner offline + incrementar visitas y puntos
          usersIds.forEach((userId) => {
            const userRef = doc(db, "Users", userId);
            transaction.update(userRef, {
              "additionalInfo.isOnline": false,
              "additionalInfo.lastVisit": new Date(),
              "additionalInfo.visits": increment(1),
              "additionalInfo.points": increment(points),
            });
          });
        }
      });

      console.log(`Tabla ${location} actualizada con estado: available`);
      console.log(
        `Visita ${visitId} completada con ${points} puntos y S/ ${totalConsumption} de consumo`
      );

      if (isWebVisit) {
        console.log(
          `✅ Visita web ${visitId} completada exitosamente - solo mesa liberada`
        );
      } else {
        console.log(
          `✅ Visita ${visitId} completada exitosamente con transacción: ${
            usersIds?.length || 0
          } usuarios actualizados con ${points} puntos y S/ ${totalConsumption} de consumo`
        );
      }
    } catch (error) {
      console.error(`Error actualizando location ${location}:`, error);
      console.error(`Error completando visita ${visitId}:`, error);
      console.error("Error al completar la visita:", error);
      throw error;
    }
  }

  async saveVisit(visit: IVisits): Promise<string> {
    // Agregar campos adicionales como en el móvil
    visit.img = "";
    visit.date = new Date();
    visit.points = 1;
    visit.totalPayment = 0;
    // Usar el estado proporcionado o 'online' por defecto para nuevas visitas
    visit.status = visit.status || "online";
    visit.songs = [];
    visit.usersIds = [visit.userId || ""];
    visit.isWebVisit = true;

    const visitsCollection = collection(db, "Visits");
    const docRef = await addDoc(visitsCollection, visit);
    return docRef.id;
  }

  /**
   * Crea una visita web y actualiza el estado de la mesa usando transacción
   * @param visit - Datos de la visita a crear
   * @param tableName - Nombre de la mesa a actualizar
   * @param tableId - ID de la mesa a actualizar
   */
  async createWebVisitWithTransaction(
    visit: IVisits,
    tableName: string,
    tableId: string
  ): Promise<string> {
    try {
      // Usar directamente el DocumentReference con el tableId
      const tableRef = doc(db, "Tables", tableId);

      // Preparar datos de la visita
      visit.img = "";
      visit.date = new Date();
      visit.points = 1;
      visit.totalPayment = 0;
      visit.status = visit.status || "online";
      visit.songs = [];
      visit.usersIds = [visit.userId || ""];
      visit.isWebVisit = true;

      console.log(
        `🔍 Creando visita web con transacción para mesa: ${tableName} (ID: ${tableId})`
      );

      // Transacción atómica: crear visita y actualizar mesa
      let visitId: string = "";
      await runTransaction(db, async (transaction) => {
        // 1. Crear la visita
        const visitsCollection = collection(db, "Visits");
        const visitRef = doc(visitsCollection);
        transaction.set(visitRef, visit);
        visitId = visitRef.id;

        // 2. Actualizar el estado de la mesa a "occupied"
        transaction.update(tableRef, {
          status: "occupied" as TLocationStatus,
        });
      });

      console.log(
        `✅ Visita web ${visitId} creada exitosamente con transacción`
      );
      console.log(
        `✅ Mesa ${tableName} (${tableId}) actualizada a ocupada con transacción`
      );

      return visitId;
    } catch (error) {
      console.error(`❌ Error creando visita web con transacción:`, error);
      throw error;
    }
  }
}
