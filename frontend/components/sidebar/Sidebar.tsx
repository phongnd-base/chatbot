"use client";

import React from "react";
import { useSidebarStore } from "@/store/sidebarStore";
import { useSessions, useFolders } from "@/hooks";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarContent } from "./SidebarContent";
import { SidebarFooter } from "./SidebarFooter";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);
  
  // Fetch data once at top level
  useSessions(); // This will fetch sessions once on mount
  useFolders();  // This will fetch folders once on mount

  return (
    <aside
      className={cn(
        "h-screen bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800",
        "flex flex-col transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-72"
      )}
    >
      <SidebarHeader />
      <SidebarContent />
      <SidebarFooter />
    </aside>
  );
}
