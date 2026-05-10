import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { fetchConversations } from "@/lib/api-client";
import { cardSurfaceStyle, colors, fontFamily } from "@/lib/theme";
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
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <View style={styles.leadCard}>
          <Ionicons name="information-circle-outline" size={22} color={colors.brand} style={styles.leadIcon} />
          <Text style={styles.lead}>
            Employers message you about applications here. You can reply after they send the first message.
          </Text>
        </View>
        {query.isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.brand} />
            <Text style={styles.muted}>Loading conversations…</Text>
          </View>
        ) : query.isError ? (
          <View style={styles.center}>
            <Ionicons name="alert-circle-outline" size={40} color={colors.error} />
            <Text style={styles.err}>Could not load messages.</Text>
          </View>
        ) : (
          <FlatList
            data={rows}
            keyExtractor={(item: ConversationSummary) => item._id}
            refreshControl={<RefreshControl refreshing={query.isFetching} onRefresh={() => query.refetch()} />}
            contentContainerStyle={styles.listPad}
            renderItem={({ item }) => (
              <Pressable
                style={[styles.card, cardSurfaceStyle(true)]}
                onPress={() => router.push(`/conversation/${item._id}`)}
                accessibilityRole="button"
              >
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
                <View style={styles.cardFoot}>
                  <Text style={styles.open}>Open thread</Text>
                  <Ionicons name="chevron-forward" size={18} color={colors.teal} />
                </View>
              </Pressable>
            )}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Ionicons name="chatbubbles-outline" size={48} color={colors.borderStrong} />
                <Text style={styles.empty}>No conversations yet</Text>
                <Text style={styles.emptySub}>When an employer messages you, it will show up here.</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  leadCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginHorizontal: 16,
    marginTop: 8,
    padding: 14,
    borderRadius: 14,
    backgroundColor: colors.purpleMuted,
    borderWidth: 1,
    borderColor: colors.purpleBorder,
  },
  leadIcon: { marginTop: 2 },
  lead: {
    flex: 1,
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.purpleTextDark,
    lineHeight: 20,
  },
  listPad: { paddingHorizontal: 16, paddingBottom: 24, gap: 10 },
  card: { padding: 16 },
  rowTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  counterparty: { flex: 1, fontSize: 16, fontFamily: fontFamily.bold, color: colors.textPrimary },
  when: { fontSize: 12, fontFamily: fontFamily.medium, color: colors.placeholder },
  jobTitle: { marginTop: 8, fontSize: 14, fontFamily: fontFamily.semiBold, color: colors.brand },
  preview: { marginTop: 6, fontSize: 14, fontFamily: fontFamily.regular, color: colors.textMuted, lineHeight: 20 },
  cardFoot: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 12,
    gap: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceMuted,
  },
  open: { fontSize: 13, fontFamily: fontFamily.semiBold, color: colors.brand },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, gap: 12 },
  muted: { color: colors.textMuted, fontSize: 15, fontFamily: fontFamily.medium },
  err: { color: colors.error, textAlign: "center", fontFamily: fontFamily.medium },
  emptyWrap: { alignItems: "center", marginTop: 40, paddingHorizontal: 24, gap: 8 },
  empty: { fontFamily: fontFamily.semiBold, fontSize: 17, color: colors.textPrimary },
  emptySub: {
    textAlign: "center",
    color: colors.textMuted,
    fontFamily: fontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
  },
});
