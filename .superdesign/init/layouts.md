# Shared layouts

This bounded set captures the two layouts that control every production route plus the shared screen-width shell. Nested Blog/Guides/Legal stacks are small route-title wrappers and are mapped in `routes.md`; they do not introduce additional visual chrome.

## `app/_layout.tsx` — RootLayout

Global font/auth/launch gate, providers, and root native stack. This file defines shared inner-screen header chrome and route-level header/presentation options.

```tsx
import "react-native-gesture-handler";
import "@/lib/register-api-auth";
import { useAppCopy } from "@/lib/i18n";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useRef, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AndroidSystemUiBootstrap } from "@/components/AndroidSystemUiBootstrap";
import { ApiSessionHandler } from "@/components/ApiSessionHandler";
import { BrandedLaunchSplash } from "@/components/BrandedLaunchSplash";
import { InAppWebHost } from "@/components/InAppWebHost";
import { PushBootstrap } from "@/components/PushBootstrap";
import { QueryFocusSync } from "@/components/QueryFocusSync";
import { fetchAuthSession } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import { colors, navHeader } from "@/lib/theme";

SplashScreen.preventAutoHideAsync().catch(() => undefined);
// setOptions is sync (returns void) — never chain .catch() or production crashes at module load.
try {
  SplashScreen.setOptions({
    duration: 220,
    fade: true,
  });
} catch {
  /* Expo Go / missing native module */
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  },
});

export default function RootLayout() {
  const { t } = useAppCopy();
  const [hydrated, setHydrated] = useState(useAuthStore.persist.hasHydrated());
  const [sessionChecked, setSessionChecked] = useState(false);
  const [fontsTimedOut, setFontsTimedOut] = useState(false);
  const [fontsLoaded] = useFonts({
    Montserrat_600SemiBold: require("../assets/fonts/Montserrat_600SemiBold.ttf"),
    Montserrat_700Bold: require("../assets/fonts/Montserrat_700Bold.ttf"),
    Montserrat_800ExtraBold: require("../assets/fonts/Montserrat_800ExtraBold.ttf"),
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });
  const nativeSplashHiddenRef = useRef(false);

  const hideNativeSplash = useCallback(() => {
    if (nativeSplashHiddenRef.current) return;
    nativeSplashHiddenRef.current = true;
    void SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() =>
      setHydrated(true),
    );
    return unsub;
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    const { token, setAuth, clearAuth } = useAuthStore.getState();
    if (!token) {
      setSessionChecked(true);
      return;
    }

    // Never leave the user on the branded splash if the network hangs.
    const timeoutId = setTimeout(() => {
      if (!cancelled) setSessionChecked(true);
    }, 8000);

    void fetchAuthSession()
      .then((session) => {
        if (cancelled) return;
        if (
          String(session.user?.userType ?? "").toLowerCase() !== "candidate"
        ) {
          clearAuth();
          return;
        }
        setAuth(token, session.user);
      })
      .catch(() => {
        if (!cancelled) clearAuth();
      })
      .finally(() => {
        if (!cancelled) {
          clearTimeout(timeoutId);
          setSessionChecked(true);
        }
      });
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [hydrated]);

  // Fonts can fail silently on some devices — don't block launch forever.
  useEffect(() => {
    if (fontsLoaded) return;
    const t = setTimeout(() => setFontsTimedOut(true), 4000);
    return () => clearTimeout(t);
  }, [fontsLoaded]);

  const appReady = hydrated && sessionChecked && (fontsLoaded || fontsTimedOut);

  // Fallback if branded onLayout never fires (should be rare).
  useEffect(() => {
    if (appReady) return;
    const t = setTimeout(hideNativeSplash, 2500);
    return () => clearTimeout(t);
  }, [appReady, hideNativeSplash]);

  // Keep the navy branded layer up until fonts + auth are ready.
  // Native splash is dismissed as soon as that layer paints (same navy) — no black/white flash.
  if (!appReady) {
    return (
      <SafeAreaProvider>
        <BrandedLaunchSplash onReady={hideNativeSplash} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <AndroidSystemUiBootstrap />
      <QueryClientProvider client={queryClient}>
        <ApiSessionHandler />
        <QueryFocusSync />
        <PushBootstrap />
        <InAppWebHost />
        <Stack
          screenOptions={{
            ...navHeader,
            contentStyle: { backgroundColor: colors.white },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="ui-preview" options={{ headerShown: false }} />
          <Stack.Screen
            name="register"
            options={{ title: t("screenCreateaccount") }}
          />
          <Stack.Screen
            name="verify"
            options={{ title: t("screenVerifyemail") }}
          />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="job/[id]"
            options={{
              title: t("screenJobdetails"),
              contentStyle: { backgroundColor: colors.white },
            }}
          />
          <Stack.Screen
            name="alerts"
            options={{ title: t("screenJobalerts") }}
          />
          <Stack.Screen
            name="conversation/[id]"
            options={{ title: t("screenConversation") }}
          />
          <Stack.Screen
            name="dashboard"
            options={{ title: t("screenDashboard") }}
          />
          <Stack.Screen
            name="saved"
            options={{ title: t("screenSavedroles") }}
          />
          <Stack.Screen
            name="notification-feed"
            options={{ title: t("inbox") }}
          />
          <Stack.Screen
            name="feedback"
            options={{ title: t("screenFeedback") }}
          />
          <Stack.Screen name="settings" options={{ title: t("settings") }} />
          <Stack.Screen
            name="mobility-profile"
            options={{ title: t("screenGlobalMobilityProfile") }}
          />
          <Stack.Screen
            name="profile-extraction-review"
            options={{ title: t("screenExtractionreview") }}
          />
          <Stack.Screen
            name="relocation-help"
            options={{ title: t("screenRelocationhelp") }}
          />
          <Stack.Screen
            name="agency-introductions"
            options={{ title: t("screenAgencyintroductions") }}
          />
          <Stack.Screen
            name="partners"
            options={{ title: t("screenPartners") }}
          />
          <Stack.Screen
            name="partner/[id]"
            options={{ title: t("screenPartnerprofile") }}
          />
          <Stack.Screen
            name="companies"
            options={{ title: t("screenCompanydirectory") }}
          />
          <Stack.Screen
            name="company/[slug]"
            options={{ title: t("screenCompanydetails") }}
          />
          <Stack.Screen
            name="company/employer/[id]"
            options={{ title: t("screenEmployer") }}
          />
          <Stack.Screen
            name="employer-follows"
            options={{ title: t("screenFollowedemployers") }}
          />
          <Stack.Screen
            name="resources"
            options={{ title: t("screenPracticalresources") }}
          />
          <Stack.Screen
            name="saved-resources"
            options={{ title: t("screenSavedresources") }}
          />
          <Stack.Screen
            name="application-tracker"
            options={{ title: t("screenApplicationtracker") }}
          />
          <Stack.Screen name="web-fallback" options={{ headerShown: false }} />
          <Stack.Screen name="offers" options={{ title: t("screenOffers") }} />
          <Stack.Screen name="relocation-perks" options={{ title: "" }} />
          <Stack.Screen
            name="tools"
            options={{ title: t("screenCareertoolkit") }}
          />
          <Stack.Screen
            name="tools-resources"
            options={{ title: t("resources") }}
          />
          <Stack.Screen
            name="learn"
            options={{ title: t("screenGuidesresources"), headerShown: false }}
          />
          <Stack.Screen name="guides" options={{ headerShown: false }} />
          <Stack.Screen
            name="visa-wizard"
            options={{ title: t("screenResources") }}
          />
          <Stack.Screen
            name="visa-checker"
            options={{ title: t("screenSponsorchecker") }}
          />
          <Stack.Screen
            name="relocation-worksheets"
            options={{ title: t("screenRelocationworksheets") }}
          />
          <Stack.Screen name="legal" options={{ headerShown: false }} />
          <Stack.Screen name="blog" options={{ headerShown: false }} />
          <Stack.Screen
            name="news"
            options={{ title: t("screenImmigrationheadlines") }}
          />
          <Stack.Screen name="faq" options={{ title: t("screenFAQs") }} />
          <Stack.Screen
            name="currency-converter"
            options={{ title: t("screenCurrencyconverter") }}
          />
          <Stack.Screen
            name="compare-countries"
            options={{ title: t("screenComparecountries") }}
          />
          <Stack.Screen
            name="contact"
            options={{ title: t("screenContact") }}
          />
          <Stack.Screen
            name="curated-listings"
            options={{ title: t("screenCuratedroles") }}
          />
          <Stack.Screen
            name="external-job/[id]"
            options={{ title: t("screenCuratedrole") }}
          />
          <Stack.Screen
            name="ats-assistant"
            options={{ title: t("screenATSassistant") }}
          />
          <Stack.Screen
            name="forgot-password"
            options={{
              title: t("screenForgotpassword"),
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="reset-password"
            options={{ title: t("screenResetpassword"), presentation: "modal" }}
          />
        </Stack>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

export { AppErrorBoundary as ErrorBoundary } from "@/components/AppErrorBoundary";
```

## `app/(tabs)/_layout.tsx` — TabsLayout

Authenticated bottom navigation. iOS uses Expo Router native tabs; Android/web use JavaScript tabs to avoid release-icon failures. It also owns tab badges and the onboarding gate.

```tsx
import { useAppCopy } from "@/lib/i18n";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useQuery } from "@tanstack/react-query";
import { Redirect, Tabs, useRouter } from "expo-router";
import {
  Badge,
  Icon,
  Label,
  NativeTabs,
  VectorIcon,
} from "expo-router/unstable-native-tabs";
import { useEffect, useRef, useState, type ComponentProps } from "react";
import { Alert, Platform, StyleSheet } from "react-native";
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

  if (!token) return <Redirect href="/login" />;

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
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="jobs"
          options={{
            title: t("jobs"),
            tabBarBadge: matchesCount > 0 ? badgeText(matchesCount) : undefined,
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "briefcase" : "briefcase-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="applications"
          options={{
            title: t("applications"),
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "send" : "send-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="messages"
          options={{
            title: t("messages"),
            tabBarBadge:
              unreadMessages > 0 ? badgeText(unreadMessages) : undefined,
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "chatbubbles" : "chatbubbles-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: t("profile"),
            tabBarBadge: notifCount > 0 ? badgeText(notifCount) : undefined,
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "person-circle" : "person-circle-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen name="index" options={{ href: null }} />
        <Tabs.Screen name="saved" options={{ href: null }} />
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

  if (!token) return <Redirect href="/login" />;

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

        <NativeTabs.Trigger name="applications">
          <Label>{t("applications")}</Label>
          <NativeTabIcon
            sfDefault="paperplane"
            sfSelected="paperplane.fill"
            outline="send-outline"
            filled="send"
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
```

## `components/GshScreenShell.tsx` — GshScreenShell

Reusable full-height page canvas and tablet content-width boundary.

```tsx
import type { ReactNode } from "react";
import { StyleSheet, useWindowDimensions, View, type ViewStyle } from "react-native";
import { TABLET_BREAKPOINT_WIDTH, TABLET_MAX_CONTENT_WIDTH } from "@/lib/screen-layout";
import { colors } from "@/lib/theme";

type Props = {
  children: ReactNode;
  variant?: "dark" | "light";
  style?: ViewStyle;
  /** When true, caps content width on tablets (recommended for scroll feeds). */
  constrainTabletWidth?: boolean;
};

/** Native screen canvas. Light is the default; navy is reserved for deliberate bands. */
export function GshScreenShell({
  children,
  variant = "light",
  style,
  constrainTabletWidth = false,
}: Props) {
  const { width } = useWindowDimensions();
  const isWide = width >= TABLET_BREAKPOINT_WIDTH;

  return (
    <View style={[styles.root, variant === "dark" ? styles.dark : styles.light, style]}>
      <View
        style={[
          styles.inner,
          constrainTabletWidth && isWide && styles.innerWide,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  inner: { flex: 1 },
  innerWide: {
    width: "100%",
    maxWidth: TABLET_MAX_CONTENT_WIDTH,
    alignSelf: "center",
  },
  dark: { backgroundColor: colors.navy },
  light: { backgroundColor: colors.white },
});
```
