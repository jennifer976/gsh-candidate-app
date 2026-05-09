import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  createJobSearchAlert,
  deleteJobSearchAlert,
  fetchCandidateNotificationPrefs,
  fetchJobMatches,
  fetchJobSearchAlerts,
  markAllJobMatchesRead,
  markJobMatchRead,
  patchCandidateNotificationPrefs,
  patchJobSearchAlert,
} from "@/lib/api-client";
import type { Job, JobMatchNotificationRow, JobSearchAlertDto } from "@/types/models";

function resolveJobId(jobField: unknown): string | null {
  if (!jobField || typeof jobField !== "object") return null;
  const j = jobField as Job;
  return j._id ? String(j._id) : null;
}

function jobTitleFromMatch(jobField: unknown): string {
  if (!jobField || typeof jobField !== "object") return "Job";
  const j = jobField as Job;
  return j.title || "Role";
}

function companyFromMatch(jobField: unknown): string {
  if (!jobField || typeof jobField !== "object") return "";
  const j = jobField as Job;
  return j.companyName || "";
}

export default function AlertsScreen() {
  const router = useRouter();
  const qc = useQueryClient();

  const prefsQuery = useQuery({
    queryKey: ["candidate", "notification-prefs"],
    queryFn: fetchCandidateNotificationPrefs,
  });

  const matchesQuery = useQuery({
    queryKey: ["candidate", "job-matches"],
    queryFn: () => fetchJobMatches({ limit: 50 }),
  });

  const searchesQuery = useQuery({
    queryKey: ["candidate", "job-search-alerts"],
    queryFn: fetchJobSearchAlerts,
  });

  const [newName, setNewName] = useState("");
  const [newQ, setNewQ] = useState("");

  const patchPrefs = useMutation({
    mutationFn: patchCandidateNotificationPrefs,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["candidate", "notification-prefs"] }),
  });

  const markAll = useMutation({
    mutationFn: markAllJobMatchesRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["candidate", "job-matches"] }),
  });

  const openMatch = useMutation({
    mutationFn: async (row: JobMatchNotificationRow) => {
      const jid = resolveJobId(row.jobId);
      if (!jid) throw new Error("Job unavailable");
      await markJobMatchRead(row._id);
      return jid;
    },
    onSuccess: (jobId) => {
      void qc.invalidateQueries({ queryKey: ["candidate", "job-matches"] });
      router.push(`/job/${jobId}`);
    },
    onError: (e: unknown) =>
      Alert.alert(
        "Could not open",
        e && typeof e === "object" && "message" in e ? String((e as { message: string }).message) : "Try again."
      ),
  });

  const toggleSearch = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      patchJobSearchAlert(id, { isActive: !isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["candidate", "job-search-alerts"] }),
  });

  const removeSearch = useMutation({
    mutationFn: deleteJobSearchAlert,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["candidate", "job-search-alerts"] }),
  });

  const createSearch = useMutation({
    mutationFn: () =>
      createJobSearchAlert(newName.trim() || "My search", {
        q: newQ.trim(),
      }),
    onSuccess: () => {
      setNewName("");
      setNewQ("");
      qc.invalidateQueries({ queryKey: ["candidate", "job-search-alerts"] });
    },
    onError: (e: unknown) =>
      Alert.alert(
        "Could not create alert",
        e && typeof e === "object" && "message" in e ? String((e as { message: string }).message) : "Try again."
      ),
  });

  const prefs = prefsQuery.data;
  const matches = matchesQuery.data?.data ?? [];
  const unread = matchesQuery.data?.unreadCount ?? 0;
  const searches = searchesQuery.data ?? [];

  const refreshing = prefsQuery.isFetching || matchesQuery.isFetching || searchesQuery.isFetching;

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {
          void prefsQuery.refetch();
          void matchesQuery.refetch();
          void searchesQuery.refetch();
        }} />}
        contentContainerStyle={styles.pad}
      >
        <Text style={styles.h1}>Notifications</Text>
        {prefsQuery.isLoading ? (
          <ActivityIndicator style={{ marginVertical: 16 }} />
        ) : prefs ? (
          <View style={styles.card}>
            <RowSwitch
              label="Email notifications"
              value={prefs.emailNotifications}
              onValueChange={(v) => patchPrefs.mutate({ emailNotifications: v })}
              disabled={patchPrefs.isPending}
            />
            <RowSwitch
              label="Job alert emails"
              value={prefs.jobAlerts}
              onValueChange={(v) => patchPrefs.mutate({ jobAlerts: v })}
              disabled={patchPrefs.isPending}
            />
            <RowSwitch
              label="Application updates"
              value={prefs.applicationUpdates}
              onValueChange={(v) => patchPrefs.mutate({ applicationUpdates: v })}
              disabled={patchPrefs.isPending}
            />
            <RowSwitch
              label="Push notifications"
              value={prefs.pushNotifications ?? true}
              onValueChange={(v) => patchPrefs.mutate({ pushNotifications: v })}
              disabled={patchPrefs.isPending}
            />
          </View>
        ) : null}

        <Text style={styles.h2}>New role matches</Text>
        <Text style={styles.sub}>{unread > 0 ? `${unread} unread` : "You're up to date"}</Text>
        {matches.length > 0 ? (
          <Pressable
            style={[styles.secondaryBtn, markAll.isPending && styles.disabled]}
            onPress={() => markAll.mutate()}
            disabled={markAll.isPending}
          >
            <Text style={styles.secondaryBtnText}>Mark all as read</Text>
          </Pressable>
        ) : null}

        {matchesQuery.isLoading ? (
          <ActivityIndicator style={{ marginVertical: 12 }} />
        ) : (
          matches.map((row) => {
            const jid = resolveJobId(row.jobId);
            return (
              <Pressable
                key={row._id}
                style={[styles.matchCard, !row.read && styles.matchUnread]}
                onPress={() => jid && openMatch.mutate(row)}
                disabled={openMatch.isPending || !jid}
              >
                <Text style={styles.matchTitle} numberOfLines={2}>
                  {jobTitleFromMatch(row.jobId)}
                </Text>
                <Text style={styles.matchCo} numberOfLines={1}>
                  {companyFromMatch(row.jobId)}
                </Text>
                <Text style={styles.matchHint} numberOfLines={1}>
                  {row.source === "followed_employer" ? "From employer you follow" : "From saved search"}
                </Text>
              </Pressable>
            );
          })
        )}
        {!matchesQuery.isLoading && matches.length === 0 ? (
          <Text style={styles.empty}>No matches yet. Add a saved search below.</Text>
        ) : null}

        <Text style={[styles.h2, { marginTop: 24 }]}>Saved searches</Text>
        <Text style={styles.sub}>We notify you when new listings match your filters.</Text>

        {searches.map((s: JobSearchAlertDto) => (
          <View key={s._id} style={styles.searchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.searchName}>{s.name?.trim() || "Saved search"}</Text>
              <Text style={styles.searchFilters} numberOfLines={2}>
                {formatFilters(s.filters)}
              </Text>
            </View>
            <Switch
              value={s.isActive}
              onValueChange={() => toggleSearch.mutate({ id: s._id, isActive: s.isActive })}
            />
            <Pressable
              style={styles.deleteBtn}
              onPress={() =>
                Alert.alert("Delete saved search?", undefined, [
                  { text: "Cancel", style: "cancel" },
                  { text: "Delete", style: "destructive", onPress: () => removeSearch.mutate(s._id) },
                ])
              }
            >
              <Text style={styles.deleteText}>✕</Text>
            </Pressable>
          </View>
        ))}

        <Text style={[styles.h2, { marginTop: 20 }]}>Add saved search</Text>
        <TextInput
          style={styles.input}
          placeholder="Label (optional)"
          placeholderTextColor="#94a3b8"
          value={newName}
          onChangeText={setNewName}
        />
        <TextInput
          style={styles.input}
          placeholder="Keywords (required), e.g. visa sponsorship engineer"
          placeholderTextColor="#94a3b8"
          value={newQ}
          onChangeText={setNewQ}
        />
        <Pressable
          style={[styles.primaryBtn, (!newQ.trim() || createSearch.isPending) && styles.disabled]}
          onPress={() => createSearch.mutate()}
          disabled={!newQ.trim() || createSearch.isPending}
        >
          <Text style={styles.primaryBtnText}>{createSearch.isPending ? "Saving…" : "Save alert"}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function RowSwitch(props: {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.switchRow}>
      <Text style={styles.switchLabel}>{props.label}</Text>
      <Switch value={props.value} onValueChange={props.onValueChange} disabled={props.disabled} />
    </View>
  );
}

function formatFilters(f: Record<string, unknown>): string {
  const parts: string[] = [];
  if (typeof f.q === "string" && f.q.trim()) parts.push(`“${f.q.trim()}”`);
  if (typeof f.location === "string" && f.location.trim()) parts.push(f.location.trim());
  if (typeof f.industry === "string" && f.industry.trim()) parts.push(f.industry.trim());
  return parts.length ? parts.join(" · ") : "Any filters";
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f8fafc" },
  pad: { padding: 16, paddingBottom: 40 },
  h1: { fontSize: 22, fontWeight: "800", color: "#0f172a", marginBottom: 12 },
  h2: { fontSize: 17, fontWeight: "700", color: "#0f172a", marginBottom: 6 },
  sub: { fontSize: 14, color: "#64748b", marginBottom: 12, lineHeight: 20 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingVertical: 8,
    marginBottom: 20,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  switchLabel: { flex: 1, fontSize: 15, color: "#334155", fontWeight: "500" },
  secondaryBtn: {
    alignSelf: "flex-start",
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#e0e7ff",
  },
  secondaryBtnText: { color: "#3730a3", fontWeight: "700", fontSize: 14 },
  matchCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  matchUnread: { borderColor: "#a5b4fc", backgroundColor: "#eef2ff" },
  matchTitle: { fontSize: 16, fontWeight: "700", color: "#0f172a" },
  matchCo: { marginTop: 4, fontSize: 14, color: "#475569" },
  matchHint: { marginTop: 6, fontSize: 12, color: "#64748b" },
  empty: { color: "#64748b", fontSize: 14, marginBottom: 12 },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  searchName: { fontSize: 15, fontWeight: "700", color: "#0f172a" },
  searchFilters: { marginTop: 4, fontSize: 13, color: "#64748b" },
  deleteBtn: { padding: 8 },
  deleteText: { fontSize: 18, color: "#b91c1c", fontWeight: "700" },
  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    fontSize: 16,
    backgroundColor: "#fff",
    marginBottom: 10,
    color: "#0f172a",
  },
  primaryBtn: {
    backgroundColor: "#4f46e5",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  disabled: { opacity: 0.55 },
});
