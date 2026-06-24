# Feature 4: Comments on campaigns and posts

## User-facing change

A comments thread at the bottom of every campaign detail page and
every post detail page.

- Text input + submit button at the bottom of the thread.
- Each comment shows author name, body, and a relative timestamp
  ("2 hours ago").
- A delete button appears on comments authored by the current user.
- Comments are flat (no threading) and plain text (no rich
  formatting).

## Data change

New table `comments`:

- `id` (uuid, primary key)
- `entity_type` (text, check constraint: 'campaign' or 'post')
- `entity_id` (uuid, references the appropriate table)
- `author_id` (uuid, references auth.users)
- `body` (text, not null, length-limited e.g. 5000 chars)
- `created_at` (timestamptz, default now())

RLS policies:
- Anyone authenticated in the workspace can SELECT and INSERT.
- Only the author can DELETE their own comment.
- No UPDATE for now (no editing).

## Out of scope

- @mentions
- Notifications (in-app or email)
- Rich text / markdown
- Attachments or images
- Threading / replies
- Editing existing comments
- Reactions / emoji

## Done when

- I can post a comment on a campaign and see it appear in the thread.
- I can post a comment on a post and see it appear in the thread.
- I can delete my own comments.
- I cannot delete others' comments (verified by attempting via API).
- Comments persist across refresh.
- Empty state shows: "No comments yet. Start the conversation."

## Approach notes for the agent

- This feature is independent of Features 1-3 and can be built in
  parallel with Feature 3 if desired.
- Author info should already have `author_id` even though only one
  user exists today — don't hardcode or skip it.
- Write the RLS policies carefully and have me review them before
  applying. RLS bugs are silent and dangerous.