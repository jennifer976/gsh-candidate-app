import { CountryPicker } from "@/components/CountryPicker";
import { GshPressable } from "@/components/GshPressable";
import {
  createRelocationHelpRequest,
  fetchMyRelocationHelpRequests,
} from "@/lib/api-client";
import {
  clearIdempotencyKey,
  getOrCreateIdempotencyKey,
} from "@/lib/idempotency";
import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { useRequestLabels } from "@/lib/i18n/useRequestLabels";
import {
  RELOCATION_NEEDS,
  RELOCATION_SERVICE_LABELS,
} from "@/lib/relocationServices";
import { colors, fontFamily, navHeader, radii } from "@/lib/theme";
import type {
  RelocationHelpInput,
  RelocationNeed,
  RelocationStage,
  RelocationTiming,
} from "@/types/phase6";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const STAGES: RelocationStage[] = [
  "planning",
  "moving_without_job",
  "application",
  "interview",
  "offer",
  "hired",
  "relocating",
];

const TIMINGS: RelocationTiming[] = [
  "within_30_days",
  "within_90_days",
  "within_6_months",
  "later",
  "unknown",
];

type Draft = Omit<
  RelocationHelpInput,
  "contactConsent" | "providerSharingConsent"
> & {
  contactConsent: boolean;
  providerSharingConsent: boolean;
};

const INITIAL_DRAFT: Draft = {
  destinationCountry: "",
  originCountry: "",
  needCategories: [],
  journeyStage: "planning",
  timing: "unknown",
  notes: "",
  contactConsent: false,
  providerSharingConsent: false,
};

function ChoiceRow({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <GshPressable
      style={[styles.choice, selected && styles.choiceSelected]}
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      pressScale={0.98}
    >
      <Ionicons
        name={selected ? "checkmark-circle" : "ellipse-outline"}
        size={21}
        color={selected ? colors.navy : colors.textMuted}
      />
      <Text style={styles.choiceText}>{label}</Text>
    </GshPressable>
  );
}

export default function RelocationHelpRequestsScreen() {
  const ac = useAccountCopy();
  const { label, country, locale } = useRequestLabels();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Draft>(INITIAL_DRAFT);
  const [showForm, setShowForm] = useState(false);

  const requestsQuery = useQuery({
    queryKey: ["phase6", "relocation-help", "mine"],
    queryFn: fetchMyRelocationHelpRequests,
  });

  const createMutation = useMutation({
    mutationFn: async (input: RelocationHelpInput) => {
      const scope = "relocation-help:create";
      const requestKey = await getOrCreateIdempotencyKey(scope);
      const response = await createRelocationHelpRequest(input, requestKey);
      await clearIdempotencyKey(scope);
      return response;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["phase6", "relocation-help"],
      });
      setDraft(INITIAL_DRAFT);
      setShowForm(false);
      Alert.alert(ac("Request submitted"), ac("We will update this request as specialists are matched."));
    },
    onError: () =>
      Alert.alert(
        ac("Could not submit your request"),
        ac("Check your request list before trying again."),
      ),
  });

  const toggleNeed = (need: RelocationNeed) => {
    setDraft((current) => ({
      ...current,
      needCategories: current.needCategories.includes(need)
        ? current.needCategories.filter((item) => item !== need)
        : [...current.needCategories, need],
    }));
  };

  const submit = () => {
    if (!/^[A-Z]{2}$/.test(draft.destinationCountry)) {
      Alert.alert(ac("Choose a destination country"));
      return;
    }
    if (draft.originCountry && !/^[A-Z]{2}$/.test(draft.originCountry)) {
      Alert.alert(ac("Choose a valid origin country"));
      return;
    }
    if (!draft.needCategories.length) {
      Alert.alert(ac("Select at least one kind of help."));
      return;
    }
    if (!draft.contactConsent || !draft.providerSharingConsent) {
      Alert.alert(ac("Agree to both permissions before submitting."));
      return;
    }
    createMutation.mutate({
      destinationCountry: draft.destinationCountry,
      originCountry: draft.originCountry || undefined,
      needCategories: draft.needCategories,
      journeyStage: draft.journeyStage,
      timing: draft.timing,
      notes: draft.notes?.trim() || undefined,
      contactConsent: true,
      providerSharingConsent: true,
    });
  };

  const requests = requestsQuery.data?.data ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <Stack.Screen options={{ title: ac("Specialist requests"), ...navHeader }} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="navigate-outline" size={22} color={colors.navy} />
          </View>
          <Text style={styles.title}>{ac("Plan your move with specialist help")}</Text>
          <Text style={styles.copy}>
            {ac(
              "Tell us what help you need. Your contact details are shared only after a matched specialist accepts.",
            )}
          </Text>
          <GshPressable
            style={[styles.primaryButton, styles.heroButton]}
            onPress={() => setShowForm((value) => !value)}
          >
            <Text style={[styles.primaryButtonText, styles.heroButtonText]}>
              {showForm ? ac("Close form") : ac("Create specialist request")}
            </Text>
          </GshPressable>
        </View>

        {showForm ? (
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>{ac("Tell us what you need")}</Text>
            <CountryPicker
              label={ac("Destination country *")}
              value={draft.destinationCountry}
              onChange={(destinationCountry) =>
                setDraft((current) => ({ ...current, destinationCountry }))
              }
            />
            <CountryPicker
              label={ac("Origin country (optional)")}
              value={draft.originCountry ?? ""}
              onChange={(originCountry) =>
                setDraft((current) => ({ ...current, originCountry }))
              }
            />

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>{ac("Help needed *")}</Text>
              <View style={styles.choiceGrid}>
                {RELOCATION_NEEDS.map((need) => (
                  <ChoiceRow
                    key={need}
                    label={ac(RELOCATION_SERVICE_LABELS[need] || need)}
                    selected={draft.needCategories.includes(need)}
                    onPress={() => toggleNeed(need)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>{ac("Your stage")}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipRail}
              >
                {STAGES.map((stage) => (
                  <GshPressable
                    key={stage}
                    style={[
                      styles.chip,
                      draft.journeyStage === stage && styles.chipSelected,
                    ]}
                    onPress={() =>
                      setDraft((current) => ({
                        ...current,
                        journeyStage: stage,
                      }))
                    }
                  >
                    <Text style={styles.chipText}>{label(stage)}</Text>
                  </GshPressable>
                ))}
              </ScrollView>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>{ac("When do you need help? *")}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipRail}
              >
                {TIMINGS.map((timing) => (
                  <GshPressable
                    key={timing}
                    style={[
                      styles.chip,
                      draft.timing === timing && styles.chipSelected,
                    ]}
                    onPress={() =>
                      setDraft((current) => ({ ...current, timing }))
                    }
                  >
                    <Text style={styles.chipText}>{label(timing)}</Text>
                  </GshPressable>
                ))}
              </ScrollView>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>{ac("Request notes (optional)")}</Text>
              <Text style={styles.fieldHint}>
                {ac("Do not include passport, bank, health, or contact details.")}
              </Text>
              <TextInput
                value={draft.notes}
                onChangeText={(notes) =>
                  setDraft((current) => ({
                    ...current,
                    notes: notes.slice(0, 1000),
                  }))
                }
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                style={styles.textArea}
              />
            </View>

            <View style={styles.consentCard}>
              <Text style={styles.fieldLabel}>{ac("Consent")}</Text>
              <ChoiceRow
                label={ac("Global Sponsor Hub may contact me about this request.")}
                selected={draft.contactConsent}
                onPress={() =>
                  setDraft((current) => ({
                    ...current,
                    contactConsent: !current.contactConsent,
                  }))
                }
              />
              <ChoiceRow
                label={ac(
                  "Share my request with matched specialists and my contact details after they accept.",
                )}
                selected={draft.providerSharingConsent}
                onPress={() =>
                  setDraft((current) => ({
                    ...current,
                    providerSharingConsent: !current.providerSharingConsent,
                  }))
                }
              />
            </View>

            <GshPressable
              style={[
                styles.primaryButton,
                createMutation.isPending && styles.disabled,
              ]}
              onPress={submit}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.primaryButtonText}>{ac("Submit request")}</Text>
              )}
            </GshPressable>
          </View>
        ) : null}

        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>{ac("Your requests")}</Text>
          <Text style={styles.sectionMeta}>{requests.length}</Text>
        </View>

        {requestsQuery.isLoading ? (
          <ActivityIndicator color={colors.cyan} />
        ) : requestsQuery.isError ? (
          <GshPressable style={styles.retry} onPress={() => void requestsQuery.refetch()}>
            <Text style={styles.retryText}>{ac("Try loading requests again")}</Text>
          </GshPressable>
        ) : requests.length ? (
          requests.map((request) => (
            <GshPressable
              key={request._id}
              style={styles.requestCard}
              onPress={() => router.push(`/relocation-help/${request._id}`)}
            >
              <View style={styles.requestCopy}>
                <Text style={styles.requestTitle}>
                  {country(request.destinationCountry)}
                </Text>
                <Text style={styles.requestMeta}>
                  {request.needCategories.map((need) => label(need)).join(" · ")}
                </Text>
                <Text style={styles.requestDate}>
                  {new Date(request.submittedAt).toLocaleDateString(locale)}
                </Text>
              </View>
              <View style={styles.statusPill}>
                <Text style={styles.statusText}>{label(request.status)}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </GshPressable>
          ))
        ) : (
          <View style={styles.empty}>
            <Ionicons name="navigate-outline" size={34} color={colors.navy} />
            <Text style={styles.emptyTitle}>{ac("No specialist requests yet")}</Text>
            <Text style={styles.emptyCopy}>
              {ac("Create a request when you need visa, housing, tax, or moving help.")}
            </Text>
          </View>
        )}

        <View style={styles.toolsRow}>
          <Pressable onPress={() => router.push("/countries")}>
            <Text style={styles.toolLink}>{ac("Country guides")}</Text>
          </Pressable>
          <Pressable onPress={() => router.push("/relocation-worksheets")}>
            <Text style={styles.toolLink}>{ac("Move worksheets")}</Text>
          </Pressable>
          <Pressable onPress={() => router.push("/partners")}>
            <Text style={styles.toolLink}>{ac("Specialist directory")}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.pale },
  content: { padding: 16, paddingBottom: 48, gap: 14 },
  hero: {
    borderRadius: radii.xl,
    backgroundColor: colors.navy,
    padding: 20,
    gap: 10,
  },
  heroIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.cyan,
  },
  title: {
    fontFamily: fontFamily.headingStrong,
    fontSize: 24,
    lineHeight: 29,
    color: colors.white,
  },
  copy: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 21,
    color: "rgba(255,255,255,0.78)",
  },
  primaryButton: {
    minHeight: 50,
    marginTop: 4,
    paddingHorizontal: 18,
    borderRadius: radii.pill,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  heroButton: { backgroundColor: colors.cyan },
  heroButtonText: { color: colors.navy },
  primaryButtonText: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    color: colors.white,
  },
  formCard: {
    borderRadius: radii.xl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 18,
  },
  sectionTitle: {
    fontFamily: fontFamily.heading,
    fontSize: 20,
    color: colors.navy,
  },
  fieldGroup: { gap: 8 },
  fieldLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    color: colors.navy,
  },
  fieldHint: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textMuted,
  },
  choiceGrid: { gap: 8 },
  choice: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  choiceSelected: {
    borderColor: colors.cyan,
    backgroundColor: colors.brandSoft,
  },
  choiceText: {
    flex: 1,
    fontFamily: fontFamily.medium,
    fontSize: 13,
    lineHeight: 18,
    color: colors.navy,
  },
  chipRail: { gap: 8, paddingVertical: 2 },
  chip: {
    minHeight: 44,
    maxWidth: 190,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  chipSelected: {
    borderColor: colors.cyan,
    backgroundColor: colors.brandSoft,
  },
  chipText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
    color: colors.navy,
  },
  textArea: {
    minHeight: 112,
    padding: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    fontFamily: fontFamily.regular,
    fontSize: 15,
    color: colors.navy,
  },
  consentCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.pale,
    padding: 12,
    gap: 9,
  },
  disabled: { opacity: 0.65 },
  listHeader: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionMeta: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: colors.textMuted,
  },
  requestCard: {
    minHeight: 86,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  requestCopy: { flex: 1, minWidth: 0 },
  requestTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    color: colors.navy,
  },
  requestMeta: {
    marginTop: 4,
    fontFamily: fontFamily.regular,
    fontSize: 12,
    color: colors.textSecondary,
  },
  requestDate: {
    marginTop: 4,
    fontFamily: fontFamily.regular,
    fontSize: 11,
    color: colors.textMuted,
  },
  statusPill: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: radii.pill,
    backgroundColor: colors.brandSoft,
  },
  statusText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 11,
    color: colors.navy,
  },
  retry: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  retryText: {
    fontFamily: fontFamily.semiBold,
    color: colors.navy,
  },
  empty: {
    alignItems: "center",
    padding: 24,
    gap: 8,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
  },
  emptyTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    color: colors.navy,
  },
  emptyCopy: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    color: colors.textMuted,
  },
  toolsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 18,
    paddingVertical: 10,
  },
  toolLink: {
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
    color: colors.navy,
    textDecorationLine: "underline",
  },
});
