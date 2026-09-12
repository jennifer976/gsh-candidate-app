import { useState } from "react";
import { useAppCopy } from "@/lib/i18n";
import { matchCopy } from "@/lib/match-copy";
import { jobMatchLabel } from "@/lib/job-presentation";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { fetchMyJobCompatibility } from "@/lib/api-client";
import { colors, fontFamily, radii } from "@/lib/theme";

export function CandidateCompatibilityCard({ jobId }: { jobId: string }) {
  const router = useRouter();
  const { locale } = useAppCopy();
  const copy = (key: string) => matchCopy(locale, key);
  const [expanded, setExpanded] = useState(false);
  const query = useQuery({
    queryKey: ["compatibility", "job", jobId],
    queryFn: () => fetchMyJobCompatibility(jobId),
    enabled: Boolean(jobId),
    retry: false,
  });
  if (query.isLoading) {
    return <View style={styles.card} accessibilityLabel={copy("loading")}><ActivityIndicator color={colors.brand} /><Text style={styles.copy}>{copy("loading")}</Text></View>;
  }
  if (query.isError || !query.data?.data) {
    return (
      <View style={[styles.card, styles.error]} accessibilityRole="alert">
        <Text style={styles.title}>{copy("error")}</Text>
        <Pressable onPress={() => void query.refetch()} accessibilityRole="button"><Text style={styles.link}>{copy("retry")}</Text></Pressable>
      </View>
    );
  }
  const result = query.data.data;
  const needsProfile = result.profileVersion == null || result.missingInputs.some((item) => item.startsWith("candidate."));
  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>{copy("eyebrow")}</Text>
      <Text style={styles.title}>{copy("title")}</Text>
      <View style={[styles.badge, styles[`badge_${result.status}`]]}>
        <Text style={styles.badgeText}>{jobMatchLabel(result.status, locale)}</Text>
      </View>
      <Pressable onPress={() => setExpanded(value => !value)} accessibilityRole="button" accessibilityState={{ expanded }} style={styles.toggle}>
        <Text style={styles.link}>{copy(expanded ? "hide" : "details")}</Text>
      </Pressable>
      {expanded && result.components.map((component) => (
        <View key={component.component} style={styles.component}>
          <View style={styles.row}>
            <Text style={styles.componentTitle}>{copy(component.component)}</Text>
            <Text style={styles.componentStatus}>{jobMatchLabel(component.status, locale)}</Text>
          </View>
          {component.reasonCodes.map((reason) => <Text key={reason} style={styles.reason}>• {copy(reason)}</Text>)}
        </View>
      ))}
      {needsProfile ? (
        <Pressable style={styles.missing} onPress={() => router.push("/mobility-profile")} accessibilityRole="button">
          <Text style={styles.missingText}>{copy("missing")}</Text>
        </Pressable>
      ) : null}
      <Text style={styles.disclaimer}>{copy("disclaimer")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: 20, padding: 16, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, gap: 9 },
  error: { backgroundColor: "#fef2f2", borderColor: "#fecaca" },
  eyebrow: { fontSize: 10, letterSpacing: 0.7, fontFamily: fontFamily.bold, color: colors.accent },
  title: { fontSize: 17, fontFamily: fontFamily.bold, color: colors.navy },
  copy: { textAlign: "center", fontSize: 13, fontFamily: fontFamily.medium, color: colors.textSecondary },
  badge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 6, borderRadius: radii.pill },
  badge_compatible: { backgroundColor: "#e5fafa" },
  badge_potentially_compatible: { backgroundColor: colors.surfaceMuted },
  badge_more_information_needed: { backgroundColor: "#fef3c7" },
  badge_incompatible: { backgroundColor: "#fee2e2" },
  badgeText: { fontSize: 12, fontFamily: fontFamily.bold, color: colors.navy },
  component: { paddingVertical: 12, gap: 5, borderTopWidth: 1, borderTopColor: colors.border },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  componentTitle: { flex: 1, fontSize: 13, fontFamily: fontFamily.bold, color: colors.textPrimary },
  componentStatus: { maxWidth: "45%", textAlign: "right", fontSize: 10, fontFamily: fontFamily.semiBold, color: colors.textMuted },
  reason: { fontSize: 12, lineHeight: 18, fontFamily: fontFamily.regular, color: colors.textSecondary },
  missing: { padding: 12, borderRadius: radii.md, backgroundColor: "#fffbeb", borderWidth: 1, borderColor: "#fde68a" },
  missingText: { fontSize: 13, lineHeight: 19, fontFamily: fontFamily.bold, color: "#92400e" },
  meta: { fontSize: 10, fontFamily: fontFamily.medium, color: colors.textMuted },
  disclaimer: { fontSize: 11, lineHeight: 17, fontFamily: fontFamily.regular, color: colors.textMuted },
  toggle: { minHeight: 44, justifyContent: "center" },
  link: { minHeight: 44, textAlignVertical: "center", color: colors.brand, fontFamily: fontFamily.bold, textDecorationLine: "underline" },
});
