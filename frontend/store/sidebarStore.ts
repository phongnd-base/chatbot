import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Folder = {
  id: string;
  name: string;
  isExpanded: boolean;
  sessionCount: number;
  isFavorite?: boolean;
};

export type SessionWithFolder = {
  id: string;
  name: string;
  folderId?: string | null;
};

type SidebarState = {
  isCollapsed: boolean;
  folders: Folder[];
  sessions: SessionWithFolder[];
  
  // Actions
  toggleSidebar: () => void;
  toggleFolder: (folderId: string) => void;
  createFolder: (name: string) => void;
  deleteFolder: (folderId: string) => void;
  renameFolder: (folderId: string, newName: string) => void;
  toggleFolderFavorite: (folderId: string) => void;
  
  moveSessionToFolder: (sessionId: string, folderId: string | null) => void;
  setSessions: (sessions: SessionWithFolder[]) => void;
  addSession: (session: SessionWithFolder) => void;
  deleteSession: (sessionId: string) => void;
};

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isCollapsed: false,
      folders: [],
      sessions: [],

      toggleSidebar: () => set((state) => ({ isCollapsed: !state.isCollapsed })),

      toggleFolder: (folderId) =>
        set((state) => ({
          folders: state.folders.map((f) =>
            f.id === folderId ? { ...f, isExpanded: !f.isExpanded } : f
          ),
        })),

      createFolder: (name) =>
        set((state) => ({
          folders: [
            ...state.folders,
            {
              id: crypto.randomUUID(),
              name,
              isExpanded: true,
              sessionCount: 0,
            },
          ],
        })),

      deleteFolder: (folderId) =>
        set((state) => ({
          folders: state.folders.filter((f) => f.id !== folderId),
          sessions: state.sessions.map((s) =>
            s.folderId === folderId ? { ...s, folderId: null } : s
          ),
        })),

      renameFolder: (folderId, newName) =>
        set((state) => ({
          folders: state.folders.map((f) =>
            f.id === folderId ? { ...f, name: newName } : f
          ),
        })),

      toggleFolderFavorite: (folderId) =>
        set((state) => ({
          folders: state.folders.map((f) =>
            f.id === folderId ? { ...f, isFavorite: !f.isFavorite } : f
          ),
        })),

      moveSessionToFolder: (sessionId, folderId) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId ? { ...s, folderId } : s
          ),
        })),

      setSessions: (sessions) => set({ sessions }),

      addSession: (session) =>
        set((state) => ({
          sessions: [session, ...state.sessions],
        })),

      deleteSession: (sessionId) =>
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== sessionId),
        })),
    }),
    {
      name: 'sidebar-storage',
    }
  )
);
