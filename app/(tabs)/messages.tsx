import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchConversations } from "@/lib/api-client";
import type { ConversationSummary } from "@/types/models";

function formatWhen(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export default function MessagesScreen() {
  const router = useRouter();

  const query = useQuery({
    queryKey: ["message-conversations"],
    queryFn: fetchConversations,
  });

  const rows = query.data ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <Text style={styles.lead}>
        Employers message you about applications here. You can reply after they send the first message.
      </Text>
      {query.isLoading ? (
        <View style={styles.center}>
          <Text style={styles.muted}>Loading conversations…</Text>
        </View>
      ) : query.isError ? (
        <View style={styles.center}>
          <Text style={styles.err}>Could not load messages.</Text>
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item: ConversationSummary) => item._id}
          refreshControl={<RefreshControl refreshing={query.isFetching} onRefresh={() => query.refetch()} />}
          contentContainerStyle={styles.listPad}
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => router.push(`/conversation/${item._id}`)}>
              <View style={styles.rowTop}>
                <Text style={styles.counterparty} numberOfLines={1}>
                  {item.counterpartyLabel}
                </Text>
                <Text style={styles.when}>{formatWhen(item.lastMessageAt)}</Text>
              </View>
              <Text style={styles.jobTitle} numberOfLines={1}>
                {item.jobTitle}
              </Text>
              <Text style={styles.preview} numberOfLines={2}>
                {item.lastMessagePreview || "No messages yet"}
              </Text>
            </Pressable>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>No conversations yet. When an employer messages you, it will show up here.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f8fafc" },
  lead: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
  },
  listPad: { paddingHorizontal: 16, paddingBottom: 24, gap: 10 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  rowTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  counterparty: { flex: 1, fontSize: 16, fontWeight: "700", color: "#0f172a" },
  when: { fontSize: 12, color: "#94a3b8" },
  jobTitle: { marginTop: 6, fontSize: 14, fontWeight: "600", color: "#4f46e5" },
  preview: { marginTop: 6, fontSize: 14, color: "#64748b", lineHeight: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  muted: { color: "#64748b", fontSize: 15 },
  err: { color: "#b91c1c", textAlign: "center" },
  empty: { textAlign: "center", color: "#64748b", marginTop: 40, paddingHorizontal: 24, fontSize: 15, lineHeight: 22 },
});
