# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Orbit is a full-stack PR/communications campaign management app with AI-powered content generation. It uses a monolithic Express server that serves both the REST API and the built React frontend.

## Commands

```bash
# Frontend dev server (Vite, proxies /api to localhost:3000)
npm run dev:client

# Backend dev server (Express + MySQL, auto-reload via nodemon)
npm run dev:server

# Build frontend to dist/
npm run build

# Run production server (serves dist/ + API)
npm start
```

No lint or test scripts are configured.

## Architecture

**Frontend** (`src/`) is a React 18 SPA built with Vite and Tailwind CSS (class-based dark mode). There are no tests and no TypeScript — plain `.jsx` files throughout.

**Backend** (`server.js`) is a single 1500+ line Express file handling ~50 REST endpoints. It initializes a MySQL connection pool via `db.js` and creates the `campaign_plans` table at startup if it doesn't exist.

**State management** is centralized in `App.jsx` — a large component holding `currentView`, modal state, and all data arrays via `useState`/`useEffect`. Views are registered in `src/routes.js`.

**AI integration** uses the Google Gemini API (v1beta) via a server-side proxy pattern. Key helpers in `server.js`:
- `describeVibe()` — converts numeric 0–100 slider values to natural language for prompts
- `extractJsonFromText()` — parses Gemini responses that may wrap JSON in code fences

**Database schema** is in `orbit_schema.sql`. Key tables: `campaigns`, `posts`, `deliverables`, `requests`, `contacts`, `approval_rules`, `campaign_plans`. Complex data (plan JSON, approval stages) is stored in JSON columns.

## Environment

The app requires a `.env` file with:
```
DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT
PORT=3000
GEMINI_API_KEY
```

Vite dev server proxies `/api/*` to `http://localhost:3000`, so run both servers during development.

## Key Files

| File | Purpose |
|------|---------|
| `server.js` | All Express routes and Gemini AI integration |
| `db.js` | MySQL connection pool (mysql2/promise) |
| `src/App.jsx` | Root component; centralized state and view routing |
| `src/routes.js` | View and modal name constants |
| `src/Views/CampaignPlanningView.jsx` | Most complex view (~82KB); multi-phase AI planning UI |
| `orbit_schema.sql` | Full MySQL schema with views |
