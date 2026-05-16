import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { GshNavyHero } from "@/components/GshNavyHero";
import { brandLockupLight } from "@/lib/brand-assets";
import { colors, fontFamily } from "@/lib/theme";

type Props = {
  paddingTop: number;
  tagline?: string;
  children?: ReactNode;
};

/** Shared navy hero for Home and Jobs tabs — lockup, alerts, messages, optional body. */
export function GshTabHeroHeader({ paddingTop, tagline, children }: Props) {
  const router = useRouter();

  return (
    <GshNavyHero variant="full" style={{ paddingTop, paddingHorizontal: 20 }}>
      <View style={styles.topRow}>
        <Image
          source={brandLockupLight}
          style={styles.logo}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
          accessibilityLabel="Global Sponsor Hub"
        />
        <View style={styles.actions}>
          <Pressable
            onPress={() => router.push("/notification-feed")}
            style={styles.iconBtn}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
          >
            <Ionicons name="notifications-outline" size={22} color="rgba(255,255,255,0.9)" />
          </Pressable>
          <Pressable
            onPress={() => router.push("/(tabs)/messages")}
            style={styles.iconBtn}
            accessibilityRole="button"
            accessibilityLabel="Messages"
          >
            <Ionicons name="chatbubble-outline" size={22} color="rgba(255,255,255,0.9)" />
          </Pressable>
        </View>
      </View>
      {tagline ? <Text style={styles.tagline}>{tagline}</Text> : null}
      {children}
    </GshNavyHero>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    paddingTop: 12,
  },
  logo: { width: 200, height: 44, maxWidth: "72%" },
  actions: { flexDirection: "row", gap: 4 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  tagline: {
    fontSize: 14,
    fontFamily: fontFamily.medium,
    color: "rgba(255,255,255,0.65)",
    marginBottom: 12,
    lineHeight: 20,
  },
});
