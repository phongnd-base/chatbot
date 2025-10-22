# Chatbot AI — Backend

Modern NestJS backend for an AI Chat app with JWT/OAuth auth, Groups/Sessions/Messages, AI providers, and realtime streaming via Socket.IO or SSE.

## Quick start

- Requirements: Node 20+, PostgreSQL, (optional) Redis for future features
- Env: copy `.env.example` to `.env` and adjust values
- Install and run:

```
npm install
npm run start:dev
```

- Database: Prisma

```
npx prisma generate
npx prisma migrate dev --name init
```

- Health check: GET http://localhost:3001/health

## Configuration

Edit `.env` (see `.env.example`):
- PORT: default 3001
- DATABASE_URL: Postgres connection string
- JWT_SECRET: JWT signing secret
- OPENAI_API_KEY: for AI replies (optional; echo fallback)
- GOOGLE_*: for OAuth (optional)

## Auth

- POST `/auth/register` → { email, password }
- POST `/auth/login` → { email, password }
- POST `/auth/refresh` → refresh token in Authorization header
- GET `/auth/me` → current user
- GET `/auth/google` → OAuth login start
- GET `/auth/google/callback` → OAuth callback

## Groups

- GET `/groups`
- POST `/groups` → { name }
- PATCH `/groups/:id` → { name? }
- DELETE `/groups/:id` (sessions are ungrouped)
- GET `/groups/:id/sessions`

## Sessions

- GET `/sessions`
- GET `/sessions/:id`
- POST `/sessions` → { title?, groupId?, model? }
- PATCH `/sessions/:id` → { title?, isFavorite?, groupId?, model? }
- PATCH `/sessions/:id/favorite` → { isFavorite }
- PATCH `/sessions/:id/group` → { groupId }
- DELETE `/sessions/:id`
- Export: GET `/sessions/:id/export.json`, `/sessions/:id/export.md`

## Messages

- GET `/messages/:sessionId`
- POST `/messages` → { sessionId, role: 'user'|'assistant', content }
  - On user message: backend generates assistant reply
  - Realtime: streams in two ways:
    - Socket.IO (namespace `/chat`):
      - Client joins room: emit `join` with `{ sessionId }`
      - Events:
        - `message:new` (user message and assistant placeholder)
        - `message:stream` { messageId, delta }
        - `message:update` (assistant final content)
        - `message:done` { messageId }
    - SSE: GET `/sse/sessions/:id/stream`
      - Streams `text/event-stream` chunks for demo; can be extended to accept a prompt and persist messages

## Architecture

- NestJS feature modules: Auth, Group, Session, Message, AI, Websocket
- Global Prisma module for database access
- ValidationPipe enabled globally; CORS enabled
- OpenAI SDK for AI (streaming + non-streaming)

## Dev tips

- Postman collection at `docs/postman.json`
- Socket testing: use `socket.io-client` or a small playground
- Logs show mapped routes and WS subscriptions on start

## Roadmap

- SSE parity: prompt input + DB persistence
- Config validation with schema
- Rate limiting on message endpoints
- E2E tests with Supertest
