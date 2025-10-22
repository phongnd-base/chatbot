/**
 * Message Store (Zustand)
 * Manages message state and actions per session
 */

import { create } from 'zustand';
import type { Message } from '@/lib/api/types';

interface MessageState {
  // State - Map of sessionId -> messages
  messagesBySession: Record<string, Message[]>;
  loading: Record<string, boolean>;
  error: Record<string, Error | null>;

  // Actions
  setMessages: (sessionId: string, messages: Message[]) => void;
  addMessage: (sessionId: string, message: Message) => void;
  updateMessage: (sessionId: string, id: string, updates: Partial<Message>) => void;
  replaceMessageId: (sessionId: string, oldId: string, newId: string) => void;
  setLoading: (sessionId: string, loading: boolean) => void;
  setError: (sessionId: string, error: Error | null) => void;
  clearSession: (sessionId: string) => void;
  reset: () => void;
}

export const useMessageStore = create<MessageState>((set) => ({
  // Initial state
  messagesBySession: {},
  loading: {},
  error: {},

  // Actions
  setMessages: (sessionId, messages) =>
    set((state) => ({
      messagesBySession: {
        ...state.messagesBySession,
        [sessionId]: messages,
      },
      error: {
        ...state.error,
        [sessionId]: null,
      },
    })),

  addMessage: (sessionId, message) =>
    set((state) => ({
      messagesBySession: {
        ...state.messagesBySession,
        [sessionId]: [...(state.messagesBySession[sessionId] || []), message],
      },
    })),

  updateMessage: (sessionId, id, updates) =>
    set((state) => ({
      messagesBySession: {
        ...state.messagesBySession,
        [sessionId]: (state.messagesBySession[sessionId] || []).map((msg) =>
          msg.id === id ? { ...msg, ...updates } : msg
        ),
      },
    })),

  replaceMessageId: (sessionId, oldId, newId) =>
    set((state) => ({
      messagesBySession: {
        ...state.messagesBySession,
        [sessionId]: (state.messagesBySession[sessionId] || []).map((msg) =>
          msg.id === oldId ? { ...msg, id: newId } : msg
        ),
      },
    })),

  setLoading: (sessionId, loading) =>
    set((state) => ({
      loading: {
        ...state.loading,
        [sessionId]: loading,
      },
    })),

  setError: (sessionId, error) =>
    set((state) => ({
      error: {
        ...state.error,
        [sessionId]: error,
      },
    })),

  clearSession: (sessionId) =>
    set((state) => {
      const { [sessionId]: _, ...remainingMessages } = state.messagesBySession;
      const { [sessionId]: __, ...remainingLoading } = state.loading;
      const { [sessionId]: ___, ...remainingError } = state.error;
      return {
        messagesBySession: remainingMessages,
        loading: remainingLoading,
        error: remainingError,
      };
    }),

  reset: () =>
    set({ messagesBySession: {}, loading: {}, error: {} }),
}));
