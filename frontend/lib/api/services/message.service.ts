/**
 * Message Service
 * Handles all message-related API calls
 */

import { apiClient } from '../client';
import type { Message, SendMessageRequest } from '../types';

export const messageService = {
  /**
   * Get all messages for a session
   */
  async getMessages(sessionId: string): Promise<Message[]> {
    return apiClient.get<Message[]>(`messages/${sessionId}`);
  },

  /**
   * Send a message and get streaming response
   * Returns an EventSource for SSE streaming
   */
  createMessageStream(sessionId: string, prompt: string): EventSource {
    // For streaming, we use EventSource directly
    // The actual POST is handled by the streamMessage function
    return new EventSource(`/api/bff/messages/stream/${sessionId}`);
  },

  /**
   * Send a message via POST (triggers streaming)
   */
  async sendMessage(data: SendMessageRequest): Promise<void> {
    return apiClient.post<void>('messages/stream', data);
  },
};
