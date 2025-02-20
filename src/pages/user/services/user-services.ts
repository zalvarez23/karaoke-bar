import { IUser } from "@/shared/types/user-types";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
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
          id: doc.id,
          ...doc.data(),
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
      console.log(`Usuario ${id} actualizado correctamente`);
    } catch (error) {
      console.error("Error updating user status:", error);
      throw new Error(`Error updating user status: ${error}`);
    }
  }
}
