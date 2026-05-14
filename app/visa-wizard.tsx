import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshScreenIntro, GshSectionTitle } from "@/components/gsh-ui-kit";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import {
  type CandidateInput,
  evaluateVisaRoutes,
  getSalaryCurrencyCode,
  SUPPORTED_COUNTRIES,
  type OrientationTier,
} from "@/lib/visaWizard/rules";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";

const NATIONALITY_OPTIONS = ["United Kingdom", "India", "Nigeria", "Pakistan", "United States", "Philippines"];

const VW = {
  sectionProfile: "Your profile",
  sectionRoutes: "Possible routes for this destination",
  situationHeading: "Your nationality and location",
  routesLead: "Ranked using a simple checklist versus indicative thresholds — not a precise eligibility score.",
  targetCountry: "Destination country",
  nationality: "Nationality (passport)",
  currentCountry: "Current country of residence",
  currentCountryHint: "Helps flag whether you may be applying from abroad vs in-country.",
  role: "Job role",
  salaryLabel: "Expected annual salary",
  salaryCurrencyHint: "Enter gross annual pay in {currency} for this destination.",
  experience: "Years of experience",
  eduNone: "No formal degree",
  eduBachelor: "Bachelor's degree",
  eduMaster: "Master's degree",
  eduDoctorate: "Doctorate / PhD",
  education: "Education level",
  sponsorCheckbox: "I already have an employer sponsor",
  relocationCheckbox: "Open to relocation support",
  tierHigh: "Strong orientation fit",
  tierModerate: "Moderate orientation fit",
  tierLimited: "Limited orientation fit",
  tierFootnote: "Labels reflect our internal checklist weighting — not government scoring.",
  signalsAlign: "Aligned signals",
  verifyItems: "Things to verify",
  noRoutes: "No routes are configured for this destination yet.",
  officialGuidance: "Official guidance",
  disclaimerStrong: "Educational orientation only.",
  disclaimerRest:
    " Results use a fixed in-product rules list — not legal advice and not a prediction of approval. Always verify with official government immigration pages.",
};

function tierColors(tier: OrientationTier): { bg: string; border: string; text: string } {
  if (tier === "high") return { bg: "rgba(16, 185, 129, 0.12)", border: "rgba(16, 185, 129, 0.35)", text: "#065f46" };
  if (tier === "moderate") return { bg: "rgba(245, 158, 11, 0.14)", border: "rgba(245, 158, 11, 0.4)", text: "#92400e" };
  return { bg: "rgba(148, 163, 184, 0.15)", border: "rgba(148, 163, 184, 0.45)", text: "#334155" };
}

function ChipRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly string[] | string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.chipWrap}>
        {options.map((opt) => {
          const on = value === opt;
          return (
            <Pressable
              key={opt}
              onPress={() => onChange(opt)}
              style={[styles.chip, on && styles.chipOn]}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
            >
              <Text style={[styles.chipText, on && styles.chipTextOn]} numberOfLines={2}>
                {opt}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function VisaWizardScreen() {
  const router = useRouter();
  const [input, setInput] = useState<CandidateInput>({
    destinationCountry: "United Kingdom",
    nationality: "India",
    currentCountry: "India",
    role: "",
    annualSalary: 45000,
    educationLevel: "bachelor",
    yearsExperience: 3,
    hasEmployerSponsor: false,
    needsRelocation: true,
  });

  const { situationNotes, results } = useMemo(() => evaluateVisaRoutes(input), [input]);
  const salaryCurrencyCode = getSalaryCurrencyCode(input.destinationCountry);

  const educationOptions: Array<{ value: CandidateInput["educationLevel"]; label: string }> = [
    { value: "none", label: VW.eduNone },
    { value: "bachelor", label: VW.eduBachelor },
    { value: "master", label: VW.eduMaster },
    { value: "doctorate", label: VW.eduDoctorate },
  ];

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <ScrollView contentContainerStyle={styles.pad} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <GshScreenIntro
            eyebrow="Mobility"
            title="Visa wizard"
            subtitle="Indicative routes from an in-app checklist — not legal advice. Always confirm with official government sources."
            style={{ marginBottom: 12 }}
          />
          <LinearGradient colors={[colors.teal, colors.brand]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.accentBar} />

          <View style={[styles.banner, cardSurfaceStyle(true)]}>
            <Text style={styles.bannerStrong}>{VW.disclaimerStrong}</Text>
            <Text style={styles.bannerRest}>{VW.disclaimerRest}</Text>
          </View>

          <View style={[styles.card, cardSurfaceStyle(true)]}>
            <GshSectionTitle title={VW.sectionProfile} topSpacing="none" style={{ marginBottom: 12 }} />

            <ChipRow
              label={VW.targetCountry}
              options={SUPPORTED_COUNTRIES}
              value={input.destinationCountry}
              onChange={(destinationCountry) => setInput((p) => ({ ...p, destinationCountry }))}
            />

            <ChipRow
              label={VW.nationality}
              options={NATIONALITY_OPTIONS}
              value={input.nationality}
              onChange={(nationality) => setInput((p) => ({ ...p, nationality }))}
            />

            <Text style={styles.label}>{VW.currentCountry}</Text>
            <TextInput
              style={styles.input}
              value={input.currentCountry}
              onChangeText={(currentCountry) => setInput((p) => ({ ...p, currentCountry }))}
              placeholder="e.g. India"
              placeholderTextColor={colors.placeholder}
            />
            <Text style={styles.hint}>{VW.currentCountryHint}</Text>

            <Text style={styles.label}>{VW.role}</Text>
            <TextInput
              style={styles.input}
              value={input.role}
              onChangeText={(role) => setInput((p) => ({ ...p, role }))}
              placeholder="e.g. Senior Nurse"
              placeholderTextColor={colors.placeholder}
            />

            <Text style={styles.label}>{VW.salaryLabel}</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={String(input.annualSalary)}
              onChangeText={(t) => setInput((p) => ({ ...p, annualSalary: Number(t.replace(/[^0-9]/g, "")) || 0 }))}
            />
            <Text style={styles.hint}>{VW.salaryCurrencyHint.replace("{currency}", salaryCurrencyCode)}</Text>

            <Text style={styles.label}>{VW.experience}</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={String(input.yearsExperience)}
              onChangeText={(t) => setInput((p) => ({ ...p, yearsExperience: Number(t.replace(/[^0-9]/g, "")) || 0 }))}
            />

            <Text style={styles.label}>{VW.education}</Text>
            <View style={styles.chipWrap}>
              {educationOptions.map((o) => {
                const on = input.educationLevel === o.value;
                return (
                  <Pressable
                    key={o.value}
                    onPress={() => setInput((p) => ({ ...p, educationLevel: o.value }))}
                    style={[styles.chip, on && styles.chipOn]}
                  >
                    <Text style={[styles.chipText, on && styles.chipTextOn]}>{o.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>{VW.sponsorCheckbox}</Text>
              <Switch
                value={input.hasEmployerSponsor}
                onValueChange={(hasEmployerSponsor) => setInput((p) => ({ ...p, hasEmployerSponsor }))}
              />
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>{VW.relocationCheckbox}</Text>
              <Switch value={input.needsRelocation} onValueChange={(needsRelocation) => setInput((p) => ({ ...p, needsRelocation }))} />
            </View>
          </View>

          <View style={[styles.card, cardSurfaceStyle(true)]}>
            <GshSectionTitle title={VW.sectionRoutes} topSpacing="none" style={{ marginBottom: 10 }} />
            <Text style={styles.lead}>{VW.routesLead}</Text>
            <Text style={styles.footnote}>{VW.tierFootnote}</Text>

            {situationNotes.length > 0 ? (
              <View style={styles.situationBox}>
                <Text style={styles.situationHeading}>{VW.situationHeading}</Text>
                {situationNotes.map((note) => (
                  <Text key={note.slice(0, 40)} style={styles.situationBullet}>
                    • {note}
                  </Text>
                ))}
              </View>
            ) : null}

            {results.length === 0 ? (
              <Text style={styles.muted}>{VW.noRoutes}</Text>
            ) : (
              results.map((result) => {
                const tierLabel =
                  result.orientationTier === "high"
                    ? VW.tierHigh
                    : result.orientationTier === "moderate"
                      ? VW.tierModerate
                      : VW.tierLimited;
                const tc = tierColors(result.orientationTier);
                return (
                  <View key={result.route.id} style={[styles.routeCard, { backgroundColor: tc.bg, borderColor: tc.border }]}>
                    <View style={styles.routeHead}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.routeName}>{result.route.name}</Text>
                        <Text style={styles.routeNotes}>{result.route.notes}</Text>
                      </View>
                      <View style={[styles.tierPill, { borderColor: tc.border }]}>
                        <Text style={[styles.tierPillText, { color: tc.text }]}>{tierLabel}</Text>
                      </View>
                    </View>

                    {result.reasons.length > 0 ? (
                      <View style={styles.block}>
                        <Text style={styles.blockTitleOk}>{VW.signalsAlign}</Text>
                        {result.reasons.map((r) => (
                          <Text key={r} style={styles.blockLiOk}>
                            • {r}
                          </Text>
                        ))}
                      </View>
                    ) : null}

                    {result.blockers.length > 0 ? (
                      <View style={styles.block}>
                        <Text style={styles.blockTitleWarn}>{VW.verifyItems}</Text>
                        {result.blockers.map((b) => (
                          <Text key={b} style={styles.blockLiWarn}>
                            • {b}
                          </Text>
                        ))}
                      </View>
                    ) : null}

                    <Pressable
                      onPress={() => void Linking.openURL(result.route.officialLink)}
                      style={styles.officialLink}
                      accessibilityRole="link"
                    >
                      <Ionicons name="open-outline" size={18} color={colors.brand} />
                      <Text style={styles.officialLinkText}>{VW.officialGuidance}</Text>
                    </Pressable>
                  </View>
                );
              })
            )}
          </View>

          <Pressable style={styles.bottomNav} onPress={() => router.push("/(tabs)")} accessibilityRole="button">
            <Text style={styles.bottomNavText}>Back to Discover</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  pad: { padding: 16, paddingBottom: 48, gap: 14 },
  accentBar: { height: 4, borderRadius: 2, marginBottom: 4 },
  banner: {
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: colors.teal,
  },
  bannerStrong: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.textPrimary, marginBottom: 6 },
  bannerRest: { fontFamily: fontFamily.regular, fontSize: 13, color: colors.textMuted, lineHeight: 19 },
  card: { padding: 16, borderRadius: radii.md },
  fieldBlock: { marginBottom: 14 },
  label: { fontSize: 13, fontFamily: fontFamily.semiBold, color: colors.textSecondary, marginBottom: 8 },
  hint: { fontSize: 12, fontFamily: fontFamily.regular, color: colors.textMuted, marginTop: 6, marginBottom: 12, lineHeight: 17 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: fontFamily.regular,
    backgroundColor: colors.background,
    color: colors.textPrimary,
  },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    maxWidth: "100%",
  },
  chipOn: {
    borderColor: colors.brand,
    backgroundColor: "rgba(97, 10, 144, 0.08)",
  },
  chipText: { fontSize: 13, fontFamily: fontFamily.medium, color: colors.textSecondary },
  chipTextOn: { color: colors.brand, fontFamily: fontFamily.semiBold },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    gap: 12,
  },
  switchLabel: { flex: 1, fontSize: 14, fontFamily: fontFamily.regular, color: colors.textMarketing, lineHeight: 20 },
  lead: { fontSize: 13, fontFamily: fontFamily.regular, color: colors.textMuted, lineHeight: 19, marginBottom: 8 },
  footnote: { fontSize: 11, fontFamily: fontFamily.regular, color: colors.placeholder, lineHeight: 16, marginBottom: 12 },
  situationBox: {
    padding: 12,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  situationHeading: {
    fontSize: 13,
    fontFamily: fontFamily.semiBold,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  situationBullet: { fontSize: 13, fontFamily: fontFamily.regular, color: colors.textMarketing, lineHeight: 19, marginBottom: 6 },
  muted: { fontSize: 14, color: colors.textMuted, fontFamily: fontFamily.regular },
  routeCard: {
    padding: 14,
    borderRadius: radii.md,
    borderWidth: 1,
    marginBottom: 12,
  },
  routeHead: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  routeName: { fontSize: 15, fontFamily: fontFamily.bold, color: colors.textPrimary },
  routeNotes: { marginTop: 6, fontSize: 13, fontFamily: fontFamily.regular, color: colors.textMuted, lineHeight: 18 },
  tierPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: colors.background,
  },
  tierPillText: { fontSize: 11, fontFamily: fontFamily.bold },
  block: { marginTop: 12 },
  blockTitleOk: { fontSize: 13, fontFamily: fontFamily.semiBold, color: "#065f46", marginBottom: 4 },
  blockLiOk: { fontSize: 12, fontFamily: fontFamily.regular, color: "#064e3b", marginTop: 6, lineHeight: 18 },
  blockTitleWarn: { fontSize: 13, fontFamily: fontFamily.semiBold, color: "#9f1239", marginBottom: 4 },
  blockLiWarn: { fontSize: 12, fontFamily: fontFamily.regular, color: "#881337", marginTop: 6, lineHeight: 18 },
  officialLink: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 },
  officialLinkText: { fontSize: 13, fontFamily: fontFamily.semiBold, color: colors.brand },
  bottomNav: { paddingVertical: 16, alignItems: "center" },
  bottomNavText: { fontSize: 15, fontFamily: fontFamily.semiBold, color: colors.brand },
});
