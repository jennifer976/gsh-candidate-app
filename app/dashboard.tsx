import { Redirect } from "expo-router";

/** Legacy route — dashboard is now the Home tab. */
export default function DashboardRedirect() {
  return <Redirect href="/(tabs)/home" />;
}
