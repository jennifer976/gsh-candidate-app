import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { openExternalUrlInApp } from "@/lib/openMarketingBrowser";
import { colors } from "@/lib/theme";

/** Internal bridge used when an HTTPS app link has no native equivalent. */
export default function WebFallbackScreen() {
  const router = useRouter();
  const { url } = useLocalSearchParams<{ url?: string }>();
  useEffect(() => {
    if (url && /^https:\/\//i.test(url)) openExternalUrlInApp(url);
    router.replace("/(tabs)/home");
  }, [router, url]);
  return <View style={styles.center}><ActivityIndicator color={colors.brand} /></View>;
}

const styles = StyleSheet.create({ center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.navyDeep } });
