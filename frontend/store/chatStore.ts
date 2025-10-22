import { create } from 'zustand';

type Session = { id: string; title: string; isFavorite?: boolean; model?: string };
type Message = { id: string; role: 'user'|'assistant'; content: string };

type State = {
  sessions: Session[];
  messages: Message[];
  activeSessionId?: string;
  setSessions: (s: Session[]) => void;
  setMessages: (m: Message[]) => void;
  setActive: (id: string) => void;
  upsertMessage: (m: Message) => void;
  appendToAssistant: (messageId: string, delta: string) => void;
}

export const useChatStore = create<State>((set) => ({
  sessions: [],
  messages: [],
  activeSessionId: undefined,
  setSessions: (sessions) => set({ sessions }),
  setMessages: (messages) => set({ messages }),
  setActive: (id) => set({ activeSessionId: id }),
  upsertMessage: (msg) => set((s) => {
    const idx = s.messages.findIndex((m) => m.id === msg.id);
    if (idx >= 0) {
      const copy = s.messages.slice();
      copy[idx] = msg;
      return { messages: copy } as any;
    }
    return { messages: [...s.messages, msg] } as any;
  }),
  appendToAssistant: (id, delta) => set((s) => ({
    messages: s.messages.map((m) => (m.id === id ? { ...m, content: (m.content || '') + delta } : m))
  })),
}));
