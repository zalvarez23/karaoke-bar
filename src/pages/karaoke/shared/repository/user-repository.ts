import { IUser, IUserLogin } from "../types/user.types";

export interface IUserRepository {
  login?(loginUser: IUserLogin): Promise<IUser>;
  register(user: IUser): Promise<string>;
  updateStatusUser(id: string, isOnline: boolean): Promise<void>;
  listenToUser(
    userId: string,
    updateCallback: (user: IUser | null) => void
  ): () => void;

  getToUserById(
    updateCallback: (user: IUser | null) => void,
    userId: string
  ): void;
  /**
   * Detiene la escucha de los cambios en Firestore.
   */
  stopListening(): void;
}
