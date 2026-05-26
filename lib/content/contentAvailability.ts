import { SupabaseNotConfiguredError } from "@/lib/content/blogQueries";

/** True when the production build has no Supabase content keys (or CI placeholder). */
export function isSupabaseNotConfigured(err: unknown): err is SupabaseNotConfiguredError {
  return err instanceof SupabaseNotConfiguredError;
}
