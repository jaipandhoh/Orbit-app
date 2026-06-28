# Feature 3: Dashboard Home Screen

## Context

Feature 2 shipped the 7-status workflow and the auto-follow-up
(`results_due_at` gets set on publish). The data is being captured
but isn't surfaced anywhere — Feature 3 is where the system pays off
by telling the user what needs them.

The Dashboard becomes the default landing page after the sidebar
loads. It's the "what needs me today" view that replaces the current
default (Campaigns).

## User-facing change

### New route and default

- New page at the route that corresponds to a new `VIEWS.DASHBOARD`
  in `src/routes.js`.
- Set as the default view in `App.jsx` (replaces Campaigns as the
  initial view on app load).
- Sidebar gets a new nav entry at the top: "Dashboard" with a
  layout/home icon (Lucide `LayoutDashboard` or `Home`).
- The sidebar nav order becomes:
  1. Dashboard (new, top)
  2. Campaigns
  3. Ideas
  4. Posts (formerly Calendar — already renamed in Feature 1)
  5. Contacts
  6. Outreach
  7. Coverage
  8. Reports

### Page layout

Match the visual pattern established by the Campaigns page:

- Page header: title "Dashboard" (30px, weight 700) + one-line
  description "Your PR command center." (14px, fg-muted)
- Right side of header: maybe a date display ("Saturday, June 27"),
  optional — agent's call. No search, no primary CTA — the
  Dashboard is informational.

### Four sections

Each section is its own component in `src/components/dashboard/`,
rendered in this order on the page. Each section has:

- A section header (16px, weight 600) with the section title
- An optional count badge next to the title (e.g. "Awaiting your
  review · 3")
- A body that's either a list/grid of items or an empty state
- A "View all" link on the right of the section header where it
  makes sense (e.g. "Active campaigns" links to /campaigns)

**Section 1: Due this week**
- Query: posts where `scheduled_at` falls in the next 7 days
  (inclusive of today)
- Group by day, ordered by `scheduled_at` ascending
- Each item shows: post content preview (truncated ~80 chars),
  platform icon, campaign name, the time of day
- Click → opens the post detail/edit modal
- Empty state: "No posts due this week — nice work."

**Section 2: Awaiting your review**
- Query: posts where `status = 'in_review'`
- Each item shows: content preview, platform, campaign, status pill,
  time since entering review (if trackable; if not, skip)
- Click → opens the post for review
- Empty state: "Nothing waiting on your review."

**Section 3: Results overdue**
- Query: posts where `status = 'published'` AND `results_due_at IS
  NOT NULL` AND `results_due_at < NOW()` — i.e. it's been 7+ days
  since publish and results haven't been logged
- Since results logging isn't built yet (Tier 2), "haven't been
  logged" just means the post hasn't been moved to status
  `reported` yet
- Each item shows: content preview, platform, campaign, days
  overdue (e.g. "2 days overdue")
- Click → opens the post; user manually moves it to `reported`
  when they've logged the results elsewhere
- Empty state: "All caught up on results."

**Section 4: Active campaigns**
- Query: campaigns where `status = 'active'`
- Each item is a small card showing:
  - Campaign name (bold)
  - Campaign description (truncated)
  - Progress bar showing `published posts / total posts`
  - Small text below the bar: "X of Y posts published"
- Click → opens the campaign detail page
- Empty state: "No active campaigns. Start one from the Campaigns
  page."

### Section layout on the page

- Sections 1-3 (post-focused) stacked vertically, each full-width
- Section 4 (campaign cards) is a horizontal grid (2 cards per row
  on desktop, 1 per row on mobile)
- Generous spacing between sections (32-48px)

## Data change

None structural. Queries only.

If a campaign-level "total posts" count isn't readily available,
compute it from a join or a subquery in the active campaigns query.

## Out of scope

- Customizable dashboard widgets / rearrangement
- "Assigned to me" filtering (solo user, no roles yet)
- Charts, trend graphs, time-series visualization
- Date range selectors
- A "snooze" or "dismiss" action on dashboard items
- Caching the dashboard data (fresh fetch on every load is fine for
  now)
- Real-time updates (no websockets, no polling beyond the initial
  load)
- The "results logging" feature itself — Section 3 just surfaces the
  overdue state; logging is a Tier 2 feature
- Mobile-optimized layout beyond "doesn't break on phone"

## Done when

1. Opening the app lands on the Dashboard, not Campaigns.
2. Sidebar shows Dashboard as the top nav item with a sensible icon.
3. All four sections render with correct data when there's data to
   show.
4. Each section has a friendly empty state that's not clinical.
5. Click-throughs work: dashboard items navigate to the right post,
   campaign, or modal.
6. The page loads in under 1 second on local dev.
7. No N+1 queries — each section uses a single efficient query.
8. The page works correctly when ALL sections are empty (a brand
   new install).
9. Section components live in `src/components/dashboard/` and each
   one is a self-contained file.
10. Visual style matches the Campaigns page pattern (header layout,
    typography, card styling).
11. CLAUDE.md is updated with the Dashboard page pattern, the
    section component architecture, and the rationale for it being
    the new default view.

## Approach for the agent

1. Read CLAUDE.md and the current codebase. Specifically look at:
   - How the Campaigns page is structured (this is the visual
     reference)
   - How existing routes/views work (App.jsx, routes.js, SidebarNav)
   - Whether there's a "campaign progress" or "posts count per
     campaign" query pattern already in use, or if it needs to be
     created
   - The existing API endpoints — do they already support the
     queries needed (date ranges on scheduled_at, status filtering),
     or are new endpoints needed?
2. Post a plan covering:
   - The four section queries (SQL or whatever the codebase pattern
     is)
   - Whether new API endpoints are needed, or existing GET endpoints
     suffice with client-side filtering
   - How the default view change is handled (App.jsx initial state,
     and what happens if the user navigates back to "/" — does that
     route to Dashboard now?)
   - Whether any backfill is needed (e.g. existing published posts
     with no `results_due_at` — these won't surface in Section 3,
     which is fine, but be explicit)
   - Component-by-component file plan
3. Wait for my approval.
4. Build order:
   - Routes + sidebar + default view change
   - DashboardView shell page
   - Each section component, in order 1→2→3→4
   - Empty states
   - CLAUDE.md update
5. Work on branch `feat/dashboard`. Open a PR when done.