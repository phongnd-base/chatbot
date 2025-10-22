import { create } from 'zustand';

/**
 * Chat UI State Store
 * 
 * ⚠️ IMPORTANT: This store only manages UI state
 * Data (sessions, messages) should be managed by hooks that sync with API
 */

type ChatUIState = {
  // Active session for routing
  activeSessionId?: string;
  setActive: (id: string) => void;
};

export const useChatStore = create<ChatUIState>((set) => ({
  activeSessionId: undefined,
  setActive: (id) => set({ activeSessionId: id }),
}));
