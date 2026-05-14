import { Ionicons } from "@expo/vector-icons";
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
import { GshGradientPrimaryButton } from "@/components/GshGradientPrimaryButton";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { GshScreenIntro, GshSectionTitle } from "@/components/gsh-ui-kit";
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
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";
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

  const prefsErrNoData = prefsQuery.isError && prefsQuery.data === undefined;
  const matchesErrNoData = matchesQuery.isError && matchesQuery.data === undefined;
  const searchesErrNoData = searchesQuery.isError && searchesQuery.data === undefined;

  const prefsBoot = prefsQuery.isPending && prefsQuery.data === undefined;
  const matchesBoot = matchesQuery.isPending && matchesQuery.data === undefined;
  const searchesBoot = searchesQuery.isPending && searchesQuery.data === undefined;

  const refreshing = prefsQuery.isFetching || matchesQuery.isFetching || searchesQuery.isFetching;

  return (
    <GshScreenBackground>
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {
          void prefsQuery.refetch();
          void matchesQuery.refetch();
          void searchesQuery.refetch();
        }} />}
        contentContainerStyle={styles.pad}
      >
        <GshScreenIntro
          eyebrow="Stay in the loop"
          title="Alerts & notifications"
          subtitle="Control email, job alerts, and push. When you are signed in, pushes mirror important updates — tapping opens the right screen when a link is included."
          style={{ marginBottom: 4 }}
        />
        {prefsBoot ? (
          <ActivityIndicator style={{ marginVertical: 16 }} color={colors.brand} />
        ) : prefsErrNoData ? (
          <View style={[styles.sectionErrCard, cardSurfaceStyle(false)]}>
            <Ionicons name="cloud-offline-outline" size={28} color={colors.textMuted} />
            <Text style={styles.sectionErrTitle}>Notification preferences could not be loaded</Text>
            <Text style={styles.sectionErrSub}>Check your connection and try again.</Text>
            <Pressable
              style={styles.sectionRetryBtn}
              onPress={() => void prefsQuery.refetch()}
              accessibilityRole="button"
              accessibilityLabel="Retry loading notification preferences"
            >
              <Text style={styles.sectionRetryBtnText}>Try again</Text>
            </Pressable>
          </View>
        ) : prefs ? (
          <View style={[styles.prefsCard, cardSurfaceStyle(false)]}>
            {prefsQuery.isError ? (
              <Text style={styles.staleHint}>Could not refresh preferences — showing last saved settings.</Text>
            ) : null}
            <RowSwitch
              label="Email notifications"
              value={prefs.emailNotifications}
              onValueChange={(v) => patchPrefs.mutate({ emailNotifications: v })}
              disabled={patchPrefs.isPending}
              showDivider
            />
            <RowSwitch
              label="Job alert emails"
              value={prefs.jobAlerts}
              onValueChange={(v) => patchPrefs.mutate({ jobAlerts: v })}
              disabled={patchPrefs.isPending}
              showDivider
            />
            <RowSwitch
              label="Application updates"
              value={prefs.applicationUpdates}
              onValueChange={(v) => patchPrefs.mutate({ applicationUpdates: v })}
              disabled={patchPrefs.isPending}
              showDivider
            />
            <RowSwitch
              label="Push notifications"
              value={prefs.pushNotifications ?? true}
              onValueChange={(v) => patchPrefs.mutate({ pushNotifications: v })}
              disabled={patchPrefs.isPending}
            />
          </View>
        ) : null}

        <GshSectionTitle title="New role matches" topSpacing="md" />
        <Text style={styles.sub}>
          {matchesErrNoData
            ? "Matches could not be loaded."
            : unread > 0
              ? `${unread} unread`
              : "You're up to date"}
        </Text>
        {!matchesErrNoData && matches.length > 0 ? (
          <Pressable
            style={[styles.secondaryBtn, markAll.isPending && styles.disabled]}
            onPress={() => markAll.mutate()}
            disabled={markAll.isPending}
          >
            <Text style={styles.secondaryBtnText}>Mark all as read</Text>
          </Pressable>
        ) : null}

        {matchesBoot ? (
          <ActivityIndicator style={{ marginVertical: 12 }} color={colors.brand} />
        ) : matchesErrNoData ? (
          <View style={[styles.sectionErrCard, cardSurfaceStyle(false)]}>
            <Ionicons name="cloud-offline-outline" size={28} color={colors.textMuted} />
            <Text style={styles.sectionErrTitle}>Role matches could not be loaded</Text>
            <Text style={styles.sectionErrSub}>Pull down or retry below.</Text>
            <Pressable
              style={styles.sectionRetryBtn}
              onPress={() => void matchesQuery.refetch()}
              accessibilityRole="button"
              accessibilityLabel="Retry loading role matches"
            >
              <Text style={styles.sectionRetryBtnText}>Try again</Text>
            </Pressable>
          </View>
        ) : (
          matches.map((row) => {
            const jid = resolveJobId(row.jobId);
            return (
              <Pressable
                key={row._id}
                style={[cardSurfaceStyle(true), styles.matchCard, !row.read && styles.matchUnread]}
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
        {!matchesBoot && !matchesErrNoData && matches.length === 0 ? (
          <View style={[styles.emptyCard, cardSurfaceStyle(false)]}>
            <Text style={styles.empty}>No matches yet. Add a saved search below.</Text>
          </View>
        ) : null}

        <GshSectionTitle title="Saved searches" topSpacing="lg" />
        <Text style={styles.sub}>We notify you when new listings match your filters.</Text>

        {searchesBoot ? (
          <ActivityIndicator style={{ marginVertical: 12 }} color={colors.brand} />
        ) : searchesErrNoData ? (
          <View style={[styles.sectionErrCard, cardSurfaceStyle(false)]}>
            <Ionicons name="cloud-offline-outline" size={28} color={colors.textMuted} />
            <Text style={styles.sectionErrTitle}>Saved searches could not be loaded</Text>
            <Text style={styles.sectionErrSub}>Check your connection and try again.</Text>
            <Pressable
              style={styles.sectionRetryBtn}
              onPress={() => void searchesQuery.refetch()}
              accessibilityRole="button"
              accessibilityLabel="Retry loading saved searches"
            >
              <Text style={styles.sectionRetryBtnText}>Try again</Text>
            </Pressable>
          </View>
        ) : (
          searches.map((s: JobSearchAlertDto) => (
          <View key={s._id} style={[cardSurfaceStyle(false), styles.searchRow]}>
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
          ))
        )}

        <GshSectionTitle title="Add saved search" topSpacing="md" />
        <TextInput
          style={styles.input}
          placeholder="Label (optional)"
          placeholderTextColor={colors.placeholder}
          value={newName}
          onChangeText={setNewName}
        />
        <TextInput
          style={styles.input}
          placeholder="Keywords (required), e.g. visa sponsorship engineer"
          placeholderTextColor={colors.placeholder}
          value={newQ}
          onChangeText={setNewQ}
        />
        <GshGradientPrimaryButton
          title={createSearch.isPending ? "Saving…" : "Save alert"}
          onPress={() => createSearch.mutate()}
          disabled={!newQ.trim() || createSearch.isPending}
          containerStyle={{ marginTop: 4 }}
        />
      </ScrollView>
    </SafeAreaView>
    </GshScreenBackground>
  );
}

function RowSwitch(props: {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
  showDivider?: boolean;
}) {
  return (
    <View style={[styles.switchRow, props.showDivider ? styles.switchRowDivider : null]}>
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
  safe: { flex: 1 },
  pad: { padding: 16, paddingBottom: 40 },
  sub: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 12,
    lineHeight: 20,
  },
  prefsCard: {
    paddingVertical: 4,
    marginBottom: 22,
    backgroundColor: colors.background,
  },
  staleHint: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 4,
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    lineHeight: 18,
  },
  sectionErrCard: {
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 14,
    gap: 8,
    backgroundColor: colors.background,
  },
  sectionErrTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
    textAlign: "center",
  },
  sectionErrSub: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 18,
  },
  sectionRetryBtn: {
    marginTop: 4,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: radii.md,
    backgroundColor: colors.brand,
  },
  sectionRetryBtnText: { fontFamily: fontFamily.semiBold, fontSize: 14, color: colors.white },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  switchRowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  switchLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: fontFamily.medium,
    color: colors.textPrimary,
  },
  secondaryBtn: {
    alignSelf: "flex-start",
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radii.sm,
    backgroundColor: colors.purpleMuted,
    borderWidth: 1,
    borderColor: colors.purpleBorder,
  },
  secondaryBtnText: {
    color: colors.purpleTextDark,
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
  },
  matchCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: radii.lg,
    backgroundColor: colors.background,
  },
  matchUnread: { borderColor: colors.unreadBorder, backgroundColor: colors.unreadBg },
  matchTitle: { fontSize: 16, fontFamily: fontFamily.bold, color: colors.textPrimary },
  matchCo: { marginTop: 4, fontSize: 14, fontFamily: fontFamily.regular, color: colors.textSecondary },
  matchHint: { marginTop: 6, fontSize: 12, fontFamily: fontFamily.medium, color: colors.textMuted },
  emptyCard: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 14,
    backgroundColor: colors.background,
  },
  empty: {
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 14,
    marginBottom: 12,
    backgroundColor: colors.background,
  },
  searchName: { fontSize: 15, fontFamily: fontFamily.bold, color: colors.textPrimary },
  searchFilters: { marginTop: 4, fontSize: 13, fontFamily: fontFamily.regular, color: colors.textMuted },
  deleteBtn: { padding: 8 },
  deleteText: { fontSize: 18, color: colors.error, fontFamily: fontFamily.bold },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    fontSize: 16,
    fontFamily: fontFamily.regular,
    backgroundColor: colors.background,
    marginBottom: 10,
    color: colors.textPrimary,
  },
  disabled: { opacity: 0.55 },
});
