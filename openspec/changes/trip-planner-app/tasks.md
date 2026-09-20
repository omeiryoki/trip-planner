# Tasks

> **Status note:** Groups 4, 5, and 9 (Google Places / Directions / Calendar / Maps) were dropped per an explicit request to remove the Google service dependency - see proposal.md "Deferred" and design.md's superseded decisions. Their code was deleted rather than left half-wired. Auth uses Supabase email/password (not Google). Currency conversion uses Frankfurter (frankfurter.dev), which needs no API key. Checkboxes are marked `[x]` only where verification was actually possible without a live Supabase account, a browser, or a physical device - see README.md "What's implemented vs. what needs your credentials to verify live".

## 1. Project Setup

- [x] 1.1 Scaffold the Vite project (HTML/CSS/vanilla JS template) and verify `npm run dev` serves a starter page
- [ ] 1.2 Set up the mobile-first responsive layout shell (header, main content, nav) with breakpoints for tablet and desktop, and verify it visually adapts at common widths (375px, 768px, 1280px)
- [x] 1.3 Add environment config for Supabase URL/anon key and optional exchange-rate API config, and verify the app fails fast with a clear message when a required key is missing
- [ ] 1.4 Create the Supabase project schema (`trips`, `trip_collaborators`, `destinations`, `itinerary_items`, `travel_legs`) with RLS policies per design.md's Data Model, and verify policies with test queries as owner, collaborator, and unrelated user

## 2. Authentication (auth)

- [ ] 2.1 Integrate Supabase Auth with email/password and build the sign-in/sign-up/sign-out UI, and verify a real sign-up + sign-in creates a session
- [ ] 2.2 Implement session restoration on page load/new tab, and verify a reload keeps the user signed in
- [ ] 2.3 Implement access gating so anonymous users can build a trip but are prompted to sign in on "Save trip", and verify both paths manually

## 3. Trip Management

- [x] 3.1 Build a manual destination-add form supporting place, city, province, and country granularity, and verify all four granularities can be added to a trip
- [ ] 3.2 Implement save/update trip against Supabase (create on first save, update thereafter), and verify saving twice updates one row, not two
- [ ] 3.3 Build the "My trips" list view showing owned and shared trips, and verify it reflects Supabase state for a signed-in user
- [ ] 3.4 Implement trip sharing (invite by email, grant viewer/editor role) and enforce access in the UI and via RLS, and verify a non-collaborator cannot open the trip and a collaborator's edits persist
- [x] 3.5 Build a manual "add place to visit" form (name, category, optional cost) per destination, since there is no recommendations source to add from

## 4. Place Recommendations - DROPPED (see status note)

## 5. Travel Directions & Cost - DROPPED (see status note)

## 6. Itinerary Calendar

- [ ] 6.1 Implement trip start/end date selection and render a calendar bounded to that range, and verify days outside the range are non-schedulable
- [ ] 6.2 Implement drag-and-drop of itinerary items onto calendar days using the HTML5 Drag and Drop API, and verify a place can be assigned to a day and reordered within a day
- [ ] 6.3 Implement adjustable stay duration per scheduled place, including multi-day durations, and verify the calendar reflects the duration and shifts same-day availability accordingly
- [ ] 6.4 Validate touch-device drag-and-drop on a real tablet/phone; if native DnD is insufficient, swap in a lightweight DnD utility per design.md Decision 5, and verify scheduling works via touch

## 7. Budget Calculator

- [x] 7.1 Implement per-day cost aggregation (itinerary items + travel legs for that day), and verify a day with no costed items shows zero, not blank
- [x] 7.2 Implement whole-trip total and per-person total using traveler count (defaulting to 1), and verify the per-person figure updates when traveler count changes
- [x] 7.3 Wire recalculation to itinerary/travel/traveler-count changes via the state-change events from design.md, and verify totals update immediately after an edit

## 8. Currency Conversion

- [x] 8.1 Integrate Frankfurter (frankfurter.dev) with hourly-cached rates (memory + localStorage fallback with timestamp), and verify a converted amount matches rate × source amount
- [x] 8.2 Build the currency selector and apply conversion across all displayed cost figures for a trip, and verify switching currency updates every visible amount
- [ ] 8.3 Implement the stale/unavailable-rate fallback (show last known rate or original currency with a notice), and verify it triggers when the exchange-rate API is unreachable

## 9. Google Calendar & Maps Export - DROPPED (see status note)

## 10. Cross-Cutting Polish & Verification

- [ ] 10.1 Pass responsive layout QA on desktop, tablet, and mobile viewport sizes for every screen (sign-in, trip builder, calendar, budget), and verify no horizontal scroll or overlapping elements
- [ ] 10.2 (N/A - no Google Cloud usage in this iteration)
- [ ] 10.3 Run through every scenario listed in the `openspec/changes/trip-planner-app/specs/**` spec files end-to-end and confirm each passes manually or via test
