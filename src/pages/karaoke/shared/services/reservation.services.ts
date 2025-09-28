import {
  getFirestore,
  doc,
  collection,
  runTransaction,
} from "firebase/firestore";
import { IVisits } from "../types/visits.types";
import { KARAOKE_CONSTANTS } from "../constants/global.constants";

export class ReservationServices {
  private db = getFirestore();

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
  }
}
