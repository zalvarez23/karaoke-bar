import { IUser } from "@/shared/types/user-types";

export interface IUserRepository {
  getAllUsersOnSnapshot(callback: (users: IUser[]) => void): () => void;
  updateStatusUser(id: string, isOnline: boolean): Promise<void>;
}
