"use client";

import React from "react";
import { useSidebarStore } from "@/store/sidebarStore";
import { Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

export function SidebarFooter() {
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);
  const router = useRouter();

  if (isCollapsed) {
    return (
      <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
        <ThemeToggle />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/settings")}
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
      <div className="flex items-center gap-2">
        <Button
          onClick={() => router.push("/settings")}
          variant="ghost"
          className="flex-1 justify-start"
        >
          <Settings className="w-4 h-4 mr-2" />
          <span className="text-sm">Settings</span>
        </Button>
        <ThemeToggle />
      </div>
    </div>
  );
}
