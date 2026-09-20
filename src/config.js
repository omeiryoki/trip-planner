const REQUIRED_KEYS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
]

const OPTIONAL_KEYS = ['VITE_EXCHANGE_RATE_API_URL', 'VITE_EXCHANGE_RATE_API_KEY']

function readEnv() {
  const env = import.meta.env
  const missing = REQUIRED_KEYS.filter((key) => !env[key])

  if (missing.length > 0) {
    throw new Error(
      `Trip Planner is missing required configuration: ${missing.join(', ')}. ` +
        'Copy .env.example to .env and fill in the values before running the app.'
    )
  }

  const config = {}
  for (const key of [...REQUIRED_KEYS, ...OPTIONAL_KEYS]) {
    config[key] = env[key] ?? ''
  }
  return config
}

export function loadConfig() {
  try {
    return { ok: true, config: readEnv() }
  } catch (error) {
    return { ok: false, error }
  }
}
