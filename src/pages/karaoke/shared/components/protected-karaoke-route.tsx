import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useUsersContext } from "../context";
import { KARAOKE_ROUTES } from "../types";
import Spinner from "./spinner";
import { KaraokeColors } from "../../colors";
import Typography from "./typography";

interface ProtectedKaraokeRouteProps {
  children: ReactNode;
}

export const ProtectedKaraokeRoute = ({
  children,
}: ProtectedKaraokeRouteProps) => {
  const { state, isInitialized } = useUsersContext();
  const navigate = useNavigate();

  // Mostrar loading mientras se inicializa el contexto
  if (!isInitialized) {
    return <KaraokeLoadingScreen />;
  }

  // Si no hay usuario autenticado, redirigir al login de karaoke
  if (!state.user || !state.user.id) {
    navigate(KARAOKE_ROUTES.LOGIN, { replace: true });
    return null;
  }

  // Si hay usuario, mostrar el contenido protegido
  return <>{children}</>;
};

// Componente de loading para mostrar mientras se verifica la autenticación
export const KaraokeLoadingScreen = () => {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: KaraokeColors.base.darkPrimary }}
    >
      <div className="text-center">
        <Spinner size={35} color={KaraokeColors.base.white} />
        <Typography
          variant="body-md-semi"
          className="mt-5 text-center"
          color={KaraokeColors.base.white}
        >
          Verificando autenticación...
        </Typography>
      </div>
    </div>
  );
};
