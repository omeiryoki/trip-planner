# Trip Planner

Vite + HTML/CSS + vanilla JavaScript trip planning app. See `openspec/changes/trip-planner-app/` for the full proposal, specs, design, and task list this was built from.

Destinations and places to visit are entered manually (no Google Maps/Places dependency). Sign-in is email/password via Supabase Auth.

## Local development

```bash
npm install
cp .env.example .env   # then fill in the values below
npm run dev
```

## One-time account setup

### 1. Supabase (auth + database) - required

1. Create a project at supabase.com.
2. In the SQL editor, run [`supabase/schema.sql`](supabase/schema.sql) to create the tables, RLS policies, and the `find_user_id_by_email` function used for sharing trips by email.
3. Email/password sign-in is enabled by default under **Authentication > Providers > Email**. Optionally disable "Confirm email" there for faster local testing.
4. Copy **Project URL** and **anon public key** from Settings > API into `.env` as `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.

### 2. Exchange rate API - optional, works out of the box

Currency conversion uses [Frankfurter](https://frankfurter.dev) by default (free, no API key). Leave `VITE_EXCHANGE_RATE_API_URL` / `VITE_EXCHANGE_RATE_API_KEY` blank unless you want a different provider that returns the same `{ rates: { "USD": 1, "THB": 36.1, ... } }` shape for a `?base=<currency>` query.

## What's implemented vs. what needs your credentials to verify live

All features are implemented in code (see `src/`). Manual verification against real services (real Supabase writes/sharing across two accounts) requires the account setup above and hasn't been performed here. Task 10.3 in `tasks.md` is the checklist for that end-to-end pass once your `.env` is filled in.

## Deferred: Google Maps Platform / Google Calendar integration

The original design included Google Places recommendations, Google Directions-based travel cost estimates, Google Calendar export, and Google sign-in. These were removed for now to avoid depending on Google Cloud setup while the app is still being built out. See `openspec/changes/trip-planner-app/proposal.md` and `design.md` for what was dropped and why; re-adding them later is a matter of restoring that integration code, not redesigning the app.
