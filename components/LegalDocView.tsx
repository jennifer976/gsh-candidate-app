import { ScrollView, StyleSheet, Text, View } from "react-native";
import type { LegalDocDef } from "@/lib/legal/appLegalDocs";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";

export function LegalDocView({ doc }: { doc: LegalDocDef }) {
  return (
    <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
      <View style={[styles.hero, cardSurfaceStyle(true)]}>
        <Text style={styles.title}>{doc.title}</Text>
        {doc.subtitle ? <Text style={styles.sub}>{doc.subtitle}</Text> : null}
      </View>

      {doc.sections.map((sec) => (
        <View key={sec.heading} style={[styles.card, cardSurfaceStyle(true)]}>
          <Text style={styles.h2} accessibilityRole="header">
            {sec.heading}
          </Text>
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
  pad: { padding: 16, paddingBottom: 48, gap: 14 },
  hero: { padding: 18, borderLeftWidth: 4, borderLeftColor: colors.teal },
  title: { fontSize: 26, fontFamily: fontFamily.extraBold, color: colors.textPrimary, letterSpacing: -0.35 },
  sub: { marginTop: 10, fontSize: 14, fontFamily: fontFamily.regular, color: colors.textMuted },
  card: { padding: 16, borderRadius: radii.md },
  h2: { fontSize: 18, fontFamily: fontFamily.bold, color: colors.textPrimary, marginBottom: 10 },
  p: { fontSize: 15, fontFamily: fontFamily.regular, color: colors.textMarketing, lineHeight: 23, marginBottom: 10 },
  bulletRow: { flexDirection: "row", gap: 10, marginBottom: 8 },
  bullet: { fontSize: 16, color: colors.accent, fontFamily: fontFamily.bold },
  bulletText: { flex: 1, fontSize: 15, fontFamily: fontFamily.regular, color: colors.textSecondary, lineHeight: 22 },
});
