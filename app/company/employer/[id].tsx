import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CompanyLogo } from "@/components/CompanyLogo";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import {
  createEmployerFollow,
  deleteEmployerFollow,
  fetchEmployerFollows,
  fetchPublicEmployersDirectory,
  fetchPublicJobs,
} from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import { persistCandidateReturnIntent } from "@/lib/candidate-return-intent";
import {
  cardSurfaceStyle,
  colors,
  fontFamily,
  navHeader,
  radii,
} from "@/lib/theme";

export default function NativeEmployerCompanyScreen() {
  const ac = useAccountCopy();

  const { id } = useLocalSearchParams<{ id: string }>();
  const employerUserId = String(id || "").trim();
  const router = useRouter();
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);

  const directory = useQuery({
    queryKey: ["public-employers-directory"],
    queryFn: () => fetchPublicEmployersDirectory(200),
  });
  const company = directory.data?.data.find(
    (row) => row.employerUserId === employerUserId,
  );
  const follows = useQuery({
    queryKey: ["candidate", "employer-follows"],
    queryFn: fetchEmployerFollows,
    enabled: Boolean(token),
  });
  const follow = follows.data?.find(
    (row) => row.employerUserId === employerUserId,
  );
  const jobs = useQuery({
    queryKey: ["public-jobs", "employer", employerUserId, company?.companyName],
    queryFn: () =>
      fetchPublicJobs({ q: company?.companyName, page: 1, perPage: 12 }),
    enabled: Boolean(company?.companyName),
  });
  const companyJobs = (jobs.data?.data ?? []).filter((job) => {
    const postedBy = job.postedBy as
      | { _id?: string; id?: string }
      | null
      | undefined;
    return (
      (postedBy?._id ?? postedBy?.id) === employerUserId ||
      job.companyName === company?.companyName
    );
  });

  const toggleFollow = useMutation<unknown, unknown, void>({
    mutationFn: async () => {
      if (follow) return deleteEmployerFollow(follow.id ?? follow._id);
      return createEmployerFollow(employerUserId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["candidate", "employer-follows"],
      });
    },
    onError: (error: unknown) => {
      Alert.alert(
        ac("Could not update employer"),
        ac("Please try again."),
      );
    },
  });

  async function onFollowPress() {
    if (!token) {
      const returnTo = `/company/employer/${encodeURIComponent(employerUserId)}`;
      await persistCandidateReturnIntent(returnTo, {
        kind: "follow_employer",
        employerUserId,
      });
      router.push({
        pathname: "/login",
        params: {
          returnTo,
          pendingAction: "follow_employer",
          pendingTargetId: employerUserId,
        },
      });
      return;
    }
    toggleFollow.mutate();
  }

  return (
    <GshScreenBackground>
      <Stack.Screen
        options={{ title: company?.companyName || "Employer", ...navHeader }}
      />
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        {directory.isLoading ? (
          <ActivityIndicator style={styles.loading} color={colors.brand} />
        ) : !company ? (
          <View style={styles.center}>
            <Ionicons
              name="business-outline"
              size={42}
              color={colors.borderStrong}
            />
            <Text style={styles.error}>
              {ac("This employer profile is unavailable.")}
            </Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.pad}>
            <View style={styles.hero}>
              <CompanyLogo
                logoUrl={company.companyLogo}
                companyName={company.companyName}
                size={64}
                radius={16}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.eyebrow}>{ac("Hiring employer")}</Text>
                <Text style={styles.heading}>{company.companyName}</Text>
                <Text style={styles.heroMeta}>
                  {ac("Active jobs: {count}", { count: company.activeJobs })}
                </Text>
              </View>
            </View>

            <Pressable
              style={[styles.followButton, follow && styles.followButtonActive]}
              onPress={() => void onFollowPress()}
              disabled={toggleFollow.isPending}
              accessibilityRole="button"
              accessibilityState={{ selected: Boolean(follow) }}
            >
              <Ionicons
                name={follow ? "notifications" : "notifications-outline"}
                size={18}
                color={follow ? colors.navy : colors.white}
              />
              <Text
                style={[
                  styles.followButtonText,
                  follow && styles.followButtonTextActive,
                ]}
              >
                {toggleFollow.isPending
                  ? ac("Saving…")
                  : follow
                    ? ac("Following")
                    : ac("Follow")}
              </Text>
            </Pressable>
            <Text style={styles.followHint}>
              {ac(
                "Follow this employer to hear about new jobs. This does not share your contact details.",
              )}
            </Text>

            {company.directoryBadges?.length ? (
              <View style={styles.badges}>
                {company.directoryBadges.map((badge) => (
                  <Text key={badge} style={styles.badge}>
                    {badge}
                  </Text>
                ))}
              </View>
            ) : null}

            <Text style={styles.sectionTitle}>{ac("Current jobs")}</Text>
            {jobs.isLoading ? (
              <ActivityIndicator color={colors.brand} />
            ) : companyJobs.length ? (
              companyJobs.map((job) => (
                <Pressable
                  key={job.id ?? job._id}
                  style={[styles.jobCard, cardSurfaceStyle(false)]}
                  onPress={() =>
                    router.push(`/job/${encodeURIComponent(job.id ?? job._id)}`)
                  }
                >
                  <Text style={styles.jobTitle}>{job.title}</Text>
                  <Text style={styles.jobMeta}>
                    {[job.locationCity, job.locationCountry, job.jobType]
                      .filter(Boolean)
                      .join(" · ")}
                  </Text>
                </Pressable>
              ))
            ) : (
              <Text style={styles.empty}>
                {ac("This employer has no active jobs to show right now.")}
              </Text>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  loading: { marginTop: 52 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
  },
  error: {
    textAlign: "center",
    color: colors.white,
    fontFamily: fontFamily.medium,
  },
  pad: { padding: 18, paddingBottom: 44 },
  hero: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    marginBottom: 18,
  },
  eyebrow: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: colors.accent,
    textTransform: "lowercase",
    letterSpacing: 0.8,
  },
  heading: {
    marginTop: 4,
    fontSize: 25,
    lineHeight: 30,
    fontFamily: fontFamily.heading,
    color: colors.white,
  },
  heroMeta: {
    marginTop: 5,
    fontSize: 13,
    fontFamily: fontFamily.medium,
    color: "rgba(255,255,255,0.65)",
  },
  followButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    padding: 13,
    borderRadius: radii.pill,
    backgroundColor: colors.brand,
  },
  followButtonActive: { backgroundColor: colors.teal },
  followButtonText: {
    fontSize: 14,
    fontFamily: fontFamily.bold,
    color: colors.white,
  },
  followButtonTextActive: { color: colors.navy },
  followHint: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 17,
    fontFamily: fontFamily.regular,
    color: "rgba(255,255,255,0.65)",
  },
  badges: { flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start", gap: 7, marginTop: 18 },
  badge: {
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill,
    backgroundColor: colors.brandSoft,
    color: colors.brandDeep,
    fontFamily: fontFamily.semiBold,
    fontSize: 11,
  },
  sectionTitle: {
    marginTop: 28,
    marginBottom: 11,
    fontSize: 18,
    fontFamily: fontFamily.heading,
    color: colors.white,
  },
  jobCard: { padding: 15, borderRadius: radii.lg, marginBottom: 10 },
  jobTitle: { fontSize: 15, fontFamily: fontFamily.bold, color: colors.navy },
  jobMeta: {
    marginTop: 6,
    fontSize: 12,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
  },
  empty: {
    fontSize: 13,
    lineHeight: 19,
    fontFamily: fontFamily.regular,
    color: "rgba(255,255,255,0.65)",
  },
});
