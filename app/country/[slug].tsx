import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { ComponentProps } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CountryFlag } from "@/components/CountryFlag";
import { CountryVisaGuideSections } from "@/components/CountryVisaGuideSections";
import { GshLinkRow, GshScreenIntro } from "@/components/gsh-ui-kit";
import { GshScreenShell } from "@/components/GshScreenShell";
import type { CountryVisaGuideSection } from "@/lib/guides/countryVisaGuides";
import { useCountryGuides } from "@/lib/guides/useCountryGuides";
import { useAppCopy } from "@/lib/i18n";
import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { openExternalUrlInApp } from "@/lib/openMarketingBrowser";
import { countryPhrases, getPublicCountry, getSwitzerlandGuide } from "@/lib/publicResources";
import { stackScrollContentStyle } from "@/lib/screen-layout";
import { colors, fontFamily, radii } from "@/lib/theme";

function SectionHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <View style={styles.sectionHead}>
      <Text style={styles.sectionEyebrow}>{eyebrow}</Text>
      <Text style={styles.sectionTitle} accessibilityRole="header">
        {title}
      </Text>
    </View>
  );
}

export default function CountryHubScreen() {
  const ac = useAccountCopy();
  const { t, locale } = useAppCopy();
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const country = getPublicCountry(String(slug ?? ""));
  const { guides } = useCountryGuides();

  if (!country) {
    return (
      <GshScreenShell>
        <SafeAreaView style={styles.safe} edges={["bottom"]}>
          <View style={styles.empty}>
            <GshScreenIntro title={t("guideNotFound")} subtitle={t("guideMissingHelp")} />
            <Pressable style={styles.textButton} onPress={() => router.replace("/countries")} accessibilityRole="button">
              <Text style={styles.textButtonLabel}>{ac("Choose where to work abroad.")}</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </GshScreenShell>
    );
  }

  const guide = country.visaGuideSlug ? guides.find((item) => item.slug === country.visaGuideSlug) : undefined;
  const swiss = guide ? undefined : getSwitzerlandGuide(locale);
  const intro = guide?.openingHook || guide?.excerpt || swiss?.intro || "";
  const routeSections: CountryVisaGuideSection[] =
    guide?.sections ??
    (swiss?.sections ?? []).map((section) => ({ heading: section.h2, paragraphs: section.body.split(/\n{2,}/) }));
  const place = countryPhrases(country, locale);
  const searchJobs = () => router.push({ pathname: "/(tabs)/jobs", params: { location: country.name } });

  const nextSteps: { title: string; subtitle: string; icon: ComponentProps<typeof Ionicons>["name"]; href: string }[] = [
    { title: ac("Plan your move"), subtitle: ac("Visa, housing, and money after a hire."), icon: "compass-outline", href: "/relocation-help" },
    { title: ac("Find a specialist"), subtitle: ac("Visa, housing, tax, and money — public directory."), icon: "people-outline", href: "/partners" },
    { title: ac("Compare destinations"), subtitle: ac("Two or three countries, side by side."), icon: "git-compare-outline", href: "/compare-countries" },
  ];

  return (
    <GshScreenShell constrainTabletWidth>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <View style={styles.heroBadge}>
              <CountryFlag iso2={country.iso2} width={36} />
              <Text style={styles.heroCountry}>{ac(country.name)}</Text>
            </View>
            <Text style={styles.heroTitle} accessibilityRole="header">
              {ac("Find work {place}.", { place: place.at })}
            </Text>
            <Text style={styles.heroIntro}>
              {ac("Explore jobs, everyday life and the practical steps of moving {place}. Search is free.", {
                place: place.to,
              })}
            </Text>
            <Pressable style={styles.primaryCta} onPress={searchJobs} accessibilityRole="button">
              <Text style={styles.primaryCtaText}>{ac("Search jobs")}</Text>
              <Ionicons name="arrow-forward" size={18} color={colors.navy} />
            </Pressable>
          </View>

          {locale !== "en" && guide?.contentLanguage === "en" ? (
            <Text style={styles.note}>{t("guideEnglish")}</Text>
          ) : null}

          {country.hiringSectors.length ? (
            <View style={styles.block}>
              <SectionHead eyebrow={ac("Work sectors")} title={ac("Where to start your search")} />
              {country.hiringSectors.map((sector) => (
                <View key={sector} style={styles.bulletRow}>
                  <View style={styles.bulletDot} />
                  <Text style={styles.body}>{ac(sector)}</Text>
                </View>
              ))}
              <Text style={styles.note}>{ac("A starting point for research. Vacancies and requirements change.")}</Text>
            </View>
          ) : null}

          <View style={styles.block}>
            <SectionHead eyebrow={ac("Life beyond work")} title={ac("Could you feel at home here?")} />
            <Text style={styles.subheading}>{ac("Moving with family")}</Text>
            <Text style={styles.body}>{ac(country.familyNote)}</Text>
            <Text style={styles.subheading}>{ac("What to plan for")}</Text>
            <Text style={styles.body}>{ac(country.watchOut)}</Text>
          </View>

          <View style={styles.block}>
            <SectionHead eyebrow={ac("Before you apply")} title={ac(country.mainRoute)} />
            {intro ? <Text style={styles.body}>{intro}</Text> : null}
            <Text style={styles.body}>
              {ac("Work routes depend on your role and circumstances. Use the official sources to check current requirements.")}
            </Text>
            <View style={styles.factRow}>
              <View style={styles.fact}>
                <Text style={styles.factLabel}>{ac("Work language")}</Text>
                <Text style={styles.factValue}>{ac(country.workLanguage)}</Text>
              </View>
              <View style={styles.fact}>
                <Text style={styles.factLabel}>{ac("Currency")}</Text>
                <Text style={styles.factValue}>{country.currencyCode}</Text>
              </View>
            </View>
          </View>
          <CountryVisaGuideSections sections={routeSections} />

          {country.officialLinks.length ? (
            <View style={styles.block}>
              <SectionHead eyebrow={ac("Check the source")} title={ac("Keep your research current")} />
              {country.officialLinks.map((link) => (
                <Pressable
                  key={link.href}
                  style={styles.sourceRow}
                  onPress={() => openExternalUrlInApp(link.href)}
                  accessibilityRole="link"
                >
                  <Text style={styles.sourceText}>{link.label}</Text>
                  <Ionicons name="open-outline" size={16} color={colors.navy} />
                </Pressable>
              ))}
            </View>
          ) : null}

          {country.faqs.length ? (
            <View style={styles.block}>
              <SectionHead eyebrow={ac("Your questions")} title={ac("Good to know")} />
              {country.faqs.map((faq) => (
                <View key={faq.question} style={styles.faq}>
                  <Text style={styles.subheading}>{ac(faq.question)}</Text>
                  <Text style={styles.body}>{ac(faq.answer)}</Text>
                </View>
              ))}
            </View>
          ) : null}

          <View style={styles.block}>
            <SectionHead eyebrow={ac("Your next step")} title={ac("Make the move your own.")} />
          </View>
          {nextSteps.map((step) => (
            <GshLinkRow
              key={step.href}
              title={step.title}
              subtitle={step.subtitle}
              icon={step.icon}
              accent="teal"
              onPress={() => router.push(step.href as never)}
            />
          ))}

          <Text style={styles.note}>
            {ac("Country information on Global Sponsor Hub is general guidance, not legal or immigration advice, and is not a government decision. Confirm current requirements with official immigration sources before you act.")}
          </Text>
        </ScrollView>
      </SafeAreaView>
    </GshScreenShell>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  pad: { ...stackScrollContentStyle, gap: 14, paddingBottom: 40 },
  empty: { flex: 1, justifyContent: "center", padding: 24 },
  hero: {
    borderRadius: radii.xl,
    backgroundColor: colors.navy,
    padding: 20,
    gap: 12,
  },
  heroBadge: { flexDirection: "row", alignItems: "center", gap: 10 },
  heroCountry: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: colors.cyan,
  },
  heroTitle: {
    fontSize: 26,
    lineHeight: 28,
    fontFamily: fontFamily.headingStrong,
    color: colors.white,
    letterSpacing: -0.8,
  },
  heroIntro: { fontSize: 15, lineHeight: 22, fontFamily: fontFamily.regular, color: "rgba(255,255,255,0.82)" },
  primaryCta: {
    marginTop: 4,
    minHeight: 50,
    borderRadius: radii.pill,
    backgroundColor: colors.cyan,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryCtaText: { fontSize: 15, fontFamily: fontFamily.heading, color: colors.navy },
  block: { gap: 8, marginTop: 6 },
  sectionHead: { gap: 4, marginBottom: 2 },
  sectionEyebrow: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: colors.textMuted,
  },
  sectionTitle: { fontSize: 21, lineHeight: 25, fontFamily: fontFamily.headingStrong, color: colors.navy, letterSpacing: -0.5 },
  subheading: { marginTop: 6, fontSize: 15, fontFamily: fontFamily.heading, color: colors.navy },
  body: { flex: 1, fontSize: 15, lineHeight: 23, fontFamily: fontFamily.regular, color: colors.textMarketing },
  bulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  bulletDot: { marginTop: 9, width: 6, height: 6, borderRadius: 3, backgroundColor: colors.navy },
  note: { fontSize: 12, lineHeight: 18, fontFamily: fontFamily.regular, color: colors.textMuted },
  factRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  fact: { flex: 1, borderRadius: radii.md, backgroundColor: colors.pale, padding: 12 },
  factLabel: { fontSize: 11, fontFamily: fontFamily.medium, color: colors.textMuted },
  factValue: { marginTop: 4, fontSize: 14, fontFamily: fontFamily.bold, color: colors.navy },
  sourceRow: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  sourceText: { flex: 1, fontSize: 14, fontFamily: fontFamily.semiBold, color: colors.navy },
  faq: { gap: 2 },
  textButton: { marginTop: 16, minHeight: 44, justifyContent: "center", alignSelf: "center" },
  textButtonLabel: { fontSize: 15, fontFamily: fontFamily.semiBold, color: colors.navy },
});
