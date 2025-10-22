/**
 * Folder Service
 * Handles all folder-related API calls
 */

import { apiClient } from '../client';
import type { Session, Folder, CreateFolderRequest, UpdateFolderRequest } from '../types';

export const folderService = {
  /**
   * Get all folders for the current user
   */
  async getFolders(): Promise<Folder[]> {
    return apiClient.get<Folder[]>('folders');
  },

  /**
   * Create a new folder
   */
  async createFolder(data: CreateFolderRequest): Promise<Folder> {
    return apiClient.post<Folder>('folders', data);
  },

  /**
   * Update a folder
   */
  async updateFolder(id: string, data: UpdateFolderRequest): Promise<Folder> {
    return apiClient.patch<Folder>(`folders/${id}`, data);
  },

  /**
   * Delete a folder
   * Sessions in this folder will have their folderId set to null
   */
  async deleteFolder(id: string): Promise<{ ok: boolean }> {
    return apiClient.delete<{ ok: boolean }>(`folders/${id}`);
  },

  /**
   * Get all sessions in a folder
   */
  async getFolderSessions(id: string): Promise<Session[]> {
    return apiClient.get<Session[]>(`folders/${id}/sessions`);
  },

  /**
   * Toggle folder favorite status
   */
  async toggleFavorite(id: string, isFavorite: boolean): Promise<Folder> {
    return apiClient.patch<Folder>(`folders/${id}/favorite`, { isFavorite });
  },
};
