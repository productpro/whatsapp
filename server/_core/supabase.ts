import { createClient } from "@supabase/supabase-js";
import { ENV } from "./env";

let client: ReturnType<typeof createClient> | null = null;

function getClient() {
  if (!ENV.supabaseUrl || !ENV.supabaseAnonKey) throw new Error("Supabase authentication is not configured.");
  client ??= createClient(ENV.supabaseUrl, ENV.supabaseAnonKey, { auth: { autoRefreshToken: false, persistSession: false } });
  return client;
}

export async function getSupabaseUser(accessToken: string) {
  const { data, error } = await getClient().auth.getUser(accessToken);
  if (error || !data.user) return null;
  return data.user;
}
