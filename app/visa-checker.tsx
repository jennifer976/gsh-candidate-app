import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshContentAccentBar, GshScreenIntro } from "@/components/gsh-ui-kit";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { stackScrollContentStyle } from "@/lib/screen-layout";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";

/**
 * Soft-gated until sponsor-register coverage is ready.
 * Keep the route so deep links / tools rows do not break — show Coming soon only.
 */
export default function VisaCheckerScreen() {
  const router = useRouter();

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
          <GshScreenIntro
            eyebrow="Tools"
            title="Company sponsor checker"
            subtitle="Coming soon — sponsor-register lookup before you apply."
            style={{ marginBottom: 10 }}
          />
          <GshContentAccentBar />

          <View style={[styles.card, cardSurfaceStyle(true)]}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Coming soon</Text>
            </View>
            <Text style={styles.body}>
              We’re finishing sponsor-register coverage and name matching so results stay useful. When it launches, you’ll
              search a company, see possible register matches, and confirm against official sources.
            </Text>
            <Pressable
              style={styles.primaryBtn}
              onPress={() => router.push("/tools")}
              accessibilityRole="button"
              accessibilityLabel="Back to career toolkit"
            >
              <Text style={styles.primaryBtnText}>Back to career toolkit</Text>
            </Pressable>
            <Pressable
              style={styles.secondaryBtn}
              onPress={() => router.push("/(tabs)/jobs")}
              accessibilityRole="button"
            >
              <Ionicons name="briefcase-outline" size={18} color={colors.brandDeep} />
              <Text style={styles.secondaryBtnText}>Browse jobs</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  pad: { ...stackScrollContentStyle, paddingBottom: 40, gap: 14 },
  card: { borderRadius: radii.lg, padding: 18, gap: 14 },
  badge: {
    alignSelf: "flex-start",
    borderRadius: radii.pill,
    backgroundColor: "#fff7ed",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: "#9a3412",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  body: { fontSize: 15, fontFamily: fontFamily.regular, color: colors.textMarketing, lineHeight: 22 },
  primaryBtn: {
    marginTop: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.navy,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryBtnText: { fontSize: 15, fontFamily: fontFamily.bold, color: colors.white },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.white,
    paddingVertical: 12,
  },
  secondaryBtnText: { fontSize: 14, fontFamily: fontFamily.bold, color: colors.brandDeep },
});
