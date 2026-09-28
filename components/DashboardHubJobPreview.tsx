import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CompanyLogo } from "@/components/CompanyLogo";
import { GshPressable } from "@/components/GshPressable";
import { resolveDashboardJobLogo } from "@/lib/brand-logo";
import { formatVisaRouteChip, visaRouteChips } from "@/lib/job-display";
import { colors, fontFamily, radii } from "@/lib/theme";
import type { DashboardJobListing, Job } from "@/types/models";

type Props = {
  job: DashboardJobListing;
  onPress: () => void;
  /** Horizontal discovery card, featured hero band, or compact list row. */
  variant?: "card" | "hero" | "row";
  featuredLabel?: string;
  viewLabel?: string;
};

function formatSalaryRange(job: DashboardJobListing): string {
  if (job.minSalary == null && job.maxSalary == null) return "";
  const fmt = (n: number) =>
    n >= 1000 ? `${Math.round(n / 1000)}k` : String(n);
  if (job.minSalary != null && job.maxSalary != null) {
    return `£${fmt(job.minSalary)}–£${fmt(job.maxSalary)}`;
  }
  if (job.minSalary != null) return `From £${fmt(job.minSalary)}`;
  return "";
}

/** Job preview — hero / card / row for Home discovery. */
export function DashboardHubJobPreview({
  job,
  onPress,
  variant = "card",
  featuredLabel = "Featured",
  viewLabel = "View",
}: Props) {
  const metaLine =
    [job.locationCity, job.locationCountry].filter(Boolean).join(", ") ||
    job.location ||
    "";
  const meta = [metaLine, job.type]
    .filter((x) => typeof x === "string" && x.length > 0)
    .join(" · ");
  const logoUrl = resolveDashboardJobLogo(job);
  const visaChip = visaRouteChips(job as Job, 1)[0];
  const salary = formatSalaryRange(job);

  if (variant === "row") {
    return (
      <Pressable
        onPress={onPress}
        style={styles.rowHit}
        accessibilityRole="button"
        android_ripple={{ color: "rgba(13,25,78,0.06)" }}
      >
        <CompanyLogo logoUrl={logoUrl} companyName={job.companyName} size={44} radius={10} />
        <View style={styles.mid}>
          <Text style={styles.company} numberOfLines={1}>
            {job.companyName}
          </Text>
          <Text style={styles.title} numberOfLines={2}>
            {job.title}
          </Text>
          {meta ? (
            <Text style={styles.meta} numberOfLines={1}>
              {meta}
            </Text>
          ) : null}
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </Pressable>
    );
  }

  if (variant === "hero") {
    return (
      <GshPressable
        style={styles.hero}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${featuredLabel}. ${job.title} at ${job.companyName}`}
        pressScale={0.985}
      >
        <View style={styles.heroTop}>
          <View style={styles.heroLogoWell}>
            <CompanyLogo
              logoUrl={logoUrl}
              companyName={job.companyName}
              size={72}
              radius={18}
            />
          </View>
          <View style={styles.heroMid}>
            <View style={styles.featuredPill}>
              <Text style={styles.featuredPillText}>{featuredLabel}</Text>
            </View>
            <Text style={styles.heroCompany} numberOfLines={1}>
              {job.companyName}
            </Text>
            <Text style={styles.heroTitle} numberOfLines={3}>
              {job.title}
            </Text>
          </View>
        </View>
        {meta ? (
          <View style={styles.heroMetaRow}>
            <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.65)" />
            <Text style={styles.heroMeta} numberOfLines={1}>
              {meta}
            </Text>
          </View>
        ) : null}
        <View style={styles.heroFooter}>
          <View style={styles.heroFooterLeft}>
            {visaChip ? (
              <View style={styles.heroVisaPill}>
                <Text style={styles.heroVisaText} numberOfLines={1}>
                  {formatVisaRouteChip(visaChip)}
                </Text>
              </View>
            ) : null}
            {salary ? (
              <Text style={styles.heroSalary} numberOfLines={1}>
                {salary}
              </Text>
            ) : null}
          </View>
          <View style={styles.heroCta}>
            <Text style={styles.heroCtaText}>{viewLabel}</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.navy} />
          </View>
        </View>
      </GshPressable>
    );
  }

  return (
    <GshPressable
      style={styles.card}
      onPress={onPress}
      accessibilityRole="button"
      pressScale={0.98}
    >
      <View style={styles.cardTop}>
        <CompanyLogo logoUrl={logoUrl} companyName={job.companyName} size={52} radius={14} />
        <View style={styles.cardMid}>
          <Text style={styles.company} numberOfLines={1}>
            {job.companyName}
          </Text>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {job.title}
          </Text>
        </View>
      </View>
      {meta ? (
        <Text style={styles.meta} numberOfLines={1}>
          {meta}
        </Text>
      ) : null}
      {salary ? (
        <Text style={styles.cardSalary} numberOfLines={1}>
          {salary}
        </Text>
      ) : null}
      <View style={styles.cardFooter}>
        {visaChip ? (
          <View style={styles.visaPill}>
            <Text style={styles.visaPillText} numberOfLines={1}>
              {formatVisaRouteChip(visaChip)}
            </Text>
          </View>
        ) : (
          <View style={styles.easyApplyMini}>
            <Ionicons name="flash" size={12} color={colors.navy} />
            <Text style={styles.easyApplyMiniText}>Easy apply</Text>
          </View>
        )}
        <View style={styles.viewRow}>
          <Text style={styles.viewLabel}>{viewLabel}</Text>
          <Ionicons name="arrow-forward" size={14} color={colors.navy} />
        </View>
      </View>
    </GshPressable>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.navy,
    borderRadius: radii.xl,
    padding: 18,
    gap: 14,
    overflow: "hidden",
  },
  heroTop: { flexDirection: "row", gap: 14, alignItems: "flex-start" },
  heroLogoWell: {
    padding: 4,
    borderRadius: 22,
    backgroundColor: colors.white,
  },
  heroMid: { flex: 1, minWidth: 0, gap: 6 },
  featuredPill: {
    alignSelf: "flex-start",
    backgroundColor: colors.cyan,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  featuredPillText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: colors.navy,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  heroCompany: {
    fontSize: 13,
    fontFamily: fontFamily.medium,
    color: "rgba(255,255,255,0.7)",
  },
  heroTitle: {
    fontSize: 20,
    fontFamily: fontFamily.headingStrong,
    color: colors.white,
    letterSpacing: -0.4,
    lineHeight: 26,
  },
  heroMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  heroMeta: {
    flex: 1,
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: "rgba(255,255,255,0.65)",
  },
  heroFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 2,
  },
  heroFooterLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  heroVisaPill: {
    maxWidth: "100%",
    borderRadius: radii.pill,
    backgroundColor: "rgba(66,224,227,0.18)",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  heroVisaText: {
    fontSize: 11,
    fontFamily: fontFamily.semiBold,
    color: colors.cyan,
  },
  heroSalary: {
    fontSize: 14,
    fontFamily: fontFamily.bold,
    color: colors.white,
  },
  heroCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.cyan,
    borderRadius: radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  heroCtaText: {
    fontSize: 14,
    fontFamily: fontFamily.bold,
    color: colors.navy,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: 16,
    gap: 10,
    minHeight: 148,
  },
  cardTop: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  cardMid: { flex: 1, minWidth: 0 },
  cardTitle: {
    marginTop: 4,
    fontSize: 17,
    fontFamily: fontFamily.heading,
    color: colors.navy,
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  cardFooter: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  visaPill: {
    maxWidth: "70%",
    borderRadius: radii.pill,
    backgroundColor: colors.brandSoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  visaPillText: {
    fontSize: 11,
    fontFamily: fontFamily.semiBold,
    color: colors.navy,
  },
  easyApplyMini: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: radii.pill,
    backgroundColor: "rgba(66,224,227,0.22)",
  },
  easyApplyMiniText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: colors.navy,
  },
  viewRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  viewLabel: {
    fontSize: 13,
    fontFamily: fontFamily.bold,
    color: colors.navy,
  },
  rowHit: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minWidth: 0,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.white,
  },
  mid: { flex: 1, minWidth: 0 },
  company: {
    fontSize: 13,
    fontFamily: fontFamily.medium,
    color: colors.textSecondary,
  },
  title: {
    marginTop: 2,
    fontSize: 16,
    fontFamily: fontFamily.semiBold,
    color: colors.navy,
    letterSpacing: -0.2,
    lineHeight: 21,
  },
  meta: {
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
  },
  cardSalary: {
    marginTop: 4,
    fontSize: 14,
    fontFamily: fontFamily.semiBold,
    color: colors.navy,
  },
});
