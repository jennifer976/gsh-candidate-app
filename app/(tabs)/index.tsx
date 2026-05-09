import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchPublicJobs } from "@/lib/api-client";
import type { Job } from "@/types/models";

function formatSalary(job: Job): string {
  const cur = job.salaryCurrency || "GBP";
  const sym = cur === "GBP" ? "£" : cur === "EUR" ? "€" : cur === "USD" ? "$" : `${cur} `;
  if (job.minSalary != null && job.maxSalary != null) {
    return `${sym}${job.minSalary.toLocaleString()}–${job.maxSalary.toLocaleString()}`;
  }
  if (job.minSalary != null) return `From ${sym}${job.minSalary.toLocaleString()}`;
  return "";
}

export default function JobsScreen() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 400);
    return () => clearTimeout(t);
  }, [q]);

  const query = useQuery({
    queryKey: ["public-jobs", debouncedQ],
    queryFn: () =>
      fetchPublicJobs({
        q: debouncedQ || undefined,
        page: 1,
        perPage: 25,
      }),
  });

  const onRefresh = useCallback(() => {
    void query.refetch();
  }, [query]);

  const jobs = query.data?.data ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <Pressable style={styles.alertsBanner} onPress={() => router.push("/alerts")}>
        <Text style={styles.alertsBannerTitle}>Job alerts & saved searches</Text>
        <Text style={styles.alertsBannerSub}>Notification settings, new matches, keyword alerts</Text>
      </Pressable>
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.search}
          placeholder="Search roles, skills, company…"
          placeholderTextColor="#94a3b8"
          value={q}
          onChangeText={setQ}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {query.isLoading && !query.data ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      ) : query.isError ? (
        <View style={styles.center}>
          <Text style={styles.err}>Could not load jobs. Pull to retry.</Text>
        </View>
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item._id}
          refreshControl={<RefreshControl refreshing={query.isFetching} onRefresh={onRefresh} />}
          contentContainerStyle={styles.listPad}
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => router.push(`/job/${item._id}`)}>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.cardCompany} numberOfLines={1}>
                {item.companyName || "Employer"}
              </Text>
              <Text style={styles.cardMeta} numberOfLines={1}>
                {[item.locationCity, item.locationCountry].filter(Boolean).join(", ") || item.location || ""}
                {item.jobType ? ` · ${item.jobType}` : ""}
              </Text>
              {formatSalary(item) ? <Text style={styles.cardSalary}>{formatSalary(item)}</Text> : null}
            </Pressable>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>No roles match your search yet. Try another keyword.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f8fafc" },
  alertsBanner: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#eef2ff",
    borderWidth: 1,
    borderColor: "#c7d2fe",
  },
  alertsBannerTitle: { fontSize: 15, fontWeight: "700", color: "#3730a3" },
  alertsBannerSub: { marginTop: 4, fontSize: 13, color: "#5b21b6" },
  searchWrap: { paddingHorizontal: 16, paddingVertical: 12 },
  search: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#0f172a",
  },
  listPad: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 4,
  },
  cardTitle: { fontSize: 17, fontWeight: "700", color: "#0f172a" },
  cardCompany: { marginTop: 6, fontSize: 15, fontWeight: "600", color: "#334155" },
  cardMeta: { marginTop: 4, fontSize: 14, color: "#64748b" },
  cardSalary: { marginTop: 8, fontSize: 14, fontWeight: "600", color: "#4f46e5" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  err: { color: "#b91c1c", textAlign: "center", fontSize: 15 },
  empty: { textAlign: "center", color: "#64748b", marginTop: 40, paddingHorizontal: 24, fontSize: 15 },
});
