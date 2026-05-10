import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshGradientPrimaryButton } from "@/components/GshGradientPrimaryButton";
import { registerCandidate } from "@/lib/api-client";
import { colors } from "@/lib/theme";

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    const e = email.trim().toLowerCase();
    if (!e || !password || password.length < 8) {
      Alert.alert("Check your details", "Use a valid email and a password of at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const data = await registerCandidate(e, password);
      Alert.alert("Check your email", data.message || "We sent a verification code.");
      router.replace({ pathname: "/verify", params: { userId: data.userId } });
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : "Signup failed";
      Alert.alert("Could not register", msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <Text style={styles.lead}>Create a free candidate account to save jobs and apply.</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@example.com"
          placeholderTextColor={colors.placeholder}
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          placeholder="At least 8 characters"
          placeholderTextColor={colors.placeholder}
          value={password}
          onChangeText={setPassword}
        />

        <GshGradientPrimaryButton title="Continue" onPress={onSubmit} loading={loading} containerStyle={{ marginTop: 8 }} />

        <Pressable style={styles.linkWrap} onPress={() => router.back()}>
          <Text style={styles.link}>Already have an account? Sign in</Text>
        </Pressable>
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
    fontSize: 16,
    backgroundColor: colors.background,
    marginBottom: 16,
    color: colors.textPrimary,
  },
  linkWrap: { marginTop: 24, alignItems: "center" },
  link: { color: colors.brand, fontSize: 15, fontWeight: "500" },
});
