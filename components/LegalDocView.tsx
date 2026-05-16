import { LinearGradient } from "expo-linear-gradient";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { GshScreenIntro, GshSectionTitle } from "@/components/gsh-ui-kit";
import type { LegalDocDef } from "@/lib/legal/appLegalDocs";
import { stackScrollContentStyle } from "@/lib/screen-layout";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";

export function LegalDocView({ doc }: { doc: LegalDocDef }) {
  return (
    <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
      <View style={[styles.hero, cardSurfaceStyle(true)]}>
        <GshScreenIntro eyebrow="Legal" title={doc.title} subtitle={doc.subtitle} style={{ marginBottom: 0 }} />
        <LinearGradient colors={[colors.teal, colors.brand]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.accentBar} />
      </View>

      {doc.sections.map((sec) => (
        <View key={sec.heading} style={[styles.card, cardSurfaceStyle(true)]}>
          <GshSectionTitle title={sec.heading} topSpacing="none" style={styles.sectionTitle} />
          {sec.paragraphs?.map((p, i) => (
            <Text key={`${sec.heading}-p-${i}`} style={styles.p}>
              {p}
            </Text>
          ))}
          {sec.bullets?.map((b, i) => (
            <View key={`${sec.heading}-b-${i}`} style={styles.bulletRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>{b}</Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pad: { ...stackScrollContentStyle, gap: 14 },
  hero: { padding: 18, borderRadius: radii.lg, overflow: "hidden" },
  accentBar: { height: 4, borderRadius: 2, marginTop: 14 },
  card: { padding: 16, borderRadius: radii.lg },
  sectionTitle: { marginTop: 0, marginBottom: 10 },
  p: { fontSize: 15, fontFamily: fontFamily.regular, color: colors.textMarketing, lineHeight: 23, marginBottom: 10 },
  bulletRow: { flexDirection: "row", gap: 10, marginBottom: 8 },
  bullet: { fontSize: 16, color: colors.accent, fontFamily: fontFamily.bold },
  bulletText: { flex: 1, fontSize: 15, fontFamily: fontFamily.regular, color: colors.textSecondary, lineHeight: 22 },
});
