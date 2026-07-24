# Home Dashboard

Personal dashboard, phase 1: tracks the St. Louis Cardinals' four full-season
minor-league affiliates (Palm Beach, Peoria, Springfield, Memphis), shows the
most recent completed game's box score, highlights any tracked prospect's
stat line, and emails a daily digest.

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Editing the tracked prospect list

Edit `data/prospects.json`. Each entry needs an MLB.com "person id", which you
can find by searching `https://statsapi.mlb.com/api/v1/people/search?names=First%20Last`
in a browser, or by browsing a team's roster at
`https://statsapi.mlb.com/api/v1/teams/{teamId}/roster?rosterType=fullSeason`.

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
   Vercel auto-detects Next.js — just click Deploy.
3. **Resend** — sign up at resend.com (free tier). Grab an API key from
   resend.com/api-keys. For a quick start you can send from
   `onboarding@resend.dev` without verifying a domain; to send from your own
   address, verify a domain under Resend's Domains section.
4. **Environment variables** — in the Vercel project's Settings → Environment
   Variables, add `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_TO`, and
   `CRON_SECRET` (any random long string you make up) using the values from
   `.env.local.example` as a guide. Redeploy after adding them.
5. **Cron** — `vercel.json` already defines a daily cron at 12:00 UTC
   (~8am ET, shifts by an hour across daylight saving). Vercel picks this up
   automatically on deploy — check Project → Cron Jobs in the dashboard to
   confirm it's scheduled.

## Manually triggering the email (for testing)

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://your-app.vercel.app/api/cron/daily-digest
```
