# Proposal

## Why

There is no tool that lets a traveler plan a multi-destination trip end-to-end — picking places, scheduling them on a calendar, estimating transport, and tracking a shared per-person budget in a currency of choice — in one place. This change builds a new client-side web app for exactly that, so a user (or a group planning together) can go from "where do we want to go" to a shareable, cost-estimated itinerary without juggling separate maps, spreadsheets, and calendar apps.

## What Changes

- New Vite + vanilla JS + HTML/CSS web app, responsive across desktop, tablet, and mobile.
- Email/password sign-in (via Supabase Auth); trips are tied to the signed-in account. (Google sign-in was dropped from this iteration - see below.)
- Manual destination entry by place, city, province, and country (no Google Places dependency).
- Manual entry of places to visit (attractions/restaurants/hotels/other) per destination, including an optional cost.
- Drag-and-drop calendar view for arranging selected places into a day-by-day itinerary, with adjustable stay duration per place.
- Per-day and whole-trip cost calculation, shown per person.
- User-selectable display currency with conversion at current exchange rates (when an exchange-rate API is configured).
- Saved trips persisted to the user's account (Supabase) and shareable with other trip participants (view/edit collaborators).

**Deferred (dropped from this iteration to avoid a hard Google Cloud dependency while the core app is being built out):** nearby place recommendations via Google Places, travel-leg suggestions/cost via Google Directions, Google Calendar export, "open in Google Maps", and Google sign-in. The `auth`, `trip-management`, and `budget-calculator` capabilities were written to accommodate re-adding these later (see design.md) without a redesign.

## Capabilities

### New Capabilities
- `auth`: email/password sign-in and session management via Supabase Auth; gates access to saving/sharing trips.
- `trip-management`: creating, saving, listing, and sharing trips; specifying trip destinations (place/city/province/country) and collaborators.
- `itinerary-calendar`: arranging chosen places on a calendar and adjusting the duration spent at each.
- `budget-calculator`: computing per-day and per-person total trip costs from itinerary cost data.
- `currency-conversion`: selecting a display currency and converting amounts using current exchange rates.

### Modified Capabilities
- None (greenfield project; no existing specs).

### Deferred (not part of this iteration)
- `place-recommendations`, `travel-directions`, `calendar-map-export` - all depended on Google Maps Platform / Google Calendar; dropped per explicit request to remove the Google service dependency for now. Their spec files were removed from this change rather than left inaccurate; re-add them as a future change if these features return.

## Impact

- **New codebase**: Vite project scaffold (HTML/CSS/vanilla JS, no framework), responsive layout system.
- **External services**: Supabase (Auth + Postgres for trips, itinerary items, sharing/collaborators) and, optionally, a currency exchange-rate API. No Google services are used.
- **Data**: new schema for users (via Supabase Auth), trips, destinations, itinerary items, travel legs (currently unpopulated - kept for a future travel-directions re-add), and trip collaborators/shares.
- **Secrets/config**: exchange-rate API key/config (optional), Supabase project URL/anon key.
