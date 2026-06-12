import { createClient } from '@supabase/supabase-js'

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key'

// Safely fallback to placeholder if url contains template markers or is malformed to prevent build errors
if (supabaseUrl.includes('<project>') || !supabaseUrl.startsWith('http')) {
  supabaseUrl = 'https://placeholder.supabase.co'
}

export const supabase = createClient(supabaseUrl, supabaseKey)
