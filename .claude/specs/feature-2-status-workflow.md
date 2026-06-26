# Feature 2: Status Workflow with Auto Follow-up

## Context

Feature 1 shipped a 3-status Kanban (draft, scheduled, published).
Feature 2 expands this to the full 7-status workflow and adds the
auto-follow-up mechanic that makes the system carry work forward
on its own.

Solo dev environment — no production data to preserve. Existing
status values can be remapped lossy.

## User-facing change

### Status workflow

Posts move through 7 statuses in this fixed order:

1. **Idea** — captured but not committed
2. **Approved** — committed to the campaign, ready to draft
3. **Drafting** — being written
4. **In Review** — drafted, awaiting approval
5. **Scheduled** — approved and slated for a publish date
6. **Published** — out in the world
7. **Reported** — results logged, campaign-relevant data captured

### Kanban view (updated)

- Seven columns, in the order above.
- Each column header uses `StatusPill` with the status color/dot.
- Drag a card between columns to update status (existing behavior,
  more columns).
- Column horizontal scroll: the Kanban container scrolls
  horizontally on smaller viewports rather than wrapping. Each
  column has a min-width that keeps cards readable.

### Status display on post detail

On a post detail page (or modal), show status as a small stepper or
labeled pill group reflecting the order — not a raw dropdown. User
can click the next status forward (most common) or open a menu for
any status.

### Auto follow-up on Publish

When a post transitions to **Published**:

- A toast appears: "Published. We'll remind you to log results in 7
  days."
- `posts.published_at` is set to `now()` (if not already set).
- `posts.results_due_at` is set to `published_at + interval '7 days'`.

These reminders will surface on the Dashboard (Feature 3) under
"Results overdue." For Feature 2, the data needs to be populated
correctly even though the Dashboard view doesn't exist yet.

### Reverting from Published

If a user moves a post from Published back to an earlier status
(unlikely but possible), clear `results_due_at` but leave
`published_at` set. Don't re-trigger the toast on subsequent
Published transitions if `published_at` is already set within the
last 24 hours (prevents double-firing on drag-mistake-redrag).

## Data change

### Schema (in `server.js` `ensureSchema()`)

Update the CHECK constraint on `posts.status`:

```sql
-- Drop the old constraint
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_status_check;

-- Reset any existing status values to safe defaults (lossy by design)
UPDATE posts SET status = 'idea' WHERE status NOT IN (
  'idea', 'approved', 'drafting', 'in_review',
  'scheduled', 'published', 'reported'
);

-- Add the new constraint
ALTER TABLE posts ADD CONSTRAINT posts_status_check CHECK (
  status IN (
    'idea', 'approved', 'drafting', 'in_review',
    'scheduled', 'published', 'reported'
  )
);

-- Change the default
ALTER TABLE posts ALTER COLUMN status SET DEFAULT 'idea';

-- Add new timestamp columns if not present
ALTER TABLE posts ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS results_due_at TIMESTAMPTZ;
```

Mapping for any existing dev data:
- `draft` → `idea`
- `scheduled` → `scheduled` (no change)
- `published` → `published` (no change)

The `UPDATE` statement above handles anything else by defaulting to
`idea`.

### PATCH endpoint

The existing PATCH `/api/posts/:id` already accepts `status`,
`scheduled_at`, `published_at`. Add server-side logic on the status
transition:

- When the incoming patch sets `status = 'published'` AND the post's
  current `published_at` is null (or older than 24 hours):
  - Set `published_at = now()` in the same update
  - Set `results_due_at = now() + interval '7 days'`
- When the incoming patch sets `status` to anything other than
  `published` AND `results_due_at` is currently set:
  - Clear `results_due_at`
  - Leave `published_at` as-is

Do this server-side, not client-side. The client just sends
`{ status: 'published' }` and the server fills in the rest.

### Status enum constant

The status list must be defined in ONE place in the codebase and
imported everywhere it's used (Kanban columns, status pill mapping,
filter dropdowns, type definitions if TypeScript).

Suggested location: `src/constants/postStatus.js` (or wherever the
codebase pattern puts shared constants).

Structure:

```js
export const POST_STATUSES = [
  { value: 'idea',       label: 'Idea',       color: 'gray' },
  { value: 'approved',   label: 'Approved',   color: 'blue' },
  { value: 'drafting',   label: 'Drafting',   color: 'amber' },
  { value: 'in_review',  label: 'In Review',  color: 'purple' },
  { value: 'scheduled',  label: 'Scheduled',  color: 'sky' },
  { value: 'published',  label: 'Published',  color: 'green' },
  { value: 'reported',   label: 'Reported',   color: 'slate' },
];

export const POST_STATUS_VALUES = POST_STATUSES.map(s => s.value);
```

`StatusPill` should accept a status value and look up label/color
from this constant — no hardcoded mapping inside the component.

## Out of scope

- The Dashboard view itself (Feature 3 — it queries the
  `results_due_at` field but doesn't get built here)
- Email or Slack notifications (in-app toast only for now)
- Custom workflows per campaign
- Approval gates that block transitions (any status can move to any
  other status freely — the order is suggestive, not enforced)
- Audit log of who changed status when
- Backfilling `published_at` for any existing rows with
  `status = 'published'` (it'll just stay null; surfaces correctly
  in the Dashboard as "no `results_due_at` set" which is treated as
  "not overdue")
- Updating the campaign-level status (campaigns have their own
  status field used on the Campaigns page; leave it alone)
- Adding `idea` and `reported` filters to the Campaigns page tabs
  (Campaigns tabs are for campaign status, not post status — they're
  different things)

## Done when

1. `posts.status` accepts all 7 values; the database constraint
   prevents anything else.
2. Default for new posts is `idea`.
3. The status constant is defined in one place and imported
   everywhere it's referenced.
4. Kanban view shows 7 columns in the correct order with horizontal
   scroll on narrow viewports.
5. `StatusPill` renders correctly for all 7 statuses with distinct
   colors and labels.
6. Dragging a card to "Published" triggers the toast, sets
   `published_at`, and sets `results_due_at = published_at + 7
   days` — verified by inspecting the database row directly.
7. Dragging a card from Published to another status clears
   `results_due_at` but preserves `published_at`.
8. Dragging Published → other → Published again within 24 hours
   does NOT re-fire the toast.
9. The post detail / edit modal shows the new statuses in its
   dropdown.
10. PostsListView's status column renders the new labels correctly.
11. Existing PostFormModal continues to work — its status dropdown
    pulls from the constant.
12. `npm run build` succeeds with no warnings.
13. CLAUDE.md is updated: documents the status constant location,
    the 7-status order, the auto-follow-up server logic, and the
    "Feature 3 Dashboard reads `results_due_at`" expectation.

## Approach for the agent

1. Read CLAUDE.md and the codebase. Find all current references to
   the 3 status values (`draft`, `scheduled`, `published`) — Kanban
   columns, StatusPill, filter dropdowns, PostFormModal, server.js,
   etc. List them in the plan.
2. Post a plan covering:
   - The full list of files that reference status values today
   - Where the status constant will live and how it'll be imported
   - The migration SQL (verify it matches the spec)
   - The server-side PATCH logic for the auto-follow-up
   - The Kanban horizontal scroll approach (CSS overflow vs.
     virtualized — should be plain CSS for 7 columns; no need to
     get fancy)
   - The toast library/component being used (check if one already
     exists in the codebase; if not, propose a small inline toast
     pattern rather than adding a library)
   - Any UI changes needed beyond the column count (status pill
     color choices, post detail stepper if building it)
3. Wait for my approval.
4. Build order: constant → schema/server → StatusPill update →
   Kanban → PostFormModal → PostsListView → toast wiring →
   CLAUDE.md.
5. Work on branch `feat/status-workflow`. Open a PR when done — do
   not merge to main.
   