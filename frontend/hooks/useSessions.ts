/**
 * useSessions Hook
 * Điều phối logic và side effects cho sessions
 * Sử dụng Zustand store + Service API layer
 */

import { useEffect, useCallback } from 'react';
import { sessionService } from '@/lib/api';
import { useSessionStore } from '@/store/sessionStore';
import type { CreateSessionRequest, Session } from '@/lib/api/types';

export function useSessions() {
  // Get state and actions from Zustand store
  const { sessions, loading, error, setSessions, addSession, updateSession: updateSessionInStore, removeSession, setLoading, setError } = useSessionStore();

  // Fetch all sessions on mount
  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await sessionService.getSessions();
      setSessions(data);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to fetch sessions:', err);
    } finally {
      setLoading(false);
    }
  }, [setSessions, setLoading, setError]);

  // Create session
  const createSession = useCallback(async (data: CreateSessionRequest = {}) => {
    try {
      const newSession = await sessionService.createSession(data);
      console.log('Created session:', newSession);
      addSession(newSession);
      return newSession;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [addSession, setError]);

  // Delete session
  const deleteSession = useCallback(async (id: string) => {
    try {
      await sessionService.deleteSession(id);
      removeSession(id);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [removeSession, setError]);

  // Update session (for moving to folder, rename, etc.)
  const updateSession = useCallback(async (id: string, updates: Partial<Session>) => {
    try {
      const updated = await sessionService.updateSession(id, updates);
      updateSessionInStore(id, updated);
      return updated;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [updateSessionInStore, setError]);

  // Auto-fetch on mount
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return {
    sessions,
    loading,
    error,
    createSession,
    deleteSession,
    updateSession,
    refetch: fetchSessions,
  };
}


