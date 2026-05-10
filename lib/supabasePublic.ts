import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

const PLACEHOLDER_HOST = "ci-build-placeholder.supabase.co";

function trimEnv(v: string | undefined): string {
  return typeof v === "string" ? v.trim() : "";
}

/** Returns null until real Expo env / `extra` keys are configured for production builds. */
export function getPublicSupabase(): SupabaseClient | null {
  const extra = Constants.expoConfig?.extra as { supabaseUrl?: string; supabaseAnonKey?: string } | undefined;
  const url = trimEnv(process.env.EXPO_PUBLIC_SUPABASE_URL) || trimEnv(extra?.supabaseUrl);
  const key = trimEnv(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) || trimEnv(extra?.supabaseAnonKey);
  if (!url || !key || url.includes(PLACEHOLDER_HOST)) return null;
  return createClient(url, key);
}
