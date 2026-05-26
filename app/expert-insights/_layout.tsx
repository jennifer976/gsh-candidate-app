import { Stack } from "expo-router";
import { navHeader } from "@/lib/theme";

export default function ExpertInsightsLayout() {
  return (
    <Stack screenOptions={{ ...navHeader }}>
      <Stack.Screen name="index" options={{ title: "Expert Insights" }} />
      <Stack.Screen name="[slug]" options={{ title: "Insight" }} />
      <Stack.Screen name="experts/[slug]" options={{ title: "Expert" }} />
    </Stack>
  );
}
