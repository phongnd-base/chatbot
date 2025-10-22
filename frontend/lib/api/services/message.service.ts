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
   * Send a message and stream the response
   * Backend uses HTTP POST with NDJSON streaming (not SSE)
   * Use this with fetch + ReadableStream to consume the stream
   */
  async sendMessageStream(data: SendMessageRequest): Promise<Response> {
    // Return raw Response for caller to handle streaming
    const response = await fetch('/api/bff/messages/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to send message');
    }

    return response;
  },
};
