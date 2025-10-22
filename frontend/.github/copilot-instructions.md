Rất hay 💪 — dưới đây là **Instruction #3 – FRONTEND (Next.js 15 + TypeScript + shadcn/ui + Streamdown)**
Đây là hướng dẫn chi tiết và đầy đủ, giúp Copilot hoặc dev có thể build frontend **production-level**, hỗ trợ **chat streaming** qua **Server-Sent Events (SSE)** và render Markdown động bằng **Streamdown**.

---

## 🧠 FRONTEND INSTRUCTION — AI Chat Project Builder

### 🎯 1️⃣. Mục tiêu

Frontend là ứng dụng **Next.js 15 (App Router)** với TypeScript, cho phép người dùng:

* Chat với AI theo từng **session**.
* Gom nhiều session vào **group**, có thể đánh dấu **favorite**.
* Hiển thị **sidebar group + session list**, **chat area**, và **AI model selector**.
* Hỗ trợ **streaming message** từ backend qua **SSE**, render mượt bằng **Streamdown**.
* Code clean, module hóa, dễ mở rộng, theo chuẩn **Next.js + shadcn/ui + Zustand**.

---

### ⚙️ 2️⃣. Tech Stack

| Thành phần           | Công nghệ                                |
| -------------------- | ---------------------------------------- |
| **Framework**        | Next.js 15 (App Router)                  |
| **Language**         | TypeScript                               |
| **UI Library**       | TailwindCSS + shadcn/ui                  |
| **State Management** | Zustand                                  |
| **Data Fetching**    | React Query                              |
| **Streaming Render** | Streamdown                               |
| **Markdown Parser**  | remark / rehype (đi kèm Streamdown)      |
| **API**              | Gọi đến NestJS backend qua REST + SSE    |
| **Build Tool**       | Turbopack hoặc Webpack (default Next.js) |

---

### 🗂️ 3️⃣. Cấu trúc thư mục Frontend

```
frontend/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                  # Trang chính (redirect → /chat)
│   ├── chat/
│   │   ├── [sessionId]/page.tsx  # Giao diện chat chính
│   │   └── new/page.tsx          # Tạo session mới
│   ├── groups/page.tsx           # Danh sách group
│   ├── settings/page.tsx         # Cài đặt người dùng
│   ├── api/                      # Route handler (nếu dùng Next API)
│   └── error.tsx / loading.tsx
│
├── components/
│   ├── chat/
│   │   ├── ChatInput.tsx
│   │   ├── ChatMessage.tsx
│   │   └── ChatStream.tsx
│   ├── sidebar/
│   │   ├── Sidebar.tsx
│   │   ├── GroupList.tsx
│   │   └── SessionList.tsx
│   ├── ui/ (button, card, textarea, ... từ shadcn)
│   └── layout/
│       ├── AppShell.tsx
│       └── Header.tsx
│
├── hooks/
│   ├── useChatStream.ts          # SSE streaming
│   ├── useSessionManager.ts
│   └── useGroupManager.ts
│
├── store/
│   ├── chatStore.ts              # Quản lý session + messages
│   ├── groupStore.ts
│   └── uiStore.ts
│
├── services/
│   ├── apiClient.ts              # axios instance
│   ├── sessionService.ts
│   ├── messageService.ts
│   └── groupService.ts
│
├── utils/
│   ├── markdown.ts
│   └── formatDate.ts
│
├── public/
│   └── icons/
│
├── tailwind.config.ts
└── next.config.ts
```

---

### 🧩 4️⃣. Luồng hoạt động (Data Flow)

#### 4.1. Khi user chat

1. Người dùng nhập prompt → `ChatInput` gọi `messageService.sendMessage()`.
2. Service gửi `POST /messages` → backend tạo SSE connection `/messages/stream/:sessionId`.
3. `useChatStream` nhận dữ liệu streaming qua `EventSource`.
4. Component `ChatStream` render dần phản hồi AI bằng **Streamdown**.
5. Khi hoàn tất, FE cập nhật `chatStore` để lưu message vào state.

#### 4.2. Khi user chọn session khác

* Gọi `GET /messages/:sessionId` → load toàn bộ hội thoại trước đó.
* `ChatMessage` hiển thị Markdown nội dung (với code block highlight).

#### 4.3. Khi user tạo group hoặc favorite session

* Gọi API `/groups` hoặc `/sessions/:id/favorite`.
* Cập nhật lại `groupStore` và sidebar tự động render lại.

---

### 🧱 5️⃣. Store và Hooks

#### 🪣 Zustand store ví dụ: `chatStore.ts`

```ts
import { create } from "zustand";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatState {
  currentSessionId: string | null;
  messages: Message[];
  setMessages: (msgs: Message[]) => void;
  appendMessage: (msg: Message) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  currentSessionId: null,
  messages: [],
  setMessages: (messages) => set({ messages }),
  appendMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
}));
```

#### ⚡ Hook: `useChatStream.ts`

```ts
import { useChatStore } from "@/store/chatStore";
import { useEffect } from "react";
import { Streamdown } from "streamdown/react";

export const useChatStream = (sessionId: string) => {
  const appendMessage = useChatStore((s) => s.appendMessage);

  useEffect(() => {
    const source = new EventSource(`/api/messages/stream/${sessionId}`);

    let buffer = "";
    source.onmessage = (event) => {
      if (event.data === "[DONE]") {
        appendMessage({ id: crypto.randomUUID(), role: "assistant", content: buffer });
        source.close();
      } else {
        buffer += event.data;
      }
    };

    source.onerror = () => source.close();
    return () => source.close();
  }, [sessionId]);
};
```

---

### 💬 6️⃣. Giao diện chat — `ChatStream.tsx`

```tsx
"use client";
import { Streamdown } from "streamdown/react";
import { useChatStore } from "@/store/chatStore";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ChatStream() {
  const messages = useChatStore((s) => s.messages);

  return (
    <ScrollArea className="h-full px-4">
      {messages.map((m) => (
        <div
          key={m.id}
          className={`my-2 ${m.role === "user" ? "text-blue-500" : "text-gray-100"}`}
        >
          <Streamdown>{m.content}</Streamdown>
        </div>
      ))}
    </ScrollArea>
  );
}
```

---

### 🧮 7️⃣. Sidebar Layout

**Sidebar.tsx**

```tsx
"use client";
import GroupList from "./GroupList";
import SessionList from "./SessionList";

export default function Sidebar() {
  return (
    <aside className="w-64 h-full border-r border-neutral-800 p-2">
      <GroupList />
      <SessionList />
    </aside>
  );
}
```

**GroupList.tsx**

```tsx
"use client";
import { useGroupStore } from "@/store/groupStore";

export default function GroupList() {
  const groups = useGroupStore((s) => s.groups);
  return (
    <div className="mb-4">
      <h3 className="text-xs uppercase text-neutral-400 mb-2">Groups</h3>
      {groups.map((g) => (
        <div key={g.id} className="text-sm hover:text-white cursor-pointer">
          {g.name}
        </div>
      ))}
    </div>
  );
}
```

---

### 💡 8️⃣. Page Layout

**layout.tsx**

```tsx
import "@/styles/globals.css";
import Sidebar from "@/components/sidebar/Sidebar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-neutral-950 text-neutral-100 flex">
        <Sidebar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
```

---

### 🔁 9️⃣. API Integration Layer

**apiClient.ts**

```ts
import axios from "axios";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  withCredentials: true,
});
```

**messageService.ts**

```ts
import { apiClient } from "./apiClient";

export const messageService = {
  sendMessage: async (sessionId: string, content: string) => {
    await apiClient.post(`/messages`, { sessionId, content });
  },
  getMessages: async (sessionId: string) => {
    const { data } = await apiClient.get(`/messages/${sessionId}`);
    return data;
  },
};
```

---

### 🎨 10️⃣. Giao diện người dùng (UI/UX)

* **Dark mode mặc định** (Tailwind + class `bg-neutral-950`).
* **Responsive**: Sidebar collapse ở màn hình nhỏ.
* **Loading state**: shadcn/ui Skeleton cho danh sách group/session.
* **Markdown hỗ trợ:**

  * Code block (prism.js)
  * Bold, italic, heading
  * Inline code (`backtick`)
* **Streamdown** tự động cập nhật khi dữ liệu mới từ SSE đến.

---

### 🚀 11️⃣. Dev & Run

```bash
npm install
npm run dev
```

.env:

```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Ứng dụng chạy tại:
👉 `http://localhost:3001` (frontend)
👉 `http://localhost:3000` (backend NestJS)

---

### ✅ 12️⃣. Kết quả mong đợi

* Người dùng có thể:

  * Đăng nhập và xem danh sách group + session.
  * Tạo session mới, chat với AI (streaming response realtime).
  * Đánh dấu session yêu thích.
* UI hiện đại, tương tác mượt, cấu trúc code sạch.
* Có thể mở rộng dễ dàng (AI model selector, plugin system, v.v.).

---