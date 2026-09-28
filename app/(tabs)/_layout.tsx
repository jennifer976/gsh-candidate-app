import { useAppCopy } from "@/lib/i18n";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useQuery } from "@tanstack/react-query";
import { Tabs, useRouter } from "expo-router";
import {
  Badge,
  Icon,
  Label,
  NativeTabs,
  VectorIcon,
} from "expo-router/unstable-native-tabs";
import { useEffect, useRef, useState, type ComponentProps } from "react";
import { Alert, Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CandidateOnboardingModal } from "@/components/CandidateOnboardingModal";
import { androidTabBarMetrics } from "@/lib/android-insets";
import {
  isCandidateOnboardingComplete,
  markCandidateOnboardingComplete,
} from "@/lib/candidate-onboarding";
import { useAuthStore } from "@/lib/auth-store";
import {
  fetchConversations,
  fetchJobMatches,
  fetchUnreadNotificationCount,
} from "@/lib/api-client";
import { resumeCandidateReturnIntent } from "@/lib/candidate-return-intent";
import { colors, fontFamily } from "@/lib/theme";

type IonName = ComponentProps<typeof Ionicons>["name"];

function badgeText(n: number): string {
  return n > 99 ? "99+" : String(n);
}

function NativeTabIcon({
  sfDefault,
  sfSelected,
  outline,
  filled,
}: {
  sfDefault: string;
  sfSelected: string;
  outline: IonName;
  filled: IonName;
}) {
  return (
    <Icon
      sf={
        {
          default: sfDefault,
          selected: sfSelected,
        } as never
      }
      androidSrc={{
        default: <VectorIcon family={Ionicons} name={outline} />,
        selected: <VectorIcon family={Ionicons} name={filled} />,
      }}
    />
  );
}

/** Android tab icon: the selected tab sits in a cyan pill, as in the app designs. */
function PillTabIcon({
  focused,
  color,
  outline,
  filled,
}: {
  focused: boolean;
  color: string;
  outline: IonName;
  filled: IonName;
}) {
  return (
    <View style={[tabPill.wrap, focused && tabPill.on]}>
      <Ionicons name={focused ? filled : outline} size={focused ? 21 : 23} color={focused ? colors.navy : color} />
    </View>
  );
}

const tabPill = StyleSheet.create({
  wrap: { width: 56, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  on: { backgroundColor: colors.cyan },
});

function useTabBadges(token: string | null) {
  const matchesBadge = useQuery({
    queryKey: ["candidate", "job-matches", "badge"],
    queryFn: () => fetchJobMatches({ unread: true, limit: 1 }),
    enabled: Boolean(token),
    staleTime: 30_000,
  });
  const notificationsBadge = useQuery({
    queryKey: ["notifications-unread"],
    queryFn: fetchUnreadNotificationCount,
    enabled: Boolean(token),
    staleTime: 30_000,
  });
  const conversationsBadge = useQuery({
    queryKey: ["message-conversations"],
    queryFn: fetchConversations,
    enabled: Boolean(token),
    staleTime: 30_000,
  });
  const unreadMessages = (conversationsBadge.data ?? []).reduce(
    (total, row) =>
      total + Math.max(0, row.unreadCount ?? (row.read === false ? 1 : 0)),
    0,
  );
  return {
    matchesCount: matchesBadge.data?.unreadCount ?? 0,
    notifCount: notificationsBadge.data?.unreadCount ?? 0,
    unreadMessages,
  };
}

function useOnboardingGate(token: string | null) {
  const router = useRouter();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingReady, setOnboardingReady] = useState(false);
  const resumingIntent = useRef(false);

  useEffect(() => {
    if (!token) {
      setOnboardingReady(false);
      setShowOnboarding(false);
      return;
    }
    let cancelled = false;
    void isCandidateOnboardingComplete().then((done) => {
      if (cancelled) return;
      setShowOnboarding(!done);
      setOnboardingReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const finishOnboarding = () => {
    void markCandidateOnboardingComplete();
    setShowOnboarding(false);
  };

  useEffect(() => {
    if (!token || !onboardingReady || showOnboarding || resumingIntent.current)
      return;
    resumingIntent.current = true;
    void resumeCandidateReturnIntent(router)
      .then((result) => {
        if (result.error)
          Alert.alert(
            "Action not completed",
            `${result.error} You can retry from this screen.`,
          );
      })
      .finally(() => {
        resumingIntent.current = false;
      });
  }, [onboardingReady, router, showOnboarding, token]);

  return { showOnboarding, onboardingReady, finishOnboarding };
}

function OnboardingHost({
  onboardingReady,
  showOnboarding,
  finishOnboarding,
}: {
  onboardingReady: boolean;
  showOnboarding: boolean;
  finishOnboarding: () => void;
}) {
  if (!onboardingReady) return null;
  return (
    <CandidateOnboardingModal
      visible={showOnboarding}
      onComplete={finishOnboarding}
    />
  );
}

/**
 * Android release builds often show blank NativeTabs icons (VectorIcon not bundled).
 * Use JS Tabs on Android so icons/labels always render; keep NativeTabs on iOS.
 */
function AndroidTabs() {
  const { t } = useAppCopy();
  const insets = useSafeAreaInsets();
  const tabBar = androidTabBarMetrics(insets.bottom);
  const token = useAuthStore((s) => s.token);
  const { matchesCount, notifCount, unreadMessages } = useTabBadges(token);
  const { showOnboarding, onboardingReady, finishOnboarding } =
    useOnboardingGate(token);

  return (
    <>
      <Tabs
        // We pad the bar ourselves so icons clear gesture/3-button nav.
        safeAreaInsets={{ top: 0, right: 0, bottom: 0, left: 0 }}
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.navy,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarActiveBackgroundColor: "transparent",
          tabBarStyle: {
            backgroundColor: colors.white,
            borderTopColor: colors.border,
            borderTopWidth: StyleSheet.hairlineWidth,
            height: tabBar.height,
            paddingBottom: tabBar.paddingBottom,
            paddingTop: tabBar.paddingTop,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontFamily: fontFamily.semiBold,
            marginBottom: 2,
          },
          tabBarItemStyle: { paddingTop: 2 },
          tabBarBadgeStyle: {
            backgroundColor: colors.cyan,
            color: colors.navy,
            fontSize: 10,
            fontFamily: fontFamily.bold,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: t("home"),
            tabBarIcon: ({ color, focused }) => (
              <PillTabIcon focused={focused} color={color} outline="home-outline" filled="home" />
            ),
          }}
        />
        <Tabs.Screen
          name="jobs"
          options={{
            title: t("jobs"),
            tabBarBadge: matchesCount > 0 ? badgeText(matchesCount) : undefined,
            tabBarIcon: ({ color, focused }) => (
              <PillTabIcon focused={focused} color={color} outline="briefcase-outline" filled="briefcase" />
            ),
          }}
        />
        <Tabs.Screen
          name="saved"
          options={{
            title: t("saved"),
            tabBarIcon: ({ color, focused }) => (
              <PillTabIcon focused={focused} color={color} outline="bookmark-outline" filled="bookmark" />
            ),
          }}
        />
        <Tabs.Screen
          name="messages"
          options={{
            title: t("messages"),
            tabBarBadge:
              unreadMessages > 0 ? badgeText(unreadMessages) : undefined,
            tabBarIcon: ({ color, focused }) => (
              <PillTabIcon focused={focused} color={color} outline="chatbubbles-outline" filled="chatbubbles" />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: t("profile"),
            tabBarBadge: notifCount > 0 ? badgeText(notifCount) : undefined,
            tabBarIcon: ({ color, focused }) => (
              <PillTabIcon focused={focused} color={color} outline="person-outline" filled="person" />
            ),
          }}
        />
        <Tabs.Screen name="index" options={{ href: null }} />
        <Tabs.Screen name="applications" options={{ href: null }} />
        <Tabs.Screen name="more" options={{ href: null }} />
      </Tabs>
      <OnboardingHost
        onboardingReady={onboardingReady}
        showOnboarding={showOnboarding}
        finishOnboarding={finishOnboarding}
      />
    </>
  );
}

function IosNativeTabs() {
  const { t } = useAppCopy();
  const token = useAuthStore((s) => s.token);
  const { matchesCount, notifCount, unreadMessages } = useTabBadges(token);
  const { showOnboarding, onboardingReady, finishOnboarding } =
    useOnboardingGate(token);

  return (
    <>
      <NativeTabs
        tintColor={colors.navy}
        iconColor={{
          default: colors.textMuted,
          selected: colors.navy,
        }}
        labelStyle={{
          default: { fontSize: 10, fontWeight: "600", color: colors.textMuted },
          selected: { fontSize: 10, fontWeight: "700", color: colors.navy },
        }}
        backgroundColor={colors.white}
        badgeBackgroundColor={colors.cyan}
        shadowColor="rgba(13,25,78,0.12)"
        disableTransparentOnScrollEdge
        minimizeBehavior="onScrollDown"
        blurEffect="systemChromeMaterialLight"
      >
        <NativeTabs.Trigger name="home">
          <Label>{t("home")}</Label>
          <NativeTabIcon
            sfDefault="house"
            sfSelected="house.fill"
            outline="home-outline"
            filled="home"
          />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="jobs">
          <Label>{t("jobs")}</Label>
          <NativeTabIcon
            sfDefault="briefcase"
            sfSelected="briefcase.fill"
            outline="briefcase-outline"
            filled="briefcase"
          />
          {matchesCount > 0 ? <Badge>{badgeText(matchesCount)}</Badge> : null}
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="saved">
          <Label>{t("saved")}</Label>
          <NativeTabIcon
            sfDefault="bookmark"
            sfSelected="bookmark.fill"
            outline="bookmark-outline"
            filled="bookmark"
          />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="messages">
          <Label>{t("messages")}</Label>
          <NativeTabIcon
            sfDefault="bubble.left.and.bubble.right"
            sfSelected="bubble.left.and.bubble.right.fill"
            outline="chatbubbles-outline"
            filled="chatbubbles"
          />
          {unreadMessages > 0 ? (
            <Badge>{badgeText(unreadMessages)}</Badge>
          ) : null}
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="profile">
          <Label>{t("profile")}</Label>
          <NativeTabIcon
            sfDefault="person.crop.circle"
            sfSelected="person.crop.circle.fill"
            outline="person-circle-outline"
            filled="person-circle"
          />
          {notifCount > 0 ? <Badge>{badgeText(notifCount)}</Badge> : null}
        </NativeTabs.Trigger>
      </NativeTabs>
      <OnboardingHost
        onboardingReady={onboardingReady}
        showOnboarding={showOnboarding}
        finishOnboarding={finishOnboarding}
      />
    </>
  );
}

export default function TabsLayout() {
  return Platform.OS === "ios" ? <IosNativeTabs /> : <AndroidTabs />;
}
