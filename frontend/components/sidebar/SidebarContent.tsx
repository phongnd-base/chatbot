"use client";

import React from "react";
import { useSidebarStore } from "@/store/sidebarStore";
import { useFolders, useSessions } from "@/hooks";
import { FolderItem } from "./FolderItem";
import { SessionListItem } from "./SessionListItem";
import { useChatStore } from "@/store/chatStore";
import { Star, FolderOpen, MessageSquare } from "lucide-react";

export function SidebarContent() {
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);
  const activeSessionId = useChatStore((state) => state.activeSessionId);
  
  // Data hooks
  const { folders } = useFolders();
  const { sessions } = useSessions();

  // Get starred folders
  const starredFolders = folders.filter((f) => f.isFavorite);

  // Get non-starred folders
  const regularFolders = folders.filter((f) => !f.isFavorite);

  // Get ungrouped sessions (not in folders)
  const ungroupedSessions = sessions.filter((s) => !s.folderId);

  if (isCollapsed) {
    return (
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {sessions.slice(0, 8).map((session) => (
          <SessionListItem
            key={session.id}
            session={session}
            isActive={session.id === activeSessionId}
            isCollapsed={true}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-2">
      {/* STARRED Section */}
      {starredFolders.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-1.5 px-2 py-1.5 mb-1">
            <Star className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" />
            <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
              Starred
            </h3>
          </div>
          <div className="space-y-0.5">
            {starredFolders.map((folder) => {
              const folderSessions = sessions.filter((s) => s.folderId === folder.id);
              return (
                <FolderItem
                  key={folder.id}
                  folder={folder}
                  sessionCount={folderSessions.length}
                  sessions={folderSessions}
                  activeSessionId={activeSessionId}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* FOLDERS Section */}
      {regularFolders.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-1.5 px-2 py-1.5 mb-1">
            <FolderOpen className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" />
            <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
              Folders
            </h3>
          </div>
          <div className="space-y-0.5">
            {regularFolders.map((folder) => {
              const folderSessions = sessions.filter((s) => s.folderId === folder.id);
              return (
                <FolderItem
                  key={folder.id}
                  folder={folder}
                  sessionCount={folderSessions.length}
                  sessions={folderSessions}
                  activeSessionId={activeSessionId}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* CHATS Section */}
      {ungroupedSessions.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-1.5 px-2 py-1.5 mb-1">
            <MessageSquare className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" />
            <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
              Chats
            </h3>
          </div>
          <div className="space-y-0.5">
            {ungroupedSessions.map((session) => (
              <SessionListItem
                key={session.id}
                session={session}
                isActive={session.id === activeSessionId}
              />
            ))}
          </div>
        </div>
      )}

      {sessions.length === 0 && folders.length === 0 && (
        <div className="text-center py-8 text-neutral-500 dark:text-neutral-400 text-sm">
          <p>No chats yet</p>
          <p className="text-xs mt-1">Start a new conversation</p>
        </div>
      )}
    </div>
  );
}
