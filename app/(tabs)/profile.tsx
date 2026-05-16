import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
import { GshCompletionStrip, GshLinkRow, GshSectionTitle } from "@/components/gsh-ui-kit";
import { fetchOwnProfile, updateProfile, uploadFileFromUri } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import { JOB_PREFERENCE_OPTIONS } from "@/lib/job-preferences";
import { getAllSkillsSorted } from "@/lib/skills-data";
import { colors, fontFamily, radii } from "@/lib/theme";

const ALL_SKILLS = getAllSkillsSorted();
const MAX_SKILLS = 30;

function mergeCandidateExtras(profile: Record<string, unknown> | undefined, userEmail: string | undefined, body: Record<string, unknown>) {
  const p = profile ?? {};
  const existingEmail = typeof p.email === "string" ? p.email.trim() : "";
  if (!existingEmail) { const em = userEmail?.trim(); if (em) body.email = em; }
  if (!((typeof p.currentJobTitle === "string") ? p.currentJobTitle.trim() : "")) body.currentJobTitle = "Not specified";
  if (!((typeof p.currentCompany === "string") ? p.currentCompany.trim() : "")) body.currentCompany = "Not specified";
  const yoe = p.yearsOfExperience;
  if (typeof yoe !== "number" || yoe < 0) body.yearsOfExperience = 0;
  const ie = p.industryExperience as { primary?: string; secondary?: string[] } | undefined;
  if (!ie?.primary?.trim()) {
    body.industryExperience = { primary: "General", secondary: Array.isArray(ie?.secondary) ? ie.secondary.filter(Boolean).slice(0, 2) : [] };
  }
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionCardTitle}>{title}</Text>
      {children}
    </View>
  );
}

function FieldLabel({ label, hint }: { label: string; hint?: string }) {
  return (
    <View style={styles.fieldLabelWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {hint ? <Text style={styles.fieldHint}>{hint}</Text> : null}
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const user = useAuthStore((s) => s.user);

  const profileQuery = useQuery({ queryKey: ["profile", "me"], queryFn: fetchOwnProfile });

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
    setJobPreferences(Array.isArray(p.jobPreferences) ? (p.jobPreferences as unknown[]).filter((x): x is string => typeof x === "string") : []);
  }, [profileQuery.data]);

  const filteredSkillChoices = useMemo(() => {
    const q = skillSearch.trim().toLowerCase();
    if (!q) return ALL_SKILLS;
    return ALL_SKILLS.filter((s) => s.toLowerCase().includes(q));
  }, [skillSearch]);

  const toggleJobPreference = (pref: string) => setJobPreferences((prev) => prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]);
  const toggleSkillChoice = (skill: string) => setSkills((prev) => { if (prev.includes(skill)) return prev.filter((s) => s !== skill); if (prev.length >= MAX_SKILLS) return prev; return [...prev, skill]; });
  const removeSkill = (skill: string) => setSkills((prev) => prev.filter((s) => s !== skill));
  const closeSkillModal = () => { setSkillModalOpen(false); setSkillSearch(""); };

  const saveMut = useMutation({
    mutationFn: () => {
      if (skills.length === 0) return Promise.reject(new Error("Select at least one skill."));
      if (jobPreferences.length === 0) return Promise.reject(new Error("Select at least one job preference."));
      const body: Record<string, unknown> = { firstName: firstName.trim(), lastName: lastName.trim(), phoneNumber: phoneNumber.trim(), location: location.trim(), linkedin_profile: linkedin.trim(), skills, jobPreferences };
      mergeCandidateExtras(profileQuery.data, user?.email, body);
      return updateProfile(body);
    },
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ["profile", "me"] }); Alert.alert("Profile saved", "Your changes are live."); },
    onError: (e: unknown) => Alert.alert("Could not save", e && typeof e === "object" && "message" in e ? String((e as { message: string }).message) : "Try again."),
  });

  const cvMut = useMutation({
    mutationFn: async () => {
      const res = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true, type: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"] });
      if (res.canceled || !res.assets?.[0]) throw new Error("cancel");
      const a = res.assets[0];
      const up = await uploadFileFromUri(a.uri, a.name || "cv.pdf", a.mimeType ?? "application/pdf");
      await updateProfile({ resume: up.url });
      return up.url;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["profile", "me"] }),
    onError: (e: unknown) => { const msg = e instanceof Error && e.message === "cancel" ? null : String(e && typeof e === "object" && "message" in e ? (e as { message: string }).message : "Upload failed"); if (msg) Alert.alert("Upload failed", msg); },
  });

  const p = profileQuery.data;
  const completion = typeof p?.profileCompletion === "number" ? p.profileCompletion : null;
  const resumeUrl = typeof p?.resume === "string" ? p.resume : "";
  const displayName = [firstName, lastName].filter(Boolean).join(" ") || user?.email || "Your profile";
  const initials = [firstName.charAt(0), lastName.charAt(0)].filter(Boolean).join("").toUpperCase() || "?";

  function logout() {
    Alert.alert("Sign out", "You will need to sign in again.", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: () => { qc.clear(); clearAuth(); router.replace("/login"); } },
    ]);
  }

  if (profileQuery.isLoading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color={colors.brand} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.shell}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Hero header */}
        <LinearGradient colors={[colors.navy, "#1a237e"]} style={styles.profileHero}>
          <SafeAreaView edges={["top"]} style={styles.profileHeroInner}>
            <View style={styles.profileAvatarCircle}>
              <Text style={styles.profileAvatarText}>{initials}</Text>
            </View>
            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.profileEmail}>{user?.email ?? ""}</Text>
            {completion != null && (
              <View style={styles.completionRow}>
                <View style={styles.completionTrack}>
                  <LinearGradient
                    colors={[colors.teal, "#0ecdd1cc"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.completionFill, { width: `${Math.min(100, completion)}%` as any }]}
                  />
                </View>
                <Text style={styles.completionLabel}>
                  {completion >= 100 ? "Profile ready — employers can see everything" : `${completion}% complete · employers see more with a full profile`}
                </Text>
              </View>
            )}
          </SafeAreaView>
        </LinearGradient>

        <View style={styles.content}>
          {profileQuery.isError && (
            <View style={styles.errorBanner}>
              <Ionicons name="warning-outline" size={18} color="#b45309" />
              <Text style={styles.errorText}>Profile could not be loaded. Check your connection.</Text>
            </View>
          )}

          {/* Basic info */}
          <SectionCard title="Basic info">
            <FieldLabel label="First name" />
            <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="First name" placeholderTextColor={colors.placeholder} />
            <FieldLabel label="Last name" />
            <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="Last name" placeholderTextColor={colors.placeholder} />
            <FieldLabel label="Phone" />
            <TextInput style={styles.input} value={phoneNumber} onChangeText={setPhoneNumber} placeholder="Phone number" placeholderTextColor={colors.placeholder} keyboardType="phone-pad" />
            <FieldLabel label="Location" />
            <TextInput style={[styles.input, { marginBottom: 0 }]} value={location} onChangeText={setLocation} placeholder="City / country" placeholderTextColor={colors.placeholder} />
          </SectionCard>

          {/* Online presence */}
          <SectionCard title="Online presence">
            <FieldLabel label="LinkedIn URL" />
            <TextInput
              style={[styles.input, { marginBottom: 0 }]}
              value={linkedin}
              onChangeText={setLinkedin}
              placeholder="https://linkedin.com/in/…"
              placeholderTextColor={colors.placeholder}
              autoCapitalize="none"
              keyboardType="url"
            />
          </SectionCard>

          {/* Work preferences */}
          <SectionCard title="Work preferences">
            <FieldLabel label="How you want to work" hint="Select all that apply" />
            <View style={styles.chipGrid}>
              {JOB_PREFERENCE_OPTIONS.map((pref) => {
                const on = jobPreferences.includes(pref);
                return (
                  <Pressable key={pref} onPress={() => toggleJobPreference(pref)} style={[styles.prefChip, on && styles.prefChipOn]}>
                    {on && <Ionicons name="checkmark" size={13} color={colors.white} style={{ marginRight: 4 }} />}
                    <Text style={[styles.prefChipText, on && styles.prefChipTextOn]}>{pref}</Text>
                  </Pressable>
                );
              })}
            </View>
          </SectionCard>

          {/* Skills */}
          <SectionCard title="Skills">
            <View style={styles.skillsTopRow}>
              <Text style={styles.skillsCount}>{skills.length} selected{skills.length >= MAX_SKILLS ? " · max" : ""}</Text>
              <Pressable style={styles.addSkillBtn} onPress={() => { setSkillSearch(""); setSkillModalOpen(true); }}>
                <Ionicons name="add" size={16} color={colors.white} />
                <Text style={styles.addSkillBtnText}>Add skills</Text>
              </Pressable>
            </View>
            {skills.length > 0 ? (
              <View style={styles.chipGrid}>
                {skills.map((s) => (
                  <Pressable key={s} onPress={() => removeSkill(s)} style={[styles.prefChip, styles.prefChipOn, styles.skillChipActive]}>
                    <Text style={[styles.prefChipText, styles.prefChipTextOn]}>{s}</Text>
                    <Ionicons name="close" size={13} color={colors.white} style={{ marginLeft: 4 }} />
                  </Pressable>
                ))}
              </View>
            ) : (
              <Text style={styles.emptySkillsHint}>Tap "Add skills" — at least one is required to apply.</Text>
            )}
          </SectionCard>

          {/* CV */}
          <SectionCard title="CV / resume">
            <View style={styles.cvRow}>
              <View style={[styles.cvIconTile, resumeUrl ? styles.cvIconTileHas : {}]}>
                <Ionicons name={resumeUrl ? "document-text" : "document-text-outline"} size={22} color={resumeUrl ? colors.brand : colors.textMuted} />
              </View>
              <View style={styles.cvTextCol}>
                <Text style={styles.cvStatus}>{resumeUrl ? "CV on file" : "No CV uploaded yet"}</Text>
                <Text style={styles.cvHint}>{resumeUrl ? "CV on file — replace anytime with an updated PDF or Word doc." : "Upload your CV so employers can review your background before they reach out."}</Text>
              </View>
            </View>
            <Pressable
              style={[styles.uploadBtn, cvMut.isPending && styles.disabledBtn]}
              onPress={() => cvMut.mutate()}
              disabled={cvMut.isPending}
            >
              {cvMut.isPending ? (
                <ActivityIndicator color={colors.brand} size="small" />
              ) : (
                <>
                  <Ionicons name="cloud-upload-outline" size={18} color={colors.brand} />
                  <Text style={styles.uploadBtnText}>{resumeUrl ? "Replace CV" : "Upload CV"}</Text>
                </>
              )}
            </Pressable>
          </SectionCard>

          <GshSectionTitle title="Guides & tools" topSpacing="lg" />
          <GshLinkRow title="Guides hub" subtitle="Country guides and pillars" icon="compass-outline" accent="ocean" onPress={() => router.push("/guides")} />
          <GshLinkRow title="Visa wizard" subtitle="Sponsorship & mobility questionnaire" icon="sparkles-outline" accent="teal" onPress={() => router.push("/visa-wizard")} />
          <GshLinkRow title="Tools & resources" subtitle="ATS, career toolkit, blog, FAQs" icon="layers-outline" accent="purple" onPress={() => router.push("/tools-resources")} />
          <GshLinkRow title="Saved roles" subtitle="Your bookmarked jobs" icon="bookmark-outline" accent="teal" onPress={() => router.push("/saved")} />
          <GshLinkRow title="Job alerts" subtitle="Matches and email preferences" icon="flash-outline" accent="ocean" onPress={() => router.push("/alerts")} />
          <GshLinkRow title="Partner directory" subtitle="Relocation, legal & services" icon="people-outline" accent="teal" onPress={() => router.push("/partners")} />
          <GshLinkRow title="Offers & perks" subtitle="Partner deals and codes" icon="gift-outline" accent="purple" onPress={() => router.push("/offers")} />
          <GshLinkRow title="Notification inbox" subtitle="Account and application updates" icon="notifications-outline" accent="teal" onPress={() => router.push("/notification-feed")} />
          <GshLinkRow title="Feedback & support" subtitle="Report issues or ideas" icon="chatbox-ellipses-outline" accent="teal" onPress={() => router.push("/feedback")} />
          <GshLinkRow title="Settings" subtitle="Password, preferences, delete account" icon="settings-outline" accent="ocean" onPress={() => router.push("/settings")} />

          {/* Save button */}
          <GshGradientPrimaryButton title="Save profile" onPress={() => saveMut.mutate()} loading={saveMut.isPending} containerStyle={{ marginBottom: 12, marginTop: 8 }} />

          {/* Sign out */}
          <Pressable style={styles.signOutBtn} onPress={logout}>
            <Ionicons name="log-out-outline" size={18} color={colors.error} />
            <Text style={styles.signOutText}>Sign out</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Skill picker modal */}
      <Modal visible={skillModalOpen} animationType="slide" onRequestClose={closeSkillModal}>
        <SafeAreaView style={styles.modalSafe} edges={["top"]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select skills</Text>
            <Pressable onPress={closeSkillModal} hitSlop={12}>
              <Text style={styles.modalDone}>Done</Text>
            </Pressable>
          </View>
          <View style={styles.modalSearch}>
            <Ionicons name="search" size={18} color={colors.placeholder} />
            <TextInput
              style={styles.modalSearchInput}
              value={skillSearch}
              onChangeText={setSkillSearch}
              placeholder="Search skills…"
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor={colors.placeholder}
            />
          </View>
          <FlatList
            data={filteredSkillChoices}
            keyExtractor={(item) => item}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const selected = skills.includes(item);
              return (
                <Pressable style={[styles.skillRow, selected && styles.skillRowOn]} onPress={() => toggleSkillChoice(item)}>
                  <Text style={[styles.skillRowText, selected && styles.skillRowTextOn]}>{item}</Text>
                  {selected ? <Ionicons name="checkmark-circle" size={20} color={colors.brand} /> : <View style={styles.skillRowCircle} />}
                </Pressable>
              );
            }}
            ListEmptyComponent={<Text style={styles.emptySkillsHint}>No matches.</Text>}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: "#f1f5f9" },
  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#f1f5f9" },
  scrollContent: { paddingBottom: 40 },

  // Hero
  profileHero: { paddingBottom: 28 },
  profileHeroInner: { alignItems: "center", paddingHorizontal: 20, paddingTop: 8 },
  profileAvatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  profileAvatarText: { fontSize: 28, fontFamily: fontFamily.extraBold, color: colors.white },
  profileName: { fontSize: 22, fontFamily: fontFamily.extraBold, color: colors.white, letterSpacing: -0.4 },
  profileEmail: { marginTop: 4, fontSize: 13, fontFamily: fontFamily.regular, color: "rgba(255,255,255,0.65)" },
  completionRow: { marginTop: 16, width: "100%", gap: 6 },
  completionTrack: { height: 5, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.2)", overflow: "hidden" },
  completionFill: { height: "100%", borderRadius: 3 },
  completionLabel: { fontSize: 12, fontFamily: fontFamily.medium, color: "rgba(255,255,255,0.7)", textAlign: "center" },

  content: { padding: 16, gap: 14 },

  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  errorText: { flex: 1, fontSize: 14, fontFamily: fontFamily.medium, color: "#92400e", lineHeight: 20 },

  // Section cards
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(226,232,240,0.8)",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionCardTitle: {
    fontSize: 13,
    fontFamily: fontFamily.semiBold,
    color: colors.textMuted,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    marginBottom: 14,
  },

  // Fields
  fieldLabelWrap: { marginBottom: 6 },
  fieldLabel: { fontSize: 14, fontFamily: fontFamily.semiBold, color: colors.textPrimary },
  fieldHint: { fontSize: 12, fontFamily: fontFamily.regular, color: colors.textMuted, marginTop: 2 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 13 : 10,
    fontSize: 15,
    fontFamily: fontFamily.regular,
    color: colors.textPrimary,
    backgroundColor: "#fafbfc",
    marginBottom: 14,
  },

  // Chips
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  prefChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
  },
  prefChipOn: { backgroundColor: colors.brand, borderColor: colors.brand },
  prefChipText: { fontSize: 13, fontFamily: fontFamily.semiBold, color: colors.textSecondary },
  prefChipTextOn: { color: colors.white },
  skillChipActive: {},

  // Skills
  skillsTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  skillsCount: { fontSize: 13, fontFamily: fontFamily.regular, color: colors.textMuted },
  addSkillBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
    backgroundColor: colors.brand,
  },
  addSkillBtnText: { fontSize: 13, fontFamily: fontFamily.semiBold, color: colors.white },
  emptySkillsHint: { fontSize: 14, fontFamily: fontFamily.regular, color: colors.textMuted, lineHeight: 20 },

  // CV
  cvRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  cvIconTile: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  cvIconTileHas: { backgroundColor: colors.secondaryTintBg, borderColor: colors.purpleBorder },
  cvTextCol: { flex: 1 },
  cvStatus: { fontSize: 15, fontFamily: fontFamily.semiBold, color: colors.textPrimary },
  cvHint: { marginTop: 3, fontSize: 12, fontFamily: fontFamily.regular, color: colors.textMuted, lineHeight: 17 },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.brand,
    backgroundColor: colors.white,
  },
  uploadBtnText: { fontSize: 15, fontFamily: fontFamily.semiBold, color: colors.brand },
  disabledBtn: { opacity: 0.6 },

  // Sign out
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "rgba(185, 28, 28, 0.2)",
  },
  signOutText: { fontSize: 15, fontFamily: fontFamily.semiBold, color: colors.error },

  // Modal
  modalSafe: { flex: 1, backgroundColor: colors.white },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  modalTitle: { fontSize: 17, fontFamily: fontFamily.bold, color: colors.navy },
  modalDone: { fontSize: 16, fontFamily: fontFamily.semiBold, color: colors.brand },
  modalSearch: { flexDirection: "row", alignItems: "center", gap: 10, margin: 12, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, backgroundColor: colors.surfaceMuted, borderWidth: 1, borderColor: colors.border },
  modalSearchInput: { flex: 1, fontSize: 15, fontFamily: fontFamily.regular, color: colors.textPrimary },
  skillRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  skillRowOn: { backgroundColor: `${colors.brand}08` },
  skillRowText: { flex: 1, fontSize: 15, fontFamily: fontFamily.regular, color: colors.textPrimary },
  skillRowTextOn: { fontFamily: fontFamily.semiBold, color: colors.navy },
  skillRowCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: colors.borderStrong },
});
