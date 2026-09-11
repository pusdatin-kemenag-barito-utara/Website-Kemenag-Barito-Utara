import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getSupabaseUrl, getSupabaseAnonKey } from "@/lib/env";


export function createClient() {
  const url = getSupabaseUrl() || (typeof window === "undefined" ? "https://placeholder.supabase.co" : "");
  const key = getSupabaseAnonKey() || (typeof window === "undefined" ? "placeholder-anon-key" : "");

  if (!url || !key) {
    if (typeof window === "undefined") {
      return createSupabaseClient("https://placeholder.supabase.co", "placeholder-anon-key");
    }
    console.warn("NEXT_PUBLIC_SUPABASE_URL belum dikonfigurasi di environment");
    return null;
  }

  return createSupabaseClient(url, key);
}