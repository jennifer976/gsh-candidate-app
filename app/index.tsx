import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { useAuthStore } from "@/lib/auth-store";
import { hasSkippedWelcome } from "@/lib/guest-welcome";
import { colors } from "@/lib/theme";

/**
 * Entry: signed-in users and guests who skipped Welcome go to Home.
 * First-time guests land on Welcome.
 */
export default function Index() {
  const token = useAuthStore((s) => s.token);
  const [ready, setReady] = useState(false);
  const [skipped, setSkipped] = useState(false);

  useEffect(() => {
    if (token) {
      setReady(true);
      return;
    }
    let cancelled = false;
    void hasSkippedWelcome().then((v) => {
      if (cancelled) return;
      setSkipped(v);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: colors.white }} />;
  }

  if (token || skipped) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/welcome" />;
}
