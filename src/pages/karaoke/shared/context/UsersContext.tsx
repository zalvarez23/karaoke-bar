import { EGenders, IUser } from "../types/user.types";
import { createContext, useState, useContext, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStorage } from "../hooks/user/use-user-storage";
import { KARAOKE_ROUTES } from "../types";

// Definir el tipo de estado de los usuarios
type UsersState = {
  user: IUser;
};

// Estado inicial
const initialUsersState: UsersState = {
  user: {
    id: "",
    name: "",
    lastName: "",
    phone: 0,
    documentNumber: 0,
    email: "",
    status: 0,
    gender: EGenders.other,
    creationDate: new Date(),
    isGuest: false,
    additionalInfo: {
      isOnline: false,
      lastVisit: new Date(),
      cardType: "classic",
      visits: 0,
      points: 0,
    },
  },
};

// Contexto de usuarios
const UsersContext = createContext<
  | {
      state: UsersState;
      setUser: (user: IUser) => void;
      updateOnlineStatus: (isOnline: boolean) => void;
      logout: () => Promise<void>;
    }
  | undefined
>(undefined);

// Proveedor de usuarios
export const UsersProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<UsersState>(initialUsersState);
  const navigate = useNavigate();
  const { setUser: setUserStorage } = useUserStorage();

  // Actualizar el usuario
  const setUser = (user: IUser) => {
    setState((prevState) => ({
      ...prevState,
      user: user,
    }));
  };

  // Actualizar el estado de "isOnline"
  const updateOnlineStatus = (isOnline: boolean) => {
    setState((prevState) => ({
      ...prevState,
      user: {
        ...prevState.user,
        additionalInfo: {
          ...prevState.user.additionalInfo,
          isOnline,
        },
      },
    }));
  };

  // Función para cerrar sesión
  const logout = async () => {
    setState(initialUsersState);
    await setUserStorage(null); // Limpiar el storage y esperar
    navigate(KARAOKE_ROUTES.LOGIN, { replace: true });
  };

  return (
    <UsersContext.Provider
      value={{ state, setUser, updateOnlineStatus, logout }}
    >
      {children}
    </UsersContext.Provider>
  );
};

// Hook personalizado para usar el contexto de usuarios
export const useUsersContext = () => {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error("useUsersContext must be used within a UsersProvider");
  }
  return context;
};
