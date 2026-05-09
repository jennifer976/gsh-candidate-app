import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { fetchThreadMessages, sendThreadMessage } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import { authUserId, type ThreadMessage } from "@/types/models";

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const conversationId = String(id || "");
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

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={insets.top + 48}
    >
      {threadQuery.isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      ) : threadQuery.isError ? (
        <View style={styles.center}>
          <Text style={styles.err}>Could not load thread.</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.link}>Go back</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <FlatList
            data={messages}
            keyExtractor={(m) => m._id}
            renderItem={renderItem}
            inverted
            contentContainerStyle={styles.threadPad}
          />
          <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            <TextInput
              style={styles.input}
              placeholder="Write a message…"
              placeholderTextColor="#94a3b8"
              value={draft}
              onChangeText={setDraft}
              multiline
              maxLength={8000}
            />
            <Pressable
              style={[styles.sendBtn, (!draft.trim() || sendMut.isPending) && styles.sendDisabled]}
              onPress={() => sendMut.mutate()}
              disabled={!draft.trim() || sendMut.isPending}
            >
              <Text style={styles.sendText}>Send</Text>
            </Pressable>
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#f8fafc" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  err: { color: "#b91c1c", marginBottom: 12 },
  link: { color: "#4f46e5", fontWeight: "600" },
  threadPad: { paddingHorizontal: 12, paddingVertical: 12 },
  bubbleWrap: { marginBottom: 8, maxWidth: "100%" },
  bubbleWrapMe: { alignSelf: "flex-end" },
  bubbleWrapThem: { alignSelf: "flex-start" },
  bubble: { maxWidth: "92%", borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8 },
  bubbleMe: { backgroundColor: "#4f46e5" },
  bubbleThem: { backgroundColor: "#e2e8f0" },
  bubbleText: { fontSize: 16, lineHeight: 22 },
  bubbleTextMe: { color: "#fff" },
  bubbleTextThem: { color: "#0f172a" },
  time: { marginTop: 4, fontSize: 11, alignSelf: "flex-end" },
  timeMe: { color: "rgba(255,255,255,0.75)" },
  timeThem: { color: "#64748b" },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#0f172a",
  },
  sendBtn: { backgroundColor: "#4f46e5", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 },
  sendDisabled: { opacity: 0.5 },
  sendText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
