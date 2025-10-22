# Chatbot AI (Monorepo)

Modern AI chat application with a NestJS backend and Next.js frontend.

## Structure

```
root/
├── backend/   # NestJS (Auth, Groups, Sessions, Messages, AI, WebSocket, SSE)
├── frontend/  # Next.js (App Router)
├── docs/      # Postman collection
└── docker-compose.yml
```

## Backend

See `backend/README.md` for setup, env, endpoints, and streaming details.

## Frontend

Next.js app prepared with Tailwind and a minimal services layer. Will be wired to Socket.IO/SSE in the next step.

## Quick start (local Docker)

```bash
# 1) Copy env templates
cp backend/.env.example backend/.env

# 2) Launch services
docker compose up --build

# Backend: http://localhost:3001/health
# Frontend: http://localhost:3000
# Postgres: localhost:5432 (user: postgres, pass: postgres)
# Redis: localhost:6379

# Postman collection
# Import `docs/postman.json` to test health/auth/groups/sessions/messages
```

## Env variables
Backend `.env` required keys:
- DATABASE_URL=postgresql://postgres:postgres@db:5432/chatbot?schema=public
- OPENAI_API_KEY=sk-...
- JWT_SECRET=change-me
- REDIS_URL=redis://redis:6379

## Notes
- This repo follows NestJS feature modularization; see `backend/src/modules/*`.
- Prisma schema covers User/Account/Group/Session/Message.
- Update `.github/copilot-instructions.md` if conventions change.