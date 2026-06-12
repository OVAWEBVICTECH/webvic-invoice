# InvoiceFlow Backend (Starter)

This folder contains a **real backend foundation** for InvoiceFlow.

## Stack
- Node.js + Express (REST API)
- Postgres + Prisma ORM
- Auth: **argon2id password hashing** + **JWT Bearer tokens** + **httpOnly cookie session fallback**
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
npx prisma migrate deploy
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

## Environment variables

See `.env.example` for all required backend variables:

- `DATABASE_URL` — PostgreSQL connection string used by Prisma.
- `JWT_SECRET` — long random secret used to sign JWTs; must be at least 24 characters.
- `JWT_EXPIRES_IN` — JWT lifetime, defaults to `30m`.
- `CORS_ORIGIN` — comma-separated frontend origins, for example your Vercel URL and `http://localhost:5173`.
- `COOKIE_SECURE` — keep `false` for local HTTP; set to `true` in production HTTPS deployments.
- `COOKIE_SAME_SITE` — keep `lax` for same-site/local development; set to `none` for cross-site Vercel-to-API cookies.
- `PORT` — API port, defaults to `8080`.

## Authentication and persistence

- `POST /api/auth/signup` creates the user and default settings in PostgreSQL through Prisma, hashes passwords with argon2id, and returns `{ user, token }`.
- `POST /api/auth/login` validates email/password against PostgreSQL and returns `{ user, token }`.
- Authenticated routes accept `Authorization: Bearer <token>` and the `if_session` httpOnly cookie.
- Clients, invoices, invoice items, and settings are scoped by `userId` and persisted in PostgreSQL.

## End-to-end verification

With PostgreSQL migrated and the API running, verify persistence across logout and a second login/device with:

```bash
cd backend
API_URL=http://localhost:8080 npm run smoke:auth-flow
```

The smoke test registers a unique user, creates a client, settings, and invoice, logs out, logs in again without reusing the first token, and asserts the same data is returned from PostgreSQL.

## Next steps (to make this production-grade)
- Add rotating refresh tokens or server sessions for long-lived sessions
- Add CSRF protection for cookie-auth routes
- Add audit logs, WAF/edge rate limiting, request IDs
- Add Stripe subscriptions + webhook entitlements
- Add background jobs for reminders/PDF/email
- Deploy with HTTPS + proper security headers
