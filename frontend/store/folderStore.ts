/**
 * Folder Store (Zustand)
 * Manages folder state and actions
 */

import { create } from 'zustand';
import type { Folder } from '@/lib/api/types';

interface FolderState {
  // State
  folders: Folder[];
  loading: boolean;
  error: Error | null;

  // Actions
  setFolders: (folders: Folder[]) => void;
  addFolder: (folder: Folder) => void;
  updateFolder: (id: string, updates: Partial<Folder>) => void;
  removeFolder: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  reset: () => void;
}

export const useFolderStore = create<FolderState>((set) => ({
  // Initial state
  folders: [],
  loading: false,
  error: null,

  // Actions
  setFolders: (folders) => set({ folders, error: null }),

  addFolder: (folder) =>
    set((state) => ({
      folders: [...state.folders, folder],
    })),

  updateFolder: (id, updates) =>
    set((state) => ({
      folders: state.folders.map((f) =>
        f.id === id ? { ...f, ...updates } : f
      ),
    })),

  removeFolder: (id) =>
    set((state) => ({
      folders: state.folders.filter((f) => f.id !== id),
    })),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  reset: () => set({ folders: [], loading: false, error: null }),
}));
