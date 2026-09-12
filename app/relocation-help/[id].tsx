import { useState } from "react";
import { useRequestLabels } from "@/lib/i18n/useRequestLabels";
import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
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
  fetchMyRelocationHelpRequest,
  transitionRelocationHelpRequest,
} from "@/lib/api-client";
import { colors, fontFamily, navHeader, radii } from "@/lib/theme";

export default function RelocationHelpDetailScreen() {
  const ac = useAccountCopy();

  const { id } = useLocalSearchParams<{ id: string }>();
  const { label, country, locale } = useRequestLabels();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const qc = useQueryClient();
  const requestId = String(id || "");
  const query = useQuery({
    queryKey: ["phase6", "relocation-help", requestId],
    queryFn: () => fetchMyRelocationHelpRequest(requestId),
    enabled: Boolean(requestId),
  });
  const request = query.data?.data;
  const transition = useMutation({
    mutationFn: (status: "withdrawn" | "closed") =>
      transitionRelocationHelpRequest(String(id), status),
    onSuccess: () =>
      void qc.invalidateQueries({ queryKey: ["phase6", "relocation-help"] }),
    onMutate: () => setError(null),
    onError: () =>
      setError(
        ac("Could not update the request. Refresh before trying again."),
      ),
  });
  const confirm = (status: "withdrawn" | "closed") => {
    const title = ac(
      status === "withdrawn" ? "Withdraw request?" : "Close request?",
    );
    const message = ac("This stops future sharing and cannot be undone.");
    if (Platform.OS === "web") {
      if (globalThis.confirm(`${title}\n\n${message}`))
        transition.mutate(status);
      return;
    }
    Alert.alert(title, message, [
      { text: ac("Cancel"), style: "cancel" },
      {
        text: ac(status === "withdrawn" ? "Withdraw request" : "Close request"),
        style: "destructive",
        onPress: () => transition.mutate(status),
      },
    ]);
  };

  if (query.isLoading)
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  if (query.isError || !request) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>{ac("Request unavailable")}</Text>
        <Pressable style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>{ac("Go back")}</Text>
        </Pressable>
      </View>
    );
  }
  const active = !["withdrawn", "closed"].includes(request.status);
  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <Stack.Screen
        options={{ title: ac("Specialist request"), ...navHeader }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>{label(request.status)}</Text>
          <Text style={styles.title}>
            {ac("Help with a move to {country}", {
              country: country(request.destinationCountry),
            })}
          </Text>
          <Text style={styles.meta}>
            {ac("Submitted on {date}", {
              date: new Date(request.submittedAt).toLocaleString(locale),
            })}
          </Text>
          <Text style={styles.label}>{ac("Your stage")}</Text>
          <Text style={styles.value}>
            {label(request.journeyStage)} · {label(request.timing)}
          </Text>
          <Text style={styles.label}>{ac("Requested support")}</Text>
          {request.needCategories.map((need) => (
            <Text key={need} style={styles.value}>
              • {label(need)}
            </Text>
          ))}
          {request.originCountry ? (
            <>
              <Text style={styles.label}>{ac("Origin country")}</Text>
              <Text style={styles.value}>{country(request.originCountry)}</Text>
            </>
          ) : null}
          {request.notes ? (
            <>
              <Text style={styles.label}>{ac("Notes")}</Text>
              <Text style={styles.value}>{request.notes}</Text>
            </>
          ) : null}
          <Text style={styles.label}>{ac("Consent")}</Text>
          <Text style={styles.value}>
            {ac(
              "Contact and sharing permissions recorded on {date}. Policy: {version}.",
              {
                date: new Date(request.consentCapturedAt).toLocaleString(
                  locale,
                ),
                version: request.consentPolicyVersion,
              },
            )}
          </Text>
          {request.consentWithdrawnAt ? (
            <Text style={styles.warning}>
              {ac("Sharing permission withdrawn on {date}.", {
                date: new Date(request.consentWithdrawnAt).toLocaleString(
                  locale,
                ),
              })}
            </Text>
          ) : null}
        </View>
        {error ? (
          <Text accessibilityRole="alert" style={styles.warning}>
            {error}
          </Text>
        ) : null}
        {active ? (
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              style={styles.outline}
              onPress={() => confirm("closed")}
              disabled={transition.isPending}
            >
              <Text style={styles.outlineText}>{ac("Close request")}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              style={styles.danger}
              onPress={() => confirm("withdrawn")}
              disabled={transition.isPending}
            >
              <Text style={styles.dangerText}>{ac("Withdraw request")}</Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceMuted },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: 24,
    backgroundColor: colors.surfaceMuted,
  },
  content: { padding: 16, paddingBottom: 40, gap: 16 },
  card: {
    padding: 18,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 11,
    letterSpacing: 0.7,
    fontFamily: fontFamily.bold,
    textTransform: "lowercase",
  },
  title: { fontSize: 21, fontFamily: fontFamily.heading, color: colors.navy },
  meta: {
    fontSize: 12,
    color: colors.textMuted,
    fontFamily: fontFamily.regular,
    marginBottom: 8,
  },
  label: {
    marginTop: 9,
    fontSize: 12,
    color: colors.textMuted,
    fontFamily: fontFamily.bold,
    textTransform: "none",
  },
  value: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textPrimary,
    fontFamily: fontFamily.regular,
  },
  warning: {
    marginTop: 8,
    padding: 10,
    borderRadius: 9,
    backgroundColor: "#fffbeb",
    color: "#92400e",
    fontFamily: fontFamily.medium,
    fontSize: 12,
  },
  actions: { gap: 10 },
  button: {
    minHeight: 46,
    paddingHorizontal: 20,
    justifyContent: "center",
    borderRadius: 99,
    backgroundColor: colors.brand,
  },
  buttonText: { color: colors.white, fontFamily: fontFamily.bold },
  outline: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.brand,
  },
  outlineText: { color: colors.brand, fontFamily: fontFamily.bold },
  danger: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  dangerText: { color: "#b91c1c", fontFamily: fontFamily.bold },
});
