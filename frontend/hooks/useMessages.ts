/**
 * useMessages Hook
 * Manages message state and operations
 */

import { useState, useEffect, useCallback } from 'react';
import { messageService, type Message } from '@/lib/api';

export function useMessages(sessionId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await messageService.getMessages(sessionId);
      setMessages(data);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  // Add message optimistically
  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  // Update message (for streaming)
  const updateMessage = useCallback((id: string, updates: Partial<Message>) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, ...updates } : msg))
    );
  }, []);

  // Replace message ID (after server confirmation)
  const replaceMessageId = useCallback((oldId: string, newId: string) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === oldId ? { ...msg, id: newId } : msg))
    );
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return {
    messages,
    loading,
    error,
    addMessage,
    updateMessage,
    replaceMessageId,
    refetch: fetchMessages,
  };
}
