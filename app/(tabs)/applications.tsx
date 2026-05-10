import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchApplications, withdrawApplication } from "@/lib/api-client";
import { colors } from "@/lib/theme";
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
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      {query.isLoading ? (
        <View style={styles.center}>
          <Text style={styles.muted}>Loading applications…</Text>
        </View>
      ) : query.isError ? (
        <View style={styles.center}>
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
              <View style={styles.card}>
                <Pressable
                  onPress={() => jid && router.push(`/job/${jid}`)}
                  disabled={!jid}
                  style={styles.cardMain}
                >
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
                  <Text style={styles.withdrawText}>Withdraw</Text>
                </Pressable>
              </View>
            );
          }}
          ListEmptyComponent={
            <Text style={styles.empty}>You have not applied yet. Browse roles under Jobs and tap Apply.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceMuted },
  listPad: { padding: 16, paddingBottom: 32, gap: 12 },
  card: {
    backgroundColor: colors.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  cardMain: { padding: 16 },
  title: { fontSize: 17, fontWeight: "700", color: colors.textPrimary },
  company: { marginTop: 6, fontSize: 15, fontWeight: "600", color: "#334155" },
  meta: { marginTop: 4, fontSize: 14, color: colors.textMuted },
  badge: { alignSelf: "flex-start", marginTop: 10, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 12, fontWeight: "700", color: colors.textPrimary },
  badgeGood: { backgroundColor: "#dcfce7" },
  badgeBad: { backgroundColor: "#fee2e2" },
  badgeNeutral: { backgroundColor: colors.purpleMuted },
  withdraw: { borderTopWidth: 1, borderTopColor: colors.surfaceMuted, paddingVertical: 12, alignItems: "center" },
  withdrawText: { color: colors.error, fontWeight: "600", fontSize: 15 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  muted: { color: colors.textMuted, fontSize: 15 },
  err: { color: colors.error, textAlign: "center" },
  empty: { textAlign: "center", color: colors.textMuted, marginTop: 48, paddingHorizontal: 24, fontSize: 15, lineHeight: 22 },
});
