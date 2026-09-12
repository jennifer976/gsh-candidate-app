import { Redirect } from "expo-router";

/** Compatibility route for a retired product. */
export default function RetiredToolRoute() {
  return <Redirect href="/resources" />;
}
