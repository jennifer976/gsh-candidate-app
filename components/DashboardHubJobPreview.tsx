import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, feedCardStyle, fontFamily, radii } from "@/lib/theme";
import type { DashboardJobListing } from "@/types/models";

/** Hub job row on the dashboard — same card language as the Jobs tab feed. */
export function DashboardHubJobPreview({
  job,
  onPress,
}: {
  job: DashboardJobListing;
  onPress: () => void;
}) {
  const metaLine = [job.locationCity, job.locationCountry].filter(Boolean).join(", ") || job.location || "";
  const meta = [metaLine, job.type].filter((x) => typeof x === "string" && x.length > 0).join(" · ");

  return (
    <View style={[styles.card, feedCardStyle()]}>
      <View style={styles.accentStrip} />
      <Pressable onPress={onPress} style={styles.hit} accessibilityRole="button">
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{job.companyName.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.mid}>
          <Text style={styles.title} numberOfLines={2}>
            {job.title}
          </Text>
          <View style={styles.companyRow}>
            <Text style={styles.company} numberOfLines={1}>
              {job.companyName}
            </Text>
            <View style={styles.sponsorPill}>
              <Ionicons name="shield-checkmark" size={10} color={colors.brandDeep} />
              <Text style={styles.sponsorPillText}>Sponsor</Text>
            </View>
          </View>
          {meta ? (
            <Text style={styles.meta} numberOfLines={1}>
              {meta}
            </Text>
          ) : null}
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
    borderRadius: 18,
    paddingVertical: 16,
    paddingRight: 14,
    paddingLeft: 20,
    overflow: "hidden",
    position: "relative",
  },
  accentStrip: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: 4,
    backgroundColor: colors.teal,
  },
  hit: { flexDirection: "row", alignItems: "flex-start", gap: 12, minWidth: 0 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: { fontSize: 18, fontFamily: fontFamily.bold, color: colors.brandDeep },
  mid: { flex: 1, minWidth: 0 },
  title: {
    fontSize: 15,
    fontFamily: fontFamily.bold,
    color: colors.navy,
    letterSpacing: -0.2,
    marginBottom: 3,
  },
  companyRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  company: { fontSize: 13, fontFamily: fontFamily.medium, color: colors.textSecondary, flexShrink: 1 },
  sponsorPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.pill,
    backgroundColor: colors.brandSoft,
  },
  sponsorPillText: { fontSize: 10, fontFamily: fontFamily.semiBold, color: colors.brandDeep },
  meta: { marginTop: 4, fontSize: 12, fontFamily: fontFamily.regular, color: colors.textMuted },
});
