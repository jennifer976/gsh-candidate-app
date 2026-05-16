import { Redirect } from "expo-router";

/** Default tab route — Home is the candidate command centre (matches web dashboard). */
export default function TabsIndexRedirect() {
  return <Redirect href="/(tabs)/home" />;
}
