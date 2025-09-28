import { useCallback } from "react";
import { STORAGE_KEYS } from "../../constants/global.constants";
import { IUser } from "../../types/user.types";

export const useUserStorage = () => {
  const setUser = useCallback(async (user: IUser | null) => {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSION_USER, JSON.stringify(user));
      console.log("User saved to localStorage:", user ? "success" : "cleared");
    } catch (err) {
      console.log(`Error saving user to localStorage: ${err}`);
    }
  }, []);

  const removeUser = useCallback(async () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.SESSION_USER);
      console.log("User removed from localStorage");
    } catch (err) {
      console.log(`Error removing user from localStorage: ${err}`);
    }
  }, []);

  const getUser = useCallback((): IUser | null => {
    try {
      const userData = localStorage.getItem(STORAGE_KEYS.SESSION_USER);

      if (userData) {
        const parsedUser = JSON.parse(userData) as IUser;
        return parsedUser;
      }
      return null;
    } catch (error) {
      return null;
    }
  }, []);

  return {
    setUser,
    getUser,
    removeUser,
  };
};
