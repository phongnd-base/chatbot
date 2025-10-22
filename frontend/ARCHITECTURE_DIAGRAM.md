# 🏗️ Frontend Architecture Diagram

## 📊 Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                       │
│                      (app/ + components/)                    │
│                                                               │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐        │
│  │  Pages      │  │ Components  │  │  UI Library   │        │
│  │  (Routes)   │  │ (Reusable)  │  │  (shadcn/ui)  │        │
│  └─────────────┘  └─────────────┘  └──────────────┘        │
│         │                 │                  │               │
│         └─────────────────┴──────────────────┘               │
│                           │                                   │
└───────────────────────────┼───────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                      │
│                          (hooks/)                             │
│                                                               │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐        │
│  │ useSession  │  │ useMessages │  │ useChatStream │        │
│  └─────────────┘  └─────────────┘  └──────────────┘        │
│  ┌─────────────┐  ┌─────────────┐                           │
│  │ useModels   │  │  useAuth    │                           │
│  └─────────────┘  └─────────────┘                           │
│         │                 │                  │               │
│         └─────────────────┴──────────────────┘               │
│                           │                                   │
└───────────────────────────┼───────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     DATA ACCESS LAYER                        │
│                       (lib/api/services/)                     │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐     │
│  │ authService  │  │sessionService│  │messageService  │     │
│  └──────────────┘  └──────────────┘  └───────────────┘     │
│  ┌──────────────┐                                            │
│  │ modelService │                                            │
│  └──────────────┘                                            │
│         │                 │                  │               │
│         └─────────────────┴──────────────────┘               │
│                           │                                   │
└───────────────────────────┼───────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      HTTP CLIENT                             │
│                     (lib/api/client.ts)                       │
│                                                               │
│   ┌────────────────────────────────────────────┐            │
│   │  apiClient: { get, post, put, patch, del } │            │
│   └────────────────────────────────────────────┘            │
│                           │                                   │
└───────────────────────────┼───────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        BFF / API                             │
│                    (/api/bff/[...path])                       │
│                                                               │
│   ┌────────────────────────────────────────────┐            │
│   │  Backend for Frontend - Proxy + Auth       │            │
│   └────────────────────────────────────────────┘            │
│                           │                                   │
└───────────────────────────┼───────────────────────────────────┘
                            ▼
                    🌐 Backend API
```

---

## 🔄 Data Flow Example: Send Message

```
┌─────────────────────────────────────────────────────────────┐
│  1️⃣ USER ACTION                                              │
│                                                               │
│  User types message and clicks Send                          │
│           │                                                   │
│           ▼                                                   │
│  <ChatInput onSend={handleSend} />                           │
└───────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  2️⃣ COMPONENT HANDLER                                        │
│                                                               │
│  const handleSend = (prompt) => {                            │
│    addMessage({ role: 'user', content: prompt });           │
│    streamMessage(prompt, tempId);                            │
│  }                                                            │
└───────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  3️⃣ HOOK LAYER                                               │
│                                                               │
│  const { streamMessage } = useChatStream({                   │
│    sessionId,                                                 │
│    onMessageUpdate: (id, delta) => {                         │
│      updateMessage(id, { content: delta })                   │
│    }                                                          │
│  });                                                          │
└───────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  4️⃣ SERVICE LAYER                                            │
│                                                               │
│  messageService.sendMessage({                                │
│    sessionId,                                                 │
│    prompt                                                     │
│  })                                                           │
└───────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  5️⃣ HTTP CLIENT                                              │
│                                                               │
│  apiClient.post('messages/stream', data)                     │
│                                                               │
│  ▼                                                            │
│  fetch('/api/bff/messages/stream', {                         │
│    method: 'POST',                                            │
│    body: JSON.stringify(data)                                │
│  })                                                           │
└───────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  6️⃣ BFF PROXY                                                │
│                                                               │
│  - Injects auth tokens                                       │
│  - Proxies to backend                                        │
│  - Handles 401 errors                                        │
└───────────────────────────────────────────────────────────────┘
                            │
                            ▼
                    🌐 Backend API
                            │
                            │ (streaming response)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  7️⃣ STREAMING RESPONSE                                       │
│                                                               │
│  Hook receives data chunks:                                  │
│  ┌─────────────────────────────────────┐                    │
│  │ { delta: "Hello" }                  │                    │
│  │ { delta: " world" }                 │                    │
│  │ { delta: "!", done: true, id: "x" } │                    │
│  └─────────────────────────────────────┘                    │
│           │                                                   │
│           ▼                                                   │
│  onMessageUpdate() callback                                  │
└───────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  8️⃣ STATE UPDATE                                             │
│                                                               │
│  updateMessage(tempId, {                                     │
│    content: existingContent + delta                          │
│  })                                                           │
│           │                                                   │
│           ▼                                                   │
│  Component re-renders with new content                       │
└───────────────────────────────────────────────────────────────┘
```

---

## 🗂️ File Organization

```
frontend/
│
├── 📁 app/                       # Next.js App Router
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   ├── login/                    # Login page
│   ├── register/                 # Register page
│   └── chat/
│       ├── layout.tsx            # Chat layout (with sidebar)
│       ├── [sessionId]/
│       │   └── page.tsx          # ✨ Chat page (uses hooks only)
│       └── new/
│           └── page.tsx          # New chat page
│
├── 📁 components/                # Reusable UI components
│   ├── chat/
│   │   ├── ChatHeader.tsx        # Pure: receives props
│   │   ├── ChatMessages.tsx      # Pure: renders messages
│   │   ├── ChatInput.tsx         # Pure: emits events
│   │   └── MessageItem.tsx       # Pure: single message
│   ├── sidebar/
│   │   ├── Sidebar.tsx           # Container
│   │   ├── SidebarHeader.tsx     # Actions
│   │   ├── SidebarContent.tsx    # List
│   │   └── FolderItem.tsx        # Item
│   ├── providers/
│   │   ├── AuthProvider.tsx      # Global fetch interceptor
│   │   └── ThemeProvider.tsx     # Theme context
│   └── ui/                       # shadcn/ui components
│
├── 📁 hooks/                     # ✨ Business Logic Layer
│   ├── useSession.ts             # Session CRUD + state
│   ├── useMessages.ts            # Messages CRUD + state
│   ├── useModels.ts              # AI models loading
│   ├── useChatStream.ts          # Streaming logic
│   └── index.ts                  # Barrel export
│
├── 📁 lib/                       # Core libraries
│   ├── api/                      # ✨ Data Access Layer
│   │   ├── client.ts             # HTTP client wrapper
│   │   ├── types.ts              # API types (Request/Response)
│   │   ├── services/
│   │   │   ├── auth.service.ts   # Authentication API
│   │   │   ├── session.service.ts# Session API
│   │   │   ├── message.service.ts# Message API
│   │   │   └── model.service.ts  # AI Model API
│   │   └── index.ts              # Barrel export
│   ├── auth.ts                   # Auth utilities
│   └── utils.ts                  # General utilities
│
├── 📁 store/                     # Global state (Zustand)
│   ├── sidebarStore.ts           # Sidebar state (folders/sessions)
│   └── chatStore.ts              # Chat state (active session)
│
├── 📁 types/                     # ✨ Domain Types
│   └── index.ts                  # Folder, SessionWithFolder, User
│
└── 📁 app/api/                   # Next.js API Routes
    ├── auth/                     # Auth endpoints
    │   ├── set-tokens/           # Set httpOnly cookies
    │   ├── clear-tokens/         # Clear cookies
    │   └── refresh/              # Refresh access token
    └── bff/                      # Backend For Frontend
        └── [...path]/            # Proxy to backend with auth
```

---

## 🎯 Key Principles

### 1. **Separation of Concerns**
- ✅ Components only render UI
- ✅ Hooks handle business logic
- ✅ Services handle data access

### 2. **Single Responsibility**
- ✅ Each file has one clear purpose
- ✅ Functions do one thing well
- ✅ Easy to test in isolation

### 3. **Dependency Flow**
```
Components ─depend on→ Hooks ─depend on→ Services
     ↑                    ↑                  ↑
   Render             Logic              Data
```

### 4. **Type Safety**
```
API Types (lib/api/types.ts)
    │
    ├─→ Services use API types
    │
Domain Types (types/index.ts)
    │
    ├─→ Hooks transform API → Domain
    │
    └─→ Components use Domain types
```

---

## 📚 Learn More

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Detailed patterns
- [REFACTOR_SUMMARY.md](./REFACTOR_SUMMARY.md) - Before/After
- [CHECKLIST.md](./CHECKLIST.md) - Implementation checklist
