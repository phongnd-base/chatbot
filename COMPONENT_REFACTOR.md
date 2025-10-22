# 🔄 Component Architecture Refactor

**Date:** October 22, 2025  
**Status:** ✅ Completed

---

## 🎯 Objective

Refactor sidebar components để:
1. **Components tự quản lý data** - Mỗi component dùng hooks trực tiếp thay vì nhận qua props
2. **Centralize types** - Tất cả types về một nơi (`lib/api/types.ts`)
3. **Remove prop drilling** - Loại bỏ việc truyền props qua nhiều tầng

---

## ✅ Changes Made

### 1. **Type Consolidation**

#### Before (Scattered Types)
```typescript
// lib/api/services/folder.service.ts
export interface Folder { ... }
export interface CreateFolderRequest { ... }
export interface UpdateFolderRequest { ... }

// lib/api/services/session.service.ts
export interface ExportData { ... }

// Inconsistent locations, hard to maintain
```

#### After (Centralized)
```typescript
// lib/api/types.ts - Single source of truth
export interface Folder { ... }
export interface CreateFolderRequest { ... }
export interface UpdateFolderRequest { ... }
export interface Session { ... }
export interface CreateSessionRequest { ... }
export interface UpdateSessionRequest { ... }
export interface ExportData { ... }
export interface Message { ... }
export interface SendMessageRequest { ... }
export interface ModelInfo { ... }
export interface ModelsResponse { ... }
```

**Benefits:**
- ✅ Một nơi quản lý tất cả types
- ✅ Dễ import: `import type { Folder, Session } from '@/lib/api/types'`
- ✅ Tránh circular dependencies
- ✅ Dễ bảo trì và sync với backend

---

### 2. **Component Architecture**

#### Before (Prop Drilling Anti-pattern)
```typescript
// Sidebar.tsx - Container fetches data and passes down
function Sidebar() {
  const { folders, createFolder, updateFolder, deleteFolder } = useFolders();
  const { sessions, createSession, deleteSession } = useSessions();
  
  return (
    <SidebarHeader 
      createFolder={createFolder}
      createSession={createSession}
    />
    <SidebarContent 
      folders={folders}
      sessions={sessions}
      onDeleteFolder={deleteFolder}
      onUpdateFolder={updateFolder}
      onToggleFolderFavorite={toggleFolderFavorite}
      onDeleteSession={deleteSession}
    />
  );
}

// SidebarContent.tsx - Passes props to children
function SidebarContent({ folders, sessions, onDeleteFolder, ... }) {
  return folders.map(folder => (
    <FolderItem 
      folder={folder}
      onDelete={onDeleteFolder}
      onUpdate={onUpdateFolder}
      onToggleFavorite={onToggleFolderFavorite}
      onDeleteSession={onDeleteSession}
    />
  ));
}

// FolderItem.tsx - Finally uses the props
function FolderItem({ folder, onDelete, onUpdate, onToggleFavorite }) {
  // Use props
}
```

**Problems:**
- ❌ Prop drilling qua 2-3 tầng components
- ❌ Props interface phức tạp
- ❌ Khó refactor (phải update nhiều file)
- ❌ Component không tự chủ

#### After (Self-Contained Components)
```typescript
// Sidebar.tsx - Just layout
function Sidebar() {
  return (
    <SidebarHeader />
    <SidebarContent />
    <SidebarFooter />
  );
}

// SidebarContent.tsx - Fetches own data
function SidebarContent() {
  const { folders } = useFolders();
  const { sessions } = useSessions();
  
  return folders.map(folder => (
    <FolderItem folder={folder} sessionCount={count} sessions={[...]} />
  ));
}

// FolderItem.tsx - Manages own actions
function FolderItem({ folder, sessionCount, sessions, activeSessionId }) {
  const { updateFolder, deleteFolder, toggleFavorite } = useFolders();
  
  const handleDelete = async () => {
    await deleteFolder(folder.id);
  };
  
  // Component handles its own logic
}

// SessionListItem.tsx - Self-contained
function SessionListItem({ session, isActive, isCollapsed }) {
  const { folders } = useFolders();
  const { deleteSession } = useSessions();
  
  // Manages own actions
}

// SidebarHeader.tsx - Self-contained
function SidebarHeader() {
  const { createFolder } = useFolders();
  const { createSession } = useSessions();
  
  // Creates own resources
}
```

**Benefits:**
- ✅ Mỗi component tự quản lý data mình cần
- ✅ Không có prop drilling
- ✅ Dễ refactor (chỉ sửa 1 component)
- ✅ Component reusable hơn
- ✅ Testing dễ hơn (mock hooks thay vì props)

---

## 📊 Before vs After Comparison

### Component Props

| Component | Before | After | Improvement |
|-----------|--------|-------|-------------|
| **Sidebar** | 8 props passed | 0 props | -100% |
| **SidebarHeader** | 2 props | 0 props | -100% |
| **SidebarContent** | 6 props | 0 props | -100% |
| **FolderItem** | 8 props | 4 props | -50% |
| **SessionListItem** | 5 props | 3 props | -40% |

### Hook Usage

| Component | Hooks Used |
|-----------|------------|
| **Sidebar** | `useSidebarStore` (UI only) |
| **SidebarHeader** | `useSidebarStore`, `useFolders`, `useSessions` |
| **SidebarContent** | `useSidebarStore`, `useChatStore`, `useFolders`, `useSessions` |
| **FolderItem** | `useSidebarStore`, `useFolders` |
| **SessionListItem** | `useFolders`, `useSessions` |

### Data Flow

#### Before
```
Sidebar (fetches all data)
  ↓ (8 props)
SidebarHeader
  ↓ (2 callbacks)
[Creates resources]

Sidebar
  ↓ (6 props)
SidebarContent
  ↓ (8 props)
FolderItem
  ↓ (4 props)
SessionListItem
```

#### After
```
Sidebar (layout only)
  ↓ (no props)
SidebarHeader → useFolders(), useSessions() (creates resources)

Sidebar
  ↓ (no props)
SidebarContent → useFolders(), useSessions() (fetches data)
  ↓ (4 props: data only)
FolderItem → useFolders() (manages actions)
  ↓ (3 props: data only)
SessionListItem → useFolders(), useSessions() (manages actions)
```

---

## 📁 Files Modified

### Types (1 file)
- ✅ `lib/api/types.ts` - Added all Folder, Session, Message types
- ✅ `lib/api/services/folder.service.ts` - Removed types, import from types.ts
- ✅ `lib/api/services/session.service.ts` - Removed ExportData, import from types.ts

### Hooks (2 files)
- ✅ `hooks/useFolders.ts` - Updated type imports, fixed `toggleFavorite` signature
- ✅ `hooks/useSessions.ts` - Updated type imports, changed `createSession` to accept `CreateSessionRequest`

### Components (5 files)
- ✅ `components/sidebar/Sidebar.tsx` - Removed all data fetching and prop passing
- ✅ `components/sidebar/SidebarHeader.tsx` - Added `useFolders`, `useSessions` hooks
- ✅ `components/sidebar/SidebarContent.tsx` - Added `useFolders`, `useSessions` hooks, removed props
- ✅ `components/sidebar/FolderItem.tsx` - Added `useFolders` hook, removed action props
- ✅ `components/sidebar/SessionListItem.tsx` - Added `useFolders`, `useSessions` hooks, removed props

---

## 🔧 Technical Details

### Hook Signatures Updated

#### useFolders
```typescript
// Before
const createFolder = async (name: string) => { ... }
const updateFolder = async (id: string, updates: Partial<FolderData>) => { ... }
const toggleFavorite = async (id: string) => { ... }

// After  
const createFolder = async (data: CreateFolderRequest) => { ... }
const updateFolder = async (id: string, updates: UpdateFolderRequest) => { ... }
const toggleFavorite = async (id: string, isFavorite: boolean) => { ... }
```

#### useSessions
```typescript
// Before
const createSession = async (title: string) => { ... }

// After
const createSession = async (data: CreateSessionRequest = {}) => { ... }
```

### Component Responsibilities

| Component | Responsibility |
|-----------|----------------|
| **Sidebar** | Layout structure only |
| **SidebarHeader** | Create folders/sessions, UI collapsed state |
| **SidebarContent** | Fetch & organize data, render lists |
| **FolderItem** | Manage folder (rename, delete, favorite, expand/collapse) |
| **SessionListItem** | Manage session (delete, move to folder) |

---

## ✅ Benefits

### Developer Experience
- ✅ **Cleaner code**: No prop drilling
- ✅ **Easier refactoring**: Change one component, done
- ✅ **Better IntelliSense**: Clear type imports
- ✅ **Self-documenting**: Component shows exactly what data it needs

### Maintainability
- ✅ **Single source of truth for types**
- ✅ **Each component owns its behavior**
- ✅ **Easy to add new features** (just add hook call)
- ✅ **No cascading prop updates**

### Performance
- ✅ **Better memoization**: Each component controls re-renders
- ✅ **Selective updates**: Only components using data re-render
- ✅ **No unnecessary prop passing**

---

## 🧪 Testing Impact

### Before (Prop-based)
```typescript
// Had to mock all props
<FolderItem
  folder={mockFolder}
  onDelete={mockDelete}
  onUpdate={mockUpdate}
  onToggleFavorite={mockToggle}
  onDeleteSession={mockDeleteSession}
  sessionCount={3}
  sessions={mockSessions}
  activeSessionId="123"
/>
```

### After (Hook-based)
```typescript
// Mock hooks once
jest.mock('@/hooks', () => ({
  useFolders: () => ({
    updateFolder: mockUpdate,
    deleteFolder: mockDelete,
    toggleFavorite: mockToggle,
  }),
}));

// Simpler component test
<FolderItem
  folder={mockFolder}
  sessionCount={3}
  sessions={mockSessions}
  activeSessionId="123"
/>
```

---

## 📝 Migration Guide

If you need to add a new action to folders:

### Before (Had to update 3 files)
```typescript
// 1. Add to useFolders
const archiveFolder = async (id: string) => { ... }

// 2. Add to Sidebar props
<SidebarContent 
  onArchiveFolder={archiveFolder}
  ...
/>

// 3. Pass to FolderItem
<FolderItem 
  onArchive={onArchiveFolder}
  ...
/>

// 4. Use in FolderItem
const handleArchive = () => onArchive(folder.id);
```

### After (Only update 2 files)
```typescript
// 1. Add to useFolders
const archiveFolder = async (id: string) => { ... }

// 2. Use directly in FolderItem
const { archiveFolder } = useFolders();
const handleArchive = () => archiveFolder(folder.id);
```

---

## ⚠️ Breaking Changes

### Type Imports
```typescript
// Before
import type { Folder } from '@/lib/api/services/folder.service';
import type { ExportData } from '@/lib/api/services/session.service';

// After
import type { Folder, ExportData } from '@/lib/api/types';
```

### Component Props
```typescript
// SidebarHeader: No longer accepts props
<SidebarHeader />  // ✅ Correct
<SidebarHeader createFolder={...} />  // ❌ Error

// FolderItem: Different props
<FolderItem 
  folder={folder}
  sessionCount={3}
  sessions={sessions}
  activeSessionId="123"
/>  // ✅ Correct

<FolderItem 
  folder={folder}
  onDelete={handleDelete}
  // ...
/>  // ❌ Error
```

---

## 🚀 Next Steps (Optional Improvements)

1. **Add React Query** for better caching & sync
   ```typescript
   const { data: folders } = useQuery('folders', folderService.getFolders);
   ```

2. **Add optimistic updates** in hooks
   ```typescript
   const deleteFolder = async (id: string) => {
     setFolders(prev => prev.filter(f => f.id !== id)); // Optimistic
     try {
       await folderService.deleteFolder(id);
     } catch (err) {
       setFolders(prevFolders); // Rollback
     }
   };
   ```

3. **Extract shared logic** to custom hooks
   ```typescript
   const useConfirmDelete = (message: string) => {
     return (callback: () => void) => {
       if (confirm(message)) callback();
     };
   };
   ```

---

## ✅ Verification Checklist

- [x] All types consolidated in `lib/api/types.ts`
- [x] All services import types from central location
- [x] All hooks use proper types
- [x] Sidebar.tsx has no data management
- [x] SidebarHeader uses own hooks
- [x] SidebarContent uses own hooks
- [x] FolderItem uses own hooks
- [x] SessionListItem uses own hooks
- [x] No TypeScript errors
- [x] No prop drilling (max 1 level for data props)
- [x] Components are self-contained

---

**Status:** ✅ **REFACTOR COMPLETE**

Architecture is now clean, maintainable, and follows React best practices. Each component manages its own data and actions using hooks directly.
