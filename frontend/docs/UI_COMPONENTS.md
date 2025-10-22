# 🎨 UI Components Documentation

> Component library, sidebar system & theming

## 🎯 Overview

UI Components được xây dựng với:
- **shadcn/ui** - Base component library
- **Radix UI** - Headless components (Dropdown, Dialog, etc.)
- **TailwindCSS** - Styling
- **Lucide React** - Icons
- **next-themes** - Theme management

---

## 📁 Component Structure

```
components/
├── chat/                    # Chat feature components
│   ├── ChatHeader.tsx
│   ├── ChatMessages.tsx
│   ├── ChatInput.tsx
│   ├── MessageItem.tsx
│   └── SessionItem.tsx
│
├── sidebar/                 # Sidebar system
│   ├── Sidebar.tsx          # Main container
│   ├── SidebarHeader.tsx    # Header with actions
│   ├── SidebarContent.tsx   # Content area
│   ├── SidebarFooter.tsx    # Footer with settings
│   ├── FolderItem.tsx       # Folder component
│   └── SessionListItem.tsx  # Session component
│
├── providers/               # Context providers
│   └── ThemeProvider.tsx    # Theme context
│
├── ui/                      # shadcn/ui components
│   ├── button.tsx
│   ├── dropdown-menu.tsx
│   ├── input.tsx
│   ├── scroll-area.tsx
│   └── ...
│
└── ThemeToggle.tsx          # Theme switcher
```

---

## 🗂️ Sidebar System

### Architecture

```
┌─────────────────────────────────┐
│       Sidebar Container         │
│  (Collapsible, Responsive)      │
│                                 │
│  ┌───────────────────────────┐ │
│  │    SidebarHeader          │ │
│  │  • Logo                   │ │
│  │  • New Chat button        │ │
│  │  • New Folder button      │ │
│  │  • Toggle button          │ │
│  └───────────────────────────┘ │
│                                 │
│  ┌───────────────────────────┐ │
│  │   SidebarContent          │ │
│  │                           │ │
│  │  📁 Folder 1              │ │
│  │    ├─ Session 1           │ │
│  │    └─ Session 2           │ │
│  │                           │ │
│  │  📁 Folder 2              │ │
│  │    └─ Session 3           │ │
│  │                           │ │
│  │  💬 Ungrouped Session 4   │ │
│  └───────────────────────────┘ │
│                                 │
│  ┌───────────────────────────┐ │
│  │    SidebarFooter          │ │
│  │  • Theme toggle           │ │
│  │  • Settings button        │ │
│  └───────────────────────────┘ │
└─────────────────────────────────┘
```

### Components

#### 1. **Sidebar.tsx** (Main Container)

```typescript
'use client';

import { useSidebarStore } from '@/store/sidebarStore';
import { SidebarHeader } from './SidebarHeader';
import { SidebarContent } from './SidebarContent';
import { SidebarFooter } from './SidebarFooter';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const isCollapsed = useSidebarStore((s) => s.isCollapsed);

  return (
    <aside
      className={cn(
        'h-screen border-r transition-all duration-300',
        'bg-white dark:bg-neutral-900',
        'border-neutral-200 dark:border-neutral-800',
        isCollapsed ? 'w-16' : 'w-72'
      )}
    >
      <SidebarHeader />
      <SidebarContent />
      <SidebarFooter />
    </aside>
  );
}
```

**Features**:
- Collapsible (16px → 288px width)
- Smooth transitions
- Theme support
- Responsive

---

#### 2. **SidebarHeader.tsx**

```typescript
'use client';

import { Plus, FolderPlus, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSidebarStore } from '@/store/sidebarStore';
import { useRouter } from 'next/navigation';
import { useFolders } from '@/hooks';

export function SidebarHeader() {
  const isCollapsed = useSidebarStore((s) => s.isCollapsed);
  const toggleSidebar = useSidebarStore((s) => s.toggleSidebar);
  const { createFolder } = useFolders();
  const router = useRouter();

  const handleNewChat = () => {
    router.push('/chat/new');
  };

  const handleNewFolder = async () => {
    const name = prompt('Folder name:');
    if (name) {
      await createFolder(name);
    }
  };

  return (
    <div className="p-3 border-b border-neutral-200 dark:border-neutral-800">
      {!isCollapsed && (
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-lg">Voice Bot</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
          >
            <Menu className="w-4 h-4" />
          </Button>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          onClick={handleNewChat}
          className="flex-1"
          size={isCollapsed ? 'icon' : 'default'}
        >
          <Plus className="w-4 h-4" />
          {!isCollapsed && <span className="ml-2">New Chat</span>}
        </Button>

        {!isCollapsed && (
          <Button
            variant="outline"
            size="icon"
            onClick={handleNewFolder}
          >
            <FolderPlus className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
```

**Features**:
- New Chat button
- New Folder button
- Sidebar toggle
- Mini mode (icons only)

---

#### 3. **FolderItem.tsx**

```typescript
'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Folder, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSidebarStore } from '@/store/sidebarStore';
import { useFolders } from '@/hooks';
import { SessionListItem } from './SessionListItem';
import type { Folder, SessionWithFolder } from '@/types';

interface Props {
  folder: Folder;
  sessions: SessionWithFolder[];
  activeSessionId?: string;
}

export function FolderItem({ folder, sessions, activeSessionId }: Props) {
  const { updateFolder, deleteFolder } = useFolders();
  const { expandedFolders, toggleFolder } = useSidebarStore();
  const [isRenaming, setIsRenaming] = useState(false);
  const [name, setName] = useState(folder.name);

  const isExpanded = expandedFolders[folder.id] ?? false;

  const handleRename = async () => {
    if (name.trim() && name !== folder.name) {
      await updateFolder(folder.id, name);
    }
    setIsRenaming(false);
  };

  const handleDelete = async () => {
    if (confirm(`Delete folder "${folder.name}"?`)) {
      await deleteFolder(folder.id);
    }
  };

  return (
    <div>
      {/* Folder Header */}
      <div
        className="group flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
        onClick={() => toggleFolder(folder.id)}
      >
        {isExpanded ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
        <Folder className="w-4 h-4" />

        {isRenaming ? (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') setIsRenaming(false);
            }}
            className="flex-1 bg-transparent outline-none"
            autoFocus
          />
        ) : (
          <span className="flex-1 truncate">{folder.name}</span>
        )}

        <span className="text-xs text-neutral-500">{sessions.length}</span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsRenaming(true)}>
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600 dark:text-red-400"
              onClick={handleDelete}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Sessions in folder */}
      {isExpanded && (
        <div className="ml-6">
          {sessions.map((session) => (
            <SessionListItem
              key={session.id}
              session={session}
              isActive={session.id === activeSessionId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

**Features**:
- Expand/collapse
- Inline rename
- Delete with confirmation
- Context menu
- Session count badge

---

#### 4. **SessionListItem.tsx**

```typescript
'use client';

import { MessageSquare, MoreVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSessions, useFolders } from '@/hooks';
import { cn } from '@/lib/utils';
import type { SessionWithFolder } from '@/types';

interface Props {
  session: SessionWithFolder;
  isActive?: boolean;
  isCollapsed?: boolean;
}

export function SessionListItem({ session, isActive, isCollapsed }: Props) {
  const router = useRouter();
  const { deleteSession, moveSessionToFolder } = useSessions();
  const { folders } = useFolders();

  const handleClick = () => {
    router.push(`/chat/${session.id}`);
  };

  const handleDelete = async () => {
    if (confirm(`Delete "${session.title}"?`)) {
      await deleteSession(session.id);
    }
  };

  const handleMove = async (folderId: string | null) => {
    await moveSessionToFolder(session.id, folderId);
  };

  if (isCollapsed) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        className={cn(isActive && 'bg-neutral-200 dark:bg-neutral-800')}
      >
        <MessageSquare className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <div
      className={cn(
        'group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer',
        'hover:bg-neutral-100 dark:hover:bg-neutral-800',
        isActive && 'bg-neutral-200 dark:bg-neutral-800'
      )}
      onClick={handleClick}
    >
      <MessageSquare className="w-4 h-4 flex-shrink-0" />
      <span className="flex-1 truncate text-sm">{session.title}</span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Move to folder</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => handleMove(null)}>
                No folder
              </DropdownMenuItem>
              {folders.map((folder) => (
                <DropdownMenuItem
                  key={folder.id}
                  onClick={() => handleMove(folder.id)}
                >
                  {folder.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuItem
            className="text-red-600 dark:text-red-400"
            onClick={handleDelete}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
```

**Features**:
- Click to navigate
- Move to folder (submenu)
- Delete with confirmation
- Active state highlighting
- Mini mode support

---

## 🎨 Theming

### Theme Provider

```typescript
// components/providers/ThemeProvider.tsx
'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

### Usage in Root Layout

```typescript
// app/layout.tsx
import { ThemeProvider } from '@/components/providers/ThemeProvider';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Theme Toggle

```typescript
'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </Button>
  );
}
```

### Color Scheme

#### Light Mode (Default)
```css
bg-white
text-neutral-900
border-neutral-200
hover:bg-neutral-100
```

#### Dark Mode
```css
dark:bg-neutral-900
dark:text-white
dark:border-neutral-800
dark:hover:bg-neutral-800
```

---

## 🧩 shadcn/ui Components

### Installation

```bash
npx shadcn@latest add button
npx shadcn@latest add dropdown-menu
npx shadcn@latest add input
npx shadcn@latest add scroll-area
```

### Button Variants

```tsx
<Button variant="default">Default</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive</Button>

<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon</Button>
```

### Dropdown Menu

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon">
      <MoreVertical />
    </Button>
  </DropdownMenuTrigger>
  
  <DropdownMenuContent align="end">
    <DropdownMenuItem>Action 1</DropdownMenuItem>
    <DropdownMenuItem>Action 2</DropdownMenuItem>
    
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>Submenu</DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuItem>Sub action</DropdownMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  </DropdownMenuContent>
</DropdownMenu>
```

---

## ✅ Best Practices

### 1. **Use `cn()` for Dynamic Classes**
```typescript
import { cn } from '@/lib/utils';

<div className={cn(
  'base-classes',
  isActive && 'active-classes',
  'conditional-classes'
)} />
```

### 2. **Stop Propagation for Nested Interactions**
```typescript
<Button onClick={(e) => {
  e.stopPropagation();
  handleAction();
}}>
  Action
</Button>
```

### 3. **Use `asChild` for Custom Triggers**
```typescript
<DropdownMenuTrigger asChild>
  <Button>Custom trigger</Button>
</DropdownMenuTrigger>
```

### 4. **Prevent Hydration Mismatch**
```typescript
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

if (!mounted) return <Skeleton />;
```

---

## 📚 Component Library

### Available Components

- ✅ Button
- ✅ Dropdown Menu
- ✅ Input
- ✅ Scroll Area
- ✅ Tooltip (can be added)
- ✅ Dialog (can be added)
- ✅ Select (can be added)

---

## 🔮 Future Enhancements

- [ ] Drag & drop sessions into folders
- [ ] Search/filter functionality
- [ ] Keyboard shortcuts
- [ ] Custom folder colors
- [ ] Session preview on hover
- [ ] Undo/redo actions

---

**Last updated**: October 22, 2025
