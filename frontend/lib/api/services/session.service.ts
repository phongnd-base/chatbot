/**
 * Session Service
 * Handles all session-related API calls
 */

import { apiClient } from '../client';
import type { Session, CreateSessionRequest, UpdateSessionRequest, ExportData } from '../types';

export const sessionService = {
  /**
   * Get all sessions
   */
  async getSessions(): Promise<Session[]> {
    return apiClient.get<Session[]>('sessions');
  },

  /**
   * Get a single session by ID
   */
  async getSession(id: string): Promise<Session> {
    return apiClient.get<Session>(`sessions/${id}`);
  },

  /**
   * Create a new session
   */
  async createSession(data: CreateSessionRequest = {}): Promise<Session> {
    return apiClient.post<Session>('sessions', data);
  },

  /**
   * Update a session
   */
  async updateSession(id: string, data: UpdateSessionRequest): Promise<Session> {
    return apiClient.patch<Session>(`sessions/${id}`, data);
  },

  /**
   * Delete a session
   */
  async deleteSession(id: string): Promise<{ ok: boolean }> {
    return apiClient.delete<{ ok: boolean }>(`sessions/${id}`);
  },

  /**
   * Toggle favorite status of a session
   * @deprecated Temporarily hidden - use folder favorite instead
   */
  // async toggleFavorite(id: string, isFavorite: boolean): Promise<Session> {
  //   return apiClient.patch<Session>(`sessions/${id}/favorite`, { isFavorite });
  // },

  /**
   * Set the folder for a session
   */
  async setFolder(id: string, folderId: string | null): Promise<Session> {
    return apiClient.patch<Session>(`sessions/${id}/folder`, { folderId });
  },

  /**
   * Export session data as JSON
   */
  async exportJson(id: string): Promise<ExportData> {
    return apiClient.get<ExportData>(`sessions/${id}/export.json`);
  },

  /**
   * Export session as Markdown
   */
  async exportMarkdown(id: string): Promise<string> {
    const response = await fetch(`/api/bff/sessions/${id}/export.md`);
    if (!response.ok) {
      throw new Error('Failed to export markdown');
    }
    return response.text();
  },
};
