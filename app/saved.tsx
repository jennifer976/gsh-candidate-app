import { withSignIn } from "@/components/SignInGate";
import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CompanyLogo } from "@/components/CompanyLogo";
import { GshScreenShell } from "@/components/GshScreenShell";
import { fetchSavedJobs, unsaveJob } from "@/lib/api-client";
import { hapticLight, hapticSuccess } from "@/lib/haptics";
import {
  getJobEmployerLabel,
  getJobLogoUrl,
  jobFromSavedRow,
} from "@/lib/job-display";
import { stackListLeadStyle } from "@/lib/screen-layout";
import { colors, feedCardStyle, fontFamily, radii } from "@/lib/theme";
import type { Job, SavedJobPopulated } from "@/types/models";

function SavedJobsScreen() {
  const ac = useAccountCopy();

  const router = useRouter();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["saved-jobs"],
    queryFn: fetchSavedJobs,
  });

  useFocusEffect(
    useCallback(() => {
      void query.refetch();
    }, [query.refetch]),
  );

  const unsave = useMutation({
    mutationFn: (row: SavedJobPopulated) => unsaveJob(row.id ?? row._id),
    onSuccess: () => {
      void hapticSuccess();
      void qc.invalidateQueries({ queryKey: ["saved-jobs"] });
    },
    onError: (e: unknown) =>
      Alert.alert(
        ac("Could not remove"),
        ac("Please try again."),
      ),
  });

  const rows = query.data ?? [];

  const listHeader = (
    <View style={styles.listHeader}>
      <Text style={styles.listEyebrow}>{ac("Your shortlist")}</Text>
      <Text style={styles.listTitle}>{ac("Saved jobs")}</Text>
      <Text style={styles.listSub}>
        {ac(
          "Open a saved job to see its details, or remove it from your list.",
        )}
      </Text>
    </View>
  );

  return (
    <GshScreenShell constrainTabletWidth>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        {query.isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.brand} />
            <Text style={styles.muted}>{ac("Loading saved jobs…")}</Text>
          </View>
        ) : query.isError ? (
          <View style={styles.center}>
            <Ionicons
              name="alert-circle-outline"
              size={40}
              color={colors.error}
            />
            <Text style={styles.err}>
              {ac("Saved jobs could not be loaded.")}
            </Text>
            <Pressable
              onPress={() => void query.refetch()}
              accessibilityRole="button"
              accessibilityLabel={ac("Try again")}
            >
              <Text style={styles.retry}>{ac("Try again")}</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={rows}
            keyExtractor={(item) => item._id}
            ListHeaderComponent={listHeader}
            refreshControl={
              <RefreshControl
                refreshing={query.isFetching}
                onRefresh={() => query.refetch()}
              />
            }
            contentContainerStyle={styles.listPad}
            renderItem={({ item }) => {
              const job = jobFromSavedRow(item);
              if (!job) return null;
              const employer = getJobEmployerLabel(job);
              const logoUrl = getJobLogoUrl(job);
              const inactive = item.listingActive === false;
              return (
                <View
                  style={[
                    styles.card,
                    feedCardStyle(),
                    inactive && styles.cardInactive,
                  ]}
                >
                  <View style={styles.cardBody}>
                    {inactive ? (
                      <Text style={styles.inactiveBanner}>
                        {ac("This listing is no longer active")}
                      </Text>
                    ) : null}
                    <Pressable
                      onPress={() => router.push(`/job/${job._id}`)}
                      style={styles.cardMain}
                      disabled={inactive}
                    >
                      <View style={styles.cardTitleRow}>
                        <CompanyLogo
                          logoUrl={logoUrl}
                          companyName={employer}
                          size={44}
                          radius={12}
                        />
                        <View style={styles.cardTitleCol}>
                          <Text style={styles.cardTitle} numberOfLines={2}>
                            {job.title}
                          </Text>
                          <Text style={styles.cardCompany} numberOfLines={1}>
                            {employer}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.cardHint}>
                        <Text style={styles.viewRole}>{ac("Open job")}</Text>
                        <Ionicons
                          name="chevron-forward"
                          size={18}
                          color={colors.brand}
                        />
                      </View>
                    </Pressable>
                    <Pressable
                      style={styles.removeBtn}
                      onPress={() => unsave.mutate(item)}
                      disabled={unsave.isPending}
                      accessibilityRole="button"
                      accessibilityLabel={ac("Remove from saved")}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color={colors.error}
                      />
                      <Text style={styles.removeText}>{ac("Remove")}</Text>
                    </Pressable>
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <View style={styles.emptyIcon}>
                  <Ionicons
                    name="bookmark-outline"
                    size={40}
                    color={colors.brand}
                  />
                </View>
                <Text style={styles.empty}>{ac("Nothing saved yet")}</Text>
                <Text style={styles.emptySub}>
                  {ac(
                    "Save a job with the bookmark button to return to it here.",
                  )}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push("/(tabs)/jobs")}
                  style={{
                    minHeight: 48,
                    borderRadius: radii.pill,
                    paddingHorizontal: 24,
                    justifyContent: "center",
                    backgroundColor: colors.navy,
                    marginTop: 12,
                  }}
                >
                  <Text
                    style={{ color: colors.white, fontFamily: fontFamily.bold }}
                  >
                    {ac("Find jobs")}
                  </Text>
                </Pressable>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </GshScreenShell>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  listHeader: stackListLeadStyle,
  listEyebrow: {
    fontSize: 11,
    fontFamily: fontFamily.semiBold,
    color: colors.teal,
    letterSpacing: 0.8,
    textTransform: "none",
    marginBottom: 6,
  },
  listTitle: {
    fontSize: 30,
    fontFamily: fontFamily.heading,
    color: colors.navy,
    letterSpacing: -0.4,
  },
  listSub: {
    marginTop: 6,
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    lineHeight: 20,
  },
  listPad: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  card: { borderRadius: radii.lg, overflow: "hidden" },
  cardBody: { flex: 1 },
  cardMain: { padding: 16 },
  cardTitleRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  cardTitleCol: { flex: 1, minWidth: 0 },
  cardTitle: {
    fontSize: 17,
    fontFamily: fontFamily.heading,
    color: colors.navy,
    letterSpacing: -0.2,
  },
  cardCompany: {
    marginTop: 4,
    fontSize: 15,
    fontFamily: fontFamily.semiBold,
    color: colors.textMarketing,
  },
  cardHint: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 4,
  },
  viewRole: {
    fontSize: 14,
    fontFamily: fontFamily.semiBold,
    color: colors.brand,
  },
  removeBtn: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceMuted,
    paddingVertical: 14,
    backgroundColor: colors.background,
  },
  removeText: {
    color: colors.error,
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 12,
  },
  muted: {
    color: colors.textMuted,
    fontSize: 15,
    fontFamily: fontFamily.medium,
  },
  err: {
    color: colors.error,
    textAlign: "center",
    fontFamily: fontFamily.medium,
  },
  retry: {
    color: colors.brand,
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
    marginTop: 4,
  },
  emptyWrap: {
    alignItems: "center",
    paddingHorizontal: 24,
    marginTop: 32,
    gap: 10,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(66,224,227,0.45)",
  },
  cardInactive: { opacity: 0.88 },
  inactiveBanner: {
    marginHorizontal: 16,
    marginTop: 12,
    fontSize: 12,
    fontFamily: fontFamily.semiBold,
    color: colors.textMuted,
  },
  empty: {
    textAlign: "center",
    color: colors.navy,
    fontFamily: fontFamily.bold,
    fontSize: 18,
  },
  emptySub: {
    textAlign: "center",
    color: colors.textMuted,
    fontFamily: fontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
    paddingHorizontal: 12,
  },
});

export default withSignIn(SavedJobsScreen, {
  icon: "bookmark-outline",
  title: "Save jobs for later",
  body: "Sign in to keep a list of the jobs you like and come back to them.",
});
