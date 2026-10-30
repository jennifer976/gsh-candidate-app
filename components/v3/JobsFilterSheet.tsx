import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "@/components/Icon";
import { DepthButton } from "@/components/gsh-brand";
import { BottomSheet } from "@/lib/motion";
import { PUBLIC_COUNTRIES } from "@/lib/publicResources";
import { colors, fontFamily, shadows } from "@/lib/theme";

export type JobsFilterDraft = {
  location: string;
  /** Benefit mobility string accepted by the jobs API, or "". */
  mobility: string;
  /** workMode value the public jobs API accepts, or "". */
  workMode: string;
};

const SUPPORT_OPTIONS = [
  { id: "visa", label: "Visa sponsorship", benefit: "Visa Sponsorship" },
  { id: "relocation", label: "Relocation support", benefit: "Relocation Support" },
] as const;

/** Only Remote is shown: public jobs list filters support workMode=remote. */
const WORK_MODE_OPTIONS = [
  { id: "remote", label: "Remote", workMode: "remote" },
] as const;

const GUIDE_COUNTRIES = [...PUBLIC_COUNTRIES].sort((a, b) =>
  a.name.localeCompare(b.name, "en"),
);

export function JobsFilterSheet({
  visible,
  onClose,
  draft,
  onChangeDraft,
  onClearAll,
  onShow,
  resultCount,
}: {
  visible: boolean;
  onClose: () => void;
  draft: JobsFilterDraft;
  onChangeDraft: (next: JobsFilterDraft) => void;
  onClearAll: () => void;
  onShow: () => void;
  resultCount: number | null;
}) {
  const insets = useSafeAreaInsets();
  const showLabel =
    resultCount == null
      ? "Show roles"
      : resultCount === 1
        ? "Show 1 role"
        : `Show ${resultCount} roles`;
  const disabled = resultCount === 0;

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">
          Filters
        </Text>
        <Pressable
          onPress={onClose}
          style={styles.closeHit}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Icon name="x" size={22} color={colors.navy} strokeWidth={1.8} />
        </Pressable>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.body}
      >
        <Text style={[styles.groupLabel, styles.groupLabelFirst]}>Country</Text>
        <View style={styles.countryList}>
          <Pressable
            onPress={() => onChangeDraft({ ...draft, location: "" })}
            style={[styles.countryRow, !draft.location.trim() && styles.countryRowOn]}
            accessibilityRole="button"
            accessibilityState={{ selected: !draft.location.trim() }}
          >
            <Icon name="globe" size={20} color={colors.text2} strokeWidth={1.8} />
            <Text
              style={[
                styles.countryText,
                !draft.location.trim() && styles.countryTextOn,
              ]}
            >
              Anywhere
            </Text>
          </Pressable>
          {GUIDE_COUNTRIES.map((country) => {
            const on =
              draft.location.trim().toLowerCase() === country.name.toLowerCase();
            return (
              <Pressable
                key={country.slug}
                onPress={() =>
                  onChangeDraft({ ...draft, location: country.name })
                }
                style={[styles.countryRow, on && styles.countryRowOn]}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
              >
                <Icon name="globe" size={20} color={colors.text2} strokeWidth={1.8} />
                <Text style={[styles.countryText, on && styles.countryTextOn]}>
                  {country.name}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.groupLabel}>Support</Text>
        <View style={styles.chipWrap}>
          {SUPPORT_OPTIONS.map((opt) => {
            const on = draft.mobility === opt.benefit;
            return (
              <Pressable
                key={opt.id}
                onPress={() =>
                  onChangeDraft({
                    ...draft,
                    mobility: on ? "" : opt.benefit,
                  })
                }
                style={[styles.outlineChip, on && styles.outlineChipOn]}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
              >
                <Text style={[styles.outlineChipText, on && styles.outlineChipTextOn]}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.groupLabel}>Work mode and job type</Text>
        <View style={styles.chipWrap}>
          {WORK_MODE_OPTIONS.map((opt) => {
            const on = draft.workMode === opt.workMode;
            return (
              <Pressable
                key={opt.id}
                onPress={() =>
                  onChangeDraft({
                    ...draft,
                    workMode: on ? "" : opt.workMode,
                  })
                }
                style={[styles.outlineChip, on && styles.outlineChipOn]}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
              >
                <Text style={[styles.outlineChipText, on && styles.outlineChipTextOn]}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) + 12 }]}>
        <Pressable
          onPress={onClearAll}
          accessibilityRole="button"
          accessibilityLabel="Clear all"
          hitSlop={8}
          style={styles.clearHit}
        >
          <Text style={styles.clearText}>Clear all</Text>
        </Pressable>
        <DepthButton
          title={showLabel}
          onPress={onShow}
          variant="navy"
          size="md"
          icon={null}
          disabled={disabled}
          style={styles.showBtn}
        />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  title: {
    fontFamily: fontFamily.heading,
    fontSize: 22,
    color: colors.navy,
  },
  closeHit: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.panel,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  groupLabel: {
    marginTop: 22,
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    color: colors.navy,
  },
  groupLabelFirst: { marginTop: 8 },
  countryList: { marginTop: 10, gap: 8 },
  countryRow: {
    minHeight: 52,
    borderRadius: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  countryRowOn: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  countryText: {
    flex: 1,
    fontFamily: fontFamily.medium,
    fontSize: 15,
    color: colors.navy,
  },
  countryTextOn: { color: colors.white },
  chipWrap: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  outlineChip: {
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  outlineChipOn: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  outlineChipText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    color: colors.navy,
  },
  outlineChipTextOn: { color: colors.white },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  clearHit: { minHeight: 44, justifyContent: "center" },
  clearText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    color: colors.navy,
    textDecorationLine: "underline",
  },
  showBtn: { flex: 1, ...shadows.card },
});
