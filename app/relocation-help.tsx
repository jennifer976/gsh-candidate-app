import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { Stack, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, fontFamily, navHeader, radii } from "@/lib/theme";

const DOORS = [
  {
    title: "Country guides",
    copy: "See destination context before you apply.",
    href: "/guides",
  },
  {
    title: "Relocation worksheets",
    copy: "Budget and checklist the move yourself.",
    href: "/relocation-worksheets",
  },
  {
    title: "Mobility partners",
    copy: "Find visa, housing, and relocation specialists.",
    href: "/partners",
  },
  {
    title: "Compare countries",
    copy: "Line up destinations side by side.",
    href: "/compare-countries",
  },
] as const;

export default function RelocationHelpScreen() {
  const ac = useAccountCopy();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <Stack.Screen options={{ title: ac("Plan the move"), ...navHeader }} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>{ac("Plan the move")}</Text>
          <Text style={styles.copy}>
            {ac(
              "Use the live tools below to compare destinations, work through worksheets, and find mobility partners. Specialist request forms are not on this app yet.",
            )}
          </Text>
        </View>
        {DOORS.map((door) => (
          <Pressable
            key={door.href}
            style={styles.row}
            onPress={() => router.push(door.href)}
            accessibilityRole="button"
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{ac(door.title)}</Text>
              <Text style={styles.rowMeta}>{ac(door.copy)}</Text>
            </View>
            <Text style={styles.open}>{ac("Open")}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceMuted },
  content: { padding: 16, paddingBottom: 48, gap: 12 },
  card: {
    padding: 16,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  title: { fontSize: 21, fontFamily: fontFamily.heading, color: colors.navy },
  copy: {
    fontSize: 13,
    lineHeight: 19,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
  },
  row: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowTitle: { fontSize: 15, fontFamily: fontFamily.bold, color: colors.navy },
  rowMeta: {
    marginTop: 5,
    fontSize: 12,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
  },
  open: { color: colors.brand, fontFamily: fontFamily.semiBold },
});
