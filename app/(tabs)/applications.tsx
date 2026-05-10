import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { fetchApplications, withdrawApplication } from "@/lib/api-client";
import { cardSurfaceStyle, colors, fontFamily } from "@/lib/theme";
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
          </View>
        ) : (
          <FlatList
            data={rows}
            keyExtractor={(item) => item._id}
            refreshControl={<RefreshControl refreshing={query.isFetching} onRefresh={() => query.refetch()} />}
            contentContainerStyle={styles.listPad}
            renderItem={({ item }) => {
              const job = item.jobId as ApplicationJobRef | undefined;
              const jid = job?._id;
              return (
                <View style={[styles.card, cardSurfaceStyle(true)]}>
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
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Ionicons name="document-text-outline" size={48} color={colors.borderStrong} />
                <Text style={styles.empty}>No applications yet</Text>
                <Text style={styles.emptySub}>Browse roles from Home and tap Apply when you are ready.</Text>
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
  listPad: { padding: 16, paddingBottom: 32, gap: 12 },
  card: { overflow: "hidden" },
  cardMain: { padding: 16 },
  title: { fontSize: 17, fontFamily: fontFamily.bold, color: colors.textPrimary },
  company: { marginTop: 8, fontSize: 15, fontFamily: fontFamily.semiBold, color: colors.textMarketing },
  meta: { marginTop: 4, fontSize: 14, fontFamily: fontFamily.regular, color: colors.textMuted },
  badge: { alignSelf: "flex-start", marginTop: 12, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  badgeText: { fontSize: 12, fontFamily: fontFamily.bold, color: colors.textPrimary },
  badgeGood: { backgroundColor: "#dcfce7" },
  badgeBad: { backgroundColor: "#fee2e2" },
  badgeNeutral: { backgroundColor: colors.purpleMuted },
  withdraw: { borderTopWidth: 1, borderTopColor: colors.surfaceMuted, paddingVertical: 14, alignItems: "center" },
  withdrawText: { color: colors.error, fontFamily: fontFamily.semiBold, fontSize: 15 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, gap: 12 },
  muted: { color: colors.textMuted, fontSize: 15, fontFamily: fontFamily.medium },
  err: { color: colors.error, textAlign: "center", fontFamily: fontFamily.medium },
  emptyWrap: { alignItems: "center", marginTop: 48, paddingHorizontal: 24, gap: 8 },
  empty: { fontFamily: fontFamily.semiBold, fontSize: 17, color: colors.textPrimary },
  emptySub: {
    textAlign: "center",
    color: colors.textMuted,
    fontFamily: fontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
  },
});
