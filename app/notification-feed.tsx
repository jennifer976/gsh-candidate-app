import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshScreenIntro } from "@/components/gsh-ui-kit";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import {
  dismissAppNotification,
  fetchNotificationFeed,
  markAllAppNotificationsRead,
  markAppNotificationRead,
} from "@/lib/api-client";
import { navigateFromPushLink } from "@/lib/pushNavigate";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";
import type { AppNotificationDto } from "@/types/models";

export default function NotificationFeedScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [older, setOlder] = useState<AppNotificationDto[]>([]);
  const [nextBefore, setNextBefore] = useState<string | null>(null);
  const [loadMorePending, setLoadMorePending] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);

  const baseQuery = useQuery({
    queryKey: ["notifications-feed", filter],
    queryFn: () =>
      fetchNotificationFeed({
        unreadOnly: filter === "unread",
        limit: 25,
      }),
  });

  useEffect(() => {
    setOlder([]);
    setNextBefore(null);
    setLoadMoreError(null);
    setLoadMorePending(false);
  }, [filter]);

  useEffect(() => {
    if (baseQuery.data?.nextCursor !== undefined) setNextBefore(baseQuery.data.nextCursor);
  }, [baseQuery.data?.nextCursor]);

  const rows = useMemo(() => {
    const first = baseQuery.data?.data ?? [];
    const seen = new Set(first.map((x) => x._id));
    const rest = older.filter((o) => !seen.has(o._id));
    return [...first, ...rest];
  }, [baseQuery.data?.data, older]);

  const markRead = useMutation({
    mutationFn: markAppNotificationRead,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["notifications-feed"] });
      void qc.invalidateQueries({ queryKey: ["notifications-unread"] });
    },
  });

  const markAll = useMutation({
    mutationFn: markAllAppNotificationsRead,
    onSuccess: () => {
      setOlder([]);
      void qc.invalidateQueries({ queryKey: ["notifications-feed"] });
      void qc.invalidateQueries({ queryKey: ["notifications-unread"] });
    },
  });

  const dismiss = useMutation({
    mutationFn: dismissAppNotification,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["notifications-feed"] });
      void qc.invalidateQueries({ queryKey: ["notifications-unread"] });
    },
  });

  async function loadMore() {
    const before = nextBefore || baseQuery.data?.nextCursor;
    if (!before || loadMorePending) return;
    setLoadMorePending(true);
    setLoadMoreError(null);
    try {
      const more = await fetchNotificationFeed({
        unreadOnly: filter === "unread",
        limit: 25,
        before,
      });
      setOlder((prev) => [...prev, ...more.data]);
      setNextBefore(more.nextCursor);
    } catch (e: unknown) {
      let msg = "Could not load older notifications.";
      if (e && typeof e === "object" && "message" in e) msg = String((e as { message: string }).message);
      else if (e instanceof Error) msg = e.message;
      setLoadMoreError(msg);
    } finally {
      setLoadMorePending(false);
    }
  }

  const listHeader = (
    <View style={styles.headWrap}>
      <GshScreenIntro
        eyebrow="Global Sponsor Hub"
        title="Notification inbox"
        subtitle="Updates from applications, employers, and your account. Items with links open inside the app — same routing as push notifications."
        style={{ marginBottom: 12 }}
      />
      <View style={styles.filters}>
        <Pressable
          style={[styles.chip, filter === "all" && styles.chipOn]}
          onPress={() => setFilter("all")}
          accessibilityRole="button"
          accessibilityState={{ selected: filter === "all" }}
        >
          <Text style={[styles.chipText, filter === "all" && styles.chipTextOn]}>All</Text>
        </Pressable>
        <Pressable
          style={[styles.chip, filter === "unread" && styles.chipOn]}
          onPress={() => setFilter("unread")}
          accessibilityRole="button"
          accessibilityState={{ selected: filter === "unread" }}
        >
          <Text style={[styles.chipText, filter === "unread" && styles.chipTextOn]}>Unread</Text>
        </Pressable>
        <Pressable style={styles.markAll} onPress={() => markAll.mutate()} disabled={markAll.isPending}>
          <Text style={styles.markAllText}>Mark all read</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        {baseQuery.isLoading ? (
          <>
            {listHeader}
            <View style={styles.center}>
              <ActivityIndicator size="large" color={colors.brand} />
            </View>
          </>
        ) : baseQuery.isError ? (
          <>
            {listHeader}
            <View style={styles.errorWrap}>
              <Ionicons name="cloud-offline-outline" size={44} color={colors.textMuted} />
              <Text style={styles.errTitle}>Notifications could not be loaded</Text>
              <Text style={styles.errSub}>Check your connection and try again.</Text>
              <Pressable
                style={styles.retryBtn}
                onPress={() => void baseQuery.refetch()}
                accessibilityRole="button"
                accessibilityLabel="Retry loading notifications"
              >
                <Text style={styles.retryBtnText}>Try again</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <FlatList
            data={rows}
            keyExtractor={(item) => item._id}
            refreshControl={<RefreshControl refreshing={baseQuery.isFetching} onRefresh={() => baseQuery.refetch()} />}
            contentContainerStyle={[styles.listPad, rows.length === 0 && styles.listPadEmpty]}
            ListHeaderComponent={listHeader}
            renderItem={({ item }) => (
              <Pressable
                style={[cardSurfaceStyle(true), styles.card, !item.read && styles.unread]}
                onPress={() => {
                  if (!item.read) markRead.mutate(item._id);
                  const link = item.link?.trim();
                  if (link) navigateFromPushLink(router, link);
                }}
              >
                <Text style={styles.title}>{item.title}</Text>
                {item.body ? <Text style={styles.body}>{item.body}</Text> : null}
                <Text style={styles.date}>{new Date(item.createdAt).toLocaleString()}</Text>
                <Pressable
                  style={styles.dismiss}
                  hitSlop={10}
                  onPress={(e) => {
                    e.stopPropagation?.();
                    dismiss.mutate(item._id);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Dismiss notification"
                >
                  <Text style={styles.dismissText}>Dismiss</Text>
                </Pressable>
              </Pressable>
            )}
            ListEmptyComponent={
              <View style={[styles.emptyCard, cardSurfaceStyle(false)]}>
                <Text style={styles.empty}>No notifications yet.</Text>
              </View>
            }
            ListFooterComponent={
              nextBefore ? (
                loadMorePending ? (
                  <View style={styles.loadMore} accessibilityLabel="Loading older notifications">
                    <ActivityIndicator size="small" color={colors.brand} />
                  </View>
                ) : loadMoreError ? (
                  <View style={styles.loadMoreErrWrap}>
                    <Text style={styles.loadMoreErrText}>{loadMoreError}</Text>
                    <Pressable
                      style={styles.loadMoreRetry}
                      onPress={() => void loadMore()}
                      accessibilityRole="button"
                      accessibilityLabel="Retry loading older notifications"
                    >
                      <Text style={styles.loadMoreRetryText}>Try again</Text>
                    </Pressable>
                  </View>
                ) : (
                  <Pressable
                    style={styles.loadMore}
                    onPress={() => void loadMore()}
                    accessibilityRole="button"
                    accessibilityLabel="Load older notifications"
                  >
                    <Text style={styles.loadMoreText}>Load older</Text>
                  </Pressable>
                )
              ) : null
            }
          />
        )}
      </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  headWrap: { paddingHorizontal: 16, paddingBottom: 12 },
  filters: { flexDirection: "row", alignItems: "center", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radii.pill,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipOn: { backgroundColor: colors.chipOnBg, borderColor: colors.chipOnBorder },
  chipText: { fontSize: 14, fontFamily: fontFamily.semiBold, color: colors.textSecondary },
  chipTextOn: { color: colors.white },
  markAll: { marginLeft: "auto", paddingVertical: 8, paddingHorizontal: 4 },
  markAllText: { color: colors.brand, fontFamily: fontFamily.bold, fontSize: 14 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
    paddingVertical: 24,
    gap: 10,
  },
  errTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: 17,
    color: colors.textPrimary,
    textAlign: "center",
  },
  errSub: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  retryBtn: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: radii.md,
    backgroundColor: colors.brand,
  },
  retryBtnText: { fontFamily: fontFamily.semiBold, fontSize: 15, color: colors.white },
  listPad: { paddingHorizontal: 16, paddingBottom: 32 },
  listPadEmpty: { flexGrow: 1 },
  card: {
    padding: 16,
    marginBottom: 12,
    borderRadius: radii.lg,
    backgroundColor: colors.background,
  },
  unread: { borderColor: colors.unreadBorder, backgroundColor: colors.unreadBg },
  title: { fontSize: 16, fontFamily: fontFamily.bold, color: colors.navy },
  body: { marginTop: 6, fontSize: 14, fontFamily: fontFamily.regular, color: colors.textSecondary, lineHeight: 20 },
  date: { marginTop: 8, fontSize: 12, fontFamily: fontFamily.regular, color: colors.placeholder },
  dismiss: { alignSelf: "flex-end", marginTop: 8 },
  dismissText: { fontSize: 13, color: colors.error, fontFamily: fontFamily.semiBold },
  emptyCard: {
    paddingVertical: 28,
    paddingHorizontal: 16,
    marginTop: 8,
    marginHorizontal: 16,
    backgroundColor: colors.background,
  },
  empty: {
    textAlign: "center",
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  loadMore: { alignItems: "center", paddingVertical: 18 },
  loadMoreText: { color: colors.brand, fontFamily: fontFamily.bold, fontSize: 15 },
  loadMoreErrWrap: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: "center",
    gap: 10,
  },
  loadMoreErrText: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  loadMoreRetry: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: radii.md,
    backgroundColor: colors.brand,
  },
  loadMoreRetryText: { fontFamily: fontFamily.semiBold, fontSize: 14, color: colors.white },
});
