import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
  runTransaction,
  arrayUnion,
  onSnapshot,
} from "firebase/firestore";
import { TEntryRequest } from "../types/visits.types";

export class EntryRequestsServices {
  private db = getFirestore();
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1 segundo

  /**
   * Ejecuta una función con reintentos
   */
  private async executeWithRetry<T>(
    fn: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    let lastError: Error | unknown;

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        console.log(
          `🔄 ${operationName} - Intento ${attempt}/${this.MAX_RETRIES}`
        );
        const result = await fn();
        console.log(`✅ ${operationName} - Éxito en intento ${attempt}`);
        return result;
      } catch (error) {
        lastError = error;
        console.error(
          `❌ ${operationName} - Fallo en intento ${attempt}:`,
          error
        );

        if (attempt < this.MAX_RETRIES) {
          console.log(
            `⏳ Esperando ${this.RETRY_DELAY}ms antes del siguiente intento...`
          );
          await new Promise((resolve) => setTimeout(resolve, this.RETRY_DELAY));
        }
      }
    }

    console.error(
      `❌ ${operationName} - Falló después de ${this.MAX_RETRIES} intentos`
    );
    throw lastError;
  }

  /**
   * Obtiene todas las solicitudes de entrada pendientes para una visita específica
   * @param visitId - ID de la visita
   * @returns Array de EntryRequests pendientes
   */
  async getPendingEntryRequestsByVisit(
    visitId: string
  ): Promise<TEntryRequest[]> {
    try {
      const entryRequestsRef = collection(this.db, "EntryRequests");
      const q = query(
        entryRequestsRef,
        where("visitId", "==", visitId),
        where("status", "==", "pending")
      );

      const querySnapshot = await getDocs(q);
      const entryRequests: TEntryRequest[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        entryRequests.push({
          id: doc.id,
          locationId: data.locationId,
          locationName: data.locationName,
          visitId: data.visitId,
          userId: data.userId,
          userName: data.userName,
          status: data.status,
          requestDate: data.requestDate.toDate(),
        });
      });

      console.log(
        `✅ Se encontraron ${entryRequests.length} solicitudes pendientes para la visita ${visitId}`
      );
      return entryRequests;
    } catch (error) {
      console.error("❌ Error obteniendo solicitudes de entrada:", error);
      throw error;
    }
  }

  /**
   * Obtiene todas las solicitudes de entrada (sin filtros)
   * @returns Array de todas las EntryRequests
   */
  async getAllEntryRequests(): Promise<TEntryRequest[]> {
    try {
      const entryRequestsRef = collection(this.db, "EntryRequests");
      const querySnapshot = await getDocs(entryRequestsRef);
      const entryRequests: TEntryRequest[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        entryRequests.push({
          id: doc.id,
          locationId: data.locationId,
          locationName: data.locationName,
          visitId: data.visitId,
          userId: data.userId,
          userName: data.userName,
          status: data.status,
          requestDate: data.requestDate.toDate(),
        });
      });

      console.log(
        `✅ Se encontraron ${entryRequests.length} solicitudes de entrada en total`
      );
      return entryRequests;
    } catch (error) {
      console.error(
        "❌ Error obteniendo todas las solicitudes de entrada:",
        error
      );
      throw error;
    }
  }

  /**
   * Acepta una solicitud de entrada, actualiza la visita y elimina la solicitud
   * @param entryRequestId - ID de la solicitud de entrada
   * @param visitId - ID de la visita
   * @param userId - ID del usuario que solicita entrada
   */
  async acceptEntryRequest(
    entryRequestId: string,
    visitId: string,
    userId: string
  ): Promise<void> {
    await this.executeWithRetry(async () => {
      await runTransaction(this.db, async (transaction) => {
        // 1. Eliminar la solicitud de entrada
        const entryRequestRef = doc(this.db, "EntryRequests", entryRequestId);
        transaction.delete(entryRequestRef);

        // 2. Agregar el userId al array usersIds de la visita
        const visitRef = doc(this.db, "Visits", visitId);
        transaction.update(visitRef, {
          usersIds: arrayUnion(userId),
        });

        console.log(
          `✅ Solicitud de entrada eliminada y usuario agregado: ${entryRequestId}`
        );
      });

      console.log(`✅ Usuario ${userId} agregado a la visita ${visitId}`);
    }, "acceptEntryRequest");
  }

  /**
   * Rechaza una solicitud de entrada eliminando el documento
   * @param entryRequestId - ID de la solicitud de entrada
   */
  async rejectEntryRequest(entryRequestId: string): Promise<void> {
    await this.executeWithRetry(async () => {
      const entryRequestRef = doc(this.db, "EntryRequests", entryRequestId);
      await deleteDoc(entryRequestRef);

      console.log(
        `✅ Solicitud de entrada rechazada y eliminada: ${entryRequestId}`
      );
    }, "rejectEntryRequest");
  }

  /**
   * Elimina todas las solicitudes de entrada para una visita específica
   * @param visitId - ID de la visita
   */
  async deleteAllEntryRequestsForVisit(visitId: string): Promise<void> {
    try {
      const entryRequestsRef = collection(this.db, "EntryRequests");
      const q = query(entryRequestsRef, where("visitId", "==", visitId));

      const querySnapshot = await getDocs(q);
      const deletePromises = querySnapshot.docs.map((doc) =>
        deleteDoc(doc.ref)
      );

      await Promise.all(deletePromises);

      console.log(
        `✅ Se eliminaron ${querySnapshot.docs.length} solicitudes de entrada para la visita ${visitId}`
      );
    } catch (error) {
      console.error("❌ Error eliminando solicitudes de entrada:", error);
      throw error;
    }
  }

  /**
   * Escucha en tiempo real las solicitudes de entrada
   */
  listenToEntryRequests(
    callback: (requests: TEntryRequest[]) => void
  ): () => void {
    const entryRequestsRef = collection(this.db, "EntryRequests");

    const unsubscribe = onSnapshot(
      entryRequestsRef,
      (snapshot) => {
        const requests: TEntryRequest[] = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          requests.push({
            id: doc.id,
            locationId: data.locationId,
            locationName: data.locationName,
            visitId: data.visitId,
            userId: data.userId,
            userName: data.userName,
            status: data.status,
            requestDate: data.requestDate?.toDate() || new Date(),
          });
        });

        console.log(
          "📡 EntryRequests listener actualizado:",
          requests.length,
          "solicitudes"
        );
        callback(requests);
      },
      (error) => {
        console.error("❌ Error en listener de EntryRequests:", error);
      }
    );

    return unsubscribe;
  }
}
