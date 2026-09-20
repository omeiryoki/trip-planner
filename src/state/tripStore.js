const target = new EventTarget()
const CHANGE_EVENT = 'trip-change'

let state = emptyTrip()

function emptyTrip() {
  return {
    id: null,
    name: 'Untitled trip',
    startDate: null,
    endDate: null,
    displayCurrency: 'USD',
    travelerCount: 1,
    destinations: [], // { id, name, granularity, lat, lng, placeId }
    items: [], // { id, destinationId, placeId, name, category, dayDate, durationMinutes, cost, costCurrency, sortOrder }
    legs: [], // { id, fromItemId, toItemId, selectedMode, cost, costCurrency }
  }
}

function emit() {
  target.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: state }))
}

export function onTripChange(fn) {
  const handler = (e) => fn(e.detail)
  target.addEventListener(CHANGE_EVENT, handler)
  handler({ detail: state })
  return () => target.removeEventListener(CHANGE_EVENT, handler)
}

export function getTrip() {
  return state
}

export function resetTrip(trip = emptyTrip()) {
  state = trip
  emit()
}

export function setTripMeta(patch) {
  state = { ...state, ...patch }
  emit()
}

export function addDestination(destination) {
  state = { ...state, destinations: [...state.destinations, destination] }
  emit()
}

export function addItem(item) {
  state = { ...state, items: [...state.items, item] }
  emit()
}

export function updateItem(itemId, patch) {
  state = {
    ...state,
    items: state.items.map((it) => (it.id === itemId ? { ...it, ...patch } : it)),
  }
  emit()
}

export function removeItem(itemId) {
  state = { ...state, items: state.items.filter((it) => it.id !== itemId) }
  emit()
}

export function upsertLeg(leg) {
  const exists = state.legs.some(
    (l) => l.fromItemId === leg.fromItemId && l.toItemId === leg.toItemId
  )
  state = {
    ...state,
    legs: exists
      ? state.legs.map((l) =>
          l.fromItemId === leg.fromItemId && l.toItemId === leg.toItemId ? { ...l, ...leg } : l
        )
      : [...state.legs, leg],
  }
  emit()
}

export function itemsForDay(dayDate) {
  return state.items
    .filter((it) => it.dayDate === dayDate)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

export function unscheduledItems() {
  return state.items.filter((it) => !it.dayDate)
}
