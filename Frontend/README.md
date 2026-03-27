# CodeSM — Frontend

React 19 single-page app for CodeSM, built with [Vite](https://vitejs.dev/), Tailwind CSS 4, and Radix-style UI patterns. Includes Monaco / CodeMirror editing, charts, OAuth, and API calls to the backend.

## Prerequisites

- Node.js 18+
- Backend running (default `http://localhost:8000` in development)

## Install

```bash
cd Frontend
npm install
```

## Environment

Create `.env` or `.env.local` in `Frontend/`:

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | Base URL for API calls (e.g. `http://localhost:8000/api/v1`) |
| `VITE_GOOGLE_CLIENT_ID` | Google Sign-In client ID |
| `VITE_PUBLIC_POSTHOG_KEY` / `VITE_PUBLIC_POSTHOG_HOST` | Optional PostHog analytics |

`vite.config.js` proxies `/api` to `http://localhost:8000`, so relative `/api` requests work in dev without CORS issues.

## Scripts

```bash
npm run dev      # Vite dev server (default port 5173)
npm run build    # Production build to dist/
npm run preview  # Preview production build
npm run lint     # ESLint
```

## Project layout

- `src/` — App shell, routes, views, API client (`src/api/api.js`), UI components
- Alias `@` → `src/` (see `vite.config.js`)

See the repository root `README.md` for the full CodeSM overview and how backend, workers, and this app fit together.
