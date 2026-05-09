import "react-native-gesture-handler";
import "@/lib/register-api-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuthStore } from "@/lib/auth-store";
import { PushBootstrap } from "@/components/PushBootstrap";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
    },
  },
});

export default function RootLayout() {
  const [hydrated, setHydrated] = useState(useAuthStore.persist.hasHydrated());

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []);

  if (!hydrated) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafc" }}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <PushBootstrap />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: "#f8fafc" },
            headerTintColor: "#0f172a",
            headerShadowVisible: false,
            contentStyle: { backgroundColor: "#f8fafc" },
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
          <Stack.Screen name="ats-assistant" options={{ title: "ATS assistant" }} />
          <Stack.Screen name="forgot-password" options={{ title: "Forgot password", presentation: "modal" }} />
        </Stack>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
