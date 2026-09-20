const CACHE_KEY = 'trip-planner:exchange-rates'
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour, per design.md Decision 4
// Frankfurter (frankfurter.dev) is the default provider: free, no API key, ECB-sourced rates.
const DEFAULT_RATES_URL = 'https://api.frankfurter.dev/v1/latest'

let memoryCache = null

function readCache() {
  if (memoryCache) return memoryCache
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    memoryCache = JSON.parse(raw)
    return memoryCache
  } catch {
    return null
  }
}

function writeCache(entry) {
  memoryCache = entry
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry))
  } catch {
    // localStorage unavailable (private mode, etc.) - memory cache still works for this session.
  }
}

function isFresh(entry) {
  return entry && Date.now() - entry.fetchedAt < CACHE_TTL_MS
}

export async function getRates(config, baseCurrency) {
  const cached = readCache()
  if (isFresh(cached) && cached.base === baseCurrency) {
    return { rates: cached.rates, fetchedAt: cached.fetchedAt, stale: false }
  }

  try {
    const baseUrl = config.VITE_EXCHANGE_RATE_API_URL || DEFAULT_RATES_URL
    const url = `${baseUrl}?base=${encodeURIComponent(baseCurrency)}${
      config.VITE_EXCHANGE_RATE_API_KEY
        ? `&access_key=${encodeURIComponent(config.VITE_EXCHANGE_RATE_API_KEY)}`
        : ''
    }`
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Exchange rate API returned ${response.status}`)
    const data = await response.json()
    // The API omits the base currency from its own rates map - add it back so
    // convert() can treat "convert into the display currency" like any other pair.
    const rates = { ...data.rates, [baseCurrency]: 1 }
    const entry = { base: baseCurrency, rates, fetchedAt: Date.now() }
    writeCache(entry)
    return { rates: entry.rates, fetchedAt: entry.fetchedAt, stale: false }
  } catch (error) {
    if (cached) {
      return { rates: cached.rates, fetchedAt: cached.fetchedAt, stale: true, error }
    }
    return { rates: null, fetchedAt: null, stale: true, error }
  }
}

export function getCachedRates() {
  return readCache()
}

export function convert(amount, rates, fromCurrency, toCurrency) {
  if (fromCurrency === toCurrency) return amount
  if (!rates || !rates[toCurrency] || !rates[fromCurrency]) return null
  // rates are relative to the API's base currency; normalize via that base.
  const amountInBase = amount / rates[fromCurrency]
  return amountInBase * rates[toCurrency]
}
