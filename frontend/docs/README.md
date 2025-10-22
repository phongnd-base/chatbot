# 📚 Frontend Documentation

> **AI Chat Project Builder** - Next.js 15 + TypeScript + Clean Architecture

## 🎯 Quick Links

| Document | Purpose |
|----------|---------|
| **[Architecture](./ARCHITECTURE.md)** | System architecture & design patterns |
| **[Data Flow](./DATA_FLOW.md)** | State management strategy (Store vs Hooks) |
| **[API Layer](./API_LAYER.md)** | API services & HTTP client |
| **[UI Components](./UI_COMPONENTS.md)** | Component library & sidebar system |

---

## 🚀 Quick Start

### For New Developers
1. Read [ARCHITECTURE.md](./ARCHITECTURE.md) - Understand the structure
2. Read [DATA_FLOW.md](./DATA_FLOW.md) - Learn state management
3. Check code examples in source files

### For Feature Development
1. Review [ARCHITECTURE.md](./ARCHITECTURE.md) - Know where to add code
2. Check [API_LAYER.md](./API_LAYER.md) - Add API services
3. Follow existing patterns in `hooks/` and `components/`

---

## 📁 Project Structure

```
frontend/
├── app/              # Next.js pages & layouts
├── components/       # UI components
├── hooks/            # Business logic (data management)
├── lib/api/          # API services (HTTP calls)
├── store/            # UI state only (Zustand)
├── types/            # TypeScript types
└── docs/             # 📚 You are here
```

---

## 🏗️ Architecture Layers

```
┌─────────────────┐
│   Components    │  ← Pure UI (no API calls)
└────────┬────────┘
         │
┌────────▼────────┐
│     Hooks       │  ← Data management + business logic
└────────┬────────┘
         │
┌────────▼────────┐
│    Services     │  ← API calls (HTTP)
└────────┬────────┘
         │
         ▼
     Backend API
```

---

## ✅ Key Principles

### 1. **Separation of Concerns**
- **Store** = UI state only (collapsed, expanded, active)
- **Hooks** = Data state + API sync (folders, sessions, messages)
- **Services** = Pure API calls
- **Components** = Pure presentation

### 2. **No API Calls in Components**
```typescript
// ❌ Bad
function Component() {
  useEffect(() => {
    fetch('/api/data').then(/* ... */);
  }, []);
}

// ✅ Good
function Component() {
  const { data } = useData(); // Hook handles API
}
```

### 3. **Type Safety Everywhere**
- Full TypeScript coverage
- No `any` types
- API types separate from domain types

---

## 📖 Documentation Guide

### [ARCHITECTURE.md](./ARCHITECTURE.md)
Complete system architecture guide:
- Layer responsibilities
- Design patterns
- Best practices
- Code examples

### [DATA_FLOW.md](./DATA_FLOW.md)
State management strategy:
- Store vs Hooks separation
- Data flow diagrams
- Migration from old pattern
- Usage examples

### [API_LAYER.md](./API_LAYER.md)
API integration guide:
- Services structure
- HTTP client usage
- Error handling
- Type definitions

### [UI_COMPONENTS.md](./UI_COMPONENTS.md)
Component library:
- Sidebar system
- Theme support
- Radix UI components
- Styling patterns

---

## 🔧 Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5.6 |
| State | Zustand 4.5 |
| UI | TailwindCSS + shadcn/ui |
| HTTP | Fetch API + custom client |
| Streaming | Server-Sent Events (SSE) |

---

## 🎯 Benefits of This Architecture

### ✅ Maintainability
- Clear layer separation
- Easy to locate code
- Change API → edit 1 file

### ✅ Testability
- Hooks test in isolation
- Services can be mocked
- Components are pure

### ✅ Scalability
- Add features easily
- Reusable patterns
- No code duplication

### ✅ Type Safety
- Compile-time error catching
- Autocomplete everywhere
- Self-documenting code

---

## 🚀 Development Workflow

### Adding a New Feature

1. **Define types** in `types/` or `lib/api/types.ts`
2. **Create service** in `lib/api/services/`
3. **Create hook** in `hooks/` (uses service)
4. **Create component** in `components/` (uses hook)
5. **Add page** in `app/` (uses component)

### Example: Add "Favorites" Feature

```typescript
// 1. lib/api/services/favorite.service.ts
export const favoriteService = {
  getFavorites: () => apiClient.get<Session[]>('favorites'),
  addFavorite: (id: string) => apiClient.post(`favorites/${id}`),
};

// 2. hooks/useFavorites.ts
export function useFavorites() {
  const [favorites, setFavorites] = useState<Session[]>([]);
  
  const addFavorite = async (id: string) => {
    await favoriteService.addFavorite(id);
    await refetch();
  };
  
  return { favorites, addFavorite };
}

// 3. components/favorites/FavoritesList.tsx
export function FavoritesList() {
  const { favorites, addFavorite } = useFavorites();
  return <div>{/* Render favorites */}</div>;
}
```

---

## 📦 Scripts

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start

# Lint
npm run lint
```

---

## 🔗 External Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zustand Guide](https://docs.pmnd.rs/zustand/)
- [shadcn/ui Components](https://ui.shadcn.com/)

---

**Last updated**: October 22, 2025  
**Status**: ✅ Production Ready
