import { Ionicons } from "@expo/vector-icons";
import { Redirect } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GshHomeDestinationRail } from "@/components/GshHomeDestinationRail";
import { GshPressable } from "@/components/GshPressable";
import { GshScreenShell } from "@/components/GshScreenShell";
import { GshTabHeroHeader } from "@/components/GshTabHeroHeader";
import { colors, fontFamily, radii } from "@/lib/theme";

/** Auth-free visual preview of the app-like Home (screenshots / QA). Development builds only. */
export default function UiPreviewScreen() {
  if (!__DEV__) return <Redirect href="/" />;
  return <UiPreviewContent />;
}

function UiPreviewContent() {
  const insets = useSafeAreaInsets();

  return (
    <GshScreenShell constrainTabletWidth>
      <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
        <GshTabHeroHeader paddingTop={Math.max(insets.top, 20) + 8}>
          <Text style={styles.heroTitle}>Hi, Jennifer</Text>
        </GshTabHeroHeader>

        <View style={styles.statusRow}>
          {[
            { label: "Matches", value: "3" },
            { label: "Saved", value: "2" },
            { label: "Applied", value: "1" },
          ].map((s) => (
            <View key={s.label} style={styles.statusChip}>
              <Text style={styles.statusValue}>{s.value}</Text>
              <Text style={styles.statusLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <GshHomeDestinationRail />

        <View style={styles.body}>
          <GshPressable style={styles.taskRow} onPress={() => undefined}>
            <View style={styles.taskIcon}>
              <Ionicons name="flash" size={18} color={colors.navy} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.taskEyebrow}>Next step</Text>
              <Text style={styles.taskTitle}>Browse jobs</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.navy} />
          </GshPressable>
        </View>
      </ScrollView>
    </GshScreenShell>
  );
}

const styles = StyleSheet.create({
  pad: { paddingBottom: 40 },
  heroTitle: {
    fontSize: 28,
    lineHeight: 32,
    fontFamily: fontFamily.headingStrong,
    color: colors.navy,
    letterSpacing: -0.6,
  },
  statusRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
  },
  statusChip: {
    flex: 1,
    minHeight: 64,
    borderRadius: radii.lg,
    backgroundColor: colors.navy,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  statusValue: {
    fontSize: 22,
    fontFamily: fontFamily.headingStrong,
    color: colors.cyan,
  },
  statusLabel: {
    marginTop: 2,
    fontSize: 11,
    fontFamily: fontFamily.semiBold,
    color: "rgba(255,255,255,0.72)",
  },
  body: { paddingHorizontal: 16, paddingTop: 14 },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 64,
    padding: 14,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  taskIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.cyan,
    alignItems: "center",
    justifyContent: "center",
  },
  taskEyebrow: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: colors.cyan,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  taskTitle: {
    marginTop: 2,
    fontSize: 16,
    fontFamily: fontFamily.bold,
    color: colors.navy,
  },
});
