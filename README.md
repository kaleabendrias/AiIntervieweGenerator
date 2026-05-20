# Interview Question Generator

A fullstack application that generates three role-specific interview questions for a given job title using Groq (Llama 3.3 70B).

- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript
- **AI provider:** Groq — `llama-3.3-70b-versatile`

The Groq API key is held server-side only — the frontend never sees it.

---

## Project Structure

```
interview_AI/
├── backend/
│   ├── src/
│   │   ├── config/           # Env loading & validation
│   │   ├── controllers/      # Express request handlers
│   │   ├── middleware/       # Error, logging, rate limit, validation
│   │   ├── routes/           # Route definitions
│   │   ├── services/         # LLM (Groq) integration
│   │   ├── types/            # Shared TypeScript types
│   │   ├── app.ts            # Express app factory
│   │   └── index.ts          # Server entrypoint
│   └── tests/                # Vitest + Supertest API tests
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API client
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   └── tests/                # Vitest + React Testing Library tests
└── README.md
```

---

## Prerequisites

- Node.js **≥ 18** (LTS recommended — this project is tested on Node 22)
- npm **≥ 9**
- A Groq API key — get one at [console.groq.com/keys](https://console.groq.com/keys)

### Install Node via NVM (Linux / macOS)

```bash
# 1. Install nvm (skip if already installed: `command -v nvm`)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# 2. Reload your shell so `nvm` is available
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 3. Install + activate the latest LTS, make it the default
nvm install --lts
nvm alias default 'lts/*'
nvm use --lts

# 4. Verify
node -v
npm -v
```

---

## Local Setup

```bash
git clone <repo-url>
cd interview_AI

# One-shot install for root + backend + frontend
npm run install:all

# Configure secrets
cp backend/.env.example backend/.env       # then edit and set GROQ_API_KEY
cp frontend/.env.example frontend/.env     # defaults work for local dev

# Run both apps together
npm run dev
```

- Backend → **http://localhost:5000**
- Frontend → **http://localhost:5173**
- CORS is preconfigured on the backend to accept `http://localhost:5173`.

### Run them separately

```bash
npm run dev:backend     # backend only
npm run dev:frontend    # frontend only
```

Or directly:

```bash
cd backend && npm install && cp .env.example .env && npm run dev
cd frontend && npm install && cp .env.example .env && npm run dev
```

---

## Environment Variables

### `backend/.env`

| Variable               | Required | Default                    | Description                                       |
|------------------------|----------|----------------------------|---------------------------------------------------|
| `PORT`                 | no       | `5000`                     | Server port                                       |
| `CORS_ORIGIN`          | no       | `http://localhost:5173`    | Allowed frontend origin                           |
| `GROQ_API_KEY`       | **yes**  | —                          | Groq API key (secret)                    |
| `GROQ_MODEL`         | no       | `llama-3.3-70b-versatile` | Groq model name                                 |
| `GROQ_TIMEOUT_MS`    | no       | `15000`                    | Max time to wait for an LLM response            |
| `RATE_LIMIT_WINDOW_MS` | no       | `60000`                    | Rate-limit window in milliseconds                 |
| `RATE_LIMIT_ANON_MAX`  | no       | `10`                       | Max requests per window for anonymous clients     |
| `RATE_LIMIT_AUTH_MAX`  | no       | `60`                       | Max requests per window for authenticated clients |

### `frontend/.env`

| Variable        | Required | Default                  | Description           |
|-----------------|----------|--------------------------|-----------------------|
| `VITE_API_URL`  | no       | `http://localhost:5000`  | Backend API base URL  |

> **Never** put `GROQ_API_KEY` (or any secret) in a `VITE_*` variable — Vite inlines those into the client bundle.

---

## API

### `POST /api/questions`

**Request**
```json
{ "jobTitle": "Customer Success Manager" }
```

**Response — 200**
```json
{ "questions": ["...", "...", "..."] }
```

**Error responses**

| Status | When                                                |
|--------|-----------------------------------------------------|
| `400`  | Invalid or missing `jobTitle`, or malformed JSON    |
| `404`  | Unknown route                                       |
| `429`  | Rate limit exceeded                                 |
| `500`  | Unexpected server error                             |
| `502`  | LLM call failed or returned an unexpected shape  |
| `504`  | LLM call timed out                               |

All errors return `{ "error": "<message>" }`.

### `GET /health`

Returns `{ "status": "ok" }` — useful for uptime checks.

---

## Scripts

### Root

```bash
npm run install:all   # install root + backend + frontend deps
npm run dev           # run backend + frontend concurrently
npm run dev:backend
npm run dev:frontend
npm run build         # build both
npm test              # run both test suites
npm run lint          # lint both
```

### Backend

```bash
npm run dev       # tsx watch — hot-reloading dev server
npm run build     # Compile TypeScript to dist/
npm start         # Run the compiled output
npm run lint      # ESLint
npm run format    # Prettier
npm test          # Vitest (Supertest API tests)
npm run test:watch
```

### Frontend

```bash
npm run dev       # Vite dev server
npm run build     # Type-check then build to dist/
npm run preview   # Preview the production build locally
npm run lint      # ESLint
npm run format    # Prettier
npm test          # Vitest (React Testing Library)
npm run test:watch
```

---

## Testing

### Backend

Real Express app + Supertest, with only the external Groq SDK mocked.

```bash
cd backend && npm test
```

Covers: validation (400), unknown routes (404), success path, LLM failure (502), LLM timeout / bad shape, invalid JSON, health.

### Frontend

Real `<App />` rendered with React Testing Library; only `fetch` is mocked.

```bash
cd frontend && npm test
```

Covers: form rendering, controlled input, loading state, disabled-while-loading, success rendering, error rendering, validation, request body trimming.

---

## Deployment

### Backend — Render

1. Push the repo to GitHub.
2. In Render, click **New → Web Service** and connect the repo.
3. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Environment:** Node
4. Add environment variables in the Render dashboard:
   - `GROQ_API_KEY` (required)
   - `CORS_ORIGIN` — set to your deployed frontend URL, e.g. `https://your-app.vercel.app`
   - Optionally override `GROQ_MODEL`, `RATE_LIMIT_*`, etc.
5. Deploy. Render will assign a URL like `https://your-api.onrender.com`.

> Render free-tier instances sleep when idle. The first request after sleep takes ~30s — the frontend will surface this as a timeout. Consider a paid plan or a periodic ping if that matters.

### Frontend — Vercel

1. In Vercel, click **Add New → Project** and import the repo.
2. Configure:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite (auto-detected)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `dist` (default)
3. Add environment variable:
   - `VITE_API_URL` — your Render backend URL (e.g. `https://your-api.onrender.com`)
4. Deploy.

After deploying the frontend, update the backend's `CORS_ORIGIN` on Render to the Vercel URL and redeploy the backend service.

### Post-deploy checklist

- [ ] `GET https://your-api.onrender.com/health` returns `{"status":"ok"}`
- [ ] Frontend loads and the form submits successfully
- [ ] `CORS_ORIGIN` matches the deployed frontend exactly (including `https://`, no trailing slash)
- [ ] Rate limits are reasonable for your traffic

---

## Troubleshooting

- **`nvm: command not found` in a new shell** — nvm only loads in interactive shells. Either open a new terminal, run `source ~/.bashrc` / `source ~/.zshrc`, or `export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"`.
- **`Missing required environment variable: GROQ_API_KEY`** — backend can't start without it. Set it in `backend/.env`.
- **CORS error in the browser** — the frontend origin doesn't match `CORS_ORIGIN`. Make sure both run on the documented ports, or update `CORS_ORIGIN` in `backend/.env`.
- **`EADDRINUSE: address already in use :::5000`** — another process owns port 5000. Find and kill it (`lsof -i :5000`) or override `PORT` in `backend/.env`.
- **Frontend hits the wrong API URL** — restart the Vite dev server after editing `frontend/.env`; Vite only reads env files at startup.
- **Slow first request after a long pause (deployed)** — Render free-tier cold start; see the Deployment section.

---

## License

MIT
