# 📘 Frontend Documentation Index

Welcome to the frontend documentation! This guide will help you navigate the codebase.

---

## 📚 Documentation Files

### 1️⃣ [ARCHITECTURE.md](./ARCHITECTURE.md)
**Clean Architecture Guide**
- 📁 Folder structure explanation
- 🏗️ Layer responsibilities (API, Hooks, Components)
- ✅ Best practices
- 🔄 Data flow diagrams
- 📖 Code examples

**Read this if you want to**:
- Understand the overall architecture
- Learn about design patterns used
- Know where to put new code

---

### 2️⃣ [REFACTOR_SUMMARY.md](./REFACTOR_SUMMARY.md)
**Refactor Impact Report**
- 📂 New file structure
- ♻️ Before/After comparisons
- 📊 Impact metrics
- 🎯 Benefits achieved
- 🚀 Next steps

**Read this if you want to**:
- See what changed during refactor
- Understand the improvements
- Know the technical debt resolved

---

### 3️⃣ [CHECKLIST.md](./CHECKLIST.md)
**Verification Checklist**
- ✅ All refactor tasks completed
- 📋 Files created/deleted
- 🎯 Quality metrics
- 🔍 Verification steps

**Read this if you want to**:
- Verify refactor completion
- Review implementation details
- Check quality standards

---

### 4️⃣ [SIDEBAR_README.md](./SIDEBAR_README.md)
**Sidebar Feature Documentation**
- Folder management
- Session organization
- Favorites system

---

### 5️⃣ [SIDEBAR_THEME_GUIDE.md](./SIDEBAR_THEME_GUIDE.md)
**Sidebar Theming**
- Dark/Light mode implementation
- Color schemes
- Theme switching

---

### 6️⃣ [DROPDOWN_ANIMATION.md](./DROPDOWN_ANIMATION.md)
**Dropdown Menu Animation**
- Animation implementation
- Radix UI integration

---

## 🗺️ Quick Navigation

### For New Developers
1. Start with [ARCHITECTURE.md](./ARCHITECTURE.md) to understand the structure
2. Read [REFACTOR_SUMMARY.md](./REFACTOR_SUMMARY.md) to see the improvements
3. Check component examples in source code

### For Code Reviewers
1. Review [CHECKLIST.md](./CHECKLIST.md) for completion status
2. Check [REFACTOR_SUMMARY.md](./REFACTOR_SUMMARY.md) for impact metrics
3. Verify code follows [ARCHITECTURE.md](./ARCHITECTURE.md) patterns

### For Feature Development
1. Review [ARCHITECTURE.md](./ARCHITECTURE.md) for where to add code
2. Follow patterns in existing hooks/services
3. Update documentation after changes

---

## 📁 Key Directories

```
frontend/
├── lib/api/          # API services (data access layer)
├── hooks/            # Custom hooks (business logic)
├── components/       # React components (presentation)
├── app/              # Next.js pages (routing)
├── store/            # Global state (Zustand)
└── types/            # TypeScript types
```

---

## 🎯 Quick Start

### Adding a new API endpoint
1. Add service method in `lib/api/services/`
2. Define types in `lib/api/types.ts`
3. Export from `lib/api/index.ts`

### Creating a new hook
1. Create file in `hooks/`
2. Implement business logic
3. Export from `hooks/index.ts`

### Building a new component
1. Create component in `components/`
2. Use hooks for data
3. Keep component pure (no API calls)

---

## 📖 Additional Resources

- [Next.js Docs](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zustand Guide](https://docs.pmnd.rs/zustand/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## 🤝 Contributing

1. Follow [ARCHITECTURE.md](./ARCHITECTURE.md) patterns
2. Keep API calls in services
3. Use custom hooks for logic
4. Keep components pure
5. Update documentation

---

**Last updated**: October 22, 2025
