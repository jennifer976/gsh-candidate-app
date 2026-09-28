import { Redirect } from "expo-router";

/**
 * Entry: native splash stays up until root layout finishes font load + auth hydration.
 * Guests land on Home too, so they can browse jobs before creating an account.
 */
export default function Index() {
  return <Redirect href="/(tabs)/home" />;
}
