/**
 * useSession Hook
 * Manages session state and operations
 */

import { useState, useEffect, useCallback } from 'react';
import { sessionService, type Session } from '@/lib/api';

export function useSession(sessionId: string) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch session details
  const fetchSession = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await sessionService.getSession(sessionId);
      setSession(data);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to fetch session:', err);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  // Update session
  const updateSession = useCallback(
    async (updates: Partial<Session>) => {
      try {
        const updated = await sessionService.updateSession(sessionId, updates);
        setSession(updated);
        return updated;
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [sessionId]
  );

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  return {
    session,
    loading,
    error,
    updateSession,
    refetch: fetchSession,
  };
}
