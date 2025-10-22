"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useSidebarStore } from "@/store/sidebarStore";
import { MoreVertical, Trash2, FolderInput } from "lucide-react";
import type { SessionWithFolder } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

type SessionListItemProps = {
  session: SessionWithFolder;
  isActive?: boolean;
  isCollapsed?: boolean;
};

export function SessionListItem({ session, isActive, isCollapsed }: SessionListItemProps) {
  const router = useRouter();
  const deleteSession = useSidebarStore((state) => state.deleteSession);
  const moveSessionToFolder = useSidebarStore((state) => state.moveSessionToFolder);
  const folders = useSidebarStore((state) => state.folders);

  const handleClick = () => {
    router.push(`/chat/${session.id}`);
  };

  const handleDelete = () => {
    if (confirm(`Delete chat "${session.name}"?`)) {
      deleteSession(session.id);
    }
  };

  const handleMoveToFolder = (folderId: string | null) => {
    moveSessionToFolder(session.id, folderId);
  };

  if (isCollapsed) {
    return (
      <div className="relative">
        <button
          onClick={handleClick}
          className={`
            w-full h-9 flex items-center justify-center rounded-md transition-colors
            ${
              isActive
                ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
            }
          `}
          title={session.name}
        >
          <span className="text-base">💬</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative group">
      <button
        onClick={handleClick}
        className={`
          w-full px-2 py-1.5 rounded-md flex items-center gap-2 transition-colors
          ${
            isActive
              ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white"
              : "hover:bg-neutral-100 dark:hover:bg-neutral-800/50 text-neutral-700 dark:text-neutral-300"
          }
        `}
      >
        <span className="text-sm flex-shrink-0">💬</span>
        <span className="text-xs text-neutral-600 dark:text-neutral-400 truncate flex-1 text-left">
          {session.name || "Untitled Chat"}
        </span>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 h-7 w-7 transition-opacity"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <FolderInput className="w-3.5 h-3.5 mr-2" />
                <span>Move to folder</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => handleMoveToFolder(null)}>
                  <span>📁 Root</span>
                </DropdownMenuItem>
                {folders.map((folder) => (
                  <DropdownMenuItem
                    key={folder.id}
                    onClick={() => handleMoveToFolder(folder.id)}
                  >
                    <span className="truncate">📁 {folder.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
            >
              <Trash2 className="w-3.5 h-3.5 mr-2" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </button>
    </div>
  );
}
