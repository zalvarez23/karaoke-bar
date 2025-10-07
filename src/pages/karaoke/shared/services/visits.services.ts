import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  getDoc,
  arrayUnion,
  runTransaction,
  Unsubscribe,
  DocumentReference,
} from "firebase/firestore";
import { IVisitsRepository } from "../repository/visits-repository";
import {
  IVisits,
  TSongsRequested,
  TVisitResponseDto,
  TVisitStatus,
} from "../types/visits.types";
import { KARAOKE_CONSTANTS } from "../constants/global.constants";

export class VisitsServices implements IVisitsRepository {
  private unsubscribe: Unsubscribe | null = null;
  private unsubscribeAllVisits: Unsubscribe | null = null;
  private db = getFirestore();

  constructor() {}

  async getVisitsByUser(userId: string): Promise<IVisits[]> {
    const visitsCollection = collection(
      this.db,
      KARAOKE_CONSTANTS.FIREBASE.COLLECTIONS.VISITS
    );
    const querySnapshot = await getDocs(
      query(visitsCollection, where("usersIds", "array-contains", userId))
    );

    if (querySnapshot.empty) {
      return [];
    }

    const documents = querySnapshot.docs;

    const visits = documents.map((doc) => {
      const visit = doc.data() as IVisits;
      return {
        ...visit,
        id: doc.id,
      };
    });

    return visits;
  }

  async getCompletedVisitsByUser(userId: string): Promise<IVisits[]> {
    const visitsCollection = collection(
      this.db,
      KARAOKE_CONSTANTS.FIREBASE.COLLECTIONS.VISITS
    );
    const querySnapshot = await getDocs(
      query(
        visitsCollection,
        where("usersIds", "array-contains", userId),
        where("status", "==", "completed")
      )
    );

    if (querySnapshot.empty) {
      return [];
    }

    const documents = querySnapshot.docs;

    const visits = documents.map((doc) => {
      const visit = doc.data() as IVisits;
      return {
        ...visit,
        id: doc.id,
      };
    });

    return visits;
  }

  /**
   * Verifica si un usuario tiene una visita online activa
   * @param userId - ID del usuario a verificar
   * @returns Promise con información sobre si tiene visita online
   */
  async checkUserOnlineVisit(
    userId: string
  ): Promise<{ hasOnlineVisit: boolean; onlineVisit?: IVisits }> {
    try {
      const visitsCollection = collection(
        this.db,
        KARAOKE_CONSTANTS.FIREBASE.COLLECTIONS.VISITS
      );
      // Buscar visitas del usuario con status "online"
      const querySnapshot = await getDocs(
        query(
          visitsCollection,
          where("usersIds", "array-contains", userId),
          where("status", "==", "online")
        )
      );

      if (querySnapshot.empty) {
        return {
          hasOnlineVisit: false,
        };
      }

      // Obtener la primera visita online encontrada
      const firstDoc = querySnapshot.docs[0];
      const onlineVisit: IVisits = {
        ...(firstDoc.data() as IVisits),
        id: firstDoc.id,
      };

      return {
        hasOnlineVisit: true,
        onlineVisit,
      };
    } catch (error) {
      console.error("Error checking user online visit:", error);
      throw error; // Lanzar el error para que el retry funcione
    }
  }

  async saveVisit(visit: IVisits): Promise<string> {
    // Agregar campos adicionales como en el móvil
    visit.img = "";
    visit.date = new Date();
    visit.points = 1;
    visit.totalPayment = 0;
    // Usar el estado proporcionado o 'pending' por defecto
    visit.status = visit.status || "pending";
    visit.songs = [];
    visit.usersIds = [visit.userId || ""];

    const visitsCollection = collection(
      this.db,
      KARAOKE_CONSTANTS.FIREBASE.COLLECTIONS.VISITS
    );
    const docRef = await addDoc(visitsCollection, visit);
    return docRef.id;
  }

  async updateStatus(visitId: string, newStatus: TVisitStatus): Promise<void> {
    const visitDoc = doc(
      this.db,
      KARAOKE_CONSTANTS.FIREBASE.COLLECTIONS.VISITS,
      visitId
    );
    await updateDoc(visitDoc, {
      status: newStatus,
    });
  }

  getVisitByUserAndStatus(
    updateCallback: (visit: IVisits | null) => void,
    userId: string
  ): void {
    const visitsCollection = collection(
      this.db,
      KARAOKE_CONSTANTS.FIREBASE.COLLECTIONS.VISITS
    );

    this.unsubscribe = onSnapshot(
      query(
        visitsCollection,
        where("usersIds", "array-contains", userId),
        where("status", "in", ["pending", "online"])
      ),
      (querySnapshot) => {
        if (querySnapshot.empty) {
          updateCallback(null);
          return;
        }

        const doc = querySnapshot.docs[0];
        const visit = doc.data() as IVisits;
        updateCallback({
          ...visit,
          id: doc.id,
        });
      },
      (error) => {
        console.error("Error listening to visits:", error);
      }
    );
  }

  async addSongToVisit(
    visitId: string | undefined,
    song: TSongsRequested
  ): Promise<void> {
    try {
      song.status = "pending";
      const visitRef = doc(
        this.db,
        KARAOKE_CONSTANTS.FIREBASE.COLLECTIONS.VISITS,
        visitId!
      );
      await updateDoc(visitRef, {
        songs: arrayUnion({
          ...song,
        }),
      });

      console.log("Song added successfully!");
    } catch (error) {
      console.error("Error adding song:", error);
      throw error;
    }
  }

  getAllVisits(
    updateCallback: (songs: TVisitResponseDto | null) => void
  ): void {
    const visitsCollection = collection(
      this.db,
      KARAOKE_CONSTANTS.FIREBASE.COLLECTIONS.VISITS
    );

    // Filtrar solo visitas con status 'online' como en el móvil
    const visitsQuery = query(
      visitsCollection,
      where("status", "in", ["online"])
    );

    this.unsubscribeAllVisits = onSnapshot(
      visitsQuery,
      (visitsSnapshot) => {
        if (visitsSnapshot.empty) {
          updateCallback(null);
          return;
        }

        const visits = visitsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as IVisits[];

        // Formatear las visitas y canciones como en el móvil
        const formattedData = this.formatVisitsAndSongs(visits);
        updateCallback(formattedData);
      },
      (error) => {
        console.error("Error listening to all visits:", error);
      }
    );
  }

  async updateCallWaiter(visitId: string, callWaiter: boolean): Promise<void> {
    const visitDoc = doc(
      this.db,
      KARAOKE_CONSTANTS.FIREBASE.COLLECTIONS.VISITS,
      visitId
    );
    await updateDoc(visitDoc, {
      callWaiter: callWaiter,
    });
  }

  stopListening(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    if (this.unsubscribeAllVisits) {
      this.unsubscribeAllVisits();
      this.unsubscribeAllVisits = null;
    }
  }

  async addUserToVisit(visitId: string, userId: string, userName: string) {
    try {
      // Validar que el usuario no se agregue a su propia mesa
      const visitDoc = await getDoc(doc(this.db, "Visits", visitId));
      if (!visitDoc.exists()) {
        throw new Error("La visita no existe");
      }

      const visitData = visitDoc.data();
      if (visitData?.userId === userId) {
        throw new Error("No puedes agregarte a tu propia mesa");
      }

      await updateDoc(doc(this.db, "Visits", visitId), {
        guestUsers: arrayUnion({
          userId,
          userName,
          status: "pending",
        }),
      });

      console.log(
        `✅ Usuario ${userName} agregado a la visita ${visitId} correctamente`
      );
    } catch (error) {
      console.error("❌ Error al agregar datos:", error);
      throw error;
    }
  }

  async acceptGuestUser(visitId: string, userId: string) {
    try {
      const visitRef = doc(this.db, "Visits", visitId);

      await runTransaction(this.db, async (transaction) => {
        const visitDoc = await transaction.get(visitRef);
        if (!visitDoc.exists()) {
          throw new Error("El documento de la visita no existe.");
        }
        const data = visitDoc.data();
        const guestUsers = data?.guestUsers || [];

        // Actualizamos el status del guestUser de 'pending' a 'online'
        const updatedGuestUsers = guestUsers.map(
          (guest: { userId: string; userName: string; status: string }) => {
            if (guest.userId === userId && guest.status === "pending") {
              return { ...guest, status: "online" };
            }
            return guest;
          }
        );

        // Actualizamos ambos campos en una sola operación atómica
        transaction.update(visitRef, {
          guestUsers: updatedGuestUsers,
          usersIds: arrayUnion(userId),
        });
      });

      console.log(
        `✅ Usuario ${userId} aceptado en la visita ${visitId} correctamente`
      );
    } catch (error) {
      console.error("❌ Error al aceptar usuario:", error);
    }
  }

  async rejectGuestUser(visitId: string, userId: string) {
    try {
      const visitRef = doc(this.db, "Visits", visitId);

      await runTransaction(this.db, async (transaction) => {
        const visitDoc = await transaction.get(visitRef);
        if (!visitDoc.exists()) {
          throw new Error("El documento de la visita no existe.");
        }
        const data = visitDoc.data();
        const guestUsers = data?.guestUsers || [];

        // Eliminamos el registro del guestUser que coincide con userId
        const updatedGuestUsers = guestUsers.filter(
          (guest: { userId: string; userName: string; status: string }) => {
            return guest.userId !== userId;
          }
        );

        // Actualizamos el documento con el array filtrado
        transaction.update(visitRef, {
          guestUsers: updatedGuestUsers,
        });
      });

      console.log(
        `✅ Registro del usuario ${userId} eliminado de la visita ${visitId} correctamente`
      );
    } catch (error) {
      console.error("❌ Error al eliminar el registro del usuario:", error);
    }
  }

  async removeSongFromVisit(
    visitId: string | undefined,
    songId: string,
    numberSong: number
  ): Promise<void> {
    try {
      if (!visitId) {
        throw new Error("visitId is undefined");
      }
      const visitRef = doc(this.db, "Visits", visitId);
      const visitDoc = await getDoc(visitRef);

      if (!visitDoc.exists()) {
        throw new Error("Visit not found");
      }

      const data = visitDoc.data();
      const songs: TSongsRequested[] = data?.songs || [];

      const updatedSongs = songs.filter(
        (song) => !(song.id === songId && song.numberSong === numberSong)
      );

      await updateDoc(visitRef, {
        songs: updatedSongs,
      });

      console.log("Song removed successfully!");
    } catch (error) {
      console.error("Error removing song:", error);
      throw error;
    }
  }

  async removeUserFromVisit(visitId: string, userId: string): Promise<void> {
    try {
      const visitRef = doc(this.db, "Visits", visitId);

      await runTransaction(this.db, async (transaction) => {
        const visitDoc = await transaction.get(visitRef);
        if (!visitDoc.exists()) {
          throw new Error("El documento de la visita no existe.");
        }
        const data = visitDoc.data();
        const guestUsers = data?.guestUsers || [];
        const usersIds = data?.usersIds || [];

        // Remover al usuario de guestUsers
        const updatedGuestUsers = guestUsers.filter(
          (guest: { userId: string; userName: string; status: string }) => {
            return guest.userId !== userId;
          }
        );

        // Remover al usuario de usersIds
        const updatedUsersIds = usersIds.filter((id: string) => id !== userId);

        // Actualizar el documento
        transaction.update(visitRef, {
          guestUsers: updatedGuestUsers,
          usersIds: updatedUsersIds,
        });
      });

      console.log(
        `✅ Usuario ${userId} removido de la visita ${visitId} correctamente`
      );
    } catch (error) {
      console.error("❌ Error al remover usuario de la visita:", error);
      throw error;
    }
  }

  async updateSongGreeting(
    visitId: string | undefined,
    songId: string,
    greeting: string
  ): Promise<void> {
    try {
      if (!visitId) {
        throw new Error("visitId is undefined");
      }

      const visitRef = doc(this.db, "Visits", visitId);
      const visitDoc = await getDoc(visitRef);

      if (!visitDoc.exists()) {
        throw new Error("Visit not found");
      }

      const data = visitDoc.data();
      const songs: TSongsRequested[] = data?.songs || [];

      // Encontrar y actualizar la canción específica
      const updatedSongs = songs.map((song) => {
        if (song.id === songId) {
          return {
            ...song,
            greeting,
          };
        }
        return song;
      });

      await updateDoc(visitRef, {
        songs: updatedSongs,
      });
    } catch (error) {
      console.error("Error updating song greeting:", error);
    }
  }

  async updateSongLikes(
    visitId: string | undefined,
    songId: string
  ): Promise<void> {
    try {
      if (!visitId) {
        throw new Error("visitId is undefined");
      }

      const visitRef = doc(this.db, "Visits", visitId);
      const visitDoc = await getDoc(visitRef);

      if (!visitDoc.exists()) {
        throw new Error("Visit not found");
      }

      const data = visitDoc.data();
      const songs: TSongsRequested[] = data?.songs || [];

      // Encontrar y actualizar la canción específica
      const updatedSongs = songs.map((song) => {
        if (song.id === songId) {
          const currentLikes = song.likes || 0;
          const newLikes = currentLikes + 1;
          return {
            ...song,
            likes: newLikes,
          };
        }
        return song;
      });

      await updateDoc(visitRef, {
        songs: updatedSongs,
      });

      console.log("Song likes updated successfully!");
    } catch (error) {
      console.error("Error updating song likes:", error);
    }
  }

  getTimestamp(
    dateObj: Date | { seconds: number; nanoseconds: number }
  ): number {
    if (
      typeof dateObj === "object" &&
      "seconds" in dateObj &&
      "nanoseconds" in dateObj
    ) {
      return dateObj.seconds * 1000 + dateObj.nanoseconds / 1e6;
    }
    return new Date(dateObj).getTime();
  }

  formatVisitsAndSongs(visits: IVisits[]): TVisitResponseDto {
    // Formateamos las visitas para conservar sólo los datos necesarios.
    const formattedVisits = visits.map((visit) => ({
      id: visit.id,
      userId: visit.userId,
      location: visit.location,
      userName: visit.userName,
      img: visit.img,
    }));

    // Extraemos todas las canciones de las visitas y les añadimos los datos de la visita
    const allSongs = visits.flatMap((visit) =>
      (visit.songs || [])
        .filter((song) => song.status !== "completed")
        .map((song) => ({
          ...song,
          userId: visit.userId,
          location: visit.location,
          userName: visit.userName,
          visitId: visit.id, // Agregar el visitId para poder actualizar likes
        }))
    );

    // Ordenamos globalmente las canciones por fecha (ascendente) y luego por numberSong
    const sortedSongs = allSongs.sort((a, b) => {
      const timeA = this.getTimestamp(a.date);
      const timeB = this.getTimestamp(b.date);
      if (timeA !== timeB) {
        return timeA - timeB; // orden ascendente por fecha
      }
      return a.numberSong - b.numberSong; // desempate por numberSong
    });

    return {
      visits: formattedVisits,
      songs: sortedSongs,
    };
  }

  /**
   * Elimina una visita completamente de la base de datos, libera la mesa y pone al usuario offline
   * @param visitId - ID de la visita a eliminar
   * @param locationId - ID de la mesa a liberar (opcional)
   * @param location - Nombre de la mesa a liberar (opcional)
   * @param userId - ID del usuario a poner offline (opcional)
   */
  async deleteVisit(
    visitId: string,
    locationId?: string,
    location?: string,
    userId?: string
  ): Promise<void> {
    try {
      const visitRef = doc(this.db, "Visits", visitId);

      // Usar transacción para eliminar visita, liberar mesa y poner usuario offline atómicamente
      await runTransaction(this.db, async (transaction) => {
        // 1. Obtener datos de la visita antes de eliminarla
        const visitDoc = await transaction.get(visitRef);
        if (!visitDoc.exists()) {
          throw new Error("La visita no existe");
        }

        const visitData = visitDoc.data();
        const userIdToUpdate = userId || visitData?.userId;

        // 2. Eliminar la visita
        transaction.delete(visitRef);

        // 3. Liberar la mesa si se proporciona información
        if (locationId || location) {
          // Usar la función reutilizable para buscar la mesa
          const tableRef = await this.findTableByIdOrName(locationId, location);

          // Liberar la mesa si se encontró
          if (tableRef) {
            transaction.update(tableRef, {
              status: "available",
            });
            console.log(`✅ Mesa liberada correctamente`);
          } else {
            console.warn(
              `⚠️ No se pudo encontrar la mesa para liberar (ID: ${locationId}, Nombre: ${location})`
            );
          }
        }

        // 4. Poner al usuario offline si se proporciona userId
        if (userIdToUpdate) {
          const userRef = doc(this.db, "Users", userIdToUpdate);
          transaction.update(userRef, {
            "additionalInfo.isOnline": false,
            "additionalInfo.lastVisit": new Date(),
          });
          console.log(
            `✅ Usuario ${userIdToUpdate} puesto offline correctamente`
          );
        }
      });

      console.log(
        `✅ Visita ${visitId} eliminada, mesa liberada y usuario puesto offline correctamente`
      );
    } catch (error) {
      console.error(`❌ Error eliminando visita ${visitId}:`, error);
      throw error;
    }
  }

  /**
   * Busca una mesa por ID o por nombre normalizado
   * @param locationId - ID de la mesa (opcional)
   * @param location - Nombre de la mesa
   * @returns DocumentReference de la mesa encontrada o undefined
   */
  private async findTableByIdOrName(
    locationId?: string,
    location?: string
  ): Promise<DocumentReference | undefined> {
    let tableRef: DocumentReference | undefined;

    // Primero intentar buscar por ID
    if (locationId) {
      const tableDocRef = doc(this.db, "Tables", locationId);
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
      const tablesRef = collection(this.db, "Tables");
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
}
