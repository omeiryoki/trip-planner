import { getTrip, onTripChange } from '../state/tripStore.js'
import { convert, getCachedRates } from './currency.js'

function toDisplayCurrency(amount, sourceCurrency, displayCurrency) {
  if (amount == null) return 0
  if (!sourceCurrency || sourceCurrency === displayCurrency) return amount
  const cache = getCachedRates()
  const converted = cache ? convert(amount, cache.rates, sourceCurrency, displayCurrency) : null
  // No rates cached yet (currency.js fetches on first currency-picker interaction) -
  // fall back to the raw amount rather than hiding the cost entirely.
  return converted ?? amount
}

function dayDatesInRange(trip) {
  if (!trip.startDate || !trip.endDate) return []
  const days = []
  const cursor = new Date(trip.startDate)
  const end = new Date(trip.endDate)
  while (cursor <= end) {
    days.push(cursor.toISOString().slice(0, 10))
    cursor.setDate(cursor.getDate() + 1)
  }
  return days
}

export function computeDailyTotals(trip) {
  const totals = {}
  for (const day of dayDatesInRange(trip)) {
    const itemsTotal = trip.items
      .filter((it) => it.dayDate === day)
      .reduce((sum, it) => sum + toDisplayCurrency(it.cost, it.costCurrency, trip.displayCurrency), 0)

    const legsTotal = trip.legs
      .filter((leg) => {
        const fromItem = trip.items.find((it) => it.id === leg.fromItemId)
        return fromItem?.dayDate === day
      })
      .reduce((sum, leg) => sum + toDisplayCurrency(leg.cost, leg.costCurrency, trip.displayCurrency), 0)

    totals[day] = itemsTotal + legsTotal
  }
  return totals
}

export function computeTripTotal(trip) {
  const dailyTotals = computeDailyTotals(trip)
  const total = Object.values(dailyTotals).reduce((sum, v) => sum + v, 0)
  const travelers = trip.travelerCount > 0 ? trip.travelerCount : 1
  return { total, perPerson: total / travelers, dailyTotals }
}

export function renderBudget(container) {
  const trip = getTrip()
  const { total, perPerson, dailyTotals } = computeTripTotal(trip)

  const rows = Object.entries(dailyTotals)
    .map(([day, amount]) => `<li>${day}: ${amount.toFixed(2)} ${trip.displayCurrency}</li>`)
    .join('')

  container.innerHTML = `
    <div class="card">
      <h3>Budget</h3>
      <ul>${rows || '<li class="muted">No dates set yet.</li>'}</ul>
      <p><strong>Trip total:</strong> ${total.toFixed(2)} ${trip.displayCurrency}</p>
      <p><strong>Per person</strong> (${trip.travelerCount || 1} travelers):
        ${perPerson.toFixed(2)} ${trip.displayCurrency}</p>
    </div>
  `
}

export function watchBudget(container) {
  return onTripChange(() => renderBudget(container))
}
