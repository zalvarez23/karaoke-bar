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
  Unsubscribe,
} from "firebase/firestore";
import { IUserRepository } from "../repository/user-repository";
import { TCardType } from "../types/card.types";
import { EUserStatus, IUser, IUserLogin, EGenders } from "../types/user.types";
import { KARAOKE_CONSTANTS } from "../constants/global.constants";

export class UserServices implements IUserRepository {
  private unsubscribe: Unsubscribe | null = null;
  private db = getFirestore();

  constructor() {}

  async login(loginUser: IUserLogin): Promise<IUser> {
    try {
      const usersCollection = collection(
        this.db,
        KARAOKE_CONSTANTS.FIREBASE.COLLECTIONS.USERS
      );

      // Buscar por generatedUsername primero, luego por documentNumber para compatibilidad
      let querySnapshot = await getDocs(
        query(
          usersCollection,
          where("generatedUsername", "==", loginUser.username.toLowerCase())
        )
      );

      // Si no encuentra por generatedUsername, buscar por documentNumber (compatibilidad)
      if (querySnapshot.empty) {
        querySnapshot = await getDocs(
          query(
            usersCollection,
            where("documentNumber", "==", loginUser.username.toLowerCase())
          )
        );
      }

      if (querySnapshot.empty) {
        throw new Error("Usuario no encontrado, vuelva a intentarlo");
      }

      const document = querySnapshot.docs[0];
      const user = document.data() as IUser;

      if (user.password !== loginUser.password) {
        throw new Error("Contraseña incorrecta, vuelva a intentarlo");
      }

      return {
        ...user,
        id: document.id,
      };
    } catch (error) {
      throw error;
    }
  }

  async register(user: IUser): Promise<string> {
    try {
      user.creationDate = new Date();
      user.status = EUserStatus.active;

      // Usar el teléfono como usuario y contraseña
      const phoneAsUsername = user.phone.toString();
      user.generatedUsername = phoneAsUsername;
      user.password = phoneAsUsername;

      // Manejar campos opcionales
      if (!user.email) {
        user.email = ""; // Valor por defecto para email opcional
      }
      if (!user.gender) {
        user.gender = EGenders.other; // Valor por defecto para género opcional
      }

      user.additionalInfo = {
        cardType: "classic" as TCardType,
        isOnline: false,
        lastVisit: new Date(),
        visits: 0,
        points: 1,
      };

      const usersCollection = collection(
        this.db,
        KARAOKE_CONSTANTS.FIREBASE.COLLECTIONS.USERS
      );
      const docRef = await addDoc(usersCollection, user);
      return docRef.id;
    } catch (error) {
      throw error;
    }
  }

  getToUserById(
    updateCallback: (user: IUser | null) => void,
    userId: string
  ): void {
    const userDoc = doc(
      this.db,
      KARAOKE_CONSTANTS.FIREBASE.COLLECTIONS.USERS,
      userId
    );

    this.unsubscribe = onSnapshot(
      userDoc,
      (docSnapshot) => {
        if (!docSnapshot.exists()) {
          updateCallback(null);
          return;
        }

        updateCallback({
          ...(docSnapshot.data() as IUser),
          id: docSnapshot.id,
        });
      },
      (error) => {
        console.error("Error al escuchar cambios en la base de datos:", error);
      }
    );
  }

  stopListening() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    try {
      const userDoc = doc(
        this.db,
        KARAOKE_CONSTANTS.FIREBASE.COLLECTIONS.USERS,
        userId
      );
      await updateDoc(userDoc, {
        password: newPassword.toLowerCase(),
      });
    } catch (error) {
      throw error;
    }
  }

  async requestAccountDeletion(
    userId: string,
    deletionRequest: {
      requested: boolean;
      requestDate: Date;
      reason: string;
    }
  ): Promise<void> {
    try {
      const userDoc = doc(
        this.db,
        KARAOKE_CONSTANTS.FIREBASE.COLLECTIONS.USERS,
        userId
      );
      await updateDoc(userDoc, {
        accountDeletionRequest: deletionRequest,
      });
    } catch (error) {
      throw error;
    }
  }

  async updateStatusUser(id: string, isOnline: boolean): Promise<void> {
    console.log("updateStatusUser", id, isOnline);
    try {
      const userDoc = doc(
        this.db,
        KARAOKE_CONSTANTS.FIREBASE.COLLECTIONS.USERS,
        id
      );

      await updateDoc(userDoc, {
        "additionalInfo.isOnline": isOnline,
        "additionalInfo.lastVisit": new Date(),
      });
    } catch (error) {
      throw new Error(`Error updating user status: ${error}`);
    }
  }

  // Escuchar cambios del usuario en tiempo real
  listenToUser(
    userId: string,
    updateCallback: (user: IUser | null) => void
  ): () => void {
    const userDoc = doc(
      this.db,
      KARAOKE_CONSTANTS.FIREBASE.COLLECTIONS.USERS,
      userId
    );

    this.unsubscribe = onSnapshot(
      userDoc,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = {
            id: docSnapshot.id,
            ...docSnapshot.data(),
          } as IUser;
          updateCallback(userData);
        } else {
          updateCallback(null);
        }
      },
      (error) => {
        console.error("Error listening to user:", error);
        updateCallback(null);
      }
    );

    return () => {
      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
      }
    };
  }
}
