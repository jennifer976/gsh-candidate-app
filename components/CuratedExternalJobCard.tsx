import { useAppCopy } from "@/lib/i18n";
import { jobChipLabel, jobCountryLabel, jobAgeLabel, sponsorshipTone } from "@/lib/job-presentation";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { CompanyLogo } from "@/components/CompanyLogo";
import { DepthPressable } from "@/components/gsh-brand";
import { resolveBrandImageUrl } from "@/lib/brand-logo";
import { curatedListingPrimaryBadge } from "@/lib/curated-listing-labels";
import { externalListingChips, getExternalListingLocationLabel } from "@/lib/job-display";
import { colors, fontFamily, radii } from "@/lib/theme";
import type { ExternalJobListingPublic } from "@/types/models";

const CHIP_CAP = 3;

/** Listing that applies on the source site. Featured listings get the navy card. */
export function CuratedExternalJobCard({
  job,
  onPress,
}: {
  job: ExternalJobListingPublic;
  onPress: () => void;
}) {
  const { t, locale } = useAppCopy();

  const rawLocation = getExternalListingLocationLabel(job);
  const locationLabel =
    rawLocation === "See listing for location"
      ? ""
      : rawLocation === "Remote / hybrid — see listing"
        ? t("jobRemoteHint")
        : jobCountryLabel(rawLocation, locale);
  const isAgency = curatedListingPrimaryBadge(job) === "Agency";
  const isConnected = job.sourceRelationship === "employer_connected" && job.employerPermissionStatus === "approved";
  const kindLabel = isConnected ? t("jobsConnectedBadge") : isAgency ? t("jobsAgency") : t("jobsExternalBadge");
  const age = jobAgeLabel(job.externalPostedAt ?? job.createdAt, locale);
  const companyName = job.companyName || t("screenEmployer");
  const subline = [companyName, locationLabel].filter(Boolean).join(" · ");
  const chips = externalListingChips(job, CHIP_CAP).map((c) => jobChipLabel(c, locale));
  const featured = Boolean(job.isFeatured);
  const hint = t(isConnected ? "jobsApplyEmployer" : "jobsApplySource");

  if (featured) {
    return (
      <DepthPressable
        onPress={onPress}
        face={colors.navy}
        depthColor={colors.cyan}
        depth={5}
        radius={24}
        accessibilityLabel={`${job.title}, ${subline}. ${hint}`}
      >
        <View style={styles.band}>
          <View style={styles.bandLeft}>
            <Ionicons name="star" size={12} color={colors.navy} />
            <Text style={styles.bandText}>{t("jobsFeatured")}</Text>
          </View>
          {age ? <Text style={styles.bandAge}>{age}</Text> : null}
        </View>
        <View style={styles.featureBody}>
          <View style={styles.head}>
            <CompanyLogo
              logoUrl={resolveBrandImageUrl(job.companyLogo)}
              companyName={companyName}
              size={48}
              radius={14}
            />
            <View style={styles.headText}>
              <Text style={[styles.subline, styles.sublineOnNavy]} numberOfLines={1}>
                {subline}
              </Text>
              <Text style={[styles.title, styles.titleFeature]} numberOfLines={2}>
                {job.title}
              </Text>
            </View>
          </View>
          <View style={styles.pills}>
            <View style={[styles.pill, styles.pillOnNavy]}>
              <Text style={[styles.pillText, styles.pillTextCyan]}>{kindLabel}</Text>
            </View>
            {chips.map((label) => {
              const tone = sponsorshipTone(label);
              return (
              <View key={label} style={[styles.pill, tone === "yes" ? styles.pillSponsor : tone === "no" ? styles.pillNoSponsor : styles.pillOnNavy]}>
                <Text style={[styles.pillText, styles.pillTextOn]} numberOfLines={1}>
                  {label}
                </Text>
              </View>
              );
            })}
          </View>
          <View style={styles.featureCta}>
            <Text style={styles.featureCtaText}>{t("jobsDetails")}</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.navy} />
          </View>
        </View>
      </DepthPressable>
    );
  }

  return (
    <DepthPressable
      onPress={onPress}
      depth={5}
      radius={24}
      borderWidth={2}
      borderColor={colors.navy}
      accessibilityLabel={`${job.title}, ${subline}. ${hint}`}
      innerStyle={styles.card}
    >
      <View style={styles.head}>
        <CompanyLogo
          logoUrl={resolveBrandImageUrl(job.companyLogo)}
          companyName={companyName}
          size={48}
          radius={14}
        />
        <View style={styles.headText}>
          <Text style={styles.subline} numberOfLines={1}>
            {subline}
          </Text>
          <Text style={styles.title} numberOfLines={2}>
            {job.title}
          </Text>
        </View>
        <View style={styles.openDisc}>
          <Ionicons name="open-outline" size={18} color={colors.navy} />
        </View>
      </View>
      <View style={styles.pills}>
        {chips.map((label, index) => {
          const tone = sponsorshipTone(label);
          return (
          <View key={label} style={[styles.pill, tone === "yes" ? styles.pillSponsor : tone === "no" ? styles.pillNoSponsor : index === 0 ? styles.pillNavy : styles.pillPale]}>
            <Text style={[styles.pillText, (tone || index === 0) && styles.pillTextOn]} numberOfLines={1}>
              {label}
            </Text>
          </View>
          );
        })}
        <View style={[styles.pill, styles.pillPale]}>
          <Text style={styles.pillText}>{kindLabel}</Text>
        </View>
        {age ? (
          <View style={[styles.pill, styles.pillPale]}>
            <Text style={styles.pillText}>{age}</Text>
          </View>
        ) : null}
      </View>
    </DepthPressable>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16 },
  head: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  headText: { flex: 1, minWidth: 0 },
  subline: { fontSize: 12, fontFamily: fontFamily.semiBold, color: colors.textMuted },
  sublineOnNavy: { color: "rgba(255,255,255,0.6)" },
  title: {
    marginTop: 4,
    fontSize: 16,
    lineHeight: 20,
    fontFamily: fontFamily.heading,
    color: colors.navy,
    letterSpacing: -0.2,
  },
  titleFeature: { fontSize: 18, lineHeight: 23, color: colors.white },
  openDisc: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cyan,
    alignItems: "center",
    justifyContent: "center",
  },
  pills: { marginTop: 12, flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start", gap: 8 },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.pill, maxWidth: "100%" },
  pillNavy: { backgroundColor: colors.navy },
  pillSponsor: { backgroundColor: "#059669" },
  pillNoSponsor: { backgroundColor: "#E11D48" },
  pillPale: { backgroundColor: colors.pale },
  pillOnNavy: { backgroundColor: "rgba(255,255,255,0.1)" },
  pillText: { fontSize: 11, fontFamily: fontFamily.bold, color: colors.navy },
  pillTextCyan: { color: colors.cyan },
  pillTextOn: { color: "#ffffff" },
  band: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.cyan,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  bandLeft: { flexDirection: "row", alignItems: "center", gap: 5 },
  bandText: {
    fontSize: 10,
    fontFamily: fontFamily.extraBold,
    color: colors.navy,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  bandAge: { fontSize: 12, fontFamily: fontFamily.heading, color: colors.navy },
  featureBody: { padding: 16 },
  featureCta: {
    marginTop: 16,
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: colors.cyan,
    borderBottomWidth: 4,
    borderBottomColor: colors.navyDeep,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  featureCtaText: {
    fontSize: 14,
    fontFamily: fontFamily.heading,
    color: colors.navy,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
});
