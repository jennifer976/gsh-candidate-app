import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { useAppCopy, useAppLanguage } from "@/lib/i18n";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GshMessengerTip } from "@/components/gsh-ui-kit";
import { GshScreenShell } from "@/components/GshScreenShell";
import { GshTabStickyHeader } from "@/components/GshTabStickyHeader";
import { brandMark } from "@/lib/brand-assets";
import { fetchConversations } from "@/lib/api-client";
import { colors, fontFamily, radii } from "@/lib/theme";
import type { ConversationSummary } from "@/types/models";

function formatWhen(iso: string, locale: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(locale, { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

function initialsFromLabel(label: string): string {
  const parts = label.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export default function MessagesScreen() {
  const ac = useAccountCopy();
  const { t } = useAppCopy();
  const locale = useAppLanguage((s) => s.locale);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const query = useQuery({
    queryKey: ["message-conversations"],
    queryFn: fetchConversations,
  });

  const rows = query.data ?? [];

  if (query.isLoading) {
    return (
      <GshScreenShell constrainTabletWidth style={styles.shell}>
        <GshTabStickyHeader
          title={t("messages")}
          subtitle={ac("Messages about your job search")}
          paddingTop={Math.max(insets.top, 12) + 4}
        />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.cyan} />
          <Text style={styles.muted}>{ac("Loading conversations…")}</Text>
        </View>
      </GshScreenShell>
    );
  }

  if (query.isError) {
    return (
      <GshScreenShell constrainTabletWidth style={styles.shell}>
        <GshTabStickyHeader
          title={t("messages")}
          subtitle={ac("Messages about your job search")}
          paddingTop={Math.max(insets.top, 12) + 4}
        />
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={40} color={colors.error} />
          <Text style={styles.err}>{ac("Could not load messages.")}</Text>
          <Pressable
            onPress={() => void query.refetch()}
            accessibilityRole="button"
            style={styles.retryBtn}
          >
            <Text style={styles.retryBtnText}>{ac("Try again")}</Text>
          </Pressable>
        </View>
      </GshScreenShell>
    );
  }

  return (
    <GshScreenShell constrainTabletWidth style={styles.shell}>
      <GshTabStickyHeader
        title={t("messages")}
        subtitle={ac("Messages about your job search")}
        paddingTop={Math.max(insets.top, 12) + 4}
      />
      <FlatList
        data={rows}
        keyExtractor={(item: ConversationSummary) => item.id ?? item._id}
        style={styles.listFlex}
        ListHeaderComponent={
          <View style={styles.tipWrap}>
            <GshMessengerTip>
              {ac("Reply when an employer or agency starts a conversation.")}
            </GshMessengerTip>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={query.isFetching}
            onRefresh={() => query.refetch()}
            tintColor={colors.cyan}
          />
        }
        contentContainerStyle={[
          styles.listPad,
          rows.length === 0 && styles.listPadGrow,
        ]}
        renderItem={({ item }) => {
          const unread = Math.max(
            0,
            item.unreadCount ?? (item.read === false ? 1 : 0),
          );
          return (
            <Pressable
              style={[styles.card, unread > 0 && styles.cardUnread]}
              onPress={() =>
                router.push(`/conversation/${item.id ?? item._id}`)
              }
              accessibilityRole="button"
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {initialsFromLabel(item.counterpartyLabel || "?")}
                </Text>
              </View>
              <View style={styles.cardMid}>
                <View style={styles.rowTop}>
                  <Text style={styles.counterparty} numberOfLines={1}>
                    {item.counterpartyLabel}
                  </Text>
                  <Text style={styles.when}>
                    {formatWhen(item.lastMessageAt, locale)}
                  </Text>
                </View>
                <Text style={styles.jobTitle} numberOfLines={1}>
                  {item.jobTitle}
                </Text>
                <Text style={styles.preview} numberOfLines={2}>
                  {item.lastMessagePreview || ac("No messages yet")}
                </Text>
                <View style={styles.cardFoot}>
                  {unread > 0 ? (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadBadgeText}>
                        {unread > 99 ? "99+" : unread}
                      </Text>
                    </View>
                  ) : (
                    <View />
                  )}
                  <View style={styles.openRow}>
                    <Text style={styles.open}>{ac("Open conversation")}</Text>
                    <View style={styles.openArrow}>
                      <Ionicons name="arrow-forward" size={14} color={colors.navy} />
                    </View>
                  </View>
                </View>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <View style={styles.emptyMarkWell}>
              <Image source={brandMark} style={styles.emptyMark} resizeMode="contain" />
            </View>
            <Text style={styles.empty}>{ac("No messages yet")}</Text>
            <Text style={styles.emptySub}>
              {ac(
                "Your conversations will appear here. Manage who can find and contact you in your profile.",
              )}
            </Text>
            <Pressable
              style={styles.emptyCta}
              onPress={() => router.push("/(tabs)/profile")}
              accessibilityRole="button"
            >
              <Text style={styles.emptyCtaText}>{t("profile")}</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.navy} />
            </Pressable>
          </View>
        }
      />
    </GshScreenShell>
  );
}

const styles = StyleSheet.create({
  shell: { backgroundColor: colors.pale },
  listFlex: { flex: 1 },
  tipWrap: { marginBottom: 4 },
  listPad: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40, gap: 12 },
  listPadGrow: { flexGrow: 1 },
  card: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  cardUnread: {
    borderColor: colors.unreadBorder,
    backgroundColor: colors.unreadBg,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 16,
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
  when: {
    fontSize: 12,
    fontFamily: fontFamily.medium,
    color: colors.placeholder,
  },
  jobTitle: {
    marginTop: 4,
    fontSize: 13,
    fontFamily: fontFamily.semiBold,
    color: colors.textSecondary,
  },
  preview: {
    marginTop: 6,
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    lineHeight: 20,
  },
  cardFoot: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    gap: 8,
  },
  unreadBadge: {
    minWidth: 22,
    alignItems: "center",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radii.pill,
    backgroundColor: colors.cyan,
  },
  unreadBadgeText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: colors.navy,
  },
  openRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  open: { fontSize: 13, fontFamily: fontFamily.bold, color: colors.navy },
  openArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.cyan,
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 12,
  },
  muted: {
    color: colors.textMuted,
    fontSize: 15,
    fontFamily: fontFamily.medium,
  },
  err: {
    color: colors.error,
    textAlign: "center",
    fontFamily: fontFamily.medium,
  },
  retryBtn: {
    marginTop: 4,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: radii.pill,
    backgroundColor: colors.navy,
  },
  retryBtnText: {
    color: colors.white,
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
  },
  emptyWrap: {
    alignItems: "center",
    marginTop: 36,
    paddingHorizontal: 24,
    gap: 10,
  },
  emptyMarkWell: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyMark: { width: 40, height: 40 },
  empty: {
    fontFamily: fontFamily.heading,
    fontSize: 18,
    color: colors.navy,
    textAlign: "center",
  },
  emptySub: {
    textAlign: "center",
    color: colors.textMuted,
    fontFamily: fontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
  },
  emptyCta: {
    marginTop: 8,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: radii.pill,
    backgroundColor: colors.cyan,
  },
  emptyCtaText: {
    fontSize: 15,
    fontFamily: fontFamily.bold,
    color: colors.navy,
  },
});
