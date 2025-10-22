# 🔄 Data Flow & State Management Strategy

## 🎯 Clear Separation of Concerns

### ❌ **VẤN ĐỀ CŨ:**
- **Store (Zustand)** lưu folders + sessions → chỉ trong localStorage
- **API Services** có nhưng không dùng
- **Không sync với backend** → data loss khi clear cache
- **Conflict giữa local state và API**

### ✅ **GIẢI PHÁP MỚI:**

```
┌──────────────────────────────────────────────────────────┐
│                    COMPONENT                             │
│                  (Pure Presentation)                     │
└───────────────────┬──────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────┐
│                     HOOKS                                │
│              (Business Logic + Data)                     │
│                                                          │
│  • useFolders()    ─→ Manages folders + API sync       │
│  • useSessions()   ─→ Manages sessions + API sync      │
│  • useMessages()   ─→ Manages messages + API sync      │
└───────────────────┬──────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────┐
│                   SERVICES                               │
│                (Pure API Calls)                          │
│                                                          │
│  • folderService    ─→ CRUD folders                     │
│  • sessionService   ─→ CRUD sessions                    │
│  • messageService   ─→ CRUD messages                    │
└───────────────────┬──────────────────────────────────────┘
                    │
                    ▼
              🌐 Backend API

┌──────────────────────────────────────────────────────────┐
│                     STORE                                │
│               (UI State ONLY)                            │
│                                                          │
│  • sidebarStore → isCollapsed, expandedFolders          │
│  • chatStore    → activeSessionId                       │
│                                                          │
│  ⚠️ NO DATA (folders, sessions, messages)               │
└──────────────────────────────────────────────────────────┘
```

---

## 📋 Responsibility Matrix

| Layer | Responsibility | Example |
|-------|---------------|---------|
| **Store (Zustand)** | UI state only | `isCollapsed`, `expandedFolders` |
| **Hooks** | Data + business logic | `useFolders()`, `useSessions()` |
| **Services** | Pure API calls | `folderService.createFolder()` |
| **Components** | Render UI | `<FolderItem />` |

---

## 🏗️ Detailed Architecture

### 1️⃣ **Store Layer** (`store/`)

**Purpose**: Persistent UI state only (no data)

```typescript
// ✅ GOOD - UI state
type SidebarUIState = {
  isCollapsed: boolean;
  expandedFolders: Record<string, boolean>;
  toggleSidebar: () => void;
  toggleFolder: (id: string) => void;
};

// ❌ BAD - Data in store
type OldSidebarState = {
  folders: Folder[];  // ❌ Should be in hook
  sessions: Session[]; // ❌ Should be in hook
  createFolder: () => void; // ❌ Should call API
};
```

**Files:**
- `sidebarStore.ts` - Collapse state, folder expand/collapse
- `chatStore.ts` - Active session ID

---

### 2️⃣ **Hooks Layer** (`hooks/`)

**Purpose**: Manage data + state + sync with API

```typescript
// ✅ Hook manages data from API
export function useFolders() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchFolders = async () => {
    const data = await folderService.getFolders();
    setFolders(data);
  };
  
  const createFolder = async (name: string) => {
    const newFolder = await folderService.createFolder(name);
    setFolders(prev => [...prev, newFolder]);
  };
  
  useEffect(() => { fetchFolders(); }, []);
  
  return { folders, loading, createFolder };
}
```

**Files:**
- `useFolders.ts` - Folder CRUD + state
- `useSessions.ts` - Session CRUD + state  
- `useMessages.ts` - Message CRUD + state
- `useSession.ts` - Single session detail
- `useChatStream.ts` - Streaming chat

---

### 3️⃣ **Services Layer** (`lib/api/services/`)

**Purpose**: Pure API calls (no state)

```typescript
// ✅ Service only calls API
export const folderService = {
  getFolders: () => apiClient.get<Folder[]>('folders'),
  createFolder: (name: string) => apiClient.post<Folder>('folders', { name }),
  deleteFolder: (id: string) => apiClient.delete(`folders/${id}`),
};
```

**Files:**
- `folder.service.ts` - Folder API
- `session.service.ts` - Session API
- `message.service.ts` - Message API
- `auth.service.ts` - Auth API
- `model.service.ts` - AI model API

---

### 4️⃣ **Component Layer** (`components/`)

**Purpose**: Pure UI (no logic)

```typescript
// ✅ Component uses hook
export function FolderList() {
  const { folders, createFolder } = useFolders();
  
  return (
    <div>
      {folders.map(f => <FolderItem key={f.id} folder={f} />)}
      <Button onClick={() => createFolder('New')}>Add</Button>
    </div>
  );
}
```

---

## 🔄 Data Flow Examples

### Example 1: Create Folder

```
┌──────────────────────────────────────────────────────────┐
│ 1. User clicks "Create Folder" button                    │
│    Component: <SidebarHeader />                          │
└───────────────────┬──────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────┐
│ 2. Component calls hook method                           │
│    createFolder('My Folder')                             │
└───────────────────┬──────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────┐
│ 3. Hook calls service                                    │
│    folderService.createFolder('My Folder')               │
└───────────────────┬──────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────┐
│ 4. Service makes API call                                │
│    POST /api/bff/folders { name: 'My Folder' }          │
└───────────────────┬──────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────┐
│ 5. Backend creates folder, returns data                  │
│    { id: 'uuid', name: 'My Folder', ... }               │
└───────────────────┬──────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────┐
│ 6. Hook updates local state                              │
│    setFolders([...prev, newFolder])                      │
└───────────────────┬──────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────┐
│ 7. Component re-renders with new folder                  │
│    UI shows new folder in list                           │
└──────────────────────────────────────────────────────────┘
```

### Example 2: Toggle Folder Expand

```
┌──────────────────────────────────────────────────────────┐
│ 1. User clicks folder to expand/collapse                 │
│    Component: <FolderItem />                             │
└───────────────────┬──────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────┐
│ 2. Component calls STORE method (UI state)               │
│    toggleFolder(folderId)                                │
└───────────────────┬──────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────┐
│ 3. Store updates UI state (NO API CALL)                  │
│    expandedFolders[id] = !expandedFolders[id]            │
└───────────────────┬──────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────┐
│ 4. Component re-renders with new expanded state          │
│    Shows/hides folder content                            │
└──────────────────────────────────────────────────────────┘
```

---

## 📊 State Comparison

### ❌ OLD (Wrong)

```typescript
// Store has EVERYTHING
const sidebarStore = {
  isCollapsed: false,          // ✅ OK
  folders: [...],              // ❌ Should be in hook
  sessions: [...],             // ❌ Should be in hook
  createFolder: () => {...},   // ❌ Should call API
};

// Component directly uses store
function Component() {
  const folders = useSidebarStore(s => s.folders);
  const create = useSidebarStore(s => s.createFolder);
  // ❌ No API sync, data only in localStorage
}
```

### ✅ NEW (Correct)

```typescript
// Store ONLY UI state
const sidebarStore = {
  isCollapsed: false,                    // ✅ UI state
  expandedFolders: { 'id1': true },      // ✅ UI state
  toggleSidebar: () => {...},            // ✅ UI action
};

// Hook manages DATA with API
function useFolders() {
  const [folders, setFolders] = useState([]);
  
  const createFolder = async (name) => {
    const newFolder = await folderService.createFolder(name); // ✅ API call
    setFolders(prev => [...prev, newFolder]); // ✅ Update state
  };
  
  return { folders, createFolder };
}

// Component uses both
function Component() {
  const { folders, createFolder } = useFolders();        // ✅ Data from API
  const { isCollapsed } = useSidebarStore();             // ✅ UI state
  const { expandedFolders, toggleFolder } = useSidebarStore(); // ✅ UI state
}
```

---

## 🎯 Benefits

### 1. **Clear Separation**
- UI state in store
- Data in hooks
- API calls in services

### 2. **API Sync**
- All data comes from backend
- No data loss on cache clear
- Single source of truth

### 3. **Testability**
- Services: Test API calls
- Hooks: Test business logic
- Stores: Test UI state
- Components: Test rendering

### 4. **Maintainability**
- Change API → edit service
- Change logic → edit hook
- Change UI → edit component

---

## 📝 Migration Checklist

### ✅ Completed

- [x] Create `folderService` in `lib/api/services/`
- [x] Create `useFolders()` hook
- [x] Create `useSessions()` hook
- [x] Refactor `sidebarStore` to UI state only
- [x] Refactor `chatStore` to UI state only

### 🔄 Next Steps

- [ ] Update components to use hooks instead of store
- [ ] Remove old store methods (createFolder, setSessions, etc.)
- [ ] Implement backend API endpoints for folders
- [ ] Add optimistic updates
- [ ] Add error handling UI

---

## 🚀 Usage Examples

### Creating a Folder

```typescript
// ❌ OLD: Direct store manipulation
const createFolder = useSidebarStore(s => s.createFolder);
createFolder('My Folder'); // Only saved to localStorage

// ✅ NEW: Hook with API sync
const { createFolder } = useFolders();
await createFolder('My Folder'); // Saved to backend + local state
```

### Displaying Folders

```typescript
// ❌ OLD: From store
const folders = useSidebarStore(s => s.folders);

// ✅ NEW: From hook (synced with API)
const { folders, loading } = useFolders();
```

### Toggle Folder (UI State)

```typescript
// ✅ CORRECT: UI state in store
const { expandedFolders, toggleFolder } = useSidebarStore();
const isExpanded = expandedFolders[folderId] ?? false;

<button onClick={() => toggleFolder(folderId)}>
  {isExpanded ? 'Collapse' : 'Expand'}
</button>
```

---

## 📖 References

- [Separation of Concerns](https://en.wikipedia.org/wiki/Separation_of_concerns)
- [React Hooks Best Practices](https://react.dev/reference/react)
- [Zustand Documentation](https://docs.pmnd.rs/zustand/)
