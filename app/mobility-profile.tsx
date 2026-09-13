import { parseBudgetCost } from "@/lib/relocationBudget";
import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchOwnProfile, updateProfile } from "@/lib/api-client";
import {
  commaCountries,
  hydrateMobilityProfile,
  mobilityPayload,
} from "@/lib/candidate-mobility";
import { canonicalCountryCode, isCountryInputListValid } from "@/lib/countries";
import { CountryPicker } from "@/components/CountryPicker";
import { OccupationPicker } from "@/components/OccupationPicker";
import {
  CANDIDATE_AVAILABILITY_OPTIONS,
  EMPLOYMENT_OPTIONS,
  type CandidateMobilityProfile,
  type EmploymentOption,
  type WorkAuthorization,
  type Qualification,
  type ProfessionalRegistration,
} from "@/types/mobility";
import { MobilityRecordError, validateMobilityRecords } from "@/lib/mobility-records";
import { colors, fontFamily, navHeader, radii } from "@/lib/theme";

const EMPLOYMENT_LABELS: Record<EmploymentOption, string> = {
  on_site: "On-site",
  hybrid: "Hybrid",
  remote_domestic: "Remote in employing country",
  remote_cross_border: "Cross-border remote",
  relocation: "Relocation",
  employer_of_record: "Employer of record",
  local_entity: "Local entity employment",
};
const SPONSORSHIP = [
  "Requires sponsorship",
  "No sponsorship required",
  "Already sponsored",
  "Open to relocation support",
];
const RELOCATION = [
  "Ready to relocate",
  "Can relocate with employer support",
  "Remote-first only",
  "Exploring options",
  "Not willing to relocate",
];
const MISSING_LABELS: Record<string, string> = {
  "candidate.currentResidenceCountry": "current country of residence",
  "candidate.desiredOccupations": "desired occupations",
  "candidate.workAuthorizationsOrRequiresVisaSponsorship":
    "work authorization or sponsorship need",
  "candidate.employmentOptions": "employment options",
  "candidate.targetCountries": "target countries",
  "candidate.willingToRelocate": "relocation willingness",
  "candidate.availability": "interview or start availability",
  "candidate.yearsOfExperience": "years of experience (main profile)",
  "candidate.expectedMinSalary": "minimum salary",
  "candidate.expectedMaxSalary": "maximum salary",
  "candidate.expectedSalaryCurrency": "salary currency",
  "candidate.expectedSalaryPeriod": "salary period",
};

function Field({
  label,
  hint,
  value,
  onChangeText,
  multiline,
  keyboardType,
  autoCapitalize = "sentences",
}: {
  label: string;
  hint?: string;
  value: string;
  onChangeText: (value: string) => void;
  multiline?: boolean;
  keyboardType?: "default" | "numeric";
  autoCapitalize?: "none" | "sentences" | "characters";
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      <TextInput
        accessibilityLabel={label}
        style={[styles.input, multiline && styles.multiline]}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        placeholderTextColor={colors.placeholder}
      />
    </View>
  );
}

function Chips({
  options,
  value,
  onToggle,
  labels,
}: {
  options: readonly string[];
  value: string[];
  onToggle: (item: string) => void;
  labels?: Record<string, string>;
}) {
  const ac = useAccountCopy();
  return (
    <View style={styles.chips}>
      {options.map((option) => {
        const selected = value.includes(option);
        return (
          <Pressable
            key={option}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: selected }}
            accessibilityLabel={ac(labels?.[option] || option)}
            onPress={() => onToggle(option)}
            style={[styles.chip, selected && styles.chipOn]}
          >
            <Text style={[styles.chipText, selected && styles.chipTextOn]}>
              {ac(labels?.[option] || option)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Records<T extends object>({
  rows,
  onChange,
  name,
  empty,
  fields,
}: {
  rows: T[];
  onChange: (rows: T[]) => void;
  name: string;
  empty: T;
  fields: { key: keyof T; label: string; hint?: string; options?: string[] }[];
}) {
  const ac = useAccountCopy();
  const labels: Record<string, string> = {
    confirmed: "Confirmed",
    pending: "Pending",
    expired: "Expired",
    unknown: "Not sure",
    active: "Active",
    not_held: "Not held",
  };
  return (
    <View style={{ gap: 12 }}>
      {rows.map((row, index) => (
        <View key={index} style={styles.record}>
          <View style={styles.recordHeader}>
            <Text style={styles.label}>
              {ac(name)} {index + 1}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={ac("Remove: {label}", {label: `${ac(name)} ${index+1}`})}
              onPress={() => onChange(rows.filter((_, i) => i !== index))}
              style={styles.remove}
            >
              <Text style={styles.linkText}>{ac("Remove")}</Text>
            </Pressable>
          </View>
          {fields.map((field) => {
            const value =
              typeof row[field.key] === "string" ? String(row[field.key]) : "";
            const change = (v: string) =>
              onChange(
                rows.map((r, i) =>
                  i === index ? { ...r, [field.key]: v } : r,
                ),
              );
            return String(field.key) === "country" ? (
              <CountryPicker key={String(field.key)} label={ac(field.label)} value={value} onChange={change} />
            ) : field.options ? (
              <View key={String(field.key)} style={styles.field}>
                <Text style={styles.label}>{ac(field.label)}</Text>
                <Chips
                  options={field.options}
                  value={[value]}
                  labels={labels}
                  onToggle={change}
                />
              </View>
            ) : (
              <Field
                key={String(field.key)}
                label={ac(field.label)}
                hint={field.hint ? ac(field.hint) : undefined}
                value={value}
                onChangeText={change}
              />
            );
          })}
        </View>
      ))}
      <Pressable
        accessibilityRole="button"
        onPress={() => onChange([...rows, { ...empty }])}
        style={styles.linkButton}
      >
        <Text style={styles.linkText}>{ac("Add: {label}", {label: ac(name)})}</Text>
      </Pressable>
    </View>
  );
}

export default function MobilityProfileScreen() {
 const ac = useAccountCopy();
  const router = useRouter();
  const queryClient = useQueryClient();
  const profileQuery = useQuery({
    queryKey: ["profile", "me"],
    queryFn: fetchOwnProfile,
  });
  const [form, setForm] = useState<CandidateMobilityProfile>();
  const [residence, setResidence] = useState("");
  const [citizenships, setCitizenships] = useState("");
  const [authorizations, setAuthorizations] = useState<WorkAuthorization[]>([]);
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [registrations, setRegistrations] = useState<
    ProfessionalRegistration[]
  >([]);
  const [targets, setTargets] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");

  useEffect(() => {
    if (!profileQuery.data || form) return;
    const value = hydrateMobilityProfile(profileQuery.data);
    setForm(value);
    setResidence(value.currentResidenceCountry);
    setCitizenships(value.citizenshipCountries.join(", "));
    setAuthorizations(value.workAuthorizations);
    setQualifications(value.qualifications);
    setRegistrations(value.professionalRegistrations);
    setTargets(value.targetCountries.join(", "));
    setSalaryMin(
      value.expectedMinSalary == null ? "" : String(value.expectedMinSalary),
    );
    setSalaryMax(
      value.expectedMaxSalary == null ? "" : String(value.expectedMaxSalary),
    );
  }, [profileQuery.data, form]);

  const localErrors: Record<string,string> = {"MOBILITY_INPUT_0": ac("Profile is still loading."), "MOBILITY_INPUT_1": ac("Choose your current country of residence."), "MOBILITY_INPUT_2": ac("Check your citizenship and target countries."), "MOBILITY_INPUT_3": ac("You can save up to 25 desired occupations."), "MOBILITY_INPUT_4": ac("Add at least one desired occupation."), "MOBILITY_INPUT_5": ac("Select at least one employment option."), "MOBILITY_INPUT_6": ac("Select sponsorship and relocation readiness."), "MOBILITY_INPUT_7": ac("Select your interview or start availability."), "MOBILITY_INPUT_8": ac("Enter a valid salary range; maximum must be at least minimum.")};
  const errorCopy = (error: unknown) => error instanceof MobilityRecordError
    ? ac(error.copyKey, {label: `${ac(error.record)} ${error.index}`})
    : ac(error instanceof Error && localErrors[error.message] ? localErrors[error.message] : "Could not save settings. Try again.");

  const save = useMutation({
    mutationFn: async () => {
      if (!form) throw new Error("MOBILITY_INPUT_0");
      const country = canonicalCountryCode(residence);
      if (!country)
        throw new Error("MOBILITY_INPUT_1");
      if (
        !isCountryInputListValid(citizenships) ||
        !isCountryInputListValid(targets)
      ) {
        throw new Error("MOBILITY_INPUT_2");
      }
      const desiredOccupations = form.desiredOccupations;
      if (desiredOccupations.length > 25)
        throw new Error("MOBILITY_INPUT_3");
      if (!desiredOccupations.length)
        throw new Error("MOBILITY_INPUT_4");
      if (!form.employmentOptions.length)
        throw new Error("MOBILITY_INPUT_5");
      if (!form.sponsorshipStatus || !form.relocationReadiness)
        throw new Error("MOBILITY_INPUT_6");
      if (!form.availability)
        throw new Error("MOBILITY_INPUT_7");
      const minimum = parseBudgetCost(salaryMin);
      const maximum = parseBudgetCost(salaryMax);
      if (
        !salaryMin ||
        !salaryMax ||
        minimum == null ||
        maximum == null ||
        minimum < 0 ||
        maximum < minimum
      ) {
        throw new Error("MOBILITY_INPUT_8");
      }
      const records = validateMobilityRecords(
        authorizations,
        qualifications,
        registrations,
      );
      return updateProfile(
        mobilityPayload({
          ...form,
          currentResidenceCountry: country,
          citizenshipCountries: commaCountries(citizenships, 50),
          desiredOccupations,
          workAuthorizations: records.workAuthorizations,
          qualifications: records.qualifications,
          professionalRegistrations: records.professionalRegistrations,
          targetCountries: commaCountries(targets, 12),
          expectedMinSalary: minimum,
          expectedMaxSalary: maximum,
        }),
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
      Alert.alert(
        ac("Mobility profile saved"),
        ac("Your job comparisons will use your saved details."),
      );
    },
    onError: (error: unknown) =>
      Alert.alert(
        ac("Could not save"),
        errorCopy(error),
      ),
  });

  if (profileQuery.isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>{ac("Could not load your profile")}</Text>
        <Pressable
          style={styles.button}
          onPress={() => void profileQuery.refetch()}
        >
          <Text style={styles.buttonText}>{ac("Try again")}</Text>
        </Pressable>
      </View>
    );
  }

  if (profileQuery.isLoading || !form)
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.brand} size="large" />
      </View>
    );

  const readiness = profileQuery.data ?? {};
  const missing = Array.isArray(readiness.mobilityProfileMissingPaths)
    ? (readiness.mobilityProfileMissingPaths as string[])
    : [];
  const toggle = (key: "employmentOptions", item: EmploymentOption) =>
    setForm(
      (current) =>
        current && {
          ...current,
          [key]: current[key].includes(item)
            ? current[key].filter((x) => x !== item)
            : [...current[key], item],
        },
    );

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <Stack.Screen
        options={{ title: ac("Your work & move preferences"), ...navHeader }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.intro}>
            <Text style={styles.title}>{ac("Your work & move preferences")}</Text>
            <Text style={styles.copy}>{ac("Tell us where and how you want to work. These details help compare jobs; they do not confirm visa eligibility.")}</Text>
          </View>

          <View style={styles.readiness}>
            <Text style={styles.sectionTitle}>{ac("Your saved profile")}</Text>
            <Text style={styles.copy}>
              {missing.length
                ? ac("Still to add: {fields}", {fields: missing.map(x => ac(MISSING_LABELS[x] || "Profile details")).join(", ")})
                : readiness.compatibilityReadiness === "ready"
                  ? ac("Your required job comparison details are saved.")
                  : ac("Add the details below to help us compare relevant jobs.")}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{ac("Where you live & roles you want")}</Text>
            <CountryPicker
              label={ac("Current country of residence")}
              value={residence}
              onChange={setResidence}
            />
            <CountryPicker
              label={ac("Citizenship countries (optional)")}
              hint={ac("Used only where needed for mobility guidance; not shown in employer talent counts.")}
              value={citizenships}
              onChange={setCitizenships}
              multiple
            />
            <Text style={styles.label}>{ac("Roles you want")}</Text>
            <OccupationPicker
              value={form.desiredOccupations}
              onChange={(desiredOccupations) =>
                setForm({ ...form, desiredOccupations })
              }
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{ac("Your right to work")}</Text>
            <Text style={styles.copy}>{ac("Add permission you already hold or have applied for. Leave this empty if you have none.")}</Text>
            <Records
              rows={authorizations}
              onChange={setAuthorizations}
              name="Work permission"
              empty={{ country: "", authorizationType: "", status: "unknown" }}
              fields={[
                { key: "country", label: ac("Country") },
                {
                  key: "authorizationType",
                  label: ac("Permission type"),
                  hint: ac("For example, citizenship or a work permit."),
                },
                {
                  key: "status",
                  label: ac("Status"),
                  options: ["confirmed", "pending", "expired", "unknown"],
                },
                {
                  key: "expiresAt",
                  label: ac("Expiry date (optional)"),
                  hint: "YYYY-MM-DD",
                },
              ]}
            />
            <Text style={styles.hint}>{ac("These are your declared details. Global Sponsor Hub has not verified them.")}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{ac("Employment options")}</Text>
            <Chips
              options={EMPLOYMENT_OPTIONS}
              value={form.employmentOptions}
              labels={EMPLOYMENT_LABELS}
              onToggle={(item) =>
                toggle("employmentOptions", item as EmploymentOption)
              }
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{ac("Sponsorship and relocation")}</Text>
            <Text style={styles.label}>{ac("Sponsorship requirement")}</Text>
            <Chips
              options={SPONSORSHIP}
              value={[form.sponsorshipStatus]}
              onToggle={(item) =>
                setForm({
                  ...form,
                  sponsorshipStatus: item,
                  requiresVisaSponsorship: item === SPONSORSHIP[0],
                })
              }
            />
            <Text style={styles.label}>{ac("Relocation readiness")}</Text>
            <Chips
              options={RELOCATION}
              value={[form.relocationReadiness]}
              onToggle={(item) =>
                setForm({ ...form, relocationReadiness: item })
              }
            />
            <View style={styles.switchRow}>
              <Text style={styles.switchText}>{ac("I am willing to relocate for a relevant opportunity")}</Text>
              <Switch
                accessibilityLabel={ac("Willing to relocate")}
                value={form.willingToRelocate}
                onValueChange={(value) =>
                  setForm({ ...form, willingToRelocate: value })
                }
                trackColor={{ false: colors.borderStrong, true: colors.accent }}
              />
            </View>
            <CountryPicker
              label={ac("Countries you want to work in")}
              value={targets}
              onChange={setTargets}
              multiple
            />
            <Text style={styles.label}>{ac("Interview or start availability")}</Text>
            <Chips
              options={CANDIDATE_AVAILABILITY_OPTIONS}
              value={form.availability ? [form.availability] : []}
              onToggle={(item) =>
                setForm({
                  ...form,
                  availability:
                    item as CandidateMobilityProfile["availability"],
                })
              }
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{ac("Expected salary")}</Text>
            <Field
              label={ac("Minimum salary")}
              value={salaryMin}
              onChangeText={setSalaryMin}
              keyboardType="numeric"
            />
            <Field
              label={ac("Maximum salary")}
              value={salaryMax}
              onChangeText={setSalaryMax}
              keyboardType="numeric"
            />
            <Field
              label={ac("Currency")}
              hint={ac("Supported currencies: USD, EUR, GBP, CAD, AUD, INR, NGN, AED.")}
              value={form.expectedSalaryCurrency}
              onChangeText={(value) =>
                setForm({
                  ...form,
                  expectedSalaryCurrency: value
                    .toUpperCase()
                    .replace(/[^A-Z]/g, "")
                    .slice(0, 3),
                })
              }
              autoCapitalize="characters"
            />
            <Text style={styles.label}>{ac("Period")}</Text>
            <Chips
              options={["year", "month"]}
              value={[form.expectedSalaryPeriod]}
              onToggle={(item) =>
                setForm({
                  ...form,
                  expectedSalaryPeriod: item as "year" | "month",
                })
              }
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{ac("Qualifications (optional)")}</Text>
            <Records
              rows={qualifications}
              onChange={setQualifications}
              name="Qualification"
              empty={{ name: "" }}
              fields={[
                { key: "name", label: ac("Qualification name") },
                { key: "issuer", label: ac("Awarding organisation (optional)") },
                { key: "country", label: ac("Country (optional)") },
                { key: "level", label: ac("Level (optional)") },
                {
                  key: "awardedAt",
                  label: ac("Award date (optional)"),
                  hint: "YYYY-MM-DD",
                },
                {
                  key: "expiresAt",
                  label: ac("Expiry date (optional)"),
                  hint: "YYYY-MM-DD",
                },
              ]}
            />
          </View>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{ac("Professional registrations (optional)")}</Text>
            <Text style={styles.copy}>{ac("Add registrations needed to practise your profession.")}</Text>
            <Records
              rows={registrations}
              onChange={setRegistrations}
              name="Registration"
              empty={{ country: "", registrationType: "", status: "unknown" }}
              fields={[
                { key: "country", label: ac("Country") },
                { key: "registrationType", label: ac("Registration type") },
                { key: "authority", label: ac("Registration body (optional)") },
                {
                  key: "status",
                  label: ac("Status"),
                  options: [
                    "active",
                    "pending",
                    "expired",
                    "not_held",
                    "unknown",
                  ],
                },
                {
                  key: "registrationNumber",
                  label: ac("Registration number (optional)"),
                },
                {
                  key: "expiresAt",
                  label: ac("Expiry date (optional)"),
                  hint: "YYYY-MM-DD",
                },
              ]}
            />
            <Text style={styles.hint}>{ac("These are your declared details. Global Sponsor Hub has not verified them.")}</Text>
          </View>

          <View style={styles.consent}>
            <Text style={styles.switchText}>{ac("Who can find and contact you?")}</Text>
            <Text style={styles.hint}>{ac("Choose employers, agencies, both or neither for jobs abroad and remote work.")}</Text>
            {(
              [
                [
                  "employerDiscoveryConsentEnabled",
                  ac("Let subscribed employers find my profile"),
                ],
                [
                  "employerMessagingConsentEnabled",
                  ac("Allow these employers to message me"),
                ],
                [
                  "agencyDiscoveryConsentEnabled",
                  ac("Let subscribed agencies find my profile"),
                ],
                [
                  "agencyMessagingConsentEnabled",
                  ac("Allow these agencies to message me"),
                ],
              ] as const
            ).map(([field, label]) => {
              const discovery = field.startsWith("agency")
                ? form.agencyDiscoveryConsentEnabled
                : form.employerDiscoveryConsentEnabled;
              const messaging = field.includes("Messaging");
              return (
                <View key={field} style={styles.switchRow}>
                  <Text style={styles.switchText}>{ac(label)}</Text>
                  <Switch
                    accessibilityLabel={ac(label)}
                    value={form[field] && (!messaging || discovery)}
                    disabled={messaging && !discovery}
                    onValueChange={(enabled) =>
                      setForm({ ...form, [field]: enabled })
                    }
                    trackColor={{
                      false: colors.borderStrong,
                      true: colors.accent,
                    }}
                  />
                </View>
              );
            })}
            <Text style={styles.hint}>{ac("Optional. Switch discovery off to stop new contact from that group. You can still apply and read earlier messages. Save to apply your changes.")}</Text>
          </View>

          <Pressable
            onPress={() => router.push("/profile-extraction-review")}
            accessibilityRole="button"
            style={styles.linkButton}
          >
            <Text style={styles.linkText}>{ac("CV suggestions — coming soon")}</Text>
          </Pressable>
        </ScrollView>
        <View style={styles.saveBar}>
          <View style={styles.saveBarCopy}>
            <Text style={styles.saveBarTitle}>{ac("Your work & move preferences")}</Text>
            <Text
              style={[
                styles.saveBarStatus,
                save.isError && styles.saveBarError,
              ]}
            >
              {save.isError
                ? errorCopy(save.error)
                : save.isSuccess
                  ? ac("Your preferences are saved.")
                  : ac("Save your work and move preferences.")}
            </Text>
          </View>
          <Pressable
            style={[styles.button, save.isPending && { opacity: 0.6 }]}
            disabled={save.isPending}
            onPress={() => save.mutate()}
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>
              {save.isPending
                ? ac("Saving…")
                : save.isError
                  ? ac("Save profile")
                  : ac("Save")}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: 24,
    backgroundColor: colors.white,
  },
  content: {
    padding: 16,
    paddingBottom: 24,
    gap: 24,
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
  },
  intro: { gap: 7, marginBottom: 2 },
  title: { fontSize: 22, fontFamily: fontFamily.heading, color: colors.navy },
  copy: {
    fontSize: 13,
    lineHeight: 19,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
  },
  readiness: {
    padding: 14,
    borderRadius: radii.lg,
    backgroundColor: "#ecfeff",
    borderWidth: 1,
    borderColor: "#a5f3fc",
    gap: 5,
  },
  card: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderColor: colors.border,
    gap: 14,
  },
  record: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  recordHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  remove: { minHeight: 44, justifyContent: "center", paddingHorizontal: 8 },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fontFamily.heading,
    color: colors.navy,
  },
  field: { gap: 5 },
  label: {
    fontSize: 13,
    fontFamily: fontFamily.semiBold,
    color: colors.textPrimary,
    marginTop: 4,
  },
  hint: {
    fontSize: 12,
    lineHeight: 17,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
  },
  input: {
    minHeight: 52,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    fontSize: 16,
    fontFamily: fontFamily.regular,
    color: colors.textPrimary,
  },
  multiline: { minHeight: 90 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 13,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
  },
  chipOn: { backgroundColor: colors.brand, borderColor: colors.brand },
  chipText: {
    fontSize: 12,
    fontFamily: fontFamily.semiBold,
    color: colors.textSecondary,
  },
  chipTextOn: { color: colors.white },
  switchRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  switchText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: fontFamily.semiBold,
    color: colors.textPrimary,
  },
  attestation: {
    padding: 10,
    borderRadius: 9,
    backgroundColor: "#fffbeb",
    color: "#92400e",
    fontSize: 12,
    lineHeight: 17,
    fontFamily: fontFamily.medium,
  },
  consent: {
    padding: 16,
    gap: 8,
    borderRadius: radii.lg,
    backgroundColor: "#ecfeff",
    borderWidth: 1,
    borderColor: "#67e8f9",
  },
  button: {
    minWidth: 96,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 99,
    backgroundColor: colors.brand,
    paddingHorizontal: 18,
  },
  buttonText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.bold,
  },
  linkButton: { minHeight: 44, alignItems: "center", justifyContent: "center" },
  linkText: {
    color: colors.brand,
    fontSize: 14,
    fontFamily: fontFamily.semiBold,
    textDecorationLine: "underline",
  },
  saveBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  saveBarCopy: { flex: 1, minWidth: 0 },
  saveBarTitle: {
    fontSize: 13,
    fontFamily: fontFamily.bold,
    color: colors.navy,
  },
  saveBarStatus: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 15,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
  },
  saveBarError: { color: colors.error },
});
