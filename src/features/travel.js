import { upsertLeg } from '../state/tripStore.js'

// Private-vehicle cost has no direct API figure, so it is derived from
// distance using a configurable assumption (design.md Decision 2).
const FUEL_COST_PER_KM = { USD: 0.15 }

function estimatePrivateCost(distanceMeters, currency) {
  const perKm = FUEL_COST_PER_KM[currency] ?? FUEL_COST_PER_KM.USD
  return Math.round(((distanceMeters / 1000) * perKm + Number.EPSILON) * 100) / 100
}

export function fetchTravelOptions(googleMaps, fromItem, toItem, currency = 'USD') {
  const service = new googleMaps.DirectionsService()
  const origin = { lat: fromItem.lat, lng: fromItem.lng }
  const destination = { lat: toItem.lat, lng: toItem.lng }

  const request = (mode) =>
    new Promise((resolve) => {
      service.route(
        { origin, destination, travelMode: mode },
        (result, status) => {
          if (status !== 'OK' || !result) {
            resolve(null)
            return
          }
          const leg = result.routes[0]?.legs?.[0]
          resolve(leg ?? null)
        }
      )
    })

  return Promise.all([
    request(googleMaps.TravelMode.TRANSIT),
    request(googleMaps.TravelMode.DRIVING),
  ]).then(([transitLeg, drivingLeg]) => {
    if (!transitLeg && !drivingLeg) {
      return { available: false }
    }

    return {
      available: true,
      public: transitLeg
        ? {
            durationText: transitLeg.duration?.text,
            // Google's Directions API does not return transit fare for every
            // region; when it is missing we surface that instead of guessing.
            cost: transitLeg.fare ? transitLeg.fare.value : null,
            costAvailable: Boolean(transitLeg.fare),
            costCurrency: transitLeg.fare?.currency ?? currency,
          }
        : null,
      private: drivingLeg
        ? {
            durationText: drivingLeg.duration?.text,
            cost: estimatePrivateCost(drivingLeg.distance.value, currency),
            costAvailable: true,
            costCurrency: currency,
          }
        : null,
    }
  })
}

export function selectTravelMode(fromItem, toItem, mode, options) {
  const chosen = mode === 'public' ? options.public : options.private
  upsertLeg({
    id: crypto.randomUUID(),
    fromItemId: fromItem.id,
    toItemId: toItem.id,
    selectedMode: mode,
    cost: chosen?.costAvailable ? chosen.cost : null,
    costCurrency: chosen?.costCurrency ?? null,
  })
}
