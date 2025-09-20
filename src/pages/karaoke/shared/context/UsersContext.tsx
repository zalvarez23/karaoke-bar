import { EGenders, IUser } from "../types/user.types";
import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { useNavigate } from "react-router-dom";
import { useUserStorage } from "../hooks/user/use-user-storage";
import { KARAOKE_ROUTES } from "../types";
import { UserServices } from "../services/user.services";

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
      isInitialized: boolean;
      setUser: (user: IUser) => void;
      updateOnlineStatus: (isOnline: boolean) => void;
      logout: () => Promise<void>;
    }
  | undefined
>(undefined);

// Proveedor de usuarios
export const UsersProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<UsersState>(initialUsersState);
  const [isInitialized, setIsInitialized] = useState(false);
  const navigate = useNavigate();
  const { setUser: setUserStorage, getUser: getUserStorage } = useUserStorage();

  // Cargar usuario del storage al inicializar
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initializeUser = async () => {
      // Solo ejecutar si no está inicializado
      if (isInitialized) return;

      try {
        const storedUser = await getUserStorage();
        if (storedUser) {
          setState((prevState) => ({
            ...prevState,
            user: storedUser,
          }));
          console.log(
            "🔄 Usuario cargado desde localStorage:",
            storedUser.name
          );

          // Iniciar listener en tiempo real para mantener el usuario actualizado
          const userServices = new UserServices();
          unsubscribe = userServices.listenToUser(
            storedUser.id,
            (updatedUser) => {
              if (updatedUser) {
                setState((prevState) => ({
                  ...prevState,
                  user: updatedUser,
                }));
                console.log(
                  "🔄 Usuario actualizado desde Firebase:",
                  updatedUser.name,
                  "isOnline:",
                  updatedUser.additionalInfo.isOnline
                );
              }
            }
          );
        }
      } catch (error) {
        console.error("Error al cargar usuario del storage:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeUser();

    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []); // Removida la dependencia getUserStorage

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
      value={{ state, isInitialized, setUser, updateOnlineStatus, logout }}
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
