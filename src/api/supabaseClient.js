import { createClient } from '@supabase/supabase-js'

let client = null

export function getSupabase(config) {
  if (!client) {
    client = createClient(config.VITE_SUPABASE_URL, config.VITE_SUPABASE_ANON_KEY)
  }
  return client
}
