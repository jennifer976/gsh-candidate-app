import { useAppCopy } from "@/lib/i18n";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useQuery } from "@tanstack/react-query";
import { Redirect, useRouter } from "expo-router";
import {
  Badge,
  Icon,
  Label,
  NativeTabs,
  VectorIcon,
} from "expo-router/unstable-native-tabs";
import { useEffect, useRef, useState } from "react";
import { Alert, Platform } from "react-native";
import { CandidateOnboardingModal } from "@/components/CandidateOnboardingModal";
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
import { colors } from "@/lib/theme";

type IonName = keyof typeof Ionicons.glyphMap;

function TabIcon({
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

function badgeText(n: number): string {
  return n > 99 ? "99+" : String(n);
}

export default function TabsLayout() {
  const { t } = useAppCopy();
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
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
  const matchesCount = matchesBadge.data?.unreadCount ?? 0;
  const notifCount = notificationsBadge.data?.unreadCount ?? 0;

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

  return (
    <>
      <NativeTabs
        tintColor={colors.navy}
        labelStyle={{ fontSize: 10, fontWeight: "600" }}
        minimizeBehavior={Platform.OS === "ios" ? "onScrollDown" : undefined}
        blurEffect={Platform.OS === "ios" ? "systemDefault" : undefined}
      >
        <NativeTabs.Trigger name="home">
          <Label>{t("home")}</Label>
          <TabIcon
            sfDefault="house"
            sfSelected="house.fill"
            outline="home-outline"
            filled="home"
          />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="jobs">
          <Label>{t("jobs")}</Label>
          <TabIcon
            sfDefault="briefcase"
            sfSelected="briefcase.fill"
            outline="briefcase-outline"
            filled="briefcase"
          />
          {matchesCount > 0 ? <Badge>{badgeText(matchesCount)}</Badge> : null}
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="applications">
          <Label>{t("applications")}</Label>
          <TabIcon
            sfDefault="paperplane"
            sfSelected="paperplane.fill"
            outline="send-outline"
            filled="send"
          />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="messages">
          <Label>{t("messages")}</Label>
          <TabIcon
            sfDefault="bubble.left.and.bubble.right"
            sfSelected="bubble.left.and.bubble.right.fill"
            outline="chatbubbles-outline"
            filled="chatbubbles"
          />
          {unreadMessages > 0 ? <Badge>{badgeText(unreadMessages)}</Badge> : null}
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="profile">
          <Label>{t("profile")}</Label>
          <TabIcon
            sfDefault="person.crop.circle"
            sfSelected="person.crop.circle.fill"
            outline="person-circle-outline"
            filled="person-circle"
          />
          {notifCount > 0 ? <Badge>{badgeText(notifCount)}</Badge> : null}
        </NativeTabs.Trigger>
      </NativeTabs>

      {onboardingReady ? (
        <CandidateOnboardingModal
          visible={showOnboarding}
          onComplete={finishOnboarding}
        />
      ) : null}
    </>
  );
}
