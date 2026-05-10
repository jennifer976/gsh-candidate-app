import { Stack } from "expo-router";
import { navHeader } from "@/lib/theme";

export default function LegalLayout() {
  return (
    <Stack screenOptions={{ ...navHeader }}>
      <Stack.Screen name="index" options={{ title: "Legal" }} />
      <Stack.Screen name="[slug]" options={{ title: "Policy" }} />
    </Stack>
  );
}
