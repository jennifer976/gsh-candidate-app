import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshGradientPrimaryButton } from "@/components/GshGradientPrimaryButton";
import { requestForgotPassword } from "@/lib/api-client";
import { colors } from "@/lib/theme";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const mut = useMutation({
    mutationFn: () => requestForgotPassword(email.trim().toLowerCase()),
    onSuccess: (data) => {
      Alert.alert("Check your email", data.message || "If an account exists, we sent reset instructions.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    },
    onError: (e: unknown) =>
      Alert.alert(
        "Request failed",
        e && typeof e === "object" && "message" in e ? String((e as { message: string }).message) : "Try again."
      ),
  });

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <View style={styles.pad}>
          <Text style={styles.h1}>Forgot password</Text>
          <Text style={styles.lead}>We will email you a link to reset your password.</Text>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
          />
          <GshGradientPrimaryButton
            title={mut.isPending ? "Sending…" : "Send reset link"}
            onPress={() => mut.mutate()}
            disabled={mut.isPending}
          />
          <Pressable style={styles.back} onPress={() => router.back()}>
            <Text style={styles.backText}>Back to sign in</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceMuted },
  pad: { padding: 24 },
  h1: { fontSize: 24, fontWeight: "800", color: colors.textPrimary, marginBottom: 8 },
  lead: { fontSize: 14, color: colors.textMuted, marginBottom: 20, lineHeight: 20 },
  label: { fontSize: 13, fontWeight: "600", color: colors.textSecondary, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    fontSize: 16,
    backgroundColor: colors.background,
    marginBottom: 16,
    color: colors.textPrimary,
  },
  back: { marginTop: 20, alignItems: "center" },
  backText: { color: colors.brand, fontWeight: "600", fontSize: 15 },
});
