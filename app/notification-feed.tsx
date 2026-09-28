import { withSignIn } from "@/components/SignInGate";
import {useAppLanguage, toIntlLocale} from "@/lib/i18n";
import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { Ionicons } from "@expo/vector-icons";
import {
  useMutation,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshScreenIntro } from "@/components/gsh-ui-kit";
import { GshScreenShell } from "@/components/GshScreenShell";
import {
  dismissAppNotification,
  fetchNotificationFeed,
  markAllAppNotificationsRead,
  markAppNotificationRead,
} from "@/lib/api-client";
import { navigateFromPushLink } from "@/lib/pushNavigate";
import { stackFlatListHeadWrapStyle } from "@/lib/screen-layout";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";

function NotificationFeedScreen() {
  const ac = useAccountCopy();
  const locale = toIntlLocale(useAppLanguage((s) => s.locale));

  const router = useRouter();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const baseQuery = useInfiniteQuery({
    queryKey: ["notifications-feed", filter],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      fetchNotificationFeed({
        unreadOnly: filter === "unread",
        limit: 25,
        before: pageParam,
      }),
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  });
  const rows = useMemo(() => {
    const seen = new Set<string>();
    return (baseQuery.data?.pages.flatMap((page) => page.data) ?? []).filter(
      (item) => {
        if (seen.has(item._id)) return false;
        seen.add(item._id);
        return true;
      },
    );
  }, [baseQuery.data]);
  const nextBefore = baseQuery.hasNextPage;
  const loadMorePending = baseQuery.isFetchingNextPage;
  const loadMoreError = baseQuery.isFetchNextPageError
    ? ac("Older updates could not be loaded. Try again.")
    : null;
  const actionError = () =>
    Alert.alert(
      ac("Update not saved"),
      ac(
        "We could not confirm the change. Refresh your updates before trying again.",
      ),
    );

  const markRead = useMutation({
    mutationFn: markAppNotificationRead,
    onError: actionError,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["notifications-feed"] });
      void qc.invalidateQueries({ queryKey: ["notifications-unread"] });
    },
  });

  const markAll = useMutation({
    mutationFn: markAllAppNotificationsRead,
    onError: actionError,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["notifications-feed"] });
      void qc.invalidateQueries({ queryKey: ["notifications-unread"] });
    },
  });

  const dismiss = useMutation({
    mutationFn: dismissAppNotification,
    onError: actionError,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["notifications-feed"] });
      void qc.invalidateQueries({ queryKey: ["notifications-unread"] });
    },
  });

  async function loadMore() {
    if (baseQuery.hasNextPage && !baseQuery.isFetching)
      await baseQuery.fetchNextPage();
  }

  const listHeader = (
    <View style={styles.headWrap}>
      <GshScreenIntro
        eyebrow={ac("Your account")}
        title={ac("Your updates")}
        subtitle={ac("Keep up with applications, employers and your account.")}
        style={{ marginBottom: 12 }}
      />
      <View style={styles.filters}>
        <Pressable
          style={[styles.chip, filter === "all" && styles.chipOn]}
          onPress={() => setFilter("all")}
          accessibilityRole="button"
          accessibilityState={{ selected: filter === "all" }}
        >
          <Text
            style={[styles.chipText, filter === "all" && styles.chipTextOn]}
          >
            {ac("All")}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.chip, filter === "unread" && styles.chipOn]}
          onPress={() => setFilter("unread")}
          accessibilityRole="button"
          accessibilityState={{ selected: filter === "unread" }}
        >
          <Text
            style={[styles.chipText, filter === "unread" && styles.chipTextOn]}
          >
            {ac("Unread")}
          </Text>
        </Pressable>
        <Pressable
          style={styles.markAll}
          onPress={() => markAll.mutate()}
          disabled={markAll.isPending || rows.length === 0}
          accessibilityRole="button"
          accessibilityState={{
            disabled: markAll.isPending || rows.length === 0,
            busy: markAll.isPending,
          }}
        >
          <Text style={styles.markAllText}>{ac("Mark all as read")}</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <GshScreenShell constrainTabletWidth>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        {baseQuery.isLoading ? (
          <>
            {listHeader}
            <View style={styles.center}>
              <ActivityIndicator size="large" color={colors.brand} />
            </View>
          </>
        ) : baseQuery.isError && !baseQuery.data ? (
          <>
            {listHeader}
            <View style={styles.errorWrap}>
              <Ionicons
                name="cloud-offline-outline"
                size={44}
                color={colors.textMuted}
              />
              <Text style={styles.errTitle}>
                {ac("Notifications could not be loaded")}
              </Text>
              <Text style={styles.errSub}>
                {ac("Check your connection and try again.")}
              </Text>
              <Pressable
                style={styles.retryBtn}
                onPress={() => void baseQuery.refetch()}
                accessibilityRole="button"
                accessibilityLabel={ac("Try again")}
              >
                <Text style={styles.retryBtnText}>{ac("Try again")}</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <FlatList
            data={rows}
            keyExtractor={(item) => item._id}
            refreshControl={
              <RefreshControl
                refreshing={
                  baseQuery.isRefetching && !baseQuery.isFetchingNextPage
                }
                onRefresh={() => baseQuery.refetch()}
              />
            }
            contentContainerStyle={[
              styles.listPad,
              rows.length === 0 && styles.listPadEmpty,
            ]}
            ListHeaderComponent={listHeader}
            renderItem={({ item }) => (
              <Pressable
                style={[
                  cardSurfaceStyle(true),
                  styles.card,
                  !item.read && styles.unread,
                ]}
                onPress={() => {
                  if (!item.read) markRead.mutate(item._id);
                  const link = item.link?.trim();
                  if (link) navigateFromPushLink(router, link);
                }}
              >
                <Text style={styles.title}>{item.title}</Text>
                {item.body ? (
                  <Text style={styles.body}>{item.body}</Text>
                ) : null}
                <Text style={styles.date}>
                  {new Date(item.createdAt).toLocaleString(locale)}
                </Text>
                <Pressable
                  style={styles.dismiss}
                  disabled={dismiss.isPending}
                  accessibilityState={{ disabled: dismiss.isPending }}
                  hitSlop={10}
                  onPress={(e) => {
                    e.stopPropagation?.();
                    dismiss.mutate(item._id);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={ac("Dismiss notification")}
                >
                  <Text style={styles.dismissText}>{ac("Dismiss")}</Text>
                </Pressable>
              </Pressable>
            )}
            ListEmptyComponent={
              <View style={[styles.emptyCard, cardSurfaceStyle(false)]}>
                <Text style={styles.empty}>
                  {filter === "unread"
                    ? ac("You are up to date. No unread updates.")
                    : ac(
                        "No updates yet. Application and account updates will appear here.",
                      )}
                </Text>
              </View>
            }
            ListFooterComponent={
              nextBefore ? (
                loadMorePending ? (
                  <View
                    style={styles.loadMore}
                    accessibilityLabel={ac("Loading older notifications")}
                  >
                    <ActivityIndicator size="small" color={colors.brand} />
                  </View>
                ) : loadMoreError ? (
                  <View style={styles.loadMoreErrWrap}>
                    <Text style={styles.loadMoreErrText}>{loadMoreError}</Text>
                    <Pressable
                      style={styles.loadMoreRetry}
                      onPress={() => void loadMore()}
                      accessibilityRole="button"
                      accessibilityLabel={ac("Try again")}
                    >
                      <Text style={styles.loadMoreRetryText}>
                        {ac("Try again")}
                      </Text>
                    </Pressable>
                  </View>
                ) : (
                  <Pressable
                    style={styles.loadMore}
                    onPress={() => void loadMore()}
                    accessibilityRole="button"
                    accessibilityLabel={ac("Load older notifications")}
                  >
                    <Text style={styles.loadMoreText}>
                      {ac("Load older notifications")}
                    </Text>
                  </Pressable>
                )
              ) : null
            }
          />
        )}
      </SafeAreaView>
    </GshScreenShell>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  headWrap: stackFlatListHeadWrapStyle,
  filters: {
    flexWrap: "wrap",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radii.pill,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipOn: {
    backgroundColor: colors.chipOnBg,
    borderColor: colors.chipOnBorder,
  },
  chipText: {
    fontSize: 14,
    fontFamily: fontFamily.semiBold,
    color: colors.textSecondary,
  },
  chipTextOn: { color: colors.white },
  markAll: { marginLeft: "auto", paddingVertical: 8, paddingHorizontal: 4 },
  markAllText: {
    color: colors.brand,
    fontFamily: fontFamily.bold,
    fontSize: 14,
  },
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
    borderRadius: radii.pill,
    backgroundColor: colors.brand,
  },
  retryBtnText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    color: colors.white,
  },
  listPad: { paddingHorizontal: 16, paddingBottom: 32 },
  listPadEmpty: { flexGrow: 1 },
  card: {
    padding: 16,
    marginBottom: 12,
    borderRadius: radii.lg,
    backgroundColor: colors.background,
  },
  unread: {
    borderColor: colors.unreadBorder,
    backgroundColor: colors.unreadBg,
  },
  title: { fontSize: 17, fontFamily: fontFamily.heading, color: colors.navy },
  body: {
    marginTop: 6,
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  date: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: fontFamily.regular,
    color: colors.placeholder,
  },
  dismiss: {
    alignSelf: "flex-end",
    marginTop: 8,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  dismissText: {
    fontSize: 13,
    color: colors.error,
    fontFamily: fontFamily.semiBold,
  },
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
  loadMoreText: {
    color: colors.brand,
    fontFamily: fontFamily.bold,
    fontSize: 15,
  },
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
    borderRadius: radii.pill,
    backgroundColor: colors.brand,
  },
  loadMoreRetryText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    color: colors.white,
  },
});

export default withSignIn(NotificationFeedScreen, {
  icon: "notifications-outline",
  title: "Your notifications",
  body: "Sign in to see updates on your applications, messages and alerts.",
});
