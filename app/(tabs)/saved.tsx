import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchSavedJobs, unsaveJob } from "@/lib/api-client";
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

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      {query.isLoading ? (
        <View style={styles.center}>
          <Text style={styles.muted}>Loading saved roles…</Text>
        </View>
      ) : query.isError ? (
        <View style={styles.center}>
          <Text style={styles.err}>Saved jobs could not be loaded.</Text>
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => item._id}
          refreshControl={<RefreshControl refreshing={query.isFetching} onRefresh={() => query.refetch()} />}
          contentContainerStyle={styles.listPad}
          renderItem={({ item }) => {
            const job = item.jobId as Job | undefined;
            if (!job?._id) return null;
            return (
              <View style={styles.card}>
                <Pressable onPress={() => router.push(`/job/${job._id}`)}>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {job.title}
                  </Text>
                  <Text style={styles.cardCompany} numberOfLines={1}>
                    {job.companyName || "Employer"}
                  </Text>
                </Pressable>
                <Pressable
                  style={styles.removeBtn}
                  onPress={() => unsave.mutate(item)}
                  disabled={unsave.isPending}
                  accessibilityRole="button"
                  accessibilityLabel="Remove from saved"
                >
                  <Text style={styles.removeText}>Remove</Text>
                </Pressable>
              </View>
            );
          }}
          ListEmptyComponent={<Text style={styles.empty}>No saved jobs yet. Tap 💼 to browse.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f8fafc" },
  listPad: { paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 24, gap: 12 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  cardTitle: { fontSize: 17, fontWeight: "700", color: "#0f172a" },
  cardCompany: { marginTop: 6, fontSize: 15, fontWeight: "600", color: "#334155" },
  removeBtn: { alignSelf: "flex-start", marginTop: 12 },
  removeText: { color: "#b91c1c", fontWeight: "600", fontSize: 15 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  muted: { color: "#64748b", fontSize: 15 },
  err: { color: "#b91c1c", textAlign: "center" },
  empty: { textAlign: "center", color: "#64748b", marginTop: 48, paddingHorizontal: 24, fontSize: 15 },
});
