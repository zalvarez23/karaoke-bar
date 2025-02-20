import { collection, onSnapshot, query, where } from "firebase/firestore";
import { ISongsRepository } from "../repository/songs-repository";
import { db } from "@/config/firebase";
import { IVisits, TVisitResponseDto } from "@/shared/types/visit-types";

export class SongsServices implements ISongsRepository {
  constructor() {}

  getTimestamp(dateObj: any): number {
    if (dateObj.seconds !== undefined && dateObj.nanoseconds !== undefined) {
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
        })),
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

  getAllSongsOnSnapshot(
    callback: (visits: TVisitResponseDto) => void,
  ): () => void {
    const visitsQuery = query(
      collection(db, "Visits"),
      where("status", "in", ["pending", "online"]),
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
      },
    );

    return unsubscribe;
  }
}
