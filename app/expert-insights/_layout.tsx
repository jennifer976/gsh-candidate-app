import { Stack } from "expo-router";
import { navHeader } from "@/lib/theme";

export default function ExpertInsightsLayout() {
  return (
    <Stack screenOptions={{ ...navHeader }}>
      <Stack.Screen name="index" options={{ title: "Resources" }} />
      <Stack.Screen name="[slug]" options={{ title: "Article" }} />
      <Stack.Screen name="experts/[slug]" options={{ title: "Author" }} />
    </Stack>
  );
}
