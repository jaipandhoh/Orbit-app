# Orbit Roadmap & Strategic Direction

## What Orbit is

A PR campaign and content management tool for small teams (2-10 people)
who don't have separate PR and marketing headcount. The hybrid lane:
a PR campaign tool that a small team can also run their content
calendar from.

## Positioning

Not competing with Muck Rack head-on (enterprise PR, journalist database).
Not a generic content calendar like Later or Buffer.
The wedge: PR-first workflow with content-calendar usability, priced
and built for small teams.

## Current foundation (already built)

- Relational model: campaigns → posts → platforms → contacts
- Next.js + Supabase (Postgres)
- Basic CRUD on all four entities
- Deployed on Vercel

## The gap to close

Structure is right. What's missing is:
1. **Workflow density** — the system carrying work forward without
   someone remembering to (status transitions, follow-ups, reminders).
2. **Earned-media awareness** — knowing what landed, where, and with whom
   (coverage logging, contact outreach history, campaign-vs-goal reporting).

## Build sequence

### Tier 1 — Usability foundation (current focus)
The four features in `.claude/specs/`. Goal: turn Orbit from "a database
with screens" into "a tool a team opens every morning."

1. Calendar + Kanban views of posts
2. Status workflow (Idea → Approved → Drafting → In Review →
   Scheduled → Published → Reported) with auto follow-up on publish
3. Dashboard home screen ("what needs me today")
4. Comments on campaigns and posts

### Tier 2 — PR-specific differentiation (next)
- Coverage logging (outlet, URL, journalist, sentiment, reach)
- Media list builder (tag contacts, build campaign-specific lists)
- Press release / pitch composer with templates
- Outreach timeline per contact (last contacted, last response)

### Tier 3 — The "own twist" layer (later)
- Campaign narrative arc view (pre-launch → launch → sustaining → wrap)
- Performance scorecard tied to campaign goals
- AI-assisted features: draft press releases, generate pitch
  subject-line variants, summarize campaign results
- Whole-campaign templates (e.g. "product launch" creates campaign +
  8 posts + 3 pitch templates pre-filled)

## Principles to hold across all work

- One feature, one branch, one PR. Don't chain features in one session.
- Each feature spec has: user-facing change, data change, out of scope,
  done-when. If a feature takes more than two sessions, the spec was
  too big — split it.
- Never push directly to main from an agent session.
- Don't touch authentication, billing, or RLS policies without
  line-by-line human review.
- Update CLAUDE.md after every feature so context stays fresh.
- Keep a "noticed but not fixed" list during feature work; clean up
  in a dedicated PR, not mid-feature.

## Solo now, team later

Build for solo use first. Don't add roles/permissions complexity yet,
but don't make choices that will be expensive to reverse when a
second user joins (e.g., comments table should already have author_id
even though there's only one author today).
