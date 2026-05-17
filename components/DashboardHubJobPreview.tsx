import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CompanyLogo } from "@/components/CompanyLogo";
import { resolveDashboardJobLogo } from "@/lib/brand-logo";
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
  const logoUrl = resolveDashboardJobLogo(job);

  return (
    <View style={[styles.card, feedCardStyle()]}>
      <View style={styles.accentStrip} />
      <Pressable onPress={onPress} style={styles.hit} accessibilityRole="button">
        <CompanyLogo logoUrl={logoUrl} companyName={job.companyName} size={48} radius={14} />
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
