import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshScreenIntro } from "@/components/gsh-ui-kit";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { fetchSavedJobs, unsaveJob } from "@/lib/api-client";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";
import type { Job, SavedJobPopulated } from "@/types/models";

export default function SavedJobsScreen() {
  const router = useRouter();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["saved-jobs"],
    queryFn: fetchSavedJobs,
  });

  const unsave = useMutation({
    mutationFn: (row: SavedJobPopulated) => unsaveJob(row._id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["saved-jobs"] }),
    onError: (e: unknown) =>
      Alert.alert(
        "Could not remove",
        e && typeof e === "object" && "message" in e ? String((e as { message: string }).message) : "Try again."
      ),
  });

  const rows = query.data ?? [];

  const listHeader = (
    <GshScreenIntro
      eyebrow="Shortlist"
      title="Saved jobs"
      subtitle="Roles you bookmarked on the Hub — open a card to view details or remove it from your list."
      style={{ paddingHorizontal: 16, marginBottom: 4 }}
    />
  );

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        {query.isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.brand} />
            <Text style={styles.muted}>Loading saved roles…</Text>
          </View>
        ) : query.isError ? (
          <View style={styles.center}>
            <Ionicons name="alert-circle-outline" size={40} color={colors.error} />
            <Text style={styles.err}>Saved jobs could not be loaded.</Text>
            <Pressable onPress={() => void query.refetch()} accessibilityRole="button" accessibilityLabel="Retry loading saved jobs">
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
              const job = item.jobId as Job | undefined;
              if (!job?._id) return null;
              return (
                <View style={[styles.card, cardSurfaceStyle(true)]}>
                  <View style={styles.accent} />
                  <View style={styles.cardBody}>
                    <Pressable onPress={() => router.push(`/job/${job._id}`)} style={styles.cardMain}>
                      <Text style={styles.cardTitle} numberOfLines={2}>
                        {job.title}
                      </Text>
                      <Text style={styles.cardCompany} numberOfLines={1}>
                        {job.companyName || "Employer"}
                      </Text>
                      <View style={styles.cardHint}>
                        <Text style={styles.viewRole}>Open role</Text>
                        <Ionicons name="chevron-forward" size={18} color={colors.brand} />
                      </View>
                    </Pressable>
                    <Pressable
                      style={styles.removeBtn}
                      onPress={() => unsave.mutate(item)}
                      disabled={unsave.isPending}
                      accessibilityRole="button"
                      accessibilityLabel="Remove from saved"
                    >
                      <Ionicons name="trash-outline" size={18} color={colors.error} />
                      <Text style={styles.removeText}>Remove</Text>
                    </Pressable>
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="bookmark-outline" size={40} color={colors.brand} />
                </View>
                <Text style={styles.empty}>No saved jobs yet.</Text>
                <Text style={styles.emptySub}>Browse Discover and tap the bookmark on roles you want to revisit.</Text>
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
  listPad: { paddingHorizontal: 16, paddingBottom: 24, gap: 12, paddingTop: 4 },
  card: { flexDirection: "row", borderRadius: radii.lg, overflow: "hidden" },
  accent: { width: 5, backgroundColor: colors.teal },
  cardBody: { flex: 1 },
  cardMain: { padding: 16 },
  cardTitle: { fontSize: 17, fontFamily: fontFamily.bold, color: colors.navy, letterSpacing: -0.2 },
  cardCompany: { marginTop: 8, fontSize: 15, fontFamily: fontFamily.semiBold, color: colors.textMarketing },
  cardHint: { flexDirection: "row", alignItems: "center", marginTop: 12, gap: 4 },
  viewRole: { fontSize: 14, fontFamily: fontFamily.semiBold, color: colors.brand },
  removeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceMuted,
    paddingVertical: 14,
    backgroundColor: colors.background,
  },
  removeText: { color: colors.error, fontFamily: fontFamily.semiBold, fontSize: 15 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, gap: 12 },
  muted: { color: colors.textMuted, fontSize: 15, fontFamily: fontFamily.medium },
  err: { color: colors.error, textAlign: "center", fontFamily: fontFamily.medium },
  retry: { color: colors.brand, fontFamily: fontFamily.semiBold, fontSize: 16, marginTop: 4 },
  emptyWrap: { alignItems: "center", paddingHorizontal: 24, marginTop: 32, gap: 10 },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.purpleMuted,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.purpleBorder,
  },
  empty: { textAlign: "center", color: colors.navy, fontFamily: fontFamily.bold, fontSize: 18 },
  emptySub: {
    textAlign: "center",
    color: colors.textMuted,
    fontFamily: fontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
    paddingHorizontal: 12,
  },
});
