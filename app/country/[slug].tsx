import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter, type Href } from "expo-router";
import type { ReactNode } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CountryFlag } from "@/components/CountryFlag";
import { CountryVisaGuideSections } from "@/components/CountryVisaGuideSections";
import { Icon, type IconName } from "@/components/Icon";
import { DepthButton, Eyebrow, GshMark } from "@/components/gsh-brand";
import { Card, IconTile, Row, RowCard } from "@/components/v3";
import type { CountryVisaGuideSection } from "@/lib/guides/countryVisaGuides";
import { useCountryGuides } from "@/lib/guides/useCountryGuides";
import { useAppCopy } from "@/lib/i18n";
import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { openExternalUrlInApp } from "@/lib/openMarketingBrowser";
import { countryPhrases, getPublicCountry, getSwitzerlandGuide } from "@/lib/publicResources";
import { countryPhoto } from "@/lib/sitePhotos";
import { colors, fontFamily, shadows } from "@/lib/theme";

function SectionBlock({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <Text style={styles.sectionTitle} accessibilityRole="header">
        {title}
      </Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

export default function CountryHubScreen() {
  const ac = useAccountCopy();
  const { t, locale } = useAppCopy();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const country = getPublicCountry(String(slug ?? ""));
  const { guides } = useCountryGuides();

  if (!country) {
    return (
      <View style={styles.root}>
        <Stack.Screen options={{ title: t("guideNotFound"), headerShown: false }} />
        <View style={[styles.empty, { paddingTop: insets.top + 48 }]}>
          <Text style={styles.emptyTitle}>{t("guideNotFound")}</Text>
          <Text style={styles.emptyBody}>{t("guideMissingHelp")}</Text>
          <Pressable
            style={styles.textButton}
            onPress={() => router.replace("/countries")}
            accessibilityRole="button"
          >
            <Text style={styles.textButtonLabel}>{ac("Choose where to work abroad.")}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const guide = country.visaGuideSlug
    ? guides.find((item) => item.slug === country.visaGuideSlug)
    : undefined;
  const swiss = guide ? undefined : getSwitzerlandGuide(locale);
  const intro =
    guide?.openingHook || guide?.excerpt || swiss?.intro || "";
  const routeSections: CountryVisaGuideSection[] =
    guide?.sections ??
    (swiss?.sections ?? []).map((section) => ({
      heading: section.h2,
      paragraphs: section.body.split(/\n{2,}/),
    }));
  const place = countryPhrases(country, locale);
  const photo = countryPhoto(country.slug);
  const headerHeight = insets.top + 220;
  const searchJobs = () =>
    router.push({ pathname: "/(tabs)/jobs", params: { location: country.name } });

  const nextSteps: {
    title: string;
    subtitle: string;
    icon: IconName;
    href: Href;
  }[] = [
    {
      title: ac("Plan your move"),
      subtitle: ac("Visa, housing, and money after a hire."),
      icon: "compass",
      href: "/relocation-help",
    },
    {
      title: ac("Find a specialist"),
      subtitle: ac("Independent visa and relocation specialists."),
      icon: "users-round",
      href: "/partners",
    },
    {
      title: ac("Compare destinations"),
      subtitle: ac("Two or three countries, side by side."),
      icon: "git-compare",
      href: "/compare-countries",
    },
  ];

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace("/countries");
  }

  const showSectors = country.hiringSectors.length > 0;
  const showOfficial = country.officialLinks.length > 0;
  const showFaqs = country.faqs.length > 0;
  const showRoutes = routeSections.length > 0;
  const showLife = Boolean(country.familyNote || country.watchOut);
  const showBeforeApply = Boolean(country.mainRoute || intro);

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ title: ac(country.name), headerShown: false }} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.photoHeader, { height: headerHeight }]}>
          {photo ? (
            <Image
              source={photo}
              style={StyleSheet.absoluteFillObject}
              resizeMode="cover"
              accessibilityLabel={`${ac(country.name)} guide photo`}
            />
          ) : (
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.navy }]}>
              <GshMark
                size={320}
                color="rgba(255,255,255,0.06)"
                style={styles.markFallback}
              />
            </View>
          )}
          <LinearGradient
            colors={[
              "rgba(13,25,78,0.55)",
              "rgba(13,25,78,0.35)",
              "rgba(13,25,78,0.9)",
            ]}
            locations={[0, 0.45, 1]}
            style={StyleSheet.absoluteFillObject}
          />
          <Pressable
            onPress={goBack}
            style={[styles.backOnPhoto, { top: insets.top + 22 }]}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Icon name="arrow-left" size={22} color={colors.white} strokeWidth={1.8} />
          </Pressable>
          <View style={styles.photoEyebrow}>
            <Eyebrow onDark>{ac("Country guide")}</Eyebrow>
          </View>
        </View>

        <View style={styles.mainCard}>
          <View style={styles.flagBreakout}>
            <CountryFlag iso2={country.iso2} size={64} />
          </View>
          <Text style={styles.countryName}>{ac(country.name)}</Text>
          <Text style={styles.heroTitle} accessibilityRole="header">
            {ac("Find work in {country}", { country: ac(country.name) })}
            <Text style={{ color: colors.cyan }}>.</Text>
          </Text>
          <Text style={styles.heroIntro}>
            {ac(
              "Explore jobs, everyday life and the practical steps of moving {place}. Search is free.",
              { place: place.to },
            )}
          </Text>
          <DepthButton
            title={ac("Search jobs")}
            onPress={searchJobs}
            variant="navy"
            size="md"
            style={{ marginTop: 16 }}
          />
        </View>

        {locale !== "en" && guide?.contentLanguage === "en" ? (
          <Text style={[styles.note, styles.padH]}>{t("guideEnglish")}</Text>
        ) : null}

        <View style={styles.factsCard}>
          <View style={styles.factsRow}>
            <View style={[styles.factCell, styles.factCellRight]}>
              <Text style={styles.factValue}>{ac(country.workLanguage)}</Text>
              <Text style={styles.factLabel}>{ac("Work language")}</Text>
            </View>
            <View style={styles.factCell}>
              <Text style={styles.factValue}>{country.currencyCode}</Text>
              <Text style={styles.factLabel}>{ac("Currency")}</Text>
            </View>
          </View>
        </View>

        {showSectors ? (
          <View style={styles.padH}>
            <SectionBlock eyebrow={ac("Work sectors")} title={ac("Where to start your search")}>
              <View style={styles.chipWrap}>
                {country.hiringSectors.map((sector) => (
                  <View key={sector} style={styles.sectorChip}>
                    <Text style={styles.sectorText}>{ac(sector)}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.note}>
                {ac("A starting point for research. Vacancies and requirements change.")}
              </Text>
            </SectionBlock>
          </View>
        ) : null}

        {showLife ? (
          <View style={styles.padH}>
            <SectionBlock
              eyebrow={ac("Life beyond work")}
              title={ac("Could you feel at home here?")}
            >
              <Card padding={0}>
                {country.familyNote ? (
                  <View style={styles.lifeBlock}>
                    <IconTile name="users-round" />
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={styles.lifeHeading}>{ac("Moving with family")}</Text>
                      <Text style={styles.lifeBody}>{ac(country.familyNote)}</Text>
                    </View>
                  </View>
                ) : null}
                {country.familyNote && country.watchOut ? (
                  <View style={styles.lifeDivider} />
                ) : null}
                {country.watchOut ? (
                  <View style={styles.lifeBlock}>
                    <IconTile name="clipboard-list" />
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={styles.lifeHeading}>{ac("What to plan for")}</Text>
                      <Text style={styles.lifeBody}>{ac(country.watchOut)}</Text>
                    </View>
                  </View>
                ) : null}
              </Card>
            </SectionBlock>
          </View>
        ) : null}

        {showBeforeApply ? (
          <View style={styles.padH}>
            <SectionBlock eyebrow={ac("Before you apply")} title={ac(country.mainRoute)}>
              <Card>
                {intro ? <Text style={styles.body}>{intro}</Text> : null}
                <Text style={[styles.body, intro ? { marginTop: 10 } : null]}>
                  {ac(
                    "Work routes depend on your role and circumstances. Use the official sources to check current requirements.",
                  )}
                </Text>
              </Card>
            </SectionBlock>
          </View>
        ) : null}

        {showRoutes ? (
          <View style={[styles.padH, { marginTop: 28 }]}>
            <CountryVisaGuideSections sections={routeSections} />
          </View>
        ) : null}

        {showOfficial ? (
          <View style={styles.padH}>
            <SectionBlock
              eyebrow={ac("Check the source")}
              title={ac("Keep your research current")}
            >
              <RowCard>
                {country.officialLinks.map((link, index) => (
                  <Pressable
                    key={link.href}
                    onPress={() => openExternalUrlInApp(link.href)}
                    accessibilityRole="link"
                    accessibilityLabel={link.label}
                    style={[
                      styles.sourceRow,
                      index === country.officialLinks.length - 1 && { borderBottomWidth: 0 },
                    ]}
                  >
                    <Text style={styles.sourceText}>{link.label}</Text>
                    <Icon name="external-link" size={18} color={colors.navy} strokeWidth={1.8} />
                  </Pressable>
                ))}
              </RowCard>
            </SectionBlock>
          </View>
        ) : null}

        {showFaqs ? (
          <View style={styles.padH}>
            <SectionBlock eyebrow={ac("Your questions")} title={ac("Good to know")}>
              <Card padding={0}>
                {country.faqs.map((faq, index) => (
                  <View
                    key={faq.question}
                    style={[
                      styles.faqBlock,
                      index < country.faqs.length - 1 && styles.faqBorder,
                    ]}
                  >
                    <Text style={styles.faqQ}>{ac(faq.question)}</Text>
                    <Text style={styles.faqA}>{ac(faq.answer)}</Text>
                  </View>
                ))}
              </Card>
            </SectionBlock>
          </View>
        ) : null}

        <View style={styles.padH}>
          <SectionBlock eyebrow={ac("Your next step")} title={ac("Make the move your own.")}>
            <RowCard>
              {nextSteps.map((step, index) => (
                <Row
                  key={String(step.href)}
                  icon={step.icon}
                  label={step.title}
                  hint={step.subtitle}
                  onPress={() => router.push(step.href)}
                  isLast={index === nextSteps.length - 1}
                />
              ))}
            </RowCard>
          </SectionBlock>
        </View>

        <Text style={[styles.note, styles.padH, { marginTop: 20 }]}>
          {ac("Rules change often. Check the official sources above before you act.")}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.panel },
  padH: { paddingHorizontal: 16 },
  empty: { flex: 1, justifyContent: "center", padding: 24 },
  emptyTitle: {
    fontFamily: fontFamily.headingStrong,
    fontSize: 22,
    color: colors.navy,
    textAlign: "center",
  },
  emptyBody: {
    marginTop: 8,
    fontFamily: fontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text2,
    textAlign: "center",
  },
  photoHeader: {
    overflow: "hidden",
    backgroundColor: colors.navy,
  },
  markFallback: {
    position: "absolute",
    right: -90,
    top: -40,
  },
  backOnPhoto: {
    position: "absolute",
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  photoEyebrow: {
    position: "absolute",
    left: 22,
    bottom: 84,
  },
  mainCard: {
    marginTop: -64,
    marginHorizontal: 16,
    backgroundColor: colors.white,
    borderRadius: 24,
    paddingTop: 48,
    paddingHorizontal: 22,
    paddingBottom: 20,
    ...shadows.card,
  },
  flagBreakout: {
    position: "absolute",
    top: -32,
    left: 22,
  },
  countryName: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    color: colors.text2,
  },
  heroTitle: {
    marginTop: 4,
    fontFamily: fontFamily.headingStrong,
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: -0.8,
    color: colors.navy,
  },
  heroIntro: {
    marginTop: 8,
    fontFamily: fontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text2,
  },
  factsCard: {
    marginTop: 12,
    marginHorizontal: 16,
    backgroundColor: colors.white,
    borderRadius: 24,
    overflow: "hidden",
    ...shadows.card,
  },
  factsRow: { flexDirection: "row" },
  factCell: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  factCellRight: {
    borderRightWidth: 1,
    borderRightColor: colors.line,
  },
  factValue: {
    fontFamily: fontFamily.headingStrong,
    fontSize: 17,
    lineHeight: 22,
    color: colors.navy,
  },
  factLabel: {
    marginTop: 4,
    fontFamily: fontFamily.medium,
    fontSize: 13,
    lineHeight: 18,
    color: colors.text2,
  },
  section: { marginTop: 28 },
  sectionTitle: {
    marginTop: 6,
    fontFamily: fontFamily.headingStrong,
    fontSize: 21,
    lineHeight: 26,
    color: colors.navy,
  },
  sectionBody: { marginTop: 12, gap: 12 },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  sectorChip: {
    height: 40,
    borderRadius: 999,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.card,
  },
  sectorText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    color: colors.navy,
  },
  lifeBlock: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 18,
  },
  lifeDivider: { height: 1, backgroundColor: colors.line, marginHorizontal: 18 },
  lifeHeading: {
    fontFamily: fontFamily.heading,
    fontSize: 15,
    color: colors.navy,
  },
  lifeBody: {
    marginTop: 4,
    fontFamily: fontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text2,
  },
  body: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text2,
  },
  sourceRow: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  sourceText: {
    flex: 1,
    fontFamily: fontFamily.medium,
    fontSize: 15,
    lineHeight: 20,
    color: colors.navy,
  },
  faqBlock: { padding: 18 },
  faqBorder: { borderBottomWidth: 1, borderBottomColor: colors.line },
  faqQ: {
    fontFamily: fontFamily.heading,
    fontSize: 15,
    color: colors.navy,
  },
  faqA: {
    marginTop: 6,
    fontFamily: fontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text2,
  },
  note: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 18,
    color: colors.muted,
  },
  textButton: {
    marginTop: 16,
    minHeight: 44,
    justifyContent: "center",
    alignSelf: "center",
  },
  textButtonLabel: {
    fontSize: 15,
    fontFamily: fontFamily.semiBold,
    color: colors.navy,
  },
});
