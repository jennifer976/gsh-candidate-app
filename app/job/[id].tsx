import { useAppCopy } from "@/lib/i18n";
import { appCopy, type AppLanguage } from "@/lib/i18n/catalog";
import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { jobAgeLabel, jobLocationLabel, jobSalaryLabel } from "@/lib/job-presentation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  Alert,
  Image,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CompanyLogo } from "@/components/CompanyLogo";
import { CountryFlag } from "@/components/CountryFlag";
import { Icon } from "@/components/Icon";
import { CandidateCompatibilityCard } from "@/components/CandidateCompatibilityCard";
import {
  DepthButton,
  Eyebrow,
  GshMark,
  PlainTag,
  SupportChip,
} from "@/components/gsh-brand";
import { SkeletonBox } from "@/components/SkeletonLoader";
import { applyToJob, fetchJobById, fetchOwnProfile, saveJob } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import { computeCandidateReadiness } from "@/lib/candidate-readiness";
import { persistCandidateReturnIntent } from "@/lib/candidate-return-intent";
import { getMarketingSiteUrl } from "@/lib/config";
import { canonicalCountryCode, countryDisplayName } from "@/lib/countries";
import { hapticConfirm } from "@/lib/haptics";
import { clearIdempotencyKey, getOrCreateIdempotencyKey } from "@/lib/idempotency";
import {
  getJobEmployerLabel,
  getJobLogoUrl,
  hubListingChips,
  splitMobilityAndPerks,
  stripHtmlToPlainText,
} from "@/lib/job-display";
import { openExternalUrlInApp } from "@/lib/openMarketingBrowser";
import { PUBLIC_COUNTRIES } from "@/lib/publicResources";
import { countryPhoto } from "@/lib/sitePhotos";
import { colors, fontFamily, shadows } from "@/lib/theme";
import type { Job, ScreeningAnswer } from "@/types/models";

type SectionId = "about" | "requirements" | "visa" | "company";

const SECTIONS: { id: SectionId; label: string }[] = [
  { id: "about", label: "About" },
  { id: "requirements", label: "Requirements" },
  { id: "visa", label: "Visa and relocation" },
  { id: "company", label: "Company" },
];

function errMsg(e: unknown): string {
  if (e && typeof e === "object" && "message" in e)
    return String((e as { message: string }).message);
  return "Something went wrong.";
}

function applicationUnavailableReason(job: Job, locale: AppLanguage): string | null {
  const status = String(job.status || "").toLowerCase();
  if (status && status !== "active") {
    if (status === "de-activate" || status === "paused") return appCopy(locale, "detailPaused");
    return appCopy(locale, "detailClosed");
  }
  if (job.expiresAt) {
    const expiresAt = new Date(job.expiresAt);
    if (!Number.isFinite(expiresAt.getTime())) return appCopy(locale, "detailUnavailable");
    if (expiresAt.getTime() <= Date.now()) return appCopy(locale, "detailExpired");
  }
  return null;
}

function joinWithAnd(parts: string[]): string {
  if (parts.length <= 1) return parts[0] ?? "";
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}

function formatFactDate(iso: string | undefined, intlLocale: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "";
  return d.toLocaleDateString(intlLocale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function RoundIconButton({
  icon,
  size = 20,
  onPress,
  label,
  filled,
}: {
  icon: "arrow-left" | "share-2" | "heart";
  size?: number;
  onPress: () => void;
  label: string;
  filled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={4}
      style={styles.roundBtn}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Icon
        name={icon}
        size={size}
        color={colors.white}
        strokeWidth={1.8}
        fill={filled ? colors.white : "none"}
      />
    </Pressable>
  );
}

function SectionTabs({
  active,
  onPress,
  sticky,
}: {
  active: SectionId;
  onPress: (id: SectionId) => void;
  sticky?: boolean;
}) {
  return (
    <View style={[styles.tabsRow, sticky && styles.tabsSticky]}>
      {SECTIONS.map((tab) => {
        const on = active === tab.id;
        return (
          <Pressable
            key={tab.id}
            onPress={() => onPress(tab.id)}
            style={styles.tabHit}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
          >
            <Text style={[styles.tabText, on && styles.tabTextOn]}>{tab.label}</Text>
            {on ? <View style={styles.tabUnderline} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

function FactCell({
  label,
  value,
  muted,
  right,
  bottom,
}: {
  label: string;
  value: string;
  muted?: boolean;
  right?: boolean;
  bottom?: boolean;
}) {
  return (
    <View
      style={[
        styles.factCell,
        right && styles.factCellRight,
        bottom && styles.factCellBottom,
      ]}
    >
      <Text style={[styles.factValue, muted && styles.factValueMuted]} numberOfLines={2}>
        {value}
      </Text>
      <Text style={styles.factLabel}>{label}</Text>
    </View>
  );
}

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const insets = useSafeAreaInsets();
  const { t, locale, intlLocale } = useAppCopy();
  const ac = useAccountCopy();
  const reducedMotion = useReducedMotion();
  const jobId = String(id || "");
  const [coverLetter, setCoverLetter] = useState("");
  const [screeningAnswers, setScreeningAnswers] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<SectionId>("about");
  const [showStickyTabs, setShowStickyTabs] = useState(false);
  const [barSolid, setBarSolid] = useState(false);
  const accountEmail = useAuthStore((state) => state.user?.email);
  const token = useAuthStore((state) => state.token);
  const scrollRef = useRef<ScrollView>(null);
  const sectionY = useRef<Record<SectionId, number>>({
    about: 0,
    requirements: 0,
    visa: 0,
    company: 0,
  });
  const tabsY = useRef(0);
  const scrollY = useSharedValue(0);
  const topBarHeight = insets.top + 22 + 44;
  const logoScaleStyle = useAnimatedLogoScale(scrollY, reducedMotion);

  const jobQuery = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => fetchJobById(jobId),
    enabled: !!jobId.trim(),
  });

  const profileQuery = useQuery({
    queryKey: ["profile", "me"],
    queryFn: fetchOwnProfile,
    enabled: Boolean(token),
  });

  const resumeUrl =
    profileQuery.data && typeof (profileQuery.data as { resume?: unknown }).resume === "string"
      ? String((profileQuery.data as { resume: string }).resume).trim()
      : "";

  const saveMut = useMutation({
    mutationFn: () => saveJob(jobId),
    onSuccess: () => {
      setSaved(true);
      void hapticConfirm();
      void qc.invalidateQueries({ queryKey: ["saved-jobs"] });
      void qc.invalidateQueries({ queryKey: ["analytics", "candidate-dashboard"] });
    },
    onError: (e: unknown) => {
      const msg = errMsg(e);
      if (msg.includes("already saved")) setSaved(true);
      else Alert.alert(t("jobsSaveError"), t("jobsActionError"));
    },
  });

  const applyMut = useMutation({
    mutationFn: async () => {
      const idempotencyKey = await getOrCreateIdempotencyKey(`application:${jobId}`);
      const answers: ScreeningAnswer[] = (jobQuery.data?.screeningQuestions ?? []).map(
        (question) => ({
          questionId: question.id,
          answer: screeningAnswers[question.id]?.trim() ?? "",
        }),
      );
      return applyToJob(jobId, coverLetter, resumeUrl, answers, idempotencyKey);
    },
    onSuccess: () => {
      void clearIdempotencyKey(`application:${jobId}`);
      void hapticConfirm();
      void qc.invalidateQueries({ queryKey: ["applications"] });
      void qc.invalidateQueries({ queryKey: ["analytics", "candidate-dashboard"] });
      Alert.alert(t("detailSent"), t("detailSentHelp"), [
        { text: t("ok"), onPress: () => router.back() },
      ]);
    },
    onError: () => {
      Alert.alert(t("detailApplyError"), t("detailApplyErrorHelp"));
    },
  });

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)/jobs");
  }

  function onApplyPress() {
    if (!token) {
      const returnTo = `/job/${encodeURIComponent(jobId)}`;
      void persistCandidateReturnIntent(returnTo, { kind: "apply_job", jobId }).then(() => {
        router.push({
          pathname: "/login",
          params: { returnTo, pendingAction: "apply_job", pendingTargetId: jobId },
        });
      });
      return;
    }
    if (profileQuery.isLoading) {
      Alert.alert(t("detailWait"), t("detailProfileLoading"));
      return;
    }
    const profile = profileQuery.data as Record<string, unknown> | undefined;
    const applicationReadiness = computeCandidateReadiness(profile, accountEmail).application;
    if (applicationReadiness.status !== "ready") {
      Alert.alert(
        t("detailProfile"),
        applicationReadiness.missing
          .map((value) => {
            const labels = {
              "Complete your candidate profile": "detailProfile",
              "Add your first and last name": "detailName",
              "Add your location or target countries": "detailLocation",
              "Add a job title, experience, or skills": "detailExperience",
              "Upload your CV": "detailCv",
            } as const;
            return t(labels[value as keyof typeof labels] ?? "detailProfile");
          })
          .join("\n"),
        [
          { text: t("cancel"), style: "cancel" },
          { text: t("profile"), onPress: () => router.push("/(tabs)/profile") },
        ],
      );
      return;
    }
    const unanswered = (jobQuery.data?.screeningQuestions ?? []).filter(
      (question) => question.required !== false && !screeningAnswers[question.id]?.trim(),
    );
    if (unanswered.length) {
      Alert.alert(t("detailQuestions"), t("detailQuestionsHelp"));
      return;
    }
    const unavailable = jobQuery.data
      ? applicationUnavailableReason(jobQuery.data, locale)
      : t("detailUnavailable");
    if (unavailable) {
      Alert.alert(t("detailUnavailable"), unavailable);
      return;
    }
    applyMut.mutate();
  }

  function onSavePress() {
    if (!token) {
      const returnTo = `/job/${encodeURIComponent(jobId)}`;
      void persistCandidateReturnIntent(returnTo, { kind: "save_job", jobId }).then(() => {
        router.push({
          pathname: "/login",
          params: { returnTo, pendingAction: "save_job", pendingTargetId: jobId },
        });
      });
      return;
    }
    if (saved) return;
    saveMut.mutate();
  }

  function onSharePress() {
    const title = jobQuery.data?.title ?? "";
    const url = `${getMarketingSiteUrl()}/jobs/${encodeURIComponent(jobId)}`;
    void Share.share({ title, message: title ? `${title}\n${url}` : url, url }).catch(
      () => undefined,
    );
  }

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y;
      scrollY.value = y;
      setBarSolid(y > 70);
      setShowStickyTabs(y + topBarHeight >= tabsY.current + 8);

      const probe = y + topBarHeight + 56;
      let next: SectionId = "about";
      for (const tab of SECTIONS) {
        if (sectionY.current[tab.id] <= probe) next = tab.id;
      }
      setActiveTab((cur) => (cur === next ? cur : next));
    },
    [scrollY, topBarHeight],
  );

  const scrollToSection = useCallback(
    (id: SectionId) => {
      setActiveTab(id);
      const y = Math.max(0, sectionY.current[id] - topBarHeight - 48);
      scrollRef.current?.scrollTo({ y, animated: true });
    },
    [topBarHeight],
  );

  const markSection = (id: SectionId) => (e: LayoutChangeEvent) => {
    sectionY.current[id] = e.nativeEvent.layout.y;
  };

  const screenOptions = (
    <Stack.Screen options={{ title: t("detailTitle"), headerShown: false }} />
  );

  const floatingBar = (title: string | null) => (
    <View
      style={[
        styles.floatingBar,
        { paddingTop: insets.top + 22 },
        barSolid && styles.floatingBarSolid,
      ]}
    >
      <RoundIconButton icon="arrow-left" size={22} onPress={goBack} label="Back" />
      {barSolid && title ? (
        <Text style={styles.barTitle} numberOfLines={1}>
          {title}
        </Text>
      ) : (
        <View style={{ flex: 1 }} />
      )}
      <View style={styles.barActions}>
        <RoundIconButton icon="share-2" size={20} onPress={onSharePress} label="Share" />
        <RoundIconButton
          icon="heart"
          size={20}
          onPress={onSavePress}
          label="Save job"
          filled={saved}
        />
      </View>
    </View>
  );

  if (!jobId.trim() || jobQuery.isError) {
    const invalid = !jobId.trim();
    return (
      <View style={styles.root}>
        {screenOptions}
        {floatingBar(null)}
        <View style={[styles.stateWrap, { paddingTop: topBarHeight + 24 }]}>
          <Text style={styles.emptyTitle}>
            {invalid ? t("detailInvalid") : t("detailLoadError")}
          </Text>
          <Text style={styles.emptyBody}>
            {invalid
              ? ac("This link doesn't point to a job we can find.")
              : t("retrySupport")}
          </Text>
          <DepthButton
            title={invalid ? t("detailBack") : t("retry")}
            onPress={invalid ? goBack : () => void jobQuery.refetch()}
            variant="navy"
            size="md"
            icon={null}
          />
        </View>
      </View>
    );
  }

  if (jobQuery.isLoading) {
    return (
      <View style={styles.root}>
        {screenOptions}
        {floatingBar(null)}
        <View style={[styles.skeletonPad, { paddingTop: topBarHeight + 24 }]}>
          <SkeletonBox width="40%" height={14} radius={5} />
          <SkeletonBox width="100%" height={12} radius={5} style={{ marginTop: 14 }} />
          <SkeletonBox width="95%" height={12} radius={5} style={{ marginTop: 8 }} />
        </View>
      </View>
    );
  }

  const job = jobQuery.data!;
  const employer = getJobEmployerLabel(job, locale);
  const logoUrl = getJobLogoUrl(job);
  const location = jobLocationLabel(job, locale);
  const salary = jobSalaryLabel(job, locale);
  const chips = hubListingChips(job, 6);
  const { mobility: mobilityItems } = splitMobilityAndPerks(job);
  const descriptionPlain = job.description ? stripHtmlToPlainText(job.description) : "";
  const jobTypeLabel = job.jobType
    ? String(job.jobType).replace(/-/g, " ")
    : "";
  const unavailableReason = applicationUnavailableReason(job, locale);
  const postedLabel = formatFactDate(job.createdAt, intlLocale) || jobAgeLabel(job.createdAt, locale) || "";
  const checkedSource = job.updatedAt || job.createdAt;
  const checkedLabel = formatFactDate(checkedSource, intlLocale);

  const jobCountryCode = canonicalCountryCode(job.locationCountry);
  const countryGuide = jobCountryCode
    ? PUBLIC_COUNTRIES.find((c) => c.iso2.toUpperCase() === jobCountryCode)
    : undefined;
  const countryName = jobCountryCode
    ? countryDisplayName(jobCountryCode, locale)
    : job.locationCountry || "";
  const photo = countryGuide ? countryPhoto(countryGuide.slug) : null;
  const workMode = String(job.workMode || "").toLowerCase();
  const remote =
    workMode.includes("remote") ||
    mobilityItems.some((m) => /remote/i.test(m)) ||
    chips.some((c) => /remote/i.test(c));
  const visaSponsorship = chips.some((c) => /visa sponsorship/i.test(c));
  const relocationSupport = chips.some((c) => /relocation support/i.test(c));
  const mentionParts: string[] = [];
  if (visaSponsorship) mentionParts.push("visa sponsorship");
  if (relocationSupport) mentionParts.push("relocation support");
  if (remote) mentionParts.push("remote work");

  const isExternalApply =
    job.applyMethod === "external_url" || Boolean(job.applicationUrl?.trim());
  const applyUrl = job.applicationUrl?.trim() || "";

  const headerHeight = insets.top + 190;

  return (
    <View style={styles.root}>
      {screenOptions}
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 120 + Math.max(insets.bottom, 8),
          backgroundColor: colors.panel,
        }}
        scrollEventThrottle={16}
        onScroll={onScroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.photoHeader, { height: headerHeight }]}>
          {photo ? (
            <Image source={photo} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
          ) : (
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.navy }]}>
              <GshMark
                size={320}
                color="rgba(255,255,255,0.06)"
                style={styles.markFallback}
              />
            </View>
          )}
          <LinearGradient
            colors={[
              "rgba(13,25,78,0.55)",
              "rgba(13,25,78,0.35)",
              "rgba(13,25,78,0.9)",
            ]}
            locations={[0, 0.45, 1]}
            style={StyleSheet.absoluteFillObject}
          />
          {countryName ? (
            <View style={styles.photoEyebrow}>
              <Eyebrow onDark>{`Jobs in ${countryName}`}</Eyebrow>
            </View>
          ) : null}
        </View>

        <View style={styles.mainCard}>
          <Animated.View style={[styles.logoBreakout, logoScaleStyle]}>
            <View style={styles.logoWell}>
              <CompanyLogo
                logoUrl={logoUrl}
                companyName={employer}
                size={52}
                radius={14}
              />
            </View>
          </Animated.View>
          <Text style={styles.company} numberOfLines={1}>
            {employer}
          </Text>
          <Text style={styles.title} accessibilityRole="header">
            {job.title}
          </Text>
          <View style={styles.locRow}>
            <CountryFlag
              iso2={jobCountryCode ? jobCountryCode.toLowerCase() : null}
              size="sm"
            />
            <Text style={styles.locText} numberOfLines={2}>
              {location}
              {remote ? " · Remote" : ""}
            </Text>
          </View>
          <View style={styles.chipRow}>
            {visaSponsorship ? <SupportChip label="Visa sponsorship" /> : null}
            {relocationSupport ? <SupportChip label="Relocation support" /> : null}
            {remote ? <PlainTag label="Remote" /> : null}
            {jobTypeLabel ? <PlainTag label={jobTypeLabel} /> : null}
          </View>
        </View>

        <View style={styles.factsCard}>
          <View style={styles.factsRow}>
            <FactCell
              label="Salary"
              value={salary || "Not listed"}
              muted={!salary}
            />
            <FactCell
              label="Job type"
              value={jobTypeLabel || "Not listed"}
              muted={!jobTypeLabel}
              right
            />
          </View>
          <View style={styles.factsRow}>
            <FactCell label="Posted" value={postedLabel || "Not listed"} muted={!postedLabel} bottom />
            <FactCell
              label="Last checked"
              value={checkedLabel || "Not listed"}
              muted={!checkedLabel}
              right
              bottom
            />
          </View>
        </View>

        {checkedLabel ? (
          <View style={styles.checkedRow}>
            <View style={styles.cyanDot} />
            <Text style={styles.checkedLine}>
              <Text style={styles.checkedStrong}>{`Last checked ${checkedLabel}.`}</Text>
              <Text style={styles.checkedMuted}>
                {" Details from the employer's listing."}
              </Text>
            </Text>
          </View>
        ) : null}

        <View
          onLayout={(e) => {
            tabsY.current = e.nativeEvent.layout.y;
          }}
        >
          <SectionTabs active={activeTab} onPress={scrollToSection} />
        </View>

        <View style={styles.sectionPad} onLayout={markSection("about")}>
          <Text style={styles.sectionTitle}>About the role</Text>
          {descriptionPlain ? (
            <Text style={styles.bodyText}>{descriptionPlain}</Text>
          ) : job.summary ? (
            <Text style={styles.bodyText}>{job.summary}</Text>
          ) : (
            <Text style={styles.bodyText}>
              {"Details from the employer's listing."}
            </Text>
          )}
          <CandidateCompatibilityCard jobId={jobId} />
        </View>

        <View style={styles.sectionPad} onLayout={markSection("requirements")}>
          <Text style={styles.sectionTitle}>Requirements</Text>
          <Text style={styles.bodyText}>
            {`${employer} lists the full requirements on its careers site. Check them there before you apply.`}
          </Text>
        </View>

        <View style={styles.sectionPad} onLayout={markSection("visa")}>
          <Text style={styles.sectionTitle}>Visa and relocation</Text>
          <View style={styles.visaCard}>
            <GshMark
              size={160}
              color="rgba(255,255,255,0.06)"
              style={styles.visaMark}
            />
            <View style={styles.visaChips}>
              {visaSponsorship ? (
                <SupportChip label="Visa sponsorship" onNavy />
              ) : null}
              {relocationSupport ? (
                <SupportChip label="Relocation support" onNavy />
              ) : null}
            </View>
            <Text style={styles.visaBody}>
              {mentionParts.length > 0
                ? `This listing mentions ${joinWithAnd(mentionParts)}.`
                : "This listing doesn't mention visa sponsorship or relocation support."}
              <Text style={styles.visaConfirm}>
                {" Confirm the details with the employer before you apply."}
              </Text>
            </Text>
          </View>
        </View>

        <View style={styles.sectionPad} onLayout={markSection("company")}>
          <Text style={styles.sectionTitle}>Company</Text>
          <Text style={styles.bodyText}>{employer}</Text>
          {location ? <Text style={styles.companyLoc}>{location}</Text> : null}
        </View>

        {!isExternalApply ? (
          <View style={styles.applyExtras}>
            {job.screeningQuestions?.length ? (
              <>
                <Text style={styles.sectionTitle}>{t("detailQuestions")}</Text>
                <View style={styles.screeningList}>
                  {job.screeningQuestions.map((question) => (
                    <View key={question.id} style={styles.screeningQuestion}>
                      <Text style={styles.screeningLabel}>
                        {question.question}
                        {question.required !== false ? (
                          <Text style={styles.required}> *</Text>
                        ) : null}
                      </Text>
                      {question.type === "yes_no" ? (
                        <View style={styles.answerChoices}>
                          {(["yes", "no"] as const).map((answer) => {
                            const selected = screeningAnswers[question.id] === answer;
                            return (
                              <Pressable
                                key={answer}
                                style={[
                                  styles.answerChoice,
                                  selected && styles.answerChoiceSelected,
                                ]}
                                onPress={() =>
                                  setScreeningAnswers((current) => ({
                                    ...current,
                                    [question.id]: answer,
                                  }))
                                }
                                accessibilityRole="radio"
                                accessibilityState={{ selected }}
                              >
                                <Text
                                  style={[
                                    styles.answerChoiceText,
                                    selected && styles.answerChoiceTextSelected,
                                  ]}
                                >
                                  {answer === "yes" ? t("detailYes") : t("detailNo")}
                                </Text>
                              </Pressable>
                            );
                          })}
                        </View>
                      ) : (
                        <TextInput
                          style={styles.screeningInput}
                          multiline
                          placeholder={t("detailAnswer")}
                          placeholderTextColor={colors.placeholder}
                          value={screeningAnswers[question.id] ?? ""}
                          onChangeText={(answer) =>
                            setScreeningAnswers((current) => ({
                              ...current,
                              [question.id]: answer,
                            }))
                          }
                          maxLength={1000}
                          textAlignVertical="top"
                        />
                      )}
                    </View>
                  ))}
                </View>
              </>
            ) : null}
            <Text style={styles.sectionTitle}>{t("detailNote")}</Text>
            <Text style={styles.coverHint}>{t("detailNoteHelp")}</Text>
            <TextInput
              style={styles.cover}
              multiline
              placeholder={t("detailNotePlaceholder")}
              placeholderTextColor={colors.placeholder}
              value={coverLetter}
              onChangeText={setCoverLetter}
              textAlignVertical="top"
            />
          </View>
        ) : null}
      </ScrollView>

      {floatingBar(job.title)}
      {showStickyTabs ? (
        <View style={[styles.stickyTabsHost, { top: topBarHeight }]}>
          <SectionTabs active={activeTab} onPress={scrollToSection} sticky />
        </View>
      ) : null}

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 10) + 4 }]}>
        {isExternalApply ? (
          <>
            <Text style={styles.externalHint}>
              {`You'll apply on ${employer}'s careers site`}
            </Text>
            <View style={styles.bottomRow}>
              <Pressable
                onPress={onSavePress}
                disabled={saveMut.isPending}
                style={styles.ghostSave}
                accessibilityRole="button"
                accessibilityLabel={saved ? "Saved" : "Save"}
              >
                <Icon
                  name="heart"
                  size={18}
                  color={colors.navy}
                  strokeWidth={1.8}
                  fill={saved ? colors.navy : "none"}
                />
                <Text style={styles.ghostSaveText}>{saved ? "Saved" : "Save"}</Text>
              </Pressable>
              <DepthButton
                title="Apply on employer site"
                onPress={() => {
                  if (applyUrl) openExternalUrlInApp(applyUrl);
                }}
                variant="navy"
                size="md"
                icon="arrow-up-right"
                disabled={!applyUrl || Boolean(unavailableReason)}
                style={{ flex: 1 }}
              />
            </View>
          </>
        ) : (
          <View style={styles.bottomRow}>
            <Pressable
              onPress={onSavePress}
              disabled={saveMut.isPending || saved}
              style={styles.ghostSave}
              accessibilityRole="button"
              accessibilityLabel={saved ? "Saved" : "Save"}
            >
              <Icon
                name="heart"
                size={18}
                color={colors.navy}
                strokeWidth={1.8}
                fill={saved ? colors.navy : "none"}
              />
              <Text style={styles.ghostSaveText}>{saved ? "Saved" : "Save"}</Text>
            </Pressable>
            <DepthButton
              title={unavailableReason ? t("detailUnavailable") : t("detailApply")}
              onPress={onApplyPress}
              variant="navy"
              size="md"
              loading={applyMut.isPending}
              disabled={Boolean(unavailableReason) || profileQuery.isLoading}
              icon={unavailableReason ? null : "arrow-up-right"}
              style={{ flex: 1 }}
            />
          </View>
        )}
      </View>
    </View>
  );
}

function useAnimatedLogoScale(
  scrollY: SharedValue<number>,
  reducedMotion: boolean | null | undefined,
) {
  return useAnimatedStyle(() => {
    if (reducedMotion) return { transform: [{ scale: 1 }] };
    const scale = interpolate(scrollY.value, [0, 120], [1, 0.7], "clamp");
    return { transform: [{ scale }] };
  });
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.panel },
  floatingBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  floatingBarSolid: {
    backgroundColor: colors.navy,
  },
  barTitle: {
    flex: 1,
    fontFamily: fontFamily.heading,
    fontSize: 16,
    color: colors.white,
  },
  barActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  roundBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  photoHeader: {
    overflow: "hidden",
    backgroundColor: colors.navy,
  },
  markFallback: {
    position: "absolute",
    right: -90,
    top: -40,
  },
  photoEyebrow: {
    position: "absolute",
    left: 124,
    bottom: 78,
  },
  mainCard: {
    marginTop: -64,
    marginHorizontal: 16,
    backgroundColor: colors.white,
    borderRadius: 24,
    paddingTop: 52,
    paddingHorizontal: 22,
    paddingBottom: 20,
    ...shadows.card,
  },
  logoBreakout: {
    position: "absolute",
    top: -36,
    left: 22,
  },
  logoWell: {
    width: 76,
    height: 76,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.lift,
  },
  company: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    color: colors.text2,
  },
  title: {
    marginTop: 4,
    fontFamily: fontFamily.headingStrong,
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: -0.8,
    color: colors.navy,
  },
  locRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  locText: {
    flex: 1,
    fontFamily: fontFamily.medium,
    fontSize: 13,
    lineHeight: 18,
    color: colors.text2,
  },
  chipRow: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  factsCard: {
    marginTop: 12,
    marginHorizontal: 16,
    backgroundColor: colors.white,
    borderRadius: 24,
    overflow: "hidden",
    ...shadows.card,
  },
  factsRow: { flexDirection: "row" },
  factCell: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
  factCellRight: { borderRightWidth: 0 },
  factCellBottom: { borderBottomWidth: 0 },
  factValue: {
    fontFamily: fontFamily.headingStrong,
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.4,
    color: colors.navy,
  },
  factValueMuted: { color: colors.muted },
  factLabel: {
    marginTop: 4,
    fontFamily: fontFamily.medium,
    fontSize: 13,
    lineHeight: 18,
    color: colors.text2,
  },
  checkedRow: {
    marginTop: 12,
    marginHorizontal: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  checkedLine: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: 13,
  },
  checkedStrong: {
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
    color: colors.navy,
  },
  checkedMuted: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colors.text2,
  },
  cyanDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.cyan,
    marginTop: 4,
  },
  tabsRow: {
    marginTop: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingHorizontal: 12,
    flexDirection: "row",
  },
  tabsSticky: { marginTop: 0 },
  stickyTabsHost: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 15,
    ...shadows.card,
  },
  tabHit: {
    height: 48,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    color: colors.muted,
  },
  tabTextOn: { color: colors.navy },
  tabUnderline: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 0,
    height: 3,
    backgroundColor: colors.navy,
    borderRadius: 2,
  },
  sectionPad: {
    paddingHorizontal: 16,
    paddingTop: 22,
  },
  sectionTitle: {
    fontFamily: fontFamily.heading,
    fontSize: 18,
    color: colors.navy,
    marginBottom: 10,
  },
  bodyText: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    lineHeight: 24,
    color: colors.text2,
  },
  visaCard: {
    backgroundColor: colors.navy,
    borderRadius: 20,
    padding: 18,
    overflow: "hidden",
  },
  visaMark: {
    position: "absolute",
    right: -40,
    top: -30,
  },
  visaChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  visaBody: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    lineHeight: 22,
    color: colors.white,
  },
  visaConfirm: {
    fontFamily: fontFamily.regular,
    color: "rgba(255,255,255,0.78)",
  },
  companyLoc: {
    marginTop: 6,
    fontFamily: fontFamily.medium,
    fontSize: 14,
    color: colors.text2,
  },
  applyExtras: { paddingHorizontal: 16, paddingTop: 22, gap: 10 },
  screeningList: { gap: 12, marginBottom: 12 },
  screeningQuestion: {
    padding: 14,
    gap: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
  },
  screeningLabel: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.semiBold,
    color: colors.navy,
  },
  required: { color: colors.error },
  answerChoices: { flexDirection: "row", gap: 9 },
  answerChoice: {
    minWidth: 76,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
  },
  answerChoiceSelected: { backgroundColor: colors.navy, borderColor: colors.navy },
  answerChoiceText: { fontSize: 13, fontFamily: fontFamily.bold, color: colors.navy },
  answerChoiceTextSelected: { color: colors.white },
  screeningInput: {
    minHeight: 84,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.pale,
    fontSize: 16,
    fontFamily: fontFamily.regular,
    color: colors.textPrimary,
  },
  coverHint: {
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    marginBottom: 10,
    lineHeight: 19,
  },
  cover: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    padding: 14,
    fontSize: 16,
    backgroundColor: colors.white,
    color: colors.textPrimary,
    fontFamily: fontFamily.regular,
    textAlignVertical: "top",
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    paddingTop: 12,
    paddingHorizontal: 16,
    shadowColor: "#0d194e",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  externalHint: {
    textAlign: "center",
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.text2,
    marginBottom: 8,
  },
  bottomRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  ghostSave: {
    width: 124,
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  ghostSaveText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    color: colors.navy,
  },
  stateWrap: {
    flex: 1,
    paddingHorizontal: 24,
    gap: 12,
    justifyContent: "center",
  },
  skeletonPad: { paddingHorizontal: 24 },
  emptyTitle: {
    fontFamily: fontFamily.heading,
    fontSize: 18,
    color: colors.navy,
  },
  emptyBody: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text2,
  },
});
