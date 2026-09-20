# Trip Planner

Vite + HTML/CSS + vanilla JavaScript trip planning app. See `openspec/changes/trip-planner-app/` for the full proposal, specs, design, and task list this was built from.

## Local development

```bash
npm install
cp .env.example .env   # then fill in the values below
npm run dev
```

## One-time account setup (required before the app is fully functional)

These steps use your own accounts and cannot be done from this repo alone.

### 1. Supabase (auth + database)

1. Create a project at supabase.com.
2. In **Authentication > Providers**, enable **Google** and follow Supabase's guide to configure it with a Google OAuth client (Web application type) from Google Cloud Console. Set the authorized redirect URI to the one Supabase shows on that page.
3. In the SQL editor, run [`supabase/schema.sql`](supabase/schema.sql) to create the tables, RLS policies, and the `find_user_id_by_email` function used for sharing trips by email.
4. Copy **Project URL** and **anon public key** from Settings > API into `.env` as `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.

### 2. Google Maps Platform (places, directions)

1. In Google Cloud Console, enable: **Maps JavaScript API**, **Places API**, **Directions API**, **Distance Matrix API**.
2. Create an API key, then restrict it: HTTP referrers = your app's domain(s), API restrictions = the four APIs above.
3. Set a budget alert (Billing > Budgets & alerts) so unexpected usage doesn't go unnoticed.
4. Put the key in `.env` as `VITE_GOOGLE_MAPS_API_KEY`.

### 3. Google Calendar export (separate OAuth client)

Calendar export needs its own OAuth client because it requests a scope (`calendar.events`) that the Supabase sign-in above does not grant (see `openspec/changes/trip-planner-app/design.md`, Decision 3).

1. In Google Cloud Console > Credentials, create an **OAuth 2.0 Client ID** (Web application), with your app's origin under "Authorized JavaScript origins".
2. Put the client ID in `.env` as `VITE_GOOGLE_CALENDAR_CLIENT_ID`.

### 4. Exchange rate API

Pick a provider (e.g. exchangerate.host, exchangerate-api.com) that returns a JSON `{ rates: { "USD": 1, "THB": 36.1, ... } }` shape for a `?base=<currency>` query. Put its base URL and key (if any) in `.env` as `VITE_EXCHANGE_RATE_API_URL` / `VITE_EXCHANGE_RATE_API_KEY`.

## What's implemented vs. what needs your credentials to verify live

All features from the spec are implemented in code (see `src/`). Manual verification against real services (real Google sign-in, real Supabase writes, real Maps/Calendar data, the Cloud Console budget alert) requires the account setup above and hasn't been performed here, since it depends on credentials only you can create. Task 10.3 in `tasks.md` is the checklist for that end-to-end pass once your `.env` is filled in.
