# 🏗️ Frontend Architecture

> Clean Architecture implementation for AI Chat Project

## 🎯 Overview

Frontend được xây dựng theo **Clean Architecture** với 4 layers rõ ràng:

```
┌────────────────────────────────────────┐
│         PRESENTATION LAYER             │
│      (Components + Pages)              │
└──────────────┬─────────────────────────┘
               │
┌──────────────▼─────────────────────────┐
│        BUSINESS LOGIC LAYER            │
│            (Hooks)                     │
└──────────────┬─────────────────────────┘
               │
┌──────────────▼─────────────────────────┐
│        DATA ACCESS LAYER               │
│          (Services)                    │
└──────────────┬─────────────────────────┘
               │
               ▼
          Backend API
```

---

## 📁 Folder Structure

```
frontend/
├── app/                      # Next.js App Router
│   ├── layout.tsx            # Root layout (no sidebar)
│   ├── page.tsx              # Home page
│   ├── login/page.tsx        # Auth pages
│   ├── register/page.tsx
│   └── chat/                 # Chat feature
│       ├── layout.tsx        # Chat layout (with sidebar)
│       ├── [sessionId]/page.tsx
│       └── new/page.tsx
│
├── components/               # UI Components
│   ├── chat/                 # Chat components
│   │   ├── ChatHeader.tsx
│   │   ├── ChatMessages.tsx
│   │   ├── ChatInput.tsx
│   │   └── MessageItem.tsx
│   ├── sidebar/              # Sidebar components
│   │   ├── Sidebar.tsx
│   │   ├── SidebarHeader.tsx
│   │   ├── SidebarContent.tsx
│   │   ├── FolderItem.tsx
│   │   └── SessionListItem.tsx
│   ├── providers/            # Context providers
│   │   └── ThemeProvider.tsx
│   └── ui/                   # shadcn/ui components
│
├── hooks/                    # Business Logic Layer
│   ├── useSession.ts         # Session management
│   ├── useMessages.ts        # Message state
│   ├── useModels.ts          # AI models
│   ├── useChatStream.ts      # Streaming
│   ├── useFolders.ts         # Folder management
│   ├── useSessions.ts        # All sessions
│   └── index.ts              # Barrel export
│
├── lib/api/                  # Data Access Layer
│   ├── client.ts             # HTTP client
│   ├── types.ts              # API types
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── session.service.ts
│   │   ├── message.service.ts
│   │   ├── model.service.ts
│   │   └── folder.service.ts
│   └── index.ts              # Barrel export
│
├── store/                    # UI State Only
│   ├── sidebarStore.ts       # Sidebar UI state
│   └── chatStore.ts          # Chat UI state
│
├── types/                    # Domain Types
│   └── index.ts              # Folder, Session, User
│
└── docs/                     # Documentation
    └── ...
```

---

## 🏛️ Layer Details

### 1️⃣ Presentation Layer (`app/` + `components/`)

**Responsibility**: Render UI, handle user interactions

**Rules**:
- ✅ Use hooks for data
- ✅ Pure functions (no side effects)
- ✅ No direct API calls
- ✅ Type-safe props

**Example**:
```typescript
// app/chat/[sessionId]/page.tsx
export default function ChatPage({ params }: { params: { sessionId: string } }) {
  const { session } = useSession(params.sessionId);
  const { messages, addMessage } = useMessages(params.sessionId);
  const { streamMessage } = useChatStream({
    sessionId: params.sessionId,
    onMessageUpdate: updateMessage,
  });

  return (
    <div>
      <ChatHeader session={session} />
      <ChatMessages messages={messages} />
      <ChatInput onSend={(text) => streamMessage(text)} />
    </div>
  );
}
```

---

### 2️⃣ Business Logic Layer (`hooks/`)

**Responsibility**: Data management, business rules, state synchronization

**Rules**:
- ✅ Manage component state
- ✅ Call services for data
- ✅ Transform API data → domain models
- ✅ Handle loading/error states
- ✅ Optimistic updates

**Example**:
```typescript
// hooks/useSession.ts
export function useSession(sessionId: string) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSession = async () => {
    try {
      setLoading(true);
      const data = await sessionService.getSession(sessionId);
      setSession(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateSession = async (updates: Partial<Session>) => {
    await sessionService.updateSession(sessionId, updates);
    setSession(prev => ({ ...prev, ...updates }));
  };

  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  return { session, loading, error, updateSession };
}
```

---

### 3️⃣ Data Access Layer (`lib/api/services/`)

**Responsibility**: HTTP communication with backend

**Rules**:
- ✅ Pure API calls (no state)
- ✅ Use `apiClient` for requests
- ✅ Handle HTTP errors
- ✅ Type request/response

**Example**:
```typescript
// lib/api/services/session.service.ts
export const sessionService = {
  getSessions: async (): Promise<Session[]> => {
    return apiClient.get<Session[]>('sessions');
  },

  getSession: async (id: string): Promise<Session> => {
    return apiClient.get<Session>(`sessions/${id}`);
  },

  createSession: async (data: CreateSessionRequest): Promise<Session> => {
    return apiClient.post<Session>('sessions', data);
  },

  updateSession: async (id: string, data: Partial<Session>): Promise<Session> => {
    return apiClient.patch<Session>(`sessions/${id}`, data);
  },

  deleteSession: async (id: string): Promise<void> => {
    return apiClient.delete(`sessions/${id}`);
  },
};
```

---

### 4️⃣ Store Layer (`store/`)

**Responsibility**: UI state ONLY (not data)

**Rules**:
- ✅ UI preferences (collapsed, expanded, active)
- ✅ Persist to localStorage
- ❌ NO data (folders, sessions, messages)
- ❌ NO API calls

**Example**:
```typescript
// store/sidebarStore.ts
interface SidebarUIState {
  isCollapsed: boolean;
  expandedFolders: Record<string, boolean>;
  toggleSidebar: () => void;
  toggleFolder: (id: string) => void;
}

export const useSidebarStore = create<SidebarUIState>()(
  persist(
    (set) => ({
      isCollapsed: false,
      expandedFolders: {},
      
      toggleSidebar: () => set((state) => ({ 
        isCollapsed: !state.isCollapsed 
      })),
      
      toggleFolder: (id) => set((state) => ({
        expandedFolders: {
          ...state.expandedFolders,
          [id]: !state.expandedFolders[id],
        },
      })),
    }),
    { name: 'sidebar-ui-state' }
  )
);
```

---

## 🔄 Data Flow

### Example: Create New Session

```
User clicks "New Chat"
         │
         ▼
┌────────────────────┐
│    Component       │  SidebarHeader.tsx
│  onClick={create}  │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│      Hook          │  useSessions()
│  createSession()   │  - Calls service
└────────┬───────────┘  - Updates local state
         │
         ▼
┌────────────────────┐
│     Service        │  sessionService.createSession()
│  POST /sessions    │  - Makes HTTP request
└────────┬───────────┘  - Returns Session object
         │
         ▼
┌────────────────────┐
│   Backend API      │  Creates session in DB
│  Returns 201       │  Returns session data
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│      Hook          │  Updates sessions state
│  setSessions(...)  │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│    Component       │  Re-renders with new session
│  Shows new item    │
└────────────────────┘
```

---

## ✅ Best Practices

### 1. Component Patterns

```typescript
// ✅ Good: Pure component
function SessionItem({ session, onSelect }: Props) {
  return (
    <div onClick={() => onSelect(session.id)}>
      {session.title}
    </div>
  );
}

// ❌ Bad: Component with business logic
function SessionItem({ sessionId }: Props) {
  const [session, setSession] = useState(null);
  
  useEffect(() => {
    fetch(`/api/sessions/${sessionId}`)
      .then(res => res.json())
      .then(setSession);
  }, [sessionId]);
  
  return <div>{session?.title}</div>;
}
```

### 2. Hook Patterns

```typescript
// ✅ Good: Hook manages state + API
function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSessions = async () => {
    setLoading(true);
    const data = await sessionService.getSessions();
    setSessions(data);
    setLoading(false);
  };

  useEffect(() => { fetchSessions(); }, []);

  return { sessions, loading, refetch: fetchSessions };
}

// ❌ Bad: Hook only wraps service
function useSessions() {
  return sessionService.getSessions(); // Just use service directly
}
```

### 3. Service Patterns

```typescript
// ✅ Good: Pure API call
export const sessionService = {
  getSessions: () => apiClient.get<Session[]>('sessions'),
};

// ❌ Bad: Service with state
export const sessionService = {
  sessions: [],
  getSessions: async () => {
    this.sessions = await fetch(...); // Don't do this
  },
};
```

---

## 🎨 Design Patterns Used

### 1. **Repository Pattern**
Services act as repositories, abstracting data access

### 2. **Custom Hook Pattern**
Encapsulate reusable business logic

### 3. **Dependency Injection**
Components receive dependencies via hooks

### 4. **Separation of Concerns**
Each layer has single responsibility

### 5. **Composition over Inheritance**
Components composed from smaller parts

---

## 📊 Type System

### API Types (`lib/api/types.ts`)
```typescript
// Raw API responses
export interface SessionResponse {
  id: string;
  title: string;
  created_at: string; // ISO string
  user_id: string;
}
```

### Domain Types (`types/index.ts`)
```typescript
// Frontend domain models
export interface Session {
  id: string;
  title: string;
  createdAt: Date; // Transformed
  userId: string;
  folderId?: string; // Extended
}
```

### Component Props
```typescript
// Component-specific types
interface ChatHeaderProps {
  session: Session;
  onClose?: () => void;
}
```

---

## 🚀 Adding New Features

### Step-by-step Guide

1. **Define domain types** in `types/`
2. **Add API types** in `lib/api/types.ts`
3. **Create service** in `lib/api/services/`
4. **Export service** from `lib/api/index.ts`
5. **Create hook** in `hooks/`
6. **Export hook** from `hooks/index.ts`
7. **Create component** in `components/`
8. **Use in page** in `app/`

### Example: Add "Tags" Feature

```typescript
// 1. types/index.ts
export interface Tag {
  id: string;
  name: string;
  color: string;
}

// 2. lib/api/types.ts
export interface TagResponse {
  id: string;
  name: string;
  color: string;
}

// 3. lib/api/services/tag.service.ts
export const tagService = {
  getTags: () => apiClient.get<Tag[]>('tags'),
  createTag: (data: { name: string; color: string }) => 
    apiClient.post<Tag>('tags', data),
};

// 4. hooks/useTags.ts
export function useTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  
  const createTag = async (name: string, color: string) => {
    const newTag = await tagService.createTag({ name, color });
    setTags(prev => [...prev, newTag]);
  };
  
  useEffect(() => {
    tagService.getTags().then(setTags);
  }, []);
  
  return { tags, createTag };
}

// 5. components/tags/TagList.tsx
export function TagList() {
  const { tags, createTag } = useTags();
  
  return (
    <div>
      {tags.map(tag => (
        <TagItem key={tag.id} tag={tag} />
      ))}
    </div>
  );
}
```

---

## 🔍 Testing Strategy

### Unit Tests: Hooks
```typescript
// hooks/__tests__/useSession.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useSession } from '../useSession';

jest.mock('@/lib/api/services/session.service');

test('fetches session on mount', async () => {
  const { result } = renderHook(() => useSession('session-1'));
  
  await waitFor(() => {
    expect(result.current.loading).toBe(false);
    expect(result.current.session).toBeDefined();
  });
});
```

### Integration Tests: Services
```typescript
// lib/api/services/__tests__/session.service.test.ts
import { sessionService } from '../session.service';

test('getSessions returns array', async () => {
  const sessions = await sessionService.getSessions();
  expect(Array.isArray(sessions)).toBe(true);
});
```

### Component Tests
```typescript
// components/chat/__tests__/ChatHeader.test.tsx
import { render, screen } from '@testing-library/react';
import { ChatHeader } from '../ChatHeader';

test('renders session title', () => {
  const session = { id: '1', title: 'Test Chat' };
  render(<ChatHeader session={session} />);
  expect(screen.getByText('Test Chat')).toBeInTheDocument();
});
```

---

## 📚 References

- [Clean Architecture by Uncle Bob](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Separation of Concerns](https://en.wikipedia.org/wiki/Separation_of_concerns)
- [React Hooks Best Practices](https://react.dev/reference/react)
- [Next.js App Router](https://nextjs.org/docs/app)

---

**Last updated**: October 22, 2025
