import * as Linking from "expo-linking";
import type { Router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Markdown from "react-native-markdown-display";
import { getMarketingSiteUrl } from "@/lib/config";
import { navigateGuideLink } from "@/lib/guides/navigateGuideLink";
import { getPillarPageByPath } from "@/lib/guides/seo/getPillarByPath";
import type { SeoPillarAppendixTable, SeoPillarPageConfig } from "@/lib/guides/seo/seoPillarTypes";
import { openWebsitePath } from "@/lib/openWebsite";
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
      void Linking.openURL(url);
      return false;
    }
  } catch {
    void Linking.openURL(url);
    return false;
  }

  const path = url.split("#")[0] ?? url;
  if (getPillarPageByPath(path)) {
    router.push({ pathname: "/guides/topic", params: { q: encodeURIComponent(path) } });
    return false;
  }
  if (path.startsWith("/jobs") || path.startsWith("/partners")) {
    navigateGuideLink(router, path);
    return false;
  }
  void openWebsitePath(path);
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
  const onLink = (url: string) => handleGuideLink(url, router);

  return (
    <View style={styles.wrap}>
      <View style={styles.hero}>
        <Text style={styles.h1}>{config.h1}</Text>
        <Markdown style={mdStyles} onLinkPress={(url) => onLink(url)}>
          {config.intro.trim()}
        </Markdown>
        {config.lastReviewed ? (
          <Text style={styles.reviewed}>Last reviewed: {config.lastReviewed}</Text>
        ) : null}
      </View>

      {config.officialLinks && config.officialLinks.length > 0 ? (
        <View style={styles.block}>
          <Text style={styles.blockLabel}>Official sources</Text>
          {config.officialLinks.map((l) => (
            <Pressable key={l.href} onPress={() => onLink(l.href)} style={styles.linkRow} accessibilityRole="link">
              <Text style={styles.linkText}>{l.label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {config.sections.map((sec, i) => (
        <View key={`${sec.h2}-${i}`} style={styles.section}>
          <Text style={styles.h2}>{sec.h2}</Text>
          <Markdown style={mdStyles} onLinkPress={(url) => onLink(url)}>
            {sec.body.trim()}
          </Markdown>
        </View>
      ))}

      {config.appendixTable ? <AppendixTable table={config.appendixTable} /> : null}

      {config.faqs.length > 0 ? (
        <View style={styles.block}>
          <Text style={styles.blockLabel}>FAQ</Text>
          {config.faqs.map((faq, i) => (
            <View key={i} style={styles.faq}>
              <Text style={styles.faqQ}>{faq.question}</Text>
              <Text style={styles.faqA}>{faq.answer}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <Pressable
        style={styles.cta}
        onPress={() => {
          const h = config.browseHref;
          if (h.startsWith("/jobs") || h.startsWith("/partners")) {
            navigateGuideLink(router, h);
          } else {
            void openWebsitePath(h);
          }
        }}
        accessibilityRole="button"
      >
        <Text style={styles.ctaText}>{config.browseLabel}</Text>
      </Pressable>

      {config.relatedGuides && config.relatedGuides.length > 0 ? (
        <View style={styles.block}>
          <Text style={styles.blockLabel}>Related guides</Text>
          {config.relatedGuides.map((r) => (
            <Pressable
              key={r.href}
              style={styles.relatedBtn}
              onPress={() => {
                if (getPillarPageByPath(r.href)) {
                  router.push({ pathname: "/guides/topic", params: { q: encodeURIComponent(r.href) } });
                } else {
                  void openWebsitePath(r.href);
                }
              }}
              accessibilityRole="button"
            >
              <Text style={styles.relatedText}>{r.label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      <Pressable style={styles.webMirror} onPress={() => void openWebsitePath(config.path)} accessibilityRole="button">
        <Text style={styles.webMirrorText}>Open this guide on the website</Text>
      </Pressable>

      <Text style={styles.disclaimer}>
        Educational overview only — not legal advice. Confirm eligibility and processes with official government sources or
        regulated advisers.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 0 },
  hero: { marginBottom: 8 },
  h1: {
    fontSize: 24,
    fontFamily: fontFamily.extraBold,
    color: colors.textPrimary,
    letterSpacing: -0.35,
    marginBottom: 14,
    lineHeight: 30,
  },
  reviewed: { marginTop: 12, fontSize: 13, fontFamily: fontFamily.regular, color: colors.textMuted },
  block: { marginTop: 20 },
  blockLabel: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.75,
    marginBottom: 12,
  },
  section: { marginTop: 22 },
  h2: {
    fontSize: 18,
    fontFamily: fontFamily.bold,
    color: colors.textPrimary,
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  linkRow: { paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  linkText: { fontSize: 15, fontFamily: fontFamily.semiBold, color: colors.brand },
  appendix: { marginTop: 20 },
  appendixTitle: { fontSize: 16, fontFamily: fontFamily.bold, color: colors.textPrimary, marginBottom: 12 },
  appendixCard: {
    padding: 14,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceMuted,
    marginBottom: 12,
    gap: 10,
  },
  appendixCell: { gap: 4 },
  appendixCol: { fontSize: 11, fontFamily: fontFamily.bold, color: colors.textMuted, textTransform: "uppercase" },
  appendixVal: { fontSize: 14, fontFamily: fontFamily.regular, color: colors.textMarketing, lineHeight: 20 },
  faq: { marginBottom: 16, paddingBottom: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  faqQ: { fontSize: 15, fontFamily: fontFamily.bold, color: colors.textPrimary, marginBottom: 8 },
  faqA: { fontSize: 14, fontFamily: fontFamily.regular, color: colors.textMarketing, lineHeight: 21 },
  cta: {
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radii.sm,
    backgroundColor: colors.brand,
    alignItems: "center",
  },
  ctaText: { fontSize: 15, fontFamily: fontFamily.semiBold, color: colors.white },
  relatedBtn: {
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.brand,
    borderRadius: radii.sm,
    marginBottom: 10,
    alignItems: "center",
  },
  relatedText: { fontSize: 15, fontFamily: fontFamily.semiBold, color: colors.brand },
  webMirror: { marginTop: 16, paddingVertical: 12, alignItems: "center" },
  webMirrorText: { fontSize: 14, fontFamily: fontFamily.semiBold, color: colors.textMuted },
  disclaimer: {
    marginTop: 20,
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    lineHeight: 19,
  },
});
