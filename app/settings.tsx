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
import { changePassword, deleteCandidateAccount } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import { LEGAL_IN_APP } from "@/lib/legal/inAppRoutes";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";

export default function SettingsScreen() {
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);

  const deleteMut = useMutation({
    mutationFn: () => deleteCandidateAccount(deletePassword, deleteReason.trim()),
    onSuccess: () => {
      setDeletePassword("");
      setDeleteReason("");
      setDeleteConfirmed(false);
      clearAuth();
      Alert.alert("Account deleted", "Your candidate account and related data have been removed.", [
        { text: "OK", onPress: () => router.replace("/login") },
      ]);
    },
    onError: (e: unknown) =>
      Alert.alert(
        "Could not delete account",
        e && typeof e === "object" && "message" in e ? String((e as { message: string }).message) : "Try again or contact support."
      ),
  });

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

  function confirmDeleteAccount() {
    if (!deleteConfirmed) {
      Alert.alert("Confirmation required", "Check the box to confirm you understand this action is permanent.");
      return;
    }
    if (deleteReason.trim().length < 10) {
      Alert.alert("Reason required", "Please enter a reason of at least 10 characters.");
      return;
    }
    if (deletePassword.length < 1) {
      Alert.alert("Password required", "Enter your current password to confirm deletion.");
      return;
    }
    Alert.alert(
      "Delete account permanently?",
      "This removes your profile, applications, saved jobs, messages, and notification preferences. You cannot undo this.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete account",
          style: "destructive",
          onPress: () => deleteMut.mutate(),
        },
      ]
    );
  }

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
            onPress={() => router.push("/tools-resources")}
            accessibilityRole="button"
          >
            <View style={styles.linkTextCol}>
              <Text style={styles.linkTitle}>Tools & resources</Text>
              <Text style={styles.linkSub}>Visa wizard, guides, blog, FAQs, legal</Text>
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

          <Text style={[styles.groupLabel, styles.groupSpaced]}>Legal</Text>
          <Text style={styles.sectionHint}>Policies are readable inside the app (same wording as the public site).</Text>
          <Pressable
            style={[cardSurfaceStyle(true), styles.linkRow]}
            onPress={() => router.push(LEGAL_IN_APP.hub)}
            accessibilityRole="button"
          >
            <View style={styles.linkTextCol}>
              <Text style={styles.linkTitle}>Legal hub</Text>
              <Text style={styles.linkSub}>Terms, privacy, cookies, acceptable use</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.placeholder} />
          </Pressable>
          <Pressable
            style={[cardSurfaceStyle(true), styles.linkRow]}
            onPress={() => router.push(LEGAL_IN_APP.privacy)}
            accessibilityRole="button"
          >
            <View style={styles.linkTextCol}>
              <Text style={styles.linkTitle}>Privacy policy</Text>
              <Text style={styles.linkSub}>How we handle personal data</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.placeholder} />
          </Pressable>
          <Pressable
            style={[cardSurfaceStyle(true), styles.linkRow]}
            onPress={() => router.push(LEGAL_IN_APP.terms)}
            accessibilityRole="button"
          >
            <View style={styles.linkTextCol}>
              <Text style={styles.linkTitle}>Terms & conditions</Text>
              <Text style={styles.linkSub}>Using Global Sponsor Hub services</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.placeholder} />
          </Pressable>
          <Pressable
            style={[cardSurfaceStyle(true), styles.linkRow]}
            onPress={() => router.push(LEGAL_IN_APP.cookies)}
            accessibilityRole="button"
          >
            <View style={styles.linkTextCol}>
              <Text style={styles.linkTitle}>Cookie policy</Text>
              <Text style={styles.linkSub}>Cookies and similar tech on our sites</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.placeholder} />
          </Pressable>
          <Pressable
            style={[cardSurfaceStyle(true), styles.linkRow]}
            onPress={() => router.push(LEGAL_IN_APP.acceptableUse)}
            accessibilityRole="button"
          >
            <View style={styles.linkTextCol}>
              <Text style={styles.linkTitle}>Acceptable use</Text>
              <Text style={styles.linkSub}>Fair use of messaging, listings, and platform features</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.placeholder} />
          </Pressable>

          <Text style={[styles.groupLabel, styles.groupSpaced]}>Danger zone</Text>
          <View style={styles.dangerCard}>
            <Text style={styles.dangerTitle}>Delete account</Text>
            <Text style={styles.sectionHint}>
              Permanently delete your Global Sponsor Hub account and related data. This cannot be undone. Employer and
              partner accounts can also use self-delete on the website (Settings).
            </Text>
            <Text style={styles.label}>Reason for leaving (required, min 10 characters)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={deleteReason}
              onChangeText={setDeleteReason}
              editable={!deleteMut.isPending}
              placeholder="For example: I no longer need this account…"
              placeholderTextColor={colors.placeholder}
              multiline
              maxLength={4000}
              textAlignVertical="top"
            />
            <Text style={styles.label}>Current password</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              value={deletePassword}
              onChangeText={setDeletePassword}
              autoCapitalize="none"
              editable={!deleteMut.isPending}
              placeholder="Current password"
              placeholderTextColor={colors.placeholder}
            />
            <Pressable
              style={styles.understandRow}
              onPress={() => setDeleteConfirmed((v) => !v)}
              disabled={deleteMut.isPending}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: deleteConfirmed }}
            >
              <View style={[styles.checkboxOuter, deleteConfirmed && styles.checkboxOuterOn]}>
                {deleteConfirmed ? <Ionicons name="checkmark" size={16} color={colors.background} /> : null}
              </View>
              <Text style={styles.understandText}>I understand this will permanently delete my account and associated data.</Text>
            </Pressable>
            <Pressable
              style={[styles.deleteAccountBtn, deleteMut.isPending && styles.deleteAccountBtnDisabled]}
              onPress={confirmDeleteAccount}
              disabled={deleteMut.isPending}
              accessibilityRole="button"
              accessibilityLabel="Permanently delete account"
            >
              <Text style={styles.deleteAccountBtnText}>{deleteMut.isPending ? "Deleting…" : "Permanently delete account"}</Text>
            </Pressable>
          </View>
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
  dangerCard: {
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: radii.sm,
    padding: 14,
    backgroundColor: "rgba(220, 38, 38, 0.06)",
  },
  dangerTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    color: colors.error,
    marginBottom: 4,
  },
  textArea: {
    minHeight: 96,
    paddingTop: 12,
  },
  understandRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 4,
    marginBottom: 12,
  },
  checkboxOuter: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.error,
    marginTop: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  checkboxOuterOn: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  understandText: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  deleteAccountBtn: {
    marginTop: 4,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.error,
    backgroundColor: colors.background,
    alignItems: "center",
  },
  deleteAccountBtnDisabled: { opacity: 0.55 },
  deleteAccountBtnText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    color: colors.error,
  },
});
