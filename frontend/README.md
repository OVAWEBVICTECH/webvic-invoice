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
# Serve locally (recommended for backend auth and CORS)
npx serve . -l 5173 --cors
```

Then visit: `http://localhost:5173`.

## Connecting to Backend

The frontend now uses the Express/PostgreSQL API for authentication and app data by default. User records, clients, invoices, invoice items, and settings are no longer persisted in browser localStorage.

By default, API calls go to `http://localhost:8080`. To point a static deployment at a hosted API, define `window.INVOICEFLOW_API_URL` before `js/api.js` is loaded, for example:

```html
<script>
  window.INVOICEFLOW_API_URL = 'https://api.example.com';
</script>
```

Authentication uses the JWT returned by the API in memory for `Authorization: Bearer ...` requests and also supports the API's httpOnly session cookie. The token is intentionally not stored in localStorage.

## Logical File Structure

Even though the app ships as a single `index.html`, it's organized into logical modules:

```
frontend/src/
├── utils/
│   ├── security.js          — XSS sanitization, password strength, rate limiting
│   ├── format.js            — Currency & date formatters
│   └── pdf.js               — PDF generation (html2canvas + jsPDF, A4 layout)
├── api/
│   └── backend.js           — REST API client with Bearer/cookie auth
├── context/
│   ├── ThemeContext.jsx      — Dark mode state + system preference
│   └── AppContext.jsx        — Global state, API bootstrap, session UI, navigation
├── components/
│   ├── Navbar.jsx            — Responsive navbar (landing / dashboard modes)
│   ├── DarkModeToggle.jsx    — Floating dark mode button
│   ├── Toast.jsx             — Toast notification system
│   ├── Modal.jsx             — Reusable modal with backdrop close
│   └── PasswordStrength.jsx  — Visual password strength indicator
├── pages/
│   ├── Landing.jsx           — Hero, Features, Pricing, Testimonials, About, Templates, Blog, Contact, Footer
│   ├── Login.jsx             — Login against PostgreSQL-backed API
│   ├── Signup.jsx            — Registration against PostgreSQL-backed API
│   └── Dashboard.jsx         — Overview, Invoices, Clients, Create, Settings
└── App.jsx                   — Root component / section router
```

## Features
- Full landing page with 10+ sections
- PostgreSQL-backed auth and workspace data via the backend API
- Dashboard with invoice creation, paid status updates, client management, PDF generation
- Dark mode with system preference detection
- In-memory 30-minute session UI timeout with activity refresh
- Rate-limited login (5 attempts / 5 minutes)
- Responsive design (mobile + desktop)
