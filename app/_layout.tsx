import "react-native-gesture-handler";
import "@/lib/register-api-auth";
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
import { InAppWebHost } from "@/components/InAppWebHost";
import { PushBootstrap } from "@/components/PushBootstrap";
import { QueryFocusSync } from "@/components/QueryFocusSync";
import { SplashIntroVideo } from "@/components/SplashIntroVideo";
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
  const [hydrated, setHydrated] = useState(useAuthStore.persist.hasHydrated());
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });
  const [introDismissed, setIntroDismissed] = useState(false);
  const nativeSplashHiddenRef = useRef(false);

  const hideNativeSplash = useCallback(() => {
    if (nativeSplashHiddenRef.current) return;
    nativeSplashHiddenRef.current = true;
    void SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []);

  /** After intro, ensure splash is gone before stacking routes (e.g. fast tap-through edge cases). */
  useEffect(() => {
    if (hydrated && fontsLoaded && introDismissed) {
      hideNativeSplash();
    }
  }, [hydrated, fontsLoaded, introDismissed, hideNativeSplash]);

  if (!hydrated || !fontsLoaded) {
    // Native splash only — plain backdrop from app.config.js until fonts + persisted auth hydrate.
    return null;
  }

  if (!introDismissed) {
    return (
      <SafeAreaProvider>
        <SplashIntroVideo onCoverReady={hideNativeSplash} onDone={() => setIntroDismissed(true)} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <QueryFocusSync />
        <PushBootstrap />
        <InAppWebHost />
        <Stack
          screenOptions={{
            ...navHeader,
            contentStyle: { backgroundColor: colors.surfaceMuted },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ title: "Create account" }} />
          <Stack.Screen name="verify" options={{ title: "Verify email" }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="job/[id]" options={{ title: "Job details" }} />
          <Stack.Screen name="alerts" options={{ title: "Job alerts" }} />
          <Stack.Screen name="conversation/[id]" options={{ title: "Conversation" }} />
          <Stack.Screen name="dashboard" options={{ title: "Dashboard" }} />
          <Stack.Screen name="notification-feed" options={{ title: "Notifications" }} />
          <Stack.Screen name="feedback" options={{ title: "Feedback" }} />
          <Stack.Screen name="settings" options={{ title: "Settings" }} />
          <Stack.Screen name="partners" options={{ title: "Partners" }} />
          <Stack.Screen name="offers" options={{ title: "Offers" }} />
          <Stack.Screen name="tools" options={{ title: "Career toolkit" }} />
          <Stack.Screen name="tools-resources" options={{ title: "Tools & resources" }} />
          <Stack.Screen name="learn" options={{ title: "Guides & resources", headerShown: false }} />
          <Stack.Screen name="guides" options={{ headerShown: false }} />
          <Stack.Screen name="visa-wizard" options={{ title: "Visa wizard" }} />
          <Stack.Screen name="legal" options={{ headerShown: false }} />
          <Stack.Screen name="blog" options={{ headerShown: false }} />
          <Stack.Screen name="news" options={{ title: "Immigration headlines" }} />
          <Stack.Screen name="faq" options={{ title: "FAQs" }} />
          <Stack.Screen name="contact" options={{ title: "Contact" }} />
          <Stack.Screen name="curated-listings" options={{ title: "Curated listings" }} />
          <Stack.Screen name="external-job/[id]" options={{ title: "Curated role" }} />
          <Stack.Screen name="ats-assistant" options={{ title: "ATS assistant" }} />
          <Stack.Screen name="forgot-password" options={{ title: "Forgot password", presentation: "modal" }} />
        </Stack>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
