Tuyệt vời 💪 Dưới đây là **Instruction chi tiết cho Backend** — file số **2 trong bộ 3 instruction**.
Nó mở rộng từ bản *Overview* ở trên, dành cho Copilot hoặc dev backend để **generate code NestJS + Prisma + AI integration** chuẩn, sạch, module hóa và có thể triển khai production.

---

## 🧠 BACKEND INSTRUCTION — AI Chat Project Builder

### 🎯 1️⃣. Mục tiêu Backend

Mục tiêu của backend là xây dựng một **API nền tảng** cho hệ thống AI Chat, bao gồm:

* Quản lý người dùng, đăng nhập / đăng ký / xác thực (JWT).
* Quản lý session (cuộc trò chuyện).
* Quản lý message trong mỗi session.
* Quản lý group (gom session theo chủ đề).
* Tích hợp **AI Engine** (OpenAI, Claude, Gemini, v.v.).
* Hỗ trợ **streaming message (SSE hoặc WebSocket)**.
* Mở rộng dễ dàng: logging, analytics, admin panel.

---

### ⚙️ 2️⃣. Công nghệ và cấu trúc

| Thành phần     | Công nghệ                                   |
| -------------- | ------------------------------------------- |
| Framework      | **NestJS**                                  |
| ORM            | **Prisma + PostgreSQL**                     |
| Authentication | **JWT (Access + Refresh)**                  |
| API Doc        | **Swagger**                                 |
| Streaming      | **Server-Sent Events (SSE)**                |
| Validation     | **class-validator + class-transformer**     |
| Config         | **dotenv + @nestjs/config**                 |
| Container      | **Docker**                                  |
| AI SDK         | **openai** (hoặc provider khác qua adapter) |

---

### 🗂️ 3️⃣. Cấu trúc thư mục backend

```
backend/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── config/
│   │   ├── app.config.ts
│   │   ├── database.config.ts
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   ├── common/
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── interceptors/
│   │   └── guards/
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── dto/
│   │   ├── user/
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   ├── group/
│   │   │   ├── group.controller.ts
│   │   │   ├── group.service.ts
│   │   ├── session/
│   │   │   ├── session.controller.ts
│   │   │   ├── session.service.ts
│   │   ├── message/
│   │   │   ├── message.controller.ts
│   │   │   ├── message.service.ts
│   │   ├── ai/
│   │   │   ├── ai.controller.ts
│   │   │   ├── ai.service.ts
│   │   │   └── adapters/
│   │   │       ├── openai.adapter.ts
│   │   │       └── anthropic.adapter.ts
│   └── utils/
│       └── constants.ts
│
├── prisma/
│   └── schema.prisma
├── Dockerfile
├── .env
└── docker-compose.yml
```

---

### 🧩 4️⃣. Các module chính

#### 🔐 4.1. AuthModule

* Chức năng: Đăng ký, đăng nhập, làm mới token.
* JWT-based (access + refresh).
* Mã hoá password bằng bcrypt.
* Endpoints:

  * `POST /auth/register`
  * `POST /auth/login`
  * `POST /auth/refresh`

```ts
interface RegisterDto { email: string; password: string; }
interface LoginDto { email: string; password: string; }
```

#### 👤 4.2. UserModule

* Quản lý thông tin người dùng, cài đặt cá nhân.
* Endpoints:

  * `GET /users/me` — lấy thông tin user hiện tại.
  * `PATCH /users/me` — cập nhật profile.
  * `DELETE /users/me` — xóa tài khoản.

---

#### 🧠 4.3. GroupModule

* Cho phép tạo group, đổi tên, xóa, và xem danh sách session trong group.
* Một session chỉ thuộc **1 group**.
* Endpoints:

  * `GET /groups` — danh sách group của user.
  * `POST /groups` — tạo group.
  * `PATCH /groups/:id` — đổi tên.
  * `DELETE /groups/:id` — xóa.
  * `GET /groups/:id/sessions` — lấy session trong group.

---

#### 💬 4.4. SessionModule

* Đại diện cho 1 phiên trò chuyện.
* Có thể gán vào group, đánh dấu quan trọng (favorite).
* Endpoints:

  * `GET /sessions` — danh sách session của user.
  * `POST /sessions` — tạo session mới.
  * `PATCH /sessions/:id` — đổi tên / gán group.
  * `PATCH /sessions/:id/favorite` — đánh dấu quan trọng.
  * `DELETE /sessions/:id` — xóa session.

---

#### 📨 4.5. MessageModule

* Quản lý tin nhắn trong mỗi session.
* Lưu cả prompt user và response AI.
* Endpoints:

  * `GET /messages/:sessionId` — danh sách message trong session.
  * `POST /messages` — gửi prompt (và gọi AI engine).
  * `GET /messages/stream/:sessionId` — SSE streaming response.

---

#### ⚙️ 4.6. AIEngineModule

* Trung gian giữa app và các AI provider.
* Giao tiếp thông qua **adapter pattern**, dễ mở rộng thêm provider khác.

Ví dụ:

```ts
interface AIProvider {
  generate(prompt: string, model: string, stream?: boolean): AsyncIterable<string> | string;
}
```

Adapter ví dụ (OpenAI):

```ts
@Injectable()
export class OpenAIAdapter implements AIProvider {
  private client = new OpenAI({ apiKey: process.env.OPENAI_KEY });
  async *generate(prompt: string, model: string) {
    const stream = await this.client.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      stream: true,
    });
    for await (const chunk of stream) yield chunk.choices[0].delta?.content ?? "";
  }
}
```

---

### 🔁 5️⃣. Workflow chi tiết Backend

#### 5.1. Khi user gửi prompt

1. FE gọi `POST /messages` với `{ sessionId, prompt }`.
2. BE:

   * Lưu message user vào DB.
   * Gọi `AIEngineService.generate(prompt, model, stream=true)`.
   * Stream kết quả qua SSE.
   * Khi hoàn tất, lưu message AI vào DB.

#### 5.2. Khi tạo session mới

* Gọi `POST /sessions` → backend tạo session có `title = "New Chat"`.
* Có thể gán `groupId` nếu truyền.

#### 5.3. Khi group bị xóa

* Backend tự set `session.groupId = null` cho các session trong group.

---

### 🧮 6️⃣. Mô hình dữ liệu (Prisma)

*(Giữ nguyên như trong Overview Instruction, nhưng thêm `model` cho AI model name)*

```prisma
model Session {
  id          String    @id @default(uuid())
  title       String
  model       String    @default("gpt-4o")
  groupId     String?
  group       Group?    @relation(fields: [groupId], references: [id])
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  isFavorite  Boolean   @default(false)
  messages    Message[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

---

### 🧩 7️⃣. Middleware & Guards

| Loại                       | Mục đích                          |
| -------------------------- | --------------------------------- |
| **AuthGuard**              | Bảo vệ các route yêu cầu JWT      |
| **UserContextInterceptor** | Gắn userId vào request object     |
| **ExceptionFilter**        | Format lỗi chuẩn JSON             |
| **LoggingInterceptor**     | Log request & response (dev mode) |

---

### 🧰 8️⃣. Công cụ & Dev

* Lệnh Prisma:

  ```bash
  npx prisma migrate dev
  npx prisma studio
  ```
* Swagger: `/api/docs`
* Docker Compose:

  ```yaml
  services:
    api:
      build: ./backend
      env_file: .env
      ports: ["3000:3000"]
    db:
      image: postgres:16
      environment:
        POSTGRES_USER: postgres
        POSTGRES_PASSWORD: postgres
        POSTGRES_DB: ai_chat
      ports: ["5432:5432"]
  ```

---

### 🚀 9️⃣. Kết quả mong đợi

* API hoạt động tại `http://localhost:3000`.
* Có thể:

  * Đăng nhập / đăng ký user.
  * Tạo / gán group, session, message.
  * Stream chat từ AI provider thật.
* Code clean, module hóa rõ ràng, tuân theo cấu trúc NestJS chuẩn.

---

Bạn có muốn mình tiếp tục viết **Instruction thứ 3 — Frontend (Next.js 15 + shadcn/ui)**
→ Bao gồm cấu trúc thư mục, page, store, hooks, và streaming chat UI chuẩn production không?
