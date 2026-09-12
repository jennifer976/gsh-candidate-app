import { canonicalCountryCode } from "@/lib/countries";
import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { useAppLanguage } from "@/lib/i18n";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  buildCandidateEmployerPreview,
  computeCandidateReadiness,
  type CandidateReadinessKey,
} from "@/lib/candidate-readiness";
import { colors, feedCardStyle, fontFamily, radii } from "@/lib/theme";

const ORDER: CandidateReadinessKey[] = ["account", "discovery", "compatibility", "application"];

export function CandidateReadinessSummary({
  profile,
  accountEmail,
}: {
  profile?: Record<string, unknown>;
  accountEmail?: string;
}) {
  const ac = useAccountCopy();
  const locale = useAppLanguage(s => s.locale);
  const [checksOpen, setChecksOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const readiness = useMemo(() => computeCandidateReadiness(profile, accountEmail), [accountEmail, profile]);
  const preview = useMemo(() => buildCandidateEmployerPreview(profile), [profile]);

  const countryName = (code: string) => {
    try { return new Intl.DisplayNames([locale], {type: "region"}).of(code) || code; } catch { return code; }
  };
  const registrationPreview = (Array.isArray(profile?.professionalRegistrations) ? profile.professionalRegistrations : []).map(raw => {
    const row = raw as Record<string, unknown>;
    if (!row || typeof row !== "object") return "";
    const code = canonicalCountryCode(row.country);
    const statuses: Record<string,string> = {active: "Active", pending: "Pending", expired: "Expired", not_held: "Not held", unknown: "Not sure"};
    return [typeof row.registrationType === "string" ? row.registrationType : "", code ? countryName(code) : "", typeof row.status === "string" && statuses[row.status] ? ac(statuses[row.status]) : ""].filter(Boolean).join(" · ");
  }).filter(Boolean);
  return (
    <View style={[styles.card, feedCardStyle()]}>
      <View style={styles.headingRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{ac("Your profile at a glance")}</Text>
          <Text style={styles.subtitle}>{ac("Check what is ready and what needs your input.")}</Text>
        </View>
        <Pressable style={styles.previewButton} onPress={() => setPreviewOpen(true)} accessibilityRole="button">
          <Text style={styles.previewButtonText}>{ac("Employer preview")}</Text>
        </Pressable>
      </View>
      <Pressable onPress={() => setChecksOpen(v => !v)} accessibilityLabel={ac("View profile checks")} accessibilityRole="button" accessibilityState={{expanded: checksOpen}} style={{minHeight: 44, flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}><Text style={{fontFamily: fontFamily.semiBold, color: colors.navy}}>{ac("View profile checks")}</Text><Ionicons name={checksOpen ? "chevron-up" : "chevron-down"} size={20} color={colors.accent} /></Pressable>
      <View style={[styles.dimensions, {display: checksOpen ? "flex" : "none"}]}>
        {ORDER.map((key) => {
          const item = readiness[key];
          const ready = item.status === "ready";
          return (
            <View key={key} style={styles.dimension}>
              <View style={styles.dimensionTop}>
                <Text style={styles.dimensionLabel}>{ac(item.label)}</Text>
                <Text style={[styles.status, ready && styles.statusReady]}>
                  {item.status === "off" ? ac("Off") : ready ? ac("Ready") : ac("Review")}
                </Text>
              </View>
              {!ready && item.missing[0] ? <Text style={styles.missing}>{ac(item.missing[0])}</Text> : null}
            </View>
          );
        })}
      </View>

      <Modal visible={previewOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setPreviewOpen(false)}>
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalTitle}>{ac("What employers can preview")}</Text>
              <Text style={styles.modalSubtitle}>{ac("Contact details, citizenship, CV links and registration numbers are excluded.")}</Text>
            </View>
            <Pressable onPress={() => setPreviewOpen(false)} hitSlop={12} accessibilityLabel={ac("Close employer preview")}>
              <Ionicons name="close" size={26} color={colors.navy} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.modalBody}>
            <Text style={styles.previewName}>{preview.displayName === "Candidate" && !profile?.firstName ? ac("Candidate") : preview.displayName}</Text>
            {preview.headline ? <Text style={styles.previewHeadline}>{preview.headline}</Text> : null}
            <Text style={styles.visibility}>
              {preview.discoveryEnabled ? ac("Employer discovery enabled") : ac("Employer discovery is off")}
            </Text>
            {preview.careerSummary ? <PreviewRow label={ac("Career summary")} value={preview.careerSummary} /> : null}
            {preview.experience ? <PreviewRow label={ac("Years of experience")} value={typeof profile?.yearsOfExperience === "number" ? ac("Experience in years: {count}", {count: profile.yearsOfExperience}) : ""} /> : null}
            {preview.skills.length ? <PreviewRow label={ac("Skills")} value={preview.skills.join(", ")} /> : null}
            {preview.targetCountries.length ? <PreviewRow label={ac("Target countries")} value={preview.targetCountries.map(code => countryName(code)).join(", ")} /> : null}
            {preview.sponsorship ? <PreviewRow label={ac("Sponsorship status")} value={ac(preview.sponsorship)} /> : null}
            {preview.registrations.length ? <PreviewRow label={ac("Registrations")} value={registrationPreview.join("\n")} /> : null}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.previewRow}>
      <Text style={styles.previewLabel}>{label}</Text>
      <Text style={styles.previewValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, gap: 14 },
  headingRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  title: { fontSize: 16, fontFamily: fontFamily.bold, color: colors.navy },
  subtitle: { marginTop: 4, fontSize: 12, lineHeight: 17, fontFamily: fontFamily.regular, color: colors.textMuted },
  previewButton: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: radii.sm, backgroundColor: colors.brandSoft },
  previewButtonText: { fontSize: 11, fontFamily: fontFamily.bold, color: colors.brandDeep },
  dimensions: { gap: 8 },
  dimension: { paddingTop: 9, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  dimensionTop: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  dimensionLabel: { fontSize: 13, fontFamily: fontFamily.semiBold, color: colors.textPrimary },
  status: { fontSize: 12, fontFamily: fontFamily.bold, color: "#92400e" },
  statusReady: { color: colors.navy },
  missing: { marginTop: 3, fontSize: 12, fontFamily: fontFamily.regular, color: colors.textMuted },
  modalSafe: { flex: 1, backgroundColor: colors.surfaceMuted },
  modalHeader: { flexDirection: "row", gap: 12, padding: 18, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalTitle: { fontSize: 20, fontFamily: fontFamily.extraBold, color: colors.navy },
  modalSubtitle: { marginTop: 5, fontSize: 13, lineHeight: 18, fontFamily: fontFamily.regular, color: colors.textMuted },
  modalBody: { padding: 18, gap: 12 },
  previewName: { fontSize: 24, fontFamily: fontFamily.extraBold, color: colors.navy },
  previewHeadline: { fontSize: 16, fontFamily: fontFamily.semiBold, color: colors.textSecondary },
  visibility: { padding: 11, borderRadius: radii.md, backgroundColor: colors.brandSoft, fontSize: 13, fontFamily: fontFamily.bold, color: colors.brandDeep },
  previewRow: { padding: 14, borderRadius: radii.md, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  previewLabel: { fontSize: 11, fontFamily: fontFamily.bold, color: colors.textMuted, textTransform: "lowercase" },
  previewValue: { marginTop: 5, fontSize: 14, lineHeight: 21, fontFamily: fontFamily.regular, color: colors.textPrimary },
});
