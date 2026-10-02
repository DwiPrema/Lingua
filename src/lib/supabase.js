import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  console.error('Supabase env kosong', { url, keyAda: Boolean(key) })
}

export const supabase = createClient(url, key)

console.log(
  'Supabase URL:',
  import.meta.env.VITE_SUPABASE_URL
)

console.log(
  'API key exists:',
  Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY)
)