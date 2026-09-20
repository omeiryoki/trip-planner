# Tasks

> **Status note:** All code for tasks 1–9 has been written (see `src/`, `supabase/schema.sql`). Checkboxes below are only marked `[x]` where verification was actually possible without live credentials (build succeeds, dev server serves the app, pure-logic behavior). Tasks whose verification step requires a real Google/Supabase account, a browser, or a physical device are left unchecked even though the implementing code exists — see README.md "What's implemented vs. what needs your credentials to verify live".

## 1. Project Setup

- [x] 1.1 Scaffold the Vite project (HTML/CSS/vanilla JS template) and verify `npm run dev` serves a starter page
- [ ] 1.2 Set up the mobile-first responsive layout shell (header, main content, nav) with breakpoints for tablet and desktop, and verify it visually adapts at common widths (375px, 768px, 1280px)
- [ ] 1.3 Add environment config for Supabase URL/anon key, Google Maps Platform key, Google OAuth client, and exchange-rate API config, and verify the app fails fast with a clear message when a required key is missing
- [ ] 1.4 Create the Supabase project schema (`trips`, `trip_collaborators`, `destinations`, `itinerary_items`, `travel_legs`) with RLS policies per design.md's Data Model, and verify policies with test queries as owner, collaborator, and unrelated user

## 2. Authentication (auth)

- [ ] 2.1 Integrate Supabase Auth with the Google provider and build the sign-in/sign-out UI, and verify a real Google sign-in creates a session
- [ ] 2.2 Implement session restoration on page load/new tab, and verify a reload keeps the user signed in
- [ ] 2.3 Implement access gating so anonymous users can build a trip but are prompted to sign in on "Save trip", and verify both paths manually

## 3. Trip Management

- [ ] 3.1 Build destination search/add UI supporting place, city, province, and country granularity (via Google Places Autocomplete), and verify all four granularities can be added to a trip
- [ ] 3.2 Implement save/update trip against Supabase (create on first save, update thereafter), and verify saving twice updates one row, not two
- [ ] 3.3 Build the "My trips" list view showing owned and shared trips, and verify it reflects Supabase state for a signed-in user
- [ ] 3.4 Implement trip sharing (invite by email, grant viewer/editor role) and enforce access in the UI and via RLS, and verify a non-collaborator cannot open the trip and a collaborator's edits persist

## 4. Place Recommendations

- [ ] 4.1 Integrate Google Places API to fetch nearby attractions, restaurants, and hotels for a selected destination, and verify results render grouped by category
- [ ] 4.2 Handle the empty-results case per category with an empty state, and verify it renders when a query returns no places
- [ ] 4.3 Implement "Add to trip" from a recommendation card, and verify the place appears as an itinerary item under the correct destination

## 5. Travel Directions & Cost

- [ ] 5.1 Integrate Google Directions/Distance Matrix API to compute public-transit and private-vehicle options between two consecutive itinerary stops, and verify both options render for a known city pair
- [ ] 5.2 Implement the private-vehicle cost estimate (distance × configurable cost-per-distance) and the public-transit fare lookup, with a clear "cost unavailable" state when fare data is missing, and verify both cost types display
- [ ] 5.3 Handle the no-route-available case, and verify the UI communicates it instead of showing broken data
- [ ] 5.4 Implement per-leg travel mode selection and wire the selected leg's cost into budget calculations, and verify switching the selected mode updates the trip total

## 6. Itinerary Calendar

- [ ] 6.1 Implement trip start/end date selection and render a calendar bounded to that range, and verify days outside the range are non-schedulable
- [ ] 6.2 Implement drag-and-drop of itinerary items onto calendar days using the HTML5 Drag and Drop API, and verify a place can be assigned to a day and reordered within a day
- [ ] 6.3 Implement adjustable stay duration per scheduled place, including multi-day durations, and verify the calendar reflects the duration and shifts same-day availability accordingly
- [ ] 6.4 Validate touch-device drag-and-drop on a real tablet/phone; if native DnD is insufficient, swap in a lightweight DnD utility per design.md Decision 5, and verify scheduling works via touch

## 7. Budget Calculator

- [ ] 7.1 Implement per-day cost aggregation (itinerary items + travel legs for that day), and verify a day with no costed items shows zero, not blank
- [ ] 7.2 Implement whole-trip total and per-person total using traveler count (defaulting to 1), and verify the per-person figure updates when traveler count changes
- [ ] 7.3 Wire recalculation to itinerary/travel/traveler-count changes via the state-change events from design.md, and verify totals update immediately after an edit

## 8. Currency Conversion

- [ ] 8.1 Integrate the exchange-rate API with hourly-cached rates (memory + localStorage fallback with timestamp), and verify a converted amount matches rate × source amount
- [ ] 8.2 Build the currency selector and apply conversion across all displayed cost figures for a trip, and verify switching currency updates every visible amount
- [ ] 8.3 Implement the stale/unavailable-rate fallback (show last known rate or original currency with a notice), and verify it triggers when the exchange-rate API is unreachable

## 9. Google Calendar & Maps Export

- [ ] 9.1 Implement the separate Google OAuth token flow requesting `calendar.events` scope only at export time, and verify a fresh consent prompt appears on first export
- [ ] 9.2 Implement export of scheduled itinerary items as Google Calendar events (date, duration, location), and verify created events match itinerary data
- [ ] 9.3 Handle unscheduled items during export by skipping them and listing which were skipped, and verify the message names the skipped items
- [ ] 9.4 Implement "Open in Google Maps" for a trip's destinations/itinerary, and verify it opens Maps with the correct locations plotted

## 10. Cross-Cutting Polish & Verification

- [ ] 10.1 Pass responsive layout QA on desktop, tablet, and mobile viewport sizes for every screen (sign-in, trip builder, recommendations, calendar, budget), and verify no horizontal scroll or overlapping elements
- [ ] 10.2 Add a Google Cloud budget alert and confirm the Maps Platform API key is restricted by HTTP referrer and API, and verify restriction is active in Google Cloud Console
- [ ] 10.3 Run through every scenario listed in the `openspec/changes/trip-planner-app/specs/**` spec files end-to-end and confirm each passes manually or via test
