import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshScreenShell } from "@/components/GshScreenShell";
import { useAppCopy } from "@/lib/i18n";
import { getHowWeLabelJobsCopy } from "@/lib/publicResources";
import { stackScrollContentStyle } from "@/lib/screen-layout";
import { colors, fontFamily, radii } from "@/lib/theme";

const SECTIONS: { title: string; paragraphs: string[] }[] = [
  { title: "s4Title", paragraphs: ["s4Intro", "s4p1", "s4p2", "s4p3"] },
  { title: "s5Title", paragraphs: ["s5p1"] },
  { title: "s1Title", paragraphs: ["s1p1", "s1p2"] },
  { title: "s2Title", paragraphs: ["s2p1", "s2p2"] },
  { title: "s3Title", paragraphs: ["s3p1", "s3p2"] },
];

const CTAS: { label: string; href: Href }[] = [
  { label: "ctaGuides", href: "/countries" },
  { label: "ctaExternal", href: "/curated-listings" },
  { label: "ctaContact", href: "/contact" },
];

export default function HowWeLabelJobsScreen() {
  const { locale } = useAppCopy();
  const router = useRouter();
  const copy = getHowWeLabelJobsCopy(locale);

  return (
    <GshScreenShell constrainTabletWidth>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
          <Text style={styles.eyebrow}>{copy.eyebrow}</Text>
          <Text style={styles.title} accessibilityRole="header">
            {copy.h1}
          </Text>
          <Text style={styles.intro}>{copy.intro}</Text>

          {SECTIONS.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text style={styles.sectionTitle} accessibilityRole="header">
                {copy[section.title]}
              </Text>
              {section.paragraphs.map((key) => (
                <Text key={key} style={styles.body}>
                  {copy[key]}
                </Text>
              ))}
            </View>
          ))}

          <Text style={styles.footer}>{copy.footerNote}</Text>

          <Pressable style={styles.primary} onPress={() => router.push("/(tabs)/jobs")} accessibilityRole="button">
            <Text style={styles.primaryText}>{copy.ctaJobs}</Text>
            <Ionicons name="arrow-forward" size={18} color={colors.navy} />
          </Pressable>
          {CTAS.map((cta) => (
            <Pressable key={cta.label} style={styles.secondary} onPress={() => router.push(cta.href)} accessibilityRole="button">
              <Text style={styles.secondaryText}>{copy[cta.label]}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </SafeAreaView>
    </GshScreenShell>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  pad: { ...stackScrollContentStyle, gap: 12, paddingBottom: 48 },
  eyebrow: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: colors.navy,
    opacity: 0.6,
  },
  title: { fontSize: 28, lineHeight: 32, fontFamily: fontFamily.headingStrong, color: colors.navy, letterSpacing: -0.8 },
  intro: { fontSize: 15, lineHeight: 22, fontFamily: fontFamily.regular, color: colors.textSecondary },
  section: { gap: 8, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border },
  sectionTitle: { fontSize: 19, lineHeight: 24, fontFamily: fontFamily.heading, color: colors.navy },
  body: { fontSize: 15, lineHeight: 23, fontFamily: fontFamily.regular, color: colors.textMarketing },
  footer: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderLeftWidth: 3,
    borderLeftColor: colors.teal,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
  },
  primary: {
    marginTop: 8,
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: colors.navy,
    backgroundColor: colors.teal,
  },
  primaryText: { fontSize: 15, fontFamily: fontFamily.bold, color: colors.navy },
  secondary: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: colors.navy,
    backgroundColor: colors.white,
  },
  secondaryText: { fontSize: 14, fontFamily: fontFamily.bold, color: colors.navy },
});
