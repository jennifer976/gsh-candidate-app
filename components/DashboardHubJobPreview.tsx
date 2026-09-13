import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CompanyLogo } from "@/components/CompanyLogo";
import { resolveDashboardJobLogo } from "@/lib/brand-logo";
import { formatVisaRouteChip, visaRouteChips } from "@/lib/job-display";
import { colors, feedCardStyle, fontFamily, radii } from "@/lib/theme";
import type { DashboardJobListing, Job } from "@/types/models";

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
  const visaChip = visaRouteChips(job as Job, 1)[0];

  return (
    <View style={[styles.card, feedCardStyle()]}>
      <Pressable onPress={onPress} style={styles.hit} accessibilityRole="button">
        <CompanyLogo logoUrl={logoUrl} companyName={job.companyName} size={48} radius={12} />
        <View style={styles.mid}>
          <View style={styles.companyRow}>
            <Text style={styles.company} numberOfLines={1}>
              {job.companyName}
            </Text>
          </View>
          <Text style={styles.title} numberOfLines={2}>
            {job.title}
          </Text>
          {meta ? (
            <Text style={styles.meta} numberOfLines={1}>
              {meta}
            </Text>
          ) : null}
          {visaChip ? (
            <View style={styles.visaPill}>
              <Text style={styles.visaPillText} numberOfLines={1}>
                {formatVisaRouteChip(visaChip)}
              </Text>
            </View>
          ) : null}
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    paddingVertical: 12,
    paddingRight: 12,
    paddingLeft: 16,
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
    fontSize: 14,
    fontFamily: fontFamily.bold,
    color: colors.navy,
    letterSpacing: -0.2,
    marginBottom: 2,
    lineHeight: 19,
  },
  companyRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  company: { fontSize: 13, fontFamily: fontFamily.medium, color: colors.textSecondary, flexShrink: 1 },
  meta: { marginTop: 4, fontSize: 12, fontFamily: fontFamily.regular, color: colors.textMuted },
  visaPill: {
    marginTop: 7,
    alignSelf: "flex-start",
    maxWidth: "100%",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.teal,
    backgroundColor: colors.brandSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  visaPillText: { fontSize: 10, fontFamily: fontFamily.medium, color: colors.navy },
});
