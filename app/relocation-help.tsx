import { CountryPicker } from "@/components/CountryPicker";
import { useRequestLabels } from "@/lib/i18n/useRequestLabels";
import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { RELOCATION_NEEDS } from "@/lib/relocationServices";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
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
import {
  createRelocationHelpRequest,
  fetchMyRelocationHelpRequests,
} from "@/lib/api-client";
import { canonicalCountryCode } from "@/lib/countries";
import type {
  RelocationNeed,
  RelocationStage,
  RelocationTiming,
} from "@/types/phase6";
import { colors, fontFamily, navHeader, radii } from "@/lib/theme";

const NEEDS: RelocationNeed[] = RELOCATION_NEEDS;
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

function Choices({
  options,
  selected,
  onPress,
  multiple = false,
}: {
  options: readonly string[];
  selected: string[];
  onPress: (value: string) => void;
  multiple?: boolean;
}) {
  const { label } = useRequestLabels();
  return (
    <View style={styles.chips}>
      {options.map((option) => {
        const on = selected.includes(option);
        return (
          <Pressable
            key={option}
            onPress={() => onPress(option)}
            style={[styles.chip, on && styles.chipOn]}
            accessibilityRole={multiple ? "checkbox" : "radio"}
            accessibilityState={{ checked: on }}
          >
            <Text style={[styles.chipText, on && styles.chipTextOn]}>
              {label(option)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function RelocationHelpScreen() {
  const ac = useAccountCopy();

  const { label, country, locale } = useRequestLabels();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const qc = useQueryClient();
  const attempts = useRef(new Map<string, string>());
  const query = useQuery({
    queryKey: ["phase6", "relocation-help"],
    queryFn: fetchMyRelocationHelpRequests,
  });
  const [destination, setDestination] = useState("");
  const [origin, setOrigin] = useState("");
  const [needs, setNeeds] = useState<RelocationNeed[]>([]);
  const [stage, setStage] = useState<RelocationStage>("planning");
  const [timing, setTiming] = useState<RelocationTiming>("unknown");
  const [notes, setNotes] = useState("");
  const [contactConsent, setContactConsent] = useState(false);
  const [providerConsent, setProviderConsent] = useState(false);

  const create = useMutation({
    mutationFn: () => {
      setError(null);
      const destinationCountry = canonicalCountryCode(destination);
      const originCountry = origin.trim()
        ? canonicalCountryCode(origin)
        : undefined;
      if (!destinationCountry || (origin.trim() && !originCountry))
        throw new Error("country");
      if (!needs.length) throw new Error("needs");
      if (!contactConsent || !providerConsent) throw new Error("consent");
      const body = {
        destinationCountry,
        ...(originCountry ? { originCountry } : {}),
        needCategories: needs,
        journeyStage: stage,
        timing,
        ...(notes.trim() ? { notes: notes.trim() } : {}),
        contactConsent: true as const,
        providerSharingConsent: true as const,
      };
      const serialized = JSON.stringify(body);
      const key =
        attempts.current.get(serialized) ??
        `move-${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
      attempts.current.set(serialized, key);
      return createRelocationHelpRequest(body, key).then((result) => {
        attempts.current.delete(serialized);
        return result;
      });
    },
    onSuccess: (response) => {
      void qc.invalidateQueries({ queryKey: ["phase6", "relocation-help"] });
      setNotes("");
      setContactConsent(false);
      setProviderConsent(false);
      router.push(`/relocation-help/${response.data._id}`);
    },
    onError: (error: unknown) =>
      setError(
        ac(
          error instanceof Error && error.message === "country"
            ? "Choose a destination country."
            : error instanceof Error && error.message === "needs"
              ? "Select at least one kind of help."
              : error instanceof Error && error.message === "consent"
                ? "Agree to both permissions before submitting."
                : "Could not submit your request. Try again.",
        ),
      ),
  });

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <Stack.Screen options={{ title: ac("Relocation help"), ...navHeader }} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.title}>{ac("Request specialist help")}</Text>
            <Text style={styles.copy}>
              {ac(
                "Tell us what you need. Specialists can review your request. Your contact details are shared only after a specialist accepts and pays, while your consent remains active.",
              )}
            </Text>
            <CountryPicker
              label={ac("Destination country *")}
              value={destination}
              onChange={setDestination}
            />
            <CountryPicker
              label={ac("Origin country (optional)")}
              value={origin}
              onChange={setOrigin}
            />
            <Text style={styles.label}>{ac("Help needed *")}</Text>
            <Choices
              options={NEEDS}
              selected={needs}
              multiple
              onPress={(item) =>
                setNeeds((current) =>
                  current.includes(item as RelocationNeed)
                    ? current.filter((x) => x !== item)
                    : [...current, item as RelocationNeed],
                )
              }
            />
            <Text style={styles.label}>{ac("Your stage *")}</Text>
            <Choices
              options={STAGES}
              selected={[stage]}
              onPress={(item) => setStage(item as RelocationStage)}
            />
            <Text style={styles.label}>{ac("When do you need help? *")}</Text>
            <Choices
              options={TIMINGS}
              selected={[timing]}
              onPress={(item) => setTiming(item as RelocationTiming)}
            />
            <Text style={styles.label}>{ac("Notes (optional)")}</Text>
            <TextInput
              accessibilityLabel={ac("Request notes")}
              style={[styles.input, styles.notes]}
              multiline
              textAlignVertical="top"
              value={notes}
              onChangeText={setNotes}
              maxLength={2000}
            />
            <View style={styles.consentRow}>
              <Text style={styles.consentText}>
                {ac(
                  "I agree that Global Sponsor Hub may contact me about this request.",
                )}
              </Text>
              <Switch
                accessibilityLabel={ac("Contact consent")}
                trackColor={{ false: colors.border, true: "#bceff2" }}
                thumbColor={contactConsent ? colors.accent : colors.white}
                value={contactConsent}
                onValueChange={setContactConsent}
              />
            </View>
            <View style={styles.consentRow}>
              <Text style={styles.consentText}>
                {ac(
                  "I agree to share my request with matched specialists and my contact details after they accept and pay.",
                )}
              </Text>
              <Switch
                accessibilityLabel={ac("Sharing consent")}
                trackColor={{ false: colors.border, true: "#bceff2" }}
                thumbColor={providerConsent ? colors.accent : colors.white}
                value={providerConsent}
                onValueChange={setProviderConsent}
              />
            </View>
            <Text style={styles.privacy}>
              {ac(
                "Closing or withdrawing a request stops future sharing. You can submit another request when you need help.",
              )}
            </Text>
            {error ? (
              <Text accessibilityRole="alert" style={styles.errorText}>
                {error}
              </Text>
            ) : null}
            <Pressable
              style={[styles.button, create.isPending && { opacity: 0.6 }]}
              disabled={create.isPending}
              onPress={() => create.mutate()}
              accessibilityRole="button"
            >
              <Text style={styles.buttonText}>
                {create.isPending ? ac("Submitting…") : ac("Submit request")}
              </Text>
            </Pressable>
          </View>

          <Text style={styles.heading}>{ac("Your requests")}</Text>
          {query.isLoading ? (
            <ActivityIndicator color={colors.brand} />
          ) : query.isError ? (
            <Pressable
              style={styles.error}
              onPress={() => void query.refetch()}
            >
              <Text style={styles.errorText}>
                {ac("Could not load requests. Tap to retry.")}
              </Text>
            </Pressable>
          ) : (query.data?.data ?? []).length === 0 ? (
            <Text style={styles.empty}>{ac("No requests yet.")}</Text>
          ) : (
            (query.data?.data ?? []).map((request) => (
              <Pressable
                key={request._id}
                style={styles.row}
                onPress={() => router.push(`/relocation-help/${request._id}`)}
                accessibilityRole="button"
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>
                    {country(request.destinationCountry)}
                  </Text>
                  <Text style={styles.rowMeta}>
                    {label(request.status)} ·{" "}
                    {new Date(request.submittedAt).toLocaleDateString(locale)}
                  </Text>
                </View>
                <Text style={styles.open}>{ac("View")}</Text>
              </Pressable>
            ))
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceMuted },
  content: { padding: 16, paddingBottom: 48, gap: 14 },
  card: {
    padding: 16,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 11,
  },
  title: { fontSize: 21, fontFamily: fontFamily.heading, color: colors.navy },
  copy: {
    fontSize: 13,
    lineHeight: 19,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
  },
  label: {
    fontSize: 13,
    fontFamily: fontFamily.semiBold,
    color: colors.textPrimary,
    marginTop: 5,
  },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    color: colors.textPrimary,
    fontFamily: fontFamily.regular,
  },
  notes: { minHeight: 90, paddingTop: 12 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  chip: {
    minHeight: 42,
    justifyContent: "center",
    paddingHorizontal: 12,
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
  consentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingTop: 5,
  },
  consentText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fontFamily.medium,
    color: colors.textPrimary,
  },
  privacy: {
    fontSize: 12,
    lineHeight: 17,
    color: colors.textMuted,
    fontFamily: fontFamily.regular,
  },
  button: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 99,
    backgroundColor: colors.brand,
  },
  buttonText: {
    color: colors.white,
    fontFamily: fontFamily.bold,
    fontSize: 15,
  },
  heading: {
    marginTop: 8,
    fontSize: 18,
    fontFamily: fontFamily.heading,
    color: colors.navy,
  },
  row: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowTitle: { fontSize: 15, fontFamily: fontFamily.bold, color: colors.navy },
  rowMeta: {
    marginTop: 5,
    fontSize: 12,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
  },
  open: { color: colors.brand, fontFamily: fontFamily.semiBold },
  empty: {
    padding: 20,
    textAlign: "center",
    color: colors.textMuted,
    fontFamily: fontFamily.regular,
  },
  error: { padding: 16, borderRadius: radii.md, backgroundColor: "#fef2f2" },
  errorText: {
    color: "#991b1b",
    fontFamily: fontFamily.medium,
    textAlign: "center",
  },
});
