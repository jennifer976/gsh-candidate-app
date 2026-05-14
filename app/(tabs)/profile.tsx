import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
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
import { GshCompletionStrip, GshScreenIntro } from "@/components/gsh-ui-kit";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { fetchOwnProfile, updateProfile, uploadFileFromUri } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import { JOB_PREFERENCE_OPTIONS } from "@/lib/job-preferences";
import { getAllSkillsSorted } from "@/lib/skills-data";
import { colors, fontFamily } from "@/lib/theme";

const ALL_SKILLS = getAllSkillsSorted();
const MAX_SKILLS = 30;

function mergeCandidateExtras(profile: Record<string, unknown> | undefined, userEmail: string | undefined, body: Record<string, unknown>) {
  const p = profile ?? {};
  const existingEmail = typeof p.email === "string" ? p.email.trim() : "";
  if (!existingEmail) {
    const em = userEmail?.trim();
    if (em) body.email = em;
  }
  const jobTitle = typeof p.currentJobTitle === "string" ? p.currentJobTitle.trim() : "";
  if (!jobTitle) body.currentJobTitle = "Not specified";
  const company = typeof p.currentCompany === "string" ? p.currentCompany.trim() : "";
  if (!company) body.currentCompany = "Not specified";
  const yoe = p.yearsOfExperience;
  if (typeof yoe !== "number" || yoe < 0) body.yearsOfExperience = 0;
  const ie = p.industryExperience as { primary?: string; secondary?: string[] } | undefined;
  if (!ie?.primary?.trim()) {
    body.industryExperience = {
      primary: "General",
      secondary: Array.isArray(ie?.secondary) ? ie.secondary.filter(Boolean).slice(0, 2) : [],
    };
  }
}

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
  const [skills, setSkills] = useState<string[]>([]);
  const [jobPreferences, setJobPreferences] = useState<string[]>([]);
  const [skillModalOpen, setSkillModalOpen] = useState(false);
  const [skillSearch, setSkillSearch] = useState("");

  useEffect(() => {
    const p = profileQuery.data;
    if (!p) return;
    setFirstName(typeof p.firstName === "string" ? p.firstName : "");
    setLastName(typeof p.lastName === "string" ? p.lastName : "");
    setPhoneNumber(typeof p.phoneNumber === "string" ? p.phoneNumber : "");
    setLocation(typeof p.location === "string" ? p.location : "");
    setLinkedin(typeof p.linkedin_profile === "string" ? p.linkedin_profile : "");
    setSkills(Array.isArray(p.skills) ? (p.skills as unknown[]).filter((x): x is string => typeof x === "string") : []);
    setJobPreferences(
      Array.isArray(p.jobPreferences)
        ? (p.jobPreferences as unknown[]).filter((x): x is string => typeof x === "string")
        : []
    );
  }, [profileQuery.data]);

  const filteredSkillChoices = useMemo(() => {
    const q = skillSearch.trim().toLowerCase();
    if (!q) return ALL_SKILLS;
    return ALL_SKILLS.filter((s) => s.toLowerCase().includes(q));
  }, [skillSearch]);

  function toggleJobPreference(pref: string) {
    setJobPreferences((prev) => (prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]));
  }

  function toggleSkillChoice(skill: string) {
    setSkills((prev) => {
      if (prev.includes(skill)) return prev.filter((s) => s !== skill);
      if (prev.length >= MAX_SKILLS) return prev;
      return [...prev, skill];
    });
  }

  function removeSkill(skill: string) {
    setSkills((prev) => prev.filter((s) => s !== skill));
  }

  function closeSkillModal() {
    setSkillModalOpen(false);
    setSkillSearch("");
  }

  const saveMut = useMutation({
    mutationFn: () => {
      if (skills.length === 0) {
        return Promise.reject(new Error("Select at least one skill — use Add skills."));
      }
      if (jobPreferences.length === 0) {
        return Promise.reject(new Error("Select at least one job preference (Full Time, Part Time, etc.)."));
      }
      const body: Record<string, unknown> = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim(),
        location: location.trim(),
        linkedin_profile: linkedin.trim(),
        skills,
        jobPreferences,
      };
      mergeCandidateExtras(profileQuery.data, user?.email, body);
      return updateProfile(body);
    },
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
          <GshScreenIntro
            eyebrow="Account"
            title="Your profile"
            subtitle="Keep your basics current so applications, CV uploads, and employer messages stay smooth."
            style={{ marginBottom: 12 }}
          />
          {profileQuery.isLoading ? (
          <Text style={styles.body}>Loading…</Text>
        ) : profileQuery.isError ? (
          <Text style={styles.warn}>Profile could not be loaded.</Text>
        ) : (
          <>
            {completion != null ? <GshCompletionStrip pct={completion} /> : null}
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

            <Text style={styles.label}>Job preferences</Text>
            <Text style={styles.fieldHint}>Choose how you want to work (matches the web profile).</Text>
            <View style={styles.chipWrap}>
              {JOB_PREFERENCE_OPTIONS.map((pref) => {
                const on = jobPreferences.includes(pref);
                return (
                  <Pressable
                    key={pref}
                    onPress={() => toggleJobPreference(pref)}
                    style={[styles.chip, on ? styles.chipOn : null]}
                  >
                    <Text style={[styles.chipText, on ? styles.chipTextOn : null]}>{pref}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.label}>Skills</Text>
            <Text style={styles.fieldHint}>At least one skill is required. Tap Add skills to pick from the same list as on the website.</Text>
            <View style={styles.skillActions}>
              <Pressable style={styles.outlineBtnSmall} onPress={() => { setSkillSearch(""); setSkillModalOpen(true); }}>
                <Text style={styles.outlineBtnText}>Add skills</Text>
              </Pressable>
              <Text style={styles.skillCount}>
                {skills.length} selected{skills.length >= MAX_SKILLS ? " (max)" : ""}
              </Text>
            </View>
            {skills.length > 0 ? (
              <View style={styles.chipWrap}>
                {skills.map((s) => (
                  <Pressable key={s} onPress={() => removeSkill(s)} style={[styles.chip, styles.chipOn]}>
                    <Text style={[styles.chipText, styles.chipTextOn]}>
                      {s}
                      <Text style={styles.chipRemove}> ✕</Text>
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null}

            <GshGradientPrimaryButton title="Save profile" onPress={() => saveMut.mutate()} loading={saveMut.isPending} containerStyle={{ marginTop: 8 }} />

            <Modal visible={skillModalOpen} animationType="slide" onRequestClose={closeSkillModal}>
              <SafeAreaView style={styles.modalSafe} edges={["top"]}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select skills</Text>
                  <Pressable onPress={closeSkillModal} hitSlop={12}>
                    <Text style={styles.modalDone}>Done</Text>
                  </Pressable>
                </View>
                <TextInput
                  style={styles.input}
                  value={skillSearch}
                  onChangeText={setSkillSearch}
                  placeholder="Search skills…"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <FlatList
                  data={filteredSkillChoices}
                  keyExtractor={(item) => item}
                  keyboardShouldPersistTaps="handled"
                  style={styles.modalList}
                  renderItem={({ item }) => {
                    const selected = skills.includes(item);
                    return (
                      <Pressable
                        style={[styles.skillRow, selected && styles.skillRowOn]}
                        onPress={() => toggleSkillChoice(item)}
                      >
                        <Text style={styles.skillRowText}>{item}</Text>
                        {selected ? <Text style={styles.skillRowCheck}>✓</Text> : null}
                      </Pressable>
                    );
                  }}
                  ListEmptyComponent={<Text style={styles.emptySkills}>No matches.</Text>}
                />
              </SafeAreaView>
            </Modal>

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
  body: { fontSize: 15, fontFamily: fontFamily.regular, color: colors.textSecondary },
  warn: { fontSize: 14, fontFamily: fontFamily.medium, color: "#b45309", marginBottom: 12 },
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
  outlineBtnSmall: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: colors.brand,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: colors.background,
  },
  fieldHint: {
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    marginBottom: 10,
    lineHeight: 18,
  },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: colors.background,
  },
  chipOn: { borderColor: colors.brand, backgroundColor: `${colors.brand}14` },
  chipText: { fontSize: 14, fontFamily: fontFamily.medium, color: colors.textSecondary },
  chipTextOn: { color: colors.brand },
  chipRemove: { fontSize: 12, opacity: 0.85 },
  skillActions: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  skillCount: { fontSize: 13, fontFamily: fontFamily.regular, color: colors.textMuted },
  modalSafe: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 16 },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    marginBottom: 8,
  },
  modalTitle: { fontSize: 18, fontFamily: fontFamily.semiBold, color: colors.textPrimary },
  modalDone: { fontSize: 16, fontFamily: fontFamily.semiBold, color: colors.brand },
  modalList: { flex: 1 },
  skillRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  skillRowOn: { backgroundColor: `${colors.brand}0d` },
  skillRowText: { flex: 1, fontSize: 15, fontFamily: fontFamily.regular, color: colors.textPrimary, paddingRight: 12 },
  skillRowCheck: { fontSize: 18, color: colors.brand, fontFamily: fontFamily.semiBold },
  emptySkills: { padding: 24, textAlign: "center", fontFamily: fontFamily.regular, color: colors.textMuted },
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
