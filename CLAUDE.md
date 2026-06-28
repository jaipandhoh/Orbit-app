# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Orbit is a PR campaign and content management tool for small teams. It uses a monolithic Express server that serves both the REST API and the built React frontend.

## Commands

```bash
# Frontend dev server (Vite, proxies /api to localhost:3000)
npm run dev:client

# Backend dev server (Express + Postgres, auto-reload via nodemon)
npm run dev:server

# Build frontend to dist/
npm run build

# Run production server (serves dist/ + API)
npm start
```

No lint or test scripts are configured.

## Architecture

**Frontend** (`src/`) is a React 18 SPA built with Vite and Tailwind CSS (class-based dark mode). No TypeScript — plain `.jsx` files throughout. No test setup.

**Backend** (`server.js`) is a single ~1500-line Express file handling ~50 REST endpoints. It imports `db.js` for all database access and runs `ensureSchema()` at startup to create any missing tables.

**State management** is centralized in `App.jsx` — a large component holding `currentView`, modal state, and all data arrays via `useState`/`useEffect`. Views and modals are registered as string constants in `src/routes.js`.

**Auth** uses Supabase Auth (`src/lib/supabase.js` + `src/context/AuthContext.jsx`). The frontend gets a JWT from Supabase and passes it as a Bearer token on every API request. The backend verifies it via `middleware/authMiddleware.js` (and `middleware/optionalAuth.js` for public routes).

**AI integration** uses the Google Gemini API (v1beta) via a server-side proxy. Key helpers in `server.js`:
- `describeVibe()` — converts numeric 0–100 slider values to natural language for prompts
- `extractJsonFromText()` — parses Gemini responses that may wrap JSON in code fences

**Database** is PostgreSQL, hosted on Supabase. `db.js` wraps `node-postgres` (`pg`) Pool with a MySQL-compatible interface: it converts `?` placeholders to `$1/$2/...` and appends `RETURNING *` to mutations automatically. Use `DATABASE_URL` (Supabase connection string) to connect.

## Environment

```
DATABASE_URL=          # Supabase Postgres connection string
VITE_SUPABASE_URL=     # Supabase project URL (frontend)
VITE_SUPABASE_ANON_KEY= # Supabase anon key (frontend)
PORT=3000
GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-flash  # optional, this is the default
```

Vite dev server proxies `/api/*` to `http://localhost:3000`, so run both servers during development.

## Schema

Core tables (defined in `orbit_schema.sql`, managed in Supabase):

| Table | Key columns |
|-------|-------------|
| `campaigns` | `campaign_id`, `title`, `objective`, `start_date`, `end_date`, `status`, `contact_id` |
| `posts` | `post_id`, `campaign_id`, `platform`, `content`, `scheduled_at`, `published_at`, `impressions`, `clicks` |
| `deliverables` | `deliverable_id`, `campaign_id`, `title`, `status`, `due_date`, `priority`, `platform` |
| `requests` | `request_id`, `title`, `platform`, `content_type`, `status`, `deadline_at`, `scheduled_at` |
| `contacts` | `contact_id`, `name`, `email`, `organization` |
| `approval_rules` | `rule_id`, `stages_json`, `condition_*` columns, `priority_order` |
| `onboarding_templates` | `template_id`, `config_json` |
| `team_settings` | singleton row, references `onboarding_template_id` |

Additional tables created by `ensureSchema()` in `server.js`:

| Table | Purpose |
|-------|---------|
| `campaign_plans` | AI-generated plan JSON per campaign (`plan_json`, `brief_text`, `colors_json`) |
| `approvals` | Per-post/request approval records (`status`, `feedback`) |
| `approval_comments` | Comments on approval threads |
| `workspaces` | Multi-tenant workspace support |
| `comments` | Polymorphic comments on campaigns/posts (`entity_type`, `entity_id`, `author_id`, `author_name`, `body`) |

Complex data (plan JSON, approval stages, rule conditions) is stored in JSON columns.

## File Structure

```
server.js                  # All Express routes + Gemini AI integration
db.js                      # PostgreSQL pool with MySQL-compatible wrapper
orbit_schema.sql           # Reference schema (run once to set up Supabase)
routes/
  workspaces.js            # /api/workspaces router
middleware/
  authMiddleware.js        # JWT verification (required)
  optionalAuth.js          # JWT verification (optional, for public routes)
  rateLimiters.js          # apiLimiter, aiGenerateLimiter, etc.
src/
  App.jsx                  # Root component; centralized state + view routing
  routes.js                # VIEWS and MODALS string constants
  main.jsx                 # React entry point
  index.css                # Global styles
  lib/supabase.js          # Supabase client init
  context/AuthContext.jsx  # Auth state + workspace selection
  components/
    SidebarNav.jsx         # Main navigation (dark sidebar, green active state)
    TopNav.jsx             # Top bar (legacy, replaced by SidebarNav in App.jsx)
    OnboardingTour.jsx     # First-run tour
    WorkspaceSwitcher.jsx  # Workspace dropdown
    PendingApprovals.jsx   # Approval widget
    ModalActions.jsx       # Shared modal footer buttons
    TemplateCard.jsx       # Template card component
    CommentsThread.jsx     # Self-fetching comment thread (entityType + entityId props)
    ui/                    # Design system primitives (Pass 1)
      index.js             # Barrel export
      Button.jsx           # primary/secondary/ghost/danger, sm/md/lg
      StatusPill.jsx       # Status indicator with colored dot
      Card.jsx             # White card with border and hover shadow
      Input.jsx            # Text input with optional icon
      Avatar.jsx           # Initials avatar with deterministic color
      PlatformIcon.jsx     # Platform brand circles + PlatformIconCluster
      Table.jsx            # Composable Table/THead/TBody/TR/TH/TD
      Tabs.jsx             # Horizontal text tabs with green underline
      FilterPill.jsx       # Outlined button with icon + chevron
      Select.jsx           # Native select with ds-* styling, matches Input
      Textarea.jsx         # Multiline text input with ds-* styling, matches Input
    dashboard/             # Dashboard section components (Feature 3)
      DueThisWeek.jsx      # Posts with scheduled_at in next 7 days
      AwaitingReview.jsx   # Posts with status = 'in_review'
      ResultsOverdue.jsx   # Published posts past results_due_at
      ActiveCampaigns.jsx  # Active campaigns with post progress bars
  Views/
    HelpView.jsx           # Help screen
  pages/
    Login.jsx              # Auth page
    WorkspaceSettings.jsx  # Workspace settings
    TermsOfUse.jsx
    DataCompliance.jsx
  constants/
    templates.js           # Onboarding template definitions
  # View components (flat in src/):
  DashboardView.jsx        # Dashboard home (default view) — fetches /api/dashboard, renders 4 section components
  CampaignsView.jsx        # Campaign list
  CampaignDetail.jsx       # Single campaign detail
  PostsView.jsx            # Posts page: view-switcher wrapper (kanban/calendar/list), URL param sync
  CalendarView.jsx         # Calendar (week/month) of posts with drag-to-reschedule
  PostsKanbanView.jsx      # Kanban board of posts (Draft / Scheduled / Published columns)
  PostsListView.jsx        # Table view of posts using Table primitives
  BoardView.jsx            # Kanban board of requests (separate from posts)
  ContactsView.jsx         # Contacts list
  InboxView.jsx            # Inbox / notifications
  AssetsView.jsx           # Asset library
  TemplatesView.jsx        # Template gallery
  SettingsPage.jsx         # App settings
  MasterTodoView.jsx       # Global task list
  AdminView.jsx            # Admin panel
  CampaignPlanningView.jsx # AI campaign planning (~82KB, most complex view)
  PublicRequestView.jsx    # Public-facing request form
  PreviewStudio.jsx        # Post preview tool
  # Modal components:
  CampaignFormModal.jsx
  PostFormModal.jsx
  ContactFormModal.jsx
  RequestFormModal.jsx
  DeliverableFormModal.jsx
  TemplateModal.jsx
  ApprovalReviewModal.jsx
  # Other:
  DashboardWidgets.jsx
  WeeklyFocusBanner.jsx
  DatabaseStatus.jsx
  ApprovalRulesSettings.jsx
  InstagramQualityGuardian.jsx
  OnboardingTemplates.jsx
  ThemeProvider.jsx
  ToastProvider.jsx
  OrbitLogo.jsx
  utils.js
```

## Conventions

- **Routing**: `currentView` string in `App.jsx` state drives which view renders. All view/modal names are constants in `src/routes.js` — add new ones there first.
- **API calls**: All fetch calls use `/api/...` (proxied to Express in dev, served directly in prod). No API client library — plain `fetch`.
- **Styling (new design system)**: CSS custom properties defined on `:root` in `src/index.css` (e.g. `--color-bg`, `--color-accent`, `--color-fg-muted`). These are mirrored as Tailwind `ds-*` tokens (e.g. `text-ds-fg`, `bg-ds-accent`, `border-ds-border`). New pages should use `ds-*` tokens exclusively. Legacy pages still use old tokens (`text-text`, `bg-surface`, etc.) which remain in `tailwind.config.js` for backward compatibility. Font is Inter (loaded via Google Fonts in `index.html`). Dark mode is deferred — use light tokens only for now.
- **Styling (legacy)**: Old Tailwind tokens (`text-text`, `text-mutedText`, `bg-surface`, `bg-surface2`, `border-border`, `primary=#6EA8FF`) still exist in `tailwind.config.js` for pages not yet redesigned. Do not use them in new code.
- **No TypeScript**: Plain JSX throughout. PropTypes are not used either.
- **Modal pattern**: Modals are rendered in `App.jsx` and controlled by `openModal` / `closeModal` state. Data is passed as props.
- **db.js wrapper quirk**: Use `?` for query parameters (they are auto-converted to `$1/$2`). Mutations return `{ insertId, affectedRows }` to mimic mysql2 behavior, even though the DB is Postgres.
- **`posts.status` column (Feature 2)**: 7-status workflow in fixed order: `idea` → `approved` → `drafting` → `in_review` → `scheduled` → `published` → `reported`. Default for new posts is `idea`. The canonical list lives in `src/constants/postStatus.js` (`POST_STATUSES` array with value/label/color) and is imported by Kanban columns, StatusPill, PostFormModal, and anywhere else that references post statuses. Any status can move to any other freely — the order is suggestive, not enforced.
- **Auto-follow-up on Publish**: When `PATCH /api/posts/:id` sets `status = 'published'` and `published_at` is null or older than 24 hours, the server auto-sets `published_at = NOW()` and `results_due_at = NOW() + 7 days`. Moving away from `published` clears `results_due_at` but preserves `published_at`. The client shows a toast on publish under the same 24h condition.
- **`results_due_at` column**: Feature 3 (Dashboard) will read this to surface "results overdue" items. The column is populated by the PATCH auto-follow-up logic above.
- **"Reported" status**: Intentionally just a status change for now — actual results logging (outlet, reach, sentiment fields) is Tier 2 work.
- **Drag-and-drop**: `@dnd-kit/core` + `@dnd-kit/sortable` are installed. Both `PointerSensor` and `TouchSensor` are configured on all drag contexts for mobile compatibility.
- **Partial post update**: `PATCH /api/posts/:id` accepts `{ status, scheduled_at, published_at }` as a subset. Calendar drag patches `scheduled_at` only; Kanban drag patches `status` only. Status transition side-effects are deferred to Feature 2.
- **ensureSchema() migration pattern**: `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` is used as a lightweight migration mechanism. Revisit and replace with a proper migration tool (e.g. node-pg-migrate) before the schema grows significantly.
- **App shell layout**: `SidebarNav` (240px dark sidebar) is rendered in `App.jsx`. Main content sits in a `ml-60` container. The old `TopNav` is no longer rendered but kept in the codebase.
- **Redesigned page pattern** (reference: `CampaignsView.jsx`): Page header (title + description + search + CTA), toolbar row (Tabs + FilterPill), data table using `Table` primitives, pagination footer. Future page redesigns should follow this structure and import from `src/components/ui/`.
- **Sidebar nav items**: Dashboard, Campaigns, Ideas, Posts, Contacts, Outreach, Coverage, Reports. Dashboard is the first item (LayoutDashboard icon). Views for Ideas, Outreach, Coverage, Reports are stub constants in `routes.js` — pages not yet built.
- **Posts page URL param sync**: `PostsView` reads `?view=kanban|calendar|list` from the URL on mount and defaults to `kanban`. Tab clicks update the URL via `history.replaceState()` so deep links (e.g. `/posts?view=calendar`) are honored. Domain-specific view components (`CalendarView`, `PostsKanbanView`, `PostsListView`) live flat in `src/`, not in `ui/`, since they contain business logic.
- **Campaign filter on Posts page**: A `Select` dropdown in the toolbar filters posts by `campaign_id`. Default "All campaigns" shows everything. The `Select` primitive in `ui/` is a native `<select>` styled to match `Input`.
- **Dashboard (Feature 3)**: Default landing page (`DEFAULT_VIEW = VIEWS.DASHBOARD` in `routes.js`). Fetches all data from `GET /api/dashboard` (single endpoint, 4 parallel queries server-side). Section components in `src/components/dashboard/` are self-contained — each receives its data array as a prop. DashboardView manages its own fetch lifecycle (loading/error/data) rather than relying on App.jsx centralized state. Legacy dashboard files (`DashboardWidgets.jsx`, `WeeklyFocusBanner.jsx`) are no longer imported but remain in the codebase.
- **`posts.updated_at` column**: Added via `ensureSchema()`. Nullable, defaults to `CURRENT_TIMESTAMP`. Used for ordering in the "Awaiting review" dashboard query.
- **Comments (Feature 4)**: Polymorphic `comments` table keyed by `(entity_type, entity_id)` — supports 'campaign' and 'post'. `CommentsThread` component (`src/components/CommentsThread.jsx`) self-fetches its data given `entityType` and `entityId` props. Uses optimistic updates for POST (append + reconcile) and DELETE (remove + restore on failure). Integrated at the bottom of `CampaignDetail.jsx` and `PostFormModal.jsx` (edit mode only).
- **Solo-user auth seam**: `SOLO_USER = { id: '1', name: 'Solo User' }` constant in `server.js` fills `author_id`/`author_name` on comment creation and checks ownership on delete. Client-side mirror in `CommentsThread.jsx`. Replace both with session lookup when real auth lands.
- **Textarea primitive**: `src/components/ui/Textarea.jsx` — styled `<textarea>` matching Input's ds-* tokens. Exported from `ui/index.js`. Existing inline textareas across the codebase have not been migrated yet.

## Principles (from roadmap)

- One feature, one branch, one PR. Don't chain features in one session.
- Never push directly to main from an agent session.
- Don't touch authentication, billing, or RLS policies without line-by-line human review.
- Update this file after every feature so context stays fresh.
