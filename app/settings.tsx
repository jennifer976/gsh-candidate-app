import { AppLanguageSetting } from "@/components/AppLanguageSetting";
import { useAppCopy } from "@/lib/i18n";
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
import {
  GshLinkRow,
  GshScreenIntro,
  GshSectionTitle,
} from "@/components/gsh-ui-kit";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { changePassword, deleteCandidateAccount } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import { LEGAL_IN_APP } from "@/lib/legal/inAppRoutes";
import { stackScrollContentStyle } from "@/lib/screen-layout";
import { colors, fontFamily, radii } from "@/lib/theme";

export default function SettingsScreen() {
  const { t } = useAppCopy();
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);

  const deleteMut = useMutation({
    mutationFn: () =>
      deleteCandidateAccount(deletePassword, deleteReason.trim()),
    onSuccess: () => {
      setDeletePassword("");
      setDeleteReason("");
      setDeleteConfirmed(false);
      clearAuth();
      Alert.alert(t("deleted"), t("deletedHelp"), [
        { text: t("ok"), onPress: () => router.replace("/login") },
      ]);
    },
    onError: () => Alert.alert(t("deleteError"), t("retrySupport")),
  });

  const mut = useMutation({
    mutationFn: () => changePassword(currentPassword, newPassword),
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
      Alert.alert(t("updated"), t("updatedHelp"));
    },
    onError: () => Alert.alert(t("updateError"), t("retry")),
  });

  function confirmDeleteAccount() {
    if (!deleteConfirmed) {
      Alert.alert(t("confirmationRequired"), t("confirmationHelp"));
      return;
    }
    if (deleteReason.trim().length < 10) {
      Alert.alert(t("reasonRequired"), t("reasonHelp"));
      return;
    }
    if (deletePassword.length < 1) {
      Alert.alert(t("passwordRequired"), t("passwordHelp"));
      return;
    }
    Alert.alert(t("confirmDelete"), t("confirmDeleteHelp"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("deleteAccount"),
        style: "destructive",
        onPress: () => deleteMut.mutate(),
      },
    ]);
  }

  function savePw() {
    if (newPassword.length < 8) {
      Alert.alert(t("tooShort"), t("tooShortHelp"));
      return;
    }
    if (newPassword !== confirm) {
      Alert.alert(t("mismatch"), t("mismatchHelp"));
      return;
    }
    mut.mutate();
  }

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.pad}
            showsVerticalScrollIndicator={false}
          >
            <GshScreenIntro
              eyebrow={t("account")}
              title={t("settings")}
              subtitle={t("intro")}
              style={{ marginBottom: 8 }}
            />

            <AppLanguageSetting />
            <GshSectionTitle title={t("notifications")} topSpacing="none" />
            <GshLinkRow
              title={t("preferences")}
              subtitle={t("preferencesHelp")}
              icon="notifications-outline"
              accent="teal"
              onPress={() => router.push("/alerts")}
            />
            {Platform.OS !== "web" ? (
              <GshLinkRow
                title={t("deviceSettings")}
                subtitle={t("deviceHelp")}
                icon="phone-portrait-outline"
                accent="ocean"
                onPress={() => void Linking.openSettings()}
              />
            ) : null}
            <GshLinkRow
              title={t("inbox")}
              subtitle={t("inboxHelp")}
              icon="file-tray-full-outline"
              accent="purple"
              onPress={() => router.push("/notification-feed")}
            />
            <GshLinkRow
              title={t("resources")}
              subtitle={t("resourcesHelp")}
              icon="layers-outline"
              accent="purple"
              onPress={() => router.push("/tools-resources")}
            />

            <GshSectionTitle title={t("security")} hint={t("securityHelp")} />
            <Text style={styles.label}>{t("currentPassword")}</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              accessibilityLabel={t("currentPassword")}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              autoCapitalize="none"
            />
            <Text style={styles.label}>{t("newPassword")}</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              accessibilityLabel={t("newPassword")}
              value={newPassword}
              onChangeText={setNewPassword}
              autoCapitalize="none"
            />
            <Text style={styles.label}>{t("confirmPassword")}</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              accessibilityLabel={t("confirmPassword")}
              value={confirm}
              onChangeText={setConfirm}
              autoCapitalize="none"
            />

            <GshGradientPrimaryButton
              title={mut.isPending ? t("saving") : t("updatePassword")}
              onPress={savePw}
              disabled={mut.isPending}
              containerStyle={{ marginTop: 8 }}
            />

            <GshSectionTitle title={t("legal")} />
            <GshLinkRow
              title={t("legalHub")}
              subtitle={t("legalHelp")}
              icon="document-text-outline"
              accent="purple"
              onPress={() => router.push(LEGAL_IN_APP.hub)}
            />
            <GshLinkRow
              title={t("privacy")}
              subtitle={t("privacyHelp")}
              icon="lock-closed-outline"
              accent="teal"
              onPress={() => router.push(LEGAL_IN_APP.privacy)}
            />
            <GshLinkRow
              title={t("terms")}
              subtitle={t("termsHelp")}
              icon="reader-outline"
              accent="ocean"
              onPress={() => router.push(LEGAL_IN_APP.terms)}
            />
            <GshLinkRow
              title={t("cookies")}
              subtitle={t("cookiesHelp")}
              icon="nutrition-outline"
              accent="purple"
              onPress={() => router.push(LEGAL_IN_APP.cookies)}
            />
            <GshLinkRow
              title={t("acceptableUse")}
              subtitle={t("acceptableHelp")}
              icon="warning-outline"
              accent="teal"
              onPress={() => router.push(LEGAL_IN_APP.acceptableUse)}
            />

            <GshSectionTitle title={t("closeAccount")} />
            <View style={styles.dangerCard}>
              <Text style={styles.dangerTitle}>{t("deleteAccount")}</Text>
              <Text style={styles.sectionHint}>{t("deleteHelp")}</Text>
              <Text style={styles.label}>{t("reason")}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={deleteReason}
                onChangeText={setDeleteReason}
                editable={!deleteMut.isPending}
                placeholder={t("reasonPlaceholder")}
                placeholderTextColor={colors.placeholder}
                multiline
                maxLength={4000}
                textAlignVertical="top"
              />
              <Text style={styles.label}>{t("currentPassword")}</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                value={deletePassword}
                onChangeText={setDeletePassword}
                autoCapitalize="none"
                editable={!deleteMut.isPending}
                placeholder={t("currentPassword")}
                placeholderTextColor={colors.placeholder}
              />
              <Pressable
                style={styles.understandRow}
                onPress={() => setDeleteConfirmed((v) => !v)}
                disabled={deleteMut.isPending}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: deleteConfirmed }}
              >
                <View
                  style={[
                    styles.checkboxOuter,
                    deleteConfirmed && styles.checkboxOuterOn,
                  ]}
                >
                  {deleteConfirmed ? (
                    <Ionicons
                      name="checkmark"
                      size={16}
                      color={colors.background}
                    />
                  ) : null}
                </View>
                <Text style={styles.understandText}>{t("acknowledge")}</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.deleteAccountBtn,
                  deleteMut.isPending && styles.deleteAccountBtnDisabled,
                ]}
                onPress={confirmDeleteAccount}
                disabled={deleteMut.isPending}
                accessibilityRole="button"
                accessibilityLabel={t("permanentDelete")}
              >
                <Text style={styles.deleteAccountBtnText}>
                  {deleteMut.isPending ? t("deleting") : t("permanentDelete")}
                </Text>
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
  pad: { ...stackScrollContentStyle, paddingBottom: 40 },
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
    borderRadius: 99,
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
