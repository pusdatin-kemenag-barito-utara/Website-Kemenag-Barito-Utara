import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getSupabaseUrl, getSupabaseAnonKey } from "@/lib/env";

export function createClient() {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();

  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL belum dikonfigurasi di Infisical Cloud (URL is empty)");
  }

  if (!key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY atau NEXT_PUBLIC_SUPABASE_ANON_KEY belum dikonfigurasi di Infisical Cloud"
    );
  }

  return createSupabaseClient(url, key);
}