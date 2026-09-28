import { useLocalSearchParams } from "expo-router";
import { GuideArticleScreen } from "@/components/GuideArticleScreen";

export default function RelocationGuideScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  return <GuideArticleScreen path={`/relocating/${String(slug ?? "")}`} />;
}
