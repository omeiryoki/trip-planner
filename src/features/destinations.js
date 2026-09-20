import { addDestination } from '../state/tripStore.js'

// Lets a user specify destinations by typing a name and picking the
// granularity themselves, per the trip-management spec's
// "Destination specification" requirement.
export function mountDestinationForm(container) {
  container.innerHTML = `
    <form id="destination-form" class="card">
      <label for="destination-name">Add a destination</label>
      <input id="destination-name" type="text" placeholder="Name (e.g. Kyoto)" required />
      <select id="destination-granularity">
        <option value="place">Place</option>
        <option value="city" selected>City</option>
        <option value="province">Province/State</option>
        <option value="country">Country</option>
      </select>
      <button type="submit" class="btn btn--primary">Add</button>
    </form>
  `

  container.querySelector('#destination-form').addEventListener('submit', (e) => {
    e.preventDefault()
    const nameInput = container.querySelector('#destination-name')
    const granularitySelect = container.querySelector('#destination-granularity')
    if (!nameInput.value.trim()) return

    addDestination({
      id: crypto.randomUUID(),
      name: nameInput.value.trim(),
      granularity: granularitySelect.value,
      lat: null,
      lng: null,
      placeId: null,
    })

    nameInput.value = ''
  })
}
