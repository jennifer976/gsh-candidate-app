import { Stack } from "expo-router";
import { navHeader } from "@/lib/theme";

export default function BlogLayout() {
  return (
    <Stack screenOptions={{ ...navHeader }}>
      <Stack.Screen name="index" options={{ title: "Blog" }} />
      <Stack.Screen name="[slug]" options={{ title: "Article" }} />
    </Stack>
  );
}
