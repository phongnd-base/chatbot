# 🤖 AI Chat Project - Frontend

> Next.js 15 + TypeScript + Clean Architecture

## 📚 Documentation

All documentation has been organized in the `docs/` folder:

👉 **[Start here: docs/README.md](./docs/README.md)**

### Quick Links

| Document | Description |
|----------|-------------|
| [Architecture](./docs/ARCHITECTURE.md) | System architecture & design patterns |
| [Data Flow](./docs/DATA_FLOW.md) | State management strategy |
| [API Layer](./docs/API_LAYER.md) | API services & HTTP client |
| [UI Components](./docs/UI_COMPONENTS.md) | Component library & sidebar |

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Application will run at `http://localhost:3000`

---

## 🏗️ Project Structure

```
frontend/
├── app/              # Next.js App Router (pages & layouts)
├── components/       # React components (UI)
├── hooks/            # Custom hooks (business logic)
├── lib/api/          # API services (HTTP calls)
├── store/            # Zustand stores (UI state only)
├── types/            # TypeScript types
└── docs/             # 📚 Documentation
```

---

## 🎯 Key Features

- ✅ **Clean Architecture** - Clear layer separation
- ✅ **Type Safety** - Full TypeScript coverage
- ✅ **State Management** - Zustand (UI) + Hooks (Data)
- ✅ **API Layer** - Centralized services
- ✅ **UI Components** - shadcn/ui + Radix UI
- ✅ **Theme Support** - Light/Dark mode
- ✅ **Streaming** - Real-time AI responses via SSE

---

## 🔧 Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5.6 |
| Styling | TailwindCSS + shadcn/ui |
| State | Zustand 4.5 |
| UI Components | Radix UI + Lucide Icons |
| HTTP | Fetch API |
| Theme | next-themes |

---

## 📖 Architecture Principles

### 1. **Separation of Concerns**
- **Components** → Pure UI (no API calls)
- **Hooks** → Business logic + data management
- **Services** → API calls only
- **Store** → UI state only (collapsed, expanded, active)

### 2. **Type Safety**
- Full TypeScript coverage
- API types separate from domain types
- No `any` types allowed

### 3. **Data Flow**
```
Component → Hook → Service → API → Backend
    ↓         ↓        ↓
   UI  ←  State  ←  Response
```

---

## 🧪 Code Quality

```typescript
// ✅ Good: Use hooks for data
function ChatPage() {
  const { session } = useSession(id);
  const { messages } = useMessages(id);
  return <ChatUI messages={messages} />;
}

// ❌ Bad: API calls in components
function ChatPage() {
  useEffect(() => {
    fetch('/api/messages').then(/* ... */);
  }, []);
}
```

---

## 📦 Scripts

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # TypeScript check
```

---

## 🌐 Environment Variables

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## 🤝 Contributing

1. Read [ARCHITECTURE.md](./docs/ARCHITECTURE.md) for patterns
2. Follow existing code structure
3. Keep components pure (no API calls)
4. Use hooks for business logic
5. Add types for everything

---

## 📝 License

MIT

---

## 🔗 Resources

- [Documentation](./docs/README.md)
- [Next.js Docs](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [shadcn/ui](https://ui.shadcn.com/)

---

**Status**: ✅ Production Ready  
**Last Updated**: October 22, 2025
