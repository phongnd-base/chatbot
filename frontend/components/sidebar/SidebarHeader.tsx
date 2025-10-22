"use client";

import React, { useState } from "react";
import { useSidebarStore } from "@/store/sidebarStore";
import { Plus, Menu, Folder } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SidebarHeader() {
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);
  const toggleSidebar = useSidebarStore((state) => state.toggleSidebar);
  const createFolder = useSidebarStore((state) => state.createFolder);
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [folderName, setFolderName] = useState("");
  const router = useRouter();

  const handleCreateNewChat = () => {
    router.push("/chat/new");
  };

  const handleCreateFolder = () => {
    if (folderName.trim()) {
      createFolder(folderName.trim());
      setFolderName("");
      setShowNewFolderInput(false);
    }
  };

  if (isCollapsed) {
    return (
      <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 flex flex-col gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          title="Expand sidebar"
        >
          <Menu className="w-5 h-5" />
        </Button>
        <Button
          size="icon"
          onClick={handleCreateNewChat}
          title="New Chat"
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 space-y-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">🤖</span>
          </div>
          <span className="text-neutral-900 dark:text-white font-semibold">Voice Bot</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          title="Toggle sidebar"
          className="h-8 w-8"
        >
          <Menu className="w-4 h-4" />
        </Button>
      </div>

      <Button
        onClick={handleCreateNewChat}
        className="w-full justify-start bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
        size="default"
      >
        <Plus className="w-4 h-4 mr-2" />
        <span className="font-semibold">New Chat</span>
      </Button>

      {showNewFolderInput ? (
        <div className="flex gap-1">
          <input
            type="text"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateFolder();
              if (e.key === "Escape") {
                setShowNewFolderInput(false);
                setFolderName("");
              }
            }}
            onBlur={() => {
              // Delay to allow button click to register
              setTimeout(() => {
                if (!folderName.trim()) {
                  setShowNewFolderInput(false);
                  setFolderName("");
                }
              }, 200);
            }}
            placeholder="Folder name..."
            className={cn(
              "flex-1 px-3 py-1.5 rounded border text-sm",
              "bg-white dark:bg-neutral-900",
              "border-neutral-300 dark:border-neutral-700",
              "text-neutral-900 dark:text-neutral-100",
              "placeholder-neutral-500",
              "focus:outline-none focus:ring-2 focus:ring-purple-500"
            )}
            autoFocus
          />
          <Button
            onClick={handleCreateFolder}
            size="sm"
            className="px-3"
            onMouseDown={(e) => e.preventDefault()} // Prevent blur
          >
            ✓
          </Button>
          <Button
            onClick={() => {
              setShowNewFolderInput(false);
              setFolderName("");
            }}
            size="sm"
            variant="ghost"
            className="px-2"
          >
            ✕
          </Button>
        </div>
      ) : (
        <Button
          onClick={() => setShowNewFolderInput(true)}
          variant="ghost"
          className="w-full justify-start"
        >
          <Folder className="w-4 h-4 mr-2" />
          <span className="text-sm">New Folder</span>
        </Button>
      )}
    </div>
  );
}
