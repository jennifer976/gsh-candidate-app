import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { useQuery } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchMyApplyInvites } from "@/lib/api-client";
import { colors, fontFamily, navHeader, radii } from "@/lib/theme";

export default function AgencyIntroductionsScreen() {
  const ac = useAccountCopy();
  const router = useRouter();
  const query = useQuery({ queryKey: ["apply-invites", "mine"], queryFn: fetchMyApplyInvites });
  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <Stack.Screen options={{ title: ac("Invites to apply"), ...navHeader }} />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => void query.refetch()} tintColor={colors.brand} />}
      >
        <View style={styles.intro}>
          <Text style={styles.title}>{ac("Invites to apply")}</Text>
          <Text style={styles.copy}>{ac("Employers and agencies can ask you to apply for a specific role. Accepting does not submit an application for you.")}</Text>
        </View>
        {query.isLoading ? <ActivityIndicator color={colors.brand} /> : query.isError ? (
          <Pressable accessibilityRole="button" style={styles.error} onPress={() => void query.refetch()}><Text style={styles.errorText}>{ac("Could not load invites. Tap to retry.")}</Text></Pressable>
        ) : (query.data?.data ?? []).length === 0 ? (
          <Text style={styles.empty}>{ac("No invites right now.")}</Text>
        ) : (query.data?.data ?? []).map((item) => (
          <Pressable key={item._id} style={styles.card} onPress={() => router.push(`/agency-introductions/${item._id}`)} accessibilityRole="button">
            <View style={styles.row}>
              <Text style={styles.agency}>{item.companyName || ac("Employer")}</Text>
              <Text style={styles.status}>{item.status}</Text>
            </View>
            <Text style={styles.role}>{item.jobTitle}</Text>
            <Text style={styles.view}>{ac("Review invite")} →</Text>
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
  view: { marginTop: 5, fontSize: 13, fontFamily: fontFamily.semiBold, color: colors.brand },
  empty: { padding: 32, textAlign: "center", color: colors.textMuted, fontFamily: fontFamily.regular },
  error: { padding: 16, borderRadius: radii.md, backgroundColor: "#fef2f2" },
  errorText: { color: "#991b1b", textAlign: "center", fontFamily: fontFamily.medium },
});
