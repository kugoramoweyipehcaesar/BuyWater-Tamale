/**
 * Supabase browser client for Realtime (postgres_changes).
 * Data access remains Prisma + DATABASE_URL.
 * Requires NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY.
 */
import { createClient } from "@supabase/supabase-js";

export function getSupabaseConfig() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  };
}

export function isSupabaseConfigured() {
  const { url, anonKey } = getSupabaseConfig();
  return Boolean(url && anonKey);
}

let _client = null;

/** Singleton browser Supabase client (null if env not set). */
export function getSupabase() {
  if (_client) return _client;
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey) return null;
  _client = createClient(url, anonKey, {
    realtime: { params: { eventsPerSecond: 10 } },
  });
  return _client;
}

/** Default export for convenience */
const supabase = typeof window !== "undefined" ? getSupabase() : null;
export default supabase;
