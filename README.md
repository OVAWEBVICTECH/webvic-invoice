# InvoiceFlow

**Smart Invoice Generator & Payment Tracker** — A full-stack SaaS application for freelancers and small businesses.

```
invoiceflow/
├── frontend/          ← React 18 + Tailwind CSS app
│   ├── index.html     ← Single-page application (all UI)
│   ├── package.json
│   └── README.md
│
├── backend/           ← Node.js + Express REST API
│   ├── src/
│   │   ├── server.js
│   │   ├── app.js
│   │   ├── lib/
│   │   │   ├── prisma.js
│   │   │   └── jwt.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   └── routes/
│   │       ├── index.js
│   │       ├── auth.routes.js
│   │       ├── clients.routes.js
│   │       ├── invoices.routes.js
│   │       └── settings.routes.js
│   ├── prisma/
│   │   └── schema.prisma
│   ├── docker-compose.yml
│   ├── Dockerfile
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
└── README.md          ← This file
```

---

## Quick Start

### Frontend Only (No Backend Required)

```bash
cd frontend
open index.html
# or
npx serve . -l 5173 --cors
```

The app runs fully in the browser using localStorage. No server needed.

### Full Stack (Frontend + Backend)

#### 1. Start the database

```bash
cd backend
docker compose up -d
```

#### 2. Install backend dependencies

```bash
cd backend
npm install
```

#### 3. Configure environment

```bash
cd backend
cp .env.example .env
# Edit .env → set JWT_SECRET to a long random string
# Set CORS_ORIGIN=http://localhost:5173
```

#### 4. Run database migrations

```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

#### 5. Start the API server

```bash
cd backend
npm run dev
```

API runs at: `http://localhost:8080`

#### 6. Start the frontend

```bash
cd frontend
npx serve . -l 5173 --cors
```

Frontend runs at: `http://localhost:5173`

#### 7. Connect frontend to backend

1. Open `http://localhost:5173`
2. Sign up → go to **Settings**
3. Toggle **Backend Mode** on
4. Set API URL to `http://localhost:8080`
5. Click **Test Connection**

---

## Tech Stack

| Layer       | Technology                                      |
|-------------|------------------------------------------------|
| Frontend    | React 18, Tailwind CSS v4, Font Awesome 6      |
| PDF         | html2canvas + jsPDF                             |
| Backend     | Node.js, Express, Prisma ORM                   |
| Database    | PostgreSQL 16                                   |
| Auth        | Argon2id password hashing, JWT httpOnly cookies |
| Validation  | Zod (server), client-side sanitization          |
| Security    | Helmet, CORS, rate limiting, CSP headers        |

## API Endpoints

| Method | Path                        | Auth | Description            |
|--------|-----------------------------|------|------------------------|
| POST   | `/api/auth/signup`          | No   | Create account         |
| POST   | `/api/auth/login`           | No   | Login                  |
| POST   | `/api/auth/logout`          | No   | Logout (clear cookie)  |
| GET    | `/api/auth/me`              | Yes  | Get current user       |
| PUT    | `/api/auth/profile`         | Yes  | Update name/business   |
| GET    | `/api/clients`              | Yes  | List clients           |
| POST   | `/api/clients`              | Yes  | Create client          |
| PUT    | `/api/clients/:id`          | Yes  | Update client          |
| DELETE | `/api/clients/:id`          | Yes  | Delete client          |
| GET    | `/api/invoices`             | Yes  | List invoices          |
| GET    | `/api/invoices/:id`         | Yes  | Get invoice            |
| POST   | `/api/invoices`             | Yes  | Create invoice         |
| PATCH  | `/api/invoices/:id/status`  | Yes  | Update invoice status  |
| DELETE | `/api/invoices/:id`         | Yes  | Delete invoice         |
| GET    | `/api/settings`             | Yes  | Get settings           |
| PUT    | `/api/settings`             | Yes  | Update settings        |
| GET    | `/health`                   | No   | Health check           |

## License

MIT
