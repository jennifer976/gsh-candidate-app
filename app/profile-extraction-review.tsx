import { withSignIn } from "@/components/SignInGate";
import {useAppLanguage, toIntlLocale} from "@/lib/i18n";
import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  createCandidateResumeExtractionDraft,
  deleteCandidateExtractionDraft,
  fetchCandidateExtractionDraft,
  fetchCandidateExtractionStatus,
  fetchOwnProfile,
  recordCandidateExtractionJourneyEvent,
  reviewCandidateExtractionDraft,
} from "@/lib/api-client";

import { colors, fontFamily, navHeader, radii } from "@/lib/theme";
import type {
  CandidateExtractionDraft,
  CandidateExtractionField,
} from "@/types/candidate-extraction";

type Decision = "accepted" | "rejected";

const FIELD_LABELS: Record<CandidateExtractionField, string> = {
  desiredOccupations: "Desired occupations",
  skills: "Skills",
  yearsOfExperience: "Years of experience",
  qualifications: "Qualifications",
  professionalRegistrations: "Professional registrations",
  workAuthorizations: "Work authorisations",
  currentResidenceCountry: "Current residence country",
  targetCountries: "Target countries",
  employmentOptions: "Employment options",
  expectedMinSalary: "Expected minimum salary",
  expectedMaxSalary: "Expected maximum salary",
  expectedSalaryCurrency: "Expected salary currency",
  expectedSalaryPeriod: "Expected salary period",
  workHistory: "Work history",
  currentJobTitle: "Current job title",
  currentCompany: "Current company",
};

function displayValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "—";
  }
}

function ProfileExtractionReviewScreen() {
  const ac = useAccountCopy();

  const locale = toIntlLocale(useAppLanguage((s) => s.locale));
  const [actionError, setActionError] = useState<string | null>(null);
  const router = useRouter();
  const qc = useQueryClient();
  const params = useLocalSearchParams<{ draftId?: string | string[] }>();
  const initialDraftId = Array.isArray(params.draftId)
    ? params.draftId[0]
    : params.draftId;
  const [draftId, setDraftId] = useState(initialDraftId || "");
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const openedEventSent = useRef(false);

  const capability = useQuery({
    queryKey: ["candidate-extraction", "status"],
    queryFn: fetchCandidateExtractionStatus,
    retry: false,
  });
  const profile = useQuery({
    queryKey: ["profile", "me"],
    queryFn: fetchOwnProfile,
  });
  const draftQuery = useQuery({
    queryKey: ["candidate-extraction", "draft", draftId],
    queryFn: () => fetchCandidateExtractionDraft(draftId),
    enabled: Boolean(draftId),
    retry: false,
  });
  const draft = draftQuery.data;

  useEffect(() => {
    if (openedEventSent.current) return;
    openedEventSent.current = true;
    void recordCandidateExtractionJourneyEvent(
      "candidate_extraction_review_opened",
    );
  }, []);

  useEffect(() => {
    if (!draft) return;
    setDecisions((current) => {
      const next = { ...current };
      for (const id of draft.acceptedSuggestionIds) next[id] = "accepted";
      for (const id of draft.rejectedSuggestionIds) next[id] = "rejected";
      return next;
    });
  }, [draft]);

  const resumeUrl =
    typeof profile.data?.resume === "string" ? profile.data.resume : "";
  const hasPdfResume = /\.pdf(?:$|[?#])/i.test(resumeUrl);
  const decidedCount =
    draft?.suggestions.filter((item) => decisions[item.id]).length ?? 0;
  const everySuggestionDecided = Boolean(
    draft && decidedCount === draft.suggestions.length,
  );

  const start = useMutation({
    mutationFn: createCandidateResumeExtractionDraft,
    onSuccess: (created) => {
      setDraftId(created.id);
      setDecisions({});
      qc.setQueryData(["candidate-extraction", "draft", created.id], created);
      router.setParams({ draftId: created.id });
    },
  });

  const review = useMutation({
    onMutate: () => setActionError(null),
    mutationFn: async () => {
      if (!draft || !everySuggestionDecided) {
        throw new Error("Accept or reject every suggestion before submitting.");
      }
      const acceptedSuggestionIds = draft.suggestions
        .filter((item) => decisions[item.id] === "accepted")
        .map((item) => item.id);
      const rejectedSuggestionIds = draft.suggestions
        .filter((item) => decisions[item.id] === "rejected")
        .map((item) => item.id);
      return reviewCandidateExtractionDraft(
        draft.id,
        acceptedSuggestionIds,
        rejectedSuggestionIds,
      );
    },
    onSuccess: async (result) => {
      qc.setQueryData(
        ["candidate-extraction", "draft", result.draft.id],
        result.draft,
      );
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["profile", "me"] }),
        qc.invalidateQueries({
          queryKey: ["analytics", "candidate-dashboard"],
        }),
        qc.invalidateQueries({ queryKey: ["candidate-mobility-profile"] }),
      ]);
      await profile.refetch();
      void recordCandidateExtractionJourneyEvent(
        "candidate_extraction_review_submitted",
      );
    },
    onError: (error: unknown) => {
      setActionError(
        ac("Could not save your review. Refresh before trying again."),
      );
    },
  });

  const discard = useMutation({
    onMutate: () => setActionError(null),
    mutationFn: () => deleteCandidateExtractionDraft(draftId),
    onSuccess: () => {
      void qc.removeQueries({
        queryKey: ["candidate-extraction", "draft", draftId],
      });
      setDraftId("");
      setDecisions({});
      router.setParams({ draftId: undefined });
      void recordCandidateExtractionJourneyEvent(
        "candidate_extraction_draft_discarded",
      );
    },
    onError: (error: unknown) => {
      setActionError(ac("Could not delete the draft. Try again."));
    },
  });

  const confirmDiscard = () => {
    const title = ac("Delete this draft?"),
      message = ac(
        "This deletes the temporary suggestions. Changes already saved to your profile will remain.",
      );
    if (Platform.OS === "web") {
      if (globalThis.confirm(`${title}\n\n${message}`)) discard.mutate();
      return;
    }
    Alert.alert(title, message, [
      { text: ac("Cancel"), style: "cancel" },
      {
        text: ac("Delete draft"),
        style: "destructive",
        onPress: () => discard.mutate(),
      },
    ]);
  };

  const renderDraft = (current: CandidateExtractionDraft) => {
    const reviewed = current.status === "reviewed";
    return (
      <>
        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>
            {reviewed ? ac("Review submitted") : ac("Review every suggestion")}
          </Text>

          <Text style={styles.copy}>
            {ac(
              "Suggestions may be wrong. Check each one against your CV. Nothing is saved to your profile until you approve it.",
            )}
          </Text>
          <Text style={styles.meta}>
            {ac("Draft expires on {date}.", {
              date: new Date(current.expiresAt).toLocaleString(locale),
            })}
          </Text>
        </View>

        {current.suggestions.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.title}>{ac("No suggestions found")}</Text>
            <Text style={styles.copy}>
              {ac("You can edit your profile yourself or try a clearer PDF.")}
            </Text>
          </View>
        ) : (
          current.suggestions.map((suggestion) => {
            const decision = decisions[suggestion.id];
            return (
              <View key={suggestion.id} style={styles.card}>
                <View style={styles.fieldHeader}>
                  <Text style={styles.fieldTitle}>
                    {ac(FIELD_LABELS[suggestion.field])}
                  </Text>
                  <Text style={styles.confidence}>
                    {ac("AI confidence: {percent}%", {
                      percent: Math.round(suggestion.confidence * 100),
                    })}
                  </Text>
                </View>
                <Text style={styles.value}>
                  {displayValue(suggestion.value)}
                </Text>
                <View style={styles.sourceBox}>
                  <Text style={styles.sourceLabel}>{ac("From your PDF")}</Text>
                  <Text style={styles.sourceSnippet}>
                    “{suggestion.sourceSnippet}”
                  </Text>
                </View>
                <View style={styles.decisionRow}>
                  <Pressable
                    style={[
                      styles.decision,
                      decision === "accepted" && styles.accepted,
                    ]}
                    onPress={() =>
                      setDecisions((value) => ({
                        ...value,
                        [suggestion.id]: "accepted",
                      }))
                    }
                    disabled={reviewed}
                    accessibilityRole="radio"
                    accessibilityState={{
                      checked: decision === "accepted",
                      disabled: reviewed,
                    }}
                  >
                    <Text
                      style={[
                        styles.decisionText,
                        decision === "accepted" && styles.selectedText,
                      ]}
                    >
                      {ac("Accept")}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.decision,
                      decision === "rejected" && styles.rejected,
                    ]}
                    onPress={() =>
                      setDecisions((value) => ({
                        ...value,
                        [suggestion.id]: "rejected",
                      }))
                    }
                    disabled={reviewed}
                    accessibilityRole="radio"
                    accessibilityState={{
                      checked: decision === "rejected",
                      disabled: reviewed,
                    }}
                  >
                    <Text
                      style={[
                        styles.decisionText,
                        decision === "rejected" && styles.rejectedText,
                      ]}
                    >
                      {ac("Reject")}
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          })
        )}

        {reviewed ? (
          <View style={styles.successCard}>
            <Text style={styles.noticeTitle}>{ac("Review submitted")}</Text>
            <Text style={styles.copy}>
              {ac(
                "Your approved changes have been saved. Review your profile to check them.",
              )}
            </Text>
            <Pressable
              style={styles.button}
              onPress={() => router.push("/mobility-profile")}
              accessibilityRole="button"
            >
              <Text style={styles.buttonText}>{ac("Mobility profile")}</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.submitCard}>
            <Text style={styles.copy}>
              {ac("{done} of {total} suggestions reviewed.", {
                done: decidedCount,
                total: current.suggestions.length,
              })}
            </Text>
            <Pressable
              style={[
                styles.button,
                (!everySuggestionDecided || review.isPending) &&
                  styles.disabled,
              ]}
              onPress={() => review.mutate()}
              disabled={!everySuggestionDecided || review.isPending}
              accessibilityRole="button"
            >
              {review.isPending ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.buttonText}>
                  {ac("Save approved changes")}
                </Text>
              )}
            </Pressable>
          </View>
        )}
        <Pressable
          style={styles.danger}
          onPress={confirmDiscard}
          disabled={discard.isPending}
          accessibilityRole="button"
        >
          <Text style={styles.dangerText}>
            {discard.isPending ? ac("Deleting…") : ac("Delete draft")}
          </Text>
        </Pressable>
      </>
    );
  };

  let content: React.ReactNode;
  if (
    capability.isLoading ||
    profile.isLoading ||
    (draftId && draftQuery.isLoading)
  ) {
    content = (
      <View style={styles.center}>
        <ActivityIndicator color={colors.brand} size="large" />
        <Text style={styles.copy}>{ac("Checking availability…")}</Text>
      </View>
    );
  } else if (capability.isError) {
    content = (
      <StateCard
        title={ac("CV suggestions unavailable")}
        copy={ac(
          "Extraction provider unavailable. This service is not available right now. No CV has been sent for analysis.",
        )}
        action={ac("Try again")}
        onPress={() => capability.refetch()}
      />
    );
  } else if (!capability.data?.available) {
    content = (
      <StateCard
        title={ac("CV suggestions unavailable")}
        copy={ac(
          "This service is not available right now. No CV has been sent for analysis.",
        )}
        action={ac("Try again")}
        onPress={() => capability.refetch()}
      />
    );
  } else if (start.isError) {
    const unavailable =
      start.error &&
      typeof start.error === "object" &&
      "status" in start.error &&
      (start.error as { status: unknown }).status === 503;
    content = (
      <StateCard
        title={
          unavailable
            ? ac("CV suggestions unavailable")
            : ac("Could not create suggestions. Try again.")
        }
        copy={ac("Could not create suggestions. Try again.")}
        action={ac("Try again")}
        onPress={() => start.reset()}
      />
    );
  } else if (draftId && draftQuery.isError) {
    content = (
      <StateCard
        title={ac("Draft expired or unavailable")}
        copy={ac("Start again using the PDF saved in your profile.")}
        action={ac("Start again")}
        onPress={() => {
          setDraftId("");
          router.setParams({ draftId: undefined });
        }}
      />
    );
  } else if (draft) {
    content = renderDraft(draft);
  } else {
    content = (
      <>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>{ac("Review CV suggestions")}</Text>
          <Text style={styles.title}>
            {ac("Create profile suggestions from your PDF")}
          </Text>
          <Text style={styles.copy}>
            {ac(
              "Use the PDF CV saved in your profile. AI will suggest changes for you to check before saving.",
            )}
          </Text>
          <Text style={styles.copy}>
            {ac(
              "Suggestions are self-attested only. This does not verify your qualifications or right to work. It does not decide immigration eligibility or change your sharing permissions.",
            )}
          </Text>
          <Text style={styles.copy}>
            {ac(
              "Suggestions may be wrong. Check each one against your CV. Nothing is saved to your profile until you approve it.",
            )}
          </Text>
          <Text style={styles.meta}>
            {ac(
              "Drafts are kept for {hours} hours. You can create up to {limit} per day.",
              {
                hours: capability.data.retentionHours,
                limit: capability.data.dailyLimit,
              },
            )}
          </Text>
        </View>
        {!hasPdfResume ? (
          <View style={styles.warningCard}>
            <Text style={styles.noticeTitle}>
              {ac("Upload a PDF CV first.")}
            </Text>
            <Text style={styles.copy}>
              {ac(
                "Upload it in your profile. Word files are not supported here.",
              )}
            </Text>
            <Pressable
              style={styles.outline}
              onPress={() => router.push("/(tabs)/profile")}
            >
              <Text style={styles.outlineText}>{ac("Profile")}</Text>
            </Pressable>
          </View>
        ) : null}
        <Pressable
          style={[
            styles.button,
            (!hasPdfResume || start.isPending) && styles.disabled,
          ]}
          onPress={() => start.mutate()}
          disabled={!hasPdfResume || start.isPending}
          accessibilityRole="button"
        >
          {start.isPending ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>{ac("Create suggestions")}</Text>
          )}
        </Pressable>
        {start.isPending ? (
          <Text style={styles.processing}>
            {ac("Processing your candidate-owned PDF. Keep this screen open.")}
          </Text>
        ) : null}
      </>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <Stack.Screen
        options={{ title: ac("Review CV suggestions"), ...navHeader }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {actionError ? (
          <Text accessibilityRole="alert" style={styles.dangerText}>
            {actionError}
          </Text>
        ) : null}
        {content}
      </ScrollView>
    </SafeAreaView>
  );
}

function StateCard({
  title,
  copy,
  action,
  onPress,
}: {
  title: string;
  copy: string;
  action: string;
  onPress: () => void;
}) {
  return (
    <View style={styles.center}>
      <View style={styles.warningCard}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.copy}>{copy}</Text>
      </View>
      <Pressable
        style={styles.button}
        onPress={onPress}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>{action}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceMuted },
  content: { flexGrow: 1, padding: 16, paddingBottom: 40, gap: 14 },
  center: {
    flex: 1,
    minHeight: 400,
    alignItems: "stretch",
    justifyContent: "center",
    gap: 16,
  },
  card: {
    padding: 20,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  noticeCard: {
    padding: 16,
    borderRadius: radii.lg,
    backgroundColor: "#ecfeff",
    borderWidth: 1,
    borderColor: "#67e8f9",
    gap: 8,
  },
  warningCard: {
    padding: 16,
    borderRadius: radii.lg,
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fde68a",
    gap: 10,
  },
  successCard: {
    padding: 16,
    borderRadius: radii.lg,
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#86efac",
    gap: 12,
  },
  submitCard: {
    padding: 16,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  eyebrow: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: colors.accent,
    letterSpacing: 0.7,
  },
  title: { fontSize: 21, fontFamily: fontFamily.heading, color: colors.navy },
  noticeTitle: {
    fontSize: 16,
    fontFamily: fontFamily.bold,
    color: colors.navy,
  },
  copy: {
    fontSize: 14,
    lineHeight: 21,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
  },
  meta: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: fontFamily.medium,
    color: colors.textMuted,
  },
  processing: {
    textAlign: "center",
    fontSize: 13,
    lineHeight: 19,
    fontFamily: fontFamily.medium,
    color: colors.textSecondary,
  },
  fieldHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  fieldTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: fontFamily.bold,
    color: colors.navy,
  },
  confidence: {
    fontSize: 12,
    fontFamily: fontFamily.semiBold,
    color: colors.brand,
  },
  value: {
    fontSize: 14,
    lineHeight: 21,
    fontFamily: fontFamily.medium,
    color: colors.textPrimary,
  },
  sourceBox: {
    padding: 12,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceMuted,
    gap: 5,
  },
  sourceLabel: {
    fontSize: 10,
    letterSpacing: 0.6,
    fontFamily: fontFamily.bold,
    color: colors.textMuted,
  },
  sourceSnippet: {
    fontSize: 13,
    lineHeight: 19,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
  },
  decisionRow: { flexDirection: "row", gap: 10 },
  decision: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
  },
  accepted: { backgroundColor: colors.brand, borderColor: colors.brand },
  rejected: { backgroundColor: "#fef2f2", borderColor: "#fca5a5" },
  decisionText: {
    fontSize: 14,
    fontFamily: fontFamily.bold,
    color: colors.textSecondary,
  },
  selectedText: { color: colors.white },
  rejectedText: { color: "#b91c1c" },
  button: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 99,
    backgroundColor: colors.brand,
  },
  buttonText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.bold,
  },
  outline: {
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.brand,
  },
  outlineText: {
    color: colors.brand,
    fontSize: 14,
    fontFamily: fontFamily.bold,
  },
  danger: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "#fef2f2",
  },
  dangerText: { color: "#b91c1c", fontSize: 14, fontFamily: fontFamily.bold },
  disabled: { opacity: 0.5 },
});

export default withSignIn(ProfileExtractionReviewScreen, {
  icon: "person-outline",
  title: "Build your candidate profile",
  body: "Sign in to add your skills, target countries and CV so employers can find you.",
});
