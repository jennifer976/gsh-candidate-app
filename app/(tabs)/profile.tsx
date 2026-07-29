import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { GshGradientPrimaryButton } from "@/components/GshGradientPrimaryButton";
import { GshLinkRow } from "@/components/gsh-ui-kit";
import { GshScreenShell } from "@/components/GshScreenShell";
import { GshTabHeroHeader } from "@/components/GshTabHeroHeader";
import { GshToolTile } from "@/components/GshToolTile";
import { fetchOwnProfile, updateProfile, uploadFileFromUri } from "@/lib/api-client";
import { presentApiError } from "@/lib/api-error";
import { useAuthStore } from "@/lib/auth-store";
import { JOB_PREFERENCE_OPTIONS } from "@/lib/job-preferences";
import { getCandidateCompletionBreakdown } from "@/lib/profile-completion";
import { getAllSkillsSorted } from "@/lib/skills-data";
import { useRelocationPerksNav } from "@/lib/use-relocation-perks-nav";
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

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={[styles.sectionCard, feedCardStyle()]}>
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

function ChoiceChips({
  options,
  value,
  onChange,
}: {
  options: readonly string[];
  value: string;
  onChange: (next: string) => void;
}) {
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
            <Text style={[styles.prefChipText, selected && styles.prefChipTextOn]}>{option}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const STATIC_MORE_TOOLS_LINKS = [
  { title: "Guides hub", subtitle: "Country guides", icon: "map-outline" as const, accent: "purple" as const, href: "/guides" },
  { title: "Job alerts", subtitle: "Match preferences", icon: "flash-outline" as const, accent: "ocean" as const, href: "/alerts" },
  { title: "Tools & resources", subtitle: "Blog, FAQs, contact", icon: "layers-outline" as const, accent: "purple" as const, href: "/tools-resources" },
  { title: "Saved roles", subtitle: "Bookmarked jobs", icon: "bookmark-outline" as const, accent: "teal" as const, href: "/saved" },
  { title: "Offers & codes", subtitle: "Partner discount codes", icon: "gift-outline" as const, accent: "purple" as const, href: "/offers" },
  { title: "Notifications", subtitle: "Account updates", icon: "notifications-outline" as const, accent: "teal" as const, href: "/notification-feed" },
  { title: "Feedback", subtitle: "Report an issue", icon: "chatbox-ellipses-outline" as const, accent: "ocean" as const, href: "/feedback" },
] as const;

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const relocationPerksNav = useRelocationPerksNav();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const user = useAuthStore((s) => s.user);
  const scrollRef = useRef<ScrollView>(null);
  const formSectionY = useRef(0);

  const profileQuery = useQuery({ queryKey: ["profile", "me"], queryFn: fetchOwnProfile });

  const moreToolsLinks = useMemo(
    () => [
      STATIC_MORE_TOOLS_LINKS[0],
      STATIC_MORE_TOOLS_LINKS[1],
      STATIC_MORE_TOOLS_LINKS[2],
      STATIC_MORE_TOOLS_LINKS[3],
      {
        title: relocationPerksNav.title,
        subtitle: relocationPerksNav.subtitle,
        icon: "airplane-outline" as const,
        accent: "teal" as const,
        href: "/relocation-perks" as const,
      },
      STATIC_MORE_TOOLS_LINKS[4],
      STATIC_MORE_TOOLS_LINKS[5],
      STATIC_MORE_TOOLS_LINKS[6],
    ],
    [relocationPerksNav.title, relocationPerksNav.subtitle]
  );

  const [moreToolsOpen, setMoreToolsOpen] = useState(false);
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
      if (skills.length === 0) return Promise.reject(new Error("Select at least one skill."));
      if (jobPreferences.length === 0) return Promise.reject(new Error("Select at least one job preference."));
      if ((workTitle.trim() && !workCompany.trim()) || (!workTitle.trim() && workCompany.trim())) {
        return Promise.reject(new Error("Add both a role title and company for work experience."));
      }
      if ((educationDegree.trim() && !educationSchool.trim()) || (!educationDegree.trim() && educationSchool.trim())) {
        return Promise.reject(new Error("Add both a qualification and institution."));
      }

      const profile = profileQuery.data ?? {};
      const existingIndustry = profile.industryExperience as { secondary?: unknown } | undefined;
      const existingWorkHistory = Array.isArray(profile.workHistory) ? profile.workHistory : [];
      const existingEducationHistory = Array.isArray(profile.educationHistory) ? profile.educationHistory : [];
      const parsedYears = yearsOfExperience.trim() === "" ? undefined : Number(yearsOfExperience);
      if (parsedYears !== undefined && (!Number.isFinite(parsedYears) || parsedYears < 0 || parsedYears > 50)) {
        return Promise.reject(new Error("Years of experience must be between 0 and 50."));
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
      Alert.alert("Profile saved", "Your completion score and profile details are now up to date.");
    },
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
    onSuccess: () => {
      void Promise.all([
        qc.invalidateQueries({ queryKey: ["profile", "me"] }),
        qc.invalidateQueries({ queryKey: ["analytics", "candidate-dashboard"] }),
      ]);
    },
    onError: (e: unknown) => { const msg = e instanceof Error && e.message === "cancel" ? null : String(e && typeof e === "object" && "message" in e ? (e as { message: string }).message : "Upload failed"); if (msg) Alert.alert("Upload failed", msg); },
  });

  const p = profileQuery.data;
  const profileErrCopy = profileQuery.isError ? presentApiError(profileQuery.error) : null;
  const completion = typeof p?.profileCompletion === "number" ? p.profileCompletion : null;
  const completionBreakdown = getCandidateCompletionBreakdown(p);
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
      <GshScreenShell constrainTabletWidth>
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.brand} size="large" />
        </View>
      </GshScreenShell>
    );
  }

  const completionPct = completion ?? 0;
  const profileReady = completionPct >= 100;

  return (
    <GshScreenShell constrainTabletWidth>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <GshTabHeroHeader paddingTop={Math.max(insets.top, 12)} tagline="Your account">
          <View style={styles.heroIdentity}>
            <View style={[styles.avatarRing, !profileReady && styles.avatarRingIncomplete]}>
              <View style={styles.avatarInner}>
                <Text style={styles.profileAvatarText}>{initials}</Text>
              </View>
            </View>
            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.profileEmail}>{user?.email ?? ""}</Text>
            {completion != null ? (
              <Text style={styles.completionShort}>
                {profileReady ? "Profile complete" : `${completionPct}% complete`}
              </Text>
            ) : null}
            {!profileReady ? (
              <GshGradientPrimaryButton
                title="Complete profile"
                onPress={() => scrollRef.current?.scrollTo({ y: formSectionY.current, animated: true })}
                containerStyle={styles.completeCta}
              />
            ) : null}
          </View>
        </GshTabHeroHeader>

        <View style={styles.content}>
          <View style={styles.tileGrid}>
            <View style={styles.tileRow}>
              <GshToolTile label="Browse jobs" icon="compass-outline" accent="teal" onPress={() => router.push("/(tabs)/jobs")} />
              <GshToolTile label="Directory" icon="people-outline" accent="purple" onPress={() => router.push("/partners")} />
            </View>
            <View style={styles.tileRow}>
              <GshToolTile label="Visa wizard" icon="sparkles-outline" accent="teal" onPress={() => router.push("/visa-wizard")} />
              <GshToolTile label="ATS check" icon="document-text-outline" accent="ocean" onPress={() => router.push("/ats-assistant")} />
            </View>
            <View style={styles.tileRow}>
              <GshToolTile label="Settings" icon="settings-outline" accent="ocean" onPress={() => router.push("/settings")} />
              <Pressable
                style={[styles.moreTile, feedCardStyle()]}
                onPress={() => setMoreToolsOpen((v) => !v)}
                accessibilityRole="button"
                accessibilityState={{ expanded: moreToolsOpen }}
              >
                <View style={[styles.moreTileIcon, { backgroundColor: colors.surfaceMuted }]}>
                  <Ionicons name={moreToolsOpen ? "chevron-up" : "grid-outline"} size={24} color={colors.navy} />
                </View>
                <Text style={styles.moreTileLabel}>{moreToolsOpen ? "Hide extras" : "More tools"}</Text>
              </Pressable>
            </View>
          </View>

          {moreToolsOpen ? (
            <View style={styles.moreToolsList}>
              {moreToolsLinks.map((row) => (
                <GshLinkRow
                  key={row.href}
                  title={row.title}
                  subtitle={row.subtitle}
                  icon={row.icon}
                  accent={row.accent}
                  onPress={() => router.push(row.href)}
                />
              ))}
            </View>
          ) : null}

          {profileErrCopy ? (
            <View style={styles.errorBanner}>
              <Ionicons name="warning-outline" size={18} color="#b45309" />
              <Text style={styles.errorText}>
                {profileErrCopy.title}. {profileErrCopy.subtitle}
              </Text>
            </View>
          ) : null}

          {completionBreakdown.missing.length > 0 ? (
            <SectionCard title="Required to reach 100%">
              <Text style={styles.completionHelp}>
                Optional details such as a photo, LinkedIn profile, portfolio, salary expectations and languages do not affect completion.
              </Text>
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
          <SectionCard title="Basic info">
            <FieldLabel label="First name" />
            <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="First name" placeholderTextColor={colors.placeholder} />
            <FieldLabel label="Last name" />
            <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="Last name" placeholderTextColor={colors.placeholder} />
            <FieldLabel label="Phone" />
            <TextInput style={styles.input} value={phoneNumber} onChangeText={setPhoneNumber} placeholder="Phone number" placeholderTextColor={colors.placeholder} keyboardType="phone-pad" />
            <FieldLabel label="Location" />
            <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="City / country" placeholderTextColor={colors.placeholder} />
            <FieldLabel label="Nationality / citizenship" hint="Used to understand relevant mobility routes" />
            <TextInput style={[styles.input, { marginBottom: 0 }]} value={nationality} onChangeText={setNationality} placeholder="e.g. Nigerian, French" placeholderTextColor={colors.placeholder} />
          </SectionCard>

          <SectionCard title="Professional details">
            <FieldLabel label="Current or most recent role" />
            <TextInput style={styles.input} value={currentJobTitle} onChangeText={setCurrentJobTitle} placeholder="e.g. Senior Software Engineer" placeholderTextColor={colors.placeholder} />
            <FieldLabel label="Years of experience" />
            <TextInput
              style={styles.input}
              value={yearsOfExperience}
              onChangeText={setYearsOfExperience}
              placeholder="0"
              placeholderTextColor={colors.placeholder}
              keyboardType="number-pad"
            />
            <FieldLabel label="Primary industry" />
            <TextInput style={[styles.input, { marginBottom: 0 }]} value={primaryIndustry} onChangeText={setPrimaryIndustry} placeholder="e.g. Technology, Healthcare" placeholderTextColor={colors.placeholder} />
          </SectionCard>

          <SectionCard title="Mobility readiness">
            <FieldLabel label="Sponsorship status" />
            <ChoiceChips options={SPONSORSHIP_OPTIONS} value={sponsorshipStatus} onChange={setSponsorshipStatus} />
            <FieldLabel label="Notice period" />
            <ChoiceChips options={NOTICE_OPTIONS} value={noticePeriod} onChange={setNoticePeriod} />
            <FieldLabel label="Job-search intent" />
            <ChoiceChips options={SEARCH_INTENT_OPTIONS} value={jobSearchIntent} onChange={setJobSearchIntent} />
            <FieldLabel label="Relocation readiness" />
            <ChoiceChips options={RELOCATION_OPTIONS} value={relocationReadiness} onChange={setRelocationReadiness} />
            <FieldLabel label="Target country or countries" hint="Separate multiple countries with commas" />
            <TextInput
              style={[styles.input, { marginBottom: 0 }]}
              value={targetCountries}
              onChangeText={setTargetCountries}
              placeholder="e.g. Germany, Netherlands, Canada"
              placeholderTextColor={colors.placeholder}
            />
          </SectionCard>

          <SectionCard title="Career evidence">
            <FieldLabel label="Career summary" hint="A short overview of your experience and target role" />
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={careerSummary}
              onChangeText={setCareerSummary}
              placeholder="Summarise your experience, strengths and next role"
              placeholderTextColor={colors.placeholder}
              multiline
              textAlignVertical="top"
            />
            <FieldLabel label="Most recent work experience" />
            <TextInput style={styles.input} value={workTitle} onChangeText={setWorkTitle} placeholder="Role title" placeholderTextColor={colors.placeholder} />
            <TextInput style={styles.input} value={workCompany} onChangeText={setWorkCompany} placeholder="Company" placeholderTextColor={colors.placeholder} />
            <FieldLabel label="Education / qualification" />
            <TextInput style={styles.input} value={educationDegree} onChangeText={setEducationDegree} placeholder="Degree, trade or professional qualification" placeholderTextColor={colors.placeholder} />
            <TextInput style={[styles.input, { marginBottom: 0 }]} value={educationSchool} onChangeText={setEducationSchool} placeholder="Institution or awarding body" placeholderTextColor={colors.placeholder} />
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
            <FieldLabel label="How you want to work" />
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
                <Text style={styles.cvHint}>{resumeUrl ? "Tap below to replace" : "Upload PDF or Word"}</Text>
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

          {/* Save button */}
          <GshGradientPrimaryButton title="Save profile" onPress={() => saveMut.mutate()} loading={saveMut.isPending} containerStyle={{ marginBottom: 12, marginTop: 8 }} />

          {/* Sign out */}
          <Pressable style={styles.signOutBtn} onPress={logout}>
            <Ionicons name="log-out-outline" size={18} color={colors.error} />
            <Text style={styles.signOutText}>Sign out</Text>
          </Pressable>
          </View>
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
    </GshScreenShell>
  );
}

const styles = StyleSheet.create({
  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  scrollContent: { paddingBottom: 40 },
  heroIdentity: { alignItems: "center", paddingBottom: 4 },
  avatarRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.teal,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarRingIncomplete: { borderColor: "rgba(255,255,255,0.35)" },
  avatarInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  profileAvatarText: { fontSize: 26, fontFamily: fontFamily.extraBold, color: colors.white },
  profileName: { fontSize: 22, fontFamily: fontFamily.extraBold, color: colors.white, letterSpacing: -0.4 },
  profileEmail: { marginTop: 4, fontSize: 13, fontFamily: fontFamily.regular, color: "rgba(255,255,255,0.65)" },
  completionShort: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: fontFamily.semiBold,
    color: "rgba(255,255,255,0.75)",
  },
  completeCta: { marginTop: 14, alignSelf: "stretch", width: "100%", maxWidth: 280 },
  content: { paddingHorizontal: 16, paddingTop: 16, gap: 14 },
  tileGrid: { gap: 10, marginBottom: 4 },
  tileRow: { flexDirection: "row", gap: 10 },
  moreTile: {
    flex: 1,
    minWidth: "46%",
    maxWidth: "50%",
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: "center",
    borderRadius: radii.lg,
    gap: 10,
  },
  moreTileIcon: {
    width: 52,
    height: 52,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  moreTileLabel: { fontSize: 13, fontFamily: fontFamily.semiBold, color: colors.navy, textAlign: "center" },
  moreToolsList: { gap: 0, marginBottom: 8 },
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
