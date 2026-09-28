import { Redirect } from "expo-router";

/** Career tools now live on the single Tools and resources screen. */
export default function ToolsRoute() {
  return <Redirect href="/tools-resources" />;
}
