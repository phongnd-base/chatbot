# React Query Migration Summary

## Overview
Migrated from custom useState-based hooks to React Query for automatic cache invalidation and reliable UI re-rendering after mutations.

## Problem Solved
**Issue**: UI not updating after CRUD operations (create folder, create session, delete session, etc.) - required F5 refresh to see changes.

**Root Cause**: Multiple component instances calling custom hooks with useState were getting stale closures. Optimistic updates worked in the hook but didn't trigger re-renders in all consuming components.

**Solution**: React Query provides a global cache that automatically invalidates and refetches data after mutations, ensuring all components using the same query key get updated.

---

## Changes Made

### 1. Installed React Query
```bash
npm install @tanstack/react-query
```
✅ Already installed: `"@tanstack/react-query": "^5.90.5"`

### 2. Created QueryProvider (`components/providers/QueryProvider.tsx`)
```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 60 seconds
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
```

**Configuration Explained**:
- `staleTime: 60s` - Data stays fresh for 60 seconds before refetching
- `refetchOnWindowFocus: false` - Don't auto-refetch when user returns to tab
- `retry: 1` - Only retry failed queries once

### 3. Wrapped App with QueryProvider (`app/layout.tsx`)
```tsx
import { QueryProvider } from '@/components/providers/QueryProvider';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <QueryProvider>
          <ThemeProvider>
            <AuthProvider>{children}</AuthProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
```

---

## Hook Refactoring

### Before & After Pattern

#### ❌ Old Pattern (useState-based)
```typescript
export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = useCallback(async () => {
    const data = await sessionService.getSessions();
    setSessions(data);
  }, []);

  const createSession = useCallback(async (data) => {
    const newSession = await sessionService.createSession(data);
    setSessions((prev) => [newSession, ...prev]); // ❌ Doesn't trigger re-render in all components
    return newSession;
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return { sessions, loading, createSession };
}
```

#### ✅ New Pattern (React Query)
```typescript
export function useSessions() {
  const queryClient = useQueryClient();

  const { data: sessions = [], isLoading: loading } = useQuery({
    queryKey: ['sessions'],
    queryFn: sessionService.getSessions,
  });

  const createSessionMutation = useMutation({
    mutationFn: (data) => sessionService.createSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] }); // ✅ Triggers re-render everywhere
    },
  });

  return { sessions, loading, createSession: createSessionMutation.mutateAsync };
}
```

---

## Refactored Hooks

### 1. `useSessions` Hook
**Query Key**: `['sessions']`

**Methods**:
- `sessions` - List of all sessions (auto-fetched, auto-updated)
- `loading` - Loading state
- `createSession(data)` - Create new session, auto-refresh list
- `deleteSession(id)` - Delete session, auto-refresh list
- `updateSession(id, updates)` - Update session (move to folder, rename), auto-refresh
- `refetch()` - Manually refetch sessions

**Mutations**:
- All mutations invalidate `['sessions']` query on success
- Components using `useSessions()` automatically re-render

### 2. `useFolders` Hook
**Query Key**: `['folders']`

**Methods**:
- `folders` - List of all folders (auto-fetched, auto-updated)
- `loading` - Loading state
- `createFolder(data)` - Create new folder, auto-refresh list
- `updateFolder(id, updates)` - Update folder name, auto-refresh
- `deleteFolder(id)` - Delete folder, auto-refresh list
- `toggleFavorite(id, isFavorite)` - Toggle folder favorite star, auto-refresh
- `refetch()` - Manually refetch folders

**Mutations**:
- All mutations invalidate `['folders']` query on success

### 3. `useMessages` Hook
**Query Key**: `['messages', sessionId]`

**Methods**:
- `messages` - List of messages for session (auto-fetched, auto-updated)
- `loading` - Loading state
- `addMessage(message)` - Optimistically add message to cache
- `updateMessage(id, updates)` - Update message in cache (for streaming)
- `replaceMessageId(oldId, newId)` - Replace temp ID with server ID
- `refetch()` - Manually refetch messages

**Special Behavior**:
- Uses `enabled: !!sessionId` to only fetch when session exists
- Uses `queryClient.setQueryData()` for optimistic updates (streaming chat)

---

## Benefits

### 1. Automatic UI Updates ✅
- **Before**: Create folder → need F5 → folder appears
- **After**: Create folder → folder appears immediately in all components

### 2. Global Cache
- All components using same query key share the same data
- No stale closures or duplicated state

### 3. Automatic Refetching
- Data automatically stays fresh based on `staleTime`
- Can manually trigger refetch with `queryClient.invalidateQueries()`

### 4. Built-in Loading States
- `isLoading` - Initial fetch
- `isFetching` - Background refetch
- `isPending` - Mutation in progress

### 5. Error Handling
- Automatic retry with configurable attempts
- Error state available in hook return value

### 6. Optimistic Updates (Messages)
- `queryClient.setQueryData()` allows updating cache before server confirms
- Perfect for streaming chat messages

---

## Testing Checklist

Test all CRUD operations without F5 refresh:

- [ ] **Create Folder**: Click "New Folder" → folder appears in sidebar immediately
- [ ] **Rename Folder**: Edit folder name → name updates immediately
- [ ] **Delete Folder**: Delete folder → disappears from sidebar immediately
- [ ] **Toggle Folder Favorite**: Click star → star appears/disappears immediately
- [ ] **Create Session**: Click "New Chat" → session appears in sidebar immediately
- [ ] **Delete Session**: Delete session → disappears from sidebar immediately
- [ ] **Move Session to Folder**: Drag session to folder → moves immediately
- [ ] **Rename Session**: Edit session title → title updates immediately
- [ ] **Send Message**: Send chat message → appears immediately (streaming)

**Success Criteria**: No F5 refresh needed for any operation.

---

## Migration Impact

### Files Modified
1. ✅ `components/providers/QueryProvider.tsx` - Created
2. ✅ `app/layout.tsx` - Wrapped with QueryProvider
3. ✅ `hooks/useSessions.ts` - Migrated to React Query
4. ✅ `hooks/useFolders.ts` - Migrated to React Query
5. ✅ `hooks/useMessages.ts` - Migrated to React Query

### Components (No Changes Needed!)
- `components/sidebar/SidebarHeader.tsx` - ✅ Works automatically
- `components/sidebar/SidebarContent.tsx` - ✅ Works automatically
- `components/sidebar/FolderItem.tsx` - ✅ Works automatically
- `components/sidebar/SessionListItem.tsx` - ✅ Works automatically

**Why no changes?** Hook API signatures stayed the same (`createFolder()`, `deleteSession()`, etc.), so components continue working transparently.

---

## Best Practices Applied

### 1. Query Keys Are Arrays
```typescript
['sessions']            // All sessions
['folders']             // All folders
['messages', sessionId] // Messages for specific session
```

### 2. Mutations Invalidate Queries
```typescript
useMutation({
  mutationFn: createFolder,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['folders'] });
  },
});
```

### 3. Optimistic Updates for Real-Time Features
```typescript
queryClient.setQueryData(['messages', sessionId], (old = []) => [
  ...old,
  newMessage,
]);
```

### 4. Query Enabled Only When Needed
```typescript
useQuery({
  queryKey: ['messages', sessionId],
  queryFn: () => getMessages(sessionId),
  enabled: !!sessionId, // Don't fetch if no session selected
});
```

---

## Troubleshooting

### Issue: "Cannot read properties of undefined"
**Cause**: Query returns `undefined` initially before first fetch.
**Solution**: Use default value:
```typescript
const { data: sessions = [] } = useQuery(...);
```

### Issue: Mutations not triggering refetch
**Cause**: Query key mismatch or missing `invalidateQueries`.
**Solution**: Ensure query keys match exactly:
```typescript
useQuery({ queryKey: ['sessions'] });
queryClient.invalidateQueries({ queryKey: ['sessions'] }); // ✅ Match
```

### Issue: Too many refetches
**Cause**: Default `staleTime: 0` refetches on every focus.
**Solution**: Increase `staleTime` in QueryClient config:
```typescript
staleTime: 60 * 1000 // 60 seconds
```

---

## Next Steps

1. ✅ Install React Query
2. ✅ Setup QueryClientProvider
3. ✅ Refactor useSessions
4. ✅ Refactor useFolders
5. ✅ Refactor useMessages
6. ⏳ **Test all CRUD operations** (current step)
7. 🔮 Consider adding React Query DevTools (optional):
   ```typescript
   import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
   
   <QueryClientProvider client={queryClient}>
     {children}
     <ReactQueryDevtools initialIsOpen={false} />
   </QueryClientProvider>
   ```

---

## References

- **React Query Docs**: https://tanstack.com/query/latest
- **Migration Guide**: https://tanstack.com/query/latest/docs/react/guides/migrating-to-react-query-5
- **Best Practices**: https://tkdodo.eu/blog/practical-react-query
