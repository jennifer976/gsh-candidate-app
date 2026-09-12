import { useEffect } from "react";
import { Redirect, useLocalSearchParams } from "expo-router";
import { getMarketingSiteUrl } from "@/lib/config";
import { openExternalUrlInApp } from "@/lib/openMarketingBrowser";

export default function ResourceCompatibilityRoute() {
  const { slug } = useLocalSearchParams<{ slug?: string }>();
  useEffect(() => {
    if (typeof slug === "string" && slug.trim()) void openExternalUrlInApp(      `${getMarketingSiteUrl()}/resources/authors/${encodeURIComponent(slug)}`
    );
  }, [slug]);
  return <Redirect href="/resources" />;
}
