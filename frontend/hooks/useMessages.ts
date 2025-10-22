/**
 * useMessages Hook
 * Điều phối logic và side effects cho messages
 * Sử dụng Zustand store + Service API layer
 */

import { useEffect, useCallback } from 'react';
import { messageService, type Message } from '@/lib/api';
import { useMessageStore } from '@/store/messageStore';

export function useMessages(sessionId: string) {
  // Get state and actions from Zustand store
  const { messagesBySession, loading, error, setMessages, addMessage: addMessageToStore, updateMessage: updateMessageInStore, replaceMessageId: replaceMessageIdInStore, setLoading, setError } = useMessageStore();

  // Get messages for this specific session
  const messages = messagesBySession[sessionId] || [];
  const isLoading = loading[sessionId] || false;
  const sessionError = error[sessionId] || null;

  // Fetch messages for session
  const fetchMessages = useCallback(async () => {
    if (!sessionId) return;

    try {
      setLoading(sessionId, true);
      setError(sessionId, null);
      const data = await messageService.getMessages(sessionId);
      setMessages(sessionId, data);
    } catch (err) {
      setError(sessionId, err as Error);
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(sessionId, false);
    }
  }, [sessionId, setMessages, setLoading, setError]);

  // Add message optimistically
  const addMessage = useCallback((message: Message) => {
    addMessageToStore(sessionId, message);
  }, [sessionId, addMessageToStore]);

  // Update message (for streaming)
  const updateMessage = useCallback((id: string, updates: Partial<Message>) => {
    updateMessageInStore(sessionId, id, updates);
  }, [sessionId, updateMessageInStore]);

  // Replace message ID (after server confirmation)
  const replaceMessageId = useCallback((oldId: string, newId: string) => {
    replaceMessageIdInStore(sessionId, oldId, newId);
  }, [sessionId, replaceMessageIdInStore]);

  // Auto-fetch on mount or when sessionId changes
  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    messages,
    loading: isLoading,
    error: sessionError,
    addMessage,
    updateMessage,
    replaceMessageId,
    refetch: fetchMessages,
  };
}


