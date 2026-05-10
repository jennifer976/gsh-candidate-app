import { Redirect } from "expo-router";

/** @deprecated Use `/tools-resources` — kept for deep links and bookmarks. */
export default function LearnLegacyRedirect() {
  return <Redirect href="/tools-resources" />;
}
