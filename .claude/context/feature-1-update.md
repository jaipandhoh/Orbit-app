# Feature 1 Update: Posts Views (Calendar + Kanban)

## What we built

We added a Posts page to Orbit that lets you see all your posts in two different views: a **Calendar** (see posts laid out by date) and a **Board** (see posts grouped by their status). You can switch between them with a toggle at the top of the page.

---

## The five main pieces

### 1. The Posts page (`src/PostsView.jsx`)

This is a new wrapper component — think of it as the "shell" of the Posts page. It doesn't do much on its own except:
- Hold a piece of state called `mode` that tracks whether you're looking at the Calendar or the Board
- Render the Calendar / Board toggle buttons at the top
- Pass the right data down to whichever view is active

**Why a wrapper?** Because both the Calendar and the Board need the same data (your posts) but display it differently. The wrapper is the single place that decides which one to show.

---

### 2. Drag-to-reschedule in the Calendar (`src/CalendarView.jsx`)

The calendar already existed. We upgraded it with two things:

**Drag-to-reschedule:** You can now click and drag a post chip from one day to another. When you drop it, the app immediately moves it on screen (this is called an *optimistic update* — more on that below) and sends a request to the server to save the new date. If the server says something went wrong, the post snaps back to where it was and you see an error message.

**Platform colour accents:** Every post chip now has a coloured left border that tells you which platform it's for at a glance — sky blue for Twitter, blue for LinkedIn, pink for Instagram, indigo for Facebook.

**Library used:** We installed `@dnd-kit` — a drag-and-drop library for React. It handles all the browser complexity of tracking your mouse/finger, detecting which cell you dropped on, and rendering a floating "ghost" card while you drag. We configured it to work with both mouse (`PointerSensor`) and touch screens (`TouchSensor`).

---

### 3. The Kanban board for posts (`src/PostsKanbanView.jsx`)

This is a brand new component. It shows your posts sorted into three columns based on their status:

- **Draft** — posts you're working on
- **Scheduled** — posts with a scheduled date, ready to go out
- **Published** — posts that have gone live

You can drag a card from one column to another to update its status. Important: dragging in the Kanban *only* changes the status field. It doesn't automatically set a date or do anything else — that logic is saved for a future feature.

---

### 4. A new database column: `posts.status`

Before this feature, the `posts` table in the database had no concept of a post's stage in the workflow. We added a `status` column with three allowed values: `draft`, `scheduled`, `published`. New posts default to `draft`.

This column is added automatically when the server starts up — there's a line in `server.js` that runs `ALTER TABLE posts ADD COLUMN IF NOT EXISTS status ...`. The `IF NOT EXISTS` part means it only adds the column if it isn't already there, so running the server multiple times doesn't cause errors.

---

### 5. A new API endpoint: `PATCH /api/posts/:id`

An API endpoint is a URL on the server that the frontend can talk to. We already had:
- `GET /api/posts` — fetch all posts
- `POST /api/posts` — create a post
- `PUT /api/posts/:id` — update an entire post (used by the edit form)
- `DELETE /api/posts/:id` — delete a post

We added `PATCH /api/posts/:id`. The difference between `PUT` and `PATCH` is that `PUT` replaces the whole object (you have to send every field), while `PATCH` only updates the fields you send. This is perfect for drag-and-drop — when you drag a post to a new date you only want to update `scheduled_at`, not touch anything else.

---

## What "optimistic update" means

When you drag a post chip to a new day, the card moves instantly — you don't wait for the server to respond. This is called an optimistic update: the app *assumes* the server will say yes and updates the screen immediately. In the background it sends the request. If the server comes back with an error, the app reverts the card to its original position and shows you a toast notification. This makes the UI feel fast and responsive rather than laggy.

---

## Navigation changes

- The sidebar and top nav used to have a "Calendar" link. It now says "Posts" and takes you to the new Posts page.
- The code constant that represented this link was renamed from `VIEWS.CALENDAR` to `VIEWS.POSTS` everywhere in the codebase. Renaming it in one place (the `routes.js` file) meant we only had to update the other files to use the new name — the routes file is the single source of truth.

---

## Files changed at a glance

| File | What changed |
|------|-------------|
| `src/routes.js` | Renamed `CALENDAR` constant to `POSTS` |
| `src/components/TopNav.jsx` | Updated nav link to use `VIEWS.POSTS` |
| `src/components/SidebarNav.jsx` | Changed "Calendar" label to "Posts" |
| `src/utils.js` | Added a helper function that returns the right border colour for each platform |
| `src/CalendarView.jsx` | Added drag-to-reschedule + platform accent borders |
| `src/PostsView.jsx` | New file — the Posts page wrapper with view switcher |
| `src/PostsKanbanView.jsx` | New file — the Kanban board for posts |
| `src/App.jsx` | Wired up the new Posts page; added `handlePatchPost` function |
| `server.js` | Added the `posts.status` database migration + `PATCH` endpoint |

---

## What's intentionally NOT done yet

- Dragging a post to the "Published" column does **not** automatically set a published date. That belongs to Feature 2 (status workflow), which will own all the rules around what happens when a status changes.
- The status list is short on purpose — just `draft`, `scheduled`, `published` for now. Feature 2 will expand it to the full workflow: Idea → Approved → Drafting → In Review → Scheduled → Published → Reported.
