import { Redirect } from "expo-router";
import { useAuthStore } from "@/lib/auth-store";

/**
 * Entry: native splash stays up until root layout finishes font load + auth hydration.
 */
export default function Index() {
  const token = useAuthStore((s) => s.token);
  if (token) return <Redirect href="/(tabs)/home" />;
  return <Redirect href="/login" />;
}
