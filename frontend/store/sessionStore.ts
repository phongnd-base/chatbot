/**
 * Session Store (Zustand)
 * Manages session state and actions
 */

import { create } from 'zustand';
import type { Session } from '@/lib/api/types';

interface SessionState {
  // State
  sessions: Session[];
  loading: boolean;
  error: Error | null;

  // Actions
  setSessions: (sessions: Session[]) => void;
  addSession: (session: Session) => void;
  updateSession: (id: string, updates: Partial<Session>) => void;
  removeSession: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  reset: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  // Initial state
  sessions: [],
  loading: false,
  error: null,

  // Actions
  setSessions: (sessions) => set({ sessions, error: null }),

  addSession: (session) =>
    set((state) => ({
      sessions: [session, ...state.sessions],
    })),

  updateSession: (id, updates) =>
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    })),

  removeSession: (id) =>
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== id),
    })),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  reset: () => set({ sessions: [], loading: false, error: null }),
}));
