import { Stack } from "expo-router";
import { navHeader } from "@/lib/theme";

export default function GuidesLayout() {
  return (
    <Stack
      screenOptions={{
        ...navHeader,
      }}
    >
      <Stack.Screen name="index" options={{ title: "Guides hub" }} />
      <Stack.Screen name="country/[slug]" options={{ title: "Country guide" }} />
      <Stack.Screen name="topic" options={{ title: "Guide" }} />
    </Stack>
  );
}
