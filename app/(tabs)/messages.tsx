import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshMessengerTip } from "@/components/gsh-ui-kit";
import { GshScreenShell } from "@/components/GshScreenShell";
import { fetchConversations } from "@/lib/api-client";
import { stackListLeadStyle } from "@/lib/screen-layout";
import { colors, feedCardStyle, fontFamily, radii } from "@/lib/theme";
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

  const listHeader = (
    <View style={styles.headerBlock}>
      <Text style={styles.listSubLead}>Chats with employers about your applications</Text>
      <GshMessengerTip>Reply once the employer messages you first.</GshMessengerTip>
    </View>
  );

  return (
    <GshScreenShell>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        {query.isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.brand} />
            <Text style={styles.muted}>Loading conversations…</Text>
          </View>
        ) : query.isError ? (
          <View style={styles.center}>
            <Ionicons name="alert-circle-outline" size={40} color={colors.error} />
            <Text style={styles.err}>Could not load messages.</Text>
            <Pressable onPress={() => void query.refetch()} accessibilityRole="button" accessibilityLabel="Retry loading messages">
              <Text style={styles.retry}>Try again</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={rows}
            keyExtractor={(item: ConversationSummary) => item._id}
            ListHeaderComponent={listHeader}
            refreshControl={<RefreshControl refreshing={query.isFetching} onRefresh={() => query.refetch()} />}
            contentContainerStyle={styles.listPad}
            renderItem={({ item }) => (
              <Pressable
                style={[styles.card, feedCardStyle()]}
                onPress={() => router.push(`/conversation/${item._id}`)}
                accessibilityRole="button"
              >
                <View style={styles.cardAccent} />
                <View style={styles.cardInner}>
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
                    <Ionicons name="chevron-forward" size={18} color={colors.brand} />
                  </View>
                </View>
              </Pressable>
            )}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="chatbubbles-outline" size={40} color={colors.brand} />
                </View>
                <Text style={styles.empty}>No messages yet</Text>
                <Text style={styles.emptySub}>Employers can message you about roles you've applied for. Conversations appear here when they start.</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </GshScreenShell>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  headerBlock: { marginBottom: 8, paddingHorizontal: 16, paddingTop: 8 },
  listSubLead: { fontSize: 14, fontFamily: fontFamily.regular, color: "rgba(255,255,255,0.55)", lineHeight: 20, marginBottom: 10 },
  listPad: { paddingHorizontal: 16, paddingBottom: 24, gap: 10 },
  card: { flexDirection: "row", borderRadius: radii.lg, overflow: "hidden" },
  cardAccent: { width: 4, backgroundColor: colors.purple },
  cardInner: { flex: 1, padding: 16 },
  rowTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  counterparty: { flex: 1, fontSize: 16, fontFamily: fontFamily.bold, color: colors.navy },
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
  retry: { color: colors.brand, fontFamily: fontFamily.semiBold, fontSize: 16, marginTop: 4 },
  emptyWrap: { alignItems: "center", marginTop: 28, paddingHorizontal: 24, gap: 10 },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.purpleMuted,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.purpleBorder,
  },
  empty: { fontFamily: fontFamily.bold, fontSize: 18, color: colors.white },
  emptySub: {
    textAlign: "center",
    color: "rgba(255,255,255,0.55)",
    fontFamily: fontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
  },
});
