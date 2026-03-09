import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database.types"

/**
 * Public Supabase client — for client-side DB reads
 * that respect Row Level Security (RLS).
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

/**
 * Admin Supabase client — for server-side DB writes
 * that bypass RLS (uses the service_role key).
 * ⚠️ Only use in server components / API routes / route handlers.
 */
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? supabaseAnonKey
)





