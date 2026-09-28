import { useLocalSearchParams } from "expo-router";
import { GuideArticleScreen } from "@/components/GuideArticleScreen";

export default function GuideScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  return <GuideArticleScreen path={`/${String(slug ?? "")}`} />;
}
