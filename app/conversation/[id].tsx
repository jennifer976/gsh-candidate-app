import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { fetchThreadMessages, sendThreadMessage } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import { colors, fontFamily, radii } from "@/lib/theme";
import { authUserId, type ThreadMessage } from "@/types/models";

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const conversationId = String(id || "").trim();
  const router = useRouter();
  const qc = useQueryClient();
  const insets = useSafeAreaInsets();
  const me = authUserId(useAuthStore((s) => s.user));

  const [draft, setDraft] = useState("");

  const threadQuery = useQuery({
    queryKey: ["message-thread", conversationId],
    queryFn: () => fetchThreadMessages(conversationId),
    enabled: !!conversationId,
  });

  const sendMut = useMutation({
    mutationFn: () => sendThreadMessage(conversationId, draft.trim()),
    onSuccess: () => {
      setDraft("");
      void qc.invalidateQueries({ queryKey: ["message-thread", conversationId] });
      void qc.invalidateQueries({ queryKey: ["message-conversations"] });
    },
    onError: (e: unknown) => {
      const msg =
        e && typeof e === "object" && "message" in e ? String((e as { message: string }).message) : "Send failed";
      Alert.alert("Message not sent", msg);
    },
  });

  const messages = threadQuery.data ?? [];

  const renderItem = useCallback(
    ({ item }: { item: ThreadMessage }) => {
      const mine = item.senderUserId === me;
      return (
        <View style={[styles.bubbleWrap, mine ? styles.bubbleWrapMe : styles.bubbleWrapThem]}>
          <View style={[styles.bubble, mine ? styles.bubbleMe : styles.bubbleThem]}>
            <Text style={[styles.bubbleText, mine ? styles.bubbleTextMe : styles.bubbleTextThem]}>{item.body}</Text>
            <Text style={[styles.time, mine ? styles.timeMe : styles.timeThem]}>
              {new Date(item.createdAt).toLocaleString(undefined, { hour: "2-digit", minute: "2-digit" })}
            </Text>
          </View>
        </View>
      );
    },
    [me]
  );

  if (!conversationId) {
    return (
      <GshScreenBackground>
        <View style={styles.center}>
          <View style={styles.emptyIcon}>
            <Ionicons name="chatbubble-ellipses-outline" size={40} color={colors.brand} />
          </View>
          <Text style={styles.err}>This conversation link is not valid.</Text>
          <Pressable onPress={() => router.back()} accessibilityRole="button">
            <Text style={styles.link}>Go back</Text>
          </Pressable>
        </View>
      </GshScreenBackground>
    );
  }

  return (
    <GshScreenBackground>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={insets.top + 48}
      >
        {threadQuery.isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.brand} />
            <Text style={styles.loadingText}>Loading thread…</Text>
          </View>
        ) : threadQuery.isError ? (
          <View style={styles.center}>
            <View style={styles.emptyIcon}>
              <Ionicons name="cloud-offline-outline" size={40} color={colors.teal} />
            </View>
            <Text style={styles.err}>Could not load thread.</Text>
            <Pressable onPress={() => void threadQuery.refetch()} accessibilityRole="button">
              <Text style={styles.link}>Retry</Text>
            </Pressable>
            <Pressable onPress={() => router.back()} accessibilityRole="button">
              <Text style={[styles.link, styles.linkMuted]}>Go back</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.threadShell}>
            <FlatList
              style={styles.threadList}
              data={messages}
              keyExtractor={(m) => m._id}
              renderItem={renderItem}
              inverted
              contentContainerStyle={styles.threadPad}
            />
            <LinearGradient
              colors={["rgba(97,10,144,0.06)", "rgba(14,205,209,0.08)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.threadTip}
            >
              <Ionicons name="shield-checkmark-outline" size={20} color={colors.navy} />
              <Text style={styles.threadTipText}>
                Keep it professional — clear updates help employers respond faster.
              </Text>
            </LinearGradient>
            <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
              <TextInput
                style={styles.input}
                placeholder="Write a message…"
                placeholderTextColor={colors.placeholder}
                value={draft}
                onChangeText={setDraft}
                multiline
                maxLength={8000}
              />
              <Pressable
                style={[styles.sendBtn, (!draft.trim() || sendMut.isPending) && styles.sendDisabled]}
                onPress={() => sendMut.mutate()}
                disabled={!draft.trim() || sendMut.isPending}
                accessibilityRole="button"
                accessibilityLabel="Send message"
              >
                <Ionicons name="send" size={20} color={colors.white} />
              </Pressable>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "transparent" },
  threadShell: { flex: 1 },
  threadList: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, gap: 12 },
  loadingText: { fontFamily: fontFamily.medium, fontSize: 15, color: colors.textMuted },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.purpleMuted,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.purpleBorder,
    marginBottom: 4,
  },
  err: { color: colors.navy, marginBottom: 4, fontFamily: fontFamily.semiBold, textAlign: "center", fontSize: 16 },
  link: { color: colors.brand, fontFamily: fontFamily.semiBold },
  linkMuted: { color: colors.textMuted, marginTop: 4 },
  threadPad: { paddingHorizontal: 12, paddingVertical: 12 },
  threadTip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 12,
    marginBottom: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  threadTipText: {
    flex: 1,
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: colors.textMarketing,
    lineHeight: 18,
  },
  bubbleWrap: { marginBottom: 10, maxWidth: "100%" },
  bubbleWrapMe: { alignSelf: "flex-end" },
  bubbleWrapThem: { alignSelf: "flex-start" },
  bubble: { maxWidth: "88%", borderRadius: radii.lg, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleMe: { backgroundColor: colors.brand },
  bubbleThem: { backgroundColor: colors.surfaceMuted, borderWidth: 1, borderColor: colors.border },
  bubbleText: { fontSize: 16, lineHeight: 22, fontFamily: fontFamily.regular },
  bubbleTextMe: { color: colors.white },
  bubbleTextThem: { color: colors.textPrimary },
  time: { marginTop: 6, fontSize: 11, alignSelf: "flex-end", fontFamily: fontFamily.medium },
  timeMe: { color: "rgba(255,255,255,0.75)" },
  timeThem: { color: colors.textMuted },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: fontFamily.regular,
    color: colors.textPrimary,
    backgroundColor: colors.surfaceMuted,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  sendDisabled: { opacity: 0.45 },
});
