# Feature 4: Comments on Campaigns and Posts

## Context

The last Tier 1 feature. Comments are independent of Features 1-3
and small in scope. The goal is to lay down the foundation for team
collaboration even though Orbit is solo-use today — so when a second
user joins, comments already work correctly per-author.

## User-facing change

A comments thread appears at the bottom of:

- Every campaign detail page (`CampaignDetail.jsx`)
- Every post detail / edit view (`PostFormModal.jsx`)

Each thread shows:

- A list of existing comments, oldest at top, newest at bottom
- Each comment: author avatar + name, relative timestamp ("2 hours
  ago"), the comment body
- A small delete button (trash icon, ghost variant) visible only on
  the current user's own comments, on hover
- An input area at the bottom: text field + submit button
- Submit on Enter (Shift+Enter for newline)
- Empty state when there are no comments yet: "No comments yet.
  Start the conversation."

Comments are plain text only — no markdown, no @mentions, no
attachments, no editing. Pure flat thread.

## Data change

### New table

```sql
CREATE TABLE IF NOT EXISTS comments (
  comment_id SERIAL PRIMARY KEY,
  entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('campaign', 'post')),
  entity_id INTEGER NOT NULL,
  author_id INTEGER NOT NULL,
  author_name VARCHAR(255) NOT NULL,
  body TEXT NOT NULL CHECK (length(body) > 0 AND length(body) <= 5000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS comments_entity_idx
  ON comments (entity_type, entity_id, created_at);
```

Notes on the schema:

- `author_id` and `author_name` are both stored. Solo-user-today
  means there's effectively one author, but storing the name
  denormalized avoids a join on every read and survives the user
  table changing later. When a real user system exists, the
  denormalized name can stay as a snapshot.
- `entity_id` is a plain integer with no foreign key constraint
  because it points at either `posts.post_id` or `campaigns.campaign_id`
  depending on `entity_type`. This polymorphic pattern is fine for
  this scale; a "real" version would have separate
  `post_comments` and `campaign_comments` tables or a constrained
  table-per-entity-type. Don't optimize for that now.
- `body` is text-limited at 5000 chars at the DB level. The client
  should also limit it.
- The index covers the most common query: "give me all comments
  for this entity, oldest first."

### API endpoints

Four new endpoints:

- `GET /api/comments?entity_type=X&entity_id=Y` — list comments for
  a given entity, ordered by `created_at ASC`
- `POST /api/comments` — create a comment. Body:
  `{ entity_type, entity_id, body }`. Server fills in `author_id`,
  `author_name`, `created_at`.
- `DELETE /api/comments/:id` — delete a comment. Server-side check:
  the requesting user's `author_id` must match the comment's
  `author_id`, otherwise return 403.

No PATCH/PUT — comments aren't editable in this version.

### Solo-user author handling

Since there's no auth/users system yet, the server should:

- Use a hardcoded constant for the current user (e.g.
  `CURRENT_USER = { id: 1, name: 'Solo User' }` or pull from
  somewhere the rest of the app uses, if it exists)
- Apply this constant when filling `author_id` and `author_name`
  on POST
- Use this constant when checking ownership for DELETE

This intentionally creates a clean seam for a future auth system —
when you add real users, only the constant has to be replaced with
session lookup.

If the codebase already has a "current user" concept anywhere
(check App.jsx, server.js), reuse it instead of creating a new one.

## Out of scope

- @mentions and any mention-resolution
- Notifications (in-app, email, anywhere)
- Rich text, markdown, attachments, images, links beyond plain text
- Threading or replies
- Editing comments
- Reactions or emoji responses
- Real-time updates / live-refresh of the thread when others post
- Pagination of long threads (assume <100 comments per entity for
  Tier 1 — fetch all)
- Authentication or user management (uses the solo-user constant)
- Permissions beyond "author can delete their own comment"
- A dedicated comments view or feed elsewhere in the app

## Done when

1. The `comments` table exists with the schema above, and the
   index is created. Verify with `\d comments` in psql.
2. All four endpoints work and return correct data.
3. POSTing a comment without `body`, with an empty `body`, or with
   a body over 5000 chars returns a 400.
4. DELETEing someone else's comment (when a future second user
   exists) would return 403 — verify the check is present in code
   even if it can't be tested with one user.
5. Campaign detail page shows the comments thread at the bottom.
6. Post detail/edit modal shows the comments thread at the bottom.
7. I can post a comment on a campaign and see it appear immediately.
8. I can post a comment on a post and see it appear immediately.
9. I can delete my own comments.
10. The thread shows oldest at top, newest at bottom, scrolls to
    the latest comment after posting.
11. Empty state shows when there are no comments.
12. Submit on Enter works; Shift+Enter creates a newline.
13. Visual style matches the design system: Card primitive for the
    thread wrapper, Avatar primitive for author avatars, Button
    primitive for submit, Input primitive (or Textarea variant) for
    the input.
14. CLAUDE.md is updated: documents the comments schema, the
    polymorphic entity_id pattern, the solo-user seam for auth, and
    the location of the CommentsThread component.

## Approach for the agent

1. Read CLAUDE.md and the codebase. Specifically check:
   - Whether a CommentsThread or similar component already exists
   - Whether there's a "current user" concept anywhere
   - The pattern for new tables in `ensureSchema()`
   - The structure of `CampaignDetail.jsx` and `PostFormModal.jsx`
     (where to drop the thread in each)
   - Whether the design system has a Textarea variant of Input, or
     if Input needs extending (or if a new Textarea primitive is
     warranted)
2. Post a plan covering:
   - Schema confirmation (the SQL above, verified against existing
     ensureSchema pattern)
   - Where the solo-user constant lives (new constant file, or
     reuse if found)
   - The CommentsThread component plan: location, props, internal
     state (does it fetch its own data on mount, or does the parent
     pass comments in?)
   - Whether you'll add a Textarea primitive to `ui/`, or use Input
     with multiline behavior, or roll a one-off styled textarea in
     CommentsThread
   - Integration into CampaignDetail and PostFormModal — where in
     the existing layout the thread goes
3. Wait for my approval.
4. Build order:
   - Schema + endpoints
   - Solo-user constant (if not reused)
   - CommentsThread component (with skeleton loading + empty state)
   - Integration into CampaignDetail
   - Integration into PostFormModal
   - CLAUDE.md update
5. Work on branch `feat/comments`. Open a PR when done.