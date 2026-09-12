import { useAppCopy } from "@/lib/i18n";
import { applicationStatusLabel } from "@/lib/i18n/catalog";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshScreenShell } from "@/components/GshScreenShell";
import { fetchApplications, withdrawApplication } from "@/lib/api-client";
import { stackListLeadStyle } from "@/lib/screen-layout";
import { colors, feedCardStyle, fontFamily, radii } from "@/lib/theme";
import type { Application, ApplicationJobRef } from "@/types/models";

function isClosedOrPausedJob(job: ApplicationJobRef | undefined): boolean {
  const status = job?.status?.toLowerCase();
  return status === "closed" || status === "de-activate";
}

function displayStatus(
  app: Application,
  job: ApplicationJobRef | undefined,
): string {
  const status = job?.status?.toLowerCase();
  if (status === "de-activate") return "Role paused";
  if (status === "closed") return "Role closed";
  return app.status || "Pending";
}

function statusStyle(status: string) {
  const s = status.toLowerCase();
  if (s.includes("closed") || s.includes("paused")) return styles.badgeBad;
  if (s.includes("interview") || s.includes("offer")) return styles.badgeGood;
  if (s.includes("reject")) return styles.badgeBad;
  return styles.badgeNeutral;
}

function canWithdrawApplication(status: string): boolean {
  return !["rejected", "hired", "withdrawn", "closed"].includes(
    status.trim().toLowerCase(),
  );
}

function formatInterviewDate(
  value?: string,
  timezone?: string,
  locale = "en-GB",
): string {
  if (!value) return "";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  try {
    return date.toLocaleString(locale, {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      ...(timezone ? { timeZone: timezone } : {}),
    });
  } catch {
    return date.toLocaleString(locale);
  }
}

export default function ApplicationsScreen() {
  const { t, locale } = useAppCopy();
  const router = useRouter();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["applications"],
    queryFn: fetchApplications,
  });

  const withdraw = useMutation({
    mutationFn: (applicationId: string) => withdrawApplication(applicationId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["applications"] }),
    onError: () =>
      Alert.alert(
        t("applicationWithdrawError"),
        t("applicationWithdrawErrorHelp"),
      ),
  });

  function confirmWithdraw(appId: string, title: string) {
    Alert.alert(
      t("applicationWithdrawTitle"),
      t("applicationWithdrawHelp", { title }),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("applicationWithdraw"),
          style: "destructive",
          onPress: () => withdraw.mutate(appId),
        },
      ],
    );
  }

  const rows = query.data ?? [];

  const listHeader = (
    <View style={styles.listHeader}>
      <Text style={styles.listEyebrow}>{t("homeApplied")}</Text>
      <Text style={styles.listSubLead}>{t("applicationUpdates")}</Text>
    </View>
  );

  return (
    <GshScreenShell constrainTabletWidth>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        {query.isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.brand} />
            <Text style={styles.muted}>{t("applicationLoading")}</Text>
          </View>
        ) : query.isError ? (
          <View style={styles.center}>
            <Ionicons
              name="alert-circle-outline"
              size={40}
              color={colors.error}
            />
            <Text style={styles.err}>{t("applicationLoadError")}</Text>
            <Pressable
              onPress={() => void query.refetch()}
              accessibilityRole="button"
              accessibilityLabel={t("applicationRetry")}
            >
              <Text style={styles.retry}>{t("retry")}</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={rows}
            keyExtractor={(item) => item.id ?? item._id}
            ListHeaderComponent={listHeader}
            refreshControl={
              <RefreshControl
                refreshing={query.isFetching}
                onRefresh={() => query.refetch()}
              />
            }
            contentContainerStyle={styles.listPad}
            renderItem={({ item }) => {
              const job = item.jobId as ApplicationJobRef | undefined;
              const jid = job?._id;
              const rawStatus = displayStatus(item, job);
              const visibleStatus =
                rawStatus === "Role paused"
                  ? t("applicationPaused")
                  : rawStatus === "Role closed"
                    ? t("applicationClosed")
                    : applicationStatusLabel(rawStatus, locale);
              const lockedByJobLifecycle = isClosedOrPausedJob(job);
              const canWithdraw =
                !lockedByJobLifecycle && canWithdrawApplication(item.status);
              const interviewDate = formatInterviewDate(
                item.interviewSchedule?.scheduledAt,
                item.interviewSchedule?.timezone,
                locale,
              );
              return (
                <View style={[styles.card, feedCardStyle()]}>
                  <View style={styles.cardBody}>
                    <Pressable
                      onPress={() => jid && router.push(`/job/${jid}`)}
                      disabled={!jid}
                      style={styles.cardMain}
                    >
                      <Text style={styles.title} numberOfLines={2}>
                        {job?.title ?? t("applicationRole")}
                      </Text>
                      <Text style={styles.company} numberOfLines={1}>
                        {job?.companyName ?? t("screenEmployer")}
                      </Text>
                      <Text style={styles.meta} numberOfLines={1}>
                        {job?.location ?? ""}
                        {job?.jobType ? ` · ${job.jobType}` : ""}
                      </Text>
                      <View style={[styles.badge, statusStyle(rawStatus)]}>
                        <Text style={styles.badgeText}>{visibleStatus}</Text>
                      </View>
                      {item.interviewSchedule &&
                      (interviewDate ||
                        item.interviewSchedule.location ||
                        item.interviewSchedule.meetingLink ||
                        item.interviewSchedule.notes) ? (
                        <View style={styles.interviewCard}>
                          <Text style={styles.interviewTitle}>
                            {t("applicationInterview")}
                          </Text>
                          {interviewDate ? (
                            <Text style={styles.interviewDetail}>
                              {interviewDate}
                            </Text>
                          ) : null}
                          {item.interviewSchedule.durationMinutes ? (
                            <Text style={styles.interviewDetail}>
                              {t("applicationMinutes", {
                                count: item.interviewSchedule.durationMinutes,
                              })}
                            </Text>
                          ) : null}
                          {item.interviewSchedule.location ? (
                            <Text style={styles.interviewDetail}>
                              {item.interviewSchedule.location}
                            </Text>
                          ) : null}
                          {item.interviewSchedule.meetingLink ? (
                            <Text
                              style={styles.interviewDetail}
                              numberOfLines={2}
                            >
                              {item.interviewSchedule.meetingLink}
                            </Text>
                          ) : null}
                          {item.interviewSchedule.notes ? (
                            <Text style={styles.interviewNotes}>
                              {item.interviewSchedule.notes}
                            </Text>
                          ) : null}
                        </View>
                      ) : null}
                    </Pressable>
                    {lockedByJobLifecycle ? (
                      <View style={styles.lifecycleNote}>
                        <Text style={styles.lifecycleNoteText}>
                          {t("applicationClosedHelp")}
                        </Text>
                      </View>
                    ) : canWithdraw ? (
                      <Pressable
                        style={styles.withdraw} accessibilityRole="button"
                        onPress={() =>
                          confirmWithdraw(
                            item.id ?? item._id,
                            job?.title ?? t("applicationThisRole"),
                          )
                        }
                        disabled={withdraw.isPending}
                      >
                        <Text style={styles.withdrawText}>
                          {t("applicationWithdraw")}
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="send-outline" size={38} color={colors.teal} />
                </View>
                <Text style={styles.empty}>{t("applicationEmpty")}</Text>
                <Pressable
                  style={styles.emptyCta}
                  onPress={() => router.push("/(tabs)/jobs")}
                  accessibilityRole="button"
                >
                  <Text style={styles.emptyCtaText}>{t("homeBrowse")}</Text>
                </Pressable>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </GshScreenShell>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  listHeader: stackListLeadStyle,
  listEyebrow: {
    fontSize: 11,
    fontFamily: fontFamily.semiBold,
    color: colors.teal,
    letterSpacing: 0.8,
    textTransform: "lowercase",
    marginBottom: 6,
  },
  listSubLead: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    lineHeight: 20,
  },
  listPad: { paddingHorizontal: 16, paddingBottom: 32, gap: 12 },
  card: { borderRadius: radii.lg, overflow: "hidden" },
  cardBody: { flex: 1 },
  cardMain: { padding: 16 },
  title: {
    fontSize: 17,
    fontFamily: fontFamily.bold,
    color: colors.navy,
    letterSpacing: -0.2,
  },
  company: {
    marginTop: 8,
    fontSize: 15,
    fontFamily: fontFamily.semiBold,
    color: colors.textMarketing,
  },
  meta: {
    marginTop: 4,
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
  },
  badge: {
    alignSelf: "flex-start",
    marginTop: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill,
  },
  badgeText: { fontSize: 12, fontFamily: fontFamily.bold, color: colors.navy },
  badgeGood: { backgroundColor: "#dcfce7" },
  badgeBad: { backgroundColor: "#fee2e2" },
  badgeNeutral: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  interviewCard: {
    marginTop: 12,
    padding: 12,
    gap: 4,
    borderRadius: radii.md,
    backgroundColor: colors.brandSoft,
  },
  interviewTitle: {
    fontSize: 13,
    fontFamily: fontFamily.bold,
    color: colors.brandDeep,
  },
  interviewDetail: {
    fontSize: 12,
    lineHeight: 17,
    fontFamily: fontFamily.medium,
    color: colors.textSecondary,
  },
  interviewNotes: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
  },
  withdraw: {
    minHeight: 48,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  withdrawText: {
    color: colors.error,
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
  },
  lifecycleNote: {
    borderTopWidth: 1,
    borderTopColor: colors.surfaceMuted,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  lifecycleNoteText: {
    color: colors.textMuted,
    fontFamily: fontFamily.medium,
    fontSize: 13,
    textAlign: "center",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 12,
  },
  muted: {
    color: colors.textMuted,
    fontSize: 15,
    fontFamily: fontFamily.medium,
  },
  err: {
    color: colors.error,
    textAlign: "center",
    fontFamily: fontFamily.medium,
  },
  retry: {
    color: colors.brand,
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
    marginTop: 4,
  },
  emptyWrap: {
    alignItems: "center",
    marginTop: 32,
    paddingHorizontal: 24,
    gap: 10,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(66,224,227,0.45)",
  },
  empty: { fontFamily: fontFamily.bold, fontSize: 18, color: colors.navy },
  emptyCta: {
    minHeight: 44,
    justifyContent: "center",
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: radii.pill,
    backgroundColor: colors.brand,
  },
  emptyCtaText: {
    fontSize: 15,
    fontFamily: fontFamily.bold,
    color: colors.white,
  },
});
