# 🎨 Sidebar với Theme Support - Documentation

## 📋 Tổng quan các cải tiến

### ✅ Hoàn thành
1. **Sidebar chỉ hiển thị trong trang chat** - Sử dụng layout riêng cho `/chat`
2. **Theme sáng/tối** - Hỗ trợ đầy đủ light/dark mode
3. **Màu sidebar trắng** - Background trắng khi light mode
4. **Shadcn/ui components** - Sử dụng Button và các utilities từ shadcn

---

## 🗂️ Cấu trúc mới

```
app/
├── layout.tsx              # Root layout (không có sidebar)
├── chat/
│   ├── layout.tsx          # Chat layout (có sidebar)
│   ├── [sessionId]/page.tsx
│   └── new/page.tsx
├── login/page.tsx          # Không có sidebar
└── settings/page.tsx       

components/
├── providers/
│   └── ThemeProvider.tsx   # Theme context provider
├── ui/
│   └── button.tsx          # Shadcn Button component
├── ThemeToggle.tsx         # Toggle dark/light mode
└── sidebar/
    ├── Sidebar.tsx         # Hỗ trợ theme
    ├── SidebarHeader.tsx   # Hỗ trợ theme + Button component
    ├── SidebarContent.tsx  # Hỗ trợ theme
    ├── SidebarFooter.tsx   # Có ThemeToggle
    ├── FolderItem.tsx      # Hỗ trợ theme
    └── SessionListItem.tsx # Hỗ trợ theme

lib/
└── utils.ts                # cn() utility từ shadcn
```

---

## 🎨 Theme System

### 1️⃣ **ThemeProvider Setup**

```tsx
// app/layout.tsx
import { ThemeProvider } from '@/components/providers/ThemeProvider';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white dark:bg-neutral-950">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### 2️⃣ **Theme Toggle Component**

```tsx
// components/ThemeToggle.tsx
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? <Sun /> : <Moon />}
    </Button>
  );
}
```

---

## 📐 Layout Architecture

### Root Layout (app/layout.tsx)
- **Không có sidebar**
- Chỉ wrap ThemeProvider
- Apply cho tất cả routes

### Chat Layout (app/chat/layout.tsx)
- **Có sidebar**
- Chỉ apply cho `/chat/*` routes
- Layout riêng biệt từ root

### Login/Register Pages
- Sử dụng root layout
- **Không có sidebar**
- Full screen UI

---

## 🎨 Color Scheme

### Light Mode (Default)
```css
Sidebar Background: bg-white
Border: border-neutral-200
Text Primary: text-neutral-900
Text Secondary: text-neutral-600
Hover: hover:bg-neutral-100
Active: bg-neutral-200
```

### Dark Mode
```css
Sidebar Background: dark:bg-neutral-900
Border: dark:border-neutral-800
Text Primary: dark:text-white
Text Secondary: dark:text-neutral-400
Hover: dark:hover:bg-neutral-800
Active: dark:bg-neutral-800
```

---

## 🧩 Shadcn/ui Components

### Button Component
```tsx
import { Button } from "@/components/ui/button";

// Variants
<Button variant="default">Default</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>

// Sizes
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon</Button>
```

### cn() Utility
```tsx
import { cn } from "@/lib/utils";

// Merge Tailwind classes
className={cn(
  "base-classes",
  isActive && "active-classes",
  "conditional-classes"
)}
```

---

## 🚀 Cách sử dụng

### 1. Toggle Theme
Click icon **Sun/Moon** ở footer sidebar

### 2. Sidebar chỉ hiện ở Chat
- `/login` → Không có sidebar
- `/register` → Không có sidebar  
- `/chat/:id` → **Có sidebar**
- `/chat/new` → **Có sidebar**

### 3. Responsive Dark/Light
- Theme tự động sync với system preference (nếu bật `enableSystem`)
- State được persist vào localStorage
- Smooth transition giữa themes

---

## 🔧 Customization

### Thay đổi màu chủ đạo

```tsx
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      primary: {...},
      // Custom colors
    }
  }
}
```

### Thêm shadcn components mới

```bash
npx shadcn@latest add [component-name]
```

Ví dụ:
```bash
npx shadcn@latest add dropdown-menu
npx shadcn@latest add dialog
npx shadcn@latest add tooltip
```

---

## 📦 Dependencies

```json
{
  "next-themes": "^0.x.x",      // Theme management
  "lucide-react": "^0.x.x",     // Icons
  "class-variance-authority": "^0.x.x", // CVA for variants
  "clsx": "^2.x.x",             // Class merging
  "tailwind-merge": "^2.x.x"    // Tailwind class merger
}
```

---

## 💡 Best Practices

### 1. Always use `cn()` for dynamic classes
```tsx
// ✅ Good
<div className={cn("base", isActive && "active")} />

// ❌ Avoid
<div className={`base ${isActive ? "active" : ""}`} />
```

### 2. Use semantic colors
```tsx
// ✅ Good
text-neutral-900 dark:text-white

// ❌ Avoid hardcoded colors
text-[#000] dark:text-[#fff]
```

### 3. Prevent hydration mismatch
```tsx
// Add suppressHydrationWarning to <html>
<html lang="en" suppressHydrationWarning>
```

### 4. Check mounted state for theme-dependent UI
```tsx
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

if (!mounted) return <Skeleton />;
```

---

## 🎯 Testing Checklist

- [x] Sidebar hiển thị trong `/chat/*`
- [x] Sidebar KHÔNG hiển thị ở `/login`, `/register`
- [x] Theme toggle hoạt động
- [x] Dark mode apply đúng colors
- [x] Light mode là default
- [x] Theme persist sau reload
- [x] Buttons sử dụng shadcn component
- [x] Transitions mượt mà
- [x] Responsive trên mobile

---

## 🔮 Future Enhancements

- [ ] Theme selector (light/dark/auto)
- [ ] Custom accent colors
- [ ] High contrast mode
- [ ] Theme per workspace/folder
- [ ] Animated theme transitions
- [ ] Theme keyboard shortcut (Ctrl+Shift+L)

---

✅ **Sidebar system production-ready với full theme support!**

🎨 **Màu sáng mặc định, dễ chuyển đổi, components từ shadcn/ui**
