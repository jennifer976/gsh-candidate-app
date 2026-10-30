import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GuestProfileHub } from "@/components/GuestProfileHub";
import { GshScreenShell } from "@/components/GshScreenShell";
import { Icon, type IconName } from "@/components/Icon";
import {
  Card,
  Row,
  RowCard,
  SectionHeader,
} from "@/components/v3";
import { AppLanguageSetting } from "@/components/AppLanguageSetting";
import { GshMark, TitleWithStop } from "@/components/gsh-brand";
import { fetchOwnProfile } from "@/lib/api-client";
import { tabBarBottomPadding } from "@/lib/android-insets";
import { useAuthStore } from "@/lib/auth-store";
import { useAppLanguage } from "@/lib/i18n";
import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { RiseIn, useCountUp } from "@/lib/motion";
import { firstMissingStep } from "@/lib/onboardingFlow";
import { openProfileStep } from "@/lib/openProfileStep";
import { getCandidateCompletionBreakdown } from "@/lib/profile-completion";
import { colors, fontFamily, shadows } from "@/lib/theme";

const EDIT_ROWS: Array<{
  icon: IconName;
  label: string;
  step?: number;
  href?: string;
}> = [
  { icon: "user", label: "Name", step: 1 },
  { icon: "map-pin", label: "Where you live", step: 2 },
  { icon: "circle-check", label: "Sponsorship and visa status", step: 3 },
  { icon: "globe", label: "Where you want to work", step: 4 },
  { icon: "briefcase-business", label: "Roles and experience", step: 6 },
  { icon: "banknote", label: "Expected salary", step: 10 },
  { icon: "file-text", label: "CV and career summary", step: 11 },
  { icon: "users-round", label: "Who can find you", step: 13 },
  { icon: "bell", label: "Job alerts", href: "/alerts" },
];

export default function ProfileTab() {
  const signedIn = Boolean(useAuthStore((s) => s.token));
  return signedIn ? <ProfileScreen /> : <GuestProfileHub />;
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

function ProfileScreen() {
  const ac = useAccountCopy();
  const locale = useAppLanguage((s) => s.locale);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const user = useAuthStore((s) => s.user);

  const profileQuery = useQuery({
    queryKey: ["profile", "me"],
    queryFn: fetchOwnProfile,
  });

  const profile = profileQuery.data as Record<string, unknown> | undefined;
  const firstName =
    typeof profile?.firstName === "string" ? profile.firstName.trim() : "";
  const lastName =
    typeof profile?.lastName === "string" ? profile.lastName.trim() : "";
  const displayName =
    [firstName, lastName].filter(Boolean).join(" ") ||
    user?.email?.split("@")[0] ||
    "Your profile";
  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() ||
    displayName.charAt(0).toUpperCase();
  const email =
    (typeof profile?.email === "string" && profile.email) ||
    user?.email ||
    "";

  const completion = useMemo(
    () => getCandidateCompletionBreakdown(profile, locale),
    [profile, locale],
  );
  const missing = completion.missing.filter((item) => !item.filled);
  const percentUp = useCountUp(completion.percent, {
    duration: 1000,
    delay: 150,
  });

  function logout() {
    Alert.alert(ac("Sign out"), ac("You can keep browsing jobs without an account."), [
      { text: ac("Cancel"), style: "cancel" },
      {
        text: ac("Sign out"),
        style: "destructive",
        onPress: () => {
          qc.clear();
          clearAuth();
          router.navigate("/(tabs)/home");
        },
      },
    ]);
  }

  if (profileQuery.isLoading) {
    return (
      <GshScreenShell constrainTabletWidth style={{ backgroundColor: colors.panel }}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.navy} size="large" />
        </View>
      </GshScreenShell>
    );
  }

  return (
    <GshScreenShell constrainTabletWidth style={{ backgroundColor: colors.panel }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: insets.top + 26,
          paddingBottom: tabBarBottomPadding(insets.bottom),
        }}
        showsVerticalScrollIndicator={false}
      >
        <RiseIn>
          <TitleWithStop eyebrow="Your account" text="Profile" />
        </RiseIn>

        <RiseIn delay={60}>
          <View style={styles.navyCard}>
            <GshMark
              size={300}
              color="rgba(255,255,255,0.05)"
              style={styles.mark}
            />
            <View style={styles.identityRow}>
              <View style={styles.avatarOuter}>
                <View style={styles.avatarInner}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.name} numberOfLines={1}>
                  {displayName}
                </Text>
                <Text style={styles.email} numberOfLines={1}>
                  {email}
                </Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View>
                <Text style={styles.bigPct}>
                  {percentUp}
                  <Text style={styles.bigPctMark}>%</Text>
                </Text>
                <Text style={styles.pctLabel}>
                  Profile {completion.percent}% done
                </Text>
              </View>
              <Text style={styles.fieldsLabel}>
                {completion.filledCount} of 19 fields
              </Text>
            </View>
            <View style={{ marginTop: 14 }}>
              <ProgressBar percent={completion.percent} />
            </View>
          </View>
        </RiseIn>

        {missing.length > 0 ? (
          <RiseIn delay={120}>
            <View style={{ marginTop: 26 }}>
              <SectionHeader eyebrow="Next steps" title="Still to add" />
              <RowCard style={{ marginTop: 12 }}>
                {missing.map((item, index) => (
                  <Pressable
                    key={item.path}
                    onPress={() =>
                      openProfileStep(item.onboardingStep, "profile")
                    }
                    style={[
                      styles.missingRow,
                      index === missing.length - 1 && { borderBottomWidth: 0 },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={item.label}
                  >
                    <View style={styles.cyanDot} />
                    <Text style={styles.missingLabel} numberOfLines={1}>
                      {item.label}
                    </Text>
                    <Icon
                      name="chevron-right"
                      size={18}
                      color={colors.muted}
                    />
                  </Pressable>
                ))}
              </RowCard>
              <Pressable
                onPress={() =>
                  openProfileStep(
                    firstMissingStep(completion.missing),
                    "profile",
                  )
                }
                style={styles.finishAll}
                accessibilityRole="button"
              >
                <Text style={styles.finishAllText}>Finish</Text>
                <Icon name="chevron-right" size={18} color={colors.cyan} />
              </Pressable>
            </View>
          </RiseIn>
        ) : null}

        <RiseIn delay={160}>
          <View style={{ marginTop: 26 }}>
            <SectionHeader eyebrow="Edit any time" title="Your details" />
            <RowCard style={{ marginTop: 12 }}>
              {EDIT_ROWS.map((row, index) => (
                <Row
                  key={row.label}
                  icon={row.icon}
                  label={row.label}
                  isLast={index === EDIT_ROWS.length - 1}
                  onPress={() => {
                    if (row.href) {
                      router.push(row.href as never);
                      return;
                    }
                    openProfileStep(row.step, "profile");
                  }}
                />
              ))}
            </RowCard>
          </View>
        </RiseIn>

        <RiseIn delay={200}>
          <View style={{ marginTop: 26 }}>
            <SectionHeader eyebrow="Useful links" title="More" />
            <RowCard style={{ marginTop: 12 }}>
              <Row
                icon="gift"
                label="Relocation perks"
                hint="Offers that help with the move"
                onPress={() => router.push("/relocation-perks")}
              />
              <Row
                icon="sparkles"
                label="Career toolkit"
                hint="CV check, country guides, calculators"
                onPress={() => router.push("/tools-resources")}
              />
              <Row
                icon="sliders-horizontal"
                label="Settings"
                hint="Language, security and delete account"
                onPress={() => router.push("/settings")}
                isLast
              />
            </RowCard>
          </View>
        </RiseIn>

        <RiseIn delay={240}>
          <View style={{ marginTop: 26 }}>
            <SectionHeader eyebrow="App settings" title="Language" />
            <Card padding={18} style={{ marginTop: 12 }}>
              <AppLanguageSetting />
            </Card>
          </View>
        </RiseIn>

        <RiseIn delay={280}>
          <Pressable
            onPress={logout}
            style={styles.signOut}
            accessibilityRole="button"
            accessibilityLabel="Sign out"
          >
            <Text style={styles.signOutText}>Sign out</Text>
          </Pressable>
        </RiseIn>
      </ScrollView>
    </GshScreenShell>
  );
}

const styles = StyleSheet.create({
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  navyCard: {
    marginTop: 18,
    backgroundColor: colors.navy,
    borderRadius: 28,
    paddingTop: 22,
    paddingHorizontal: 20,
    paddingBottom: 20,
    overflow: "hidden",
    ...shadows.photo,
  },
  mark: { position: "absolute", right: -110, top: -110 },
  identityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatarOuter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: colors.cyan,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 3,
    borderColor: colors.navy,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: fontFamily.headingStrong,
    fontSize: 24,
    color: colors.navy,
  },
  name: {
    fontFamily: fontFamily.headingStrong,
    fontSize: 21,
    color: colors.white,
  },
  email: {
    marginTop: 2,
    fontFamily: fontFamily.medium,
    fontSize: 14,
    color: "rgba(255,255,255,0.72)",
  },
  statsRow: {
    marginTop: 22,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
  },
  bigPct: {
    fontFamily: fontFamily.headingStrong,
    fontSize: 40,
    lineHeight: 40,
    color: colors.white,
  },
  bigPctMark: { fontSize: 28 },
  pctLabel: {
    marginTop: 4,
    fontFamily: fontFamily.medium,
    fontSize: 14,
    lineHeight: 20,
    color: "rgba(255,255,255,0.75)",
  },
  fieldsLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: "rgba(255,255,255,0.72)",
    marginBottom: 4,
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
  missingRow: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  cyanDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.cyan,
  },
  missingLabel: {
    flex: 1,
    fontFamily: fontFamily.medium,
    fontSize: 15,
    color: colors.navy,
  },
  finishAll: {
    marginTop: 8,
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    gap: 2,
  },
  finishAllText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    color: colors.navy,
  },
  signOut: {
    marginTop: 28,
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.card,
  },
  signOutText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    color: colors.error,
  },
});
