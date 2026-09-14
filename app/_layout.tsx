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
        if (!cancelled) setSessionChecked(true);
      });
    return () => {
      cancelled = true;
    };
  }, [hydrated]);

  useEffect(() => {
    if (hydrated && sessionChecked && fontsLoaded) {
      hideNativeSplash();
    }
  }, [hydrated, sessionChecked, fontsLoaded, hideNativeSplash]);

  if (!hydrated || !sessionChecked || !fontsLoaded) {
    return <BrandedLaunchSplash />;
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
