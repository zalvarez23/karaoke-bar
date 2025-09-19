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
import { FC } from "react";

type MainLayoutContainerProps = {
  children: React.ReactNode;
};
export const MainLayoutContainer: FC<MainLayoutContainerProps> = ({
  children,
}) => {
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
                  <BreadcrumbPage>Bienvenido !</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Centro de notificaciones */}
          <NotificationCenter />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 px-10">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
};
