import { ReactNode, useEffect } from "react";
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

  // Efecto para redirigir cuando no hay usuario autenticado
  useEffect(() => {
    if (
      isInitialized &&
      (!state.user || (!state.user.id && !state.user.isGuest))
    ) {
      navigate(KARAOKE_ROUTES.LOGIN, { replace: true });
    }
  }, [isInitialized, state.user, navigate]);

  // Mostrar loading mientras se inicializa el contexto
  if (!isInitialized) {
    return <KaraokeLoadingScreen />;
  }

  // Si no hay usuario autenticado (ni usuario normal ni invitado), mostrar loading mientras redirige
  if (!state.user || (!state.user.id && !state.user.isGuest)) {
    return <KaraokeLoadingScreen />;
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
