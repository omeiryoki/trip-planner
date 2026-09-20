# Design

## Context

See proposal.md - Why/What Changes for motivation and scope. Key constraints:
- Frontend is Vite + HTML/CSS + vanilla JS only - no UI framework (no React/Vue/etc).
- Greenfield project - no existing code, specs, or data to migrate.
- External services: Supabase (auth + data) and, optionally, a currency exchange-rate API. Google Maps Platform (places, directions) and Google Calendar API (export) were dropped from this iteration - see "Decisions 2 & 3 (superseded)" below.

## Goals / Non-Goals

**Goals:**
- Define the module structure for a framework-less Vite app that stays maintainable as features grow.
- Define the data model in Supabase Postgres backing trips, itineraries, and sharing.
- Define how the app talks to Supabase and the optional exchange-rate API, and where API keys live.
- Define the approach for drag-and-drop calendar scheduling without a framework.

**Non-Goals:**
- Server-side rendering or a custom backend service - Supabase is the only backend.
- Offline support / PWA behavior.
- Payment processing - the app estimates costs, it does not handle real transactions.
- Native mobile apps - "responsive" here means a single responsive web app, not separate mobile builds.

## Decisions

### 1. Supabase for auth + data, no custom backend
Use Supabase Auth (email/password provider) for sign-in and Supabase Postgres (via `@supabase/supabase-js` from the browser, protected by Row Level Security) for storing trips, itinerary items, and shares.
- **Alternative considered**: Firebase (Auth + Firestore) - comparable fit, but Postgres/RLS gives more natural relational modeling for trips → destinations → itinerary items → travel legs, and simpler cost-aggregation queries.
- **Alternative considered**: custom Node/Express backend - rejected; adds a service to build, deploy, and secure for no benefit over Supabase's built-in auth + RLS for this app's needs.
- **Superseded**: Google sign-in via Supabase's Google OAuth provider was the original plan. Dropped for this iteration per explicit request to remove the Google Cloud dependency while the core app is built out; `signInWithOAuth({ provider: 'google' })` is a one-line re-add to `src/features/auth.js` plus a UI button once a Google OAuth client is configured in Supabase.

### 2. Google Maps Platform for places and directions (superseded - not built)
Originally planned: Places API for nearby attractions/restaurants/hotels and Directions/Distance Matrix API for route suggestions and cost estimation between itinerary stops. Dropped from this iteration to avoid depending on Google Cloud Console setup before the core app works end-to-end. Destinations and places to visit are entered manually instead (`src/features/destinations.js`, `src/features/itineraryItems.js`); the `place-recommendations` and `travel-directions` capabilities were removed from this change's specs rather than left describing unbuilt behavior. The `travel_legs` table remains in the schema (unpopulated) so a future change can re-add this without a data model rework.

### 3. Google Calendar export (superseded - not built)
Originally planned as a separate OAuth consent (`calendar.events` scope) from the app's sign-in, since Calendar export needs a scope that identity sign-in does not grant. Dropped along with Google Maps Platform for the same reason. The `calendar-map-export` capability was removed from this change's specs; re-adding it later means the same separate-consent approach described here previously, not a new design.

### 4. Currency conversion via a rates cache, not per-request calls
Fetch exchange rates from [Frankfurter](https://frankfurter.dev) (free, no API key, ECB-sourced; configurable to a different provider via `VITE_EXCHANGE_RATE_API_URL`/`VITE_EXCHANGE_RATE_API_KEY` if needed) on a timer (hourly) and cache the latest rates client-side (in memory + `localStorage` fallback with a timestamp), converting costs locally against the cached rates. This satisfies the `currency-conversion` spec's "current exchange rate" requirement while avoiding a network call per displayed cost. Frankfurter's response omits the base currency from its own rates map, so the client adds `{ [base]: 1 }` back in before caching.
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

- [Client-side API keys are visible to users] → the Supabase key is the public anon key, protected by RLS, never a service-role key.
- [Exchange rates cached hourly can drift from real-time rates] → acceptable per proposal (estimates, not transactions); surface the rate's timestamp to the user per the `currency-conversion` "stale or unavailable" scenario.
- [Native HTML5 Drag and Drop has inconsistent touch-device support] → validate on real tablets/phones during implementation; fall back to a small DnD utility library (see Decision 5) if needed.
- [Manual destination/place entry has no de-duplication or validation Google Places would have provided] → acceptable for this iteration; a future re-add of Google Places (see Decisions 1-3, superseded) would restore that.
