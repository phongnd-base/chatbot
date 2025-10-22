# API Mapping: Frontend ↔ Backend

Tài liệu này mô tả mapping giữa các API service ở frontend và các endpoint thực tế ở backend.

---

## 📋 Tổng quan

| Module | Endpoints | Frontend Coverage |
|--------|-----------|-------------------|
| **Auth** | 6 | 4/6 (66%) |
| **Session** | 9 | 8/9 (89%) ⚠️ |
| **Folder** | 6 | 6/6 (100%) ✅ |
| **Message** | 2 | 2/2 (100%) ✅ |
| **AI** | 1 | 1/1 (100%) ✅ |

---

## 🔐 Auth Module

### Backend: `@Controller('auth')`

| Method | Endpoint | Description | Frontend Method |
|--------|----------|-------------|-----------------|
| `POST` | `/auth/register` | Register new user | `authService.register()` |
| `POST` | `/auth/login` | Login with email/password | `authService.login()` |
| `POST` | `/auth/refresh` | Refresh access token | ❌ Not implemented in frontend |
| `GET` | `/auth/me` | Get current user info | ❌ Not implemented in frontend |
| `GET` | `/auth/google` | Initiate Google OAuth | `authService.getGoogleAuthUrl()` |
| `GET` | `/auth/google/callback` | Google OAuth callback | Browser redirect |

### Frontend: `authService`

```typescript
// Fully implemented
✅ login(credentials)
✅ register(credentials)
✅ setTokens(tokens)      // BFF helper
✅ logout()               // BFF helper
✅ getGoogleAuthUrl()

// Missing implementations
❌ refreshToken()         // POST /auth/refresh
❌ getCurrentUser()       // GET /auth/me
```

---

## 📁 Session Module

### Backend: `@Controller('sessions')`

| Method | Endpoint | Description | Frontend Method |
|--------|----------|-------------|-----------------|
| `GET` | `/sessions` | List all sessions | `sessionService.getSessions()` |
| `GET` | `/sessions/:id` | Get session by ID | `sessionService.getSession()` |
| `POST` | `/sessions` | Create new session | `sessionService.createSession()` |
| `PATCH` | `/sessions/:id` | Update session | `sessionService.updateSession()` |
| `DELETE` | `/sessions/:id` | Delete session | `sessionService.deleteSession()` |
| `PATCH` | `/sessions/:id/favorite` | Toggle favorite | ⚠️ Hidden in frontend |
| `PATCH` | `/sessions/:id/folder` | Set folder | `sessionService.setFolder()` |
| `GET` | `/sessions/:id/export.json` | Export as JSON | `sessionService.exportJson()` |
| `GET` | `/sessions/:id/export.md` | Export as Markdown | `sessionService.exportMarkdown()` |

### DTO Mapping

**CreateSessionDto (Backend)** → **CreateSessionRequest (Frontend)**
```typescript
{
  title?: string;
  folderId?: string;
  model?: string;
  provider?: 'OPENAI' | 'GOOGLE' | 'ANTHROPIC';
}
```

**UpdateSessionDto (Backend)** → **UpdateSessionRequest (Frontend)**
```typescript
{
  title?: string;
  isFavorite?: boolean;
  folderId?: string | null;
  model?: string;
  provider?: 'OPENAI' | 'GOOGLE' | 'ANTHROPIC';
}
```

**Session Response**
```typescript
{
  id: string;
  title: string;
  model?: string;
  provider?: Provider;
  folderId?: string | null;
  isFavorite?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
```

### Frontend: `sessionService`

```typescript
// Implemented methods ✅
✅ getSessions()
✅ getSession(id)
✅ createSession(data)
✅ updateSession(id, data)
✅ deleteSession(id)
⚠️ toggleFavorite(id, isFavorite)  // Commented out - use folder favorite instead
✅ setFolder(id, folderId)
✅ exportJson(id)
✅ exportMarkdown(id)
```

---

## 📂 Folder Module

### Backend: `@Controller('folders')`

| Method | Endpoint | Description | Frontend Method |
|--------|----------|-------------|-----------------|
| `GET` | `/folders` | List all folders | `folderService.getFolders()` |
| `POST` | `/folders` | Create new folder | `folderService.createFolder()` |
| `PATCH` | `/folders/:id` | Update folder | `folderService.updateFolder()` |
| `DELETE` | `/folders/:id` | Delete folder | `folderService.deleteFolder()` |
| `PATCH` | `/folders/:id/favorite` | Toggle favorite | `folderService.toggleFavorite()` |
| `GET` | `/folders/:id/sessions` | Get folder sessions | `folderService.getFolderSessions()` |

### DTO Mapping

**CreateFolderDto (Backend)** → **CreateFolderRequest (Frontend)**
```typescript
{
  name: string;
}
```

**UpdateFolderDto (Backend)** → **UpdateFolderRequest (Frontend)**
```typescript
{
  name?: string;
  isFavorite?: boolean;
}
```

**Folder Response**
```typescript
{
  id: string;
  name: string;
  userId: string;
  isFavorite?: boolean;
  createdAt: string;
}
```

### Frontend: `folderService`

```typescript
// All methods fully implemented ✅
✅ getFolders()
✅ createFolder(data)
✅ updateFolder(id, data)
✅ deleteFolder(id)
✅ toggleFavorite(id, isFavorite)
✅ getFolderSessions(id)
```

### 📝 Note
- Backend tự động set `folderId = null` cho tất cả sessions khi delete folder
- **Folder có favorite** (mới thêm) - để đánh dấu folder quan trọng
- Session cũng có `isFavorite` ở backend nhưng **tạm ẩn ở frontend**

---

## 💬 Message Module

### Backend: `@Controller('messages')`

| Method | Endpoint | Description | Frontend Method |
|--------|----------|-------------|-----------------|
| `GET` | `/messages/:sessionId` | Get all messages | `messageService.getMessages()` |
| `POST` | `/messages` | Create message (non-streaming) | ❌ Not used |
| `POST` | `/messages/stream` | Send message with streaming | `messageService.sendMessageStream()` |

### DTO Mapping

**SendMessageRequest (Frontend)**
```typescript
{
  sessionId: string;
  prompt: string;
}
```

### Streaming Format

Backend trả về **NDJSON** (Newline-Delimited JSON), không phải SSE:

```typescript
// Stream chunks
{"delta": "Hello"}
{"delta": " world"}
{"delta": "!"}

// Final chunk
{"done": true, "messageId": "uuid-here"}
```

Frontend cần dùng `fetch` + `ReadableStream`:

```typescript
const response = await messageService.sendMessageStream({ sessionId, prompt });
const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  const lines = chunk.split('\n').filter(Boolean);
  
  for (const line of lines) {
    const data = JSON.parse(line);
    if (data.delta) {
      // Append to UI
    }
    if (data.done) {
      // Stream complete
    }
  }
}
```

### Frontend: `messageService`

```typescript
✅ getMessages(sessionId)
✅ sendMessageStream(data)  // Returns Response for streaming
```

---

## 🤖 AI Module

### Backend: `@Controller('ai')`

| Method | Endpoint | Description | Frontend Method |
|--------|----------|-------------|-----------------|
| `GET` | `/ai/models` | Get available models | `modelService.getModels()` |

### Response Format

```typescript
{
  modelsByProvider: [
    {
      provider: "OPENAI",
      models: [
        { id: "gpt-4", label: "GPT-4", provider: "OPENAI" },
        { id: "gpt-3.5-turbo", label: "GPT-3.5 Turbo", provider: "OPENAI" }
      ]
    },
    {
      provider: "GOOGLE",
      models: [
        { id: "gemini-pro", label: "Gemini Pro", provider: "GOOGLE" }
      ]
    },
    {
      provider: "ANTHROPIC",
      models: [
        { id: "claude-3-opus-20240229", label: "Claude 3 Opus", provider: "ANTHROPIC" }
      ]
    }
  ]
}
```

### Frontend: `modelService`

```typescript
✅ getModels()  // Fully implemented
```

---

## 🔄 BFF Layer (Backend-for-Frontend)

Frontend sử dụng BFF proxy tại `/api/bff/[...path]` để:
- Đọc `accessToken` từ httpOnly cookie
- Inject `Authorization: Bearer <token>` header
- Forward request đến backend
- Preserve streaming responses

**Example:**
```
Frontend: fetch('/api/bff/sessions')
↓
BFF: Adds Authorization header from cookie
↓
Backend: GET http://localhost:3001/sessions
```

---

## ✅ Checklist

### Implemented & Synced
- ✅ Auth: login, register, Google OAuth
- ✅ Sessions: full CRUD + favorite + folder + export
- ✅ Folders: full CRUD + list sessions
- ✅ Messages: list + streaming
- ✅ AI Models: get curated list

### Missing Frontend Implementations
- ❌ `POST /auth/refresh` - Token refresh
- ❌ `GET /auth/me` - Get current user
- ❌ `POST /messages` - Non-streaming message (not needed, use streaming)

### Architecture Notes
- Backend renamed `Group` → `Folder` (migration applied)
- Frontend uses `folderId` instead of `groupId` (synced)
- Session controller endpoint changed: `/sessions/:id/group` → `/sessions/:id/folder`
- Streaming uses NDJSON over HTTP POST, not SSE/WebSocket

---

## 🚀 Usage Examples

### Create Session with Folder & Model
```typescript
const session = await sessionService.createSession({
  title: 'My Chat',
  folderId: 'folder-uuid',
  model: 'gpt-4',
  provider: 'OPENAI'
});
```

### Stream AI Response
```typescript
const response = await messageService.sendMessageStream({
  sessionId: 'session-uuid',
  prompt: 'Hello!'
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  const lines = chunk.split('\n').filter(Boolean);
  
  for (const line of lines) {
    const data = JSON.parse(line);
    if (data.delta) {
      console.log('AI:', data.delta);
    }
  }
}
```

### Organize Sessions
```typescript
// Create folder
const folder = await folderService.createFolder({ name: 'Work Projects' });

// Move session to folder
await sessionService.setFolder(sessionId, folder.id);

// Mark as favorite
await sessionService.toggleFavorite(sessionId, true);

// Export session
const markdown = await sessionService.exportMarkdown(sessionId);
```

---

**Last Updated:** October 22, 2025  
**Backend Version:** NestJS 10 + Prisma 5  
**Frontend Version:** Next.js 14 + TypeScript
