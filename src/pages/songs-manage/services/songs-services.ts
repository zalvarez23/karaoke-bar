import {
  collection,
  onSnapshot,
  query,
  where,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { ISongsRepository } from "../repository/songs-repository";
import { db } from "@/config/firebase";
import {
  IVisits,
  TSongsRequested,
  TVisitResponseDto,
} from "@/shared/types/visit-types";

export class SongsServices implements ISongsRepository {
  constructor() {}

  getTimestamp(
    dateObj: Date | { seconds: number; nanoseconds: number }
  ): number {
    if ("seconds" in dateObj && "nanoseconds" in dateObj) {
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

    // Función auxiliar para convertir el campo 'date' a timestamp (milisegundos)

    // Extraemos todas las canciones de las visitas y les añadimos los datos de la visita
    const allSongs = visits.flatMap((visit) =>
      (visit.songs || [])
        .filter((song) => song.status !== "completed")
        .map((song) => ({
          ...song,
          userId: visit.userId,
          location: visit.location,
          userName: visit.userName,
          visitId: visit.id,
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
    }) as TVisitResponseDto["songs"];

    return {
      visits: formattedVisits,
      songs: sortedSongs,
    };
  }

  getAllSongsOnSnapshot(
    callback: (visits: TVisitResponseDto) => void
  ): () => void {
    const visitsQuery = query(
      collection(db, "Visits"),
      where("status", "in", ["online"])
    );

    const unsubscribe = onSnapshot(
      visitsQuery,
      (snapshot) => {
        const visits: IVisits[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const songsFormatted = this.formatVisitsAndSongs(visits);
        callback(songsFormatted);
      },
      (error) => {
        console.error("Error en tiempo real obteniendo visitas:", error);
      }
    );

    return unsubscribe;
  }

  getPendingSongsOnSnapshot(
    callback: (visits: TVisitResponseDto) => void
  ): () => void {
    const visitsQuery = query(
      collection(db, "Visits"),
      where("status", "in", ["online"])
    );

    const unsubscribe = onSnapshot(
      visitsQuery,
      (snapshot) => {
        const visits: IVisits[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const songsFormatted = this.formatVisitsAndSongs(visits);

        // Filtrar solo canciones pendientes que NO estén marcadas como leídas
        const unreadPendingSongs = songsFormatted.songs.filter(
          (song) => song.status === "pending" && !song.notificationRead
        );

        // Crear un nuevo objeto con solo las canciones no leídas
        const filteredResponse = {
          ...songsFormatted,
          songs: unreadPendingSongs,
        };

        callback(filteredResponse);
      },
      (error) => {
        console.error("Error en tiempo real obteniendo visitas:", error);
      }
    );

    return unsubscribe;
  }

  // Marcar canción como leída
  async markSongAsRead(
    visitId: string,
    songId: string,
    numberSong: number
  ): Promise<void> {
    try {
      const visitRef = doc(db, "Visits", visitId);
      const visitDoc = await getDoc(visitRef);

      if (!visitDoc.exists()) {
        throw new Error("Visit not found");
      }

      const data = visitDoc.data();
      const songs = data?.songs || [];

      // Actualizar el campo notificationRead de la canción específica
      const updatedSongs = songs.map((song: TSongsRequested) => {
        if (song.id === songId && song.numberSong === numberSong) {
          return { ...song, notificationRead: true };
        }
        return song;
      });

      await updateDoc(visitRef, { songs: updatedSongs });
      console.log("Canción marcada como leída exitosamente!");
    } catch (error) {
      console.error("Error marcando canción como leída:", error);
      throw error;
    }
  }
}
