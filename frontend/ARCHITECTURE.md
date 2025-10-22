# 📁 Cấu trúc Frontend - Clean Architecture

## 🎯 Tổng quan

Frontend được tổ chức theo **Clean Architecture** với phân tách rõ ràng giữa các layers:

```
frontend/
├── app/                      # Next.js App Router (Presentation)
├── components/               # UI Components
├── hooks/                    # Custom Hooks (Business Logic)
├── lib/                      # Core Libraries
│   └── api/                  # API Layer (Data Access)
│       ├── client.ts         # HTTP Client
│       ├── types.ts          # API Types
│       ├── services/         # API Services
│       └── index.ts          # Barrel export
├── store/                    # Global State (Zustand)
├── types/                    # Domain Types
└── middleware.ts             # Route Protection
```

---

## 🏗️ Architecture Layers

### 1️⃣ **API Layer** (`lib/api/`)

**Purpose**: Centralized data access and API communication

**Files**:
- `client.ts` - HTTP client với error handling
- `types.ts` - API request/response types
- `services/` - Service modules cho từng domain
  - `auth.service.ts` - Authentication
  - `session.service.ts` - Session CRUD
  - `message.service.ts` - Messages + streaming
  - `model.service.ts` - AI models

**Pattern**: Repository pattern
```typescript
// ✅ Good: Sử dụng service
const sessions = await sessionService.getSessions();

// ❌ Bad: Direct fetch trong component
const res = await fetch('/api/sessions');
```

---

### 2️⃣ **Business Logic** (`hooks/`)

**Purpose**: Reusable business logic, state management cho features

**Files**:
- `useSession.ts` - Manage session state
- `useMessages.ts` - Manage messages
- `useModels.ts` - Load AI models
- `useChatStream.ts` - Streaming functionality

**Pattern**: Custom hooks
```typescript
// ✅ Good: Component dùng hook
const { session, updateSession } = useSession(id);

// ❌ Bad: Component tự fetch và manage state
const [session, setSession] = useState();
useEffect(() => { fetchSession() }, []);
```

---

### 3️⃣ **Presentation** (`app/` + `components/`)

**Purpose**: Pure UI, no business logic

**Pattern**: Presentational components
```typescript
// ✅ Good: Clean component
export default function ChatPage({ params }) {
  const { session } = useSession(params.sessionId);
  const { messages } = useMessages(params.sessionId);
  return <ChatMessages messages={messages} />;
}

// ❌ Bad: Component với logic
export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  useEffect(() => {
    fetch('/api/messages').then(/* ... */);
  }, []);
}
```

---

### 4️⃣ **Domain Types** (`types/`)

**Purpose**: Business entities, tách biệt với API types

```typescript
// types/index.ts - Frontend domain types
export interface Folder {
  id: string;
  name: string;
  isExpanded: boolean;
}

// lib/api/types.ts - API contract types
export interface FolderResponse {
  id: string;
  name: string;
  created_at: string;
}
```

---

## ✅ Best Practices

### 1. **No API calls in components**
```typescript
// ❌ Bad
function Component() {
  useEffect(() => {
    fetch('/api/data').then(/* ... */);
  }, []);
}

// ✅ Good
function Component() {
  const { data } = useData();
}
```

### 2. **Use custom hooks for reusable logic**
```typescript
// ❌ Bad: Logic lặp lại ở nhiều nơi
function Component1() {
  const [data, setData] = useState();
  useEffect(() => { /* fetch */ }, []);
}

// ✅ Good: Hook tái sử dụng
function useData() {
  const [data, setData] = useState();
  useEffect(() => { /* fetch */ }, []);
  return { data };
}
```

### 3. **Separate concerns**
- **API Layer**: Chỉ biết về HTTP requests
- **Hooks**: Chỉ biết về business logic
- **Components**: Chỉ biết về UI rendering

---

## 🔄 Data Flow

```
User Action → Component → Hook → Service → API → Backend
                  ↓         ↓        ↓
                  UI ← State ← Response
```

**Example: Send message**
```typescript
// 1. User clicks send button
<ChatInput onSend={handleSend} />

// 2. Component calls hook
const handleSend = (text) => {
  streamMessage(text, tempId);
};

// 3. Hook calls service
const { streamMessage } = useChatStream({
  sessionId,
  onMessageUpdate,
});

// 4. Service makes API call
export const messageService = {
  sendMessage: (data) => apiClient.post('messages/stream', data),
};
```

---

## 📦 Files Removed

**Old services không dùng nữa:**
- ✅ `services/api.ts` - Replaced by `lib/api/services/`
- ✅ `services/chat.ts` - Replaced by `lib/api/services/message.service.ts`

**Lý do**: Inconsistent patterns, direct API calls, hard to maintain

---

## 🎨 Component Patterns

### Container Components
- Fetch data từ hooks
- Pass props xuống presentational components
- Example: `app/chat/[sessionId]/page.tsx`

### Presentational Components
- Nhận data qua props
- Render UI only
- Example: `components/chat/ChatMessages.tsx`

---

## 🚀 Next Steps

1. ✅ Tách types ra khỏi stores
2. ✅ Xóa old services
3. ✅ Refactor login/register dùng authService
4. 🔄 Sync sidebar sessions với backend
5. 🔄 Add error boundaries
6. 🔄 Add loading states
7. 🔄 Add optimistic updates

---

## 📖 References

- [Clean Architecture by Uncle Bob](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Next.js App Router Best Practices](https://nextjs.org/docs/app/building-your-application)
- [React Hooks Best Practices](https://react.dev/reference/react)
