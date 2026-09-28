import { useAppCopy } from "@/lib/i18n";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { CountryVisaGuideSection } from "@/lib/guides/countryVisaGuides";
import { openExternalUrlInApp } from "@/lib/openMarketingBrowser";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";

export function CountryVisaGuideSections({ sections }: { sections: CountryVisaGuideSection[] }) {
  const { t } = useAppCopy();
  return (
    <>
      {sections.map((sec, si) => (
        <View key={`${si}-${sec.heading}`} style={[styles.sectionCard, cardSurfaceStyle(true)]}>
          <Text style={styles.sectionHeading}>{sec.heading}</Text>
          {(sec.paragraphs ?? []).map((p, i) => (
            <Text key={`${si}-p-${i}`} style={styles.p}>
              {p}
            </Text>
          ))}
          {sec.bullets && sec.bullets.length > 0 ? (
            <View style={styles.bulletList}>
              {sec.bullets.map((b, bi) => (
                <View key={`${si}-b-${bi}`} style={styles.bulletRow}>
                  <View style={styles.bulletDot} />
                  <Text style={styles.bulletText}>
                    <Text style={styles.bulletLead}>{b.label}</Text>
                    {": "}
                    {b.text}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
          {sec.prosCons ? (
            <View style={styles.prosConsGrid}>
              <View style={styles.prosConsCol}>
                <Text style={styles.panelTitle}>{t("guidePros")}</Text>
                {sec.prosCons.pros.map((item, i) => (
                  <Text key={`${si}-pro-${i}`} style={styles.panelItem}>
                    • {item}
                  </Text>
                ))}
              </View>
              <View style={styles.prosConsCol}>
                <Text style={styles.panelTitle}>{t("guideCautions")}</Text>
                {sec.prosCons.cons.map((item, i) => (
                  <Text key={`${si}-con-${i}`} style={styles.panelItem}>
                    • {item}
                  </Text>
                ))}
              </View>
            </View>
          ) : null}
          {sec.pathway ? (
            <View style={styles.pathwayBox}>
              {sec.pathway.title ? <Text style={styles.panelTitle}>{sec.pathway.title}</Text> : null}
              {sec.pathway.steps.map((step, i) => (
                <View key={`${si}-step-${i}`} style={styles.stepRow}>
                  <View style={styles.stepBadge}>
                    <Text style={styles.stepBadgeText}>{i + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                    {step.detail ? <Text style={styles.stepDetail}>{step.detail}</Text> : null}
                  </View>
                </View>
              ))}
              {sec.pathway.note ? <Text style={styles.pathwayNote}>{sec.pathway.note}</Text> : null}
            </View>
          ) : null}
          {sec.sources?.map((url, index) => (
            <Pressable
              key={url}
              style={styles.sourceBtn}
              accessibilityRole="link"
              onPress={() => openExternalUrlInApp(url)}
            >
              <Text style={styles.sourceBtnText}>
                {t("guideOfficialLink")}
                {sec.sources!.length > 1 ? " " + (index + 1) : ""}
              </Text>
            </Pressable>
          ))}
          {sec.callout ? (
            <View style={styles.calloutBox}>
              <Text style={styles.calloutTitle}>{sec.callout.title}</Text>
              <Text style={styles.calloutBody}>{sec.callout.body}</Text>
            </View>
          ) : null}
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  sectionCard: { padding: 16, borderRadius: radii.lg },
  sectionHeading: {
    fontSize: 17,
    fontFamily: fontFamily.bold,
    color: colors.navy,
    marginBottom: 10,
  },
  bulletList: { gap: 12, marginBottom: 4 },
  bulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  bulletDot: {
    marginTop: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.teal,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    fontFamily: fontFamily.regular,
    color: colors.textMarketing,
    lineHeight: 23,
  },
  bulletLead: { fontFamily: fontFamily.bold, color: colors.navy },
  p: {
    fontSize: 15,
    fontFamily: fontFamily.regular,
    color: colors.textMarketing,
    lineHeight: 23,
    marginBottom: 10,
  },
  prosConsGrid: { gap: 10, marginTop: 8 },
  prosConsCol: {
    borderRadius: radii.md,
    backgroundColor: colors.surfaceMuted,
    padding: 12,
  },
  panelTitle: {
    fontSize: 13,
    fontFamily: fontFamily.bold,
    color: colors.navy,
    marginBottom: 8,
  },
  panelItem: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.textMarketing,
    lineHeight: 21,
    marginBottom: 6,
  },
  pathwayBox: {
    marginTop: 10,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
  },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 12 },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brand,
  },
  stepBadgeText: { fontSize: 12, fontFamily: fontFamily.bold, color: colors.white },
  stepTitle: { fontSize: 14, fontFamily: fontFamily.bold, color: colors.navy },
  stepDetail: {
    marginTop: 3,
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    lineHeight: 19,
  },
  pathwayNote: {
    fontSize: 13,
    fontFamily: fontFamily.medium,
    color: colors.textSecondary,
    lineHeight: 19,
  },
  sourceBtn: { marginTop: 8, paddingVertical: 10, alignSelf: "flex-start", minHeight: 44 },
  sourceBtnText: { color: colors.brand, fontFamily: fontFamily.semiBold, fontSize: 15 },
  calloutBox: {
    marginTop: 10,
    borderRadius: radii.md,
    backgroundColor: colors.brandSoft,
    padding: 12,
  },
  calloutTitle: { fontSize: 13, fontFamily: fontFamily.bold, color: colors.navy, marginBottom: 5 },
  calloutBody: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.textMarketing,
    lineHeight: 21,
  },
});
