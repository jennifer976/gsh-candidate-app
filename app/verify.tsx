import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshGradientPrimaryButton } from "@/components/GshGradientPrimaryButton";
import { LegalConsentFooterRow } from "@/components/LegalConsentLinks";
import { GshScreenIntro } from "@/components/gsh-ui-kit";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { verifyOtpRequest } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";

export default function VerifyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ userId?: string | string[] }>();
  const userIdParam = useMemo(() => {
    const raw = params.userId;
    if (Array.isArray(raw)) return raw[0] ?? "";
    return raw ?? "";
  }, [params.userId]);
  const setAuth = useAuthStore((s) => s.setAuth);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    const uid = String(userIdParam || "").trim();
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
      const msg =
        err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : "Verification failed";
      Alert.alert("Could not verify", msg);
    } finally {
      setLoading(false);
    }
  }

  if (!userIdParam.trim()) {
    return (
      <GshScreenBackground>
        <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
          <ScrollView contentContainerStyle={styles.scrollMiss} keyboardShouldPersistTaps="handled">
            <GshScreenIntro
              eyebrow="Global Sponsor Hub"
              title="Verify email"
              subtitle="This link is missing your account reference. Go back to sign up, or sign in if you already verified."
              style={{ marginBottom: 20 }}
            />
            <Pressable style={styles.missBtn} onPress={() => router.replace("/register")} accessibilityRole="button">
              <Text style={styles.missBtnText}>Create account</Text>
            </Pressable>
            <Pressable style={styles.missLink} onPress={() => router.replace("/login")} accessibilityRole="button">
              <Text style={styles.missLinkText}>Sign in instead</Text>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </GshScreenBackground>
    );
  }

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <GshScreenIntro
              eyebrow="Global Sponsor Hub"
              title="Verify email"
              subtitle="Enter the code we emailed you to activate your candidate account."
              style={{ marginBottom: 16 }}
            />

            <LinearGradient colors={[colors.teal, colors.brand]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.accentBar} />

            <View style={[cardSurfaceStyle(false), styles.card]}>
              <Text style={styles.label}>Verification code</Text>
              <TextInput
                style={styles.input}
                autoCapitalize="characters"
                placeholder="123456"
                placeholderTextColor={colors.placeholder}
                value={code}
                onChangeText={setCode}
              />

              <GshGradientPrimaryButton title="Verify & continue" onPress={onSubmit} loading={loading} />
            </View>

            <LegalConsentFooterRow />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32 },
  scrollMiss: { flexGrow: 1, paddingHorizontal: 24, paddingVertical: 28, justifyContent: "center" },
  accentBar: { height: 4, borderRadius: 2, marginBottom: 18 },
  card: {
    padding: 20,
    borderRadius: radii.lg,
    backgroundColor: colors.background,
  },
  label: { fontSize: 13, fontFamily: fontFamily.semiBold, color: colors.textSecondary, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    fontSize: 18,
    letterSpacing: 2,
    fontFamily: fontFamily.semiBold,
    backgroundColor: colors.background,
    marginBottom: 18,
    color: colors.textPrimary,
  },
  missBtn: {
    marginTop: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: radii.md,
    backgroundColor: colors.brand,
    alignItems: "center",
  },
  missBtnText: { fontFamily: fontFamily.semiBold, fontSize: 16, color: colors.white },
  missLink: { marginTop: 20, alignItems: "center" },
  missLinkText: { fontFamily: fontFamily.semiBold, fontSize: 15, color: colors.brand },
});
