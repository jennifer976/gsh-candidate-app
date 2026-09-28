import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import {useAppLanguage, toIntlLocale} from "@/lib/i18n";
import * as Linking from "expo-linking";
import type { Router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import Markdown from "react-native-markdown-display";
import { BrandLinkRow, DepthButton, Eyebrow } from "@/components/gsh-brand";
import { getMarketingSiteUrl } from "@/lib/config";
import { navigateGuideLink } from "@/lib/guides/navigateGuideLink";
import { openExternalUrlInApp } from "@/lib/openMarketingBrowser";
import type { SeoPillarAppendixTable, SeoPillarPageConfig } from "@/lib/guides/seo/seoPillarTypes";
import { colors, fontFamily, radii } from "@/lib/theme";

const mdStyles = StyleSheet.create({
  body: { color: colors.textMarketing, fontFamily: fontFamily.regular },
  paragraph: { marginTop: 10, fontSize: 16, lineHeight: 24, fontFamily: fontFamily.regular, color: colors.textMarketing },
  bullet_list: { marginTop: 8 },
  ordered_list: { marginTop: 8 },
  list_item: { marginTop: 4 },
  strong: { fontFamily: fontFamily.bold, color: colors.textPrimary },
  em: { fontStyle: "italic" },
  link: { color: colors.brand, textDecorationLine: "underline" },
});

function marketingHost(): string {
  try {
    return new URL(getMarketingSiteUrl()).hostname.replace(/^www\./, "");
  } catch {
    return "globalsponsorhub.com";
  }
}

function handleGuideLink(url: string, router: Router): boolean {
  try {
    if (/^https?:\/\//i.test(url)) {
      const u = new URL(url);
      const h = u.hostname.replace(/^www\./, "");
      if (h === marketingHost() || h.endsWith(".globalsponsorhub.com")) {
        const path = u.pathname + u.search;
        return handleGuideLink(path, router);
      }
      openExternalUrlInApp(url);
      return false;
    }
  } catch {
    if (/^https?:\/\//i.test(url)) {
      openExternalUrlInApp(url);
    } else {
      void Linking.openURL(url);
    }
    return false;
  }

  navigateGuideLink(router, url);
  return false;
}

function AppendixTable({ table }: { table: SeoPillarAppendixTable }) {
  return (
    <View style={styles.appendix}>
      <Text style={styles.appendixTitle}>{table.heading}</Text>
      {table.rows.map((row, ri) => (
        <View key={ri} style={styles.appendixCard}>
          {row.map((cell, ci) => (
            <View key={ci} style={styles.appendixCell}>
              <Text style={styles.appendixCol}>{table.columns[ci]}</Text>
              <Text style={styles.appendixVal}>{cell}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

export function PillarGuideContent({ config, router }: { config: SeoPillarPageConfig; router: Router }) {
  const ac = useAccountCopy();
  const locale = toIntlLocale(useAppLanguage((s) => s.locale));
  const onLink = (url: string) => handleGuideLink(url, router);

  return (
    <View style={styles.wrap}>
      <View style={styles.hero}>
        <Eyebrow>{ac("Guide")}</Eyebrow>
        <Text style={styles.h1} accessibilityRole="header">
          {config.h1}
        </Text>
        <View style={styles.accent} />
        <Markdown style={mdStyles} onLinkPress={(url) => onLink(url)}>
          {config.intro.trim()}
        </Markdown>
        {config.lastReviewed ? (
          <View style={styles.reviewedPill}>
            <Ionicons name="checkmark-circle" size={14} color={colors.navy} />
            <Text style={styles.reviewed}>{ac("Last reviewed: {date}", { date: new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" }).format(new Date(config.lastReviewed)) })}</Text>
          </View>
        ) : null}
      </View>

      {config.officialLinks && config.officialLinks.length > 0 ? (
        <View style={styles.block}>
          <Eyebrow>{ac("Official sources")}</Eyebrow>
          <View style={styles.rowList}>
            {config.officialLinks.map((l) => (
              <BrandLinkRow key={l.href} icon="shield-checkmark-outline" label={l.label} onPress={() => onLink(l.href)} />
            ))}
          </View>
        </View>
      ) : null}

      {config.sections.map((sec, i) => (
        <View key={`${sec.h2}-${i}`} style={styles.section}>
          <View style={styles.h2Row}>
            <View style={styles.h2Bar} />
            <Text style={styles.h2} accessibilityRole="header">
              {sec.h2}
            </Text>
          </View>
          <Markdown style={mdStyles} onLinkPress={(url) => onLink(url)}>
            {sec.body.trim()}
          </Markdown>
        </View>
      ))}

      {config.appendixTable ? <AppendixTable table={config.appendixTable} /> : null}

      {config.faqs.length > 0 ? (
        <View style={styles.block}>
          <Eyebrow>{ac("Common questions")}</Eyebrow>
          <View style={styles.rowList}>
            {config.faqs.map((faq, i) => (
              <View key={i} style={styles.faq}>
                <Text style={styles.faqQ}>{faq.question}</Text>
                <Text style={styles.faqA}>{faq.answer}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <DepthButton
        title={config.browseLabel}
        onPress={() => navigateGuideLink(router, config.browseHref)}
        variant="cyan"
        size="md"
        style={styles.cta}
      />

      {config.relatedGuides && config.relatedGuides.length > 0 ? (
        <View style={styles.block}>
          <Eyebrow>{ac("Related guides")}</Eyebrow>
          <View style={styles.rowList}>
            {config.relatedGuides.map((r) => (
              <BrandLinkRow key={r.href} icon="book-outline" label={r.label} onPress={() => navigateGuideLink(router, r.href)} />
            ))}
          </View>
        </View>
      ) : null}

      <Text style={styles.disclaimer}>
        {ac("This is general information, not legal advice. Check current rules with official sources.")}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 0 },
  hero: { marginBottom: 4 },
  h1: {
    marginTop: 6,
    fontSize: 30,
    lineHeight: 35,
    fontFamily: fontFamily.headingStrong,
    color: colors.navy,
    letterSpacing: -0.6,
  },
  accent: { width: 56, height: 6, borderRadius: 3, backgroundColor: colors.cyan, marginTop: 12, marginBottom: 4 },
  reviewedPill: {
    marginTop: 14,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill,
    backgroundColor: colors.pale,
  },
  reviewed: { fontSize: 12, fontFamily: fontFamily.semiBold, color: colors.navy },
  block: { marginTop: 28 },
  rowList: { marginTop: 10, gap: 10 },
  section: { marginTop: 28 },
  h2Row: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 6 },
  h2Bar: { width: 5, alignSelf: "stretch", minHeight: 22, borderRadius: 3, backgroundColor: colors.cyan },
  h2: {
    flex: 1,
    fontSize: 21,
    lineHeight: 26,
    fontFamily: fontFamily.heading,
    color: colors.navy,
    letterSpacing: -0.3,
  },
  appendix: { marginTop: 28 },
  appendixTitle: { fontSize: 19, fontFamily: fontFamily.heading, color: colors.navy, marginBottom: 12 },
  appendixCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: colors.navy,
    backgroundColor: colors.white,
    marginBottom: 12,
    gap: 10,
  },
  appendixCell: { gap: 4 },
  appendixCol: { fontSize: 11, fontFamily: fontFamily.bold, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.6 },
  appendixVal: { fontSize: 14, fontFamily: fontFamily.regular, color: colors.textMarketing, lineHeight: 20 },
  faq: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.navy,
    backgroundColor: colors.pale,
  },
  faqQ: { fontSize: 16, fontFamily: fontFamily.heading, color: colors.navy, marginBottom: 8 },
  faqA: { fontSize: 14, fontFamily: fontFamily.regular, color: colors.textMarketing, lineHeight: 21 },
  cta: { marginTop: 28 },
  disclaimer: {
    marginTop: 24,
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    lineHeight: 19,
  },
});
