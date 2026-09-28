import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { useAppCopy, useAppLanguage } from "@/lib/i18n";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { GshGradientPrimaryButton } from "@/components/GshGradientPrimaryButton";
import { CandidateReadinessSummary } from "@/components/CandidateReadinessSummary";
import { GshScreenShell } from "@/components/GshScreenShell";
import { GuestProfileHub } from "@/components/GuestProfileHub";
import { BrandLinkRow, DecorRing, DepthButton, DepthSurface, Eyebrow } from "@/components/gsh-brand";
import { fetchOwnProfile, recordCandidateJourneyStart, updateProfile, uploadFileFromUri } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import { JOB_PREFERENCE_OPTIONS } from "@/lib/job-preferences";
import { getCandidateCompletionBreakdown } from "@/lib/profile-completion";
import { getAllSkillsSorted } from "@/lib/skills-data";
import { tabBarBottomPadding } from "@/lib/android-insets";
import { colors, feedCardStyle, fontFamily, radii } from "@/lib/theme";

const ALL_SKILLS = getAllSkillsSorted();
const MAX_SKILLS = 30;
const SPONSORSHIP_OPTIONS = [
  "Requires sponsorship",
  "No sponsorship required",
  "Already sponsored",
  "Open to relocation support",
] as const;
const NOTICE_OPTIONS = [
  "Immediately available",
  "1-2 weeks",
  "1 month",
  "2 months",
  "3 months",
  "More than 3 months",
] as const;
const SEARCH_INTENT_OPTIONS = [
  "Actively applying now",
  "Open to the right role",
  "Exploring relocation options",
  "Not actively looking",
] as const;
const RELOCATION_OPTIONS = [
  "Ready to relocate",
  "Can relocate with employer support",
  "Remote-first only",
  "Exploring options",
  "Not willing to relocate",
] as const;

function mergeCandidateExtras(profile: Record<string, unknown> | undefined, userEmail: string | undefined, body: Record<string, unknown>) {
  const p = profile ?? {};
  const existingEmail = typeof p.email === "string" ? p.email.trim() : "";
  if (!existingEmail) { const em = userEmail?.trim(); if (em) body.email = em; }
  if (!((typeof p.currentCompany === "string") ? p.currentCompany.trim() : "")) body.currentCompany = "Not specified";
}

function SectionCard({ title, children, initiallyOpen = false }: { title: string; children: React.ReactNode; initiallyOpen?: boolean }) {
  const [open, setOpen] = useState(initiallyOpen);
  return (
    <View style={[styles.sectionCard, feedCardStyle()]}>
      <Pressable onPress={() => setOpen(value => !value)} accessibilityRole="button" accessibilityState={{ expanded: open }} accessibilityLabel={title} style={{ minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <Text style={[styles.sectionCardTitle, { flex: 1, marginBottom: 0, textTransform: "none", fontFamily: fontFamily.heading, color: colors.navy, fontSize: 16 }]}>{title}</Text>
        <Ionicons name={open ? "chevron-up" : "chevron-down"} size={20} color={colors.accent} />
      </Pressable>
      <View style={{ display: open ? "flex" : "none", paddingTop: 16 }}>{children}</View>
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

function ChoiceChips({
  options,
  value,
  onChange,
}: {
  options: readonly string[];
  value: string;
  onChange: (next: string) => void;
}) {
  const ac = useAccountCopy();
  return (
    <View style={[styles.chipGrid, styles.choiceChipGrid]}>
      {options.map((option) => {
        const selected = value === option;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={[styles.prefChip, selected && styles.prefChipOn]}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
          >
            {selected ? <Ionicons name="checkmark" size={13} color={colors.white} style={{ marginRight: 4 }} /> : null}
            <Text style={[styles.prefChipText, selected && styles.prefChipTextOn]}>{ac(option)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const ACCOUNT_LINKS = [
  { title: "Work and move preferences", subtitle: "Choose who can find and contact you", icon: "earth-outline" as const, href: "/mobility-profile" },
  { title: "Invites to apply", subtitle: "Review employer and agency invites", icon: "people-circle-outline" as const, href: "/agency-introductions" },
  { title: "Partner offers and codes", subtitle: "Partner discount codes", icon: "gift-outline" as const, href: "/offers" },
] as const;

export default function ProfileTab() {
  const signedIn = Boolean(useAuthStore((s) => s.token));
  return signedIn ? <ProfileScreen /> : <GuestProfileHub />;
}

function ProfileScreen() {
 const ac = useAccountCopy();
 const { t } = useAppCopy();
 const locale = useAppLanguage(s => s.locale);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const user = useAuthStore((s) => s.user);
  const scrollRef = useRef<ScrollView>(null);
  const formSectionY = useRef(0);
  const contentSectionY = useRef(0);

  const profileQuery = useQuery({ queryKey: ["profile", "me"], queryFn: fetchOwnProfile });

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [location, setLocation] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [nationality, setNationality] = useState("");
  const [currentJobTitle, setCurrentJobTitle] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [primaryIndustry, setPrimaryIndustry] = useState("");
  const [sponsorshipStatus, setSponsorshipStatus] = useState("");
  const [noticePeriod, setNoticePeriod] = useState("");
  const [jobSearchIntent, setJobSearchIntent] = useState("");
  const [relocationReadiness, setRelocationReadiness] = useState("");
  const [targetCountries, setTargetCountries] = useState("");
  const [careerSummary, setCareerSummary] = useState("");
  const [workTitle, setWorkTitle] = useState("");
  const [workCompany, setWorkCompany] = useState("");
  const [educationDegree, setEducationDegree] = useState("");
  const [educationSchool, setEducationSchool] = useState("");
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
    setNationality(typeof p.nationality === "string" ? p.nationality : "");
    setCurrentJobTitle(typeof p.currentJobTitle === "string" ? p.currentJobTitle : "");
    setYearsOfExperience(typeof p.yearsOfExperience === "number" ? String(p.yearsOfExperience) : "");
    const industry = p.industryExperience as { primary?: unknown } | undefined;
    setPrimaryIndustry(typeof industry?.primary === "string" ? industry.primary : "");
    setSponsorshipStatus(typeof p.sponsorshipStatus === "string" ? p.sponsorshipStatus : "");
    setNoticePeriod(typeof p.noticePeriod === "string" ? p.noticePeriod : "");
    setJobSearchIntent(typeof p.jobSearchIntent === "string" ? p.jobSearchIntent : "");
    setRelocationReadiness(typeof p.relocationReadiness === "string" ? p.relocationReadiness : "");
    setTargetCountries(
      Array.isArray(p.targetCountries)
        ? (p.targetCountries as unknown[]).filter((value): value is string => typeof value === "string").join(", ")
        : ""
    );
    setCareerSummary(typeof p.careerSummary === "string" ? p.careerSummary : "");
    const firstWork = Array.isArray(p.workHistory) ? p.workHistory[0] as Record<string, unknown> | undefined : undefined;
    setWorkTitle(typeof firstWork?.title === "string" ? firstWork.title : "");
    setWorkCompany(typeof firstWork?.company === "string" ? firstWork.company : "");
    const firstEducation = Array.isArray(p.educationHistory)
      ? p.educationHistory[0] as Record<string, unknown> | undefined
      : undefined;
    setEducationDegree(typeof firstEducation?.degree === "string" ? firstEducation.degree : "");
    setEducationSchool(typeof firstEducation?.school === "string" ? firstEducation.school : "");
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
      if (skills.length === 0) return Promise.reject(new Error("PROFILE_INPUT_0"));
      if (jobPreferences.length === 0) return Promise.reject(new Error("PROFILE_INPUT_1"));
      if ((workTitle.trim() && !workCompany.trim()) || (!workTitle.trim() && workCompany.trim())) {
        return Promise.reject(new Error("PROFILE_INPUT_2"));
      }
      if ((educationDegree.trim() && !educationSchool.trim()) || (!educationDegree.trim() && educationSchool.trim())) {
        return Promise.reject(new Error("PROFILE_INPUT_3"));
      }

      const profile = profileQuery.data ?? {};
      const existingIndustry = profile.industryExperience as { secondary?: unknown } | undefined;
      const existingWorkHistory = Array.isArray(profile.workHistory) ? profile.workHistory : [];
      const existingEducationHistory = Array.isArray(profile.educationHistory) ? profile.educationHistory : [];
      const parsedYears = yearsOfExperience.trim() === "" ? undefined : Number(yearsOfExperience);
      if (parsedYears !== undefined && (!Number.isFinite(parsedYears) || parsedYears < 0 || parsedYears > 50)) {
        return Promise.reject(new Error("PROFILE_INPUT_4"));
      }

      const body: Record<string, unknown> = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim(),
        location: location.trim(),
        linkedin_profile: linkedin.trim(),
        nationality: nationality.trim(),
        currentJobTitle: currentJobTitle.trim(),
        ...(parsedYears !== undefined ? { yearsOfExperience: parsedYears } : {}),
        industryExperience: {
          primary: primaryIndustry.trim(),
          secondary: Array.isArray(existingIndustry?.secondary)
            ? existingIndustry.secondary.filter((value): value is string => typeof value === "string").slice(0, 2)
            : [],
        },
        sponsorshipStatus,
        noticePeriod,
        jobSearchIntent,
        relocationReadiness,
        targetCountries: targetCountries.split(",").map((country) => country.trim()).filter(Boolean).slice(0, 12),
        careerSummary: careerSummary.trim(),
        workHistory:
          workTitle.trim() && workCompany.trim()
            ? [{ ...(existingWorkHistory[0] as Record<string, unknown> | undefined), title: workTitle.trim(), company: workCompany.trim() }, ...existingWorkHistory.slice(1)]
            : existingWorkHistory,
        educationHistory:
          educationDegree.trim() && educationSchool.trim()
            ? [{ ...(existingEducationHistory[0] as Record<string, unknown> | undefined), degree: educationDegree.trim(), school: educationSchool.trim() }, ...existingEducationHistory.slice(1)]
            : existingEducationHistory,
        skills,
        jobPreferences,
      };
      mergeCandidateExtras(profileQuery.data, user?.email, body);
      return updateProfile(body);
    },
    onSuccess: () => {
      void Promise.all([
        qc.invalidateQueries({ queryKey: ["profile", "me"] }),
        qc.invalidateQueries({ queryKey: ["analytics", "candidate-dashboard"] }),
      ]);
      Alert.alert(ac("Profile saved"), ac("Your profile details have been saved."));
    },
    onError: (e: unknown) => {
 const localErrors: Record<string,string> = {"PROFILE_INPUT_0": ac("Select at least one skill."), "PROFILE_INPUT_1": ac("Select at least one work preference."), "PROFILE_INPUT_2": ac("Add both a role title and company for work experience."), "PROFILE_INPUT_3": ac("Add both a qualification and institution."), "PROFILE_INPUT_4": ac("Years of experience must be between 0 and 50.")};
 Alert.alert(ac("Could not save"), ac(e instanceof Error && localErrors[e.message] ? localErrors[e.message] : "Could not save settings. Try again."));
 },
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
    onSuccess: () => {
      void Promise.all([
        qc.invalidateQueries({ queryKey: ["profile", "me"] }),
        qc.invalidateQueries({ queryKey: ["analytics", "candidate-dashboard"] }),
      ]);
    },
    onError: (e: unknown) => { if (e instanceof Error && e.message === "cancel") return; Alert.alert(ac("Upload failed"), ac("Your file could not be uploaded. Try again.")); },
  });

  const p = profileQuery.data;
  const profileErrCopy = profileQuery.isError;
  const completionBreakdown = getCandidateCompletionBreakdown(p, locale);
  const resumeUrl = typeof p?.resume === "string" ? p.resume : "";
  const displayName = [firstName, lastName].filter(Boolean).join(" ") || user?.email || ac("Your profile");
  const initials = [firstName.charAt(0), lastName.charAt(0)].filter(Boolean).join("").toUpperCase() || "?";
  const avatarUrl = typeof p?.profile_picture === "string" ? p.profile_picture.trim() : "";
  const openToRelocate =
    relocationReadiness === "Ready to relocate" || relocationReadiness === "Can relocate with employer support";

  function scrollToForm() {
    scrollRef.current?.scrollTo({ y: contentSectionY.current + formSectionY.current, animated: true });
  }

  function logout() {
    Alert.alert(ac("Sign out"), ac("You can keep browsing jobs without an account."), [
      { text: ac("Cancel"), style: "cancel" },
      { text: ac("Sign out"), style: "destructive", onPress: () => { qc.clear(); clearAuth(); router.navigate("/(tabs)/home"); } },
    ]);
  }

  if (profileQuery.isLoading) {
    return (
      <GshScreenShell constrainTabletWidth>
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.brand} size="large" />
        </View>
      </GshScreenShell>
    );
  }

  return (
    <GshScreenShell constrainTabletWidth style={styles.shell}>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: tabBarBottomPadding(insets.bottom) },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator
        nestedScrollEnabled
        bounces
      >
        <View style={[styles.hero, { paddingTop: Math.max(insets.top, 12) + 10 }]}>
          <DecorRing size={260} thickness={36} color="rgba(255,255,255,0.3)" style={{ top: -110, right: -100 }} />
          <View style={styles.heroTop}>
            <Eyebrow color={colors.navy}>{t("profile")}</Eyebrow>
            <Pressable
              onPress={() => router.push("/settings")}
              style={styles.settingsButton}
              accessibilityRole="button"
              accessibilityLabel={ac("Settings")}
            >
              <Ionicons name="settings-outline" size={21} color={colors.navy} />
            </Pressable>
          </View>
          <View style={styles.identity}>
            <View style={styles.avatarRing}>
              <View style={styles.avatarInner}>
                {avatarUrl ? (
                  <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.profileAvatarText}>{initials}</Text>
                )}
              </View>
              <View style={styles.percentBadge}>
                <Text style={styles.percentText}>{completionBreakdown.percent}%</Text>
              </View>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.profileName} numberOfLines={2}>{displayName}</Text>
              {currentJobTitle ? (
                <Text style={styles.profileHeadline} numberOfLines={1}>{currentJobTitle}</Text>
              ) : null}
              <Text style={styles.profileEmail} numberOfLines={1}>{user?.email ?? ""}</Text>
              {openToRelocate ? (
                <View style={styles.relocatePill}>
                  <Ionicons name="airplane" size={12} color={colors.cyan} />
                  <Text style={styles.relocateText}>{ac("Open to relocate")}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        <View style={styles.editCtaPad}>
          {completionBreakdown.missing.length > 0 ? (
            <DepthSurface face={colors.navy} depthColor={colors.navyDeep} depth={6} radius={24}>
              <View style={styles.finishCard}>
                <Eyebrow onDark>{ac("Your next step")}</Eyebrow>
                <Text style={styles.finishTitle}>{ac("Finish your profile")}</Text>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${Math.max(4, completionBreakdown.percent)}%` }]} />
                </View>
                {completionBreakdown.missing.slice(0, 3).map((item) => (
                  <View key={item.path} style={styles.finishRow}>
                    <Ionicons name="ellipse-outline" size={16} color={colors.cyan} />
                    <Text style={styles.finishRowText} numberOfLines={1}>{item.label}</Text>
                  </View>
                ))}
                <DepthButton
                  title={ac("Edit profile")}
                  onPress={scrollToForm}
                  variant="cyanOnNavy"
                  size="md"
                  style={{ marginTop: 16 }}
                />
              </View>
            </DepthSurface>
          ) : (
            <DepthButton title={ac("Edit profile")} onPress={scrollToForm} variant="navyOnLight" icon="create-outline" />
          )}
        </View>

        <View style={styles.content} onLayout={event => {contentSectionY.current = event.nativeEvent.layout.y;}}>
          {profileErrCopy ? (
            <View style={styles.errorBanner}>
              <Ionicons name="warning-outline" size={18} color="#b45309" />
              <Text style={styles.errorText}>
                {ac("Your profile details could not be loaded.")}
              </Text>
            </View>
          ) : null}

          <CandidateReadinessSummary profile={p} accountEmail={user?.email} />

          {completionBreakdown.missing.length > 0 ? (
            <SectionCard title={ac("Details to review")}>
              <Text style={styles.completionHelp}>{ac("These details help with applications and your job search. Add only information that is correct.")}</Text>
              <View style={styles.missingList}>
                {completionBreakdown.missing.map((item) => (
                  <View key={item.path} style={styles.missingRow}>
                    <View style={styles.missingDot} />
                    <Text style={styles.missingText}>{item.label}</Text>
                  </View>
                ))}
              </View>
            </SectionCard>
          ) : null}

          <View
            style={styles.formBlock}
            onLayout={(e) => {
              formSectionY.current = e.nativeEvent.layout.y;
            }}
          >
          <SectionCard title={ac("Basic info")} initiallyOpen>
            <FieldLabel label={ac("First name")} />
            <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder={ac("First name")} placeholderTextColor={colors.placeholder} />
            <FieldLabel label={ac("Last name")} />
            <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder={ac("Last name")} placeholderTextColor={colors.placeholder} />
            <FieldLabel label={ac("Phone number")} />
            <TextInput style={styles.input} value={phoneNumber} onChangeText={setPhoneNumber} placeholder={ac("Phone number")} placeholderTextColor={colors.placeholder} keyboardType="phone-pad" />
            <FieldLabel label={ac("Location")} />
            <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder={ac("City and country")} placeholderTextColor={colors.placeholder} />
            <FieldLabel label={ac("Citizenship")} hint={ac("Used to understand relevant mobility options.")} />
            <TextInput style={[styles.input, { marginBottom: 0 }]} value={nationality} onChangeText={setNationality} placeholder={ac("Citizenship")} placeholderTextColor={colors.placeholder} />
          </SectionCard>

          <SectionCard title={ac("Professional details")}>
            <FieldLabel label={ac("Current or most recent role")} />
            <TextInput style={styles.input} value={currentJobTitle} onChangeText={setCurrentJobTitle} placeholder={ac("Role title")} placeholderTextColor={colors.placeholder} />
            <FieldLabel label={ac("Years of experience")} />
            <TextInput
              style={styles.input}
              value={yearsOfExperience}
              onChangeText={setYearsOfExperience}
              placeholder="0"
              placeholderTextColor={colors.placeholder}
              keyboardType="number-pad"
            />
            <FieldLabel label={ac("Primary industry")} />
            <TextInput style={[styles.input, { marginBottom: 0 }]} value={primaryIndustry} onChangeText={setPrimaryIndustry} placeholder={ac("Primary industry")} placeholderTextColor={colors.placeholder} />
          </SectionCard>

          <SectionCard title={ac("Mobility readiness")}>
            <FieldLabel label={ac("Sponsorship status")} />
            <ChoiceChips options={SPONSORSHIP_OPTIONS} value={sponsorshipStatus} onChange={setSponsorshipStatus} />
            <FieldLabel label={ac("Notice period")} />
            <ChoiceChips options={NOTICE_OPTIONS} value={noticePeriod} onChange={setNoticePeriod} />
            <FieldLabel label={ac("Job-search intent")} />
            <ChoiceChips options={SEARCH_INTENT_OPTIONS} value={jobSearchIntent} onChange={setJobSearchIntent} />
            <FieldLabel label={ac("Relocation readiness")} />
            <ChoiceChips options={RELOCATION_OPTIONS} value={relocationReadiness} onChange={setRelocationReadiness} />
            <FieldLabel label={ac("Target countries")} hint={ac("Separate countries with commas.")} />
            <TextInput
              style={[styles.input, { marginBottom: 0 }]}
              value={targetCountries}
              onChangeText={setTargetCountries}
              placeholder={ac("Target countries")}
              placeholderTextColor={colors.placeholder}
            />
          </SectionCard>

          <SectionCard title={ac("Career evidence")}>
            <FieldLabel label={ac("Career summary")} hint={ac("Summarise your experience, strengths and next role.")} />
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={careerSummary}
              onChangeText={setCareerSummary}
              placeholder={ac("Summarise your experience, strengths and next role.")}
              placeholderTextColor={colors.placeholder}
              multiline
              textAlignVertical="top"
            />
            <FieldLabel label={ac("Most recent work experience")} />
            <TextInput style={styles.input} value={workTitle} onChangeText={setWorkTitle} placeholder={ac("Role title")} placeholderTextColor={colors.placeholder} />
            <TextInput style={styles.input} value={workCompany} onChangeText={setWorkCompany} placeholder={ac("Company")} placeholderTextColor={colors.placeholder} />
            <FieldLabel label={ac("Education and qualifications")} />
            <TextInput style={styles.input} value={educationDegree} onChangeText={setEducationDegree} placeholder={ac("Degree, trade or professional qualification")} placeholderTextColor={colors.placeholder} />
            <TextInput style={[styles.input, { marginBottom: 0 }]} value={educationSchool} onChangeText={setEducationSchool} placeholder={ac("Institution or awarding body")} placeholderTextColor={colors.placeholder} />
          </SectionCard>

          {/* Online presence */}
          <SectionCard title={ac("Online presence")}>
            <FieldLabel label={ac("LinkedIn URL")} />
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
          <SectionCard title={ac("Work preferences")}>
            <FieldLabel label={ac("How you want to work")} />
            <View style={styles.chipGrid}>
              {JOB_PREFERENCE_OPTIONS.map((pref) => {
                const on = jobPreferences.includes(pref);
                return (
                  <Pressable key={pref} onPress={() => toggleJobPreference(pref)} style={[styles.prefChip, on && styles.prefChipOn]}>
                    {on && <Ionicons name="checkmark" size={13} color={colors.white} style={{ marginRight: 4 }} />}
                    <Text style={[styles.prefChipText, on && styles.prefChipTextOn]}>{ac(pref)}</Text>
                  </Pressable>
                );
              })}
            </View>
          </SectionCard>

          {/* Skills */}
          <SectionCard title={ac("Skills")}>
            <View style={styles.skillsTopRow}>
              <Text style={styles.skillsCount}>{ac("Selected: {count}", {count: skills.length})} / {MAX_SKILLS}</Text>
              <Pressable style={styles.addSkillBtn} onPress={() => { setSkillSearch(""); setSkillModalOpen(true); }}>
                <Ionicons name="add" size={16} color={colors.white} />
                <Text style={styles.addSkillBtnText}>{ac("Add skills")}</Text>
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
              <Text style={styles.emptySkillsHint}>{ac("Use Add skills to select at least one skill for your application.")}</Text>
            )}
          </SectionCard>

          {/* CV */}
          <SectionCard title={ac("CV or résumé")}>
            <View style={styles.cvRow}>
              <View style={[styles.cvIconTile, resumeUrl ? styles.cvIconTileHas : {}]}>
                <Ionicons name={resumeUrl ? "document-text" : "document-text-outline"} size={22} color={resumeUrl ? colors.brand : colors.textMuted} />
              </View>
              <View style={styles.cvTextCol}>
                <Text style={styles.cvStatus}>{resumeUrl ? ac("CV on file") : ac("No CV uploaded yet")}</Text>
                <Text style={styles.cvHint}>{resumeUrl ? ac("Tap below to replace") : ac("Upload PDF or Word")}</Text>
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
                  <Text style={styles.uploadBtnText}>{resumeUrl ? ac("Replace CV") : ac("Upload CV")}</Text>
                </>
              )}
            </Pressable>
          </SectionCard>

          <View style={styles.accountList}>
            <Text style={styles.accountHeading}>{ac("Your account")}</Text>
            {ACCOUNT_LINKS.map((row) => (
              <BrandLinkRow
                key={row.href}
                icon={row.icon}
                label={ac(row.title)}
                hint={ac(row.subtitle)}
                onPress={() => {
                  if (row.href === "/mobility-profile") void recordCandidateJourneyStart("global_mobility_profile_started");
                  router.push(row.href);
                }}
              />
            ))}
          </View>

          {/* Sign out */}
          <Pressable style={styles.signOutBtn} onPress={logout}>
            <Ionicons name="log-out-outline" size={18} color={colors.error} />
            <Text style={styles.signOutText}>{ac("Sign out")}</Text>
          </Pressable>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.saveBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        <View style={styles.saveBarCopy}>
          <Text style={styles.saveBarTitle}>{ac("Profile changes")}</Text>
          <Text style={[styles.saveBarStatus, saveMut.isError && styles.saveBarError]}>
            {saveMut.isError ? ac("Save failed. Try again when ready.") : ac("Keep your profile up to date for job comparisons.")}
          </Text>
        </View>
        <GshGradientPrimaryButton
          title={saveMut.isError ? ac("Save profile") : ac("Save profile")}
          onPress={() => saveMut.mutate()}
          loading={saveMut.isPending}
          containerStyle={styles.saveBarButton}
        />
      </View>

      {/* Skill picker modal */}
      <Modal visible={skillModalOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={closeSkillModal}>
        <SafeAreaView style={styles.modalSafe} edges={["top"]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{ac("Select skills")}</Text>
            <Pressable onPress={closeSkillModal} hitSlop={12}>
              <Text style={styles.modalDone}>{ac("Done")}</Text>
            </Pressable>
          </View>
          <View style={styles.modalSearch}>
            <Ionicons name="search" size={18} color={colors.placeholder} />
            <TextInput
              style={styles.modalSearchInput}
              value={skillSearch}
              onChangeText={setSkillSearch}
              placeholder={ac("Search skills…")}
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
            ListEmptyComponent={<Text style={styles.emptySkillsHint}>{ac("No matches.")}</Text>}
          />
        </SafeAreaView>
      </Modal>
    </GshScreenShell>
  );
}

const styles = StyleSheet.create({
  shell: { backgroundColor: colors.pale },
  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  hero: {
    backgroundColor: colors.cyan,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: "hidden",
  },
  heroTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.navy,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  identity: { marginTop: 14, flexDirection: "row", alignItems: "center", gap: 16 },
  editCtaPad: { paddingHorizontal: 16, paddingTop: 18 },
  avatarRing: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 3,
    borderColor: colors.navy,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInner: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: { width: "100%", height: "100%" },
  percentBadge: {
    position: "absolute",
    bottom: -8,
    alignSelf: "center",
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colors.navy,
    borderWidth: 2,
    borderColor: colors.white,
  },
  percentText: { fontFamily: fontFamily.extraBold, fontSize: 11, color: colors.cyan },
  profileAvatarText: { fontSize: 26, fontFamily: fontFamily.extraBold, color: colors.cyan },
  profileName: { fontSize: 22, lineHeight: 26, fontFamily: fontFamily.headingStrong, color: colors.navy, letterSpacing: -0.5 },
  profileHeadline: { marginTop: 2, fontSize: 14, fontFamily: fontFamily.semiBold, color: colors.navy },
  profileEmail: { marginTop: 2, fontSize: 13, fontFamily: fontFamily.regular, color: "rgba(13,25,78,0.7)" },
  relocatePill: {
    alignSelf: "flex-start",
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.navy,
  },
  relocateText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.white },
  finishCard: { padding: 20 },
  finishTitle: {
    marginTop: 4,
    fontFamily: fontFamily.headingStrong,
    fontSize: 22,
    letterSpacing: -0.5,
    color: colors.white,
  },
  progressTrack: {
    marginTop: 14,
    marginBottom: 6,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.14)",
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 5, backgroundColor: colors.cyan },
  finishRow: { minHeight: 36, flexDirection: "row", alignItems: "center", gap: 10 },
  finishRowText: { flex: 1, fontFamily: fontFamily.semiBold, fontSize: 14, color: colors.white },
  content: { paddingHorizontal: 16, paddingTop: 16, gap: 14 },
  accountList: { gap: 10 },
  accountHeading: { fontFamily: fontFamily.headingStrong, fontSize: 20, color: colors.navy, marginBottom: 2 },
  formBlock: { gap: 14 },

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
  completionHelp: {
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
    lineHeight: 19,
    marginBottom: 12,
  },
  missingList: { gap: 8 },
  missingRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  missingDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.brand },
  missingText: { flex: 1, fontSize: 13, fontFamily: fontFamily.medium, color: colors.textPrimary },

  sectionCard: {
    padding: 16,
    borderRadius: radii.lg,
    marginBottom: 0,
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
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 13 : 10,
    fontSize: 16,
    fontFamily: fontFamily.regular,
    color: colors.textPrimary,
    backgroundColor: "#fafbfc",
    marginBottom: 14,
  },
  multilineInput: { minHeight: 110, paddingTop: 12 },

  // Chips
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  choiceChipGrid: { marginBottom: 16 },
  prefChip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
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
    minHeight: 44,
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
    minHeight: 48,
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
    minHeight: 48,
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
  saveBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  saveBarCopy: { flex: 1, minWidth: 0 },
  saveBarTitle: { fontSize: 13, fontFamily: fontFamily.bold, color: colors.navy },
  saveBarStatus: { marginTop: 2, fontSize: 11, lineHeight: 15, fontFamily: fontFamily.regular, color: colors.textMuted },
  saveBarError: { color: colors.error },
  saveBarButton: { minWidth: 138 },

  // Modal
  modalSafe: { flex: 1, backgroundColor: colors.white },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  modalTitle: { fontSize: 17, fontFamily: fontFamily.bold, color: colors.navy },
  modalDone: { fontSize: 16, fontFamily: fontFamily.semiBold, color: colors.brand },
  modalSearch: { flexDirection: "row", alignItems: "center", gap: 10, margin: 12, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, backgroundColor: colors.surfaceMuted, borderWidth: 1, borderColor: colors.border },
  modalSearchInput: { flex: 1, minHeight: 44, fontSize: 16, fontFamily: fontFamily.regular, color: colors.textPrimary },
  skillRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  skillRowOn: { backgroundColor: `${colors.brand}08` },
  skillRowText: { flex: 1, fontSize: 15, fontFamily: fontFamily.regular, color: colors.textPrimary },
  skillRowTextOn: { fontFamily: fontFamily.semiBold, color: colors.navy },
  skillRowCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: colors.borderStrong },
});
