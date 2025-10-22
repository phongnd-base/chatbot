/**
 * Folder Service
 * Handles all folder-related API calls
 */

import { apiClient } from '../client';

export interface FolderData {
  id: string;
  name: string;
  isFavorite?: boolean;
}

export const folderService = {
  /**
   * Get all folders
   */
  async getFolders(): Promise<FolderData[]> {
    // TODO: Implement when backend endpoint ready
    // return apiClient.get<FolderData[]>('folders');
    
    // Temporary: return from localStorage
    const stored = localStorage.getItem('sidebar-storage');
    if (stored) {
      const data = JSON.parse(stored);
      return data.state?.folders || [];
    }
    return [];
  },

  /**
   * Create a new folder
   */
  async createFolder(name: string): Promise<FolderData> {
    // TODO: Implement when backend endpoint ready
    // return apiClient.post<FolderData>('folders', { name });
    
    // Temporary: local only
    return {
      id: crypto.randomUUID(),
      name,
      isFavorite: false,
    };
  },

  /**
   * Update a folder
   */
  async updateFolder(id: string, updates: Partial<FolderData>): Promise<FolderData> {
    // TODO: Implement when backend endpoint ready
    // return apiClient.patch<FolderData>(`folders/${id}`, updates);
    
    throw new Error('Not implemented: backend endpoint needed');
  },

  /**
   * Delete a folder
   */
  async deleteFolder(id: string): Promise<void> {
    // TODO: Implement when backend endpoint ready
    // return apiClient.delete<void>(`folders/${id}`);
    
    throw new Error('Not implemented: backend endpoint needed');
  },

  /**
   * Toggle folder favorite status
   */
  async toggleFavorite(id: string): Promise<FolderData> {
    // TODO: Implement when backend endpoint ready
    // return apiClient.patch<FolderData>(`folders/${id}/favorite`, {});
    
    throw new Error('Not implemented: backend endpoint needed');
  },
};
