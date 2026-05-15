import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, discoverFeedCardStyle, discoverSearchFieldStyle, fontFamily, radii } from "@/lib/theme";
import type { DashboardJobListing } from "@/types/models";

type IonName = ComponentProps<typeof Ionicons>["name"];

const MOBILITY_CHIPS: { label: string; q: string; icon: IonName }[] = [
  { label: "Visa Sponsorship", q: "visa sponsorship", icon: "id-card-outline" },
  { label: "Relocation", q: "relocation support", icon: "airplane-outline" },
  { label: "Global Hiring", q: "international hiring global", icon: "globe-outline" },
];

const EXPLORE_CHIPS: { label: string; q: string }[] = [
  { label: "All", q: "" },
  { label: "Engineering", q: "software engineer" },
  { label: "Healthcare", q: "nurse healthcare clinical" },
  { label: "Education", q: "teacher lecturer education" },
  { label: "Finance", q: "finance accountant analyst" },
  { label: "Sponsorship", q: "visa sponsorship skilled worker" },
];

function chipActive(currentQ: string, chipQ: string): boolean {
  const c = currentQ.trim().toLowerCase();
  const t = chipQ.trim().toLowerCase();
  if (t === "") return c === "";
  return c === t;
}

function mobilityChipActive(currentQ: string, chipQ: string): boolean {
  return chipActive(currentQ, chipQ);
}

/** Opens the full topics & mobility sheet (Jobie-style “filters” entry, GSH copy). */
export function DiscoverTopicsFilterTrigger({ onPress, query }: { onPress: () => void; query: string }) {
  const trimmed = query.trim();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.triggerRow, discoverSearchFieldStyle()]}
      accessibilityRole="button"
      accessibilityLabel="Open topics, sectors, and mobility filters"
    >
      <View style={styles.triggerLeft}>
        <View style={styles.triggerIconWrap}>
          <Ionicons name="options-outline" size={20} color={colors.brand} />
        </View>
        <View style={styles.triggerTextCol}>
          <Text style={styles.triggerTitle}>Topics & filters</Text>
          <Text style={styles.triggerSub} numberOfLines={1}>
            {trimmed ? `Search: “${trimmed}”` : "Sectors, sponsorship, relocation"}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </Pressable>
  );
}

export function DiscoverTopicsFilterModal({
  visible,
  onClose,
  query,
  onPickExplore,
  onPickMobility,
}: {
  visible: boolean;
  onClose: () => void;
  query: string;
  onPickExplore: (next: string) => void;
  onPickMobility: (next: string) => void;
}) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalSafe} edges={["top", "bottom"]}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Topics & filters</Text>
          <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close filters">
            <Text style={styles.modalDone}>Done</Text>
          </Pressable>
        </View>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.modalScroll}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.modalSectionLabel}>Sector & role focus</Text>
          <Text style={styles.modalSectionHint}>Pick a lane — you can still fine-tune with the search bar.</Text>
          <View style={styles.exploreWrap}>
            {EXPLORE_CHIPS.map((chip) => {
              const active = chipActive(query, chip.q);
              return (
                <Pressable
                  key={chip.label}
                  onPress={() => {
                    onPickExplore(chip.q);
                    onClose();
                  }}
                  style={[styles.exploreChip, active && styles.exploreChipActive]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <Text style={[styles.exploreChipText, active && styles.exploreChipTextActive]} numberOfLines={1}>
                    {chip.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.modalSectionLabel, { marginTop: 22 }]}>Mobility & sponsorship</Text>
          <Text style={styles.modalSectionHint}>These switches search employer listings on the Hub.</Text>
          <View style={styles.mobilityList}>
            {MOBILITY_CHIPS.map((chip) => {
              const active = mobilityChipActive(query, chip.q);
              return (
                <Pressable
                  key={chip.label}
                  onPress={() => {
                    onPickMobility(chip.q);
                    onClose();
                  }}
                  style={[styles.mobilityRow, active && styles.mobilityRowActive]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <Ionicons name={chip.icon} size={20} color={active ? colors.navy : colors.textSecondary} />
                  <Text style={[styles.mobilityRowText, active && styles.mobilityRowTextActive]} numberOfLines={2}>
                    {chip.label}
                  </Text>
                  {active ? <Ionicons name="checkmark-circle" size={22} color={colors.teal} /> : null}
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
  feedTab: "employer" | "curated";
}) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={styles.infoBackdrop} onPress={onClose} accessibilityRole="button" accessibilityLabel="Dismiss">
        <View style={[styles.infoCard, discoverFeedCardStyle()]}>
          <Text style={styles.infoTitle}>How this feed works</Text>
          <Text style={styles.infoBody}>
            {feedTab === "employer"
              ? "Employer posts are hosted on Global Sponsor Hub. Where the employer enables it, you can apply in-app with your profile and CV."
              : "Curated listings are shared by partners and agencies. Tapping a role opens the employer’s own careers site — you apply there, outside the app."}
          </Text>
          <Pressable onPress={onClose} style={styles.infoBtn} accessibilityRole="button">
            <Text style={styles.infoBtnText}>Got it</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

export function DiscoverFeaturedStrip({
  jobs,
  onOpen,
  onViewAll,
  sectionTitle = "Spotlight roles",
}: {
  jobs: DashboardJobListing[];
  onOpen: (id: string) => void;
  onViewAll?: () => void;
  /** GSH-voice section heading (Jobie-style “Suggested” strip). */
  sectionTitle?: string;
}) {
  if (jobs.length === 0) return null;

  return (
    <View style={styles.featuredOuter}>
      <View style={styles.featuredHeadRow}>
        <Text style={styles.featuredSectionTitle}>{sectionTitle}</Text>
        {onViewAll ? (
          <Pressable onPress={onViewAll} accessibilityRole="button" accessibilityLabel="View all spotlight roles">
            <Text style={styles.featuredViewAll}>View all</Text>
          </Pressable>
        ) : null}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredScroll}>
        {jobs.map((job) => {
          const initial = (job.companyName?.trim()?.charAt(0) || "G").toUpperCase();
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
                {[job.locationCity, job.locationCountry].filter(Boolean).join(", ") || job.location || ""}
              </Text>
              <View style={styles.featuredCardFooter}>
                <Text style={styles.featuredCardCta}>View</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
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
  triggerLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1, minWidth: 0 },
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
  triggerTitle: { fontSize: 14, fontFamily: fontFamily.semiBold, color: colors.navy, letterSpacing: -0.2 },
  triggerSub: { marginTop: 2, fontSize: 12, fontFamily: fontFamily.regular, color: colors.textMuted },

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
  modalTitle: { fontSize: 17, fontFamily: fontFamily.bold, color: colors.navy, letterSpacing: -0.3 },
  modalDone: { fontSize: 16, fontFamily: fontFamily.semiBold, color: colors.brand },
  modalScroll: { paddingHorizontal: 16, paddingBottom: 28, paddingTop: 8 },
  modalSectionLabel: {
    fontSize: 12,
    fontFamily: fontFamily.semiBold,
    color: colors.navy,
    letterSpacing: 0.2,
    textTransform: "uppercase",
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
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  exploreChipActive: {
    borderColor: "rgba(14, 205, 209, 0.55)",
    backgroundColor: "rgba(14, 205, 209, 0.1)",
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
    borderColor: "rgba(14, 205, 209, 0.5)",
    backgroundColor: "rgba(14, 205, 209, 0.08)",
  },
  mobilityRowText: {
    flex: 1,
    fontSize: 15,
    fontFamily: fontFamily.semiBold,
    color: colors.textMarketing,
    letterSpacing: -0.2,
  },
  mobilityRowTextActive: { color: colors.navy },

  infoBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  infoCard: {
    width: "100%",
    maxWidth: 420,
    padding: 20,
    borderRadius: radii.lg,
  },
  infoTitle: { fontSize: 18, fontFamily: fontFamily.bold, color: colors.navy, letterSpacing: -0.35 },
  infoBody: {
    marginTop: 12,
    fontSize: 15,
    fontFamily: fontFamily.regular,
    color: colors.textMarketing,
    lineHeight: 22,
  },
  infoBtn: {
    marginTop: 18,
    alignSelf: "flex-start",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: radii.pill,
    backgroundColor: colors.brand,
  },
  infoBtnText: { fontSize: 15, fontFamily: fontFamily.semiBold, color: colors.white },

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
  featuredAvatarText: { fontSize: 15, fontFamily: fontFamily.bold, color: colors.brand },
  featuredCardTitle: {
    fontSize: 15,
    fontFamily: fontFamily.bold,
    color: colors.navy,
    letterSpacing: -0.22,
    minHeight: 38,
  },
  featuredCardCo: { marginTop: 6, fontSize: 12, fontFamily: fontFamily.medium, color: colors.textMarketing },
  featuredCardMeta: { marginTop: 3, fontSize: 11, fontFamily: fontFamily.regular, color: colors.textMuted },
  featuredCardFooter: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 2,
  },
  featuredCardCta: { fontSize: 13, fontFamily: fontFamily.bold, color: colors.brand },
});
