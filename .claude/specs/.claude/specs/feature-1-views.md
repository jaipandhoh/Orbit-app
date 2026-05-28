# Feature 1: Calendar + Kanban views for posts

## User-facing change

On the posts page, add a view-switcher (List / Calendar / Kanban) at
the top.

- **List view** — existing behavior, unchanged.
- **Calendar view** — monthly grid showing posts on their scheduled
  date. Color-coded by platform. Click a post to open its detail page.
  Drag a post to a different date to reschedule it.
- **Kanban view** — columns by status (Idea, Approved, Drafting,
  In Review, Scheduled, Published, Reported). Drag a card between
  columns to update its status.

View choice persists in the URL as a query param (`?view=kanban`) so
views are shareable and bookmarkable.

## Data change

No new tables.

- Dragging in Kanban updates `posts.status`.
- Dragging in Calendar updates `posts.scheduled_date`.
- Both updates via Supabase, optimistic on the client.

## Out of scope

- Multi-select / bulk operations
- Recurring posts
- Custom statuses per campaign
- Week/day calendar views (monthly only for now)
- Filters beyond a simple campaign dropdown
- Keyboard shortcuts

## Done when

- I can switch between List, Calendar, and Kanban views.
- The view choice is reflected in the URL.
- In Kanban, I can drag a post from "Drafting" to "In Review" and
  the change persists after refresh.
- In Calendar, I can drag a post from one date to another and the
  change persists after refresh.
- Drag-and-drop works on touch devices (test on phone).
- Updates are optimistic — cards move immediately, sync to server
  in the background.
- The existing List view continues to work unchanged.
- Loading states and empty states exist for each view.

## Approach notes for the agent

- Use `@dnd-kit/core` for drag-and-drop (lightweight, RSC-compatible).
- For Calendar, choose between `react-big-calendar` and a custom
  Tailwind grid. Justify the choice in the plan before implementing.
- Status enum should be defined in ONE place and imported wherever
  used. If you see the status list duplicated, refactor.
- Before writing code, post a plan covering: library choices, state
  management (URL param strategy), any schema changes. Wait for
  approval.
