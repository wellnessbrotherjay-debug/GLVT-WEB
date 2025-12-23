import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// Check if environment variables are available - use placeholders if not to prevent crash
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.warn('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL - Using placeholder for UI verification');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY - Using placeholder for UI verification');
}

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key",
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
)

export type SupabaseClient = typeof supabase;
