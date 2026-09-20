let loadPromise = null

export function loadGoogleMaps(apiKey) {
  if (window.google?.maps) return Promise.resolve(window.google.maps)
  if (loadPromise) return loadPromise

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      apiKey
    )}&libraries=places`
    script.async = true
    script.onerror = () => reject(new Error('Failed to load Google Maps JavaScript API'))
    script.onload = () => resolve(window.google.maps)
    document.head.appendChild(script)
  })

  return loadPromise
}
