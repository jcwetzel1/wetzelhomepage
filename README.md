# Home Dashboard

Personal dashboard. First section: **Baseball → Minor League Scores**, tracking
the St. Louis Cardinals' four full-season minor-league affiliates (Palm Beach,
Peoria, Springfield, Memphis). Shows recent box scores (archived permanently
as they're fetched), highlights any tracked prospect's stat line, and emails a
daily digest. **Baseball → Top Prospects** is an in-page editor for the
tracked player list.

Left sidebar holds top-level subject areas (just "Baseball" today — future
areas like a watch tracker get added there without restructuring anything).
Each subject has its own top tab bar for its pages.

## Database required

The prospect list and game archive live in Postgres — there's no local
fallback, so the app needs a real database connection even for local dev.

1. Create a **Vercel** account and project (see Deploying below), then in the
   project go to **Storage → Create Database → Neon** (Vercel's native
   Postgres integration). This is included free on Vercel's Hobby plan — no
   separate signup.
2. Once created, copy its `DATABASE_URL` connection string into `.env.local`
   (copy `.env.local.example` to `.env.local` first).
3. Run `scripts/schema.sql` once against that database — easiest way is
   pasting it into the **Query** tab Vercel shows for the database. It creates
   the tables and seeds the initial ~53-player prospect list.

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000 (redirects to `/baseball/scores`).

## Editing the tracked prospect list

Use the **Top Prospects** tab in the app itself — add a name, then click
"Look up ID" to auto-resolve their MLB person id (or type one in directly if
you already know it, e.g. from
`https://statsapi.mlb.com/api/v1/people/search?names=First%20Last`). A blank
MLB ID just means that player won't be matched against box scores yet.

## Deploying (first time)

1. **GitHub** — create a free account at github.com if you don't have one,
   then create a new empty repository (no README/license). Push this folder:
   ```bash
   git init
   git add .
   git commit -m "Initial dashboard"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```
2. **Vercel** — sign up at vercel.com (you can sign up with your GitHub
   account), click "Add New Project", and import the repo you just pushed.
   Vercel auto-detects Next.js — just click Deploy. Then set up Postgres as
   described above (Storage tab); Vercel auto-injects `DATABASE_URL` into the
   deployed app, so you only need to add it manually to your local
   `.env.local`.
3. **Resend** — sign up at resend.com (free tier). Grab an API key from
   resend.com/api-keys. For a quick start you can send from
   `onboarding@resend.dev` without verifying a domain; to send from your own
   address, verify a domain under Resend's Domains section.
4. **Environment variables** — in the Vercel project's Settings → Environment
   Variables, add `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_TO`, and
   `CRON_SECRET` (any random long string you make up) using the values from
   `.env.local.example` as a guide. `DATABASE_URL` should already be there
   from creating the database. Redeploy after adding them.
5. **Cron** — `vercel.json` already defines a daily cron at 12:00 UTC
   (~8am ET, shifts by an hour across daylight saving). Vercel picks this up
   automatically on deploy — check Project → Cron Jobs in the dashboard to
   confirm it's scheduled.

## Manually triggering the email (for testing)

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://your-app.vercel.app/api/cron/daily-digest
```
