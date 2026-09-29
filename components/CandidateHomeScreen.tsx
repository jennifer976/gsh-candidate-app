import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import type { ComponentProps } from "react";
import { useCallback, useMemo, useState } from "react";
import { resolveUploadAssetUrl } from "@/lib/media-url";
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CompanyLogo } from "@/components/CompanyLogo";
import { GshHomeDestinationRail } from "@/components/GshHomeDestinationRail";
import { GshScreenShell } from "@/components/GshScreenShell";
import {
  DecorRing,
  DepthButton,
  DepthPressable,
  DepthSurface,
  Eyebrow,
  PosterTitle,
  posterParts,
  SectionHeading,
} from "@/components/gsh-brand";
import {
  fetchOwnProfile,
  fetchPublicExternalJobListings,
  fetchPublicJobs,
  fetchUnreadNotificationCount,
} from "@/lib/api-client";
import { tabBarBottomPadding } from "@/lib/android-insets";
import { brandLockupNavy, heroWalking } from "@/lib/brand-assets";
import { resolveBrandImageUrl } from "@/lib/brand-logo";
import { fetchPublishedBlogList } from "@/lib/content/blogQueries";
import { useAppCopy } from "@/lib/i18n";
import type { AppLanguage as AppLocale } from "@/lib/i18n/catalog";
import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { getJobEmployerLabel, getJobLogoUrl, hubListingChipsPrioritized } from "@/lib/job-display";
import { jobAgeLabel, jobChipLabel, jobLocationLabel, jobSalaryLabel } from "@/lib/job-presentation";
import { getCandidateCompletionBreakdown } from "@/lib/profile-completion";
import { useSignInPrompt } from "@/lib/useSignInPrompt";
import { colors, fontFamily } from "@/lib/theme";
import type { ExternalJobListingPublic, Job } from "@/types/models";

type IonName = ComponentProps<typeof Ionicons>["name"];

const HERO_SIZE = 116;
const JOB_CARD_W = 284;

type HomeRole = {
  key: string;
  title: string;
  employer: string;
  logoUrl: string;
  bandLabel: string;
  bandIcon: IonName;
  age: string | null;
  location: string;
  footer: string;
  href: string;
};

function directRole(job: Job, locale: AppLocale): HomeRole {
  const chip = hubListingChipsPrioritized(job, 1)[0];
  return {
    key: job._id,
    title: job.title,
    employer: getJobEmployerLabel(job, locale),
    logoUrl: getJobLogoUrl(job),
    bandLabel: chip ? jobChipLabel(chip, locale) : job.jobType || "",
    bandIcon: chip ? "airplane" : "briefcase-outline",
    age: jobAgeLabel(job.createdAt, locale),
    location: jobLocationLabel(job, locale),
    footer: jobSalaryLabel(job, locale),
    href: `/job/${encodeURIComponent(job._id)}`,
  };
}

function externalRole(
  job: ExternalJobListingPublic,
  locale: AppLocale,
  ac: (key: string) => string,
): HomeRole {
  return {
    key: job._id,
    title: job.title,
    employer: job.companyName,
    logoUrl: resolveBrandImageUrl(job.companyLogo),
    bandLabel: ac("Employer site"),
    bandIcon: "open-outline",
    age: jobAgeLabel(job.externalPostedAt ?? job.createdAt, locale),
    location: job.location ?? "",
    footer: job.sponsorshipAvailable
      ? ac("Visa sponsorship")
      : job.relocationAvailable
        ? ac("Relocation support")
        : "",
    href: `/external-job/${encodeURIComponent(job._id)}`,
  };
}

function HomeJobCard({ role, index, onPress }: { role: HomeRole; index: number; onPress: () => void }) {
  const { t } = useAppCopy();
  const { employer, bandLabel, age, location } = role;
  const navyBand = index % 2 === 1;
  const bandText = navyBand ? colors.cyan : colors.navy;

  return (
    <DepthPressable
      onPress={onPress}
      depth={5}
      radius={22}
      borderWidth={2}
      borderColor={colors.navy}
      accessibilityLabel={`${role.title}, ${employer}`}
      innerStyle={{ width: JOB_CARD_W }}
    >
      <View style={[styles.jobBand, { backgroundColor: navyBand ? colors.navy : colors.cyan }]}>
        <View style={styles.jobBandLeft}>
          {bandLabel ? (
            <>
              <Ionicons name={role.bandIcon} size={13} color={bandText} />
              <Text style={[styles.jobBandText, { color: bandText }]} numberOfLines={1}>
                {bandLabel}
              </Text>
            </>
          ) : null}
        </View>
        {age ? <Text style={[styles.jobBandAge, { color: bandText }]}>{age}</Text> : null}
      </View>
      <View style={styles.jobBody}>
        <View style={styles.jobHead}>
          <CompanyLogo logoUrl={role.logoUrl} companyName={employer} size={46} radius={12} />
          <View style={styles.jobHeadText}>
            <Text style={styles.jobCompany} numberOfLines={1}>
              {employer}
            </Text>
            <Text style={styles.jobTitle} numberOfLines={2}>
              {role.title}
            </Text>
          </View>
        </View>
        {location ? (
          <View style={styles.jobMetaRow}>
            <Ionicons name="location-outline" size={14} color={colors.textMuted} />
            <Text style={styles.jobMeta} numberOfLines={1}>
              {location}
            </Text>
          </View>
        ) : null}
        <View style={styles.jobFooter}>
          <Text style={styles.jobSalary} numberOfLines={1}>
            {role.footer}
          </Text>
          <View style={styles.jobView}>
            <Text style={styles.jobViewText}>{t("jobsView")}</Text>
            <View style={styles.jobViewArrow}>
              <Ionicons name="arrow-forward" size={14} color={colors.navy} />
            </View>
          </View>
        </View>
      </View>
    </DepthPressable>
  );
}

function JobCardPlaceholder() {
  return (
    <DepthSurface depth={5} radius={22} borderWidth={2} borderColor={colors.border} depthColor={colors.border}>
      <View style={{ width: JOB_CARD_W, height: 196, padding: 16, gap: 12 }}>
        <View style={[styles.ph, { width: "40%", height: 12 }]} />
        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={[styles.ph, { width: 46, height: 46, borderRadius: 12 }]} />
          <View style={{ flex: 1, gap: 8 }}>
            <View style={[styles.ph, { width: "55%", height: 12 }]} />
            <View style={[styles.ph, { width: "90%", height: 16 }]} />
          </View>
        </View>
        <View style={[styles.ph, { width: "70%", height: 12 }]} />
      </View>
    </DepthSurface>
  );
}

export default function CandidateHomeScreen() {
  const { t, locale } = useAppCopy();
  const ac = useAccountCopy();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signedIn, openSignIn, openRegister } = useSignInPrompt();
  const [search, setSearch] = useState("");

  const jobsQuery = useQuery({
    queryKey: ["jobs", "public", "home"],
    queryFn: () => fetchPublicJobs({ page: 1, perPage: 8 }),
    staleTime: 60_000,
  });
  const noDirectJobs = jobsQuery.isSuccess && (jobsQuery.data?.data ?? []).length === 0;
  const externalJobsQuery = useQuery({
    queryKey: ["external-jobs", "public", "home"],
    queryFn: () => fetchPublicExternalJobListings({ sourceRelationship: "curated_external", page: 1, perPage: 8 }),
    staleTime: 60_000,
    enabled: noDirectJobs,
  });
  const blogQuery = useQuery({
    queryKey: ["blogs", "published"],
    queryFn: fetchPublishedBlogList,
    staleTime: 120_000,
    retry: false,
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
  const onRefresh = useCallback(() => {
    void jobsQuery.refetch();
    if (noDirectJobs) void externalJobsQuery.refetch();
    void blogQuery.refetch();
    if (!signedIn) return;
    void profileQuery.refetch();
    void notificationsQuery.refetch();
  }, [
    blogQuery,
    externalJobsQuery,
    jobsQuery,
    noDirectJobs,
    notificationsQuery,
    profileQuery,
    signedIn,
  ]);

  const profile = signedIn ? (profileQuery.data as Record<string, unknown> | undefined) : undefined;
  const firstName = typeof profile?.firstName === "string" ? profile.firstName.trim() : "";
  const lastName = typeof profile?.lastName === "string" ? profile.lastName.trim() : "";
  const avatarUrl = resolveUploadAssetUrl(typeof profile?.profile_picture === "string" ? profile.profile_picture : "");
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  const completion = useMemo(() => getCandidateCompletionBreakdown(profile, locale), [profile, locale]);
  const missing = completion.missing.filter((item) => !item.filled).slice(0, 3);

  const roles: HomeRole[] = noDirectJobs
    ? (externalJobsQuery.data?.data ?? []).slice(0, 6).map((job) => externalRole(job, locale, ac))
    : (jobsQuery.data?.data ?? []).slice(0, 6).map((job) => directRole(job, locale));
  const rolesLoading = jobsQuery.isLoading || (noDirectJobs && externalJobsQuery.isLoading);
  const rolesError = noDirectJobs ? externalJobsQuery.isError : jobsQuery.isError;
  const retryRoles = () => void (noDirectJobs ? externalJobsQuery.refetch() : jobsQuery.refetch());
  const posts = (blogQuery.data ?? []).slice(0, 3);
  const [featuredPost, ...morePosts] = posts;

  const submitSearch = () => {
    router.push({
      pathname: "/(tabs)/jobs",
      params: search.trim() ? { q: search.trim() } : {},
    });
  };

  const refreshing =
    jobsQuery.isRefetching || (signedIn && profileQuery.isRefetching);

  return (
    <GshScreenShell constrainTabletWidth>
      <ScrollView
        contentContainerStyle={{ paddingBottom: tabBarBottomPadding(insets.bottom) + 24 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.navy} />}
      >
        <View style={[styles.hero, { paddingTop: Math.max(insets.top, 12) + 6 }]}>
          <DecorRing size={300} thickness={40} color="rgba(255,255,255,0.28)" style={{ top: -120, right: -110 }} />
          <DecorRing size={180} thickness={24} color="rgba(13,25,78,0.07)" style={{ bottom: 40, left: -90 }} />

          <View style={styles.topBar}>
            <Image
              source={brandLockupNavy}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="Global Sponsor Hub"
            />
            {signedIn ? (
              <View style={styles.topActions}>
                <Pressable
                  onPress={() => router.push("/notification-feed")}
                  style={styles.roundButton}
                  accessibilityRole="button"
                  accessibilityLabel={t("inbox")}
                >
                  <Ionicons name="notifications-outline" size={21} color={colors.navy} />
                  {(notificationsQuery.data?.unreadCount ?? 0) > 0 ? <View style={styles.dot} /> : null}
                </Pressable>
                <Pressable
                  onPress={() => router.push("/(tabs)/profile")}
                  style={styles.roundButton}
                  accessibilityRole="button"
                  accessibilityLabel={t("profile")}
                >
                  {avatarUrl ? (
                    <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
                  ) : initials ? (
                    <Text style={styles.avatarText}>{initials}</Text>
                  ) : (
                    <Ionicons name="person" size={19} color={colors.navy} />
                  )}
                </Pressable>
              </View>
            ) : (
              <DepthButton
                title={ac("Sign in")}
                onPress={() => openSignIn("/(tabs)/home")}
                variant="navy"
                size="sm"
                icon={null}
              />
            )}
          </View>

          <Text style={styles.greeting}>
            {firstName ? ac("Hi {name}", { name: firstName }) : signedIn ? ac("Hi there") : ac("Welcome")}
          </Text>
          <View style={styles.heroRow}>
            <PosterTitle {...posterParts(ac("Your talent|moves."))} size={40} style={styles.heroTitle} />
            <DepthSurface
              face={colors.white}
              depthColor={colors.navy}
              depth={5}
              radius={HERO_SIZE / 2}
              borderWidth={3}
              borderColor={colors.navy}
            >
              <Image
                source={heroWalking}
                style={{ width: HERO_SIZE, height: HERO_SIZE }}
                resizeMode="cover"
                accessibilityIgnoresInvertColors
              />
            </DepthSurface>
          </View>
          <Text style={styles.heroBody}>
            {ac("Sponsored jobs, country guides and move tools in one place.")}
          </Text>

          <DepthSurface
            face={colors.white}
            depthColor={colors.navy}
            depth={4}
            radius={999}
            borderWidth={2}
            borderColor={colors.navy}
            style={styles.searchWrap}
            innerStyle={styles.search}
          >
            <Ionicons name="search" size={20} color={colors.navy} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={submitSearch}
              placeholder={ac("Search sponsored jobs…")}
              placeholderTextColor={colors.placeholder}
              returnKeyType="search"
              style={styles.searchInput}
              accessibilityLabel={ac("Search sponsored jobs")}
            />
            <Pressable
              onPress={submitSearch}
              style={styles.searchGo}
              accessibilityRole="button"
              accessibilityLabel={ac("Search")}
            >
              <Ionicons name="arrow-forward" size={19} color={colors.navy} />
            </Pressable>
          </DepthSurface>
        </View>

        <View style={styles.section}>
          {!signedIn ? (
            <DepthSurface face={colors.navy} depthColor={colors.navyDeep} depth={6} radius={24}>
              <View style={styles.nextCard}>
                <DecorRing size={170} thickness={26} color="rgba(66,224,227,0.14)" style={{ top: -70, right: -60 }} />
                <Eyebrow onDark>{ac("Free for candidates")}</Eyebrow>
                <Text style={styles.nextTitle}>{ac("Create your free account")}</Text>
                {[
                  "Save jobs and come back to them",
                  "Track every application",
                  "Hear from employers in the app",
                ].map((line) => (
                  <View key={line} style={styles.checkRow}>
                    <Ionicons name="checkmark-circle" size={18} color={colors.cyan} />
                    <Text style={styles.checkText}>{ac(line)}</Text>
                  </View>
                ))}
                <DepthButton
                  title={ac("Create a free account")}
                  onPress={() => openRegister()}
                  variant="cyanOnNavy"
                  size="md"
                  style={styles.nextButton}
                />
                <Pressable
                  onPress={() => openSignIn("/(tabs)/home")}
                  style={styles.nextLink}
                  accessibilityRole="button"
                  hitSlop={6}
                >
                  <Text style={styles.nextLinkText}>{ac("I already have an account")}</Text>
                </Pressable>
              </View>
            </DepthSurface>
          ) : profileQuery.isLoading ? (
            <DepthSurface face={colors.navy} depthColor={colors.navyDeep} depth={6} radius={24}>
              <View style={[styles.nextCard, styles.nextLoading]}>
                <ActivityIndicator color={colors.cyan} />
              </View>
            </DepthSurface>
          ) : profileQuery.data ? (
            <DepthSurface face={colors.navy} depthColor={colors.navyDeep} depth={6} radius={24}>
              <View style={styles.nextCard}>
                <DecorRing size={170} thickness={26} color="rgba(66,224,227,0.14)" style={{ top: -70, right: -60 }} />
                {completion.percent < 100 ? (
                  <>
                    <View style={styles.nextHead}>
                      <View style={{ flex: 1 }}>
                        <Eyebrow onDark>{ac("Your next step")}</Eyebrow>
                        <Text style={styles.nextTitle}>{ac("Finish your profile")}</Text>
                      </View>
                      <Text style={styles.nextPercent}>{completion.percent}%</Text>
                    </View>
                    <View style={styles.progressTrack}>
                      <View style={[styles.progressFill, { width: `${Math.max(4, completion.percent)}%` }]} />
                    </View>
                    {missing.map((item) => (
                      <Pressable
                        key={item.path}
                        onPress={() => router.push("/mobility-profile")}
                        style={styles.missingRow}
                        accessibilityRole="button"
                      >
                        <Ionicons name="ellipse-outline" size={18} color={colors.cyan} />
                        <Text style={styles.missingText} numberOfLines={1}>
                          {item.label}
                        </Text>
                        <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.5)" />
                      </Pressable>
                    ))}
                    <DepthButton
                      title={ac("Continue profile")}
                      onPress={() => router.push("/mobility-profile")}
                      variant="cyanOnNavy"
                      size="md"
                      style={styles.nextButton}
                    />
                  </>
                ) : (
                  <>
                    <Eyebrow onDark>{ac("Profile ready")}</Eyebrow>
                    <Text style={styles.nextTitle}>{ac("Let new jobs come to you")}</Text>
                    <Text style={styles.nextBody}>
                      {ac("Set up a job alert and we will tell you when a matching sponsored job is posted.")}
                    </Text>
                    <DepthButton
                      title={ac("Set up a job alert")}
                      onPress={() => router.push("/alerts")}
                      variant="cyanOnNavy"
                      size="md"
                      style={styles.nextButton}
                    />
                  </>
                )}
              </View>
            </DepthSurface>
          ) : null}
        </View>

        {rolesLoading || roles.length > 0 || rolesError ? (
          <View style={styles.sectionFlush}>
            <SectionHeading
              eyebrow={noDirectJobs ? ac("Apply on their site") : ac("Fresh roles")}
              title={noDirectJobs ? ac("External roles") : ac("Latest jobs")}
              actionLabel={ac("See all")}
              onAction={() => router.push("/(tabs)/jobs")}
              style={styles.headingInset}
            />
            {noDirectJobs ? (
              <Text style={styles.externalNote}>
                {ac("No roles to apply for in the app right now, so these open on the employer’s site.")}
              </Text>
            ) : null}
            {rolesError && roles.length === 0 ? (
              <Pressable onPress={retryRoles} style={styles.inlineRetry} accessibilityRole="button">
                <Ionicons name="refresh" size={16} color={colors.navy} />
                <Text style={styles.inlineRetryText}>{ac("Jobs could not load. Tap to try again.")}</Text>
              </Pressable>
            ) : (
              <ScrollView
                horizontal
                nestedScrollEnabled
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.rail}
                decelerationRate="fast"
                snapToInterval={JOB_CARD_W + 16}
              >
                {rolesLoading
                  ? [0, 1].map((key) => <JobCardPlaceholder key={key} />)
                  : roles.map((role, index) => (
                      <HomeJobCard
                        key={role.key}
                        role={role}
                        index={index}
                        onPress={() => router.push(role.href as never)}
                      />
                    ))}
              </ScrollView>
            )}
          </View>
        ) : null}

        <View style={styles.sectionFlush}>
          <GshHomeDestinationRail />
        </View>

        {featuredPost ? (
          <View style={styles.section}>
            <SectionHeading
              eyebrow={ac("Guides and news")}
              title={ac("From the blog")}
              actionLabel={ac("See all")}
              onAction={() => router.push("/blog")}
              style={styles.headingGap}
            />
            <DepthPressable
              onPress={() => router.push(`/blog/${encodeURIComponent(featuredPost.slug)}`)}
              depth={5}
              radius={22}
              borderWidth={2}
              borderColor={colors.navy}
              accessibilityLabel={featuredPost.title}
            >
              {featuredPost.featured_image ? (
                <Image
                  source={{ uri: featuredPost.featured_image }}
                  style={styles.postImage}
                  resizeMode="cover"
                  accessibilityIgnoresInvertColors
                />
              ) : null}
              <View style={styles.postBody}>
                {featuredPost.category?.name ? <Eyebrow>{featuredPost.category.name}</Eyebrow> : null}
                <Text style={styles.postTitle} numberOfLines={3}>
                  {featuredPost.title}
                </Text>
                {featuredPost.description ? (
                  <Text style={styles.postDesc} numberOfLines={2}>
                    {featuredPost.description}
                  </Text>
                ) : null}
              </View>
            </DepthPressable>
            {morePosts.map((post, index) => (
              <Pressable
                key={post.id}
                onPress={() => router.push(`/blog/${encodeURIComponent(post.slug)}`)}
                style={[styles.postRow, index === 0 && styles.postRowFirst]}
                accessibilityRole="button"
              >
                <Text style={styles.postNumber}>{String(index + 2).padStart(2, "0")}</Text>
                <Text style={styles.postRowTitle} numberOfLines={2}>
                  {post.title}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={colors.navy} />
              </Pressable>
            ))}
          </View>
        ) : null}

        <View style={styles.section}>
          <DepthSurface face={colors.navy} depthColor={colors.cyan} depth={6} radius={26}>
            <View style={styles.closing}>
              <DecorRing size={200} thickness={30} color="rgba(66,224,227,0.16)" style={{ bottom: -90, right: -70 }} />
              <PosterTitle {...posterParts(ac("Your career|toolkit."))} onDark highlightTone="cyan" size={30} />
              <Text style={styles.closingBody}>
                {ac("Visa guides, templates, checklists and calculators to help you plan.")}
              </Text>
              <DepthButton
                title={ac("Open tools & resources")}
                onPress={() => router.push("/tools-resources")}
                variant="cyanOnNavy"
                size="md"
                style={styles.nextButton}
              />
            </View>
          </DepthSurface>
        </View>
      </ScrollView>
    </GshScreenShell>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.cyan,
    paddingHorizontal: 20,
    paddingBottom: 26,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: "hidden",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  logo: { width: 160, height: 38, maxWidth: "55%" },
  topActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  roundButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.navy,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  dot: {
    position: "absolute",
    top: 8,
    right: 9,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.error,
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  avatarImage: { width: "100%", height: "100%" },
  avatarText: { fontFamily: fontFamily.extraBold, fontSize: 14, color: colors.navy },
  greeting: {
    marginTop: 22,
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    color: colors.navy,
  },
  heroRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  heroTitle: { flex: 1, minWidth: 0 },
  heroBody: {
    marginTop: 14,
    fontFamily: fontFamily.medium,
    fontSize: 15,
    lineHeight: 22,
    color: "rgba(13,25,78,0.8)",
    maxWidth: 320,
  },
  searchWrap: { marginTop: 18 },
  search: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingLeft: 18,
    paddingRight: 6,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    height: "100%",
    fontFamily: fontFamily.medium,
    fontSize: 15,
    color: colors.navy,
  },
  searchGo: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.cyan,
    borderWidth: 2,
    borderColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  section: { paddingHorizontal: 20, marginTop: 28 },
  sectionFlush: { marginTop: 28 },
  headingGap: { marginBottom: 12 },
  headingInset: { paddingHorizontal: 20, marginBottom: 12 },
  externalNote: {
    marginTop: -4,
    marginBottom: 12,
    paddingHorizontal: 20,
    fontFamily: fontFamily.medium,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  nextCard: { padding: 20, overflow: "hidden" },
  nextLoading: { minHeight: 150, alignItems: "center", justifyContent: "center" },
  nextHead: { flexDirection: "row", alignItems: "flex-end", gap: 12 },
  nextTitle: {
    marginTop: 4,
    fontFamily: fontFamily.headingStrong,
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: -0.5,
    color: colors.white,
  },
  nextPercent: {
    fontFamily: fontFamily.headingStrong,
    fontSize: 30,
    color: colors.cyan,
    letterSpacing: -0.8,
  },
  nextBody: {
    marginTop: 8,
    fontFamily: fontFamily.medium,
    fontSize: 14,
    lineHeight: 21,
    color: "rgba(255,255,255,0.75)",
  },
  progressTrack: {
    marginTop: 14,
    marginBottom: 6,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.14)",
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 5, backgroundColor: colors.cyan },
  missingRow: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.12)",
  },
  missingText: { flex: 1, fontFamily: fontFamily.semiBold, fontSize: 14, color: colors.white },
  checkRow: { marginTop: 10, flexDirection: "row", alignItems: "center", gap: 10 },
  checkText: { flex: 1, fontFamily: fontFamily.medium, fontSize: 14, color: "rgba(255,255,255,0.88)" },
  nextButton: { marginTop: 18 },
  nextLink: { minHeight: 44, alignItems: "center", justifyContent: "center", marginTop: 4 },
  nextLinkText: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.cyan },
  rail: { paddingHorizontal: 20, gap: 16, paddingBottom: 4 },
  inlineRetry: {
    marginHorizontal: 20,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  inlineRetryText: { fontFamily: fontFamily.semiBold, fontSize: 14, color: colors.navy },
  jobBand: {
    height: 36,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  jobBandLeft: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: 6 },
  jobBandText: { flexShrink: 1, fontFamily: fontFamily.extraBold, fontSize: 11, letterSpacing: 0.3, textTransform: "uppercase" },
  jobBandAge: { fontFamily: fontFamily.bold, fontSize: 11 },
  jobBody: { padding: 14, gap: 10 },
  jobHead: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  jobHeadText: { flex: 1, minWidth: 0 },
  jobCompany: { fontFamily: fontFamily.semiBold, fontSize: 13, color: colors.textSecondary },
  jobTitle: {
    marginTop: 2,
    fontFamily: fontFamily.heading,
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.3,
    color: colors.navy,
    minHeight: 44,
  },
  jobMetaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  jobMeta: { flex: 1, fontFamily: fontFamily.medium, fontSize: 13, color: colors.textMuted },
  jobFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 2 },
  jobSalary: { flex: 1, fontFamily: fontFamily.bold, fontSize: 14, color: colors.navy },
  jobView: { flexDirection: "row", alignItems: "center", gap: 8 },
  jobViewText: { fontFamily: fontFamily.extraBold, fontSize: 13, color: colors.navy },
  jobViewArrow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.cyan,
    borderWidth: 2,
    borderColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  ph: { backgroundColor: colors.pale, borderRadius: 6 },
  postImage: { width: "100%", aspectRatio: 16 / 9, backgroundColor: colors.pale },
  postBody: { padding: 16, gap: 6 },
  postTitle: {
    fontFamily: fontFamily.heading,
    fontSize: 18,
    lineHeight: 23,
    letterSpacing: -0.3,
    color: colors.navy,
  },
  postDesc: { fontFamily: fontFamily.regular, fontSize: 14, lineHeight: 20, color: colors.textMuted },
  postRow: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  postRowFirst: { marginTop: 8 },
  postNumber: { fontFamily: fontFamily.headingStrong, fontSize: 20, color: colors.cyan, width: 30 },
  postRowTitle: { flex: 1, fontFamily: fontFamily.semiBold, fontSize: 15, lineHeight: 20, color: colors.navy },
  closing: { padding: 22, overflow: "hidden" },
  closingBody: {
    marginTop: 12,
    fontFamily: fontFamily.medium,
    fontSize: 14,
    lineHeight: 21,
    color: "rgba(255,255,255,0.75)",
  },
});
