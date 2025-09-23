import { IUser } from "@/pages/karaoke/shared/types/user.types";
import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
  increment,
  deleteDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { IUserRepository } from "../repository/user-repository";
import { db } from "@/config/firebase";

export class UserServices implements IUserRepository {
  constructor() {}

  // Este método no retorna una Promise, sino la función de desuscripción
  getAllUsersOnSnapshot(callback: (users: IUser[]) => void): () => void {
    const unsubscribe = onSnapshot(
      collection(db, "Users"),
      (snapshot) => {
        const users: IUser[] = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as IUser[];
        callback(users);
      },
      (error) => {
        console.error("Error en tiempo real obteniendo usuarios:", error);
      }
    );
    return unsubscribe;
  }

  async updateStatusUser(id: string, isOnline: boolean): Promise<void> {
    try {
      const userRef = doc(db, "Users", id);
      await updateDoc(userRef, {
        "additionalInfo.isOnline": isOnline,
        "additionalInfo.lastVisit": new Date(),
      });
    } catch (error) {
      console.error("Error updating user status:", error);
      throw new Error(`Error updating user status: ${error}`);
    }
  }

  async incrementUserVisits(id: string): Promise<void> {
    try {
      const userRef = doc(db, "Users", id);
      await updateDoc(userRef, {
        "additionalInfo.visits": increment(1),
      });
    } catch (error) {
      console.error("Error incrementing user visits:", error);
      throw new Error(`Error incrementing user visits: ${error}`);
    }
  }

  async incrementUserVisitsWithPoints(
    id: string,
    points: number
  ): Promise<void> {
    try {
      const userRef = doc(db, "Users", id);
      await updateDoc(userRef, {
        "additionalInfo.visits": increment(1),
        "additionalInfo.points": increment(points),
      });
    } catch (error) {
      console.error("Error incrementing user visits with points:", error);
      throw new Error(`Error incrementing user visits with points: ${error}`);
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      // Validar que el ID no esté vacío
      if (!id || id.trim() === "") {
        throw new Error("ID de usuario vacío o inválido");
      }

      const userRef = doc(db, "Users", id);
      await deleteDoc(userRef);
    } catch (error) {
      throw new Error(`Error deleting user: ${error}`);
    }
  }

  // Método alternativo para eliminar usuario por generatedUsername si no tiene ID válido
  async deleteUserByUsername(generatedUsername: string): Promise<void> {
    try {
      if (!generatedUsername || generatedUsername.trim() === "") {
        throw new Error("GeneratedUsername vacío o inválido");
      }

      // Buscar el usuario por generatedUsername
      const usersCollection = collection(db, "Users");
      const q = query(
        usersCollection,
        where("generatedUsername", "==", generatedUsername)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error(
          `No se encontró usuario con username: ${generatedUsername}`
        );
      }

      // Eliminar el primer documento encontrado (debería ser único)
      const userDoc = querySnapshot.docs[0];
      await deleteDoc(doc(db, "Users", userDoc.id));
    } catch (error) {
      throw new Error(`Error deleting user by username: ${error}`);
    }
  }
}
