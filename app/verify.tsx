import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshGradientPrimaryButton } from "@/components/GshGradientPrimaryButton";
import { verifyOtpRequest } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import { colors } from "@/lib/theme";

export default function VerifyScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    const uid = String(userId || "").trim();
    const c = code.trim();
    if (!uid || !c) {
      Alert.alert("Missing code", "Enter the verification code from your email.");
      return;
    }
    setLoading(true);
    try {
      const data = await verifyOtpRequest(uid, c);
      setAuth(data.token, data.user);
      router.replace("/(tabs)");
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : "Verification failed";
      Alert.alert("Could not verify", msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <Text style={styles.lead}>Enter the code we emailed you to activate your account.</Text>

        <Text style={styles.label}>Verification code</Text>
        <TextInput
          style={styles.input}
          autoCapitalize="characters"
          placeholder="123456"
          placeholderTextColor={colors.placeholder}
          value={code}
          onChangeText={setCode}
        />

        <GshGradientPrimaryButton title="Verify & continue" onPress={onSubmit} loading={loading} containerStyle={{ marginTop: 8 }} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceMuted },
  flex: { flex: 1, paddingHorizontal: 24, paddingTop: 16 },
  lead: { fontSize: 15, color: colors.textSecondary, marginBottom: 20, lineHeight: 22 },
  label: { fontSize: 13, fontWeight: "600", color: colors.textSecondary, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    fontSize: 18,
    letterSpacing: 2,
    backgroundColor: colors.background,
    marginBottom: 16,
    color: colors.textPrimary,
  },
});
