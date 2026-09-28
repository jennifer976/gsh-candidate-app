import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GshScreenShell } from "@/components/GshScreenShell";
import { SignInPanel } from "@/components/SignInGate";
import {
  BrandStatePanel,
  DecorRing,
  DepthPressable,
  DepthSurface,
  Eyebrow,
  IconBadge,
  PosterTitle,
  posterParts,
  SegmentTabs,
} from "@/components/gsh-brand";
import { tabBarBottomPadding } from "@/lib/android-insets";
import { fetchConversations } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import { useAppCopy } from "@/lib/i18n";
import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { jobAgeLabel } from "@/lib/job-presentation";
import { colors, fontFamily } from "@/lib/theme";
import type { ConversationSummary } from "@/types/models";

type Filter = "all" | "unread";

function initialsFromLabel(label: string): string {
  const parts = label.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function unreadOf(row: ConversationSummary): number {
  return Math.max(0, row.unreadCount ?? (row.read === false ? 1 : 0));
}

export default function MessagesScreen() {
  const ac = useAccountCopy();
  const { locale } = useAppCopy();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const signedIn = Boolean(useAuthStore((s) => s.token));
  const [filter, setFilter] = useState<Filter>("all");

  const query = useQuery({
    queryKey: ["message-conversations"],
    queryFn: fetchConversations,
    enabled: signedIn,
  });

  const all = query.data ?? [];
  const unreadTotal = all.filter((row) => unreadOf(row) > 0).length;
  const rows = filter === "unread" ? all.filter((row) => unreadOf(row) > 0) : all;

  const header = (
    <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) + 14 }]}>
      <DecorRing size={220} thickness={30} color="rgba(66,224,227,0.18)" style={{ top: -100, right: -90 }} />
      <Eyebrow>{ac("Inbox")}</Eyebrow>
      <PosterTitle {...posterParts(ac("Your|messages."))} size={38} style={styles.title} />
      {signedIn ? (
        <SegmentTabs
          value={filter}
          onChange={setFilter}
          options={[
            { id: "all", label: ac("All") },
            { id: "unread", label: unreadTotal > 0 ? `${ac("Unread")} (${unreadTotal})` : ac("Unread") },
          ]}
          style={styles.segment}
        />
      ) : (
        <Text style={styles.body}>{ac("Talk to employers and agencies about your applications.")}</Text>
      )}
    </View>
  );

  if (!signedIn) {
    return (
      <GshScreenShell constrainTabletWidth>
        <FlatList
          data={[]}
          renderItem={null}
          ListHeaderComponent={header}
          ListFooterComponent={
            <SignInPanel
              returnTo="/(tabs)/messages"
              icon="chatbubbles-outline"
              title="Your messages"
              body="Sign in to read and reply to messages from employers."
            />
          }
          contentContainerStyle={{ paddingBottom: tabBarBottomPadding(insets.bottom) + 16 }}
        />
      </GshScreenShell>
    );
  }

  const empty = query.isLoading ? (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={colors.navy} />
    </View>
  ) : query.isError ? (
    <BrandStatePanel
      icon="cloud-offline-outline"
      title={ac("Could not load")}
      body={ac("Check your connection and try again.")}
      primary={{ label: ac("Try again"), onPress: () => void query.refetch(), icon: "refresh" }}
    />
  ) : filter === "unread" && all.length > 0 ? (
    <BrandStatePanel
      icon="checkmark-done-outline"
      title={ac("All caught up")}
      body={ac("You have read every message.")}
      secondary={{ label: ac("Show all messages"), onPress: () => setFilter("all") }}
    />
  ) : (
    <BrandStatePanel
      icon="chatbubbles-outline"
      title={ac("No messages yet")}
      body={ac("When an employer or agency contacts you, the conversation will appear here.")}
      primary={{ label: ac("Browse jobs"), onPress: () => router.push("/(tabs)/jobs") }}
    />
  );

  return (
    <GshScreenShell constrainTabletWidth>
      <FlatList
        data={query.isError ? [] : rows}
        keyExtractor={(item) => item.id ?? item._id}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        ListFooterComponent={
          rows.length > 0 ? (
            <DepthSurface face={colors.navy} depthColor={colors.navyDeep} depth={5} radius={20} style={styles.tip}>
              <View style={styles.tipInner}>
                <IconBadge icon="bulb-outline" size={36} radius={11} />
                <Text style={styles.tipText}>
                  {ac("Reply when an employer or agency starts a conversation.")}
                </Text>
              </View>
            </DepthSurface>
          ) : null
        }
        refreshControl={
          <RefreshControl refreshing={query.isRefetching} onRefresh={() => void query.refetch()} tintColor={colors.navy} />
        }
        contentContainerStyle={{ paddingBottom: tabBarBottomPadding(insets.bottom) + 16 }}
        renderItem={({ item }) => {
          const unread = unreadOf(item);
          const when = jobAgeLabel(item.lastMessageAt, locale);
          return (
            <DepthPressable
              onPress={() => router.push(`/conversation/${item.id ?? item._id}`)}
              face={unread > 0 ? colors.unreadBg : colors.white}
              depthColor={unread > 0 ? colors.navy : colors.border}
              depth={4}
              radius={20}
              borderWidth={2}
              borderColor={unread > 0 ? colors.navy : colors.border}
              accessibilityLabel={`${item.counterpartyLabel}. ${item.jobTitle}`}
              style={styles.cardGap}
              innerStyle={styles.card}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initialsFromLabel(item.counterpartyLabel || "?")}</Text>
              </View>
              <View style={styles.cardMid}>
                <View style={styles.rowTop}>
                  <Text style={[styles.counterparty, unread > 0 && styles.bold]} numberOfLines={1}>
                    {item.counterpartyLabel}
                  </Text>
                  {when ? <Text style={styles.when}>{when}</Text> : null}
                </View>
                {item.jobTitle ? (
                  <Text style={styles.jobTitle} numberOfLines={1}>
                    {item.jobTitle}
                  </Text>
                ) : null}
                <View style={styles.previewRow}>
                  <Text style={[styles.preview, unread > 0 && styles.previewUnread]} numberOfLines={2}>
                    {item.lastMessagePreview || ac("No messages yet")}
                  </Text>
                  {unread > 0 ? (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{unread > 99 ? "99+" : unread}</Text>
                    </View>
                  ) : (
                    <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                  )}
                </View>
              </View>
            </DepthPressable>
          );
        }}
      />
    </GshScreenShell>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 18, overflow: "hidden" },
  title: { marginTop: 8 },
  body: {
    marginTop: 14,
    fontFamily: fontFamily.medium,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  segment: { marginTop: 18 },
  loading: { paddingVertical: 48, alignItems: "center" },
  cardGap: { marginHorizontal: 20, marginBottom: 12 },
  card: { flexDirection: "row", gap: 12, padding: 14 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 15, fontFamily: fontFamily.heading, color: colors.cyan },
  cardMid: { flex: 1, minWidth: 0 },
  rowTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  counterparty: {
    flex: 1,
    fontSize: 16,
    fontFamily: fontFamily.heading,
    color: colors.navy,
    letterSpacing: -0.2,
  },
  bold: { fontFamily: fontFamily.headingStrong },
  when: { fontSize: 12, fontFamily: fontFamily.semiBold, color: colors.textMuted },
  jobTitle: { marginTop: 2, fontSize: 13, fontFamily: fontFamily.semiBold, color: colors.textSecondary },
  previewRow: { marginTop: 6, flexDirection: "row", alignItems: "center", gap: 10 },
  preview: { flex: 1, fontSize: 14, lineHeight: 20, fontFamily: fontFamily.regular, color: colors.textMuted },
  previewUnread: { fontFamily: fontFamily.semiBold, color: colors.navy },
  badge: {
    minWidth: 24,
    height: 24,
    paddingHorizontal: 7,
    borderRadius: 12,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { fontSize: 11, fontFamily: fontFamily.extraBold, color: colors.cyan },
  tip: { marginHorizontal: 20, marginTop: 8 },
  tipInner: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  tipText: { flex: 1, fontFamily: fontFamily.medium, fontSize: 14, lineHeight: 20, color: colors.white },
});
