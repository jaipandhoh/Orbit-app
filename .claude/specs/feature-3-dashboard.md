# Feature 3: Dashboard home screen

## User-facing change

A new page at `/dashboard`, set as the default route after login.

Four sections, in this order:

1. **Due this week** — posts scheduled in the next 7 days, grouped
   by day. Click a post to open it.
2. **Awaiting your review** — posts currently in "In Review" status.
3. **Results overdue** — posts where status is "Published" and
   `results_due_at` is in the past, and no results have been logged.
   (For now, "no results logged" just means the field is empty; we'll
   formalize results-logging in a later feature.)
4. **Active campaigns** — campaigns with status "active," each with
   a small progress bar showing published posts / total posts.

Empty states should be friendly and encouraging, not clinical.
Examples: "No posts due this week — nice work." "Nothing waiting on
your review." "All caught up on results."

## Data change

None structural. Queries only.

## Out of scope

- Customizable / rearrangeable dashboard widgets
- Multi-user "assigned to me" filtering (solo user for now)
- Charts or trend graphs
- Date range selectors

## Done when

- Opening the app lands on `/dashboard` after login.
- All four sections render with correct data.
- Each section has a thoughtful empty state.
- Clicking any item navigates to the right post or campaign.
- Page loads in under 1 second on local dev.
- No N+1 queries — each section uses a single efficient query.

## Approach notes for the agent

- Use server components and Supabase queries. No client-side
  fetching for initial load.
- Each section should be its own component so they can be rearranged
  later.
- Use Suspense boundaries so slow sections don't block fast ones.
- Depends on Feature 2 being merged (needs the status enum and
  `results_due_at` field). Do not start until Feature 2 is in main.
