import {
  getFirestore,
  doc,
  collection,
  runTransaction,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { IVisits } from "../types/visits.types";
import { KARAOKE_CONSTANTS } from "../constants/global.constants";

export class ReservationServices {
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
   * Realiza una reserva atómica que incluye:
   * 1. Actualizar usuario a online
   * 2. Cambiar mesa a ocupada
   * 3. Crear visita
   */
  async createReservation(reservationData: {
    userId: string;
    userName: string;
    location: string;
    locationId: string;
  }): Promise<string> {
    return await this.executeWithRetry(async () => {
      return await runTransaction(this.db, async (transaction) => {
        // 1. Actualizar usuario a online (igual que userServices.updateStatusUser)
        const userRef = doc(
          this.db,
          KARAOKE_CONSTANTS.FIREBASE.COLLECTIONS.USERS,
          reservationData.userId
        );
        transaction.update(userRef, {
          "additionalInfo.isOnline": true,
          "additionalInfo.lastVisit": new Date(),
        });

        // 2. Cambiar mesa a ocupada (igual que locationServices.changeStatusLocation)
        const tableRef = doc(this.db, "Tables", reservationData.locationId);
        transaction.update(tableRef, { status: "occupied" });

        // 3. Crear visita (igual que visitServices.saveVisit)
        const visitData: IVisits = {
          userId: reservationData.userId,
          userName: reservationData.userName,
          location: reservationData.location,
          locationId: reservationData.locationId,
          status: "pending",
          // Campos adicionales como en saveVisit
          img: "",
          date: new Date(),
          points: 1,
          totalPayment: 0,
          songs: [],
          usersIds: [reservationData.userId],
        };

        const visitRef = doc(
          collection(this.db, KARAOKE_CONSTANTS.FIREBASE.COLLECTIONS.VISITS)
        );
        transaction.set(visitRef, {
          ...visitData,
          id: visitRef.id,
        });

        return visitRef.id;
      });
    }, "createReservation");
  }

  /**
   * Realiza la salida del host de forma atómica que incluye:
   * 1. Poner a todos los usuarios como offline
   * 2. Cancelar la visita
   * 3. Liberar la mesa
   */
  async hostExitTable(exitData: {
    visitId: string;
    locationId?: string;
    locationName?: string;
    userIds: string[];
  }): Promise<void> {
    await this.executeWithRetry(async () => {
      await runTransaction(this.db, async (transaction) => {
        // 1. Poner a TODOS los usuarios (host + invitados) como offline
        for (const userId of exitData.userIds) {
          const userRef = doc(
            this.db,
            KARAOKE_CONSTANTS.FIREBASE.COLLECTIONS.USERS,
            userId
          );
          transaction.update(userRef, {
            "additionalInfo.isOnline": false,
          });
        }

        // 2. Cancelar la visita
        const visitRef = doc(
          this.db,
          KARAOKE_CONSTANTS.FIREBASE.COLLECTIONS.VISITS,
          exitData.visitId
        );
        transaction.update(visitRef, {
          status: "cancelled",
        });

        // 3. Liberar la mesa
        if (exitData.locationId) {
          // Si tenemos locationId, usarlo directamente
          const tableRef = doc(this.db, "Tables", exitData.locationId);
          transaction.update(tableRef, {
            status: "available",
          });
        } else if (exitData.locationName) {
          // Si solo tenemos locationName, buscar la mesa por nombre dentro de la transacción
          const tablesRef = collection(this.db, "Tables");
          const q = query(
            tablesRef,
            where("name", "==", exitData.locationName)
          );
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const tableDoc = querySnapshot.docs[0];
            transaction.update(tableDoc.ref, {
              status: "available",
            });
          } else {
            console.error(
              `❌ No se encontró mesa con nombre: ${exitData.locationName}`
            );
          }
        }
      });
    }, "hostExitTable");
  }

  /**
   * Realiza la salida del invitado de forma atómica que incluye:
   * 1. Poner al invitado como offline
   * 2. Remover al invitado de la visita
   */
  async guestExitTable(exitData: {
    visitId: string;
    userId: string;
  }): Promise<void> {
    await this.executeWithRetry(async () => {
      await runTransaction(this.db, async (transaction) => {
        // IMPORTANTE: Todas las LECTURAS primero, luego las ESCRITURAS

        // 1. LECTURA: Leer la visita actual
        const visitRef = doc(
          this.db,
          KARAOKE_CONSTANTS.FIREBASE.COLLECTIONS.VISITS,
          exitData.visitId
        );
        const visitSnapshot = await transaction.get(visitRef);

        if (!visitSnapshot.exists()) {
          throw new Error("La visita no existe");
        }

        const visitData = visitSnapshot.data();

        // Filtrar el userId del array usersIds
        const updatedUsersIds = (visitData.usersIds || []).filter(
          (id: string) => id !== exitData.userId
        );

        // Filtrar el usuario de guestUsers
        const updatedGuestUsers = (visitData.guestUsers || []).filter(
          (guest: { userId: string }) => guest.userId !== exitData.userId
        );

        // 2. ESCRITURAS: Después de todas las lecturas

        // 2.1. Poner al invitado como offline
        const userRef = doc(
          this.db,
          KARAOKE_CONSTANTS.FIREBASE.COLLECTIONS.USERS,
          exitData.userId
        );
        transaction.update(userRef, {
          "additionalInfo.isOnline": false,
        });

        // 2.2. Remover al invitado de la visita
        transaction.update(visitRef, {
          usersIds: updatedUsersIds,
          guestUsers: updatedGuestUsers,
        });
      });
    }, "guestExitTable");
  }

  /**
   * Solicita unirse a una mesa ocupada
   * @param entryData - Datos de la solicitud de entrada
   */
  async requestEntryToOccupiedTable(entryData: {
    locationId: string;
    locationName: string;
    userId: string;
    userName: string;
  }): Promise<string> {
    await this.executeWithRetry(async () => {
      await runTransaction(this.db, async (transaction) => {
        // 1. Actualizar usuario a online
        const userRef = doc(this.db, "Users", entryData.userId);
        transaction.update(userRef, {
          "additionalInfo.isOnline": true,
          "additionalInfo.lastVisit": new Date(),
        });

        // 2. Buscar la visita activa en esa mesa
        const visitsRef = collection(this.db, "Visits");
        const visitQuery = query(
          visitsRef,
          where("locationId", "==", entryData.locationId),
          where("status", "==", "online")
        );
        const visitSnapshot = await getDocs(visitQuery);

        if (visitSnapshot.empty) {
          throw new Error("No se encontró una visita activa en esa mesa");
        }

        // Debería existir solo una visita activa por mesa
        const activeVisit = visitSnapshot.docs[0];
        const visitId = activeVisit.id;

        // 3. Crear documento de solicitud de entrada
        const entryRequestData = {
          locationId: entryData.locationId,
          locationName: entryData.locationName,
          visitId: visitId,
          userId: entryData.userId,
          userName: entryData.userName,
          status: "pending" as const,
          requestDate: new Date(),
        };

        const entryRef = doc(collection(this.db, "EntryRequests"));
        transaction.set(entryRef, entryRequestData);

        console.log(
          `✅ Solicitud de entrada creada para mesa ${entryData.locationName}`
        );
      });
    }, "requestEntryToOccupiedTable");

    return "Solicitud enviada correctamente";
  }
}
