import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CountryFlag } from "@/components/CountryFlag";
import { Icon } from "@/components/Icon";
import { ProfileNudge } from "@/components/ProfileNudge";
import { GshScreenShell } from "@/components/GshScreenShell";
import {
  BreakoutPhoto,
  Card,
  CountryRail,
  JobCard,
  NavyBand,
  SectionHeader,
  StatChip,
} from "@/components/v3";
import {
  DepthButton,
  Eyebrow,
  GshMark,
} from "@/components/gsh-brand";
import {
  fetchOwnProfile,
  fetchPublicExternalJobListings,
  fetchPublicJobs,
  fetchSavedJobs,
  fetchUnreadNotificationCount,
  saveJob,
  unsaveJob,
} from "@/lib/api-client";
import { tabBarBottomPadding } from "@/lib/android-insets";
import { useAuthStore } from "@/lib/auth-store";
import { brandLockupNavy } from "@/lib/brand-assets";
import { canonicalCountryCode, countryDisplayName } from "@/lib/countries";
import {
  GUIDE_COUNTRY_CODES,
  GUIDE_JOBS_LOCATION_BY_CODE,
} from "@/lib/guideCountryCodes";
import { hapticConfirm } from "@/lib/haptics";
import { useAppCopy } from "@/lib/i18n";
import {
  jobCardFieldsFromExternal,
  jobCardFieldsFromJob,
  type JobCardFields,
} from "@/lib/jobCardFields";
import { jobFromSavedRow } from "@/lib/job-display";
import { FloatIn, RiseIn, useCountUp } from "@/lib/motion";
import { firstMissingStep } from "@/lib/onboardingFlow";
import { openProfileStep } from "@/lib/openProfileStep";
import { getCandidateCompletionBreakdown } from "@/lib/profile-completion";
import { shouldShowNudge } from "@/lib/profileNudge";
import {
  getNudgeShownThisSession,
  markNudgeShownThisSession,
  readNotNowAt,
  writeNotNowAt,
} from "@/lib/profileNudgeSession";
import { useSignInPrompt } from "@/lib/useSignInPrompt";
import { colors, fontFamily, shadows } from "@/lib/theme";
import { authUserId } from "@/types/models";

function ukGreeting(): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    hour: "numeric",
    hour12: false,
  }).formatToParts(new Date());
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 12);
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function ProgressBar({ percent }: { percent: number }) {
  const fill = useCountUp(Math.max(0, Math.min(100, percent)), {
    duration: 1000,
    delay: 80,
  });
  const width = Number(String(fill).replace(/,/g, "")) || 0;
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${Math.max(4, width)}%` }]} />
    </View>
  );
}

const GUIDE_PICKER = [...GUIDE_COUNTRY_CODES]
  .map((code) => ({
    code,
    label: GUIDE_JOBS_LOCATION_BY_CODE[code] || countryDisplayName(code, "en"),
  }))
  .sort((a, b) => a.label.localeCompare(b.label, "en"));

export default function CandidateHomeScreen() {
  const { locale } = useAppCopy();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const qc = useQueryClient();
  const { signedIn, openSignIn, openRegister } = useSignInPrompt();
  const user = useAuthStore((s) => s.user);
  const userId = authUserId(user);
  const [search, setSearch] = useState("");
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [countryOpen, setCountryOpen] = useState(false);
  const [notNowAt, setNotNowAt] = useState<number | null>(null);
  const [nudgeReady, setNudgeReady] = useState(false);
  const [nudgeHidden, setNudgeHidden] = useState(false);
  const [nudgeActive, setNudgeActive] = useState(false);

  const jobsQuery = useQuery({
    queryKey: ["jobs", "public", "home"],
    queryFn: () => fetchPublicJobs({ page: 1, perPage: 8 }),
    staleTime: 60_000,
  });
  const noDirectJobs = jobsQuery.isSuccess && (jobsQuery.data?.data ?? []).length === 0;
  const externalJobsQuery = useQuery({
    queryKey: ["external-jobs", "public", "home"],
    queryFn: () =>
      fetchPublicExternalJobListings({
        sourceRelationship: "curated_external",
        page: 1,
        perPage: 8,
      }),
    staleTime: 60_000,
    enabled: noDirectJobs,
  });
  const profileQuery = useQuery({
    queryKey: ["profile", "me"],
    queryFn: fetchOwnProfile,
    staleTime: 45_000,
    enabled: signedIn,
  });
  const notificationsQuery = useQuery({
    queryKey: ["notifications-unread"],
    queryFn: fetchUnreadNotificationCount,
    staleTime: 30_000,
    enabled: signedIn,
  });
  const savedQuery = useQuery({
    queryKey: ["saved-jobs"],
    queryFn: fetchSavedJobs,
    staleTime: 30_000,
    enabled: signedIn,
  });

  const onRefresh = useCallback(() => {
    void jobsQuery.refetch();
    if (noDirectJobs) void externalJobsQuery.refetch();
    if (!signedIn) return;
    void profileQuery.refetch();
    void notificationsQuery.refetch();
    void savedQuery.refetch();
  }, [
    externalJobsQuery,
    jobsQuery,
    noDirectJobs,
    notificationsQuery,
    profileQuery,
    savedQuery,
    signedIn,
  ]);

  const profile = signedIn
    ? (profileQuery.data as Record<string, unknown> | undefined)
    : undefined;
  const firstName =
    typeof profile?.firstName === "string" ? profile.firstName.trim() : "";
  const initials = firstName.charAt(0).toUpperCase() || "Y";
  const completion = useMemo(
    () => getCandidateCompletionBreakdown(profile, locale),
    [profile, locale],
  );
  const missing = completion.missing.filter((item) => !item.filled);
  const filledCount = completion.filledCount;
  const fieldsCountUp = useCountUp(filledCount, { duration: 1000, delay: 200 });
  const guidesCountUp = useCountUp(19, { duration: 1100, delay: 300 });

  const targetCodes = useMemo(() => {
    const raw = profile?.targetCountries;
    const list = Array.isArray(raw)
      ? raw
      : typeof raw === "string"
        ? raw.split(",")
        : [];
    return new Set(
      list
        .map((c) => canonicalCountryCode(String(c)))
        .filter((c): c is string => Boolean(c)),
    );
  }, [profile]);

  useEffect(() => {
    let alive = true;
    if (!signedIn || !userId) {
      setNotNowAt(null);
      setNudgeReady(true);
      return;
    }
    setNudgeReady(false);
    void readNotNowAt(userId).then((value) => {
      if (!alive) return;
      setNotNowAt(value);
      setNudgeReady(true);
    });
    return () => {
      alive = false;
    };
  }, [signedIn, userId]);

  const nudgeEligible =
    nudgeReady &&
    !nudgeHidden &&
    !profileQuery.isLoading &&
    Boolean(profileQuery.data) &&
    shouldShowNudge({
      signedIn,
      percent: completion.percent,
      shownThisSession: getNudgeShownThisSession(),
      notNowAt,
      now: Date.now(),
    });

  useEffect(() => {
    if (!nudgeEligible || nudgeActive || nudgeHidden) return;
    setNudgeActive(true);
    markNudgeShownThisSession();
  }, [nudgeEligible, nudgeActive, nudgeHidden]);

  const showNudge =
    (nudgeActive || nudgeEligible) && !nudgeHidden && completion.percent < 100;

  const openMissingStep = useCallback((step: number | null | undefined) => {
    openProfileStep(step, "home");
  }, []);

  const openFirstMissing = useCallback(() => {
    openMissingStep(firstMissingStep(completion.missing));
  }, [completion.missing, openMissingStep]);

  const onNudgeFinishNow = useCallback(() => {
    setNudgeHidden(true);
    setNudgeActive(false);
    markNudgeShownThisSession();
    openFirstMissing();
  }, [openFirstMissing]);

  const onNudgeNotNow = useCallback(() => {
    const now = Date.now();
    setNudgeHidden(true);
    setNudgeActive(false);
    setNotNowAt(now);
    markNudgeShownThisSession();
    if (userId) void writeNotNowAt(userId, now);
  }, [userId]);

  const railJobs: JobCardFields[] = useMemo(() => {
    if (noDirectJobs) {
      return (externalJobsQuery.data?.data ?? [])
        .slice(0, 6)
        .map((job) => jobCardFieldsFromExternal(job, locale));
    }
    const jobs = (jobsQuery.data?.data ?? []).slice(0, 8);
    const mapped = jobs.map((job) => jobCardFieldsFromJob(job, locale));
    if (!signedIn || targetCodes.size === 0) return mapped.slice(0, 6);
    const preferred: JobCardFields[] = [];
    const rest: JobCardFields[] = [];
    for (const item of mapped) {
      const code = item.countryIso2?.toUpperCase();
      if (code && targetCodes.has(code)) preferred.push(item);
      else rest.push(item);
    }
    return [...preferred, ...rest].slice(0, 6);
  }, [
    externalJobsQuery.data,
    jobsQuery.data,
    locale,
    noDirectJobs,
    signedIn,
    targetCodes,
  ]);

  const rolesLoading =
    jobsQuery.isLoading || (noDirectJobs && externalJobsQuery.isLoading);
  const showJobsRail = rolesLoading || railJobs.length > 0;

  const savedRows = savedQuery.data ?? [];
  const savedJobIdByListingId = useMemo(() => {
    const m = new Map<string, string>();
    for (const row of savedRows) {
      const job = jobFromSavedRow(row) ?? (typeof row.job === "object" ? row.job : null);
      const jid = job?._id;
      if (jid) m.set(jid, row.id ?? row._id);
    }
    return m;
  }, [savedRows]);

  const savedRailFields = useMemo(() => {
    return savedRows
      .map((row) => {
        const job = jobFromSavedRow(row);
        return job ? jobCardFieldsFromJob(job, locale) : null;
      })
      .filter((x): x is JobCardFields => Boolean(x))
      .slice(0, 8);
  }, [locale, savedRows]);

  const saveMut = useMutation({
    mutationFn: (jobId: string) => saveJob(jobId),
    onSuccess: () => {
      void hapticConfirm();
      void qc.invalidateQueries({ queryKey: ["saved-jobs"] });
    },
  });
  const unsaveMut = useMutation({
    mutationFn: (savedRowId: string) => unsaveJob(savedRowId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["saved-jobs"] });
    },
  });

  const toggleSave = (listingId: string) => {
    if (!signedIn) {
      openSignIn("/(tabs)/home", { kind: "save_job", targetId: listingId });
      return;
    }
    const sid = savedJobIdByListingId.get(listingId);
    if (sid) unsaveMut.mutate(sid);
    else saveMut.mutate(listingId);
  };

  const submitSearch = () => {
    const params: Record<string, string> = {};
    if (search.trim()) params.q = search.trim();
    if (countryCode) {
      params.location =
        GUIDE_JOBS_LOCATION_BY_CODE[countryCode] ||
        countryDisplayName(countryCode, "en");
    }
    router.push({ pathname: "/(tabs)/jobs", params });
  };

  const countryLabel = countryCode
    ? GUIDE_JOBS_LOCATION_BY_CODE[countryCode] ||
      countryDisplayName(countryCode, "en")
    : "Anywhere";

  const stillCopy = (() => {
    if (missing.length === 0) return null;
    const firstTwo = missing
      .slice(0, 2)
      .map((m) => m.label.toLowerCase());
    const more = missing.length - 2;
    if (more > 0) {
      return `Still to add: ${firstTwo.join(", ")} and ${more} more.`;
    }
    return `Still to add: ${firstTwo.join(", ")}.`;
  })();

  const unread = (notificationsQuery.data?.unreadCount ?? 0) > 0;
  const refreshing =
    jobsQuery.isRefetching || (signedIn && profileQuery.isRefetching);

  const shortcut = (
    icon: "heart" | "briefcase-business" | "bell-ring" | "file-text",
    label: string,
    onPress: () => void,
  ) => (
    <Pressable
      key={label}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles.shortcut}
    >
      <View style={styles.shortcutTile}>
        <Icon name={icon} size={24} color={colors.navy} strokeWidth={1.8} />
      </View>
      <Text style={styles.shortcutLabel}>{label}</Text>
    </Pressable>
  );

  return (
    <GshScreenShell constrainTabletWidth style={{ backgroundColor: colors.panel }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: insets.top + 26,
          paddingBottom: tabBarBottomPadding(insets.bottom),
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#0d194e"]}
            progressBackgroundColor="#ffffff"
            tintColor="#0d194e"
          />
        }
      >
        <RiseIn>
          <View style={styles.topRow}>
            {signedIn ? (
              <Pressable
                onPress={() => router.push("/(tabs)/profile")}
                accessibilityRole="button"
                accessibilityLabel="Your profile"
                style={styles.profileHit}
              >
                <View style={styles.avatarOuter}>
                  <View style={styles.avatarInner}>
                    <Text style={styles.avatarText}>{initials}</Text>
                  </View>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.greetLine}>{ukGreeting()}</Text>
                  <Text style={styles.hiLine} numberOfLines={1}>
                    {firstName ? `Hi ${firstName}` : "Hi there"}
                  </Text>
                </View>
              </Pressable>
            ) : (
              <Image
                source={brandLockupNavy}
                style={styles.logo}
                resizeMode="contain"
                accessibilityLabel="Global Sponsor Hub"
              />
            )}
            {signedIn ? (
              <Pressable
                onPress={() => router.push("/alerts")}
                style={styles.bellHit}
                accessibilityRole="button"
                accessibilityLabel="Job alerts"
              >
                <Icon name="bell" size={22} color={colors.navy} strokeWidth={1.9} />
                {unread ? <View style={styles.unreadDot} /> : null}
              </Pressable>
            ) : (
              <Pressable
                onPress={() => openSignIn("/(tabs)/home")}
                style={styles.signInGhost}
                accessibilityRole="button"
                accessibilityLabel="Sign in"
              >
                <Text style={styles.signInGhostText}>Sign in</Text>
              </Pressable>
            )}
          </View>
        </RiseIn>

        <RiseIn delay={60}>
          <View style={styles.searchCard}>
            <GshMark
              size={250}
              color={colors.mark}
              style={styles.searchMark}
            />
            <Eyebrow>International jobs</Eyebrow>
            <Text style={styles.searchTitle}>
              Where would you{" "}
              <Text style={{ color: colors.tone }}>like to work?</Text>
            </Text>
            <Text style={styles.searchBody}>
              Roles with visa sponsorship, relocation support or global remote
              work.
            </Text>
            <View style={styles.searchField}>
              <Icon name="search" size={20} color={colors.text2} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                onSubmitEditing={submitSearch}
                placeholder="Job title or skill"
                placeholderTextColor={colors.muted}
                returnKeyType="search"
                style={styles.searchInput}
                accessibilityLabel="Job title or skill"
              />
              <Pressable
                onPress={submitSearch}
                style={styles.searchGo}
                accessibilityRole="button"
                accessibilityLabel="Search"
              >
                <Icon
                  name="arrow-up-right"
                  size={20}
                  color={colors.cyan}
                  strokeWidth={2.2}
                />
              </Pressable>
            </View>
            <Pressable
              onPress={() => setCountryOpen(true)}
              style={styles.countryPick}
              accessibilityRole="button"
              accessibilityLabel={`Country, ${countryLabel}`}
            >
              <CountryFlag
                iso2={countryCode ? countryCode.toLowerCase() : null}
                size="sm"
              />
              <Text style={styles.countryPickText}>{countryLabel}</Text>
              <Icon name="chevron-down" size={18} color={colors.navy} />
            </Pressable>
          </View>
        </RiseIn>

        <RiseIn delay={100}>
          <View style={styles.shortcuts}>
            {shortcut("heart", "Saved", () => router.push("/(tabs)/saved"))}
            {shortcut("briefcase-business", "Applications", () =>
              signedIn
                ? router.push("/(tabs)/applications")
                : openSignIn("/(tabs)/applications"),
            )}
            {shortcut("bell-ring", "Alerts", () =>
              signedIn ? router.push("/alerts") : openSignIn("/alerts"),
            )}
            {shortcut("file-text", "CV", () =>
              signedIn
                ? openProfileStep(11, "home")
                : openSignIn("/(tabs)/profile"),
            )}
          </View>
        </RiseIn>

        <RiseIn delay={140}>
          <View style={{ marginTop: 40 }}>
            {signedIn ? (
              <>
                {showNudge ? (
                  <ProfileNudge
                    percent={completion.percent}
                    onFinishNow={onNudgeFinishNow}
                    onNotNow={onNudgeNotNow}
                  />
                ) : null}
                {profileQuery.isLoading ? (
                  <View style={[styles.navyCard, styles.navyLoading]}>
                    <ActivityIndicator color={colors.cyan} />
                  </View>
                ) : profileQuery.data ? (
                  <View style={styles.navyCard}>
                    <GshMark
                      size={260}
                      color="rgba(255,255,255,0.05)"
                      style={styles.navyMark}
                    />
                    <BreakoutPhoto
                      photo="arrival"
                      rotate={3}
                      style={styles.breakout}
                    />
                    <FloatIn delay={250} style={styles.statChipPos}>
                      <StatChip
                        value={`${fieldsCountUp} of 19`}
                        label="profile fields"
                      />
                    </FloatIn>
                    <Eyebrow onDark>Your profile</Eyebrow>
                    <Text style={styles.navyTitle}>
                      Your profile is {completion.percent}% done
                    </Text>
                    <View style={{ marginTop: 46 }}>
                      <ProgressBar percent={completion.percent} />
                    </View>
                    <View style={styles.navyFooter}>
                      <Text style={styles.navyStill}>
                        {stillCopy ??
                          "Everything employers look for is on your profile."}
                      </Text>
                      <Pressable
                        onPress={() =>
                          missing.length > 0
                            ? openFirstMissing()
                            : router.push("/(tabs)/profile")
                        }
                        style={styles.finishHit}
                        accessibilityRole="button"
                        accessibilityLabel={
                          missing.length > 0 ? "Finish" : "View"
                        }
                      >
                        <Text style={styles.finishText}>
                          {missing.length > 0 ? "Finish" : "View"}
                        </Text>
                        <Icon
                          name="chevron-right"
                          size={18}
                          color={colors.cyan}
                        />
                      </Pressable>
                    </View>
                  </View>
                ) : null}
              </>
            ) : (
              <View style={[styles.navyCard, { overflow: "visible", paddingTop: 28 }]}>
                <GshMark
                  size={260}
                  color="rgba(255,255,255,0.05)"
                  style={styles.navyMark}
                />
                <BreakoutPhoto
                  photo="plan-perks"
                  rotate={3}
                  style={styles.breakout}
                />
                <Eyebrow onDark>Free for candidates</Eyebrow>
                <Text style={[styles.navyTitle, { maxWidth: 170 }]}>
                  Create your free account
                </Text>
                <View style={{ marginTop: 16, gap: 8 }}>
                  {[
                    "Save jobs and come back to them",
                    "Track every application",
                    "Hear from employers in the app",
                  ].map((line) => (
                    <View key={line} style={styles.checkRow}>
                      <Icon name="circle-check" size={18} color={colors.cyan} />
                      <Text style={styles.checkText}>{line}</Text>
                    </View>
                  ))}
                </View>
                <DepthButton
                  title="Create a free account"
                  onPress={() => openRegister()}
                  variant="cyanOnNavy"
                  size="md"
                  style={{ marginTop: 18 }}
                />
                <Pressable
                  onPress={() => openSignIn("/(tabs)/home")}
                  style={styles.alreadyHit}
                  accessibilityRole="button"
                >
                  <Text style={styles.alreadyText}>
                    I already have an account
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        </RiseIn>

        {showJobsRail ? (
          <RiseIn delay={180}>
            <View style={{ marginTop: 30 }}>
              <SectionHeader
                eyebrow={signedIn ? "Picked for you" : "International jobs"}
                title={signedIn ? "Jobs for you" : "Latest roles"}
                onSeeAll={() => router.push("/(tabs)/jobs")}
              />
              {rolesLoading ? (
                <ActivityIndicator
                  color={colors.navy}
                  style={{ marginTop: 20 }}
                />
              ) : railJobs.length > 0 ? (
                <ScrollView
                  horizontal
                  nestedScrollEnabled
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.rail}
                  decelerationRate="fast"
                  snapToInterval={272 + 12}
                >
                  {railJobs.map((job, index) => {
                    const listingId = job.href.includes("/job/")
                      ? decodeURIComponent(job.href.split("/job/")[1] || "")
                      : "";
                    const saved = listingId
                      ? savedJobIdByListingId.has(listingId)
                      : false;
                    return (
                      <JobCard
                        key={job.href}
                        variant="rail"
                        index={index}
                        title={job.title}
                        company={job.company}
                        logoUrl={job.logoUrl}
                        countryIso2={job.countryIso2}
                        countryLabel={job.countryLabel}
                        remote={job.remote}
                        salaryLabel={job.salaryLabel}
                        visaSponsorship={job.visaSponsorship}
                        relocationSupport={job.relocationSupport}
                        remoteTag={job.remoteTag}
                        jobType={job.jobType}
                        postedLabel={job.postedLabel}
                        saved={saved}
                        onPress={() => router.push(job.href as never)}
                        onToggleSave={
                          listingId
                            ? () => toggleSave(listingId)
                            : undefined
                        }
                      />
                    );
                  })}
                </ScrollView>
              ) : null}
            </View>
          </RiseIn>
        ) : null}

        <RiseIn delay={220} style={{ marginHorizontal: -16, width: windowWidth, alignSelf: "flex-start" }}>
          <NavyBand style={{ marginTop: 22, width: windowWidth }}>
            <Eyebrow onDark>Global Sponsor Hub</Eyebrow>
            <Text
              style={styles.bandBig}
              accessibilityLabel="Over 3,000 candidates and growing daily"
            >
              over 3,000
            </Text>
            <Text style={styles.bandSub}>candidates and growing daily</Text>
            <View style={styles.bandGrid}>
              <View style={styles.bandCell}>
                <Text
                  style={styles.bandStat}
                  accessibilityLabel="19 destination guides"
                >
                  {guidesCountUp}
                </Text>
                <Text style={styles.bandStatLabel}>destination guides</Text>
              </View>
              <View style={[styles.bandCell, styles.bandCellRight]}>
                <Text
                  style={styles.bandStat}
                  accessibilityLabel="Free for candidates, always"
                >
                  Free
                </Text>
                <Text style={styles.bandStatLabel}>for candidates, always</Text>
              </View>
            </View>
          </NavyBand>
        </RiseIn>

        <RiseIn delay={260}>
          <View style={{ marginTop: 28 }}>
              <SectionHeader
                eyebrow="Destinations"
                title="Choose where"
                tonePart="to work"
                onSeeAll={() => router.push("/countries")}
              />
            <View style={{ marginHorizontal: -16 }}>
              <CountryRail />
            </View>
          </View>
        </RiseIn>

        {signedIn ? (
          <RiseIn delay={300}>
            <View style={{ marginTop: 22 }}>
              <SectionHeader
                eyebrow="For later"
                title="Saved"
                onSeeAll={() => router.push("/(tabs)/saved")}
              />
              {savedRailFields.length > 0 ? (
                <ScrollView
                  horizontal
                  nestedScrollEnabled
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.rail}
                  decelerationRate="fast"
                >
                  {savedRailFields.map((job, index) => {
                    const listingId = decodeURIComponent(
                      job.href.split("/job/")[1] || "",
                    );
                    return (
                      <JobCard
                        key={job.href}
                        variant="rail"
                        index={index}
                        title={job.title}
                        company={job.company}
                        logoUrl={job.logoUrl}
                        countryIso2={job.countryIso2}
                        countryLabel={job.countryLabel}
                        remote={job.remote}
                        salaryLabel={job.salaryLabel}
                        visaSponsorship={job.visaSponsorship}
                        relocationSupport={job.relocationSupport}
                        remoteTag={job.remoteTag}
                        jobType={job.jobType}
                        postedLabel={job.postedLabel}
                        saved
                        onPress={() => router.push(job.href as never)}
                        onToggleSave={() => toggleSave(listingId)}
                      />
                    );
                  })}
                </ScrollView>
              ) : (
                <Card padding={0} style={{ marginTop: 16, paddingVertical: 18, paddingHorizontal: 20 }}>
                  <Text style={styles.savedEmpty}>
                    Tap the heart on any role to keep it here.
                  </Text>
                </Card>
              )}
            </View>
          </RiseIn>
        ) : null}

        {!signedIn ? (
          <RiseIn delay={320}>
            <View style={styles.closing}>
              <GshMark
                size={240}
                color="#eef0f5"
                style={styles.closingMark}
              />
              <Eyebrow>Join today</Eyebrow>
              <Text style={styles.closingTitle}>
                Free for candidates
                <Text style={{ color: colors.cyan }}>.</Text>
              </Text>
              <Text style={[styles.closingTitle, { color: colors.tone }]}>
                Always.
              </Text>
            </View>
          </RiseIn>
        ) : null}
      </ScrollView>

      <Modal
        visible={countryOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setCountryOpen(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setCountryOpen(false)}
        >
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Country</Text>
            <ScrollView style={{ maxHeight: 420 }}>
              <Pressable
                onPress={() => {
                  setCountryCode(null);
                  setCountryOpen(false);
                }}
                style={styles.modalRow}
                accessibilityRole="button"
              >
                <CountryFlag iso2={null} size="sm" />
                <Text style={styles.modalRowText}>Anywhere</Text>
              </Pressable>
              {GUIDE_PICKER.map((c) => (
                <Pressable
                  key={c.code}
                  onPress={() => {
                    setCountryCode(c.code);
                    setCountryOpen(false);
                  }}
                  style={styles.modalRow}
                  accessibilityRole="button"
                >
                  <CountryFlag iso2={c.code.toLowerCase()} size="sm" />
                  <Text style={styles.modalRowText}>{c.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </GshScreenShell>
  );
}

const styles = StyleSheet.create({
  topRow: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  profileHit: {
    flex: 1,
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarOuter: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: colors.cyan,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInner: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 3,
    borderColor: colors.white,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: fontFamily.headingStrong,
    fontSize: 20,
    color: colors.white,
  },
  greetLine: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    color: colors.text2,
  },
  hiLine: {
    fontFamily: fontFamily.headingStrong,
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: -0.7,
    color: colors.navy,
  },
  logo: { height: 30, width: 140, maxWidth: "55%" },
  bellHit: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.card,
  },
  unreadDot: {
    position: "absolute",
    top: 10,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.cyan,
    borderWidth: 2,
    borderColor: colors.white,
  },
  signInGhost: {
    height: 44,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  signInGhostText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    color: colors.navy,
  },
  searchCard: {
    marginTop: 18,
    backgroundColor: colors.white,
    borderRadius: 28,
    paddingTop: 22,
    paddingHorizontal: 18,
    paddingBottom: 18,
    overflow: "hidden",
    ...shadows.lift,
  },
  searchMark: { position: "absolute", right: -62, top: -26 },
  searchTitle: {
    marginTop: 10,
    maxWidth: 250,
    fontFamily: fontFamily.headingStrong,
    fontSize: 30,
    lineHeight: 32,
    letterSpacing: -1,
    color: colors.navy,
  },
  searchBody: {
    marginTop: 10,
    maxWidth: 270,
    fontFamily: fontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text2,
  },
  searchField: {
    marginTop: 16,
    height: 58,
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    paddingLeft: 18,
    paddingRight: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    shadowColor: "#0d194e",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    height: "100%",
    fontFamily: fontFamily.medium,
    fontSize: 16,
    color: colors.navy,
  },
  searchGo: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  countryPick: {
    marginTop: 10,
    height: 52,
    borderRadius: 999,
    backgroundColor: colors.panel,
    paddingLeft: 12,
    paddingRight: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  countryPickText: {
    flex: 1,
    fontFamily: fontFamily.medium,
    fontSize: 16,
    color: colors.navy,
  },
  shortcuts: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  shortcut: { width: 80, alignItems: "center" },
  shortcutTile: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.card,
  },
  shortcutLabel: {
    marginTop: 8,
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
    color: colors.navy,
  },
  navyCard: {
    backgroundColor: colors.navy,
    borderRadius: 28,
    padding: 20,
    overflow: "hidden",
    ...shadows.photo,
  },
  navyLoading: {
    minHeight: 160,
    alignItems: "center",
    justifyContent: "center",
  },
  navyMark: { position: "absolute", left: -80, bottom: -120 },
  breakout: {
    position: "absolute",
    right: 16,
    top: -30,
    width: 104,
    height: 128,
  },
  statChipPos: { position: "absolute", right: 96, top: 70, zIndex: 2 },
  navyTitle: {
    marginTop: 8,
    maxWidth: 160,
    fontFamily: fontFamily.headingStrong,
    fontSize: 21,
    lineHeight: 25,
    letterSpacing: -0.6,
    color: colors.white,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.14)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: colors.cyan,
  },
  navyFooter: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  navyStill: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    color: "rgba(255,255,255,0.75)",
  },
  finishHit: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  finishText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    color: colors.white,
  },
  checkRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  checkText: {
    flex: 1,
    fontFamily: fontFamily.medium,
    fontSize: 15,
    lineHeight: 22,
    color: colors.white,
  },
  alreadyHit: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  alreadyText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    color: colors.white,
  },
  rail: { gap: 12, paddingTop: 16, paddingRight: 8 },
  bandBig: {
    marginTop: 16,
    fontFamily: fontFamily.headingStrong,
    fontSize: 40,
    lineHeight: 40,
    letterSpacing: -1.4,
    color: colors.white,
  },
  bandSub: {
    marginTop: 6,
    fontFamily: fontFamily.medium,
    fontSize: 14,
    lineHeight: 20,
    color: "rgba(255,255,255,0.75)",
  },
  bandGrid: {
    marginTop: 20,
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.14)",
  },
  bandCell: {
    flex: 1,
    paddingTop: 16,
    paddingRight: 18,
  },
  bandCellRight: {
    paddingLeft: 18,
    borderLeftWidth: 1,
    borderLeftColor: "rgba(255,255,255,0.14)",
  },
  bandStat: {
    fontFamily: fontFamily.headingStrong,
    fontSize: 28,
    color: colors.white,
  },
  bandStatLabel: {
    marginTop: 4,
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
  },
  savedEmpty: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text2,
  },
  closing: {
    marginTop: 34,
    backgroundColor: colors.white,
    borderRadius: 28,
    paddingTop: 26,
    paddingHorizontal: 22,
    paddingBottom: 24,
    overflow: "hidden",
    ...shadows.card,
  },
  closingMark: { position: "absolute", right: -70, bottom: -90 },
  closingTitle: {
    marginTop: 10,
    fontFamily: fontFamily.headingStrong,
    fontSize: 34,
    lineHeight: 34,
    letterSpacing: -1.2,
    color: colors.navy,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(13,25,78,0.45)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 32,
  },
  modalTitle: {
    fontFamily: fontFamily.headingStrong,
    fontSize: 18,
    color: colors.navy,
    marginBottom: 12,
  },
  modalRow: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  modalRowText: {
    fontFamily: fontFamily.medium,
    fontSize: 16,
    color: colors.navy,
  },
});
