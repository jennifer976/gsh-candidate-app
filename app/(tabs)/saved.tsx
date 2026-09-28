import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CompanyLogo } from "@/components/CompanyLogo";
import { GshScreenShell } from "@/components/GshScreenShell";
import { SignInPanel } from "@/components/SignInGate";
import {
  BrandStatePanel,
  DecorRing,
  DepthButton,
  DepthPressable,
  DepthSurface,
  Eyebrow,
  PosterTitle,
  posterParts,
  SegmentTabs,
} from "@/components/gsh-brand";
import { tabBarBottomPadding } from "@/lib/android-insets";
import { fetchApplications, fetchSavedJobs, unsaveJob } from "@/lib/api-client";
import { hapticSuccess } from "@/lib/haptics";
import { useAppCopy } from "@/lib/i18n";
import { applicationStatusLabel } from "@/lib/i18n/catalog";
import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { getJobEmployerLabel, getJobLogoUrl, jobFromSavedRow } from "@/lib/job-display";
import { jobAgeLabel, jobLocationLabel } from "@/lib/job-presentation";
import { useAuthStore } from "@/lib/auth-store";
import { colors, fontFamily } from "@/lib/theme";
import type { Application, SavedJobPopulated } from "@/types/models";

type Segment = "saved" | "applications";

const STAGES = ["pending", "screening", "interview", "offer"] as const;

function stageIndex(status: string): number {
  const s = status.trim().toLowerCase();
  if (s === "offer" || s === "hired") return 3;
  if (s.includes("interview")) return 2;
  if (s === "screening" || s === "shortlisted" || s === "reviewed") return 1;
  return 0;
}

function isStopped(status: string): boolean {
  return ["rejected", "withdrawn"].includes(status.trim().toLowerCase());
}

function StatTile({ value, label }: { value: number | undefined; label: string }) {
  return (
    <DepthSurface
      depth={4}
      radius={18}
      borderWidth={2}
      borderColor={colors.navy}
      style={styles.statWrap}
      innerStyle={styles.stat}
    >
      <Text style={styles.statValue}>{value ?? "–"}</Text>
      <Text style={styles.statLabel} numberOfLines={1}>
        {label}
      </Text>
    </DepthSurface>
  );
}

function PipelineStepper({ status }: { status: string }) {
  const { t, locale } = useAppCopy();
  const ac = useAccountCopy();
  const current = stageIndex(status);
  const stopped = isStopped(status);
  const labels = [ac("Applied"), t("statusScreening"), t("statusInterview"), t("statusOffer")];
  if (stopped) {
    return (
      <View style={styles.stoppedPill}>
        <Ionicons name="close-circle" size={15} color={colors.textSecondary} />
        <Text style={styles.stoppedText}>{applicationStatusLabel(status, locale)}</Text>
      </View>
    );
  }
  return (
    <View style={styles.stepper} accessible accessibilityLabel={applicationStatusLabel(status, locale)}>
      {STAGES.map((stage, index) => {
        const done = index <= current;
        return (
          <View key={stage} style={styles.step}>
            <View style={styles.stepTrackRow}>
              <View style={[styles.stepLine, index === 0 && styles.hidden, index <= current && styles.stepLineOn]} />
              <View style={[styles.stepDot, done && styles.stepDotOn, index === current && styles.stepDotCurrent]}>
                {done ? <Ionicons name="checkmark" size={11} color={colors.navy} /> : null}
              </View>
              <View
                style={[
                  styles.stepLine,
                  index === STAGES.length - 1 && styles.hidden,
                  index < current && styles.stepLineOn,
                ]}
              />
            </View>
            <Text style={[styles.stepLabel, index === current && styles.stepLabelOn]} numberOfLines={1}>
              {labels[index]}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export default function SavedTabScreen() {
  const { t, locale, intlLocale } = useAppCopy();
  const ac = useAccountCopy();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const signedIn = Boolean(useAuthStore((s) => s.token));
  const params = useLocalSearchParams<{ segment?: string }>();
  const [segment, setSegment] = useState<Segment>(
    params.segment === "applications" ? "applications" : "saved",
  );

  useEffect(() => {
    if (params.segment === "applications" || params.segment === "saved") setSegment(params.segment);
  }, [params.segment]);

  const savedQuery = useQuery({
    queryKey: ["saved-jobs"],
    queryFn: fetchSavedJobs,
    enabled: signedIn,
  });
  const applicationsQuery = useQuery({
    queryKey: ["applications"],
    queryFn: fetchApplications,
    enabled: signedIn,
  });

  const unsave = useMutation({
    mutationFn: (row: SavedJobPopulated) => unsaveJob(row.id ?? row._id),
    onSuccess: () => {
      void hapticSuccess();
      void qc.invalidateQueries({ queryKey: ["saved-jobs"] });
      void qc.invalidateQueries({ queryKey: ["analytics", "candidate-dashboard"] });
    },
    onError: () => Alert.alert(ac("Could not remove"), ac("Please try again.")),
  });

  const savedRows = savedQuery.data ?? [];
  const applications = applicationsQuery.data ?? [];
  const interviews = applications.filter((row) => String(row.status).toLowerCase().includes("interview")).length;
  const active = segment === "saved" ? savedQuery : applicationsQuery;

  const header = (
    <View style={[styles.hero, { paddingTop: Math.max(insets.top, 12) + 14 }]}>
      <DecorRing size={260} thickness={36} color="rgba(255,255,255,0.3)" style={{ top: -110, right: -100 }} />
      <Eyebrow color={colors.navy}>{ac("Your shortlist")}</Eyebrow>
      <PosterTitle {...posterParts(ac("Your|pipeline."))} size={38} style={styles.heroTitle} />
      {signedIn ? (
        <>
          <View style={styles.stats}>
            <StatTile value={savedQuery.data ? savedRows.length : undefined} label={t("saved")} />
            <StatTile value={applicationsQuery.data ? applications.length : undefined} label={ac("Applied")} />
            <StatTile value={applicationsQuery.data ? interviews : undefined} label={ac("Interviews")} />
          </View>
          <SegmentTabs
            onCyan
            value={segment}
            onChange={setSegment}
            options={[
              { id: "saved", label: ac("Saved jobs") },
              { id: "applications", label: t("applications") },
            ]}
            style={styles.segment}
          />
        </>
      ) : (
        <Text style={styles.heroBody}>
          {ac("Keep the jobs you like in one place and follow every application.")}
        </Text>
      )}
    </View>
  );

  if (!signedIn) {
    return (
      <GshScreenShell constrainTabletWidth>
        <FlatList
          data={[]}
          renderItem={null}
          ListHeaderComponent={header}
          ListFooterComponent={
            <SignInPanel
              returnTo="/(tabs)/saved"
              icon="bookmark-outline"
              title="Save jobs for later"
              body="Sign in to keep a list of the jobs you like and come back to them."
            />
          }
          contentContainerStyle={{ paddingBottom: tabBarBottomPadding(insets.bottom) + 16 }}
        />
      </GshScreenShell>
    );
  }

  const listEmpty = active.isLoading ? (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={colors.navy} />
    </View>
  ) : active.isError ? (
    <BrandStatePanel
      icon="cloud-offline-outline"
      title={ac("Could not load")}
      body={ac("Check your connection and try again.")}
      primary={{ label: ac("Try again"), onPress: () => void active.refetch(), icon: "refresh" }}
    />
  ) : segment === "saved" ? (
    <BrandStatePanel
      icon="bookmark-outline"
      title={ac("Nothing saved yet")}
      body={ac("Tap the bookmark on any job to keep it here.")}
      primary={{ label: ac("Browse jobs"), onPress: () => router.push("/(tabs)/jobs") }}
    />
  ) : (
    <BrandStatePanel
      icon="paper-plane-outline"
      title={ac("No applications yet")}
      body={ac("When you apply for a job, you can follow its progress here.")}
      primary={{ label: ac("Browse jobs"), onPress: () => router.push("/(tabs)/jobs") }}
    />
  );

  const renderSaved = ({ item }: { item: SavedJobPopulated }) => {
    const job = jobFromSavedRow(item);
    if (!job) return null;
    const employer = getJobEmployerLabel(job, locale);
    const location = jobLocationLabel(job, locale);
    const age = jobAgeLabel(item.createdAt, locale);
    return (
      <DepthPressable
        onPress={() => router.push(`/job/${encodeURIComponent(job._id)}`)}
        depth={5}
        radius={20}
        borderWidth={2}
        borderColor={colors.navy}
        accessibilityLabel={`${job.title}, ${employer}`}
        style={styles.cardGap}
        innerStyle={styles.card}
      >
        <CompanyLogo logoUrl={getJobLogoUrl(job)} companyName={employer} size={48} radius={12} />
        <View style={styles.cardText}>
          <Text style={styles.cardCompany} numberOfLines={1}>
            {employer}
          </Text>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {job.title}
          </Text>
          <Text style={styles.cardMeta} numberOfLines={1}>
            {[location, age].filter(Boolean).join(" · ")}
          </Text>
          {item.listingActive === false ? (
            <View style={styles.closedPill}>
              <Text style={styles.closedText}>{ac("No longer open")}</Text>
            </View>
          ) : null}
        </View>
        <Pressable
          onPress={() => unsave.mutate(item)}
          disabled={unsave.isPending}
          style={styles.unsave}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel={ac("Remove from saved")}
        >
          <Ionicons name="bookmark" size={18} color={colors.navy} />
        </Pressable>
      </DepthPressable>
    );
  };

  const renderApplication = ({ item }: { item: Application }) => {
    const job = item.jobId;
    const jobId = job?._id ?? job?.id;
    const age = jobAgeLabel(item.createdAt, locale);
    const interviewAt = item.interviewSchedule?.scheduledAt;
    let interviewLabel = "";
    if (interviewAt) {
      const date = new Date(interviewAt);
      if (Number.isFinite(date.getTime())) {
        interviewLabel = date.toLocaleString(intlLocale, {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    }
    return (
      <DepthPressable
        onPress={() => (jobId ? router.push(`/job/${encodeURIComponent(jobId)}`) : undefined)}
        depth={5}
        radius={20}
        borderWidth={2}
        borderColor={colors.navy}
        accessibilityLabel={job?.title ?? t("applications")}
        style={styles.cardGap}
        innerStyle={styles.appCard}
      >
        <View style={styles.appHead}>
          <CompanyLogo companyName={job?.companyName ?? ""} logoUrl="" size={44} radius={12} />
          <View style={styles.cardText}>
            <Text style={styles.cardCompany} numberOfLines={1}>
              {job?.companyName ?? ""}
            </Text>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {job?.title ?? ""}
            </Text>
            {age ? (
              <Text style={styles.cardMeta} numberOfLines={1}>
                {`${ac("Applied")} · ${age}`}
              </Text>
            ) : null}
          </View>
        </View>
        <PipelineStepper status={String(item.status || "pending")} />
        {interviewLabel ? (
          <View style={styles.interviewRow}>
            <Ionicons name="calendar" size={15} color={colors.navy} />
            <Text style={styles.interviewText}>{ac("Interview: {date}", { date: interviewLabel })}</Text>
          </View>
        ) : null}
      </DepthPressable>
    );
  };

  return (
    <GshScreenShell constrainTabletWidth>
      {segment === "saved" ? (
        <FlatList
          data={savedQuery.isError ? [] : savedRows}
          keyExtractor={(item) => item._id}
          renderItem={renderSaved}
          ListHeaderComponent={header}
          ListEmptyComponent={listEmpty}
          contentContainerStyle={{ paddingBottom: tabBarBottomPadding(insets.bottom) + 16 }}
          refreshControl={
            <RefreshControl
              refreshing={savedQuery.isRefetching}
              onRefresh={() => void savedQuery.refetch()}
              tintColor={colors.navy}
            />
          }
        />
      ) : (
        <FlatList
          data={applicationsQuery.isError ? [] : applications}
          keyExtractor={(item) => item._id}
          renderItem={renderApplication}
          ListHeaderComponent={header}
          ListEmptyComponent={listEmpty}
          ListFooterComponent={
            applications.length > 0 ? (
              <View style={styles.footer}>
                <DepthButton
                  title={ac("Manage applications")}
                  onPress={() => router.push("/(tabs)/applications")}
                  variant="navyOnLight"
                  size="md"
                />
              </View>
            ) : null
          }
          contentContainerStyle={{ paddingBottom: tabBarBottomPadding(insets.bottom) + 16 }}
          refreshControl={
            <RefreshControl
              refreshing={applicationsQuery.isRefetching}
              onRefresh={() => void applicationsQuery.refetch()}
              tintColor={colors.navy}
            />
          }
        />
      )}
    </GshScreenShell>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.cyan,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: "hidden",
    marginBottom: 20,
  },
  heroTitle: { marginTop: 8 },
  heroBody: {
    marginTop: 14,
    fontFamily: fontFamily.medium,
    fontSize: 15,
    lineHeight: 22,
    color: "rgba(13,25,78,0.8)",
  },
  stats: { flexDirection: "row", gap: 10, marginTop: 20 },
  statWrap: { flex: 1 },
  stat: { paddingVertical: 12, paddingHorizontal: 10, alignItems: "center" },
  statValue: { fontFamily: fontFamily.headingStrong, fontSize: 26, color: colors.navy, letterSpacing: -0.6 },
  statLabel: { marginTop: 2, fontFamily: fontFamily.bold, fontSize: 11, color: colors.textSecondary },
  segment: { marginTop: 18 },
  loading: { paddingVertical: 48, alignItems: "center" },
  cardGap: { marginHorizontal: 20, marginBottom: 14 },
  card: { padding: 14, flexDirection: "row", alignItems: "flex-start", gap: 12 },
  cardText: { flex: 1, minWidth: 0 },
  cardCompany: { fontFamily: fontFamily.semiBold, fontSize: 13, color: colors.textSecondary },
  cardTitle: {
    marginTop: 2,
    fontFamily: fontFamily.heading,
    fontSize: 16,
    lineHeight: 21,
    letterSpacing: -0.2,
    color: colors.navy,
  },
  cardMeta: { marginTop: 6, fontFamily: fontFamily.medium, fontSize: 12, color: colors.textMuted },
  closedPill: {
    alignSelf: "flex-start",
    marginTop: 8,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: colors.surfaceMuted,
  },
  closedText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.textSecondary },
  unsave: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cyan,
    borderWidth: 2,
    borderColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  appCard: { padding: 14, gap: 14 },
  appHead: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  stepper: { flexDirection: "row" },
  step: { flex: 1, alignItems: "center", gap: 6 },
  stepTrackRow: { flexDirection: "row", alignItems: "center", alignSelf: "stretch" },
  stepLine: { flex: 1, height: 3, backgroundColor: colors.border },
  stepLineOn: { backgroundColor: colors.navy },
  hidden: { opacity: 0 },
  stepDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotOn: { backgroundColor: colors.cyan, borderColor: colors.navy },
  stepDotCurrent: { transform: [{ scale: 1.15 }] },
  stepLabel: { fontFamily: fontFamily.semiBold, fontSize: 11, color: colors.textMuted },
  stepLabelOn: { fontFamily: fontFamily.extraBold, color: colors.navy },
  stoppedPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.surfaceMuted,
  },
  stoppedText: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.textSecondary },
  interviewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "rgba(66,224,227,0.18)",
  },
  interviewText: { flex: 1, fontFamily: fontFamily.bold, fontSize: 13, color: colors.navy },
  footer: { paddingHorizontal: 20, paddingTop: 4 },
});
