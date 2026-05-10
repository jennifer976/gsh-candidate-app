import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { fetchOwnProfile, updateProfile, uploadFileFromUri } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import { colors, fontFamily } from "@/lib/theme";

export default function ProfileScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const user = useAuthStore((s) => s.user);

  const profileQuery = useQuery({
    queryKey: ["profile", "me"],
    queryFn: fetchOwnProfile,
  });

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [location, setLocation] = useState("");
  const [linkedin, setLinkedin] = useState("");

  useEffect(() => {
    const p = profileQuery.data;
    if (!p) return;
    setFirstName(typeof p.firstName === "string" ? p.firstName : "");
    setLastName(typeof p.lastName === "string" ? p.lastName : "");
    setPhoneNumber(typeof p.phoneNumber === "string" ? p.phoneNumber : "");
    setLocation(typeof p.location === "string" ? p.location : "");
    setLinkedin(typeof p.linkedin_profile === "string" ? p.linkedin_profile : "");
  }, [profileQuery.data]);

  const saveMut = useMutation({
    mutationFn: () =>
      updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim(),
        location: location.trim(),
        linkedin_profile: linkedin.trim(),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["profile", "me"] });
      Alert.alert("Saved", "Your profile was updated.");
    },
    onError: (e: unknown) =>
      Alert.alert(
        "Could not save",
        e && typeof e === "object" && "message" in e ? String((e as { message: string }).message) : "Try again."
      ),
  });

  const cvMut = useMutation({
    mutationFn: async () => {
      const res = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
      });
      if (res.canceled || !res.assets?.[0]) throw new Error("cancel");
      const a = res.assets[0];
      const up = await uploadFileFromUri(a.uri, a.name || "cv.pdf", a.mimeType ?? "application/pdf");
      await updateProfile({ resume: up.url });
      return up.url;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["profile", "me"] }),
    onError: (e: unknown) => {
      const msg = e instanceof Error && e.message === "cancel" ? null : String(e && typeof e === "object" && "message" in e ? (e as { message: string }).message : "Upload failed");
      if (msg) Alert.alert("Upload failed", msg);
    },
  });

  const p = profileQuery.data;
  const completion = typeof p?.profileCompletion === "number" ? p.profileCompletion : null;
  const resumeUrl = typeof p?.resume === "string" ? p.resume : "";

  function logout() {
    Alert.alert("Sign out", "You will need to sign in again to apply or view saved jobs.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: () => {
          qc.clear();
          clearAuth();
          router.replace("/login");
        },
      },
    ]);
  }

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <ScrollView contentContainerStyle={styles.pad} keyboardShouldPersistTaps="handled">
          <Text style={styles.h1}>Your profile</Text>
          {profileQuery.isLoading ? (
          <Text style={styles.body}>Loading…</Text>
        ) : profileQuery.isError ? (
          <Text style={styles.warn}>Profile could not be loaded.</Text>
        ) : (
          <>
            {completion != null ? (
              <Text style={styles.completion}>Profile completion: {completion}%</Text>
            ) : null}
            <Text style={styles.email}>Signed in as {user?.email ?? "—"}</Text>

            <Text style={styles.label}>First name</Text>
            <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="First name" />

            <Text style={styles.label}>Last name</Text>
            <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="Last name" />

            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Phone"
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>Location</Text>
            <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="City / country" />

            <Text style={styles.label}>LinkedIn URL</Text>
            <TextInput
              style={styles.input}
              value={linkedin}
              onChangeText={setLinkedin}
              placeholder="https://linkedin.com/in/…"
              autoCapitalize="none"
              keyboardType="url"
            />

            <GshGradientPrimaryButton title="Save profile" onPress={() => saveMut.mutate()} loading={saveMut.isPending} containerStyle={{ marginTop: 8 }} />

            <Text style={[styles.label, { marginTop: 20 }]}>CV / resume</Text>
            {resumeUrl ? (
              <Text style={styles.resumeHint} numberOfLines={2}>
                Current file URL on file. Replace by uploading a new PDF or Word document.
              </Text>
            ) : (
              <Text style={styles.resumeHint}>Add a CV so employers can review your background.</Text>
            )}
            <Pressable
              style={[styles.outlineBtn, cvMut.isPending && styles.disabled]}
              onPress={() => cvMut.mutate()}
              disabled={cvMut.isPending}
            >
              {cvMut.isPending ? (
                <ActivityIndicator color={colors.brand} />
              ) : (
                <Text style={styles.outlineBtnText}>{resumeUrl ? "Replace CV" : "Upload CV"}</Text>
              )}
            </Pressable>
          </>
          )}

          <Pressable style={[styles.signOut, { marginTop: 28 }]} onPress={logout}>
            <Text style={styles.signOutText}>Sign out</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  pad: { padding: 20, paddingBottom: 40 },
  h1: { fontSize: 24, fontFamily: fontFamily.extraBold, color: colors.textPrimary, marginBottom: 8, letterSpacing: -0.3 },
  body: { fontSize: 15, fontFamily: fontFamily.regular, color: colors.textSecondary },
  warn: { fontSize: 14, fontFamily: fontFamily.medium, color: "#b45309", marginBottom: 12 },
  completion: { fontSize: 15, fontFamily: fontFamily.semiBold, color: colors.brand, marginBottom: 8 },
  email: { fontSize: 14, fontFamily: fontFamily.regular, color: colors.textMuted, marginBottom: 16 },
  label: { fontSize: 13, fontFamily: fontFamily.semiBold, color: colors.textSecondary, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    fontSize: 16,
    fontFamily: fontFamily.regular,
    backgroundColor: colors.background,
    marginBottom: 14,
    color: colors.textPrimary,
  },
  disabled: { opacity: 0.65 },
  resumeHint: { fontSize: 13, fontFamily: fontFamily.regular, color: colors.textMuted, marginBottom: 10, lineHeight: 18 },
  outlineBtn: {
    borderWidth: 1,
    borderColor: colors.brand,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: colors.background,
  },
  outlineBtnText: { fontSize: 16, fontFamily: fontFamily.semiBold, color: colors.brand },
  signOut: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: colors.background,
  },
  signOutText: { fontSize: 16, fontFamily: fontFamily.semiBold, color: colors.error },
});
