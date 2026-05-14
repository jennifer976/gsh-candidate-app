import { Redirect } from "expo-router";
import { useAuthStore } from "@/lib/auth-store";

/**
 * Entry: native splash (expo-splash-screen) stays up until root layout finishes
 * font load + auth hydration, then we route straight into the app — no second
 * branded screen or artificial delay here.
 */
export default function Index() {
  const token = useAuthStore((s) => s.token);
  if (token) return <Redirect href="/(tabs)" />;
  return <Redirect href="/login" />;
}
