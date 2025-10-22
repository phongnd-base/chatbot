Dưới đây là **instruction tổng quan hoàn chỉnh** (file **Overview Instruction**) — phiên bản đầy đủ, clean,
Bạn có thể dùng file này cho **Copilot / AI code generator** để nó hiểu toàn bộ mục tiêu dự án trước khi viết Backend & Frontend.

---

## 🧭 OVERVIEW INSTRUCTION — AI Chat Project Builder

### 🎯 1️⃣. Mục đích dự án

Ứng dụng này là một nền tảng **AI Chat App**, cho phép người dùng:

* Chat với AI tương tự ChatGPT (nhiều mô hình AI khác nhau: GPT, Claude, Gemini, v.v.).
* Quản lý các **session** (phiên trò chuyện).
* Gom nhiều session vào **group** (nhóm logic, ví dụ: “Dự án A”, “Research”).
* **Đánh dấu (pin)** các session quan trọng.
* Lưu trữ và đồng bộ dữ liệu giữa frontend và backend.
* Trong tương lai, có thể sinh ra webapp / sản phẩm trực tiếp từ prompt (như v0.ai).

---

### 🧱 2️⃣. Cấu trúc tổng thể hệ thống

#### Kiến trúc 3 lớp

1. **Frontend (Next.js + Tailwind + shadcn/ui)**

   * Giao diện chat hiện đại, hỗ trợ streaming message, dark mode, responsive.
   * Quản lý session, group, user settings, và đánh dấu favorite.

2. **Backend (NestJS + Prisma + PostgreSQL)**

   * Cung cấp API cho Auth, Session, Message, Group, và AI Provider.
   * Sử dụng WebSocket hoặc SSE cho streaming message.
   * Tích hợp API với các mô hình AI (OpenAI, Anthropic, v.v.).

3. **Infrastructure (Dockerized microservice)**

   * Docker Compose cho local dev.
   * Có thể mở rộng: Nginx reverse proxy, Redis cache, S3 storage.
   * CI/CD dùng GitHub Actions → build, test, deploy.

---

### ⚙️ 3️⃣. Tech Stack

| Thành phần       | Công nghệ chính                                                                           |
| ---------------- | ----------------------------------------------------------------------------------------- |
| **Frontend**     | Next.js 15, TypeScript, TailwindCSS, shadcn/ui, Zustand (hoặc Redux Toolkit), React Query |
| **Backend**      | NestJS, Prisma ORM, PostgreSQL, JWT Auth, OpenAI SDK                                      |
| **Infra**        | Docker, Docker Compose, Nginx, GitHub Actions                                             |
| **AI Providers** | OpenAI, Anthropic (qua API key config)                                                    |
| **Realtime**     | WebSocket hoặc Server-Sent Events (SSE)                                                   |

---

### 🧩 4️⃣. Thành phần chức năng (Modules)

| Thành phần               | Mô tả chi tiết                                                                   |
| ------------------------ | -------------------------------------------------------------------------------- |
| **Auth**                 | Đăng ký, đăng nhập, refresh token, OAuth Google                                  |
| **User**                 | Hồ sơ người dùng, cài đặt cá nhân                                                |
| **Session**              | Một phiên trò chuyện giữa người dùng và AI (1-n message), có thể đánh dấu session “quan trọng”                         |
| **Message**              | Tin nhắn người dùng & phản hồi AI (streaming)                                    |
| **Group**                | Gom các session lại thành nhóm   |
| **AI Engine**            | Quản lý provider AI, chọn model, stream kết quả                                  |
| **Analytics (future)**   | Ghi lại usage, token, thời gian phản hồi                                         |
| **Admin Panel (future)** | Quản lý user, session, logs                                                      |

---

### 🔁 5️⃣. Workflow hoạt động

#### 5.1. User Chat Flow

1. User nhập prompt → FE gọi `POST /messages`.
2. BE ghi message, gửi đến AI Provider.
3. AI phản hồi từng phần (streaming).
4. FE hiển thị dần, lưu message vào DB.

#### 5.2. Session Management

* Tạo session mới (`POST /sessions`).
* Đổi tên, xóa session (`PATCH /sessions/:id`, `DELETE /sessions/:id`).
* Đánh dấu session “favorite” (`PATCH /sessions/:id/favorite`).
* Mỗi session có metadata:

  * `title`, `model`, `groupId`, `isFavorite`, `updatedAt`.

#### 5.3. Group Management

* Người dùng có thể:

  * Tạo group (`POST /groups`)
  * Đổi tên group (`PATCH /groups/:id`)
  * Xem danh sách session trong group (`GET /groups/:id/sessions`)
  * Gán session vào group (`PATCH /sessions/:id/group`)
* Khi xóa group, session được chuyển về “Ungrouped”.

#### 5.4. UI Behavior

* Sidebar:

  * Hiển thị danh sách group (có số session).
  * Dưới mỗi group → danh sách session.
  * Icon ⭐ cho session quan trọng.
* Main view:

  * `/chat/:sessionId` hiển thị hội thoại.
  * Có thanh model selector, button “New Chat”.

---

### 🧮 6️⃣. Mô hình dữ liệu (Prisma schema – simplified)

```prisma
model User {
  id          String    @id @default(uuid())
  email       String    @unique
  password    String
  sessions    Session[]
  groups      Group[]
  createdAt   DateTime  @default(now())
}

model Group {
  id          String    @id @default(uuid())
  name        String
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  sessions    Session[]
  createdAt   DateTime  @default(now())
}

model Session {
  id          String    @id @default(uuid())
  title       String
  groupId     String?
  group       Group?    @relation(fields: [groupId], references: [id])
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  isFavorite  Boolean   @default(false)
  messages    Message[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Message {
  id          String    @id @default(uuid())
  sessionId   String
  session     Session   @relation(fields: [sessionId], references: [id])
  role        String
  content     String
  createdAt   DateTime  @default(now())
}
```

---

### 🧠 7️⃣. Định hướng mở rộng

* Cho phép **xuất session** thành Markdown / JSON.
* Hỗ trợ **multi-model conversation** (GPT + Claude song song).
* Hệ thống **plugin AI actions** (VD: generate file, translate, code preview).
* Triển khai **cloud workspace** (multi-device sync).

---

### 🗂️ 8️⃣. Cấu trúc thư mục đề xuất

```
root/
├── frontend/
│   ├── app/
│   │   ├── chat/[sessionId]/page.tsx
│   │   ├── groups/
│   │   └── settings/
│   ├── components/
│   ├── hooks/
│   ├── store/
│   ├── services/ (gọi API)
│   └── utils/
│
├── backend/
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── user/
│   │   │   ├── session/
│   │   │   ├── message/
│   │   │   ├── group/
│   │   │   └── ai/
│   │   ├── prisma/
│   │   └── common/
│   ├── .env
│   └── prisma/schema.prisma
│
├── docker-compose.yml
├── README.md
└── .github/workflows/
```

---

### ✅ 9️⃣. Kết quả mong đợi

* Ứng dụng có thể chạy local bằng `docker compose up`.
* User có thể đăng nhập, tạo session, group, chat với AI.
* Code sạch, tách module rõ ràng, theo chuẩn NestJS / Next.js.
* FE và BE giao tiếp qua RESTful API + SSE/WebSocket.
* Cấu trúc chuẩn bị sẵn cho mở rộng production.

---
