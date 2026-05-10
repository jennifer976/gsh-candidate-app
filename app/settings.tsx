import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshGradientPrimaryButton } from "@/components/GshGradientPrimaryButton";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { changePassword } from "@/lib/api-client";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";

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
    <GshScreenBackground>
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
          <Text style={styles.h1}>Settings</Text>
          <Text style={styles.lead}>Manage notifications, security, and shortcuts across your Global Sponsor Hub account.</Text>

          <Text style={styles.groupLabel}>Notifications & content</Text>
          <Pressable
            style={[cardSurfaceStyle(true), styles.linkRow]}
            onPress={() => router.push("/alerts")}
            accessibilityRole="button"
          >
            <View style={styles.linkTextCol}>
              <Text style={styles.linkTitle}>Push & notification preferences</Text>
              <Text style={styles.linkSub}>
                Turn pushes on or off, plus email, job alerts, and application updates. You still need OS permission for
                push delivery.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.placeholder} />
          </Pressable>
          {Platform.OS !== "web" ? (
            <Pressable
              style={[cardSurfaceStyle(true), styles.linkRow]}
              onPress={() => void Linking.openSettings()}
              accessibilityRole="button"
              accessibilityLabel="Open system settings"
            >
              <View style={styles.linkTextCol}>
                <Text style={styles.linkTitle}>System notification settings</Text>
                <Text style={styles.linkSub}>Adjust notices at the operating-system level for this app</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.placeholder} />
            </Pressable>
          ) : null}
          <Pressable
            style={[cardSurfaceStyle(true), styles.linkRow]}
            onPress={() => router.push("/notification-feed")}
            accessibilityRole="button"
          >
            <View style={styles.linkTextCol}>
              <Text style={styles.linkTitle}>Notification inbox</Text>
              <Text style={styles.linkSub}>Application & account updates</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.placeholder} />
          </Pressable>
          <Pressable
            style={[cardSurfaceStyle(true), styles.linkRow]}
            onPress={() => router.push("/learn")}
            accessibilityRole="button"
          >
            <View style={styles.linkTextCol}>
              <Text style={styles.linkTitle}>Guides & Visa wizard</Text>
              <Text style={styles.linkSub}>Mobility tools and hub resources</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.placeholder} />
          </Pressable>

          <Text style={[styles.groupLabel, styles.groupSpaced]}>Security</Text>
          <Text style={styles.sectionHint}>Use a strong password unique to Global Sponsor Hub.</Text>
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

          <GshGradientPrimaryButton
            title={mut.isPending ? "Saving…" : "Update password"}
            onPress={savePw}
            disabled={mut.isPending}
            containerStyle={{ marginTop: 8 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  pad: { padding: 16, paddingBottom: 40 },
  h1: {
    fontFamily: fontFamily.extraBold,
    fontSize: 26,
    letterSpacing: -0.35,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  lead: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 22,
    marginBottom: 20,
  },
  groupLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.75,
    marginBottom: 10,
  },
  groupSpaced: { marginTop: 22 },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 12,
    backgroundColor: colors.background,
  },
  linkTextCol: { flex: 1, minWidth: 0 },
  linkTitle: { fontSize: 16, fontFamily: fontFamily.bold, color: colors.textPrimary },
  linkSub: { marginTop: 4, fontSize: 13, fontFamily: fontFamily.regular, color: colors.textMuted, lineHeight: 18 },
  sectionHint: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.textMarketing,
    marginBottom: 12,
    lineHeight: 20,
  },
  label: {
    fontSize: 13,
    fontFamily: fontFamily.semiBold,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    fontSize: 16,
    fontFamily: fontFamily.regular,
    backgroundColor: colors.background,
    marginBottom: 12,
    color: colors.textPrimary,
  },
});
