import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  loginLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loginLoading, setLoginLoading] = useState<boolean>(false);

  useEffect(() => {
    // Verificar si hay una sesión guardada al cargar la aplicación
    const savedAuth = localStorage.getItem("isAuthenticated");
    const savedRole = localStorage.getItem("userRole");

    if (savedAuth === "true" && savedRole) {
      setIsAuthenticated(true);
      setUserRole(savedRole);
    }

    setLoading(false);
  }, []);

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    setLoginLoading(true);

    try {
      // Simular delay de autenticación
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Validar credenciales (case insensitive para usuario)
      const isValidUser = username.toLowerCase() === "administrador";
      const isValidPassword = password === "admin123";

      if (isValidUser && isValidPassword) {
        setIsAuthenticated(true);
        setUserRole("admin");
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userRole", "admin");
        return true;
      }

      return false;
    } finally {
      setLoginLoading(false);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    // La navegación se manejará en el componente que llama a logout
  };

  const value: AuthContextType = {
    isAuthenticated,
    userRole,
    login,
    logout,
    loading,
    loginLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};
