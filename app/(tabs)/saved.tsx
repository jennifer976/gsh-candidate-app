import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GshScreenShell } from "@/components/GshScreenShell";
import { DepthButton, TitleWithStop } from "@/components/gsh-brand";
import { JobCard, PhotoEmpty } from "@/components/v3";
import { tabBarBottomPadding } from "@/lib/android-insets";
import { fetchSavedJobs, unsaveJob } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import { useAppCopy } from "@/lib/i18n";
import { jobCardFieldsFromJob } from "@/lib/jobCardFields";
import { jobFromSavedRow } from "@/lib/job-display";
import { useSignInPrompt } from "@/lib/useSignInPrompt";
import { colors, fontFamily } from "@/lib/theme";
import type { SavedJobPopulated } from "@/types/models";

export default function SavedTabScreen() {
  const { locale } = useAppCopy();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const signedIn = Boolean(useAuthStore((s) => s.token));
  const { openSignIn, openRegister } = useSignInPrompt();

  const savedQuery = useQuery({
    queryKey: ["saved-jobs"],
    queryFn: fetchSavedJobs,
    enabled: signedIn,
  });

  const unsave = useMutation({
    mutationFn: (row: SavedJobPopulated) => unsaveJob(row.id ?? row._id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["saved-jobs"] });
      void qc.invalidateQueries({ queryKey: ["analytics", "candidate-dashboard"] });
    },
  });

  const savedRows = savedQuery.data ?? [];
  const count = savedRows.length;
  const sub =
    !signedIn
      ? null
      : count === 0
        ? "Nothing saved yet"
        : count === 1
          ? "1 saved role"
          : `${count} saved roles`;

  const header = (
    <View style={[styles.header, { paddingTop: insets.top + 26 }]}>
      <TitleWithStop eyebrow="For later" text="Saved" />
      {sub ? <Text style={styles.sub}>{sub}</Text> : null}
    </View>
  );

  if (!signedIn) {
    return (
      <GshScreenShell constrainTabletWidth style={{ backgroundColor: colors.panel }}>
        <FlatList
          data={[]}
          renderItem={null}
          ListHeaderComponent={header}
          ListFooterComponent={
            <PhotoEmpty
              photo="relocation"
              chipIcon="heart"
              chipLabel="Saved roles live here"
              title="Your saved roles"
              body="Create a free account to save jobs and come back to them."
            >
              <DepthButton
                title="Create a free account"
                onPress={() => openRegister("/(tabs)/saved")}
                variant="navy"
                size="md"
              />
              <Pressable
                onPress={() => openSignIn("/(tabs)/saved")}
                style={styles.signInTextHit}
                accessibilityRole="button"
                accessibilityLabel="Sign in"
              >
                <Text style={styles.signInText}>Sign in</Text>
              </Pressable>
            </PhotoEmpty>
          }
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: tabBarBottomPadding(insets.bottom),
          }}
        />
      </GshScreenShell>
    );
  }

  const empty = savedQuery.isLoading ? (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={colors.navy} />
    </View>
  ) : (
    <PhotoEmpty
      photo="relocation"
      chipIcon="heart"
      chipLabel="Saved roles live here"
      title="Keep roles for later"
      body="Tap the heart on any job and it appears here."
    >
      <DepthButton
        title="Browse jobs"
        onPress={() => router.push("/(tabs)/jobs")}
        variant="navy"
        size="md"
        style={{ marginTop: 18 }}
        icon={null}
      />
    </PhotoEmpty>
  );

  return (
    <GshScreenShell constrainTabletWidth style={{ backgroundColor: colors.panel }}>
      <FlatList
        data={savedQuery.isError ? [] : savedRows}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: tabBarBottomPadding(insets.bottom),
        }}
        refreshControl={
          <RefreshControl
            refreshing={savedQuery.isRefetching}
            onRefresh={() => void savedQuery.refetch()}
            colors={["#0d194e"]}
            progressBackgroundColor="#ffffff"
            tintColor="#0d194e"
          />
        }
        renderItem={({ item, index }) => {
          const job = jobFromSavedRow(item);
          if (!job) return null;
          const fields = jobCardFieldsFromJob(job, locale);
          return (
            <JobCard
              index={index}
              title={fields.title}
              company={fields.company}
              logoUrl={fields.logoUrl}
              countryIso2={fields.countryIso2}
              countryLabel={fields.countryLabel}
              remote={fields.remote}
              salaryLabel={fields.salaryLabel}
              visaSponsorship={fields.visaSponsorship}
              relocationSupport={fields.relocationSupport}
              remoteTag={fields.remoteTag}
              jobType={fields.jobType}
              postedLabel={fields.postedLabel}
              saved
              onPress={() => router.push(fields.href as never)}
              onToggleSave={() => unsave.mutate(item)}
            />
          );
        }}
      />
    </GshScreenShell>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 12 },
  sub: {
    marginTop: 4,
    fontFamily: fontFamily.regular,
    fontSize: 15,
    color: colors.text2,
  },
  loading: { paddingVertical: 48, alignItems: "center" },
  signInTextHit: {
    marginTop: 8,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  signInText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    color: colors.navy,
    textDecorationLine: "underline",
  },
});
