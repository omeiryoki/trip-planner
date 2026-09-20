import { addItem } from '../state/tripStore.js'

const CATEGORY_TO_PLACE_TYPE = {
  attraction: 'tourist_attraction',
  restaurant: 'restaurant',
  hotel: 'lodging',
}

export function fetchRecommendations(googleMaps, destination) {
  const service = new googleMaps.places.PlacesService(document.createElement('div'))
  const location = new googleMaps.LatLng(destination.lat, destination.lng)

  const categories = Object.keys(CATEGORY_TO_PLACE_TYPE)
  return Promise.all(
    categories.map(
      (category) =>
        new Promise((resolve) => {
          service.nearbySearch(
            { location, radius: 3000, type: CATEGORY_TO_PLACE_TYPE[category] },
            (results, status) => {
              if (status !== googleMaps.places.PlacesServiceStatus.OK || !results) {
                resolve({ category, places: [] })
                return
              }
              resolve({
                category,
                places: results.map((place) => ({
                  placeId: place.place_id,
                  name: place.name,
                  location: place.vicinity,
                  lat: place.geometry?.location?.lat(),
                  lng: place.geometry?.location?.lng(),
                })),
              })
            }
          )
        })
    )
  ).then((byCategory) =>
    Object.fromEntries(byCategory.map(({ category, places }) => [category, places]))
  )
}

export function renderRecommendations(container, destination, recommendationsByCategory) {
  container.innerHTML = ''

  for (const [category, places] of Object.entries(recommendationsByCategory)) {
    const section = document.createElement('section')
    section.innerHTML = `<h3>${category}</h3>`

    if (places.length === 0) {
      section.innerHTML += `<p class="muted">No ${category} found near ${destination.name}.</p>`
      container.appendChild(section)
      continue
    }

    const grid = document.createElement('div')
    grid.className = 'grid grid--recommendations'

    for (const place of places) {
      const card = document.createElement('div')
      card.className = 'card'
      card.innerHTML = `
        <strong>${place.name}</strong>
        <p class="muted">${place.location ?? ''}</p>
        <button class="btn btn--primary" type="button">Add to trip</button>
      `
      card.querySelector('button').addEventListener('click', () => {
        addItem({
          id: crypto.randomUUID(),
          destinationId: destination.id,
          placeId: place.placeId,
          name: place.name,
          category,
          dayDate: null,
          durationMinutes: null,
          cost: null,
          costCurrency: null,
          sortOrder: 0,
        })
      })
      grid.appendChild(card)
    }

    section.appendChild(grid)
    container.appendChild(section)
  }
}
