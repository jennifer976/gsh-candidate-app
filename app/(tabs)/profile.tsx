import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { useAppCopy, useAppLanguage } from "@/lib/i18n";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
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
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { GshGradientPrimaryButton } from "@/components/GshGradientPrimaryButton";
import { CandidateReadinessSummary } from "@/components/CandidateReadinessSummary";
import { CountryFlag } from "@/components/CountryFlag";
import { canonicalCountryCode, countryDisplayName } from "@/lib/countries";
import { CountryPicker } from "@/components/CountryPicker";
import { resolveUploadAssetUrl } from "@/lib/media-url";
import profileOptions from "@/data/profileOptions.json";
import { useLastCvCheck } from "@/lib/cv-check-history";
import { GshScreenShell } from "@/components/GshScreenShell";
import { GuestProfileHub } from "@/components/GuestProfileHub";
import { BrandLinkRow, DecorRing, DepthButton, DepthSurface, Eyebrow } from "@/components/gsh-brand";
import { fetchOwnProfile, recordCandidateJourneyStart, updateProfile, uploadFileFromUri, uploadImageFromUri } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import { JOB_PREFERENCE_OPTIONS } from "@/lib/job-preferences";
import { getCandidateCompletionBreakdown } from "@/lib/profile-completion";
import { getAllSkillsSorted } from "@/lib/skills-data";
import { tabBarBottomPadding } from "@/lib/android-insets";
import { colors, feedCardStyle, fontFamily, radii } from "@/lib/theme";

const ALL_SKILLS = getAllSkillsSorted();
const MAX_SKILLS = 30;
const REMOTE_OPTIONS = ["Remote", "Hybrid", "On-site", "Remote or Hybrid"] as const;
const VISA_STATUS_OPTIONS = [
  "Citizen",
  "Permanent Resident",
  "Work Permit Required",
  "Student Visa",
  "Work Visa",
  "Other",
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
const MAX_SECONDARY_INDUSTRIES = 2;
/** Backend limits for PUT /profile. */
const MAX_WORK_ENTRIES = 25;
const MAX_EDUCATION_ENTRIES = 15;
const MAX_LANGUAGES = 20;
/** The profile model requires a company; this placeholder is shown as an empty field. */
const COMPANY_PLACEHOLDER = "Not specified";

type WorkEntry = { title: string; company: string; startDate: string; endDate: string; isCurrent: boolean };
type EducationEntry = { degree: string; school: string; year: string };
type LanguageEntry = { language: string; fluency: string };

const text = (value: unknown) => (typeof value === "string" ? value : "");
const strings = (value: unknown) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

function hydrateWork(value: unknown): WorkEntry[] {
  if (!Array.isArray(value)) return [];
  return value.map((row: Record<string, unknown>) => ({
    title: text(row?.title),
    company: text(row?.company),
    startDate: text(row?.startDate),
    endDate: text(row?.endDate),
    isCurrent: row?.isCurrent === true,
  }));
}

function hydrateEducation(value: unknown): EducationEntry[] {
  if (!Array.isArray(value)) return [];
  return value.map((row: Record<string, unknown>) => ({
    degree: text(row?.degree),
    school: text(row?.school),
    year: text(row?.year),
  }));
}

function hydrateLanguages(value: unknown): LanguageEntry[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((row: Record<string, unknown>) => typeof row?.language === "string")
    .map((row: Record<string, unknown>) => ({
      language: text(row.language),
      fluency: text(row.fluency) || "Basic",
    }));
}

function nationalityNames(value: string): string {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => (/^[A-Z]{2}$/.test(item) ? countryDisplayName(item, "en") : item))
    .join(", ");
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

function PickerModal({
  visible,
  title,
  options,
  selected,
  onToggle,
  onClose,
  searchPlaceholder,
}: {
  visible: boolean;
  title: string;
  options: readonly string[];
  selected: readonly string[];
  onToggle: (option: string) => void;
  onClose: () => void;
  searchPlaceholder: string;
}) {
  const ac = useAccountCopy();
  const [search, setSearch] = useState("");
  const q = search.trim().toLowerCase();
  const filtered = q ? options.filter((option) => option.toLowerCase().includes(q) || ac(option).toLowerCase().includes(q)) : options;
  const close = () => {
    setSearch("");
    onClose();
  };
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={close}>
      <SafeAreaView style={styles.modalSafe} edges={["top"]}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Pressable onPress={close} hitSlop={12} accessibilityRole="button">
            <Text style={styles.modalDone}>{ac("Done")}</Text>
          </Pressable>
        </View>
        <View style={styles.modalSearch}>
          <Ionicons name="search" size={18} color={colors.placeholder} />
          <TextInput
            style={styles.modalSearchInput}
            value={search}
            onChangeText={setSearch}
            placeholder={searchPlaceholder}
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor={colors.placeholder}
          />
        </View>
        <FlatList
          data={filtered}
          keyExtractor={(item) => item}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => {
            const on = selected.includes(item);
            return (
              <Pressable
                style={[styles.skillRow, on && styles.skillRowOn]}
                onPress={() => onToggle(item)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on }}
              >
                <Text style={[styles.skillRowText, on && styles.skillRowTextOn]}>{ac(item)}</Text>
                {on ? <Ionicons name="checkmark-circle" size={20} color={colors.brand} /> : <View style={styles.skillRowCircle} />}
              </Pressable>
            );
          }}
          ListEmptyComponent={<Text style={[styles.emptySkillsHint, { padding: 16 }]}>{ac("No matches.")}</Text>}
        />
      </SafeAreaView>
    </Modal>
  );
}

function SelectedChips({ items, onRemove }: { items: readonly string[]; onRemove: (item: string) => void }) {
  const ac = useAccountCopy();
  if (items.length === 0) return null;
  return (
    <View style={[styles.chipGrid, { marginBottom: 12 }]}>
      {items.map((item) => (
        <Pressable
          key={item}
          onPress={() => onRemove(item)}
          style={[styles.prefChip, styles.prefChipOn]}
          accessibilityRole="button"
          accessibilityLabel={ac("Remove {name}", { name: ac(item) })}
        >
          <Text style={[styles.prefChipText, styles.prefChipTextOn]}>{ac(item)}</Text>
          <Ionicons name="close" size={13} color={colors.white} style={{ marginLeft: 4 }} />
        </Pressable>
      ))}
    </View>
  );
}

const ACCOUNT_LINKS = [
  { title: "Relocation perks", subtitle: "Offers that help with the move", icon: "airplane-outline" as const, href: "/relocation-perks" },
  { title: "Career toolkit", subtitle: "CV check, country guides, calculators", icon: "construct-outline" as const, href: "/tools-resources" },
  { title: "Work and move preferences", subtitle: "Countries, visa status and who can contact you", icon: "earth-outline" as const, href: "/mobility-profile" },
  { title: "Invites to apply", subtitle: "Review employer and agency invites", icon: "people-circle-outline" as const, href: "/agency-introductions" },
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
  const lastCvCheck = useLastCvCheck();
  const formSectionY = useRef(0);
  const contentSectionY = useRef(0);

  const profileQuery = useQuery({ queryKey: ["profile", "me"], queryFn: fetchOwnProfile });

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [location, setLocation] = useState("");
  const [preferredJobLocation, setPreferredJobLocation] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [nationality, setNationality] = useState("");
  const [languages, setLanguages] = useState<LanguageEntry[]>([]);
  const [currentJobTitle, setCurrentJobTitle] = useState("");
  const [currentCompany, setCurrentCompany] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [primaryIndustry, setPrimaryIndustry] = useState("");
  const [secondaryIndustries, setSecondaryIndustries] = useState<string[]>([]);
  const [remoteWorkPreference, setRemoteWorkPreference] = useState("");
  const [currentVisaStatus, setCurrentVisaStatus] = useState("");
  const [noticePeriod, setNoticePeriod] = useState("");
  const [jobSearchIntent, setJobSearchIntent] = useState("");
  const [careerSummary, setCareerSummary] = useState("");
  const [workHistory, setWorkHistory] = useState<WorkEntry[]>([]);
  const [educationHistory, setEducationHistory] = useState<EducationEntry[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [jobPreferences, setJobPreferences] = useState<string[]>([]);
  const [picker, setPicker] = useState<"skills" | "primaryIndustry" | "secondaryIndustries" | "languages" | null>(null);

  useEffect(() => {
    const p = profileQuery.data;
    if (!p) return;
    setFirstName(text(p.firstName));
    setLastName(text(p.lastName));
    setEmail(text(p.email) || user?.email || "");
    setPhoneNumber(text(p.phoneNumber));
    setLocation(text(p.location));
    setPreferredJobLocation(text(p.preferred_job_location));
    setLinkedin(text(p.linkedin_profile));
    setPortfolio(text(p.portfolio_website));
    setNationality(Array.isArray(p.nationality) ? strings(p.nationality).join(", ") : text(p.nationality));
    setLanguages(hydrateLanguages(p.languages));
    setCurrentJobTitle(text(p.currentJobTitle));
    const company = text(p.currentCompany);
    setCurrentCompany(company === COMPANY_PLACEHOLDER ? "" : company);
    setYearsOfExperience(typeof p.yearsOfExperience === "number" ? String(p.yearsOfExperience) : "");
    const industry = p.industryExperience as { primary?: unknown; secondary?: unknown } | undefined;
    setPrimaryIndustry(text(industry?.primary));
    setSecondaryIndustries(strings(industry?.secondary).slice(0, MAX_SECONDARY_INDUSTRIES));
    setRemoteWorkPreference(text(p.remoteWorkPreference));
    setCurrentVisaStatus(text(p.currentVisaStatus));
    setNoticePeriod(text(p.noticePeriod));
    setJobSearchIntent(text(p.jobSearchIntent));
    setCareerSummary(text(p.careerSummary));
    setWorkHistory(hydrateWork(p.workHistory));
    setEducationHistory(hydrateEducation(p.educationHistory));
    setSkills(strings(p.skills));
    setJobPreferences(strings(p.jobPreferences));
  }, [profileQuery.data, user?.email]);

  const toggleJobPreference = (pref: string) => setJobPreferences((prev) => prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]);
  const toggleSkillChoice = (skill: string) => setSkills((prev) => { if (prev.includes(skill)) return prev.filter((s) => s !== skill); if (prev.length >= MAX_SKILLS) return prev; return [...prev, skill]; });
  const removeSkill = (skill: string) => setSkills((prev) => prev.filter((s) => s !== skill));
  const choosePrimaryIndustry = (industry: string) => {
    setPrimaryIndustry((prev) => (prev === industry ? "" : industry));
    setSecondaryIndustries((prev) => prev.filter((item) => item !== industry));
    setPicker(null);
  };
  const toggleSecondaryIndustry = (industry: string) =>
    setSecondaryIndustries((prev) =>
      prev.includes(industry)
        ? prev.filter((item) => item !== industry)
        : prev.length >= MAX_SECONDARY_INDUSTRIES
          ? prev
          : [...prev, industry],
    );
  const toggleLanguage = (language: string) =>
    setLanguages((prev) =>
      prev.some((row) => row.language === language)
        ? prev.filter((row) => row.language !== language)
        : prev.length >= MAX_LANGUAGES
          ? prev
          : [...prev, { language, fluency: "Basic" }],
    );
  const updateWork = (index: number, patch: Partial<WorkEntry>) =>
    setWorkHistory((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  const updateEducation = (index: number, patch: Partial<EducationEntry>) =>
    setEducationHistory((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  const saveMut = useMutation({
    mutationFn: () => {
      const parsedYears = yearsOfExperience.trim() === "" ? undefined : Number(yearsOfExperience);
      if (parsedYears !== undefined && (!Number.isFinite(parsedYears) || parsedYears < 0 || parsedYears > 50)) {
        return Promise.reject(new Error("PROFILE_INPUT_4"));
      }

      const body: Record<string, unknown> = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim() || user?.email,
        phoneNumber: phoneNumber.trim(),
        location: location.trim(),
        preferred_job_location: preferredJobLocation.trim(),
        linkedin_profile: linkedin.trim(),
        portfolio_website: portfolio.trim(),
        nationality: nationalityNames(nationality),
        languages,
        currentJobTitle: currentJobTitle.trim(),
        currentCompany: currentCompany.trim() || COMPANY_PLACEHOLDER,
        ...(parsedYears !== undefined ? { yearsOfExperience: parsedYears } : {}),
        industryExperience: { primary: primaryIndustry, secondary: secondaryIndustries },
        remoteWorkPreference,
        currentVisaStatus,
        noticePeriod,
        jobSearchIntent,
        careerSummary: careerSummary.trim() || undefined,
        workHistory: workHistory
          .filter((w) => w.title.trim() && w.company.trim())
          .map((w) => ({
            title: w.title.trim(),
            company: w.company.trim(),
            startDate: w.startDate.trim() || undefined,
            endDate: w.isCurrent ? undefined : w.endDate.trim() || undefined,
            isCurrent: w.isCurrent,
          })),
        educationHistory: educationHistory
          .filter((e) => e.degree.trim() && e.school.trim())
          .map((e) => ({ degree: e.degree.trim(), school: e.school.trim(), year: e.year.trim() || undefined })),
        skills,
        jobPreferences,
      };
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
 const localErrors: Record<string,string> = {"PROFILE_INPUT_4": ac("Years of experience must be between 0 and 50.")};
 Alert.alert(ac("Could not save"), ac(e instanceof Error && localErrors[e.message] ? localErrors[e.message] : "Could not save settings. Try again."));
 },
  });

  const cvMut = useMutation({
    mutationFn: async () => {
      const res = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true, type: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"] });
      if (res.canceled || !res.assets?.[0]) throw new Error("cancel");
      const a = res.assets[0];
      const name = a.name || "cv.pdf";
      if (!/\.(pdf|doc|docx)$/i.test(name)) throw new Error("bad-type");
      if (typeof a.size === "number" && a.size > 10 * 1024 * 1024) throw new Error("too-large");
      const up = await uploadFileFromUri(a.uri, name, a.mimeType ?? "application/pdf");
      await updateProfile({ resume: up.url });
      return up.url;
    },
    onSuccess: () => {
      void Promise.all([
        qc.invalidateQueries({ queryKey: ["profile", "me"] }),
        qc.invalidateQueries({ queryKey: ["analytics", "candidate-dashboard"] }),
      ]);
    },
    onError: (e: unknown) => {
      const raw =
        e instanceof Error
          ? e.message
          : typeof e === "object" && e && "message" in e
            ? String((e as { message: unknown }).message)
            : "";
      if (!raw || raw === "cancel") return;
      const message =
        raw === "too-large"
          ? ac("This CV is too large. The limit is 10MB.")
          : raw === "bad-type"
            ? ac("Use a PDF, DOC, or DOCX file up to 10MB.")
            : ac(raw);
      Alert.alert(ac("Upload failed"), message);
    },
  });

  const photoMut = useMutation({
    mutationFn: async () => {
      const res = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true, type: ["image/jpeg", "image/png", "image/webp"] });
      if (res.canceled || !res.assets?.[0]) throw new Error("cancel");
      const a = res.assets[0];
      const up = await uploadImageFromUri(a.uri, a.name || "photo.jpg", a.mimeType ?? "image/jpeg");
      await updateProfile({ profile_picture: up.url });
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["profile", "me"] }),
    onError: (e: unknown) => { if (e instanceof Error && e.message === "cancel") return; Alert.alert(ac("Upload failed"), ac("Your file could not be uploaded. Try again.")); },
  });

  const p = profileQuery.data;
  const profileErrCopy = profileQuery.isError;
  const completionBreakdown = getCandidateCompletionBreakdown(p, locale);
  const resumeUrl = typeof p?.resume === "string" ? p.resume : "";
  const consentOn = (field: string) =>
    p?.talent_pool_visible !== false && (p?.[field] as { enabled?: unknown } | undefined)?.enabled === true;
  const employerDiscoveryOn = consentOn("employerDiscoveryConsent");
  const discoveryMut = useMutation({
    mutationFn: (enabled: boolean) =>
      updateProfile({
        employerDiscoveryConsent: { enabled },
        talent_pool_visible: enabled ? true : p?.talent_pool_visible,
      }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["profile", "me"] }),
    onError: () => Alert.alert(ac("Could not save"), ac("Could not save settings. Try again.")),
  });
  const agencyDiscoveryOn = consentOn("agencyDiscoveryConsent");
  const discoveryHint =
    employerDiscoveryOn && agencyDiscoveryOn
      ? ac("Employers and agencies can find you")
      : employerDiscoveryOn
        ? ac("Employers can find you")
        : agencyDiscoveryOn
          ? ac("Agencies can find you")
          : ac("Employers and agencies can't search for you");
  const targetCountryCodes = Array.isArray(p?.targetCountries)
    ? [...new Set((p.targetCountries as unknown[]).map(canonicalCountryCode).filter((code): code is string => Boolean(code)))]
    : [];
  const displayName = [firstName, lastName].filter(Boolean).join(" ") || user?.email || ac("Your profile");
  const initials = [firstName.charAt(0), lastName.charAt(0)].filter(Boolean).join("").toUpperCase() || "?";
  const avatarUrl = resolveUploadAssetUrl(typeof p?.profile_picture === "string" ? p.profile_picture : "");
  const openToRelocate =
    p?.relocationReadiness === "Ready to relocate" || p?.relocationReadiness === "Can relocate with employer support";

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

          <DepthSurface depth={4} radius={22} borderWidth={2} borderColor={colors.navy} innerStyle={styles.quickCard}>
            <View style={styles.quickRow}>
              <View style={styles.quickIcon}>
                <Ionicons name="document-text" size={20} color={colors.cyan} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.quickTitle} numberOfLines={1}>{resumeUrl ? ac("CV on file") : ac("No CV uploaded yet")}</Text>
                <Text style={styles.quickHint} numberOfLines={1}>{resumeUrl ? ac("Tap below to replace your CV") : ac("Upload your CV — PDF, DOC, or DOCX, up to 10MB")}</Text>
                {lastCvCheck ? (
                  <Pressable onPress={() => router.push("/cv-quality-checker")} hitSlop={8} accessibilityRole="button">
                    <Text style={styles.quickScore}>{ac("Last score {score}/100", { score: lastCvCheck.score })}</Text>
                  </Pressable>
                ) : null}
              </View>
              <Pressable
                onPress={() => cvMut.mutate()}
                disabled={cvMut.isPending}
                style={[styles.quickPill, cvMut.isPending && styles.disabledBtn]}
                accessibilityRole="button"
                accessibilityLabel={resumeUrl ? ac("Replace CV") : ac("Upload CV")}
              >
                {cvMut.isPending ? (
                  <ActivityIndicator color={colors.navy} size="small" />
                ) : (
                  <Text style={styles.quickPillText}>{resumeUrl ? ac("Replace CV") : ac("Upload CV")}</Text>
                )}
              </Pressable>
            </View>
          </DepthSurface>

          <DepthSurface depth={4} radius={22} borderWidth={2} borderColor={colors.navy} innerStyle={styles.quickCard}>
            <View style={styles.quickHead}>
              <Text style={styles.quickTitle}>{ac("Target countries")}</Text>
              <Pressable onPress={() => router.push("/mobility-profile")} hitSlop={10} accessibilityRole="button" accessibilityLabel={`${ac("Edit")}: ${ac("Target countries")}`}>
                <Text style={styles.quickEdit}>{ac("Edit")}</Text>
              </Pressable>
            </View>
            {targetCountryCodes.length > 0 ? (
              <View style={styles.countryChips}>
                {targetCountryCodes.map((code) => (
                  <View key={code} style={styles.countryChip}>
                    <CountryFlag iso2={code.toLowerCase()} width={18} />
                    <Text style={styles.countryChipText}>{countryDisplayName(code, locale)}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.quickHint}>{ac("Add the countries you would move to.")}</Text>
            )}
          </DepthSurface>

          <CandidateReadinessSummary profile={p} accountEmail={user?.email} />

          <DepthSurface face={employerDiscoveryOn ? colors.navy : colors.white} depthColor={colors.cyan} depth={5} radius={22} borderWidth={2} borderColor={colors.navy} innerStyle={styles.optInCard}>
            <View style={styles.optInCopy}>
              <Text style={[styles.optInEyebrow, employerDiscoveryOn && styles.optInEyebrowOn]}>{ac("Be found")}</Text>
              <Text style={[styles.optInTitle, employerDiscoveryOn && styles.optInTitleOn]}>{ac("Let employers find you")}</Text>
              <Text style={[styles.optInBody, employerDiscoveryOn && styles.optInBodyOn]}>
                {employerDiscoveryOn
                  ? ac("Subscribed employers can see your profile when they search. You can switch this off any time.")
                  : ac("Switch this on if you want subscribed employers to discover your profile. You stay in control.")}
              </Text>
            </View>
            <Switch
              accessibilityLabel={ac("Let employers find you")}
              value={employerDiscoveryOn}
              disabled={discoveryMut.isPending}
              onValueChange={(enabled) => discoveryMut.mutate(enabled)}
              trackColor={{ false: "#cbd5e1", true: "#059669" }}
              thumbColor={colors.white}
            />
          </DepthSurface>

          <View
            style={styles.formBlock}
            onLayout={(e) => {
              formSectionY.current = e.nativeEvent.layout.y;
            }}
          >
          <SectionCard title={ac("Your profession")} initiallyOpen>
            <FieldLabel label={ac("Current job title")} />
            <TextInput style={styles.input} value={currentJobTitle} maxLength={500} onChangeText={setCurrentJobTitle} placeholder={ac("Role title")} placeholderTextColor={colors.placeholder} />
            <FieldLabel label={ac("Current Company")} />
            <TextInput style={styles.input} value={currentCompany} maxLength={500} onChangeText={setCurrentCompany} placeholder={ac("Company")} placeholderTextColor={colors.placeholder} />
            <FieldLabel label={ac("Years of Experience")} hint={ac("Whole years of experience (0–50).")} />
            <TextInput
              style={[styles.input, { marginBottom: 0 }]}
              value={yearsOfExperience}
              onChangeText={(value) => setYearsOfExperience(value.replace(/[^\d]/g, "").slice(0, 2))}
              placeholder="0"
              placeholderTextColor={colors.placeholder}
              keyboardType="number-pad"
            />
          </SectionCard>

          <SectionCard title={ac("Industry experience")}>
            <FieldLabel label={ac("Primary Industry")} hint={ac("Choose one main industry.")} />
            <SelectedChips items={primaryIndustry ? [primaryIndustry] : []} onRemove={() => setPrimaryIndustry("")} />
            <Pressable style={[styles.addSkillBtn, styles.pickerBtn]} onPress={() => setPicker("primaryIndustry")} accessibilityRole="button">
              <Ionicons name={primaryIndustry ? "swap-horizontal" : "add"} size={16} color={colors.white} />
              <Text style={styles.addSkillBtnText}>{primaryIndustry ? ac("Change") : ac("Choose")}</Text>
            </Pressable>
            <FieldLabel label={ac("Secondary Industries")} hint={ac("Choose up to two other industries.")} />
            <SelectedChips items={secondaryIndustries} onRemove={toggleSecondaryIndustry} />
            {secondaryIndustries.length < MAX_SECONDARY_INDUSTRIES ? (
              <Pressable style={[styles.addSkillBtn, styles.pickerBtn, { marginBottom: 0 }]} onPress={() => setPicker("secondaryIndustries")} accessibilityRole="button">
                <Ionicons name="add" size={16} color={colors.white} />
                <Text style={styles.addSkillBtnText}>{ac("Add")}</Text>
              </Pressable>
            ) : null}
          </SectionCard>

          <SectionCard title={ac("Skills")}>
            <View style={styles.skillsTopRow}>
              <Text style={styles.skillsCount}>{ac("Selected: {count}", {count: skills.length})} / {MAX_SKILLS}</Text>
              <Pressable style={styles.addSkillBtn} onPress={() => setPicker("skills")}>
                <Ionicons name="add" size={16} color={colors.white} />
                <Text style={styles.addSkillBtnText}>{ac("Add skills")}</Text>
              </Pressable>
            </View>
            {skills.length > 0 ? (
              <SelectedChips items={skills} onRemove={removeSkill} />
            ) : (
              <Text style={styles.emptySkillsHint}>{ac("Use Add skills to select at least one skill for your application.")}</Text>
            )}
          </SectionCard>

          <SectionCard title={ac("Career history")}>
            <FieldLabel label={ac("Looking for")} hint={ac("Describe what you want from your next role.")} />
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={careerSummary}
              onChangeText={setCareerSummary}
              placeholder={ac("Describe what you want from your next role.")}
              placeholderTextColor={colors.placeholder}
              maxLength={2000}
              multiline
              textAlignVertical="top"
            />
            <View style={styles.listHead}>
              <Text style={styles.fieldLabel}>{ac("Work history")}</Text>
              <Pressable onPress={() => setWorkHistory((prev) => (prev.length >= MAX_WORK_ENTRIES ? prev : [...prev, { title: "", company: "", startDate: "", endDate: "", isCurrent: false }]))} hitSlop={8} accessibilityRole="button">
                <Text style={styles.listAdd}>+ {ac("Add role")}</Text>
              </Pressable>
            </View>
            {currentJobTitle.trim() && currentCompany.trim() && !workHistory.some((w) => w.title.trim() && w.company.trim()) ? (
              <Pressable
                onPress={() => setWorkHistory([{ title: currentJobTitle.trim(), company: currentCompany.trim(), startDate: "", endDate: "", isCurrent: true }])}
                style={styles.listSuggest}
                accessibilityRole="button"
              >
                <Text style={styles.listSuggestText}>{ac("Add current role to work history")}</Text>
              </Pressable>
            ) : null}
            {workHistory.length === 0 ? <Text style={[styles.emptySkillsHint, { marginBottom: 14 }]}>{ac("No roles added yet.")}</Text> : null}
            {workHistory.map((row, index) => (
              <View key={index} style={styles.listCard}>
                <Pressable onPress={() => setWorkHistory((prev) => prev.filter((_, i) => i !== index))} style={styles.listRemove} hitSlop={8} accessibilityRole="button" accessibilityLabel={ac("Remove role")}>
                  <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
                </Pressable>
                <TextInput style={styles.input} value={row.title} maxLength={240} onChangeText={(v) => updateWork(index, { title: v })} placeholder={ac("Role title")} placeholderTextColor={colors.placeholder} />
                <TextInput style={styles.input} value={row.company} maxLength={240} onChangeText={(v) => updateWork(index, { company: v })} placeholder={ac("Company")} placeholderTextColor={colors.placeholder} />
                <TextInput style={styles.input} value={row.startDate} maxLength={40} onChangeText={(v) => updateWork(index, { startDate: v })} placeholder={ac("Start date")} placeholderTextColor={colors.placeholder} />
                <TextInput style={[styles.input, row.isCurrent && styles.disabledBtn]} value={row.endDate} maxLength={40} editable={!row.isCurrent} onChangeText={(v) => updateWork(index, { endDate: v })} placeholder={ac("End date (leave blank if current)")} placeholderTextColor={colors.placeholder} />
                <Pressable
                  onPress={() => updateWork(index, { isCurrent: !row.isCurrent, endDate: row.isCurrent ? row.endDate : "" })}
                  style={styles.checkRow}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: row.isCurrent }}
                >
                  <Ionicons name={row.isCurrent ? "checkbox" : "square-outline"} size={22} color={colors.navy} />
                  <Text style={styles.checkText}>{ac("I currently work here")}</Text>
                </Pressable>
              </View>
            ))}
            <View style={styles.listHead}>
              <Text style={styles.fieldLabel}>{ac("Education")}</Text>
              <Pressable onPress={() => setEducationHistory((prev) => (prev.length >= MAX_EDUCATION_ENTRIES ? prev : [...prev, { degree: "", school: "", year: "" }]))} hitSlop={8} accessibilityRole="button">
                <Text style={styles.listAdd}>+ {ac("Add education")}</Text>
              </Pressable>
            </View>
            {educationHistory.length === 0 ? <Text style={styles.emptySkillsHint}>{ac("No education added yet.")}</Text> : null}
            {educationHistory.map((row, index) => (
              <View key={index} style={styles.listCard}>
                <Pressable onPress={() => setEducationHistory((prev) => prev.filter((_, i) => i !== index))} style={styles.listRemove} hitSlop={8} accessibilityRole="button" accessibilityLabel={ac("Remove education")}>
                  <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
                </Pressable>
                <TextInput style={styles.input} value={row.degree} maxLength={240} onChangeText={(v) => updateEducation(index, { degree: v })} placeholder={ac("Qualification")} placeholderTextColor={colors.placeholder} />
                <TextInput style={styles.input} value={row.school} maxLength={240} onChangeText={(v) => updateEducation(index, { school: v })} placeholder={ac("School")} placeholderTextColor={colors.placeholder} />
                <TextInput style={[styles.input, { marginBottom: 0 }]} value={row.year} maxLength={20} onChangeText={(v) => updateEducation(index, { year: v })} placeholder={ac("Year")} placeholderTextColor={colors.placeholder} keyboardType="number-pad" />
              </View>
            ))}
          </SectionCard>

          <SectionCard title={ac("Availability and job preferences")}>
            <FieldLabel label={ac("Remote work")} />
            <ChoiceChips options={REMOTE_OPTIONS} value={remoteWorkPreference} onChange={setRemoteWorkPreference} />
            <FieldLabel label={ac("Job-search intent")} />
            <ChoiceChips options={SEARCH_INTENT_OPTIONS} value={jobSearchIntent} onChange={setJobSearchIntent} />
            <FieldLabel label={ac("Notice period")} />
            <ChoiceChips options={NOTICE_OPTIONS} value={noticePeriod} onChange={setNoticePeriod} />
            <FieldLabel label={ac("Visa status")} />
            <ChoiceChips options={VISA_STATUS_OPTIONS} value={currentVisaStatus} onChange={setCurrentVisaStatus} />
            <FieldLabel label={ac("Job Preferences")} />
            <View style={styles.chipGrid}>
              {JOB_PREFERENCE_OPTIONS.map((pref) => {
                const on = jobPreferences.includes(pref);
                return (
                  <Pressable key={pref} onPress={() => toggleJobPreference(pref)} style={[styles.prefChip, on && styles.prefChipOn]} accessibilityRole="checkbox" accessibilityState={{ checked: on }}>
                    {on && <Ionicons name="checkmark" size={13} color={colors.white} style={{ marginRight: 4 }} />}
                    <Text style={[styles.prefChipText, on && styles.prefChipTextOn]}>{ac(pref)}</Text>
                  </Pressable>
                );
              })}
            </View>
          </SectionCard>

          <SectionCard title={ac("Personal details")}>
            <View style={styles.photoRow}>
              <View style={styles.photoCircle}>
                {avatarUrl ? <Image source={{ uri: avatarUrl }} style={styles.avatarImage} /> : <Text style={styles.photoInitials}>{initials}</Text>}
              </View>
              <Pressable onPress={() => photoMut.mutate()} disabled={photoMut.isPending} style={[styles.quickPill, photoMut.isPending && styles.disabledBtn]} accessibilityRole="button">
                {photoMut.isPending ? <ActivityIndicator color={colors.navy} size="small" /> : <Text style={styles.quickPillText}>{ac("Change photo")}</Text>}
              </Pressable>
            </View>
            <FieldLabel label={ac("First Name")} />
            <TextInput style={styles.input} value={firstName} maxLength={500} onChangeText={setFirstName} placeholder={ac("First Name")} placeholderTextColor={colors.placeholder} />
            <FieldLabel label={ac("Last Name")} />
            <TextInput style={styles.input} value={lastName} maxLength={500} onChangeText={setLastName} placeholder={ac("Last Name")} placeholderTextColor={colors.placeholder} />
            <FieldLabel label={ac("Email Address *")} />
            <TextInput style={styles.input} value={email} maxLength={500} onChangeText={setEmail} placeholder="email@example.com" placeholderTextColor={colors.placeholder} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
            <FieldLabel label={ac("Phone Number")} />
            <TextInput style={styles.input} value={phoneNumber} maxLength={500} onChangeText={setPhoneNumber} placeholder="+44 7700 900000" placeholderTextColor={colors.placeholder} keyboardType="phone-pad" />
            <FieldLabel label={ac("Current location")} />
            <TextInput style={styles.input} value={location} maxLength={500} onChangeText={setLocation} placeholder={ac("City and country")} placeholderTextColor={colors.placeholder} />
            <FieldLabel label={ac("Preferred job location")} />
            <TextInput style={styles.input} value={preferredJobLocation} maxLength={500} onChangeText={setPreferredJobLocation} placeholder="e.g. Remote, New York, London" placeholderTextColor={colors.placeholder} />
            <View style={{ marginBottom: 14 }}>
              <CountryPicker label={ac("Nationality")} value={nationality} onChange={setNationality} multiple />
            </View>
            <FieldLabel label={ac("Languages Spoken")} />
            {languages.map((row) => (
              <View key={row.language} style={styles.languageRow}>
                <View style={styles.languageHead}>
                  <Text style={styles.languageName}>{ac(row.language)}</Text>
                  <Pressable onPress={() => toggleLanguage(row.language)} hitSlop={8} accessibilityRole="button" accessibilityLabel={ac("Remove {name}", { name: ac(row.language) })}>
                    <Ionicons name="close" size={18} color={colors.textMuted} />
                  </Pressable>
                </View>
                <ChoiceChips
                  options={profileOptions.fluencyLevels}
                  value={row.fluency}
                  onChange={(fluency) => setLanguages((prev) => prev.map((l) => (l.language === row.language ? { ...l, fluency } : l)))}
                />
              </View>
            ))}
            <Pressable style={[styles.addSkillBtn, styles.pickerBtn, { marginBottom: 0 }]} onPress={() => setPicker("languages")} accessibilityRole="button">
              <Ionicons name="add" size={16} color={colors.white} />
              <Text style={styles.addSkillBtnText}>{ac("Select languages")}</Text>
            </Pressable>
          </SectionCard>

          <SectionCard title={ac("Profile links")}>
            <FieldLabel label={ac("LinkedIn Profile")} />
            <TextInput
              style={styles.input}
              value={linkedin}
              maxLength={500}
              onChangeText={setLinkedin}
              placeholder="https://linkedin.com/in/…"
              placeholderTextColor={colors.placeholder}
              autoCapitalize="none"
              keyboardType="url"
            />
            <FieldLabel label={ac("Portfolio Website")} />
            <TextInput
              style={[styles.input, { marginBottom: 0 }]}
              value={portfolio}
              maxLength={500}
              onChangeText={setPortfolio}
              placeholder="https://website.com"
              placeholderTextColor={colors.placeholder}
              autoCapitalize="none"
              keyboardType="url"
            />
          </SectionCard>

          <View style={styles.accountList}>
            <Text style={styles.accountHeading}>{ac("Your account")}</Text>
            {ACCOUNT_LINKS.map((row) => (
              <BrandLinkRow
                key={row.href}
                icon={row.icon}
                label={ac(row.title)}
                hint={
                  row.href === "/mobility-profile" ? discoveryHint : ac(row.subtitle)
                }
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

      <PickerModal
        visible={picker === "skills"}
        title={ac("Select skills")}
        options={ALL_SKILLS}
        selected={skills}
        onToggle={toggleSkillChoice}
        onClose={() => setPicker(null)}
        searchPlaceholder={ac("Search skills…")}
      />
      <PickerModal
        visible={picker === "primaryIndustry"}
        title={ac("Primary Industry")}
        options={profileOptions.industries}
        selected={primaryIndustry ? [primaryIndustry] : []}
        onToggle={choosePrimaryIndustry}
        onClose={() => setPicker(null)}
        searchPlaceholder={ac("Search industries")}
      />
      <PickerModal
        visible={picker === "secondaryIndustries"}
        title={ac("Secondary Industries")}
        options={profileOptions.industries.filter((industry) => industry !== primaryIndustry)}
        selected={secondaryIndustries}
        onToggle={toggleSecondaryIndustry}
        onClose={() => setPicker(null)}
        searchPlaceholder={ac("Search industries")}
      />
      <PickerModal
        visible={picker === "languages"}
        title={ac("Languages Spoken")}
        options={profileOptions.languages}
        selected={languages.map((row) => row.language)}
        onToggle={toggleLanguage}
        onClose={() => setPicker(null)}
        searchPlaceholder={ac("Select languages")}
      />
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
  optInCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  optInCopy: { flex: 1, minWidth: 0 },
  optInEyebrow: { fontFamily: fontFamily.extraBold, fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", color: "#047857" },
  optInEyebrowOn: { color: "#6ee7b7" },
  optInTitle: { marginTop: 4, fontFamily: fontFamily.headingStrong, fontSize: 18, color: colors.navy, letterSpacing: -0.3 },
  optInTitleOn: { color: colors.white },
  optInBody: { marginTop: 4, fontFamily: fontFamily.regular, fontSize: 13, lineHeight: 18, color: colors.textMuted },
  optInBodyOn: { color: "rgba(255,255,255,0.78)" },
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
  quickCard: { padding: 16 },
  quickRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  quickIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  quickTitle: { fontSize: 14, fontFamily: fontFamily.extraBold, color: colors.navy },
  quickHint: { marginTop: 2, fontSize: 12, fontFamily: fontFamily.semiBold, color: colors.textMuted },
  quickScore: { marginTop: 4, fontSize: 12, fontFamily: fontFamily.extraBold, color: colors.navy, textDecorationLine: "underline" },
  quickPill: {
    minHeight: 36,
    minWidth: 72,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: colors.cyan,
    alignItems: "center",
    justifyContent: "center",
  },
  quickPillText: { fontSize: 12, fontFamily: fontFamily.extraBold, color: colors.navy },
  quickHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  quickEdit: { fontSize: 13, fontFamily: fontFamily.bold, color: colors.textMuted },
  countryChips: { flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start", gap: 8 },
  countryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.navy,
    backgroundColor: colors.cyan,
  },
  countryChipText: { fontSize: 12, fontFamily: fontFamily.extraBold, color: colors.navy },

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
  pickerBtn: { alignSelf: "flex-start", marginBottom: 16 },

  // Career history and languages
  listHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4, marginBottom: 10 },
  listAdd: { fontSize: 14, fontFamily: fontFamily.semiBold, color: colors.navy, textDecorationLine: "underline" },
  listSuggest: { alignSelf: "flex-start", minHeight: 44, justifyContent: "center", paddingHorizontal: 14, borderRadius: radii.pill, borderWidth: 1.5, borderColor: colors.navy, marginBottom: 12 },
  listSuggestText: { fontSize: 13, fontFamily: fontFamily.semiBold, color: colors.navy },
  listCard: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 12, paddingTop: 8, marginBottom: 14, backgroundColor: colors.surfaceMuted },
  listRemove: { alignSelf: "flex-end", minWidth: 44, minHeight: 36, alignItems: "flex-end", justifyContent: "center" },
  checkRow: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 44 },
  checkText: { fontSize: 14, fontFamily: fontFamily.regular, color: colors.textPrimary },
  photoRow: { flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 18 },
  photoCircle: { width: 72, height: 72, borderRadius: 36, overflow: "hidden", alignItems: "center", justifyContent: "center", backgroundColor: colors.navy },
  photoInitials: { fontSize: 24, fontFamily: fontFamily.heading, color: colors.white },
  languageRow: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border, marginBottom: 12 },
  languageHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 36, marginBottom: 6 },
  languageName: { fontSize: 15, fontFamily: fontFamily.semiBold, color: colors.navy },

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
