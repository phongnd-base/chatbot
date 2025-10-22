# 📂 Sidebar System - Documentation

## 🎯 Tổng quan

Sidebar được thiết kế theo cấu trúc component module hoá, hỗ trợ:
- ✅ Toggle sidebar (mở/thu nhỏ)
- ✅ Tạo và quản lý folders
- ✅ Di chuyển sessions vào folders
- ✅ Expand/collapse folders
- ✅ Rename & delete folders
- ✅ Delete sessions
- ✅ Responsive mini sidebar

---

## 🗂️ Cấu trúc thư mục

```
components/sidebar/
├── Sidebar.tsx           # Main container (quản lý collapsed state)
├── SidebarHeader.tsx     # Header với logo, New Chat, New Folder
├── SidebarContent.tsx    # Content area hiển thị folders & sessions
├── SidebarFooter.tsx     # Footer với Settings button
├── FolderItem.tsx        # Component hiển thị 1 folder
└── SessionListItem.tsx   # Component hiển thị 1 session

store/
└── sidebarStore.ts       # Zustand store quản lý state sidebar
```

---

## 🧩 Chi tiết các Component

### 1️⃣ **Sidebar.tsx** (Main Container)
**Chức năng:**
- Container chính cho toàn bộ sidebar
- Quản lý trạng thái `isCollapsed` từ store
- Responsive width: `w-72` (expanded) → `w-16` (collapsed)

**Props:** Không có (lấy state từ store)

---

### 2️⃣ **SidebarHeader.tsx**
**Chức năng:**
- Logo & brand name "Voice Bot"
- Button "New Chat" → tạo session mới
- Button "New Folder" → tạo folder mới (inline input)
- Toggle button (menu icon) để thu nhỏ sidebar

**Tương tác:**
- Click "New Chat" → redirect `/chat/new`
- Click "New Folder" → hiện input inline
- Enter → tạo folder mới
- Esc → cancel

**Mini mode:** Chỉ hiện icons

---

### 3️⃣ **SidebarContent.tsx**
**Chức năng:**
- Hiển thị danh sách folders và sessions
- Render `FolderItem` cho mỗi folder
- Render `SessionListItem` cho sessions không có folder (ungrouped)
- Empty state khi chưa có gì

**Logic:**
```tsx
// Lọc sessions theo folder
folderSessions = sessions.filter(s => s.folderId === folder.id)
ungroupedSessions = sessions.filter(s => !s.folderId)
```

**Mini mode:** Chỉ hiển thị 8 sessions đầu tiên (icons only)

---

### 4️⃣ **FolderItem.tsx**
**Chức năng:**
- Hiển thị 1 folder với tên + số lượng sessions
- Toggle expand/collapse (ChevronDown/Right icon)
- Context menu (3 dots) với:
  - ✏️ Rename folder
  - 🗑️ Delete folder
- Inline rename với input field
- Hiển thị danh sách sessions bên trong khi expanded

**Props:**
```tsx
{
  folder: Folder;
  sessions: SessionWithFolder[];
  activeSessionId?: string;
}
```

**Interactions:**
- Click folder name → toggle expand/collapse
- Click menu → show rename/delete options
- Rename: inline input + Enter/Esc
- Delete: confirm dialog

---

### 5️⃣ **SessionListItem.tsx**
**Chức năng:**
- Hiển thị 1 session (chat conversation)
- Active state highlighting
- Context menu (3 dots) với:
  - 📁 Move to folder (submenu)
  - 🗑️ Delete session

**Props:**
```tsx
{
  session: SessionWithFolder;
  isActive?: boolean;
  isCollapsed?: boolean; // cho mini mode
}
```

**Interactions:**
- Click session → redirect `/chat/:sessionId`
- Move to folder → submenu hiện list folders
- Delete → confirm dialog

**Mini mode:** Chỉ hiển thị icon MessageSquare

---

### 6️⃣ **SidebarFooter.tsx**
**Chức năng:**
- Settings button
- (Có thể mở rộng: User profile, Theme toggle, v.v.)

**Mini mode:** Chỉ hiển thị Settings icon

---

## 🗄️ Zustand Store (`sidebarStore.ts`)

### State:
```tsx
{
  isCollapsed: boolean;
  folders: Folder[];
  sessions: SessionWithFolder[];
}
```

### Actions:

| Action | Mô tả |
|--------|-------|
| `toggleSidebar()` | Đóng/mở sidebar |
| `toggleFolder(id)` | Expand/collapse folder |
| `createFolder(name)` | Tạo folder mới |
| `deleteFolder(id)` | Xóa folder (sessions → root) |
| `renameFolder(id, name)` | Đổi tên folder |
| `moveSessionToFolder(sessionId, folderId)` | Di chuyển session vào folder |
| `addSession(session)` | Thêm session mới |
| `deleteSession(id)` | Xóa session |
| `setSessions(sessions)` | Set toàn bộ sessions (sync từ API) |

### Persist:
Store được persist vào `localStorage` với key `sidebar-storage`

---

## 🎨 UI/UX Features

### 1. **Toggle Sidebar**
- Click menu icon (☰) ở header
- Transition smooth 300ms
- Mini mode: icons only, tooltips on hover

### 2. **Folder Management**
- Create: Click "New Folder" → inline input
- Rename: Click menu → Rename → inline input
- Delete: Confirm dialog → sessions move to root
- Expand/Collapse: Click folder name hoặc chevron icon

### 3. **Session Management**
- Create: Click "New Chat" → auto tạo + redirect
- Move: Right-click menu → "Move to folder" → chọn folder
- Delete: Confirm dialog

### 4. **Context Menus**
- Hiện khi hover + click "⋮" (3 dots)
- Click outside → đóng menu
- Nested menu cho "Move to folder"

### 5. **Active State**
- Session đang active: `bg-neutral-800`
- Hover effects: `hover:bg-neutral-800/50`

---

## 🔗 Integration với Backend

### Sync sessions từ API:
```tsx
// Trong page hoặc layout
useEffect(() => {
  async function loadSessions() {
    const sessions = await api.get('/sessions');
    useSidebarStore.getState().setSessions(sessions);
  }
  loadSessions();
}, []);
```

### Tạo session mới:
```tsx
async function createNewChat() {
  const newSession = await api.post('/sessions', { title: 'New Chat' });
  useSidebarStore.getState().addSession(newSession);
  router.push(`/chat/${newSession.id}`);
}
```

### Di chuyển session:
```tsx
async function moveSession(sessionId: string, folderId: string) {
  await api.patch(`/sessions/${sessionId}`, { folderId });
  useSidebarStore.getState().moveSessionToFolder(sessionId, folderId);
}
```

---

## 🚀 Cách sử dụng

### 1. Import vào Layout:
```tsx
// app/layout.tsx
import { Sidebar } from '@/components/sidebar/Sidebar';

export default function RootLayout({ children }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
```

### 2. Sử dụng store trong components:
```tsx
import { useSidebarStore } from '@/store/sidebarStore';

function MyComponent() {
  const sessions = useSidebarStore((state) => state.sessions);
  const addSession = useSidebarStore((state) => state.addSession);
  
  // ... logic
}
```

---

## 🎯 Keyboard Shortcuts (Có thể mở rộng)

| Shortcut | Action |
|----------|--------|
| `Ctrl + B` | Toggle sidebar |
| `Ctrl + N` | New chat |
| `Ctrl + K` | Focus search (future) |

---

## 📦 Dependencies

- `zustand` - State management
- `zustand/middleware` - Persist middleware
- `lucide-react` - Icons
- `next/navigation` - Routing

---

## 🔮 Future Enhancements

- [ ] Drag & drop sessions vào folders
- [ ] Search/filter sessions
- [ ] Pin sessions to top
- [ ] Session preview on hover
- [ ] Keyboard navigation
- [ ] Custom folder colors/icons
- [ ] Folder sorting options
- [ ] Export/import folder structure

---

## 💡 Tips

1. **Performance:** Store chỉ re-render components subscribe vào specific state slice
2. **Persist:** Data được save tự động vào localStorage
3. **Mini mode:** Best cho màn hình nhỏ hoặc focus mode
4. **Extensibility:** Dễ dàng thêm features mới vào context menu

---

✅ **Sidebar system hoàn chỉnh và production-ready!**
