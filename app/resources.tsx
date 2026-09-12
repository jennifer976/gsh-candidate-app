import { useState } from "react";
import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshLinkRow, GshSectionTitle } from "@/components/gsh-ui-kit";
import { GshDarkFeedHeading } from "@/components/GshDarkFeedHeading";
import { GshScreenShell } from "@/components/GshScreenShell";
import {
  createCandidateResourceSave,
  deleteCandidateResourceSave,
  fetchCandidateResourceSaves,
} from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import { getMarketingSiteUrl } from "@/lib/config";
import { openExternalUrlInApp } from "@/lib/openMarketingBrowser";
import { stackScrollContentStyle } from "@/lib/screen-layout";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";

const PRACTICAL_RESOURCES = [
  [
    "Visa sponsorship cover letter template",
    "Explain your fit for the job, then state the support you need.",
    "visa-sponsorship-cover-letter-template",
    "Application",
  ],
  [
    "Job offer scam checklist",
    "Check an offer before sharing documents or money.",
    "job-offer-scam-checklist",
  ],
  [
    "Employer verification email",
    "Use this email to check the employer and visa support.",
    "employer-verification-email-template",
  ],
  [
    "Relocation budget checklist",
    "Plan travel, housing, healthcare and a reserve for unexpected costs.",
    "relocation-budget-checklist",
  ],
  [
    "First 90 days checklist",
    "Plan your move and first weeks, one step at a time.",
    "first-90-days-relocation-checklist",
  ],
  [
    "Visa sponsorship interview questions",
    "Ask who handles the process, the costs and the timing.",
    "visa-sponsorship-interview-questions",
    "Interview",
  ],
  [
    "International application tracker template",
    "Record the job, destination, next step and result.",
    "international-application-tracker-template",
    "Tracking",
  ],
] as const;

export default function ResourcesScreen() {
  const ac = useAccountCopy();
  const [saveError, setSaveError] = useState(false);
  const showSaveError = () => setSaveError(true);

  const router = useRouter();
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const savesQuery = useQuery({
    queryKey: ["candidate", "resource-saves"],
    queryFn: fetchCandidateResourceSaves,
    enabled: Boolean(token),
  });
  const saves = savesQuery.data?.data ?? [];
  const saveMutation = useMutation({
    mutationFn: createCandidateResourceSave,
    onSuccess: () =>
      void queryClient.invalidateQueries({
        queryKey: ["candidate", "resource-saves"],
      }),
    onError: showSaveError,
  });
  const removeMutation = useMutation({
    mutationFn: deleteCandidateResourceSave,
    onSuccess: () =>
      void queryClient.invalidateQueries({
        queryKey: ["candidate", "resource-saves"],
      }),
    onError: showSaveError,
  });
  const openResource = (slug: string) =>
    openExternalUrlInApp(
      `${getMarketingSiteUrl()}/resources/${encodeURIComponent(slug)}`,
    );

  function toggleResource(title: string, slug: string) {
    setSaveError(false);
    if (!token) {
      router.push({ pathname: "/login", params: { returnTo: "/resources" } });
      return;
    }
    const existing = saves.find((row) => row.resourceSlug === slug);
    if (existing) {
      removeMutation.mutate(existing.id ?? existing._id);
      return;
    }
    saveMutation.mutate({
      resourceSlug: slug,
      title,
      resourceUrl: `${getMarketingSiteUrl()}/resources/${encodeURIComponent(slug)}`,
    });
  }

  return (
    <GshScreenShell constrainTabletWidth>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <ScrollView
          contentContainerStyle={styles.pad}
          showsVerticalScrollIndicator={false}
        >
          <GshDarkFeedHeading
            pageLead
            title={ac("Practical resources")}
            subtitle={ac(
              "Checklists, templates and a tracker for your international job search.",
            )}
          />
          <View style={[styles.note, cardSurfaceStyle(false)]}>
            <Ionicons
              name="shield-checkmark-outline"
              size={22}
              color={colors.teal}
            />
            <Text style={styles.noteText}>
              {ac("Read the full resource inside the app.")}
            </Text>
          </View>

          <GshSectionTitle title={ac("Your workspace")} />
          <GshLinkRow
            title={ac("Application tracker")}
            subtitle={ac(
              "Track companies, jobs, destinations and progress in your account.",
            )}
            icon="list-outline"
            accent="teal"
            onPress={() => router.push("/application-tracker")}
          />
          <GshLinkRow
            title={ac("Saved resources")}
            subtitle={
              token
                ? ac("Saved: {count}", { count: saves.length })
                : ac("Sign in to save resources")
            }
            icon="bookmark-outline"
            accent="purple"
            onPress={() =>
              router.push(
                token
                  ? "/saved-resources"
                  : {
                      pathname: "/login",
                      params: { returnTo: "/saved-resources" },
                    },
              )
            }
          />

          {saveError ? (
            <Text accessibilityRole="alert" style={{ color: colors.error }}>
              {ac("Could not update resources")}. {ac("Please try again.")}
            </Text>
          ) : null}
          <GshSectionTitle title={ac("Checklists and templates")} />
          {PRACTICAL_RESOURCES.map(([title, subtitle, slug]) => {
            const saved = saves.some((row) => row.resourceSlug === slug);
            const busy =
              (saveMutation.isPending &&
                saveMutation.variables?.resourceSlug === slug) ||
              (removeMutation.isPending &&
                saves.find(
                  (row) => (row.id ?? row._id) === removeMutation.variables,
                )?.resourceSlug === slug);
            return (
              <View
                key={slug}
                style={[styles.resourceRow, cardSurfaceStyle(false)]}
              >
                <Pressable
                  style={styles.resourceMain}
                  onPress={() => openResource(slug)}
                >
                  <Ionicons
                    name="document-text-outline"
                    size={21}
                    color={colors.brand}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.resourceTitle}>{ac(title)}</Text>
                    <Text style={styles.resourceSubtitle}>{ac(subtitle)}</Text>
                  </View>
                  <Ionicons
                    name="open-outline"
                    size={18}
                    color={colors.textMuted}
                  />
                </Pressable>
                <Pressable
                  style={styles.saveButton}
                  onPress={() => toggleResource(title, slug)}
                  disabled={busy}
                  accessibilityLabel={`${ac(saved ? "Remove" : "Save")}: ${ac(title)}`}
                >
                  <Ionicons
                    name={saved ? "bookmark" : "bookmark-outline"}
                    size={18}
                    color={saved ? colors.brand : colors.textMuted}
                  />
                  <Text
                    style={[styles.saveText, saved && styles.saveTextActive]}
                  >
                    {busy ? ac("Saving…") : saved ? ac("Saved") : ac("Save")}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </GshScreenShell>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  pad: { ...stackScrollContentStyle, gap: 12 },
  note: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    borderRadius: radii.lg,
    backgroundColor: colors.background,
  },
  noteText: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
  },
  resourceRow: { borderRadius: radii.lg, overflow: "hidden" },
  resourceMain: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    padding: 14,
  },
  resourceTitle: {
    fontSize: 14,
    fontFamily: fontFamily.bold,
    color: colors.navy,
  },
  resourceSubtitle: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
  },
  saveButton: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  saveText: {
    fontSize: 12,
    fontFamily: fontFamily.semiBold,
    color: colors.textMuted,
  },
  saveTextActive: { color: colors.brand },
});
