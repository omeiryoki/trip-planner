import { addDestination } from '../state/tripStore.js'

// Maps a Google Places "type" to the granularity our spec requires
// (place / city / province / country).
function granularityFromPlace(place) {
  const types = place.types ?? []
  if (types.includes('country')) return 'country'
  if (types.includes('administrative_area_level_1')) return 'province'
  if (types.includes('locality') || types.includes('postal_town')) return 'city'
  return 'place'
}

export function mountDestinationSearch(container, googleMaps) {
  container.innerHTML = `
    <div class="card">
      <label for="destination-input">Add a destination</label>
      <input id="destination-input" type="text"
        placeholder="Search a place, city, province, or country" />
    </div>
  `

  const input = container.querySelector('#destination-input')
  const autocomplete = new googleMaps.places.Autocomplete(input, {
    fields: ['place_id', 'name', 'geometry', 'types'],
  })

  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace()
    if (!place.geometry) return

    addDestination({
      id: crypto.randomUUID(),
      name: place.name,
      granularity: granularityFromPlace(place),
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
      placeId: place.place_id,
    })

    input.value = ''
  })
}
