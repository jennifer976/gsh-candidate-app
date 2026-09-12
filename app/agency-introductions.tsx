import { useIntroductionLabels } from "@/lib/i18n/useIntroductionLabels";
import { useQuery } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchCandidateAgencyIntroductions } from "@/lib/api-client";
import { colors, fontFamily, navHeader, radii } from "@/lib/theme";



export default function AgencyIntroductionsScreen() {
  const { ac, country, status, experience } = useIntroductionLabels();
  const router = useRouter();
  const query = useQuery({ queryKey: ["phase6", "candidate-introductions"], queryFn: () => fetchCandidateAgencyIntroductions() });
  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <Stack.Screen options={{ title: ac("Agency introductions"), ...navHeader }} />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => void query.refetch()} tintColor={colors.brand} />}
      >
        <View style={styles.intro}>
          <Text style={styles.title}>{ac("Agency introductions")}</Text>
          <Text style={styles.copy}>{ac("Review a proposed introduction before accepting. Your agency visibility settings still apply.")}</Text>
        </View>
        {query.isLoading ? <ActivityIndicator color={colors.brand} /> : query.isError ? (
          <Pressable accessibilityRole="button" style={styles.error} onPress={() => void query.refetch()}><Text style={styles.errorText}>{ac("Could not load introductions. Tap to retry.")}</Text></Pressable>
        ) : (query.data?.data ?? []).length === 0 ? (
          <Text style={styles.empty}>{ac("No agency introductions right now.")}</Text>
        ) : (query.data?.data ?? []).map((item) => (
          <Pressable key={item.id} style={styles.card} onPress={() => router.push(`/agency-introductions/${item.id}`)} accessibilityRole="button">
            <View style={styles.row}>
              <Text style={styles.agency}>{item.agency.name}</Text>
              <Text style={styles.status}>{status(item.status)}</Text>
            </View>
            <Text style={styles.role}>{item.request.title}</Text>
            <Text style={styles.meta}>{country(item.request.destinationCountry)} · {experience(item.request.experienceBand)}</Text>
            <Text style={styles.view}>{ac("Review introduction")} →</Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceMuted },
  content: { padding: 16, paddingBottom: 48, gap: 12 },
  intro: { gap: 7, marginBottom: 4 },
  title: { fontSize: 22, fontFamily: fontFamily.heading, color: colors.navy },
  copy: { fontSize: 13, lineHeight: 19, fontFamily: fontFamily.regular, color: colors.textSecondary },
  card: { padding: 16, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, gap: 7 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  agency: { flex: 1, fontSize: 13, fontFamily: fontFamily.semiBold, color: colors.textSecondary },
  status: { fontSize: 11, fontFamily: fontFamily.bold, color: colors.navy, flexShrink: 1, textAlign: "right" },
  role: { fontSize: 17, fontFamily: fontFamily.bold, color: colors.navy },
  meta: { fontSize: 12, fontFamily: fontFamily.regular, color: colors.textMuted },
  view: { marginTop: 5, fontSize: 13, fontFamily: fontFamily.semiBold, color: colors.brand },
  empty: { padding: 32, textAlign: "center", color: colors.textMuted, fontFamily: fontFamily.regular },
  error: { padding: 16, borderRadius: radii.md, backgroundColor: "#fef2f2" },
  errorText: { color: "#991b1b", textAlign: "center", fontFamily: fontFamily.medium },
});
