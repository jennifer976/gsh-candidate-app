import { useAppCopy } from "@/lib/i18n";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";

export type ContentFeatureId = "blog" | "expert-insights";

/** User-facing placeholder while Supabase content is not wired or the catalogue is empty. */
export function ContentComingSoonCard({
  feature,
  state = "empty",
}: {
  feature: ContentFeatureId;
  state?: "empty" | "not-configured";
}) {
  const { t } = useAppCopy();
  const notConfigured = state === "not-configured";
  return (
    <View style={[styles.card, cardSurfaceStyle(true)]}>
      <View style={styles.iconWrap}>
        <Ionicons name="sparkles" size={28} color={colors.brand} />
      </View>
      <Text style={styles.eyebrow}>
        {notConfigured ? t("articlesUnavailable") : t("articlesEmpty")}
      </Text>
      <Text style={styles.body}>
        {notConfigured
          ? t("articlesUnavailableHelp")
          : t(feature === "blog" ? "articlesEmptyHelp" : "articlesResources")}
      </Text>
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
    textTransform: "lowercase",
    marginBottom: 6,
  },
  body: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },
});
