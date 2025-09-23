import { IUser } from "@/pages/karaoke/shared/types/user.types";

export interface IUserRepository {
  getAllUsersOnSnapshot(callback: (users: IUser[]) => void): () => void;
  updateStatusUser(id: string, isOnline: boolean): Promise<void>;
}
