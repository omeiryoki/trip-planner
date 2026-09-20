import './style.css'
import { loadConfig } from './config.js'
import { getSupabase } from './api/supabaseClient.js'
import { initAuth, onAuthChange } from './features/auth.js'
import { loadGoogleMaps } from './api/googleMaps.js'
import { mountDestinationSearch } from './features/destinations.js'
import { fetchRecommendations, renderRecommendations } from './features/recommendations.js'
import { fetchTravelOptions, selectTravelMode } from './features/travel.js'
import { renderCalendar } from './features/calendar.js'
import { watchBudget } from './features/budget.js'
import { getRates } from './features/currency.js'
import { exportToGoogleCalendar, openInGoogleMaps } from './features/export.js'
import { saveTrip, listMyTrips, shareTripByEmail } from './api/trips.js'
import { getTrip, onTripChange, setTripMeta } from './state/tripStore.js'

const main = document.getElementById('main')
const authSlot = document.getElementById('auth-slot')
const navMyTrips = document.getElementById('nav-my-trips')

const { ok, config, error } = loadConfig()

if (!ok) {
  main.innerHTML = `
    <div class="card">
      <strong>Configuration error</strong>
      <p>${error.message}</p>
    </div>
  `
  throw error
}

const supabase = getSupabase(config)
const auth = initAuth(supabase)

renderShell()

async function renderShell() {
  main.innerHTML = `
    <section id="destination-section"></section>
    <section id="recommendations-section"></section>
    <section id="calendar-section"><h2>Itinerary calendar</h2><div id="calendar-root"></div></section>
    <section id="budget-section"></section>
    <section id="currency-section" class="card"></section>
    <section id="actions-section" class="card"></section>
  `

  renderAuthSlot()
  renderTripDates()
  renderCurrencyPicker()
  renderActions()
  watchBudget(document.getElementById('budget-section'))
  onTripChange(() => renderCalendar(document.getElementById('calendar-root')))

  try {
    const googleMaps = await loadGoogleMaps(config.VITE_GOOGLE_MAPS_API_KEY)
    mountDestinationSearch(document.getElementById('destination-section'), googleMaps)
    wireRecommendations(googleMaps)
  } catch (err) {
    document.getElementById('destination-section').innerHTML =
      `<p class="muted">Could not load Google Maps: ${err.message}</p>`
  }
}

function renderAuthSlot() {
  onAuthChange((session) => {
    navMyTrips.hidden = !session
    authSlot.innerHTML = session
      ? `<span class="muted">${session.user.email}</span> <button id="sign-out" class="btn">Sign out</button>`
      : `<button id="sign-in" class="btn btn--primary">Sign in with Google</button>`

    const signInBtn = document.getElementById('sign-in')
    if (signInBtn) signInBtn.addEventListener('click', () => auth.signInWithGoogle())

    const signOutBtn = document.getElementById('sign-out')
    if (signOutBtn) signOutBtn.addEventListener('click', () => auth.signOut())
  })

  navMyTrips.addEventListener('click', showMyTrips)
}

function renderTripDates() {
  const trip = getTrip()
  const section = document.getElementById('destination-section')
  const dates = document.createElement('div')
  dates.className = 'card'
  dates.innerHTML = `
    <label>Start date <input type="date" id="trip-start" value="${trip.startDate ?? ''}" /></label>
    <label>End date <input type="date" id="trip-end" value="${trip.endDate ?? ''}" /></label>
    <label>Travelers <input type="number" id="trip-travelers" min="1" value="${trip.travelerCount}" /></label>
  `
  section.prepend(dates)

  dates.querySelector('#trip-start').addEventListener('change', (e) =>
    setTripMeta({ startDate: e.target.value || null })
  )
  dates.querySelector('#trip-end').addEventListener('change', (e) =>
    setTripMeta({ endDate: e.target.value || null })
  )
  dates.querySelector('#trip-travelers').addEventListener('change', (e) =>
    setTripMeta({ travelerCount: Math.max(1, Number(e.target.value) || 1) })
  )
}

function wireRecommendations(googleMaps) {
  const container = document.getElementById('recommendations-section')

  onTripChange(async (trip) => {
    container.innerHTML = ''
    for (const destination of trip.destinations) {
      const heading = document.createElement('h3')
      heading.textContent = `Near ${destination.name}`
      const results = document.createElement('div')
      container.appendChild(heading)
      container.appendChild(results)
      const byCategory = await fetchRecommendations(googleMaps, destination)
      renderRecommendations(results, destination, byCategory)
    }

    renderTravelLegs(googleMaps, trip, container)
  })
}

function renderTravelLegs(googleMaps, trip, container) {
  const scheduled = trip.items.filter((it) => it.dayDate).sort((a, b) => a.dayDate.localeCompare(b.dayDate))
  for (let i = 0; i < scheduled.length - 1; i++) {
    const from = scheduled[i]
    const to = scheduled[i + 1]
    if (!from.placeId || !to.placeId) continue

    const legEl = document.createElement('div')
    legEl.className = 'card'
    legEl.innerHTML = `<p class="muted">Loading travel options: ${from.name} → ${to.name}...</p>`
    container.appendChild(legEl)

    fetchTravelOptions(googleMaps, from, to, trip.displayCurrency).then((options) => {
      if (!options.available) {
        legEl.innerHTML = `<p class="muted">No route found between ${from.name} and ${to.name}.</p>`
        return
      }

      legEl.innerHTML = `
        <strong>${from.name} → ${to.name}</strong>
        <div>
          <button class="btn" data-mode="public">
            Public transit ${options.public?.costAvailable ? `(${options.public.cost} ${options.public.costCurrency})` : '(cost unavailable)'}
          </button>
          <button class="btn" data-mode="private">
            Private vehicle (${options.private?.cost} ${options.private?.costCurrency})
          </button>
        </div>
      `
      legEl.querySelectorAll('button[data-mode]').forEach((btn) =>
        btn.addEventListener('click', () => selectTravelMode(from, to, btn.dataset.mode, options))
      )
    })
  }
}

function renderCurrencyPicker() {
  const section = document.getElementById('currency-section')
  const trip = getTrip()
  section.innerHTML = `
    <label>Display currency
      <select id="currency-select">
        ${['USD', 'THB', 'EUR', 'GBP', 'JPY']
          .map((c) => `<option value="${c}" ${c === trip.displayCurrency ? 'selected' : ''}>${c}</option>`)
          .join('')}
      </select>
    </label>
    <p id="currency-status" class="muted"></p>
  `
  section.querySelector('#currency-select').addEventListener('change', async (e) => {
    setTripMeta({ displayCurrency: e.target.value })
    const status = section.querySelector('#currency-status')
    const { stale, fetchedAt, error: rateError } = await getRates(config, e.target.value)
    status.textContent = rateError
      ? `Could not refresh exchange rates. ${stale ? 'Showing the last known rate.' : ''}`
      : `Rates updated ${new Date(fetchedAt).toLocaleTimeString()}.`
  })
}

function renderActions() {
  const section = document.getElementById('actions-section')
  section.innerHTML = `
    <button id="save-trip" class="btn btn--primary">Save trip</button>
    <button id="share-trip" class="btn">Share trip</button>
    <button id="export-calendar" class="btn">Export to Google Calendar</button>
    <button id="open-maps" class="btn">Open in Google Maps</button>
    <p id="actions-status" class="muted"></p>
  `

  const status = section.querySelector('#actions-status')

  section.querySelector('#save-trip').addEventListener('click', async () => {
    const session = await supabase.auth.getSession()
    if (!session.data.session) {
      status.textContent = 'Sign in with Google to save this trip.'
      return
    }
    try {
      const saved = await saveTrip(supabase, getTrip(), session.data.session.user.id)
      setTripMeta({ id: saved.id })
      status.textContent = 'Trip saved.'
    } catch (err) {
      status.textContent = `Could not save trip: ${err.message}`
    }
  })

  section.querySelector('#share-trip').addEventListener('click', async () => {
    const trip = getTrip()
    if (!trip.id) {
      status.textContent = 'Save the trip before sharing it.'
      return
    }
    const email = prompt('Share with (email):')
    if (!email) return
    try {
      await shareTripByEmail(supabase, trip.id, email, 'editor')
      status.textContent = `Shared with ${email}.`
    } catch (err) {
      status.textContent = `Could not share trip: ${err.message}`
    }
  })

  section.querySelector('#export-calendar').addEventListener('click', async () => {
    if (!config.VITE_GOOGLE_CALENDAR_CLIENT_ID) {
      status.textContent = 'Google Calendar export is not configured.'
      return
    }
    try {
      const result = await exportToGoogleCalendar(config)
      status.textContent = `Exported ${result.exportedCount} events.${
        result.skippedItems.length
          ? ` Skipped (unscheduled): ${result.skippedItems.join(', ')}.`
          : ''
      }`
    } catch (err) {
      status.textContent = `Export failed: ${err.message}`
    }
  })

  section.querySelector('#open-maps').addEventListener('click', () => {
    const url = openInGoogleMaps()
    status.textContent = url ? 'Opened Google Maps.' : 'Add at least one destination first.'
  })
}

async function showMyTrips() {
  try {
    const trips = await listMyTrips(supabase)
    const list = trips.map((t) => `${t.name} (${t.start_date ?? '?'} - ${t.end_date ?? '?'})`).join('\n')
    alert(trips.length ? `Your trips:\n${list}` : 'No saved trips yet.')
  } catch (err) {
    alert(`Could not load trips: ${err.message}`)
  }
}
