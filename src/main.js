import './style.css'
import { loadConfig } from './config.js'
import { getSupabase } from './api/supabaseClient.js'
import { initAuth, onAuthChange } from './features/auth.js'
import { mountDestinationForm } from './features/destinations.js'
import { renderItineraryItemForm } from './features/itineraryItems.js'
import { renderCalendar } from './features/calendar.js'
import { watchBudget } from './features/budget.js'
import { getRates } from './features/currency.js'
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

function renderShell() {
  main.innerHTML = `
    <section id="trip-dates-section"></section>
    <section id="destination-section"></section>
    <section id="items-section"></section>
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

  mountDestinationForm(document.getElementById('destination-section'))
  onTripChange(() => renderItineraryItemForm(document.getElementById('items-section')))
}

function renderAuthSlot() {
  onAuthChange((session) => {
    navMyTrips.hidden = !session
    authSlot.innerHTML = session
      ? `<span class="muted">${session.user.email}</span> <button id="sign-out" class="btn">Sign out</button>`
      : `
        <form id="login-form" class="auth-form">
          <input id="login-email" type="email" placeholder="Email" required autocomplete="email" />
          <input id="login-password" type="password" placeholder="Password" required autocomplete="current-password" minlength="6" />
          <button type="submit" class="btn btn--primary">Sign in</button>
          <button type="button" id="signup-btn" class="btn">Create account</button>
        </form>
        <p id="login-status" class="muted"></p>
      `

    const signOutBtn = document.getElementById('sign-out')
    if (signOutBtn) signOutBtn.addEventListener('click', () => auth.signOut())

    const form = document.getElementById('login-form')
    if (!form) return

    const status = document.getElementById('login-status')
    const emailInput = document.getElementById('login-email')
    const passwordInput = document.getElementById('login-password')

    form.addEventListener('submit', async (e) => {
      e.preventDefault()
      const { error: signInError } = await auth.signInWithPassword(
        emailInput.value,
        passwordInput.value
      )
      status.textContent = signInError ? signInError.message : ''
    })

    document.getElementById('signup-btn').addEventListener('click', async () => {
      const { error: signUpError } = await auth.signUpWithPassword(
        emailInput.value,
        passwordInput.value
      )
      status.textContent = signUpError
        ? signUpError.message
        : 'Account created. Check your email if confirmation is required, then sign in.'
    })
  })

  navMyTrips.addEventListener('click', showMyTrips)
}

function renderTripDates() {
  const trip = getTrip()
  const section = document.getElementById('trip-dates-section')
  const dates = document.createElement('div')
  dates.className = 'card'
  dates.innerHTML = `
    <label>Start date <input type="date" id="trip-start" value="${trip.startDate ?? ''}" /></label>
    <label>End date <input type="date" id="trip-end" value="${trip.endDate ?? ''}" /></label>
    <label>Travelers <input type="number" id="trip-travelers" min="1" value="${trip.travelerCount}" /></label>
  `
  section.appendChild(dates)

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
    if (!config.VITE_EXCHANGE_RATE_API_URL) {
      status.textContent = 'Exchange-rate API not configured; showing amounts unconverted.'
      return
    }
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
    <p id="actions-status" class="muted"></p>
  `

  const status = section.querySelector('#actions-status')

  section.querySelector('#save-trip').addEventListener('click', async () => {
    const session = await supabase.auth.getSession()
    if (!session.data.session) {
      status.textContent = 'Sign in to save this trip.'
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
