# Zustand Architecture Refactor

## 📋 Tổng quan

Đã refactor toàn bộ hệ thống quản lý state (sessions, folders, messages) theo kiến trúc 4 lớp chuẩn:

```
┌─────────────────────────────────────────┐
│  UI Component Layer (Components)        │  ← Chỉ hiển thị UI, gọi hooks
├─────────────────────────────────────────┤
│  Custom Hook Layer (Hooks)              │  ← Điều phối logic, side effects
├─────────────────────────────────────────┤
│  Service API Layer (Services)           │  ← Gọi API backend
├─────────────────────────────────────────┤
│  Zustand Store Layer (State Management) │  ← Quản lý state toàn cục
└─────────────────────────────────────────┘
```

---

## 🎯 Kiến trúc 4 lớp

### 1️⃣ Zustand Store Layer (State Management)

**Nhiệm vụ**: Quản lý state toàn cục và actions thuần túy (không có side effects)

**Files**:
- `store/sessionStore.ts` - Session state
- `store/folderStore.ts` - Folder state  
- `store/messageStore.ts` - Message state

**Pattern**:
```typescript
import { create } from 'zustand';

interface State {
  // State
  items: Item[];
  loading: boolean;
  error: Error | null;

  // Actions (pure functions)
  setItems: (items: Item[]) => void;
  addItem: (item: Item) => void;
  updateItem: (id: string, updates: Partial<Item>) => void;
  removeItem: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  reset: () => void;
}

export const useStore = create<State>((set) => ({
  items: [],
  loading: false,
  error: null,

  setItems: (items) => set({ items }),
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  // ... other actions
}));
```

**Đặc điểm**:
- ✅ Chỉ chứa state và actions
- ✅ Actions là pure functions (không async, không side effects)
- ✅ Không gọi API
- ✅ Không có business logic phức tạp

---

### 2️⃣ Service API Layer

**Nhiệm vụ**: Gọi API backend, xử lý request/response

**Files** (đã có sẵn):
- `lib/api/services/session.service.ts`
- `lib/api/services/folder.service.ts`
- `lib/api/services/message.service.ts`

**Pattern**:
```typescript
class SessionService {
  async getSessions(): Promise<Session[]> {
    const response = await api.get('/sessions');
    return response.data;
  }

  async createSession(data: CreateSessionRequest): Promise<Session> {
    const response = await api.post('/sessions', data);
    return response.data;
  }
  // ... other API calls
}

export const sessionService = new SessionService();
```

**Đặc điểm**:
- ✅ Chỉ gọi API
- ✅ Xử lý request/response format
- ✅ Throw error nếu API fail
- ✅ Không quản lý state
- ✅ Không có business logic

---

### 3️⃣ Custom Hook Layer

**Nhiệm vụ**: Điều phối logic, side effects, kết nối Store + Service

**Files**:
- `hooks/useSessions.ts`
- `hooks/useFolders.ts`
- `hooks/useMessages.ts`

**Pattern**:
```typescript
export function useSessions() {
  // Get state & actions from Zustand store
  const { sessions, loading, setSessions, addSession, setLoading, setError } = useSessionStore();

  // Fetch sessions (side effect)
  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await sessionService.getSessions(); // Call API service
      setSessions(data); // Update Zustand store
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [setSessions, setLoading, setError]);

  // Create session (business logic)
  const createSession = useCallback(async (data) => {
    try {
      const newSession = await sessionService.createSession(data); // API call
      addSession(newSession); // Update store
      return newSession;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [addSession, setError]);

  // Auto-fetch on mount
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return { sessions, loading, createSession, fetchSessions };
}
```

**Đặc điểm**:
- ✅ Kết nối Zustand store với Service API
- ✅ Xử lý side effects (useEffect, async operations)
- ✅ Business logic (error handling, loading states)
- ✅ Expose API đơn giản cho components
- ✅ Không render UI

---

### 4️⃣ UI Component Layer

**Nhiệm vụ**: Hiển thị UI, xử lý user interactions

**Files** (ví dụ):
- `components/sidebar/SidebarContent.tsx`
- `components/sidebar/FolderItem.tsx`
- `components/sidebar/SessionListItem.tsx`

**Pattern**:
```typescript
export function SidebarContent() {
  // Chỉ gọi hooks, không trực tiếp gọi API hoặc store
  const { sessions, loading } = useSessions();
  const { folders } = useFolders();

  if (loading) return <Loading />;

  return (
    <div>
      {folders.map(folder => (
        <FolderItem key={folder.id} folder={folder} />
      ))}
    </div>
  );
}
```

**Đặc điểm**:
- ✅ Chỉ gọi hooks
- ✅ Render UI dựa trên data từ hooks
- ✅ Handle user events (onClick, onChange)
- ✅ Không gọi trực tiếp API
- ✅ Không access trực tiếp Zustand store

---

## 📦 Chi tiết từng Store

### Session Store (`store/sessionStore.ts`)

**State**:
```typescript
{
  sessions: Session[];    // Danh sách sessions
  loading: boolean;       // Đang fetch hay không
  error: Error | null;    // Lỗi nếu có
}
```

**Actions**:
- `setSessions(sessions)` - Set toàn bộ danh sách sessions
- `addSession(session)` - Thêm 1 session mới vào đầu danh sách
- `updateSession(id, updates)` - Update 1 session theo id
- `removeSession(id)` - Xóa 1 session theo id
- `setLoading(loading)` - Set trạng thái loading
- `setError(error)` - Set lỗi
- `reset()` - Reset về trạng thái ban đầu

---

### Folder Store (`store/folderStore.ts`)

**State**:
```typescript
{
  folders: Folder[];      // Danh sách folders
  loading: boolean;       // Đang fetch hay không
  error: Error | null;    // Lỗi nếu có
}
```

**Actions**:
- `setFolders(folders)` - Set toàn bộ danh sách folders
- `addFolder(folder)` - Thêm 1 folder mới vào cuối danh sách
- `updateFolder(id, updates)` - Update 1 folder theo id (rename, toggle favorite)
- `removeFolder(id)` - Xóa 1 folder theo id
- `setLoading(loading)` - Set trạng thái loading
- `setError(error)` - Set lỗi
- `reset()` - Reset về trạng thái ban đầu

---

### Message Store (`store/messageStore.ts`)

**State**:
```typescript
{
  messagesBySession: Record<string, Message[]>; // Map sessionId -> messages
  loading: Record<string, boolean>;             // Loading per session
  error: Record<string, Error | null>;          // Error per session
}
```

**Đặc biệt**: Store này quản lý messages theo từng session (nested structure)

**Actions**:
- `setMessages(sessionId, messages)` - Set messages cho 1 session
- `addMessage(sessionId, message)` - Thêm message vào cuối (chat streaming)
- `updateMessage(sessionId, id, updates)` - Update message (streaming content)
- `replaceMessageId(sessionId, oldId, newId)` - Thay thế temp ID bằng server ID
- `setLoading(sessionId, loading)` - Set loading cho 1 session
- `setError(sessionId, error)` - Set error cho 1 session
- `clearSession(sessionId)` - Xóa toàn bộ messages của 1 session
- `reset()` - Reset tất cả

---

## 🔄 Data Flow

### Ví dụ: Tạo Session mới

```
┌──────────────┐
│ User clicks  │
│ "New Chat"   │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────┐
│ Component:                   │
│ const { createSession } =    │
│   useSessions();             │
│ createSession();             │ ← Gọi hook
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ Hook (useSessions):          │
│ const createSession = async  │
│   () => {                    │
│   const newSession = await   │
│     sessionService           │
│       .createSession();      │ ← Gọi API service
│   addSession(newSession);    │ ← Update Zustand store
│ }                            │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ Service (sessionService):    │
│ async createSession() {      │
│   const response = await     │
│     api.post('/sessions');   │ ← HTTP request
│   return response.data;      │
│ }                            │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ Store (useSessionStore):     │
│ addSession: (session) =>     │
│   set((state) => ({          │
│     sessions: [session,      │
│       ...state.sessions]     │ ← Update state
│   }))                        │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ Component re-renders         │
│ New session appears in UI ✨ │
└──────────────────────────────┘
```

---

## ✅ Lợi ích của kiến trúc này

### 1. Separation of Concerns
- **Store**: Chỉ quản lý state
- **Service**: Chỉ gọi API
- **Hook**: Điều phối logic
- **Component**: Chỉ render UI

### 2. Testability
```typescript
// Test store (pure functions)
test('addSession adds to beginning', () => {
  const store = useSessionStore.getState();
  store.addSession(newSession);
  expect(store.sessions[0]).toBe(newSession);
});

// Test service (mock API)
test('createSession calls API', async () => {
  mock.onPost('/sessions').reply(200, newSession);
  const result = await sessionService.createSession();
  expect(result).toEqual(newSession);
});

// Test hook (mock store + service)
test('useSessions fetches on mount', async () => {
  const { result } = renderHook(() => useSessions());
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.sessions).toHaveLength(2);
});
```

### 3. Reusability
- Một store có thể dùng cho nhiều hooks
- Một service có thể dùng cho nhiều hooks
- Một hook có thể dùng cho nhiều components

### 4. Maintainability
- Thay đổi API chỉ sửa Service layer
- Thay đổi state structure chỉ sửa Store layer
- Thay đổi business logic chỉ sửa Hook layer
- Thay đổi UI chỉ sửa Component layer

### 5. Type Safety
```typescript
// Store có type rõ ràng
interface SessionState {
  sessions: Session[];
  addSession: (session: Session) => void;
}

// Hook inherit types từ store
export function useSessions() {
  const { sessions, addSession } = useSessionStore(); // ← Auto-typed
  // ...
}

// Component nhận typed data
export function SidebarContent() {
  const { sessions } = useSessions(); // ← sessions: Session[]
  // ...
}
```

---

## 🚀 Migration từ React Query

### Trước (React Query)
```typescript
// ❌ Mixing concerns
const { data: sessions = [], isLoading } = useQuery({
  queryKey: ['sessions'],
  queryFn: sessionService.getSessions, // API call in hook
});

const mutation = useMutation({
  mutationFn: sessionService.createSession,
  onSuccess: () => {
    queryClient.invalidateQueries(['sessions']); // Magic cache
  },
});
```

**Vấn đề**:
- Phụ thuộc vào thư viện bên ngoài
- Cache mechanism phức tạp
- Khó test và debug
- Query keys dễ nhầm lẫn

### Sau (Zustand + Custom Hooks)
```typescript
// ✅ Clear separation
export function useSessions() {
  const { sessions, addSession } = useSessionStore(); // State from store
  
  const createSession = async () => {
    const newSession = await sessionService.createSession(); // API call
    addSession(newSession); // Update store
  };

  return { sessions, createSession };
}
```

**Ưu điểm**:
- ✅ Kiểm soát hoàn toàn data flow
- ✅ Không phụ thuộc thư viện nặng
- ✅ Dễ test (mock store, mock service)
- ✅ Dễ debug (theo dõi store trong DevTools)
- ✅ Linh hoạt customize

---

## 📝 Best Practices

### 1. Store nên minimal
```typescript
// ✅ Good - Store chỉ chứa state
const useStore = create((set) => ({
  items: [],
  setItems: (items) => set({ items }),
}));

// ❌ Bad - Store chứa business logic
const useStore = create((set) => ({
  items: [],
  fetchItems: async () => { /* API call here */ }, // Wrong!
}));
```

### 2. Hook xử lý side effects
```typescript
// ✅ Good - Hook gọi API và update store
export function useItems() {
  const { items, setItems } = useStore();
  
  useEffect(() => {
    itemService.getItems().then(setItems);
  }, []);
  
  return { items };
}
```

### 3. Component chỉ gọi hooks
```typescript
// ✅ Good
export function ItemList() {
  const { items } = useItems();
  return <div>{items.map(...)}</div>;
}

// ❌ Bad - Component gọi trực tiếp store
export function ItemList() {
  const { items, setItems } = useStore();
  useEffect(() => {
    itemService.getItems().then(setItems); // Wrong!
  }, []);
  return <div>{items.map(...)}</div>;
}
```

### 4. Service không biết về Store
```typescript
// ✅ Good - Service chỉ gọi API
class ItemService {
  async getItems() {
    return api.get('/items');
  }
}

// ❌ Bad - Service update store
class ItemService {
  async getItems() {
    const items = await api.get('/items');
    useStore.getState().setItems(items); // Wrong!
    return items;
  }
}
```

---

## 🧪 Testing Strategy

### Test Store (Unit Test)
```typescript
import { useSessionStore } from '@/store/sessionStore';

describe('sessionStore', () => {
  beforeEach(() => {
    useSessionStore.getState().reset();
  });

  it('should add session', () => {
    const store = useSessionStore.getState();
    store.addSession(mockSession);
    expect(store.sessions).toHaveLength(1);
  });
});
```

### Test Service (Integration Test)
```typescript
import { sessionService } from '@/lib/api';
import MockAdapter from 'axios-mock-adapter';

describe('sessionService', () => {
  const mock = new MockAdapter(api);

  it('should create session', async () => {
    mock.onPost('/sessions').reply(200, mockSession);
    const result = await sessionService.createSession({});
    expect(result).toEqual(mockSession);
  });
});
```

### Test Hook (Integration Test)
```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useSessions } from '@/hooks/useSessions';

describe('useSessions', () => {
  it('should fetch sessions on mount', async () => {
    const { result } = renderHook(() => useSessions());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.sessions).toBeDefined();
  });
});
```

---

## 📚 Files Modified

### Created (Zustand Stores):
- ✅ `store/sessionStore.ts` - Session state management
- ✅ `store/folderStore.ts` - Folder state management
- ✅ `store/messageStore.ts` - Message state management

### Modified (Hooks):
- ✅ `hooks/useSessions.ts` - Refactored to use Zustand
- ✅ `hooks/useFolders.ts` - Refactored to use Zustand
- ✅ `hooks/useMessages.ts` - Refactored to use Zustand

### Removed:
- ❌ `components/providers/QueryProvider.tsx` - Deleted
- ❌ React Query imports from `app/layout.tsx` - Removed

### Unchanged (Components):
- ✅ `components/sidebar/SidebarContent.tsx` - Works automatically
- ✅ `components/sidebar/FolderItem.tsx` - Works automatically
- ✅ `components/sidebar/SessionListItem.tsx` - Works automatically

**Why?** Hook API signatures stayed the same!

---

## 🎯 Next Steps

1. ✅ Test all CRUD operations:
   - Create folder → Appears in UI
   - Delete session → Disappears from UI
   - Update session → Changes reflect
   - Toggle favorite → Star updates

2. 🔮 Optional enhancements:
   - Add Zustand DevTools middleware
   - Add persistence (localStorage) if needed
   - Add optimistic updates for better UX
   - Add retry logic for failed requests

3. 📖 Documentation:
   - Update component documentation
   - Add JSDoc comments to stores
   - Create API documentation

---

## 🔗 References

- **Zustand Docs**: https://docs.pmnd.rs/zustand
- **React Hooks**: https://react.dev/reference/react
- **Clean Architecture**: https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
