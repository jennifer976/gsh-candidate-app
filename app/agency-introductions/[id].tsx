import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Stack, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchApplyInvite, respondToApplyInvite } from "@/lib/api-client";
import { colors, fontFamily, navHeader, radii } from "@/lib/theme";

export default function ApplyInviteDetailScreen() {
  const ac = useAccountCopy();
  const { id } = useLocalSearchParams<{ id: string }>();
  const inviteId = String(id || "");
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["apply-invites", inviteId],
    queryFn: () => fetchApplyInvite(inviteId),
    enabled: Boolean(inviteId),
  });
  const respond = useMutation({
    mutationFn: (status: "accepted" | "declined") => respondToApplyInvite(inviteId, status),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["apply-invites"] });
    },
    onError: () => Alert.alert(ac("Could not record your response"), ac("Please try again.")),
  });

  if (query.isLoading) return <View style={styles.center}><ActivityIndicator color={colors.brand} /></View>;
  if (query.isError || !query.data?.data) return <View style={styles.center}><Text style={styles.title}>{ac("Invite unavailable")}</Text><Pressable style={styles.button} onPress={() => void query.refetch()}><Text style={styles.buttonText}>{ac("Retry")}</Text></Pressable></View>;
  const item = query.data.data;
  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <Stack.Screen options={{ title: ac("Invite to apply"), ...navHeader }} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>{item.status}</Text>
          <Text style={styles.title}>{item.jobTitle}</Text>
          <Text style={styles.agency}>{item.companyName || ac("Employer")}</Text>
          {item.message ? <Text style={styles.value}>{item.message}</Text> : null}
        </View>
        {item.applyUrl ? (
          <Pressable style={styles.button} onPress={() => void Linking.openURL(item.applyUrl!.startsWith("http") ? item.applyUrl! : `https://globalsponsorhub.com${item.applyUrl}`)}>
            <Text style={styles.buttonText}>{ac("Open role")}</Text>
          </Pressable>
        ) : null}
        {item.status === "pending" ? (
          <View style={styles.actions}>
            <Pressable style={styles.button} disabled={respond.isPending} onPress={() => respond.mutate("accepted")} accessibilityRole="button"><Text style={styles.buttonText}>{ac("Accept invite")}</Text></Pressable>
            <Pressable style={styles.decline} disabled={respond.isPending} onPress={() => respond.mutate("declined")} accessibilityRole="button"><Text style={styles.declineText}>{ac("Decline")}</Text></Pressable>
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
  value: { fontSize: 14, lineHeight: 21, fontFamily: fontFamily.regular, color: colors.textPrimary },
  actions: { gap: 10 },
  button: { minHeight: 48, alignItems: "center", justifyContent: "center", borderRadius: radii.pill, backgroundColor: colors.brand, paddingHorizontal: 18 },
  buttonText: { color: colors.white, fontSize: 15, fontFamily: fontFamily.bold },
  decline: { minHeight: 48, alignItems: "center", justifyContent: "center", borderRadius: radii.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white },
  declineText: { color: colors.navy, fontSize: 15, fontFamily: fontFamily.bold },
});
