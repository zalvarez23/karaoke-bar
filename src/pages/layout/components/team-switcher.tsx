"use client";

import * as React from "react";
import { ChevronsUpDown, Plus } from "lucide-react";
import { KARAOKE_CONSTANTS } from "@/pages/karaoke/shared/constants/global.constants";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/shared/components/ui/sidebar";

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string;
    logo: React.ElementType;
    plan: string;
  }[];
}) {
  const { isMobile } = useSidebar();
  const [activeTeam, setActiveTeam] = React.useState(teams[0]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg  text-sidebar-primary-foreground">
                <activeTeam.logo
                  size="4"
                  className="size-7 text-danger-light text-xl "
                />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-white">
                  {activeTeam.name === "Karaoke"
                    ? `${activeTeam.name} v${KARAOKE_CONSTANTS.APP.VERSION}`
                    : activeTeam.name}
                </span>
                <span className="truncate text-xs text-gray-400">{activeTeam.plan}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-md bg-gray-800 border-gray-700"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-gray-400">
              Teams
            </DropdownMenuLabel>
            {teams.map((team, index) => (
              <DropdownMenuItem
                key={team.name}
                onClick={() => setActiveTeam(team)}
                className="gap-2 p-2 text-white hover:bg-gray-700"
              >
                <div className="flex size-6 items-center justify-center rounded-sm border border-gray-600">
                  <team.logo className="size-4 shrink-0" />
                </div>
                <span className="text-white">
                  {team.name === "Karaoke"
                    ? `${team.name} v${KARAOKE_CONSTANTS.APP.VERSION}`
                    : team.name}
                </span>
                <DropdownMenuShortcut className="text-gray-400">⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2 text-white hover:bg-gray-700">
              <div className="flex size-6 items-center justify-center rounded-md border border-gray-600 bg-gray-700">
                <Plus className="size-4 text-white" />
              </div>
              <div className="font-medium text-gray-300">Add team</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
