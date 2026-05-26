import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";

export type ContentFeatureId = "blog" | "expert-insights";

const FEATURE_BODY: Record<ContentFeatureId, string> = {
  blog:
    "We're preparing articles on UK mobility, careers, and sponsorship. New posts will appear here when they go live.",
  "expert-insights":
    "We're onboarding vetted mobility experts now. Briefings and deep dives will appear here when the first pieces publish.",
};

/** User-facing placeholder while Supabase content is not wired or the catalogue is empty. */
export function ContentComingSoonCard({ feature }: { feature: ContentFeatureId }) {
  return (
    <View style={[styles.card, cardSurfaceStyle(true)]}>
      <View style={styles.iconWrap}>
        <Ionicons name="sparkles" size={28} color={colors.brand} />
      </View>
      <Text style={styles.eyebrow}>Coming soon</Text>
      <Text style={styles.body}>{FEATURE_BODY[feature]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: radii.lg },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  eyebrow: {
    fontSize: 11,
    fontFamily: fontFamily.semiBold,
    color: colors.teal,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  body: { fontFamily: fontFamily.regular, fontSize: 14, lineHeight: 20, color: colors.textMuted },
});
