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
import { LogOut, Megaphone } from "lucide-react";
import { GreetingsModal } from "@/pages/layout/components/greetings-modal";

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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 items-center gap-2 border-b px-4 border-gray-40 justify-between">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Karaoke Bar !</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{currentPageTitle}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex items-center gap-2">
            {/* Botón de saludos */}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsGreetingsModalOpen(true)}
              className="relative p-2 hover:bg-gray-100"
            >
              <Megaphone className="text-gray-600 !w-7 !h-7" />
            </Button>

            {/* Centro de notificaciones */}
            <NotificationCenter />

            {/* Botón de logout */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </Button>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 px-10">{children}</div>
      </SidebarInset>

      {/* Modal de Saludos */}
      <GreetingsModal
        isOpen={isGreetingsModalOpen}
        onClose={() => setIsGreetingsModalOpen(false)}
      />
    </SidebarProvider>
  );
};
