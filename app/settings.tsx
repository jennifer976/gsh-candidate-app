import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { changePassword } from "@/lib/api-client";

export default function SettingsScreen() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const mut = useMutation({
    mutationFn: () => changePassword(currentPassword, newPassword),
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
      Alert.alert("Password updated", "Your password was changed.");
    },
    onError: (e: unknown) =>
      Alert.alert(
        "Could not update",
        e && typeof e === "object" && "message" in e ? String((e as { message: string }).message) : "Try again."
      ),
  });

  function savePw() {
    if (newPassword.length < 8) {
      Alert.alert("Too short", "Use at least 8 characters.");
      return;
    }
    if (newPassword !== confirm) {
      Alert.alert("Mismatch", "New password and confirmation must match.");
      return;
    }
    mut.mutate();
  }

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.pad}>
          <Text style={styles.h1}>Settings</Text>

          <Pressable style={styles.linkRow} onPress={() => router.push("/notification-feed")}>
            <Text style={styles.linkTitle}>Notification inbox</Text>
            <Text style={styles.linkSub}>Application & account updates</Text>
          </Pressable>
          <Pressable style={styles.linkRow} onPress={() => router.push("/alerts")}>
            <Text style={styles.linkTitle}>Job alerts & email preferences</Text>
            <Text style={styles.linkSub}>Matches and saved searches</Text>
          </Pressable>

          <Text style={styles.section}>Change password</Text>
          <Text style={styles.label}>Current password</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
            autoCapitalize="none"
          />
          <Text style={styles.label}>New password</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
            autoCapitalize="none"
          />
          <Text style={styles.label}>Confirm new password</Text>
          <TextInput style={styles.input} secureTextEntry value={confirm} onChangeText={setConfirm} autoCapitalize="none" />

          <Pressable style={[styles.primaryBtn, mut.isPending && styles.disabled]} onPress={savePw} disabled={mut.isPending}>
            <Text style={styles.primaryBtnText}>{mut.isPending ? "Saving…" : "Update password"}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f8fafc" },
  pad: { padding: 16, paddingBottom: 40 },
  h1: { fontSize: 22, fontWeight: "800", color: "#0f172a", marginBottom: 16 },
  linkRow: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  linkTitle: { fontSize: 16, fontWeight: "700", color: "#0f172a" },
  linkSub: { marginTop: 4, fontSize: 13, color: "#64748b" },
  section: { fontSize: 17, fontWeight: "700", color: "#0f172a", marginTop: 20, marginBottom: 12 },
  label: { fontSize: 13, fontWeight: "600", color: "#475569", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    fontSize: 16,
    backgroundColor: "#fff",
    marginBottom: 12,
    color: "#0f172a",
  },
  primaryBtn: {
    backgroundColor: "#4f46e5",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 17 },
  disabled: { opacity: 0.65 },
});
