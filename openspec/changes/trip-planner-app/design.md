# Design

## Context

See proposal.md - Why/What Changes for motivation and scope. Key constraints:
- Frontend is Vite + HTML/CSS + vanilla JS only - no UI framework (no React/Vue/etc).
- Greenfield project - no existing code, specs, or data to migrate.
- Three external service families are involved: Supabase (auth + data), Google Maps Platform (places, directions), Google Calendar API (export), plus a currency exchange-rate API.

## Goals / Non-Goals

**Goals:**
- Define the module structure for a framework-less Vite app that stays maintainable as features grow.
- Define the data model in Supabase Postgres backing trips, itineraries, and sharing.
- Define how the app talks to Google Maps Platform, Google Calendar, and the exchange-rate API, and where API keys live.
- Define the approach for drag-and-drop calendar scheduling without a framework.

**Non-Goals:**
- Server-side rendering or a custom backend service - Supabase is the only backend.
- Offline support / PWA behavior.
- Payment processing - the app estimates costs, it does not handle real transactions.
- Native mobile apps - "responsive" here means a single responsive web app, not separate mobile builds.

## Decisions

### 1. Supabase for auth + data, no custom backend
Use Supabase Auth (Google OAuth provider) for sign-in and Supabase Postgres (via `@supabase/supabase-js` from the browser, protected by Row Level Security) for storing trips, itinerary items, and shares.
- **Alternative considered**: Firebase (Auth + Firestore) - comparable fit, but Postgres/RLS gives more natural relational modeling for trips → destinations → itinerary items → travel legs, and simpler cost-aggregation queries.
- **Alternative considered**: custom Node/Express backend - rejected; adds a service to build, deploy, and secure for no benefit over Supabase's built-in auth + RLS for this app's needs.

### 2. Google Maps Platform for places and directions
Use the Places API for nearby attractions/restaurants/hotels and the Directions/Distance Matrix API for route suggestions and cost estimation between itinerary stops, called directly from the client with a key restricted (HTTP referrer + API restrictions) in Google Cloud Console.
- Cost estimates for private vehicles are derived from distance (Distance Matrix) combined with a configurable fuel-cost-per-distance assumption, since Google does not return a monetary driving cost. Public-transit cost is taken from Directions API fare data where available, otherwise flagged as unavailable per Requirement "No route available" / cost scenarios in `travel-directions`.
- **Alternative considered**: a routing-only open-source stack (e.g. OSRM + OpenStreetMap data) - rejected; would require self-hosting and lacks place recommendation data, and Google Maps/Calendar integration was already required for export.

### 3. Google Calendar export via a second, separate OAuth consent
Google Calendar export requires the `https://www.googleapis.com/auth/calendar.events` scope, which Supabase's default Google sign-in does not request (Supabase Auth is for identity, not for granting arbitrary Google API scopes). Design: request Calendar access as a separate, explicit Google OAuth step (Google Identity Services token flow) only when the user first uses "Export to Google Calendar", store nothing beyond the short-lived access token in memory, and re-prompt when it expires.
- **Alternative considered**: request the Calendar scope during the initial Supabase sign-in - rejected; it would force every user through an extra consent screen and a broader permission grant just to sign in, even if they never use export.

### 4. Currency conversion via a rates cache, not per-request calls
Fetch exchange rates from a public exchange-rate API on a timer (e.g. hourly) and cache the latest rates client-side (in memory + `localStorage` fallback with a timestamp), converting costs locally against the cached rates. This satisfies the `currency-conversion` spec's "current exchange rate" requirement while avoiding a network call per displayed cost.
- **Alternative considered**: convert server-side via a Supabase Edge Function - deferred; adds infra for no correctness benefit since rates only need hourly freshness, not per-request accuracy.

### 5. Framework-less calendar drag-and-drop
Implement itinerary-to-calendar scheduling using the native HTML5 Drag and Drop API (`draggable`, `dragstart`/`dragover`/`drop` events) plus a small custom module for reordering within a day, rather than pulling in a drag-and-drop library, to honor the "no framework" constraint while keeping the dependency footprint minimal. A lightweight, framework-agnostic library (e.g. SortableJS) may be used if native DnD proves insufficient for touch devices, since it does not conflict with the "no framework" constraint (it is a small utility, not a UI framework).

### 6. State management: plain JS modules + custom events
No framework means no built-in reactivity. Use a small set of plain JS modules holding trip state (destinations, itinerary, budget, currency) that emit `CustomEvent`s on change; UI modules subscribe and re-render the DOM sections they own. Keeps the app debuggable without adopting a reactive framework.

### 7. Responsive layout
CSS Grid/Flexbox with a mobile-first stylesheet and breakpoints for tablet and desktop; the calendar view collapses from a multi-column week/day grid on desktop to a single-column agenda list on mobile.

## Data Model (Supabase Postgres, high level)

- `trips`: id, owner_id (auth.users), name, start_date, end_date, display_currency, traveler_count
- `trip_collaborators`: trip_id, user_id, role (`viewer`/`editor`)
- `destinations`: id, trip_id, name, granularity (`place`/`city`/`province`/`country`), lat/lng, place_id (Google)
- `itinerary_items`: id, trip_id, destination_id, place_id (Google, nullable for custom items), name, category, day_date (nullable = unscheduled), duration, cost, cost_currency
- `travel_legs`: id, trip_id, from_item_id, to_item_id, selected_mode (`public`/`private`), cost, cost_currency

Row Level Security: a row is readable/writable by its trip's owner and by users listed in `trip_collaborators` for that trip (write requires role `editor` or ownership).

## Risks / Trade-offs

- [Google Maps Platform usage costs scale with traffic] → cache place/direction lookups per session where reasonable, and put a Google Cloud budget alert in place before launch.
- [Client-side API keys are visible to users] → restrict the Maps Platform key by HTTP referrer and by API in Google Cloud Console; keep the Supabase key as the public anon key protected by RLS, never a service-role key.
- [Two separate Google consent flows (Supabase sign-in, Calendar export) could confuse users] → make the Calendar export consent screen clearly labeled as a separate, optional permission requested only at export time.
- [Exchange rates cached hourly can drift from real-time rates] → acceptable per proposal (estimates, not transactions); surface the rate's timestamp to the user per the `currency-conversion` "stale or unavailable" scenario.
- [Native HTML5 Drag and Drop has inconsistent touch-device support] → validate on real tablets/phones during implementation; fall back to a small DnD utility library (see Decision 5) if needed.

## Open Questions

- Exact exchange-rate API provider/plan (e.g. exchangerate.host, Open Exchange Rates) - can be chosen during implementation without affecting the spec or approach, as long as it returns current rates.
