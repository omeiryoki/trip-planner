import { addItem, getTrip } from '../state/tripStore.js'

// Manual replacement for what used to be "add from Google Places
// recommendations": lets a user add a place to a destination by typing it in.
export function renderItineraryItemForm(container) {
  const trip = getTrip()

  if (trip.destinations.length === 0) {
    container.innerHTML = '<p class="muted">Add a destination first, then add places to visit here.</p>'
    return
  }

  container.innerHTML = `
    <form id="item-form" class="card">
      <label>Destination
        <select id="item-destination">
          ${trip.destinations
            .map((d) => `<option value="${d.id}">${d.name}</option>`)
            .join('')}
        </select>
      </label>
      <input id="item-name" type="text" placeholder="Place name (e.g. Fushimi Inari Shrine)" required />
      <select id="item-category">
        <option value="attraction">Attraction</option>
        <option value="restaurant">Restaurant</option>
        <option value="hotel">Hotel</option>
        <option value="custom">Other</option>
      </select>
      <input id="item-cost" type="number" min="0" step="0.01" placeholder="Cost (optional)" />
      <button type="submit" class="btn btn--primary">Add place</button>
    </form>
  `

  container.querySelector('#item-form').addEventListener('submit', (e) => {
    e.preventDefault()
    const nameInput = container.querySelector('#item-name')
    if (!nameInput.value.trim()) return

    addItem({
      id: crypto.randomUUID(),
      destinationId: container.querySelector('#item-destination').value,
      placeId: null,
      name: nameInput.value.trim(),
      category: container.querySelector('#item-category').value,
      dayDate: null,
      durationMinutes: null,
      nights: 1,
      cost: container.querySelector('#item-cost').value
        ? Number(container.querySelector('#item-cost').value)
        : null,
      costCurrency: trip.displayCurrency,
      sortOrder: 0,
    })

    nameInput.value = ''
    container.querySelector('#item-cost').value = ''
  })
}
