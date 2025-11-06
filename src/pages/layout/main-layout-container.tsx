import { AppSidebar } from "@/pages/layout/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/components/ui/breadcrumb";
import { Separator } from "@/shared/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/shared/components/ui/sidebar";
import { NotificationCenter } from "@/pages/layout/components/notification-center";
import { FC, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/shared/components/ui/button";
import { LogOut, Megaphone, Volume2 } from "lucide-react";
import { GreetingsModal } from "@/pages/layout/components/greetings-modal";
import { SoundPanel } from "@/pages/karaoke/shared/components/sound-panel";

type MainLayoutContainerProps = {
  children: React.ReactNode;
};

// Función para mapear rutas a nombres de pantalla
const getPageTitle = (pathname: string): string => {
  const routeMap: Record<string, string> = {
    "/": "Dashboard",
    "/users": "Gestión de Usuarios",
    "/visits-manage": "Gestión de Visitas",
    "/songs-manage": "Gestión de Canciones",
    "/maintenance": "Mantenimiento",
    "/company-manage": "Gestión de Empresas",
  };

  return routeMap[pathname] || "Página";
};

export const MainLayoutContainer: FC<MainLayoutContainerProps> = ({
  children,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPageTitle = getPageTitle(location.pathname);
  const { logout } = useAuth();
  const [isGreetingsModalOpen, setIsGreetingsModalOpen] = useState(false);
  const [isSoundPanelOpen, setIsSoundPanelOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 items-center gap-2 border-b px-4 border-gray-700 bg-gray-900 justify-between">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1 text-white hover:bg-gray-800" />
            <Separator orientation="vertical" className="mr-2 h-4 bg-gray-700" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#" className="text-white hover:text-gray-300">
                    Karaoke Bar !
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block text-gray-600" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-white">{currentPageTitle}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex items-center gap-2">
            {/* Botón de saludos */}
            {/* Panel de sonidos */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSoundPanelOpen(true)}
              className="relative p-2 hover:bg-gray-800 text-white"
            >
              <Volume2 className="text-white !w-7 !h-7" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsGreetingsModalOpen(true)}
              className="relative p-2 hover:bg-gray-800 text-white"
            >
              <Megaphone className="text-white !w-7 !h-7" />
            </Button>

            {/* Centro de notificaciones */}
            <NotificationCenter />

            {/* Botón de logout */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2 text-white hover:text-gray-300 hover:bg-gray-800"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </Button>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 px-10 bg-gray-900">{children}</div>
      </SidebarInset>

      {/* Modal de Saludos */}
      <GreetingsModal
        isOpen={isGreetingsModalOpen}
        onClose={() => setIsGreetingsModalOpen(false)}
      />

      {/* Panel de Sonidos */}
      <SoundPanel
        visible={isSoundPanelOpen}
        onClose={() => setIsSoundPanelOpen(false)}
      />
    </SidebarProvider>
  );
};
