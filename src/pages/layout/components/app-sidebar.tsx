"use client";

import * as React from "react";
import {
  AudioWaveform,
  Bot,
  Command,
  Flame,
  Frame,
  Grid,
  PieChart,
  Map,
  Settings2,
  SquareTerminal,
  Tags,
  MicVocal,
  Table,
} from "lucide-react";

import { NavProjects } from "./nav-project";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/shared/components/ui/sidebar";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Karaoke",
      logo: Flame,
      plan: "Canta",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Mantenimiento",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        // {
        //   title: "Productos",
        //   url: "/",
        //   icon: Package,
        //   color: "text-danger-light",
        // },
        {
          title: "Clientes",
          url: "/users",
          icon: Tags,
          color: "text-primary-500",
        },
        {
          title: "Mesas",
          url: "/maintenance",
          icon: Table,
          color: "text-blue-500",
        },
        // {
        //   title: "Empresas",
        //   url: "/users",
        //   icon: Building,
        //   color: "text-secondary-500",
        // },
        // {
        //   title: "Categorias",
        //   url: "/users",
        //   icon: Grid,
        //   color: "text-brown-500",
        // },
        // {
        //   title: "Impuestos",
        //   url: "/taxes",
        //   icon: Grid,
        //   color: "text-red-500",
        // },
      ],
    },
    {
      title: "Operaciones",
      url: "#",
      icon: Bot,
      isActive: true,
      items: [
        {
          title: "Gestionar visitas",
          url: "visits-manage",
          icon: Grid,
          color: "text-rose-500",
        },
        {
          title: "Gestionar canciones",
          url: "songs-manage",
          icon: MicVocal,
          color: "text-green-500",
        },

        // {
        //   title: "Comprobantes",
        //   url: "#",
        //   icon: FileText,
        //   color: "text-orange-500",
        // },
      ],
    },
    {
      title: "Configuración",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Datos de la Empresa",
          url: "#",
        },
        {
          title: "Api Token",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Restaurante",
      url: "#",
      icon: Frame,
    },
    {
      name: "Karaoke",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Viajes",
      url: "#",
      icon: Map,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
