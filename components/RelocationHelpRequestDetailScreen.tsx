import { GshPressable } from "@/components/GshPressable";
import {
  fetchMyRelocationHelpRequest,
  transitionRelocationHelpRequest,
} from "@/lib/api-client";
import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { useRequestLabels } from "@/lib/i18n/useRequestLabels";
import { colors, fontFamily, navHeader, radii } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RelocationHelpRequestDetailScreen() {
  const ac = useAccountCopy();
  const { label, country, locale } = useRequestLabels();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const requestId = String(id || "");

  const query = useQuery({
    queryKey: ["phase6", "relocation-help", requestId],
    queryFn: () => fetchMyRelocationHelpRequest(requestId),
    enabled: Boolean(requestId),
    retry: false,
  });

  const transition = useMutation({
    mutationFn: (status: "withdrawn" | "closed") =>
      transitionRelocationHelpRequest(requestId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["phase6", "relocation-help"],
      });
    },
    onError: () =>
      Alert.alert(
        ac("Could not update the request"),
        ac("Refresh before trying again."),
      ),
  });

  const confirmTransition = (status: "withdrawn" | "closed") => {
    Alert.alert(
      status === "withdrawn" ? ac("Withdraw request?") : ac("Close request?"),
      ac("This stops future sharing and cannot be undone."),
      [
        { text: ac("Cancel"), style: "cancel" },
        {
          text: status === "withdrawn" ? ac("Withdraw") : ac("Close"),
          style: status === "withdrawn" ? "destructive" : "default",
          onPress: () => transition.mutate(status),
        },
      ],
    );
  };

  const request = query.data?.data;
  const active =
    request &&
    !["withdrawn", "closed"].includes(request.status);

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <Stack.Screen options={{ title: ac("Specialist request"), ...navHeader }} />
      <ScrollView contentContainerStyle={styles.content}>
        <GshPressable
          style={styles.back}
          onPress={() => router.replace("/relocation-help")}
          haptic={false}
        >
          <Ionicons name="arrow-back" size={18} color={colors.navy} />
          <Text style={styles.backText}>{ac("Back to your requests")}</Text>
        </GshPressable>

        {query.isLoading ? (
          <ActivityIndicator color={colors.cyan} />
        ) : query.isError || !request ? (
          <View style={styles.stateCard}>
            <Ionicons name="alert-circle-outline" size={36} color={colors.error} />
            <Text style={styles.stateTitle}>{ac("Request unavailable")}</Text>
            <GshPressable style={styles.retry} onPress={() => void query.refetch()}>
              <Text style={styles.retryText}>{ac("Try again")}</Text>
            </GshPressable>
          </View>
        ) : (
          <>
            <View style={styles.hero}>
              <Text style={styles.eyebrow}>{ac("Specialist request")}</Text>
              <View style={styles.heroRow}>
                <Text style={styles.title}>{country(request.destinationCountry)}</Text>
                <View style={styles.status}>
                  <Text style={styles.statusText}>{label(request.status)}</Text>
                </View>
              </View>
              <Text style={styles.date}>
                {ac("Submitted {date}", {
                  date: new Date(request.submittedAt).toLocaleDateString(locale),
                })}
              </Text>
            </View>

            <View style={styles.details}>
              <View style={styles.detail}>
                <Text style={styles.detailLabel}>{ac("Origin country")}</Text>
                <Text style={styles.detailValue}>
                  {request.originCountry
                    ? country(request.originCountry)
                    : ac("Not provided")}
                </Text>
              </View>
              <View style={styles.detail}>
                <Text style={styles.detailLabel}>{ac("Your stage")}</Text>
                <Text style={styles.detailValue}>{label(request.journeyStage)}</Text>
              </View>
              <View style={styles.detail}>
                <Text style={styles.detailLabel}>{ac("When do you need help?")}</Text>
                <Text style={styles.detailValue}>{label(request.timing)}</Text>
              </View>
              <View style={styles.detail}>
                <Text style={styles.detailLabel}>{ac("Requested support")}</Text>
                <Text style={styles.detailValue}>
                  {request.needCategories.map((item) => label(item)).join(", ")}
                </Text>
              </View>
              {request.notes ? (
                <View style={styles.detail}>
                  <Text style={styles.detailLabel}>{ac("Notes")}</Text>
                  <Text style={styles.detailValue}>{request.notes}</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.sharingCard}>
              <Ionicons
                name={active ? "shield-checkmark-outline" : "shield-outline"}
                size={24}
                color={colors.navy}
              />
              <View style={styles.sharingCopy}>
                <Text style={styles.sharingTitle}>
                  {active ? ac("Sharing is active") : ac("Sharing has stopped")}
                </Text>
                <Text style={styles.sharingText}>
                  {active
                    ? ac("Close or withdraw this request to stop future sharing.")
                    : ac("Specialists may already have seen information shared earlier.")}
                </Text>
              </View>
            </View>

            {active ? (
              <View style={styles.actions}>
                <GshPressable
                  style={[styles.action, styles.withdraw]}
                  onPress={() => confirmTransition("withdrawn")}
                  disabled={transition.isPending}
                >
                  <Text style={styles.withdrawText}>{ac("Withdraw request")}</Text>
                </GshPressable>
                <GshPressable
                  style={styles.action}
                  onPress={() => confirmTransition("closed")}
                  disabled={transition.isPending}
                >
                  <Text style={styles.actionText}>{ac("Close request")}</Text>
                </GshPressable>
              </View>
            ) : (
              <Text style={styles.inactiveText}>
                {ac("This request is no longer active. You can create another request.")}
              </Text>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.pale },
  content: { padding: 16, paddingBottom: 48, gap: 14 },
  back: {
    minHeight: 44,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    color: colors.navy,
  },
  hero: {
    borderRadius: radii.xl,
    backgroundColor: colors.navy,
    padding: 20,
  },
  eyebrow: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: colors.cyan,
  },
  heroRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  title: {
    flex: 1,
    fontFamily: fontFamily.headingStrong,
    fontSize: 26,
    color: colors.white,
  },
  status: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.cyan,
  },
  statusText: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: colors.navy,
  },
  date: {
    marginTop: 8,
    fontFamily: fontFamily.regular,
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
  },
  details: {
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: 16,
    gap: 16,
  },
  detail: { gap: 4 },
  detailLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: colors.textMuted,
  },
  detailValue: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.navy,
  },
  sharingCard: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    borderRadius: radii.lg,
    backgroundColor: colors.brandSoft,
  },
  sharingCopy: { flex: 1, gap: 4 },
  sharingTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    color: colors.navy,
  },
  sharingText: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
  },
  actions: { flexDirection: "row", gap: 10 },
  action: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.navy,
    backgroundColor: colors.white,
  },
  actionText: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: colors.navy,
  },
  withdraw: { borderColor: colors.error },
  withdrawText: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: colors.error,
  },
  inactiveText: {
    textAlign: "center",
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  stateCard: {
    alignItems: "center",
    gap: 10,
    padding: 24,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
  },
  stateTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 17,
    color: colors.navy,
  },
  retry: {
    minHeight: 44,
    paddingHorizontal: 18,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.navy,
  },
  retryText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    color: colors.white,
  },
});
