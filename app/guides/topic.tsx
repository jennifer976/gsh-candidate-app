import { useLocalSearchParams } from "expo-router";
import { GuideArticleScreen } from "@/components/GuideArticleScreen";

export default function GuideTopicScreen() {
  const { q } = useLocalSearchParams<{ q: string }>();
  let path = typeof q === "string" ? q : "";
  try {
    path = decodeURIComponent(path);
  } catch {
    /* An unknown path uses the unavailable state. */
  }
  return <GuideArticleScreen path={path} />;
}
