/**
 * useSessions Hook
 * Manages all sessions with API integration
 */

import { useState, useEffect, useCallback } from 'react';
import { sessionService } from '@/lib/api';
import type { Session } from '@/lib/api';

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch all sessions
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
  }, []);

  // Create session
  const createSession = useCallback(async (title: string) => {
    try {
      const newSession = await sessionService.createSession({ title });
      setSessions((prev) => [newSession, ...prev]);
      return newSession;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  // Delete session
  const deleteSession = useCallback(async (id: string) => {
    try {
      await sessionService.deleteSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return {
    sessions,
    loading,
    error,
    createSession,
    deleteSession,
    refetch: fetchSessions,
  };
}
