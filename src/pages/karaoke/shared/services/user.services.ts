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
  }

  async register(user: IUser): Promise<string> {
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
  }

  async registerGuest(name: string): Promise<IUser> {
    // Generar un ID único para el invitado usando timestamp + random
    const guestId = `guest_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const guestUser: IUser = {
      id: "", // Se asignará después de crear el documento
      name: name.trim(),
      lastName: "", // Vacío para invitados
      phone: 0, // 0 para invitados
      documentNumber: 0, // 0 para invitados
      email: "", // Vacío para invitados
      gender: EGenders.other, // Valor por defecto
      status: EUserStatus.active,
      creationDate: new Date(),
      password: guestId, // Usar el ID generado como contraseña
      generatedUsername: guestId, // Usar el ID generado como usuario
      isGuest: true, // Marcar como usuario invitado
      additionalInfo: {
        cardType: "classic" as TCardType,
        isOnline: false,
        lastVisit: new Date(),
        visits: 0,
        points: 1,
      },
    };

    const usersCollection = collection(
      this.db,
      KARAOKE_CONSTANTS.FIREBASE.COLLECTIONS.USERS
    );
    const docRef = await addDoc(usersCollection, guestUser);

    // Retornar el usuario completo con el ID asignado
    return {
      ...guestUser,
      id: docRef.id,
    };
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
    const userDoc = doc(
      this.db,
      KARAOKE_CONSTANTS.FIREBASE.COLLECTIONS.USERS,
      userId
    );
    await updateDoc(userDoc, {
      password: newPassword.toLowerCase(),
    });
  }

  async requestAccountDeletion(
    userId: string,
    deletionRequest: {
      requested: boolean;
      requestDate: Date;
      reason: string;
    }
  ): Promise<void> {
    const userDoc = doc(
      this.db,
      KARAOKE_CONSTANTS.FIREBASE.COLLECTIONS.USERS,
      userId
    );
    await updateDoc(userDoc, {
      accountDeletionRequest: deletionRequest,
    });
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
