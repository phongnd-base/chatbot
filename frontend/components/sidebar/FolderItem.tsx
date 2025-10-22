"use client";

import React, { useState } from "react";
import { useSidebarStore } from "@/store/sidebarStore";
import { useFolders } from "@/hooks";
import { SessionListItem } from "./SessionListItem";
import { ChevronDown, ChevronRight, Folder as FolderIcon, MoreVertical, Pencil, Trash2, Star } from "lucide-react";
import type { Session, Folder } from "@/lib/api/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FolderItemProps = {
  folder: Folder;
  sessionCount: number;
  sessions: Session[];
  activeSessionId?: string;
};

export function FolderItem({ 
  folder, 
  sessionCount, 
  sessions, 
  activeSessionId,
}: FolderItemProps) {
  const expandedFolders = useSidebarStore((state) => state.expandedFolders);
  const toggleFolder = useSidebarStore((state) => state.toggleFolder);
  const { updateFolder, deleteFolder, toggleFavorite } = useFolders();
  
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(folder.name);

  const isExpanded = expandedFolders[folder.id] ?? false;

  const handleRename = async () => {
    if (newName.trim() && newName !== folder.name) {
      try {
        await updateFolder(folder.id, { name: newName.trim() });
      } catch (error) {
        console.error('Failed to rename folder:', error);
      }
    }
    setIsRenaming(false);
  };

  const handleDelete = async () => {
    if (confirm(`Delete folder "${folder.name}"? Sessions will be moved to root.`)) {
      try {
        await deleteFolder(folder.id);
      } catch (error) {
        console.error('Failed to delete folder:', error);
      }
    }
  };

  const handleToggleFavorite = async () => {
    try {
      await toggleFavorite(folder.id, !folder.isFavorite);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  return (
    <div className="relative">
      <div className="group flex items-center gap-1 py-1 px-2 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 rounded-md transition-colors">
        <button
          onClick={() => toggleFolder(folder.id)}
          className="flex items-center gap-1.5 flex-1 min-w-0"
        >
          {isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400 flex-shrink-0" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400 flex-shrink-0" />
          )}
          <span className="text-sm flex-shrink-0">📁</span>
          
          {isRenaming ? (
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename();
                if (e.key === "Escape") {
                  setIsRenaming(false);
                  setNewName(folder.name);
                }
              }}
              onBlur={handleRename}
              className={cn(
                "flex-1 px-2 py-0.5 rounded text-sm",
                "bg-white dark:bg-neutral-800",
                "border border-neutral-300 dark:border-neutral-700",
                "text-neutral-900 dark:text-neutral-100",
                "focus:outline-none focus:ring-2 focus:ring-purple-500"
              )}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 truncate">
              {folder.name}
            </span>
          )}
          
          <span className="text-[10px] text-neutral-500 dark:text-neutral-500 ml-auto">
            ({sessionCount})
          </span>
        </button>

        {folder.isFavorite && (
          <Star className="w-3 h-3 flex-shrink-0 fill-yellow-400 text-yellow-400 mr-1" />
        )}

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
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem onClick={handleToggleFavorite}>
              <Star className={`w-3.5 h-3.5 mr-2 ${folder.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
              <span>{folder.isFavorite ? 'Unstar' : 'Star'}</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={() => setIsRenaming(true)}>
              <Pencil className="w-3.5 h-3.5 mr-2" />
              <span>Rename</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
            >
              <Trash2 className="w-3.5 h-3.5 mr-2" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isExpanded && sessions.length > 0 && (
        <div className="ml-5 mt-0.5 space-y-0.5">
          {sessions.map((session) => (
            <SessionListItem
              key={session.id}
              session={session}
              isActive={session.id === activeSessionId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
