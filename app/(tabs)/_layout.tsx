import { useAppCopy } from "@/lib/i18n";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import type { ComponentProps } from "react";
import { Redirect, Tabs, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CandidateOnboardingModal } from "@/components/CandidateOnboardingModal";
import {
  isCandidateOnboardingComplete,
  markCandidateOnboardingComplete,
} from "@/lib/candidate-onboarding";
import { tabBarBottomPadding } from "@/lib/android-insets";
import { useAuthStore } from "@/lib/auth-store";
import {
  fetchConversations,
  fetchJobMatches,
  fetchUnreadNotificationCount,
} from "@/lib/api-client";
import { resumeCandidateReturnIntent } from "@/lib/candidate-return-intent";
import { colors, fontFamily } from "@/lib/theme";

type IonName = ComponentProps<typeof Ionicons>["name"];

function TabGlyph({
  focused,
  color,
  filled,
  outline,
}: {
  focused: boolean;
  color: string;
  filled: IonName;
  outline: IonName;
}) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      {focused && (
        <View
          style={{
            position: "absolute",
            width: 40,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.accent,
          }}
        />
      )}
      <Ionicons name={focused ? filled : outline} size={23} color={color} />
    </View>
  );
}

export default function TabsLayout() {
  const { t } = useAppCopy();
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const insets = useSafeAreaInsets();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingReady, setOnboardingReady] = useState(false);
  const resumingIntent = useRef(false);
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

  if (!token) return <Redirect href="/login" />;

  const bottomInset = tabBarBottomPadding(insets.bottom);
  const tabBarPaddingTop = 8;
  const tabIconRowHeight = 54;

  const darkHeader = {
    headerStyle: { backgroundColor: colors.navyDeep },
    headerTintColor: colors.white,
    headerTitleStyle: {
      fontFamily: fontFamily.bold,
      fontSize: 17,
      color: colors.white,
    },
    headerShadowVisible: false,
  };

  return (
    <>
      <Tabs
        initialRouteName="home"
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.navy,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: {
            backgroundColor: colors.white,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            paddingTop: tabBarPaddingTop,
            paddingBottom: bottomInset,
            height: tabIconRowHeight + tabBarPaddingTop + bottomInset,
          },
          tabBarLabelStyle: {
            fontFamily: fontFamily.semiBold,
            fontSize: 10,
            marginTop: 2,
          },
          tabBarItemStyle: { minHeight: 44 },
          tabBarBadgeStyle: {
            backgroundColor: colors.teal,
            color: colors.navy,
            fontFamily: fontFamily.bold,
          },
          tabBarHideOnKeyboard: true,
        }}
      >
        <Tabs.Screen name="index" options={{ href: null }} />
        <Tabs.Screen
          name="home"
          options={{
            title: t("home"),
            tabBarLabel: t("home"),
            tabBarIcon: ({ color, focused }) => (
              <TabGlyph
                focused={focused}
                color={color}
                filled="home"
                outline="home-outline"
              />
            ),
          }}
        />
        <Tabs.Screen
          name="jobs"
          options={{
            title: t("jobs"),
            tabBarLabel: t("jobs"),
            tabBarBadge: (matchesBadge.data?.unreadCount ?? 0) || undefined,
            tabBarIcon: ({ color, focused }) => (
              <TabGlyph
                focused={focused}
                color={color}
                filled="briefcase"
                outline="briefcase-outline"
              />
            ),
          }}
        />
        <Tabs.Screen
          name="applications"
          options={{
            title: t("applications"),
            headerShown: true,
            ...darkHeader,
            tabBarLabel: t("applications"),
            tabBarIcon: ({ color, focused }) => (
              <TabGlyph
                focused={focused}
                color={color}
                filled="send"
                outline="send-outline"
              />
            ),
          }}
        />
        <Tabs.Screen
          name="messages"
          options={{
            title: t("messages"),
            headerShown: true,
            ...darkHeader,
            tabBarLabel: t("messages"),
            tabBarBadge: unreadMessages || undefined,
            tabBarIcon: ({ color, focused }) => (
              <TabGlyph
                focused={focused}
                color={color}
                filled="chatbubbles"
                outline="chatbubbles-outline"
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: t("profile"),
            headerShown: false,
            tabBarLabel: t("profile"),
            tabBarBadge:
              (notificationsBadge.data?.unreadCount ?? 0) || undefined,
            tabBarIcon: ({ color, focused }) => (
              <TabGlyph
                focused={focused}
                color={color}
                filled="person-circle"
                outline="person-circle-outline"
              />
            ),
          }}
        />
        <Tabs.Screen name="saved" options={{ href: null }} />
        <Tabs.Screen name="more" options={{ href: null }} />
      </Tabs>
      {onboardingReady ? (
        <CandidateOnboardingModal
          visible={showOnboarding}
          onComplete={finishOnboarding}
        />
      ) : null}
    </>
  );
}
