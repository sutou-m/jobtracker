import { createClient } from '@supabase/supabase-js'

/**
 * Supabase client for JobTracker (案件トラッカー)
 * Uses anon key — no authentication required (personal-use app).
 * Environment variables must be set in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 */
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
