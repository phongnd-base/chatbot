/**
 * useSession Hook (singular)
 * Fetch và quản lý single session
 * Dùng cho chat page khi cần load chi tiết 1 session
 */

import { useState, useEffect, useCallback } from 'react';
import { sessionService } from '@/lib/api';
import { useSessionStore } from '@/store/sessionStore';
import { useChatStore } from '@/store/chatStore';
import type { Session, Provider } from '@/lib/api/types';

export function useSession(sessionId: string) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { updateSession: updateSessionInStore } = useSessionStore();
  const setActiveSessionId = useChatStore((state) => state.setActiveSessionId);

  // Fetch single session
  const fetchSession = useCallback(async () => {
    if (!sessionId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await sessionService.getSession(sessionId);
      setSession(data);
      
      // Set as active session
      setActiveSessionId(sessionId);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to fetch session:', err);
    } finally {
      setLoading(false);
    }
  }, [sessionId, setActiveSessionId]);

  // Update session
  const updateSession = useCallback(
    async (updates: Partial<Session>) => {
      if (!sessionId) return;

      try {
        const updated = await sessionService.updateSession(sessionId, updates);
        setSession(updated);
        updateSessionInStore(sessionId, updated);
        return updated;
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [sessionId, updateSessionInStore]
  );

  // Auto-fetch on mount and when sessionId changes
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
