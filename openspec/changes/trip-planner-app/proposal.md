# Proposal

## Why

There is no tool that lets a traveler plan a multi-destination trip end-to-end — picking places, scheduling them on a calendar, estimating transport, and tracking a shared per-person budget in a currency of choice — in one place. This change builds a new client-side web app for exactly that, so a user (or a group planning together) can go from "where do we want to go" to a shareable, cost-estimated itinerary without juggling separate maps, spreadsheets, and calendar apps.

## What Changes

- New Vite + vanilla JS + HTML/CSS web app, responsive across desktop, tablet, and mobile.
- Google sign-in (via Supabase Auth) as the only login method; trips are tied to the signed-in account.
- Destination search/selection by place, city, province, and country.
- Nearby recommendations for attractions, restaurants, and hotels around a selected destination (Google Places API).
- Travel suggestions between itinerary stops for both public transit and private vehicle, each with an estimated cost (Google Directions/Distance Matrix API).
- Drag-and-drop calendar view for arranging selected places into a day-by-day itinerary, with adjustable stay duration per place.
- Per-day and whole-trip cost calculation, shown per person.
- User-selectable display currency with conversion at current exchange rates.
- Saved trips persisted to the user's account (Supabase) and shareable with other trip participants (view/edit collaborators).
- Export/open itinerary items in Google Maps and Google Calendar.

## Capabilities

### New Capabilities
- `auth`: Google sign-in and session management via Supabase Auth; gates access to saving/sharing trips.
- `trip-management`: creating, saving, listing, and sharing trips; specifying trip destinations (place/city/province/country) and collaborators.
- `place-recommendations`: surfacing nearby attractions, restaurants, and hotels around a chosen destination.
- `travel-directions`: suggesting public-transit and private-vehicle routes between itinerary stops with estimated cost.
- `itinerary-calendar`: arranging chosen places on a calendar and adjusting the duration spent at each.
- `budget-calculator`: computing per-day and per-person total trip costs from itinerary and travel-cost data.
- `currency-conversion`: selecting a display currency and converting amounts using current exchange rates.
- `calendar-map-export`: exporting/opening itinerary data in Google Calendar and Google Maps.

### Modified Capabilities
- None (greenfield project; no existing specs).

## Impact

- **New codebase**: Vite project scaffold (HTML/CSS/vanilla JS, no framework), responsive layout system.
- **External services**: Supabase (Auth + Postgres for trips, itinerary items, sharing/collaborators), Google Maps Platform (Places, Directions/Distance Matrix), Google Calendar API, a currency exchange-rate API.
- **Data**: new schema for users (via Supabase Auth), trips, destinations, itinerary items, travel legs, and trip collaborators/shares.
- **Secrets/config**: Google OAuth client, Google Maps Platform API key, exchange-rate API key/config, Supabase project URL/anon key.
