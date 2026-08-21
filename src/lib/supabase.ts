import { createClient, SupabaseClient } from "@supabase/supabase-js";

function cleanEnv(val?: string): string {
  if (!val) return "";
  let clean = val.trim();
  // Strip any leading '=' signs or extra quotes
  while (clean.startsWith("=") || clean.startsWith('"') || clean.startsWith("'")) {
    clean = clean.replace(/^([="'\s]+)/, "");
  }
  while (clean.endsWith('"') || clean.endsWith("'")) {
    clean = clean.replace(/(["'\s]+)$/, "");
  }
  return clean.trim();
}

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseUrl = cleanEnv(rawUrl) || "https://placeholder-supabase.supabase.co";
export const supabaseAnonKey = cleanEnv(rawKey) || "placeholder-anon-key";

/**
 * Supabase client instance.
 * Automatically configured when NEXT_PUBLIC_SUPABASE_URL & NEXT_PUBLIC_SUPABASE_ANON_KEY
 * are present in environment variables.
 */
let clientInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!clientInstance) {
    clientInstance = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      }
    );
  }
  return clientInstance;
}

export const supabase = getSupabase();

export function isSupabaseConfigured(): boolean {
  const url = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  return Boolean(
    url &&
      key &&
      !url.includes("placeholder") &&
      url.startsWith("https://")
  );
}
