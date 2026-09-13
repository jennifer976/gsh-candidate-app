import { useAccountCopy as useInterfaceCopy } from "@/lib/i18n/useAccountCopy";
import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { brandLockupLight, brandLogo } from "@/lib/brand-assets";
import { colors, fontFamily } from "@/lib/theme";

type Props = {
  paddingTop: number;
  tagline?: string;
  children?: ReactNode;
  /** Light is the candidate default — white canvas, navy type. */
  tone?: "light" | "navy";
};

/** Shared Home / Jobs / Profile header. Light canvas for candidates; navy only when asked. */
export function GshTabHeroHeader({
  paddingTop,
  tagline,
  children,
  tone = "light",
}: Props) {
  const interfaceCopy = useInterfaceCopy();
  const router = useRouter();
  const light = tone === "light";
  const iconColor = light ? colors.navy : "rgba(255,255,255,0.9)";

  return (
    <View
      style={[
        styles.root,
        { paddingTop, backgroundColor: light ? colors.white : colors.navy },
        light ? styles.lightRoot : styles.navyRoot,
      ]}
    >
      <View style={styles.topRow}>
        <Image
          source={light ? brandLogo : brandLockupLight}
          style={styles.logo}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
          accessibilityLabel="Global Sponsor Hub"
        />
        <View style={styles.actions}>
          <Pressable
            onPress={() => router.push("/notification-feed")}
            style={[styles.iconBtn, light ? styles.iconBtnLight : styles.iconBtnNavy]}
            accessibilityRole="button"
            accessibilityLabel={interfaceCopy("Notifications")}
          >
            <Ionicons name="notifications-outline" size={22} color={iconColor} />
          </Pressable>
          <Pressable
            onPress={() => router.push("/(tabs)/messages")}
            style={[styles.iconBtn, light ? styles.iconBtnLight : styles.iconBtnNavy]}
            accessibilityRole="button"
            accessibilityLabel="Chats"
          >
            <Ionicons name="chatbubble-outline" size={22} color={iconColor} />
          </Pressable>
        </View>
      </View>
      {tagline ? (
        <Text style={[styles.tagline, light ? styles.taglineLight : styles.taglineNavy]}>
          {tagline}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { paddingHorizontal: 20 },
  lightRoot: { paddingBottom: 18 },
  navyRoot: { paddingBottom: 28, borderBottomRightRadius: 36 },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    paddingTop: 12,
  },
  logo: { width: 200, height: 44, maxWidth: "60%", flexShrink: 1 },
  actions: { flexDirection: "row", gap: 4 },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnLight: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconBtnNavy: { backgroundColor: "rgba(255,255,255,0.1)" },
  tagline: {
    fontSize: 12,
    letterSpacing: 1,
    fontFamily: fontFamily.medium,
    color: colors.teal,
    marginBottom: 12,
    lineHeight: 20,
    textTransform: "lowercase",
  },
  taglineLight: { color: colors.teal },
  taglineNavy: { color: colors.tealOnNavy },
});
