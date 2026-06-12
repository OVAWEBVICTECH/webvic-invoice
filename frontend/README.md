# InvoiceFlow Frontend

React 18 + Tailwind CSS single-page application for invoice management.

## Stack
- **React 18** (CDN, production build)
- **Tailwind CSS v4** (browser CDN)
- **Babel Standalone** (in-browser JSX transform)
- **html2canvas + jsPDF** (PDF generation)
- **Font Awesome 6** (icons)

## Quick Start

```bash
# Option 1: Open directly
open index.html

# Option 2: Serve locally (recommended for cookie auth with backend)
npx serve . -l 5173 --cors
```

Then visit: `http://localhost:5173`

## Connecting to Backend

1. Sign up / login to the app
2. Go to **Settings** in the dashboard
3. Toggle **Backend Mode** on
4. Set the API URL (default: `http://localhost:8080`)
5. Click **Test Connection**

When backend mode is enabled, all auth, clients, invoices, and settings operations go through the REST API with httpOnly cookie sessions.

When backend mode is disabled (default), everything runs locally in the browser using localStorage.

## Logical File Structure

Even though the app ships as a single `index.html`, it's organized into logical modules:

```
frontend/src/
├── utils/
│   ├── security.js          — XSS sanitization, PBKDF2 hashing, CSRF, rate limiting
│   ├── storage.js           — localStorage persistence (base64 encoded)
│   ├── format.js            — Currency & date formatters
│   └── pdf.js               — PDF generation (html2canvas + jsPDF, A4 layout)
├── api/
│   └── backend.js           — REST API client with cookie-auth
├── context/
│   ├── ThemeContext.jsx      — Dark mode state + system preference
│   └── AppContext.jsx        — Global state, session management, navigation
├── components/
│   ├── Navbar.jsx            — Responsive navbar (landing / dashboard modes)
│   ├── DarkModeToggle.jsx    — Floating dark mode button
│   ├── Toast.jsx             — Toast notification system
│   ├── Modal.jsx             — Reusable modal with backdrop close
│   └── PasswordStrength.jsx  — Visual password strength indicator
├── pages/
│   ├── Landing.jsx           — Hero, Features, Pricing, Testimonials, About, Templates, Blog, Contact, Footer
│   ├── Login.jsx             — Login with rate limiting & validation
│   ├── Signup.jsx            — Signup with password strength & PBKDF2
│   └── Dashboard.jsx         — Overview, Invoices, Clients, Create, Settings
└── App.jsx                   — Root component / section router
```

## Features
- Full landing page with 10+ sections
- Auth with PBKDF2 password hashing (client-side demo) or real backend auth
- Dashboard with invoice CRUD, client management, PDF generation
- Dark mode with system preference detection
- 30-minute session timeout with activity refresh
- Rate-limited login (5 attempts / 5 minutes)
- Responsive design (mobile + desktop)
