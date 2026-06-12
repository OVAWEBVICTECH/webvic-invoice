# InvoiceFlow Backend (Starter)

This folder contains a **real backend foundation** for InvoiceFlow.

## Stack
- Node.js + Express (REST API)
- Postgres + Prisma ORM
- Auth: **argon2id password hashing** + **httpOnly cookie session (JWT)**
- Validation: Zod
- Security: Helmet + CORS + basic rate limiting

## Quick start (local)

1) Start Postgres:
```bash
cd backend
docker compose up -d
```

2) Install dependencies:
```bash
npm install
```

3) Configure env:
```bash
cp .env.example .env
```

4) Run Prisma:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

5) Start the API:
```bash
npm run dev
```

API will be at: `http://localhost:8080`
Health check: `GET /health`

## API routes
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET  /api/auth/me`

- `GET  /api/clients`
- `POST /api/clients`
- `PUT  /api/clients/:id`
- `DELETE /api/clients/:id`

- `GET  /api/invoices`
- `GET  /api/invoices/:id`
- `POST /api/invoices`
- `PATCH /api/invoices/:id/status`
- `DELETE /api/invoices/:id`

- `GET /api/settings`
- `PUT /api/settings`

## Next steps (to make this production-grade)
- Replace JWT-cookie sessions with rotating refresh tokens or server sessions
- Add CSRF protection for cookie-auth routes
- Add audit logs, WAF/edge rate limiting, request IDs
- Add Stripe subscriptions + webhook entitlements
- Add background jobs for reminders/PDF/email
- Deploy with HTTPS + proper security headers

> The current front-end still uses localStorage. Wiring it to this API is the next step.
