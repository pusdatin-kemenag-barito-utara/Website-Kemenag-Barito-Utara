import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getSupabaseUrl, getSupabaseAnonKey } from "@/lib/env";


export function createClient() {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();

  if (!url || !key || url.includes("placeholder") || key.includes("placeholder")) {
    if (typeof window !== "undefined") {
      console.warn("Supabase client: NEXT_PUBLIC_SUPABASE_URL atau ANON_KEY belum aktif di sesi ini.");
    }
    return null;
  }

  return createSupabaseClient(url, key);
}