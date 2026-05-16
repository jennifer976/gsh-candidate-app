import { Redirect } from "expo-router";

/* The "More" menu lives on Profile — keep deep links working. */
export default function MoreTabRedirect() {
  return <Redirect href="/(tabs)/profile" />;
}
