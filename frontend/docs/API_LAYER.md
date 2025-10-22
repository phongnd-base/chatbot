# 🔌 API Layer Documentation

> HTTP communication & service architecture

## 🎯 Overview

API Layer là **Data Access Layer**, chịu trách nhiệm:
- HTTP communication với backend
- Error handling
- Type safety cho requests/responses
- Authentication token injection

---

## 📁 Structure

```
lib/api/
├── client.ts              # HTTP client wrapper
├── types.ts               # API request/response types
├── services/
│   ├── auth.service.ts    # Authentication
│   ├── session.service.ts # Session CRUD
│   ├── message.service.ts # Messages + streaming
│   ├── model.service.ts   # AI models
│   └── folder.service.ts  # Folder management
└── index.ts               # Barrel exports
```

---

## 🛠️ HTTP Client (`client.ts`)

### Core Functions

```typescript
export const apiClient = {
  get: async <T>(path: string): Promise<T> => {
    const res = await fetch(`/api/bff/${path}`, {
      method: 'GET',
      credentials: 'include',
    });
    return handleResponse<T>(res);
  },

  post: async <T>(path: string, data?: unknown): Promise<T> => {
    const res = await fetch(`/api/bff/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return handleResponse<T>(res);
  },

  patch: async <T>(path: string, data?: unknown): Promise<T> => {
    const res = await fetch(`/api/bff/${path}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return handleResponse<T>(res);
  },

  delete: async <T>(path: string): Promise<T> => {
    const res = await fetch(`/api/bff/${path}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return handleResponse<T>(res);
  },
};
```

### Error Handling

```typescript
class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(
      error.message || 'Request failed',
      response.status,
      error
    );
  }

  const data = await response.json();
  return data;
}
```

---

## 📝 API Types (`types.ts`)

### Request Types
```typescript
export interface CreateSessionRequest {
  title?: string;
  modelId?: string;
}

export interface UpdateSessionRequest {
  title?: string;
  modelId?: string;
  folderId?: string;
}

export interface SendMessageRequest {
  sessionId: string;
  prompt: string;
}
```

### Response Types
```typescript
export interface Session {
  id: string;
  title: string;
  modelId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: Provider;
}

export type Provider = 'openai' | 'anthropic' | 'google' | 'local';
```

---

## 🔧 Services

### Auth Service (`auth.service.ts`)

```typescript
export const authService = {
  /**
   * Login with email and password
   */
  login: async (credentials: { email: string; password: string }) => {
    return apiClient.post<AuthResponse>('auth/login', credentials);
  },

  /**
   * Register new user
   */
  register: async (data: RegisterRequest) => {
    return apiClient.post<AuthResponse>('auth/register', data);
  },

  /**
   * Get Google OAuth URL
   */
  getGoogleAuthUrl: async () => {
    return apiClient.get<{ url: string }>('auth/google');
  },

  /**
   * Set tokens in httpOnly cookies
   */
  setTokens: async (tokens: { accessToken: string; refreshToken: string }) => {
    return fetch('/api/auth/set-tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tokens),
    });
  },

  /**
   * Clear auth cookies
   */
  clearTokens: async () => {
    return fetch('/api/auth/clear-tokens', { method: 'POST' });
  },
};
```

### Session Service (`session.service.ts`)

```typescript
export const sessionService = {
  /**
   * Get all sessions for current user
   */
  getSessions: async () => {
    return apiClient.get<Session[]>('sessions');
  },

  /**
   * Get single session by ID
   */
  getSession: async (id: string) => {
    return apiClient.get<Session>(`sessions/${id}`);
  },

  /**
   * Create new session
   */
  createSession: async (data: CreateSessionRequest) => {
    return apiClient.post<Session>('sessions', data);
  },

  /**
   * Update session (title, model, folder)
   */
  updateSession: async (id: string, data: UpdateSessionRequest) => {
    return apiClient.patch<Session>(`sessions/${id}`, data);
  },

  /**
   * Delete session
   */
  deleteSession: async (id: string) => {
    return apiClient.delete(`sessions/${id}`);
  },
};
```

### Message Service (`message.service.ts`)

```typescript
export const messageService = {
  /**
   * Get all messages in a session
   */
  getMessages: async (sessionId: string) => {
    return apiClient.get<Message[]>(`messages/${sessionId}`);
  },

  /**
   * Send message (triggers streaming response)
   */
  sendMessage: async (data: SendMessageRequest) => {
    return apiClient.post('messages/stream', data);
  },
};
```

### Model Service (`model.service.ts`)

```typescript
export const modelService = {
  /**
   * Get all available AI models
   */
  getModels: async () => {
    return apiClient.get<ModelInfo[]>('models');
  },

  /**
   * Get models grouped by provider
   */
  getModelsByProvider: async () => {
    const models = await modelService.getModels();
    
    return models.reduce((acc, model) => {
      if (!acc[model.provider]) {
        acc[model.provider] = [];
      }
      acc[model.provider].push(model);
      return acc;
    }, {} as Record<Provider, ModelInfo[]>);
  },
};
```

### Folder Service (`folder.service.ts`)

```typescript
export const folderService = {
  /**
   * Get all folders
   */
  getFolders: async () => {
    return apiClient.get<Folder[]>('folders');
  },

  /**
   * Create new folder
   */
  createFolder: async (name: string) => {
    return apiClient.post<Folder>('folders', { name });
  },

  /**
   * Update folder (rename)
   */
  updateFolder: async (id: string, name: string) => {
    return apiClient.patch<Folder>(`folders/${id}`, { name });
  },

  /**
   * Delete folder
   */
  deleteFolder: async (id: string) => {
    return apiClient.delete(`folders/${id}`);
  },

  /**
   * Toggle favorite status
   */
  toggleFavorite: async (id: string, isFavorite: boolean) => {
    return apiClient.patch<Folder>(`folders/${id}`, { isFavorite });
  },
};
```

---

## 🔄 Usage Examples

### Example 1: Login Flow

```typescript
// Component/Page
async function handleLogin(email: string, password: string) {
  try {
    // 1. Call auth service
    const { accessToken, refreshToken } = await authService.login({
      email,
      password,
    });

    // 2. Store tokens in httpOnly cookies
    await authService.setTokens({ accessToken, refreshToken });

    // 3. Redirect to chat
    router.push('/chat/new');
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) {
        setError('Invalid credentials');
      }
    }
  }
}
```

### Example 2: Create Session

```typescript
// Hook
export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);

  const createSession = async (title?: string) => {
    // Optimistic update
    const tempId = crypto.randomUUID();
    const tempSession = { id: tempId, title: title || 'New Chat' };
    setSessions(prev => [tempSession, ...prev]);

    try {
      // Call service
      const newSession = await sessionService.createSession({ title });
      
      // Replace temp with real
      setSessions(prev =>
        prev.map(s => (s.id === tempId ? newSession : s))
      );
      
      return newSession;
    } catch (error) {
      // Rollback on error
      setSessions(prev => prev.filter(s => s.id !== tempId));
      throw error;
    }
  };

  return { sessions, createSession };
}
```

### Example 3: Fetch with Error Handling

```typescript
// Hook
export function useModels() {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        setLoading(true);
        const data = await modelService.getModels();
        setModels(data);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('Failed to load models');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, []);

  return { models, loading, error };
}
```

---

## 🔐 Authentication Flow

### Token Management

1. **Login** → Receive tokens from backend
2. **Store** → Save in httpOnly cookies via `/api/auth/set-tokens`
3. **Use** → BFF proxy auto-injects tokens into backend requests
4. **Refresh** → BFF handles token refresh automatically
5. **Logout** → Clear cookies via `/api/auth/clear-tokens`

### BFF Proxy (`app/api/bff/[...path]/route.ts`)

```typescript
export async function POST(request: Request, context: { params: { path: string[] } }) {
  const path = context.params.path.join('/');
  const body = await request.json();
  
  // Get tokens from cookies
  const accessToken = cookies().get('accessToken')?.value;
  const refreshToken = cookies().get('refreshToken')?.value;

  // Proxy to backend with auth
  const response = await fetch(`${BACKEND_URL}/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });

  // Handle 401: Refresh token
  if (response.status === 401 && refreshToken) {
    const newTokens = await refreshTokens(refreshToken);
    // Retry request with new token...
  }

  return response;
}
```

---

## 🧪 Testing Services

### Mock apiClient

```typescript
// __mocks__/lib/api/client.ts
export const apiClient = {
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
};
```

### Test Service

```typescript
// lib/api/services/__tests__/session.service.test.ts
import { sessionService } from '../session.service';
import { apiClient } from '../../client';

jest.mock('../../client');

describe('sessionService', () => {
  it('calls apiClient.get with correct path', async () => {
    const mockSessions = [{ id: '1', title: 'Test' }];
    (apiClient.get as jest.Mock).mockResolvedValue(mockSessions);

    const result = await sessionService.getSessions();

    expect(apiClient.get).toHaveBeenCalledWith('sessions');
    expect(result).toEqual(mockSessions);
  });
});
```

---

## ✅ Best Practices

### 1. **Always Type Responses**
```typescript
// ✅ Good
const sessions = await apiClient.get<Session[]>('sessions');

// ❌ Bad
const sessions = await apiClient.get('sessions'); // any type
```

### 2. **Handle Errors in Hooks, Not Services**
```typescript
// ✅ Good: Service throws, hook handles
export const sessionService = {
  getSession: (id: string) => apiClient.get(`sessions/${id}`),
};

export function useSession(id: string) {
  try {
    const session = await sessionService.getSession(id);
  } catch (error) {
    // Handle error here
  }
}

// ❌ Bad: Service handles errors
export const sessionService = {
  getSession: async (id: string) => {
    try {
      return await apiClient.get(`sessions/${id}`);
    } catch (error) {
      console.error(error); // Don't do this
    }
  },
};
```

### 3. **Use Service Methods, Not Direct apiClient**
```typescript
// ✅ Good
const sessions = await sessionService.getSessions();

// ❌ Bad
const sessions = await apiClient.get('sessions');
```

### 4. **Group Related Operations**
```typescript
// ✅ Good: All session operations in one service
export const sessionService = {
  getSessions,
  getSession,
  createSession,
  updateSession,
  deleteSession,
};

// ❌ Bad: Scattered across multiple files
```

---

## 📚 References

- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [TypeScript Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [Error Handling](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling)

---

**Last updated**: October 22, 2025
