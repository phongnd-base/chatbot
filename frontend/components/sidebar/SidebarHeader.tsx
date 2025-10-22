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
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 rounded-lg opacity-10" />
          <svg
            className="w-5 h-5 text-purple-600 dark:text-purple-400 relative z-10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <path d="M8 10h.01" />
            <path d="M12 10h.01" />
            <path d="M16 10h.01" />
          </svg>
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
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
            <svg
              className="w-5 h-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <path d="M8 10h.01" />
              <path d="M12 10h.01" />
              <path d="M16 10h.01" />
            </svg>
          </div>
          <div>
            <h1 className="text-neutral-900 dark:text-white font-bold text-base leading-none">
              AI Assistant
            </h1>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">
              Powered by AI
            </p>
          </div>
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
