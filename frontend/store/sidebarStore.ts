import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Sidebar UI State Store
 * 
 * ⚠️ IMPORTANT: This store only manages UI state (collapsed, expanded)
 * Data (folders, sessions) should be managed by hooks that sync with API
 */

type FolderUIState = {
  id: string;
  isExpanded: boolean;
};

type SidebarUIState = {
  // UI State only
  isCollapsed: boolean;
  expandedFolders: Record<string, boolean>; // folderId -> isExpanded
  
  // Actions for UI state
  toggleSidebar: () => void;
  toggleFolder: (folderId: string) => void;
  setFolderExpanded: (folderId: string, expanded: boolean) => void;
};

export const useSidebarStore = create<SidebarUIState>()(
  persist(
    (set) => ({
      isCollapsed: false,
      expandedFolders: {},

      toggleSidebar: () => 
        set((state) => ({ isCollapsed: !state.isCollapsed })),

      toggleFolder: (folderId) =>
        set((state) => ({
          expandedFolders: {
            ...state.expandedFolders,
            [folderId]: !state.expandedFolders[folderId],
          },
        })),

      setFolderExpanded: (folderId, expanded) =>
        set((state) => ({
          expandedFolders: {
            ...state.expandedFolders,
            [folderId]: expanded,
          },
        })),
    }),
    {
      name: 'sidebar-ui-state',
    }
  )
);
