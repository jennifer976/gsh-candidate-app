import { useAppCopy } from "@/lib/i18n";
import { Stack } from "expo-router";
import { navHeader } from "@/lib/theme";

export default function GuidesLayout() {
  const { t } = useAppCopy();
  return (
    <Stack
      screenOptions={{
        ...navHeader,
      }}
    >
      <Stack.Screen name="topic" options={{ title: t("guideTitle") }} />
    </Stack>
  );
}
