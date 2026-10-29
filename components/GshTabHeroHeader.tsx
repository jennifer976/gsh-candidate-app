import { useAccountCopy as useInterfaceCopy } from "@/lib/i18n/useAccountCopy";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import Animated from "react-native-reanimated";
import { GshChromeIconButton } from "@/components/GshChromeIconButton";
import { brandLockupNavy } from "@/lib/brand-assets";
import {
  fetchConversations,
  fetchUnreadNotificationCount,
} from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import { enterDown, MOTION, useReduceMotion } from "@/lib/motion";
import { colors, fontFamily } from "@/lib/theme";

type Props = {
  paddingTop: number;
  tagline?: string;
  children?: ReactNode;
  /** Kept for callers; wash/rings removed in Part 2. */
  tone?: "light" | "navy";
};

/** Shared tab header — lockup + badged chrome icons. No wash, rings or watermark. */
export function GshTabHeroHeader({
  paddingTop,
  tagline,
  children,
}: Props) {
  const interfaceCopy = useInterfaceCopy();
  const router = useRouter();
  const reduceMotion = useReduceMotion();
  const token = useAuthStore((s) => s.token);

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

  return (
    <Animated.View
      entering={enterDown(MOTION.hero, reduceMotion)}
      style={[styles.root, { paddingTop }]}
    >
      <View style={styles.topRow}>
        <Image
          source={brandLockupNavy}
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
            tone="light"
          />
          <GshChromeIconButton
            icon="chatbubble-outline"
            onPress={() => router.push("/(tabs)/messages")}
            accessibilityLabel="Chats"
            badgeCount={unreadMessages}
            tone="light"
          />
        </View>
      </View>
      {tagline ? <Text style={styles.tagline}>{tagline}</Text> : null}
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: colors.panel,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    paddingTop: 12,
  },
  logo: { width: 168, height: 40, maxWidth: "62%", flexShrink: 1 },
  actions: { flexDirection: "row", gap: 8 },
  tagline: {
    fontSize: 13,
    fontFamily: fontFamily.semiBold,
    marginBottom: 12,
    lineHeight: 18,
    color: colors.text2,
  },
});
