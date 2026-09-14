import { useAccountCopy as useInterfaceCopy } from "@/lib/i18n/useAccountCopy";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import Animated, { useReducedMotion } from "react-native-reanimated";
import { GshChromeIconButton } from "@/components/GshChromeIconButton";
import { GshHeroWash } from "@/components/GshHeroWash";
import { brandLockupLight, brandLogo } from "@/lib/brand-assets";
import {
  fetchConversations,
  fetchUnreadNotificationCount,
} from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import { enterDown, MOTION } from "@/lib/motion";
import { colors, fontFamily } from "@/lib/theme";

type Props = {
  paddingTop: number;
  tagline?: string;
  children?: ReactNode;
  /** Light matches the website hero wash; navy for deliberate dark bands. */
  tone?: "light" | "navy";
};

/** Shared tab header — lockup + badged chrome icons. */
export function GshTabHeroHeader({
  paddingTop,
  tagline,
  children,
  tone = "light",
}: Props) {
  const interfaceCopy = useInterfaceCopy();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const token = useAuthStore((s) => s.token);
  const light = tone === "light";

  const notificationsQuery = useQuery({
    queryKey: ["notifications-unread"],
    queryFn: fetchUnreadNotificationCount,
    enabled: Boolean(token),
    staleTime: 30_000,
  });
  const conversationsQuery = useQuery({
    queryKey: ["message-conversations"],
    queryFn: fetchConversations,
    enabled: Boolean(token),
    staleTime: 60_000,
  });
  const unreadNotifications = notificationsQuery.data?.unreadCount ?? 0;
  const unreadMessages = (conversationsQuery.data ?? []).reduce(
    (total, row) =>
      total + Math.max(0, row.unreadCount ?? (row.read === false ? 1 : 0)),
    0,
  );

  const body = (
    <Animated.View
      entering={enterDown(MOTION.hero, reduceMotion)}
      style={[styles.root, { paddingTop }, light ? styles.lightRoot : styles.navyRoot]}
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
          <GshChromeIconButton
            icon="notifications-outline"
            onPress={() => router.push("/notification-feed")}
            accessibilityLabel={interfaceCopy("Notifications")}
            badgeCount={unreadNotifications}
            tone={light ? "light" : "navy"}
          />
          <GshChromeIconButton
            icon="chatbubble-outline"
            onPress={() => router.push("/(tabs)/messages")}
            accessibilityLabel="Chats"
            badgeCount={unreadMessages}
            tone={light ? "light" : "navy"}
          />
        </View>
      </View>
      {tagline ? (
        <Text style={[styles.tagline, light ? styles.taglineLight : styles.taglineNavy]}>
          {tagline}
        </Text>
      ) : null}
      {children}
    </Animated.View>
  );

  if (!light) {
    return <View style={{ backgroundColor: colors.navy }}>{body}</View>;
  }

  return <GshHeroWash style={styles.washClip}>{body}</GshHeroWash>;
}

const styles = StyleSheet.create({
  washClip: {
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: "hidden",
  },
  root: { paddingHorizontal: 20 },
  lightRoot: { paddingBottom: 22 },
  navyRoot: { paddingBottom: 28, borderBottomRightRadius: 36 },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    paddingTop: 12,
  },
  logo: { width: 168, height: 36, maxWidth: "62%", flexShrink: 1 },
  actions: { flexDirection: "row", gap: 8 },
  tagline: {
    fontSize: 11,
    letterSpacing: 1.6,
    fontFamily: fontFamily.bold,
    marginBottom: 12,
    lineHeight: 16,
    textTransform: "uppercase",
  },
  taglineLight: { color: colors.cyan },
  taglineNavy: { color: colors.cyan },
});
