import * as DocumentPicker from "expo-document-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CountryPicker } from "@/components/CountryPicker";
import { OccupationPicker } from "@/components/OccupationPicker";
import {
  AddBlockButton,
  FieldHint,
  FieldLabel,
  ListPickerField,
  OptionList,
  SwitchRow,
  TagInput,
  TextField,
} from "@/components/onboarding/OnboardingFieldKit";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import profileOptions from "@/data/profileOptions.json";
import {
  fetchOwnProfile,
  uploadFileFromUri,
} from "@/lib/api-client";
import { markCandidateOnboardingComplete } from "@/lib/candidate-onboarding";
import {
  CANDIDATE_AVAILABILITY_OPTIONS,
  EMPLOYMENT_LABELS,
  EMPLOYMENT_OPTIONS,
  JOB_PREFERENCE_OPTIONS,
  NOTICE_OPTIONS,
  ONBOARDING_STEPS,
  REMOTE_OPTIONS,
  RELOCATION_OPTIONS,
  REGISTRATION_STATUS,
  SALARY_CURRENCIES,
  SEARCH_INTENT_OPTIONS,
  SPONSORSHIP_OPTIONS,
  VISA_STATUS_OPTIONS,
  WORK_AUTH_STATUS,
} from "@/lib/onboarding-constants";
import {
  emptyOnboardingForm,
  hydrateOnboardingForm,
  saveOnboardingStep,
  validateOnboardingStep,
  type EducationEntry,
  type LanguageEntry,
  type OnboardingFormState,
  type WorkEntry,
} from "@/lib/onboarding-save";
import {
  isLastSignupStep,
  nextSignupStep,
  signupPosition,
  signupRoute,
  type OnboardingFrom,
} from "@/lib/onboardingFlow";
import type {
  EmploymentOption,
  ProfessionalRegistration,
  Qualification,
  WorkAuthorization,
} from "@/types/mobility";
import { hapticConfirm } from "@/lib/haptics";
import { colors, fontFamily } from "@/lib/theme";

const SPONSORSHIP_LABELS: Record<string, string> = {
  "Requires sponsorship": "Requires sponsorship",
  "No sponsorship required": "Can work without sponsorship",
  "Already sponsored": "Already sponsored",
  "Open to relocation support": "Open to relocation support",
};

const VISA_STATUS_LABELS: Record<(typeof VISA_STATUS_OPTIONS)[number], string> =
  {
    Citizen: "Citizen",
    "Permanent Resident": "Permanent resident",
    "Work Permit Required": "Work permit required",
    "Student Visa": "Student visa",
    "Work Visa": "Work visa",
    Other: "Other",
  };

const REMOTE_LABELS: Record<(typeof REMOTE_OPTIONS)[number], string> = {
  Remote: "Remote",
  Hybrid: "Hybrid",
  "On-site": "On-site",
  "Remote or Hybrid": "Remote or hybrid",
};

const JOB_PREF_LABELS: Record<(typeof JOB_PREFERENCE_OPTIONS)[number], string> =
  {
    "Full Time": "Full time",
    "Part Time": "Part time",
    Contract: "Contract",
    Freelance: "Freelance",
  };

const PERIOD_OPTIONS = ["year", "month"] as const;
const PERIOD_LABELS: Record<(typeof PERIOD_OPTIONS)[number], string> = {
  year: "Per year",
  month: "Per month",
};

const WORK_AUTH_STATUS_VALUES = WORK_AUTH_STATUS.map((o) => o.value);
const WORK_AUTH_STATUS_LABELS = Object.fromEntries(
  WORK_AUTH_STATUS.map((o) => [o.value, o.label]),
) as Record<string, string>;

const REG_STATUS_VALUES = REGISTRATION_STATUS.map((o) => o.value);
const REG_STATUS_LABELS = Object.fromEntries(
  REGISTRATION_STATUS.map((o) => [o.value, o.label]),
) as Record<string, string>;

function firstParam(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

function parseStep(raw: string): number | null {
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1 || n > 13) return null;
  return n;
}

function goHome(router: ReturnType<typeof useRouter>) {
  router.replace("/(tabs)/home");
}

function goProfile(router: ReturnType<typeof useRouter>) {
  router.replace("/(tabs)/profile");
}

export default function OnboardingStepScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const params = useLocalSearchParams<{
    step?: string | string[];
    mode?: string | string[];
    from?: string | string[];
  }>();

  const step = parseStep(firstParam(params.step));
  const modeRaw = firstParam(params.mode);
  const editMode = modeRaw === "edit";
  const from = (firstParam(params.from) || "home") as OnboardingFrom;

  const meta = useMemo(
    () => ONBOARDING_STEPS.find((item) => item.step === step) ?? null,
    [step],
  );
  const progressNow = step != null ? signupPosition(step) : null;

  const profileQuery = useQuery({
    queryKey: ["profile", "me"],
    queryFn: fetchOwnProfile,
  });

  const [form, setForm] = useState<OnboardingFormState>(emptyOnboardingForm);
  const [hydrated, setHydrated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hintBanner, setHintBanner] = useState<string | null>(null);
  const [uploadingCv, setUploadingCv] = useState(false);

  useEffect(() => {
    if (!profileQuery.data) return;
    setForm(hydrateOnboardingForm(profileQuery.data));
    setHydrated(true);
  }, [profileQuery.data]);

  const patch = useCallback((partial: Partial<OnboardingFormState>) => {
    setForm((prev) => ({ ...prev, ...partial }));
    setHintBanner(null);
    setError(null);
  }, []);

  const validationError =
    step == null ? "Missing step" : validateOnboardingStep(step, form);
  const canContinue = validationError == null;

  const primaryLabel = editMode
    ? "Save"
    : step != null && isLastSignupStep(step)
      ? "Finish"
      : "Continue";

  const leaveEdit = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    if (from === "profile" || from === "messages") {
      goProfile(router);
      return;
    }
    goHome(router);
  }, [from, router]);

  const onBack = useCallback(() => {
    if (editMode) {
      leaveEdit();
      return;
    }
    if (step === 2) {
      if (router.canGoBack()) router.back();
      else goHome(router);
      return;
    }
    if (router.canGoBack()) router.back();
    else goHome(router);
  }, [editMode, leaveEdit, router, step]);

  const persist = useCallback(
    async (bestEffort = false) => {
      if (step == null) return false;
      if (!bestEffort) {
        const invalid = validateOnboardingStep(step, form);
        if (invalid) {
          setHintBanner("Fill in the required fields to continue");
          return false;
        }
      }
      setSaving(true);
      setError(null);
      try {
        await saveOnboardingStep(step, form);
        await qc.invalidateQueries({ queryKey: ["profile", "me"] });
        return true;
      } catch {
        if (!bestEffort) {
          setError(
            "We couldn't save that. Check your connection and try again.",
          );
        }
        return false;
      } finally {
        setSaving(false);
      }
    },
    [form, qc, step],
  );

  const onContinue = useCallback(async () => {
    if (step == null) return;
    const ok = await persist(false);
    if (!ok) return;

    if (editMode) {
      leaveEdit();
      return;
    }

    if (isLastSignupStep(step)) {
      await markCandidateOnboardingComplete();
      void hapticConfirm();
      goHome(router);
      return;
    }

    const next = nextSignupStep(step);
    if (next == null) {
      await markCandidateOnboardingComplete();
      goHome(router);
      return;
    }
    router.push(signupRoute(next) as never);
  }, [editMode, leaveEdit, persist, router, step]);

  const onFinishLater = useCallback(async () => {
    if (step == null) return;
    const valid = validateOnboardingStep(step, form) == null;
    await persist(valid ? false : true);
    await markCandidateOnboardingComplete();
    goHome(router);
  }, [form, persist, router, step]);

  const uploadCv = useCallback(async () => {
    try {
      setUploadingCv(true);
      setError(null);
      const res = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
      });
      if (res.canceled || !res.assets?.[0]) return;
      const asset = res.assets[0];
      const name = asset.name || "cv.pdf";
      if (!/\.(pdf|doc|docx)$/i.test(name)) {
        setError("Use a PDF, DOC, or DOCX file up to 10MB.");
        return;
      }
      if (typeof asset.size === "number" && asset.size > 10 * 1024 * 1024) {
        setError("This CV is too large. The limit is 10MB.");
        return;
      }
      const up = await uploadFileFromUri(
        asset.uri,
        name,
        asset.mimeType ?? "application/pdf",
      );
      patch({ resumeUrl: up.url, resumeName: name });
    } catch {
      setError("We couldn't save that. Check your connection and try again.");
    } finally {
      setUploadingCv(false);
    }
  }, [patch]);

  if (step == null || !meta) {
    return (
      <View style={styles.center}>
        <Text style={styles.centerText}>That onboarding step was not found.</Text>
        <Pressable
          onPress={() => goHome(router)}
          accessibilityRole="button"
          style={styles.centerBtn}
        >
          <Text style={styles.centerBtnText}>Go to Home</Text>
        </Pressable>
      </View>
    );
  }

  if (profileQuery.isLoading || !hydrated) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.navy} />
      </View>
    );
  }

  if (profileQuery.isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.centerText}>
          We couldn't load your profile. Check your connection and try again.
        </Text>
        <Pressable
          onPress={() => void profileQuery.refetch()}
          accessibilityRole="button"
          style={styles.centerBtn}
        >
          <Text style={styles.centerBtnText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  const showRequiredNote = !meta.optional;

  return (
    <OnboardingShell
      progressNow={progressNow ?? 1}
      progressMax={7}
      group={meta.group}
      photo={meta.photo}
      heading={meta.heading}
      sub={meta.sub}
      optional={meta.optional}
      editMode={editMode || progressNow == null}
      requiredNote={showRequiredNote}
      saving={saving}
      canContinue={canContinue}
      primaryLabel={primaryLabel}
      error={error}
      hintBanner={hintBanner}
      onBack={onBack}
      onFinishLater={
        editMode || progressNow == null ? undefined : () => void onFinishLater()
      }
      onContinue={() => void onContinue()}
      onDisabledPress={() =>
        setHintBanner("Fill in the required fields to continue")
      }
    >
      <StepFields
        step={step}
        form={form}
        patch={patch}
        uploadingCv={uploadingCv}
        onUploadCv={() => void uploadCv()}
      />
    </OnboardingShell>
  );
}

function StepFields({
  step,
  form,
  patch,
  uploadingCv,
  onUploadCv,
}: {
  step: number;
  form: OnboardingFormState;
  patch: (partial: Partial<OnboardingFormState>) => void;
  uploadingCv: boolean;
  onUploadCv: () => void;
}) {
  switch (step) {
    case 1:
      return (
        <>
          <TextField
            label="First name"
            value={form.firstName}
            onChangeText={(firstName) => patch({ firstName })}
            placeholder="First name"
            autoCapitalize="words"
          />
          <TextField
            label="Last name"
            value={form.lastName}
            onChangeText={(lastName) => patch({ lastName })}
            placeholder="Last name"
            autoCapitalize="words"
          />
        </>
      );
    case 2:
      return (
        <>
          <CountryPicker
            label="Current country of residence *"
            value={form.currentResidenceCountry}
            onChange={(currentResidenceCountry) =>
              patch({ currentResidenceCountry })
            }
            placeholder="Select a country"
            guideFirst
          />
          <TextField
            label="Current location"
            value={form.location}
            onChangeText={(location) => patch({ location })}
            placeholder="For example, Manchester"
          />
          <CountryPicker
            label="Nationality or citizenship"
            hint="Used only where needed for mobility guidance. Not shown in employer talent counts."
            value={form.citizenshipCountries || form.nationality}
            onChange={(value) =>
              patch({
                citizenshipCountries: value,
                nationality: value,
              })
            }
            multiple
            placeholder="Select nationalities"
            guideFirst
          />
        </>
      );
    case 3:
      return (
        <>
          <View style={styles.block}>
            <FieldLabel required>Sponsorship requirement</FieldLabel>
            <OptionList
              options={SPONSORSHIP_OPTIONS}
              value={form.sponsorshipStatus ? [form.sponsorshipStatus] : []}
              labels={SPONSORSHIP_LABELS}
              onChange={(next) =>
                patch({ sponsorshipStatus: next[0] ?? "" })
              }
            />
          </View>
          <View style={styles.block}>
            <FieldLabel>Visa status</FieldLabel>
            <OptionList
              options={VISA_STATUS_OPTIONS}
              value={form.currentVisaStatus ? [form.currentVisaStatus] : []}
              labels={VISA_STATUS_LABELS}
              onChange={(next) =>
                patch({ currentVisaStatus: next[0] ?? "" })
              }
            />
          </View>
        </>
      );
    case 4:
      return (
        <>
          <SwitchRow
            label="I am willing to relocate for a relevant opportunity"
            value={form.willingToRelocate}
            onValueChange={(willingToRelocate) => patch({ willingToRelocate })}
          />
          <CountryPicker
            label="Target countries"
            hint={
              form.willingToRelocate
                ? "Add at least one target country when you are willing to relocate."
                : undefined
            }
            value={form.targetCountries}
            onChange={(targetCountries) => patch({ targetCountries })}
            multiple
            placeholder="Select countries"
            guideFirst
          />
          <View style={styles.block}>
            <FieldLabel required>Relocation readiness</FieldLabel>
            <OptionList
              options={RELOCATION_OPTIONS}
              value={
                form.relocationReadiness ? [form.relocationReadiness] : []
              }
              onChange={(next) =>
                patch({ relocationReadiness: next[0] ?? "" })
              }
            />
          </View>
          <TextField
            label="Preferred job location"
            value={form.preferredJobLocation}
            onChangeText={(preferredJobLocation) =>
              patch({ preferredJobLocation })
            }
            placeholder="For example, Remote, Toronto, Berlin"
          />
        </>
      );
    case 5:
      return (
        <WorkAuthEditor
          rows={form.workAuthorizations}
          onChange={(workAuthorizations) => patch({ workAuthorizations })}
        />
      );
    case 6:
      return (
        <>
          <View style={styles.block}>
            <FieldLabel required>Roles you want</FieldLabel>
            <FieldHint>Add at least one, up to 25.</FieldHint>
            <OccupationPicker
              value={form.desiredOccupations}
              onChange={(desiredOccupations) =>
                patch({ desiredOccupations: desiredOccupations.slice(0, 25) })
              }
            />
          </View>
          <TextField
            label="Current or most recent job title"
            value={form.currentJobTitle}
            onChangeText={(currentJobTitle) => patch({ currentJobTitle })}
            placeholder="For example, Software engineer"
          />
          <TextField
            label="Current company"
            value={form.currentCompany}
            onChangeText={(currentCompany) => patch({ currentCompany })}
            placeholder="For example, Acme Ltd"
          />
          <TextField
            label="Years of experience"
            value={form.yearsOfExperience}
            onChangeText={(yearsOfExperience) =>
              patch({
                yearsOfExperience: yearsOfExperience.replace(/[^\d]/g, ""),
              })
            }
            placeholder="For example, 7"
            keyboardType="number-pad"
            hint="Whole years, 0 to 50."
          />
        </>
      );
    case 7:
      return (
        <>
          <ListPickerField
            label="Primary industry"
            placeholder="Choose one main industry"
            options={profileOptions.industries}
            selected={form.primaryIndustry ? [form.primaryIndustry] : []}
            onToggle={(industry) =>
              patch({
                primaryIndustry:
                  form.primaryIndustry === industry ? "" : industry,
                secondaryIndustries: form.secondaryIndustries.filter(
                  (item) => item !== industry,
                ),
              })
            }
            searchPlaceholder="Search industries"
          />
          <ListPickerField
            label="Secondary industries"
            placeholder="Choose up to two other industries"
            options={profileOptions.industries.filter(
              (industry) => industry !== form.primaryIndustry,
            )}
            selected={form.secondaryIndustries}
            multiple
            onToggle={(industry) => {
              const on = form.secondaryIndustries.includes(industry);
              if (on) {
                patch({
                  secondaryIndustries: form.secondaryIndustries.filter(
                    (item) => item !== industry,
                  ),
                });
                return;
              }
              if (form.secondaryIndustries.length >= 2) return;
              patch({
                secondaryIndustries: [...form.secondaryIndustries, industry],
              });
            }}
            searchPlaceholder="Search industries"
          />
          <TagInput
            label="Skills"
            values={form.skills}
            onChange={(skills) => patch({ skills: skills.slice(0, 50) })}
            placeholder="For example, Patient care"
            max={50}
          />
          <ListPickerField
            label="Languages spoken"
            placeholder="Select languages"
            options={profileOptions.languages}
            selected={form.languages.map((row) => row.language)}
            multiple
            onToggle={(language) => {
              const exists = form.languages.some(
                (row) => row.language === language,
              );
              if (exists) {
                patch({
                  languages: form.languages.filter(
                    (row) => row.language !== language,
                  ),
                });
                return;
              }
              const next: LanguageEntry = {
                language,
                fluency: "Conversational",
              };
              patch({ languages: [...form.languages, next].slice(0, 20) });
            }}
            searchPlaceholder="Search languages"
          />
        </>
      );
    case 8:
      return (
        <>
          <View style={styles.block}>
            <FieldLabel required>Employment options</FieldLabel>
            <OptionList
              multiple
              options={EMPLOYMENT_OPTIONS}
              value={form.employmentOptions}
              labels={EMPLOYMENT_LABELS}
              onChange={(next) =>
                patch({ employmentOptions: next as EmploymentOption[] })
              }
            />
          </View>
          <View style={styles.block}>
            <FieldLabel>Remote work</FieldLabel>
            <OptionList
              options={REMOTE_OPTIONS}
              value={
                form.remoteWorkPreference ? [form.remoteWorkPreference] : []
              }
              labels={REMOTE_LABELS}
              onChange={(next) =>
                patch({ remoteWorkPreference: next[0] ?? "" })
              }
            />
          </View>
          <View style={styles.block}>
            <FieldLabel>Job preferences</FieldLabel>
            <OptionList
              multiple
              options={JOB_PREFERENCE_OPTIONS}
              value={form.jobPreferences}
              labels={JOB_PREF_LABELS}
              onChange={(jobPreferences) => patch({ jobPreferences })}
            />
          </View>
        </>
      );
    case 9:
      return (
        <>
          <View style={styles.block}>
            <FieldLabel required>Interview or start availability</FieldLabel>
            <OptionList
              options={CANDIDATE_AVAILABILITY_OPTIONS}
              value={form.availability ? [form.availability] : []}
              onChange={(next) => patch({ availability: next[0] ?? "" })}
            />
          </View>
          <View style={styles.block}>
            <FieldLabel>Notice period</FieldLabel>
            <OptionList
              options={NOTICE_OPTIONS}
              value={form.noticePeriod ? [form.noticePeriod] : []}
              onChange={(next) => patch({ noticePeriod: next[0] ?? "" })}
            />
          </View>
          <View style={styles.block}>
            <FieldLabel>Job-search intent</FieldLabel>
            <OptionList
              options={SEARCH_INTENT_OPTIONS}
              value={form.jobSearchIntent ? [form.jobSearchIntent] : []}
              onChange={(next) => patch({ jobSearchIntent: next[0] ?? "" })}
            />
          </View>
        </>
      );
    case 10:
      return (
        <>
          <View style={styles.row}>
            <View style={styles.half}>
              <TextField
                label="Minimum salary"
                required
                value={form.salaryMin}
                onChangeText={(salaryMin) => patch({ salaryMin })}
                placeholder="45000"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.half}>
              <TextField
                label="Maximum salary"
                required
                value={form.salaryMax}
                onChangeText={(salaryMax) => patch({ salaryMax })}
                placeholder="60000"
                keyboardType="numeric"
              />
            </View>
          </View>
          <View style={styles.block}>
            <FieldLabel required>Currency</FieldLabel>
            <FieldHint>
              Supported currencies: USD, EUR, GBP, CAD, AUD, INR, NGN, AED.
            </FieldHint>
            <OptionList
              options={SALARY_CURRENCIES}
              value={form.salaryCurrency ? [form.salaryCurrency] : []}
              onChange={(next) =>
                patch({ salaryCurrency: next[0] ?? "USD" })
              }
            />
          </View>
          <View style={styles.block}>
            <FieldLabel required>Period</FieldLabel>
            <OptionList
              options={PERIOD_OPTIONS}
              value={[form.salaryPeriod]}
              labels={PERIOD_LABELS}
              onChange={(next) =>
                patch({
                  salaryPeriod: (next[0] as "year" | "month") || "year",
                })
              }
            />
          </View>
        </>
      );
    case 11:
      return (
        <>
          <View style={styles.cvCard}>
            <Text style={styles.cvTitle}>
              Upload your CV (PDF, DOC or DOCX, up to 10MB)
            </Text>
            {form.resumeUrl ? (
              <View style={styles.cvRow}>
                <Text style={styles.cvName} numberOfLines={1}>
                  {form.resumeName || "CV on file"}
                </Text>
                <Pressable
                  onPress={onUploadCv}
                  disabled={uploadingCv}
                  accessibilityRole="button"
                  accessibilityLabel="Replace CV"
                  hitSlop={8}
                >
                  <Text style={styles.cvReplace}>
                    {uploadingCv ? "Uploading" : "Replace"}
                  </Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={onUploadCv}
                disabled={uploadingCv}
                style={styles.cvUploadBtn}
                accessibilityRole="button"
                accessibilityLabel="Upload CV"
              >
                <Text style={styles.cvUploadText}>
                  {uploadingCv ? "Uploading" : "Upload CV"}
                </Text>
              </Pressable>
            )}
          </View>
          <TextField
            label="Career summary"
            value={form.careerSummary}
            onChangeText={(careerSummary) => patch({ careerSummary })}
            placeholder="A few lines about your experience and what you want next"
            multiline
          />
        </>
      );
    case 12:
      return (
        <MoreAboutEditor form={form} patch={patch} />
      );
    case 13:
      return (
        <>
          <SwitchRow
            label="Let subscribed employers find my profile"
            value={form.employerDiscovery}
            onValueChange={(employerDiscovery) =>
              patch({
                employerDiscovery,
                employerMessaging: employerDiscovery
                  ? form.employerMessaging
                  : false,
              })
            }
          />
          <SwitchRow
            label="Allow these employers to message me"
            value={form.employerMessaging && form.employerDiscovery}
            disabled={!form.employerDiscovery}
            onValueChange={(employerMessaging) =>
              patch({ employerMessaging })
            }
          />
          <SwitchRow
            label="Let subscribed agencies find my profile"
            value={form.agencyDiscovery}
            onValueChange={(agencyDiscovery) =>
              patch({
                agencyDiscovery,
                agencyMessaging: agencyDiscovery
                  ? form.agencyMessaging
                  : false,
              })
            }
          />
          <SwitchRow
            label="Allow these agencies to message me"
            value={form.agencyMessaging && form.agencyDiscovery}
            disabled={!form.agencyDiscovery}
            onValueChange={(agencyMessaging) => patch({ agencyMessaging })}
          />
          <Text style={styles.sectionLabel}>Privacy</Text>
          <SwitchRow
            label="Hide phone number"
            value={form.hidePhone}
            onValueChange={(hidePhone) => patch({ hidePhone })}
          />
          <SwitchRow
            label="Hide email address"
            value={form.hideEmail}
            onValueChange={(hideEmail) => patch({ hideEmail })}
          />
          <SwitchRow
            label="Hide CV"
            value={form.hideResume}
            onValueChange={(hideResume) => patch({ hideResume })}
          />
          <SwitchRow
            label="Pause employer search visibility"
            value={form.pauseTalentPool}
            onValueChange={(pauseTalentPool) => patch({ pauseTalentPool })}
          />
          <FieldHint>
            Switch discovery off to stop new contact from that group. You can
            still apply and read earlier messages.
          </FieldHint>
        </>
      );
    default:
      return null;
  }
}

function WorkAuthEditor({
  rows,
  onChange,
}: {
  rows: WorkAuthorization[];
  onChange: (rows: WorkAuthorization[]) => void;
}) {
  return (
    <View style={styles.block}>
      <FieldLabel>Work permissions</FieldLabel>
      {rows.map((row, index) => (
        <View key={`wa-${index}`} style={styles.record}>
          <View style={styles.recordHeader}>
            <Text style={styles.recordTitle}>Work permission {index + 1}</Text>
            <Pressable
              onPress={() => onChange(rows.filter((_, i) => i !== index))}
              accessibilityRole="button"
              accessibilityLabel={`Remove work permission ${index + 1}`}
            >
              <Text style={styles.link}>Remove</Text>
            </Pressable>
          </View>
          <CountryPicker
            label="Country"
            value={row.country}
            onChange={(country) =>
              onChange(
                rows.map((item, i) =>
                  i === index ? { ...item, country } : item,
                ),
              )
            }
            guideFirst
          />
          <TextField
            label="Permission type"
            hint="For example, citizenship or a work permit"
            value={row.authorizationType || ""}
            onChangeText={(authorizationType) =>
              onChange(
                rows.map((item, i) =>
                  i === index ? { ...item, authorizationType } : item,
                ),
              )
            }
          />
          <FieldLabel>Status</FieldLabel>
          <OptionList
            options={WORK_AUTH_STATUS_VALUES}
            value={[row.status]}
            labels={WORK_AUTH_STATUS_LABELS}
            onChange={(next) =>
              onChange(
                rows.map((item, i) =>
                  i === index
                    ? {
                        ...item,
                        status: (next[0] as WorkAuthorization["status"]) ||
                          "unknown",
                      }
                    : item,
                ),
              )
            }
          />
          <TextField
            label="Expiry date (optional)"
            hint="YYYY-MM-DD"
            value={row.expiresAt || ""}
            onChangeText={(expiresAt) =>
              onChange(
                rows.map((item, i) =>
                  i === index ? { ...item, expiresAt } : item,
                ),
              )
            }
            autoCapitalize="none"
          />
        </View>
      ))}
      <AddBlockButton
        label="Add work permission"
        onPress={() =>
          onChange([
            ...rows,
            { country: "", authorizationType: "", status: "unknown" },
          ])
        }
      />
      <FieldHint>
        These are the details you give. You can update them any time.
      </FieldHint>
    </View>
  );
}

function MoreAboutEditor({
  form,
  patch,
}: {
  form: OnboardingFormState;
  patch: (partial: Partial<OnboardingFormState>) => void;
}) {
  const updateWork = (workHistory: WorkEntry[]) => patch({ workHistory });
  const updateEdu = (educationHistory: EducationEntry[]) =>
    patch({ educationHistory });
  const updateQual = (qualifications: Qualification[]) =>
    patch({ qualifications });
  const updateReg = (professionalRegistrations: ProfessionalRegistration[]) =>
    patch({ professionalRegistrations });

  return (
    <>
      <FieldLabel>Work experience</FieldLabel>
      {form.workHistory.map((row, index) => (
        <View key={`wh-${index}`} style={styles.record}>
          <View style={styles.recordHeader}>
            <Text style={styles.recordTitle}>Work experience {index + 1}</Text>
            <Pressable
              onPress={() =>
                updateWork(form.workHistory.filter((_, i) => i !== index))
              }
              accessibilityRole="button"
              accessibilityLabel={`Remove work experience ${index + 1}`}
            >
              <Text style={styles.link}>Remove</Text>
            </Pressable>
          </View>
          <TextField
            label="Job title"
            value={row.title}
            onChangeText={(title) =>
              updateWork(
                form.workHistory.map((item, i) =>
                  i === index ? { ...item, title } : item,
                ),
              )
            }
          />
          <TextField
            label="Company"
            value={row.company}
            onChangeText={(company) =>
              updateWork(
                form.workHistory.map((item, i) =>
                  i === index ? { ...item, company } : item,
                ),
              )
            }
          />
          <TextField
            label="From"
            value={row.startDate}
            onChangeText={(startDate) =>
              updateWork(
                form.workHistory.map((item, i) =>
                  i === index ? { ...item, startDate } : item,
                ),
              )
            }
            placeholder="YYYY-MM"
            autoCapitalize="none"
          />
          {!row.isCurrent ? (
            <TextField
              label="To"
              value={row.endDate}
              onChangeText={(endDate) =>
                updateWork(
                  form.workHistory.map((item, i) =>
                    i === index ? { ...item, endDate } : item,
                  ),
                )
              }
              placeholder="YYYY-MM"
              autoCapitalize="none"
            />
          ) : null}
          <SwitchRow
            label="I work here now"
            value={row.isCurrent}
            onValueChange={(isCurrent) =>
              updateWork(
                form.workHistory.map((item, i) =>
                  i === index
                    ? { ...item, isCurrent, endDate: isCurrent ? "" : item.endDate }
                    : item,
                ),
              )
            }
          />
        </View>
      ))}
      <AddBlockButton
        label="Add work experience"
        onPress={() =>
          updateWork([
            ...form.workHistory,
            {
              title: "",
              company: "",
              startDate: "",
              endDate: "",
              isCurrent: false,
            },
          ])
        }
      />

      <FieldLabel>Education</FieldLabel>
      {form.educationHistory.map((row, index) => (
        <View key={`ed-${index}`} style={styles.record}>
          <View style={styles.recordHeader}>
            <Text style={styles.recordTitle}>Education {index + 1}</Text>
            <Pressable
              onPress={() =>
                updateEdu(form.educationHistory.filter((_, i) => i !== index))
              }
              accessibilityRole="button"
              accessibilityLabel={`Remove education ${index + 1}`}
            >
              <Text style={styles.link}>Remove</Text>
            </Pressable>
          </View>
          <TextField
            label="School or university"
            value={row.school}
            onChangeText={(school) =>
              updateEdu(
                form.educationHistory.map((item, i) =>
                  i === index ? { ...item, school } : item,
                ),
              )
            }
          />
          <TextField
            label="Course"
            value={row.degree}
            onChangeText={(degree) =>
              updateEdu(
                form.educationHistory.map((item, i) =>
                  i === index ? { ...item, degree } : item,
                ),
              )
            }
          />
          <TextField
            label="Year"
            value={row.year}
            onChangeText={(year) =>
              updateEdu(
                form.educationHistory.map((item, i) =>
                  i === index ? { ...item, year } : item,
                ),
              )
            }
            keyboardType="number-pad"
          />
        </View>
      ))}
      <AddBlockButton
        label="Add education"
        onPress={() =>
          updateEdu([
            ...form.educationHistory,
            { degree: "", school: "", year: "" },
          ])
        }
      />

      <FieldLabel>Qualifications (optional)</FieldLabel>
      {form.qualifications.map((row, index) => (
        <View key={`q-${index}`} style={styles.record}>
          <View style={styles.recordHeader}>
            <Text style={styles.recordTitle}>Qualification {index + 1}</Text>
            <Pressable
              onPress={() =>
                updateQual(form.qualifications.filter((_, i) => i !== index))
              }
              accessibilityRole="button"
              accessibilityLabel={`Remove qualification ${index + 1}`}
            >
              <Text style={styles.link}>Remove</Text>
            </Pressable>
          </View>
          <TextField
            label="Qualification name"
            required
            value={row.name}
            onChangeText={(name) =>
              updateQual(
                form.qualifications.map((item, i) =>
                  i === index ? { ...item, name } : item,
                ),
              )
            }
          />
          <TextField
            label="Awarding organisation (optional)"
            value={row.issuer || ""}
            onChangeText={(issuer) =>
              updateQual(
                form.qualifications.map((item, i) =>
                  i === index ? { ...item, issuer } : item,
                ),
              )
            }
          />
          <TextField
            label="Level (optional)"
            value={row.level || ""}
            onChangeText={(level) =>
              updateQual(
                form.qualifications.map((item, i) =>
                  i === index ? { ...item, level } : item,
                ),
              )
            }
          />
        </View>
      ))}
      <AddBlockButton
        label="Add qualification"
        onPress={() => updateQual([...form.qualifications, { name: "" }])}
      />

      <FieldLabel>Professional registrations (optional)</FieldLabel>
      {form.professionalRegistrations.map((row, index) => (
        <View key={`pr-${index}`} style={styles.record}>
          <View style={styles.recordHeader}>
            <Text style={styles.recordTitle}>
              Professional registration {index + 1}
            </Text>
            <Pressable
              onPress={() =>
                updateReg(
                  form.professionalRegistrations.filter((_, i) => i !== index),
                )
              }
              accessibilityRole="button"
              accessibilityLabel={`Remove professional registration ${index + 1}`}
            >
              <Text style={styles.link}>Remove</Text>
            </Pressable>
          </View>
          <CountryPicker
            label="Country"
            value={row.country}
            onChange={(country) =>
              updateReg(
                form.professionalRegistrations.map((item, i) =>
                  i === index ? { ...item, country } : item,
                ),
              )
            }
            guideFirst
          />
          <TextField
            label="Registration type"
            required
            value={row.registrationType}
            onChangeText={(registrationType) =>
              updateReg(
                form.professionalRegistrations.map((item, i) =>
                  i === index ? { ...item, registrationType } : item,
                ),
              )
            }
          />
          <TextField
            label="Registration body (optional)"
            value={row.authority || ""}
            onChangeText={(authority) =>
              updateReg(
                form.professionalRegistrations.map((item, i) =>
                  i === index ? { ...item, authority } : item,
                ),
              )
            }
          />
          <FieldLabel>Status</FieldLabel>
          <OptionList
            options={REG_STATUS_VALUES}
            value={[row.status || "unknown"]}
            labels={REG_STATUS_LABELS}
            onChange={(next) =>
              updateReg(
                form.professionalRegistrations.map((item, i) =>
                  i === index
                    ? {
                        ...item,
                        status:
                          (next[0] as ProfessionalRegistration["status"]) ||
                          "unknown",
                      }
                    : item,
                ),
              )
            }
          />
        </View>
      ))}
      <AddBlockButton
        label="Add professional registration"
        onPress={() =>
          updateReg([
            ...form.professionalRegistrations,
            {
              country: "",
              registrationType: "",
              status: "unknown",
            },
          ])
        }
      />

      <TextField
        label="Phone"
        value={form.phoneNumber}
        onChangeText={(phoneNumber) => patch({ phoneNumber })}
        keyboardType="phone-pad"
      />
      <TextField
        label="LinkedIn"
        value={form.linkedin}
        onChangeText={(linkedin) => patch({ linkedin })}
        autoCapitalize="none"
        keyboardType="url"
      />
      <TextField
        label="Portfolio website"
        value={form.portfolio}
        onChangeText={(portfolio) => patch({ portfolio })}
        autoCapitalize="none"
        keyboardType="url"
      />
    </>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: colors.white,
    gap: 16,
  },
  centerText: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text2,
    textAlign: "center",
  },
  centerBtn: {
    minHeight: 44,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  centerBtnText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    color: colors.navy,
    textDecorationLine: "underline",
  },
  block: { gap: 8 },
  row: { flexDirection: "row", gap: 12 },
  half: { flex: 1 },
  sectionLabel: {
    marginTop: 8,
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
    color: colors.navy,
  },
  record: {
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
  },
  recordHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  recordTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    color: colors.navy,
  },
  link: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    color: colors.navy,
    textDecorationLine: "underline",
  },
  cvCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    gap: 12,
  },
  cvTitle: {
    fontFamily: fontFamily.medium,
    fontSize: 15,
    lineHeight: 21,
    color: colors.navy,
  },
  cvRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 44,
  },
  cvName: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.text2,
  },
  cvReplace: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    color: colors.navy,
    textDecorationLine: "underline",
  },
  cvUploadBtn: {
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: colors.panel,
    alignItems: "center",
    justifyContent: "center",
  },
  cvUploadText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    color: colors.navy,
  },
});
