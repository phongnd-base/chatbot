/**
 * Session Service
 * Handles all session-related API calls
 */

import { apiClient } from '../client';
import type { Session, CreateSessionRequest, UpdateSessionRequest } from '../types';

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
  async createSession(data: CreateSessionRequest): Promise<Session> {
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
  async deleteSession(id: string): Promise<void> {
    return apiClient.delete<void>(`sessions/${id}`);
  },
};
