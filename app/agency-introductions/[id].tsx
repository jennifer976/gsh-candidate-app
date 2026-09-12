import { useIntroductionLabels } from "@/lib/i18n/useIntroductionLabels";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Stack, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchCandidateAgencyIntroduction, respondToCandidateAgencyIntroduction } from "@/lib/api-client";
import { introductionTransitionIdempotencyKey } from "@/lib/idempotency";
import { colors, fontFamily, navHeader, radii } from "@/lib/theme";

const sharingCopy = "If you accept and remain visible to agencies, this agency can see your name, job title, skills, experience, preferred destinations and readiness to move. This introduction does not share your email, phone number or CV.";

export default function AgencyIntroductionDetailScreen() {
  const { ac, country, status: statusLabel, date } = useIntroductionLabels();

  const { id } = useLocalSearchParams<{ id: string }>();
  const introductionId = String(id || "");
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["phase6", "candidate-introduction", introductionId],
    queryFn: () => fetchCandidateAgencyIntroduction(introductionId),
    enabled: Boolean(introductionId),
  });
  const respond = useMutation({
    mutationFn: (status: "consented" | "declined") =>
      respondToCandidateAgencyIntroduction(
        introductionId,
        status,
        introductionTransitionIdempotencyKey(introductionId, status),
      ),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["phase6", "candidate-introduction", introductionId] });
      void qc.invalidateQueries({ queryKey: ["phase6", "candidate-introductions"] });
    },
    onError: () => Alert.alert(ac("Could not record your response"), ac("Please try again. Your response has not been confirmed.")),
  });
  const confirm = (status: "consented" | "declined") => Alert.alert(
    ac(status === "consented" ? "Accept introduction?" : "Decline introduction?"),
    status === "consented"
      ? ac(sharingCopy)
      : ac("Declining will not share any additional profile details with this agency."),
    [{ text: ac("Cancel"), style: "cancel" }, { text: ac(status === "consented" ? "Accept" : "Decline"), style: status === "declined" ? "destructive" : "default", onPress: () => respond.mutate(status) }],
  );

  if (query.isLoading) return <View style={styles.center}><ActivityIndicator color={colors.brand} /></View>;
  if (query.isError || !query.data?.data) return <View style={styles.center}><Text style={styles.title}>{ac("Introduction unavailable")}</Text><Pressable style={styles.button} onPress={() => void query.refetch()}><Text style={styles.buttonText}>{ac("Retry")}</Text></Pressable></View>;
  const item = query.data.data;
  const actionable = item.status === "consent_pending";
  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <Stack.Screen options={{ title: ac("Agency introduction"), ...navHeader }} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>{statusLabel(item.status)}</Text>
          <Text style={styles.title}>{item.request.title}</Text>
          <Text style={styles.agency}>{item.agency.name}{item.agency.country ? ` · ${country(item.agency.country)}` : ""}</Text>
          <Text style={styles.label}>{ac("Role summary")}</Text>
          <Text style={styles.value}>{item.request.roleSummary}</Text>
          <Text style={styles.label}>{ac("Destination")}</Text>
          <Text style={styles.value}>{country(item.request.destinationCountry)}</Text>
          {item.request.occupationFamilies.length ? <><Text style={styles.label}>{ac("Job areas")}</Text><Text style={styles.value}>{item.request.occupationFamilies.join(", ")}</Text></> : null}
          {item.request.requiredSkills.length ? <><Text style={styles.label}>{ac("Required skills")}</Text><Text style={styles.value}>{item.request.requiredSkills.join(", ")}</Text></> : null}
          {item.matchReasons.length ? <><Text style={styles.label}>{ac("Why this was proposed")}</Text>{item.matchReasons.map((reason) => <Text key={reason} style={styles.value}>• {reason}</Text>)}</> : null}
          <View style={styles.privacy}>
            <Text style={styles.privacyTitle}>{ac("What accepting shares")}</Text>
            <Text style={styles.privacyText}>{ac(sharingCopy)}</Text>
          </View>
          {item.candidateConsentedAt ? <Text style={styles.audit}>{ac("Accepted on {date}", { date: date(item.candidateConsentedAt) })}</Text> : null}
          {item.candidateDeclinedAt ? <Text style={styles.audit}>{ac("Declined on {date}", { date: date(item.candidateDeclinedAt) })}</Text> : null}
        </View>
        {actionable ? (
          <View style={styles.actions}>
            <Pressable style={styles.button} disabled={respond.isPending} onPress={() => confirm("consented")} accessibilityRole="button"><Text style={styles.buttonText}>{ac("Accept introduction")}</Text></Pressable>
            <Pressable style={styles.decline} disabled={respond.isPending} onPress={() => confirm("declined")} accessibilityRole="button"><Text style={styles.declineText}>{ac("Decline")}</Text></Pressable>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceMuted },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, padding: 24, backgroundColor: colors.surfaceMuted },
  content: { padding: 16, paddingBottom: 48, gap: 16 },
  card: { padding: 18, borderRadius: radii.lg, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, gap: 8 },
  eyebrow: { fontSize: 11, fontFamily: fontFamily.bold, color: colors.accent, textTransform: "lowercase", letterSpacing: 0.7 },
  title: { fontSize: 22, fontFamily: fontFamily.extraBold, color: colors.navy },
  agency: { fontSize: 14, fontFamily: fontFamily.semiBold, color: colors.textSecondary, marginBottom: 7 },
  label: { marginTop: 9, fontSize: 12, fontFamily: fontFamily.bold, color: colors.textMuted },
  value: { fontSize: 14, lineHeight: 21, fontFamily: fontFamily.regular, color: colors.textPrimary },
  privacy: { marginTop: 12, padding: 13, borderRadius: radii.md, backgroundColor: colors.surfaceMuted, borderWidth: 1, borderColor: colors.border, gap: 5 },
  privacyTitle: { fontSize: 13, fontFamily: fontFamily.bold, color: colors.navy },
  privacyText: { fontSize: 12, lineHeight: 18, fontFamily: fontFamily.regular, color: colors.textSecondary },
  audit: { marginTop: 10, fontSize: 12, fontFamily: fontFamily.medium, color: colors.textMuted },
  actions: { gap: 10 },
  button: { minHeight: 48, alignItems: "center", justifyContent: "center", borderRadius: radii.pill, backgroundColor: colors.brand, paddingHorizontal: 18 },
  buttonText: { color: colors.white, fontSize: 15, fontFamily: fontFamily.bold },
  decline: { minHeight: 48, alignItems: "center", justifyContent: "center", borderRadius: radii.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white },
  declineText: { color: colors.navy, fontSize: 15, fontFamily: fontFamily.bold },
});
