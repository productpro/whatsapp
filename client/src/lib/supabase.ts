import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type SupabaseConfig = { url: string; anonKey: string };
let clientPromise: Promise<SupabaseClient> | null = null;

export function getSupabase() {
  if (!clientPromise) {
    clientPromise = fetch("/api/auth/config", { cache: "no-store" }).then(async response => {
      if (!response.ok) throw new Error("Supabase authentication is not configured.");
      const config = await response.json() as SupabaseConfig;
      if (!config.url || !config.anonKey) throw new Error("Supabase authentication is not configured.");
      return createClient(config.url, config.anonKey, { auth: { flowType: "pkce", persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } });
    });
  }
  return clientPromise;
}
