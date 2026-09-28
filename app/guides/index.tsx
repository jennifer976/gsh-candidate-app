import { Redirect } from "expo-router";

/** The website retired `/guides`; country guides now live on the Countries pages. */
export default function RetiredGuidesHub() {
  return <Redirect href="/countries" />;
}
