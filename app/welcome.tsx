import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import {
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  DepthButton,
  GshMark,
  SupportChip,
  TalentMovesLockup,
} from "@/components/gsh-brand";
import { fetchPublicJobs } from "@/lib/api-client";
import { brandLockupNavy } from "@/lib/brand-assets";
import { markWelcomeSkipped } from "@/lib/guest-welcome";
import { jobLocationLabel } from "@/lib/job-presentation";
import { FloatIn, RiseIn } from "@/lib/motion";
import { PHOTO_ALT, SITE_PHOTOS } from "@/lib/sitePhotos";
import { colors, fontFamily, shadows } from "@/lib/theme";
import type { Job } from "@/types/models";

function hasVisaSponsorship(job: Job): boolean {
  const chips = [...(job.mobility ?? []), ...(job.benefits ?? []), ...(job.visaRoutes ?? [])]
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.toLowerCase());
  if (chips.some((v) => /sponsor|visa/.test(v) && !/no sponsorship/.test(v))) return true;
  const extra = job as Job & { sponsorshipAvailable?: boolean };
  return extra.sponsorshipAvailable === true;
}

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const jobsQuery = useQuery({
    queryKey: ["welcome", "latest-sponsored"],
    queryFn: () => fetchPublicJobs({ page: 1, limit: 12 }),
    staleTime: 60_000,
  });

  const liveJob = useMemo(() => {
    const rows = jobsQuery.data?.data ?? [];
    return rows.find(hasVisaSponsorship) ?? null;
  }, [jobsQuery.data]);

  const skipToApp = async () => {
    await markWelcomeSkipped();
    router.replace("/(tabs)/home");
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 30 }]}>
      <StatusBar barStyle="dark-content" />
      <Image
        source={brandLockupNavy}
        style={styles.logo}
        resizeMode="contain"
        accessibilityLabel="Global Sponsor Hub"
      />

      <View style={styles.lockup}>
        <RiseIn delay={50}>
          <TalentMovesLockup size={66} />
        </RiseIn>
      </View>

      <RiseIn delay={280}>
        <Text style={styles.body}>
          Jobs with visa sponsorship, relocation support or global remote work. Free for candidates, always.
        </Text>
      </RiseIn>

      <View style={styles.middle}>
        <View style={styles.markLayer} pointerEvents="none">
          <GshMark size={320} color="#dfe3ec" style={styles.mark} />
        </View>
        <RiseIn delay={320} style={styles.walkerWrap}>
          <Image
            source={SITE_PHOTOS["hero-walker"]}
            style={styles.walker}
            resizeMode="contain"
            accessibilityLabel={PHOTO_ALT["hero-walker"]}
          />
        </RiseIn>
        {liveJob ? (
          <FloatIn delay={900} rotate="-2deg" style={styles.liveCard}>
            <View style={styles.liveHead}>
              <View style={styles.liveDot} />
              <Text style={styles.liveEyebrow}>live</Text>
            </View>
            <Text style={styles.liveMeta}>latest sponsored role</Text>
            <Text style={styles.liveTitle} numberOfLines={2}>
              {liveJob.title}
            </Text>
            <Text style={styles.liveLoc} numberOfLines={1}>
              {jobLocationLabel(liveJob, "en")}
            </Text>
            <SupportChip label="Visa sponsorship" />
          </FloatIn>
        ) : null}
      </View>

      <View style={[styles.bottom, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <View style={styles.countRow}>
          <View style={styles.countDot} />
          <Text style={styles.countText}>Over 3,000 candidates and growing daily</Text>
        </View>
        <View style={styles.buttons}>
          <DepthButton
            title="Create free account"
            onPress={() => router.push("/register")}
            variant="navy"
            icon="arrow-up-right"
          />
          <DepthButton
            title="Sign in"
            onPress={() => router.push("/login")}
            variant="secondary"
            icon={null}
          />
          <Pressable onPress={() => void skipToApp()} accessibilityRole="link" style={styles.skip}>
            <Text style={styles.skipText}>Skip to app</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
  logo: {
    height: 34,
    width: 180,
    marginLeft: 24,
  },
  lockup: {
    marginTop: 24,
    marginHorizontal: 24,
  },
  body: {
    marginTop: 16,
    marginHorizontal: 24,
    maxWidth: 330,
    fontFamily: fontFamily.regular,
    fontSize: 16,
    lineHeight: 24,
    color: colors.text2,
  },
  middle: {
    flex: 1,
    minHeight: 150,
    marginTop: 8,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  markLayer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  mark: { opacity: 1 },
  walkerWrap: {
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  walker: {
    height: "100%",
    width: "100%",
  },
  liveCard: {
    position: "absolute",
    right: 16,
    bottom: 12,
    maxWidth: 200,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 12,
    gap: 4,
    ...shadows.lift,
  },
  liveHead: { flexDirection: "row", alignItems: "center", gap: 6 },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.cyan,
  },
  liveEyebrow: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: colors.navy,
  },
  liveMeta: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    color: colors.muted,
  },
  liveTitle: {
    marginTop: 4,
    fontFamily: fontFamily.heading,
    fontSize: 14,
    lineHeight: 18,
    color: colors.navy,
  },
  liveLoc: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.text2,
    marginBottom: 4,
  },
  bottom: {
    backgroundColor: colors.white,
    paddingHorizontal: 24,
    paddingTop: 14,
  },
  countRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  countDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.cyan,
  },
  countText: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    color: colors.text2,
  },
  buttons: { marginTop: 12, gap: 10 },
  skip: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  skipText: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    color: colors.text2,
    textDecorationLine: "underline",
    textDecorationColor: colors.cyan,
  },
});
