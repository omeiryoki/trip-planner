import { getTrip } from '../state/tripStore.js'

let tokenClient = null

function loadGis() {
  if (window.google?.accounts?.oauth2) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.onload = resolve
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'))
    document.head.appendChild(script)
  })
}

// Calendar export needs the calendar.events scope, which the app's Google
// sign-in (Supabase Auth) does not request - see design.md Decision 3.
// This is a separate, explicit consent requested only when exporting.
async function getCalendarAccessToken(clientId) {
  await loadGis()

  return new Promise((resolve, reject) => {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'https://www.googleapis.com/auth/calendar.events',
      callback: (response) => {
        if (response.error) reject(new Error(response.error))
        else resolve(response.access_token)
      },
    })
    tokenClient.requestAccessToken()
  })
}

export async function exportToGoogleCalendar(config) {
  const trip = getTrip()
  const scheduled = trip.items.filter((it) => it.dayDate)
  const skipped = trip.items.filter((it) => !it.dayDate)

  const accessToken = await getCalendarAccessToken(config.VITE_GOOGLE_CALENDAR_CLIENT_ID)

  const results = await Promise.all(
    scheduled.map((item) => {
      const start = new Date(`${item.dayDate}T09:00:00`)
      const end = new Date(start.getTime() + (item.durationMinutes ?? 60) * 60 * 1000)

      return fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: item.name,
          start: { dateTime: start.toISOString() },
          end: { dateTime: end.toISOString() },
        }),
      })
    })
  )

  const failed = results.filter((r) => !r.ok).length

  return {
    exportedCount: scheduled.length - failed,
    failedCount: failed,
    skippedItems: skipped.map((it) => it.name),
  }
}

export function openInGoogleMaps() {
  const trip = getTrip()
  const points = [
    ...trip.destinations.map((d) => `${d.lat},${d.lng}`),
    ...trip.items.filter((it) => it.lat && it.lng).map((it) => `${it.lat},${it.lng}`),
  ]

  if (points.length === 0) {
    return null
  }

  const destination = points[points.length - 1]
  const waypoints = points.slice(0, -1)
  const url = new URL('https://www.google.com/maps/dir/')
  url.searchParams.set('api', '1')
  url.searchParams.set('destination', destination)
  if (waypoints.length > 0) {
    url.searchParams.set('waypoints', waypoints.join('|'))
  }
  window.open(url.toString(), '_blank', 'noopener')
  return url.toString()
}
