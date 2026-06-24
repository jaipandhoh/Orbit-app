# Feature 2: Status workflow with auto follow-up

## User-facing change

Status is now a proper enum with a fixed order:
**Idea → Approved → Drafting → In Review → Scheduled → Published → Reported**

- On a post detail page, status shows as a stepper or pill group
  reflecting the order.
- When status changes to "Published," a toast appears: "We'll
  remind you to log results in 7 days."
- A follow-up reminder is created automatically (visible later in
  the dashboard's "Results overdue" section, Feature 3).

## Data change

- Migrate `posts.status` from string to a Postgres enum (or typed
  string with CHECK constraint — agent's call, justify in plan).
- Add `posts.published_at` (timestamptz, nullable).
- Add `posts.results_due_at` (timestamptz, nullable). Set
  automatically to `published_at + interval '7 days'` when status
  transitions to Published.
- Migration must preserve existing rows: map current string values
  to the new enum sensibly. If any current value doesn't map cleanly,
  surface it in the plan before migrating.

## Out of scope

- Email or Slack notifications (in-app only)
- Custom workflows per campaign
- Approval gates that block transitions
- Audit log of who changed what when (future feature)
- Backfilling published_at for already-published posts (just set it
  for new transitions going forward)

## Done when

- I can move a post through every status in the UI.
- Database constraint prevents invalid status values.
- Marking a post Published sets `published_at` to now() and
  `results_due_at` to now() + 7 days.
- The status enum is defined in one place in code and imported
  everywhere it's used (including Feature 1's Kanban columns).
- Migration is reversible (has a down migration).
- No existing posts were lost or corrupted by the migration.

## Approach notes for the agent

- Write the Supabase migration first. Show me the migration SQL in
  the plan before applying.
- After migration design is approved, update TypeScript types, the
  Kanban columns from Feature 1, and any forms or filters that
  reference status.
- Post the plan and wait for approval before running the migration.
