import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "@/components/Icon";
import { GshScreenShell } from "@/components/GshScreenShell";
import { Card, PhotoEmpty } from "@/components/v3";
import { DepthButton, TitleWithStop } from "@/components/gsh-brand";
import { tabBarBottomPadding } from "@/lib/android-insets";
import { fetchConversations } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import { useAppCopy } from "@/lib/i18n";
import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { jobAgeLabel } from "@/lib/job-presentation";
import { listStaggerDelay, RiseIn } from "@/lib/motion";
import { openProfileStep } from "@/lib/openProfileStep";
import { useSignInPrompt } from "@/lib/useSignInPrompt";
import { colors, fontFamily } from "@/lib/theme";
import type { ConversationSummary } from "@/types/models";

type Filter = "all" | "employers" | "agencies";

function initialsFromLabel(label: string): string {
  const parts = label.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function unreadOf(row: ConversationSummary): number {
  return Math.max(0, row.unreadCount ?? (row.read === false ? 1 : 0));
}

function isAgency(row: ConversationSummary): boolean {
  const kind = String(
    (row as ConversationSummary & { counterpartyType?: string }).counterpartyType ||
      (row as ConversationSummary & { partyType?: string }).partyType ||
      "",
  ).toLowerCase();
  if (kind.includes("agency")) return true;
  if (kind.includes("employer")) return false;
  const label = (row.counterpartyLabel || "").toLowerCase();
  return /\bagency\b|\brecruiter\b/.test(label);
}

export default function MessagesScreen() {
  const ac = useAccountCopy();
  const { locale } = useAppCopy();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const signedIn = Boolean(useAuthStore((s) => s.token));
  const { openSignIn, openRegister } = useSignInPrompt();
  const [filter, setFilter] = useState<Filter>("all");

  const query = useQuery({
    queryKey: ["message-conversations"],
    queryFn: fetchConversations,
    enabled: signedIn,
  });

  const all = query.data ?? [];
  const rows =
    filter === "all"
      ? all
      : filter === "agencies"
        ? all.filter(isAgency)
        : all.filter((row) => !isAgency(row));

  const header = (
    <View style={[styles.header, { paddingTop: insets.top + 26 }]}>
      <TitleWithStop eyebrow="Employers and agencies" text="Messages" />
      {signedIn ? (
        <View style={styles.segmentTrack}>
          {(
            [
              { id: "all", label: "All" },
              { id: "employers", label: "Employers" },
              { id: "agencies", label: "Agencies" },
            ] as const
          ).map((opt) => {
            const on = filter === opt.id;
            return (
              <Pressable
                key={opt.id}
                onPress={() => setFilter(opt.id)}
                style={[styles.segment, on && styles.segmentOn]}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
              >
                <Text style={[styles.segmentText, on && styles.segmentTextOn]}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );

  if (!signedIn) {
    return (
      <GshScreenShell constrainTabletWidth style={{ backgroundColor: colors.panel }}>
        <FlatList
          data={[]}
          renderItem={null}
          ListHeaderComponent={header}
          ListFooterComponent={
            <PhotoEmpty
              photo="about-city"
              chipIcon="message-circle"
              chipLabel="You choose who"
              title="Your messages"
              body="Sign in to read and reply to messages from employers."
              style={{ paddingTop: 40 }}
            >
              <DepthButton
                title="Create a free account"
                onPress={() => openRegister("/(tabs)/messages")}
                variant="navy"
                size="md"
              />
              <Pressable
                onPress={() => openSignIn("/(tabs)/messages")}
                style={styles.signInHit}
                accessibilityRole="button"
                accessibilityLabel="Sign in"
              >
                <Text style={styles.signInText}>Sign in</Text>
              </Pressable>
            </PhotoEmpty>
          }
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: tabBarBottomPadding(insets.bottom),
          }}
        />
      </GshScreenShell>
    );
  }

  const empty = query.isLoading ? (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={colors.navy} />
    </View>
  ) : query.isError ? (
    <View style={styles.errorWrap}>
      <Text style={styles.errorTitle}>{ac("Could not load")}</Text>
      <Text style={styles.errorBody}>
        {ac("Check your connection and try again.")}
      </Text>
      <DepthButton
        title={ac("Try again")}
        onPress={() => void query.refetch()}
        variant="navy"
        size="md"
        icon="refresh"
      />
    </View>
  ) : (
    <PhotoEmpty
      photo="about-city"
      chipIcon="message-circle"
      chipLabel="You choose who"
      title="No messages yet"
      body="When an employer or agency you've allowed to contact you sends a message, it appears here."
    >
      <Pressable
        onPress={() => openProfileStep(13, "messages")}
        style={styles.ghostHit}
        accessibilityRole="button"
      >
        <Text style={styles.ghostText}>Choose who can contact you</Text>
      </Pressable>
    </PhotoEmpty>
  );

  return (
    <GshScreenShell constrainTabletWidth style={{ backgroundColor: colors.panel }}>
      <FlatList
        data={query.isError ? [] : rows}
        keyExtractor={(item) => item.id ?? item._id}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        refreshControl={
          <RefreshControl
            refreshing={query.isRefetching}
            onRefresh={() => void query.refetch()}
            colors={["#0d194e"]}
            progressBackgroundColor="#ffffff"
            tintColor="#0d194e"
          />
        }
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: tabBarBottomPadding(insets.bottom),
        }}
        renderItem={({ item, index }) => {
          const unread = unreadOf(item);
          const when = jobAgeLabel(item.lastMessageAt, locale);
          return (
            <RiseIn delay={listStaggerDelay(index)}>
              <Pressable
                onPress={() =>
                  router.push(`/conversation/${item.id ?? item._id}`)
                }
                accessibilityRole="button"
                accessibilityLabel={`${item.counterpartyLabel}. ${item.jobTitle}`}
                style={{ marginBottom: 12 }}
              >
                <Card
                  padding={14}
                  style={unread > 0 ? styles.cardUnread : undefined}
                >
                  <View style={styles.cardRow}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {initialsFromLabel(item.counterpartyLabel || "?")}
                      </Text>
                    </View>
                    <View style={styles.cardMid}>
                      <View style={styles.rowTop}>
                        <Text
                          style={[styles.counterparty, unread > 0 && styles.bold]}
                          numberOfLines={1}
                        >
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
                        <Text
                          style={[
                            styles.preview,
                            unread > 0 && styles.previewUnread,
                          ]}
                          numberOfLines={2}
                        >
                          {item.lastMessagePreview || ac("No messages yet")}
                        </Text>
                        {unread > 0 ? (
                          <View style={styles.badge}>
                            <Text style={styles.badgeText}>
                              {unread > 99 ? "99+" : unread}
                            </Text>
                          </View>
                        ) : (
                          <Icon
                            name="chevron-right"
                            size={16}
                            color={colors.muted}
                          />
                        )}
                      </View>
                    </View>
                  </View>
                </Card>
              </Pressable>
            </RiseIn>
          );
        }}
      />
    </GshScreenShell>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 8 },
  segmentTrack: {
    marginTop: 16,
    backgroundColor: "#e9ecf3",
    borderRadius: 14,
    padding: 4,
    flexDirection: "row",
    gap: 4,
  },
  segment: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentOn: {
    backgroundColor: colors.white,
    shadowColor: "#0d194e",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  segmentText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    color: colors.text2,
  },
  segmentTextOn: { color: colors.navy },
  loading: { paddingVertical: 48, alignItems: "center" },
  errorWrap: { paddingVertical: 32, gap: 12, alignItems: "center" },
  errorTitle: {
    fontFamily: fontFamily.headingStrong,
    fontSize: 18,
    color: colors.navy,
  },
  errorBody: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.text2,
    textAlign: "center",
  },
  cardUnread: {
    borderWidth: 1,
    borderColor: colors.unreadBorder,
    backgroundColor: colors.unreadBg,
  },
  cardRow: { flexDirection: "row", gap: 12 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 15,
    fontFamily: fontFamily.heading,
    color: colors.cyan,
  },
  cardMid: { flex: 1, minWidth: 0 },
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  counterparty: {
    flex: 1,
    fontSize: 16,
    fontFamily: fontFamily.heading,
    color: colors.navy,
    letterSpacing: -0.2,
  },
  bold: { fontFamily: fontFamily.headingStrong },
  when: {
    fontSize: 12,
    fontFamily: fontFamily.semiBold,
    color: colors.muted,
  },
  jobTitle: {
    marginTop: 2,
    fontSize: 13,
    fontFamily: fontFamily.semiBold,
    color: colors.text2,
  },
  previewRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  preview: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.regular,
    color: colors.muted,
  },
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
  badgeText: {
    fontSize: 11,
    fontFamily: fontFamily.extraBold,
    color: colors.cyan,
  },
  ghostHit: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  ghostText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    color: colors.navy,
    textDecorationLine: "underline",
  },
  signInHit: {
    marginTop: 8,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  signInText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    color: colors.navy,
    textDecorationLine: "underline",
  },
});
