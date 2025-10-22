/**
 * useChatStream Hook
 * Manages streaming chat functionality
 */

import { useCallback } from 'react';
import type { Message } from '@/lib/api';

interface UseChatStreamOptions {
  sessionId: string;
  onMessageUpdate: (id: string, updates: Partial<Message>) => void;
  onMessageComplete: (tempId: string, finalId: string) => void;
  onError?: (error: Error) => void;
}

export function useChatStream({
  sessionId,
  onMessageUpdate,
  onMessageComplete,
  onError,
}: UseChatStreamOptions) {
  const streamMessage = useCallback(
    async (prompt: string, tempAssistantId: string) => {
      try {
        const response = await fetch(`/api/bff/messages/stream`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, prompt }),
        });

        if (!response.ok || !response.body) {
          throw new Error('Stream failed');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let finalId: string | null = null;

        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            let idx: number;

            while ((idx = buffer.indexOf('\n')) !== -1) {
              const line = buffer.slice(0, idx).trim();
              buffer = buffer.slice(idx + 1);
              if (!line) continue;

              try {
                const obj = JSON.parse(line);
                
                if (obj.delta !== undefined) {
                  // Streaming delta update
                  onMessageUpdate(tempAssistantId, {
                    content: obj.delta,
                  });
                }

                if (obj.done && obj.messageId) {
                  finalId = obj.messageId;
                }
              } catch {
                // Ignore malformed JSON
              }
            }
          }
        } finally {
          reader.releaseLock();
        }

        // Update with final ID
        if (finalId) {
          onMessageComplete(tempAssistantId, finalId);
        }
      } catch (error) {
        console.error('Stream error:', error);
        onError?.(error as Error);
      }
    },
    [sessionId, onMessageUpdate, onMessageComplete, onError]
  );

  return { streamMessage };
}
