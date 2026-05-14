import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshScreenIntro } from "@/components/gsh-ui-kit";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { fetchApplications, withdrawApplication } from "@/lib/api-client";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";
import type { Application, ApplicationJobRef } from "@/types/models";

function statusStyle(status: string) {
  const s = status.toLowerCase();
  if (s.includes("interview") || s.includes("offer")) return styles.badgeGood;
  if (s.includes("reject")) return styles.badgeBad;
  return styles.badgeNeutral;
}

export default function ApplicationsScreen() {
  const router = useRouter();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["applications"],
    queryFn: fetchApplications,
  });

  const withdraw = useMutation({
    mutationFn: (applicationId: string) => withdrawApplication(applicationId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["applications"] }),
  });

  function confirmWithdraw(appId: string, title: string) {
    Alert.alert("Withdraw application?", `Remove your application for ${title}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Withdraw",
        style: "destructive",
        onPress: () => withdraw.mutate(appId),
      },
    ]);
  }

  const rows = query.data ?? [];

  const listHeader = (
    <GshScreenIntro
      eyebrow="Pipeline"
      title="Applications"
      subtitle="Track every role you have applied for on the Hub — tap a card for the job, or withdraw if your plans change."
      style={{ paddingHorizontal: 16, marginBottom: 4 }}
    />
  );

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        {query.isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.brand} />
            <Text style={styles.muted}>Loading applications…</Text>
          </View>
        ) : query.isError ? (
          <View style={styles.center}>
            <Ionicons name="alert-circle-outline" size={40} color={colors.error} />
            <Text style={styles.err}>Could not load applications.</Text>
            <Pressable onPress={() => void query.refetch()} accessibilityRole="button" accessibilityLabel="Retry loading applications">
              <Text style={styles.retry}>Try again</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={rows}
            keyExtractor={(item) => item._id}
            ListHeaderComponent={listHeader}
            refreshControl={<RefreshControl refreshing={query.isFetching} onRefresh={() => query.refetch()} />}
            contentContainerStyle={styles.listPad}
            renderItem={({ item }) => {
              const job = item.jobId as ApplicationJobRef | undefined;
              const jid = job?._id;
              return (
                <View style={[styles.card, cardSurfaceStyle(true)]}>
                  <View style={styles.accent} />
                  <View style={styles.cardBody}>
                    <Pressable onPress={() => jid && router.push(`/job/${jid}`)} disabled={!jid} style={styles.cardMain}>
                      <Text style={styles.title} numberOfLines={2}>
                        {job?.title ?? "Role"}
                      </Text>
                      <Text style={styles.company} numberOfLines={1}>
                        {job?.companyName ?? "Employer"}
                      </Text>
                      <Text style={styles.meta} numberOfLines={1}>
                        {job?.location ?? ""}
                        {job?.jobType ? ` · ${job.jobType}` : ""}
                      </Text>
                      <View style={[styles.badge, statusStyle(item.status)]}>
                        <Text style={styles.badgeText}>{item.status}</Text>
                      </View>
                    </Pressable>
                    <Pressable
                      style={styles.withdraw}
                      onPress={() => confirmWithdraw(item._id, job?.title ?? "this role")}
                      disabled={withdraw.isPending}
                    >
                      <Text style={styles.withdrawText}>Withdraw application</Text>
                    </Pressable>
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="document-text-outline" size={40} color={colors.teal} />
                </View>
                <Text style={styles.empty}>No applications yet</Text>
                <Text style={styles.emptySub}>Discover roles on the Home tab and tap Apply when you are ready.</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  listPad: { paddingHorizontal: 16, paddingBottom: 32, gap: 12, paddingTop: 4 },
  card: { flexDirection: "row", borderRadius: radii.lg, overflow: "hidden" },
  accent: { width: 5, backgroundColor: colors.brand },
  cardBody: { flex: 1 },
  cardMain: { padding: 16 },
  title: { fontSize: 17, fontFamily: fontFamily.bold, color: colors.navy, letterSpacing: -0.2 },
  company: { marginTop: 8, fontSize: 15, fontFamily: fontFamily.semiBold, color: colors.textMarketing },
  meta: { marginTop: 4, fontSize: 14, fontFamily: fontFamily.regular, color: colors.textMuted },
  badge: { alignSelf: "flex-start", marginTop: 12, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radii.pill },
  badgeText: { fontSize: 12, fontFamily: fontFamily.bold, color: colors.navy },
  badgeGood: { backgroundColor: "#dcfce7" },
  badgeBad: { backgroundColor: "#fee2e2" },
  badgeNeutral: { backgroundColor: colors.purpleMuted, borderWidth: 1, borderColor: colors.purpleBorder },
  withdraw: { borderTopWidth: 1, borderTopColor: colors.surfaceMuted, paddingVertical: 14, alignItems: "center" },
  withdrawText: { color: colors.error, fontFamily: fontFamily.semiBold, fontSize: 15 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, gap: 12 },
  muted: { color: colors.textMuted, fontSize: 15, fontFamily: fontFamily.medium },
  err: { color: colors.error, textAlign: "center", fontFamily: fontFamily.medium },
  retry: { color: colors.brand, fontFamily: fontFamily.semiBold, fontSize: 16, marginTop: 4 },
  emptyWrap: { alignItems: "center", marginTop: 32, paddingHorizontal: 24, gap: 10 },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(14, 205, 209, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(14, 205, 209, 0.35)",
  },
  empty: { fontFamily: fontFamily.bold, fontSize: 18, color: colors.navy },
  emptySub: {
    textAlign: "center",
    color: colors.textMuted,
    fontFamily: fontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
  },
});
