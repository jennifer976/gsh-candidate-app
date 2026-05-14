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
import { GshLinkRow, GshScreenIntro, GshSectionTitle } from "@/components/gsh-ui-kit";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { changePassword, deleteCandidateAccount } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import { LEGAL_IN_APP } from "@/lib/legal/inAppRoutes";
import { colors, fontFamily, radii } from "@/lib/theme";

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
          <GshScreenIntro
            eyebrow="Account"
            title="Settings"
            subtitle="Notifications, security shortcuts, legal policies, and account deletion — in one place."
            style={{ marginBottom: 8 }}
          />

          <GshSectionTitle title="Notifications & content" topSpacing="none" />
          <GshLinkRow
            title="Push & notification preferences"
            subtitle="Email, job alerts, application updates, and push toggles."
            icon="notifications-outline"
            accent="teal"
            onPress={() => router.push("/alerts")}
          />
          {Platform.OS !== "web" ? (
            <GshLinkRow
              title="System notification settings"
              subtitle="Adjust notices at the OS level for this app."
              icon="phone-portrait-outline"
              accent="ocean"
              onPress={() => void Linking.openSettings()}
            />
          ) : null}
          <GshLinkRow
            title="Notification inbox"
            subtitle="Application and account updates."
            icon="file-tray-full-outline"
            accent="purple"
            onPress={() => router.push("/notification-feed")}
          />
          <GshLinkRow
            title="Tools & resources"
            subtitle="Visa wizard, guides, blog, FAQs, and legal."
            icon="layers-outline"
            accent="purple"
            onPress={() => router.push("/tools-resources")}
          />

          <GshSectionTitle title="Security" hint="Use a strong password unique to Global Sponsor Hub." />
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

          <GshSectionTitle title="Legal" hint="Policies are readable inside the app (same wording as the public site)." />
          <GshLinkRow
            title="Legal hub"
            subtitle="Terms, privacy, cookies, acceptable use."
            icon="document-text-outline"
            accent="purple"
            onPress={() => router.push(LEGAL_IN_APP.hub)}
          />
          <GshLinkRow
            title="Privacy policy"
            subtitle="How we handle personal data."
            icon="lock-closed-outline"
            accent="teal"
            onPress={() => router.push(LEGAL_IN_APP.privacy)}
          />
          <GshLinkRow
            title="Terms & conditions"
            subtitle="Using Global Sponsor Hub services."
            icon="reader-outline"
            accent="ocean"
            onPress={() => router.push(LEGAL_IN_APP.terms)}
          />
          <GshLinkRow
            title="Cookie policy"
            subtitle="Cookies and similar tech on our sites."
            icon="nutrition-outline"
            accent="purple"
            onPress={() => router.push(LEGAL_IN_APP.cookies)}
          />
          <GshLinkRow
            title="Acceptable use"
            subtitle="Fair use of messaging, listings, and platform features."
            icon="warning-outline"
            accent="teal"
            onPress={() => router.push(LEGAL_IN_APP.acceptableUse)}
          />

          <GshSectionTitle title="Danger zone" />
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
    borderRadius: radii.md,
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
    borderRadius: radii.lg,
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
