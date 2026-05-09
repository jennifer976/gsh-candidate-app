import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Linking from "expo-linking";
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
import {
  dismissAppNotification,
  fetchNotificationFeed,
  markAllAppNotificationsRead,
  markAppNotificationRead,
} from "@/lib/api-client";
import { getMarketingSiteUrl } from "@/lib/config";
import type { AppNotificationDto } from "@/types/models";

function openNotificationLink(href: string | undefined, router: ReturnType<typeof useRouter>) {
  if (!href?.trim()) return;
  const h = href.trim();
  if (/^https?:\/\//i.test(h)) {
    void Linking.openURL(h);
    return;
  }
  const jobMatch = h.match(/\/jobs?\/?([^/?#]+)/i);
  if (jobMatch?.[1] && jobMatch[1].length > 8) {
    router.push(`/job/${jobMatch[1]}`);
    return;
  }
  const site = getMarketingSiteUrl();
  void Linking.openURL(h.startsWith("/") ? `${site}${h}` : `${site}/${h}`);
}

export default function NotificationFeedScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [older, setOlder] = useState<AppNotificationDto[]>([]);
  const [nextBefore, setNextBefore] = useState<string | null>(null);

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
    if (!before) return;
    const more = await fetchNotificationFeed({
      unreadOnly: filter === "unread",
      limit: 25,
      before,
    });
    setOlder((prev) => [...prev, ...more.data]);
    setNextBefore(more.nextCursor);
  }

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <View style={styles.filters}>
        <Pressable style={[styles.chip, filter === "all" && styles.chipOn]} onPress={() => setFilter("all")}>
          <Text style={[styles.chipText, filter === "all" && styles.chipTextOn]}>All</Text>
        </Pressable>
        <Pressable style={[styles.chip, filter === "unread" && styles.chipOn]} onPress={() => setFilter("unread")}>
          <Text style={[styles.chipText, filter === "unread" && styles.chipTextOn]}>Unread</Text>
        </Pressable>
        <Pressable style={styles.markAll} onPress={() => markAll.mutate()} disabled={markAll.isPending}>
          <Text style={styles.markAllText}>Mark all read</Text>
        </Pressable>
      </View>

      {baseQuery.isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => item._id}
          refreshControl={<RefreshControl refreshing={baseQuery.isFetching} onRefresh={() => baseQuery.refetch()} />}
          contentContainerStyle={styles.listPad}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.card, !item.read && styles.unread]}
              onPress={() => {
                if (!item.read) markRead.mutate(item._id);
                openNotificationLink(item.link, router);
              }}
            >
              <Text style={styles.title}>{item.title}</Text>
              {item.body ? <Text style={styles.body}>{item.body}</Text> : null}
              <Text style={styles.date}>{new Date(item.createdAt).toLocaleString()}</Text>
              <Pressable
                style={styles.dismiss}
                onPress={(e) => {
                  e.stopPropagation?.();
                  dismiss.mutate(item._id);
                }}
              >
                <Text style={styles.dismissText}>Dismiss</Text>
              </Pressable>
            </Pressable>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No notifications yet.</Text>}
          ListFooterComponent={
            nextBefore ? (
              <Pressable style={styles.loadMore} onPress={() => void loadMore()}>
                <Text style={styles.loadMoreText}>Load older</Text>
              </Pressable>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f8fafc" },
  filters: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  chipOn: { backgroundColor: "#4f46e5", borderColor: "#4f46e5" },
  chipText: { fontSize: 14, fontWeight: "600", color: "#475569" },
  chipTextOn: { color: "#fff" },
  markAll: { marginLeft: "auto" },
  markAllText: { color: "#4f46e5", fontWeight: "700", fontSize: 14 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  listPad: { paddingHorizontal: 16, paddingBottom: 32 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  unread: { borderColor: "#a5b4fc", backgroundColor: "#eef2ff" },
  title: { fontSize: 16, fontWeight: "700", color: "#0f172a" },
  body: { marginTop: 6, fontSize: 14, color: "#475569", lineHeight: 20 },
  date: { marginTop: 8, fontSize: 12, color: "#94a3b8" },
  dismiss: { alignSelf: "flex-end", marginTop: 8 },
  dismissText: { fontSize: 13, color: "#b91c1c", fontWeight: "600" },
  empty: { textAlign: "center", color: "#64748b", marginTop: 40 },
  loadMore: { alignItems: "center", paddingVertical: 16 },
  loadMoreText: { color: "#4f46e5", fontWeight: "700", fontSize: 15 },
});
