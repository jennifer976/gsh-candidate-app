import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import type { AppCopyKey } from "@/lib/i18n/catalog";
import { useAppCopy } from "@/lib/i18n";
import { jobChipLabel, jobCountryLabel } from "@/lib/job-presentation";
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { JOB_DESTINATION_FILTERS } from "@/lib/jobDiscoverCountries";
import { VISA_ROUTE_OPTIONS } from "@/lib/job-display";
import {
  colors,
  discoverFeedCardStyle,
  discoverSearchFieldStyle,
  fontFamily,
  radii,
} from "@/lib/theme";
import type { DashboardJobListing } from "@/types/models";

const sectorKeys: Record<string, AppCopyKey> = {
  All: "jobAllSectors",
  Engineering: "jobEngineering",
  Healthcare: "jobHealthcare",
  Education: "jobEducation",
  Finance: "jobFinance",
};
type IonName = ComponentProps<typeof Ionicons>["name"];

const MOBILITY_CHIPS: { label: string; benefit: string; icon: IonName }[] = [
  {
    label: "Visa Sponsorship",
    benefit: "Visa Sponsorship",
    icon: "id-card-outline",
  },
  {
    label: "Relocation",
    benefit: "Relocation Support",
    icon: "airplane-outline",
  },
  {
    label: "Remote — Global",
    benefit: "Cross-border Remote Allowed",
    icon: "globe-outline",
  },
];

const FEATURED_VISA_ROUTES = [
  "UK Skilled Worker visa",
  "UK Health and Care Worker visa",
  "US H-1B",
  "Australia Subclass 482",
  "Australia Subclass 186",
  "Germany EU Blue Card",
  "Ireland Critical Skills Employment Permit",
  "Canada LMIA / work permit",
] satisfies Array<(typeof VISA_ROUTE_OPTIONS)[number]>;

const EXPLORE_CHIPS: { label: string; q: string }[] = [
  { label: "All", q: "" },
  { label: "Engineering", q: "software engineer" },
  { label: "Healthcare", q: "nurse healthcare clinical" },
  { label: "Education", q: "teacher lecturer education" },
  { label: "Finance", q: "finance accountant analyst" },
];

function chipActive(currentQ: string, chipQ: string): boolean {
  const c = currentQ.trim().toLowerCase();
  const t = chipQ.trim().toLowerCase();
  if (t === "") return c === "";
  return c === t;
}

/** Opens the full topics & mobility sheet (Jobie-style “filters” entry, Global Sponsor Hub copy). */
export function DiscoverTopicsFilterTrigger({
  onPress,
  query,
}: {
  onPress: () => void;
  query: string;
}) {
  const { t, locale } = useAppCopy();

  const trimmed = query.trim();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.triggerRow, discoverSearchFieldStyle()]}
      accessibilityRole="button"
      accessibilityLabel={t("jobFilterOpen")}
    >
      <View style={styles.triggerLeft}>
        <View style={styles.triggerIconWrap}>
          <Ionicons name="options-outline" size={20} color={colors.brand} />
        </View>
        <View style={styles.triggerTextCol}>
          <Text style={styles.triggerTitle}>{t("jobFiltersTitle")}</Text>
          <Text style={styles.triggerSub} numberOfLines={1}>
            {trimmed
              ? t("jobFilterSearch", { query: trimmed })
              : t("jobFilterSummary")}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </Pressable>
  );
}

export function DiscoverTopicsFilterModal({
  workModeFilter = "",
  onPickWorkMode,
  visible,
  onClose,
  query,
  location,
  mobilityFilter,
  visaRouteFilter,
  onPickExplore,
  onPickMobilityFilter,
  onPickVisaRoute,
  onPickCountry,
}: {
  visible: boolean;
  onClose: () => void;
  query: string;
  location: string;
  workModeFilter?: string;
  onPickWorkMode?: (next: string) => void;
  mobilityFilter: string;
  visaRouteFilter: string;
  onPickExplore: (next: string) => void;
  onPickMobilityFilter: (next: string) => void;
  onPickVisaRoute: (next: string) => void;
  onPickCountry: (next: string) => void;
}) {
  const { t, locale } = useAppCopy();
  const ac = useAccountCopy();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalSafe} edges={["top", "bottom"]}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{t("jobFiltersTitle")}</Text>
          <Pressable
            onPress={onClose}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={t("jobFilterClose")}
          >
            <Text style={styles.modalDone}>{t("jobDone")}</Text>
          </Pressable>
        </View>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.modalScroll}
          showsVerticalScrollIndicator={false}
        >
          {onPickWorkMode ? <>
            <Text style={styles.modalSectionLabel}>{ac("Work location")}</Text>
            <View style={[styles.exploreWrap, { marginBottom: 22 }]}>
              {[["", "Any work location"], ["remote", "Remote"], ["hybrid", "Hybrid"], ["onsite", "On-site"]].map(([value, label]) => (
                <Pressable key={value} onPress={() => { onPickWorkMode(value); onClose(); }}
                  accessibilityRole="button" accessibilityState={{ selected: workModeFilter === value }}
                  style={[styles.exploreChip, workModeFilter === value && styles.exploreChipActive]}>
                  <Text style={[styles.exploreChipText, workModeFilter === value && styles.exploreChipTextActive]}>{ac(label)}</Text>
                </Pressable>
              ))}
            </View>
          </> : null}
          <Text style={styles.modalSectionLabel}>{t("jobFilterSector")}</Text>
          <Text style={styles.modalSectionHint}>
            {t("jobFilterSectorHint")}
          </Text>
          <View style={styles.exploreWrap}>
            {EXPLORE_CHIPS.map((chip) => {
              const active = chipActive(query, chip.q);
              return (
                <Pressable
                  key={chip.q}
                  onPress={() => {
                    onPickExplore(chip.q);
                    onClose();
                  }}
                  style={[
                    styles.exploreChip,
                    active && styles.exploreChipActive,
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <Text
                    style={[
                      styles.exploreChipText,
                      active && styles.exploreChipTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    {t(sectorKeys[chip.label] ?? "jobAllSectors")}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.modalSectionLabel, { marginTop: 22 }]}>
            {t("jobDestination")}
          </Text>
          <Text style={styles.modalSectionHint}>{t("jobDestinationHint")}</Text>
          <View style={styles.exploreWrap}>
            <Pressable
              onPress={() => {
                onPickCountry("");
                onClose();
              }}
              style={[
                styles.exploreChip,
                !location.trim() && styles.exploreChipActive,
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: !location.trim() }}
            >
              <Text
                style={[
                  styles.exploreChipText,
                  !location.trim() && styles.exploreChipTextActive,
                ]}
              >
                {t("guideAllCountries")}
              </Text>
            </Pressable>
            {JOB_DESTINATION_FILTERS.map((c) => {
              const active =
                location.trim().toLowerCase() === c.value.toLowerCase();
              return (
                <Pressable
                  key={c.value}
                  onPress={() => {
                    onPickCountry(c.value);
                    onClose();
                  }}
                  style={[
                    styles.exploreChip,
                    active && styles.exploreChipActive,
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <Text
                    style={[
                      styles.exploreChipText,
                      active && styles.exploreChipTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    {jobCountryLabel(c.value, locale)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.modalSectionLabel, { marginTop: 22 }]}>
            {t("jobMobility")}
          </Text>
          <Text style={styles.modalSectionHint}>{t("jobMobilityHint")}</Text>
          <View style={styles.mobilityList}>
            {MOBILITY_CHIPS.map((chip) => {
              const active = mobilityFilter === chip.benefit;
              return (
                <Pressable
                  key={chip.benefit}
                  onPress={() => {
                    onPickMobilityFilter(active ? "" : chip.benefit);
                    onClose();
                  }}
                  style={[
                    styles.mobilityRow,
                    active && styles.mobilityRowActive,
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <Ionicons
                    name={chip.icon}
                    size={20}
                    color={active ? colors.navy : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.mobilityRowText,
                      active && styles.mobilityRowTextActive,
                    ]}
                    numberOfLines={2}
                  >
                    {jobChipLabel(chip.benefit, locale)}
                  </Text>
                  {active ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color={colors.teal}
                    />
                  ) : null}
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.modalSectionLabel, { marginTop: 22 }]}>
            {t("jobVisa")}
          </Text>
          <Text style={styles.modalSectionHint}>{t("jobVisaHint")}</Text>
          <View style={styles.exploreWrap}>
            <Pressable
              onPress={() => {
                onPickVisaRoute("");
                onClose();
              }}
              style={[
                styles.exploreChip,
                !visaRouteFilter.trim() && styles.exploreChipActive,
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: !visaRouteFilter.trim() }}
            >
              <Text
                style={[
                  styles.exploreChipText,
                  !visaRouteFilter.trim() && styles.exploreChipTextActive,
                ]}
              >
                {t("jobAllRoutes")}
              </Text>
            </Pressable>
            {FEATURED_VISA_ROUTES.map((route) => {
              const active = visaRouteFilter === route;
              return (
                <Pressable
                  key={route}
                  onPress={() => {
                    onPickVisaRoute(active ? "" : route);
                    onClose();
                  }}
                  style={[
                    styles.exploreChip,
                    active && styles.exploreChipActive,
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <Text
                    style={[
                      styles.exploreChipText,
                      active && styles.exploreChipTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    {route}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

export function DiscoverListingInfoModal({
  visible,
  onClose,
  feedTab,
}: {
  visible: boolean;
  onClose: () => void;
  feedTab: "direct" | "connected" | "curated";
}) {
  const { t, locale } = useAppCopy();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalSafe} edges={["top", "bottom"]}>
        <View style={styles.modalHeader}>
          <Text style={styles.infoTitle}>{t("jobsInfo")}</Text>
          <Pressable
            onPress={onClose}
            style={styles.modalCloseHit}
            accessibilityRole="button"
            accessibilityLabel={t("guideClose")}
          >
            <Text style={styles.modalDone}>{t("jobDone")}</Text>
          </Pressable>
        </View>
        <View style={styles.infoSheetBody}>
          <Text style={styles.infoBody}>
            {feedTab === "direct"
              ? t("jobFeedDirectBody")
              : feedTab === "connected"
                ? t("jobFeedConnectedBody")
                : t("jobFeedExternalBody")}
          </Text>
          <Pressable
            onPress={onClose}
            style={styles.infoBtn}
            accessibilityRole="button"
          >
            <Text style={styles.infoBtnText}>{t("jobGotIt")}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

export function DiscoverFeaturedStrip({
  jobs,
  onOpen,
  onViewAll,
  sectionTitle,
}: {
  jobs: DashboardJobListing[];
  onOpen: (id: string) => void;
  onViewAll?: () => void;
  /** Global Sponsor Hub-voice section heading (Jobie-style “Suggested” strip). */
  sectionTitle?: string;
}) {
  const { t, locale } = useAppCopy();

  if (jobs.length === 0) return null;

  return (
    <View style={styles.featuredOuter}>
      <View style={styles.featuredHeadRow}>
        <Text style={styles.featuredSectionTitle}>
          {sectionTitle ?? t("jobSpotlight")}
        </Text>
        {onViewAll ? (
          <Pressable
            onPress={onViewAll}
            accessibilityRole="button"
            accessibilityLabel={t("jobSpotlightAll")}
          >
            <Text style={styles.featuredViewAll}>{t("homeSeeAll")}</Text>
          </Pressable>
        ) : null}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.featuredScroll}
      >
        {jobs.map((job) => {
          const initial = (
            job.companyName?.trim()?.charAt(0) || "G"
          ).toUpperCase();
          return (
            <Pressable
              key={job._id}
              style={[styles.featuredCard, discoverFeedCardStyle()]}
              onPress={() => onOpen(job._id)}
              accessibilityRole="button"
            >
              <View style={styles.featuredCardTop}>
                <View style={styles.featuredAvatar}>
                  <Text style={styles.featuredAvatarText}>{initial}</Text>
                </View>
              </View>
              <Text style={styles.featuredCardTitle} numberOfLines={2}>
                {job.title}
              </Text>
              <Text style={styles.featuredCardCo} numberOfLines={1}>
                {job.companyName}
              </Text>
              <Text style={styles.featuredCardMeta} numberOfLines={1}>
                {[job.locationCity, job.locationCountry]
                  .filter(Boolean)
                  .join(", ") ||
                  job.location ||
                  ""}
              </Text>
              <View style={styles.featuredCardFooter}>
                <Text style={styles.featuredCardCta}>{t("jobsView")}</Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={colors.textMuted}
                />
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  triggerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  triggerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  triggerIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    backgroundColor: colors.secondaryTintBg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.purpleBorder,
  },
  triggerTextCol: { flex: 1, minWidth: 0 },
  triggerTitle: {
    fontSize: 14,
    fontFamily: fontFamily.semiBold,
    color: colors.navy,
    letterSpacing: -0.2,
  },
  triggerSub: {
    marginTop: 2,
    fontSize: 12,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
  },

  modalSafe: { flex: 1, backgroundColor: colors.background },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: fontFamily.heading,
    color: colors.navy,
    letterSpacing: -0.3,
  },
  modalCloseHit: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  modalDone: {
    fontSize: 16,
    fontFamily: fontFamily.semiBold,
    color: colors.brand,
  },
  modalScroll: { paddingHorizontal: 16, paddingBottom: 28, paddingTop: 8 },
  modalSectionLabel: {
    fontSize: 12,
    fontFamily: fontFamily.semiBold,
    color: colors.accent,
    letterSpacing: 0.2,
    textTransform: "lowercase",
  },
  modalSectionHint: {
    marginTop: 6,
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    lineHeight: 19,
    marginBottom: 12,
  },
  exploreWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  exploreChip: {
    minHeight: 44,
    justifyContent: "center",
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  exploreChipActive: {
    borderColor: colors.teal,
    backgroundColor: colors.brandSoft,
  },
  exploreChipText: {
    fontSize: 13,
    fontFamily: fontFamily.semiBold,
    color: colors.textSecondary,
  },
  exploreChipTextActive: { color: colors.navy },
  mobilityList: { gap: 10 },
  mobilityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
  },
  mobilityRowActive: {
    borderColor: colors.teal,
    backgroundColor: colors.brandSoft,
  },
  mobilityRowText: {
    flex: 1,
    fontSize: 15,
    fontFamily: fontFamily.semiBold,
    color: colors.textMarketing,
    letterSpacing: -0.2,
  },
  mobilityRowTextActive: { color: colors.navy },

  infoSheetBody: { flex: 1, padding: 20 },
  infoTitle: {
    fontSize: 18,
    fontFamily: fontFamily.bold,
    color: colors.navy,
    letterSpacing: -0.35,
  },
  infoBody: {
    marginTop: 12,
    fontSize: 15,
    fontFamily: fontFamily.regular,
    color: colors.textMarketing,
    lineHeight: 22,
  },
  infoBtn: {
    marginTop: 18,
    minHeight: 48,
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: radii.md,
    backgroundColor: colors.brand,
  },
  infoBtnText: {
    fontSize: 15,
    fontFamily: fontFamily.semiBold,
    color: colors.white,
  },

  featuredOuter: { marginTop: 12 },
  featuredHeadRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 12,
  },
  featuredSectionTitle: {
    flex: 1,
    fontSize: 19,
    fontFamily: fontFamily.extraBold,
    color: colors.navy,
    letterSpacing: -0.45,
  },
  featuredViewAll: {
    fontSize: 14,
    fontFamily: fontFamily.semiBold,
    color: colors.brand,
  },
  featuredScroll: { paddingHorizontal: 16, gap: 14, paddingBottom: 8 },
  featuredCard: {
    width: 192,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: radii.feed,
  },
  featuredCardTop: { flexDirection: "row", marginBottom: 8 },
  featuredAvatar: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    backgroundColor: colors.secondaryTintBg,
    borderWidth: 1,
    borderColor: colors.purpleBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  featuredAvatarText: {
    fontSize: 15,
    fontFamily: fontFamily.bold,
    color: colors.brand,
  },
  featuredCardTitle: {
    fontSize: 15,
    fontFamily: fontFamily.bold,
    color: colors.navy,
    letterSpacing: -0.22,
    minHeight: 38,
  },
  featuredCardCo: {
    marginTop: 6,
    fontSize: 12,
    fontFamily: fontFamily.medium,
    color: colors.textMarketing,
  },
  featuredCardMeta: {
    marginTop: 3,
    fontSize: 11,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
  },
  featuredCardFooter: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 2,
  },
  featuredCardCta: {
    fontSize: 13,
    fontFamily: fontFamily.bold,
    color: colors.brand,
  },
});
