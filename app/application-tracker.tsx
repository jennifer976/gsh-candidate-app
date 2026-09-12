import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshDarkFeedHeading } from "@/components/GshDarkFeedHeading";
import { GshScreenShell } from "@/components/GshScreenShell";
import {
  createTrackedApplication,
  deleteTrackedApplication,
  fetchTrackedApplications,
  patchTrackedApplication,
} from "@/lib/api-client";
import { stackScrollContentStyle } from "@/lib/screen-layout";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";
import type {
  CandidateTrackedApplication,
  TrackedApplicationStage,
} from "@/types/models";

const STAGES: TrackedApplicationStage[] = [
  "interested",
  "applied",
  "screen",
  "interview",
  "offer",
  "closed",
];

export default function ApplicationTrackerScreen() {
  const ac = useAccountCopy();
  const [actionError, setActionError] = useState<string | null>(null);
  const stageLabel = (stage: TrackedApplicationStage) =>
    ac(
      (
        {
          interested: "Interested",
          applied: "Applied",
          screen: "Screening",
          interview: "Interview",
          offer: "Offer",
          closed: "Closed",
        } as const
      )[stage],
    );

  const client = useQueryClient();
  const [companyName, setCompanyName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [destination, setDestination] = useState("");
  const query = useQuery({
    queryKey: ["candidate-tools", "tracked-applications"],
    queryFn: fetchTrackedApplications,
  });
  const invalidate = () =>
    client.invalidateQueries({
      queryKey: ["candidate-tools", "tracked-applications"],
    });
  const create = useMutation({
    mutationFn: createTrackedApplication,
    onSuccess: () => {
      setActionError(null);
      setCompanyName("");
      setRoleTitle("");
      setDestination("");
      void invalidate();
    },
    onError: () => setActionError("Could not add application"),
  });
  const update = useMutation({
    mutationFn: ({
      id,
      stage,
    }: {
      id: string;
      stage: TrackedApplicationStage;
    }) => patchTrackedApplication(id, { stage }),
    onSuccess: () => {
      setActionError(null);
      return invalidate();
    },
    onError: () => setActionError("Could not update stage"),
  });
  const remove = useMutation({
    mutationFn: deleteTrackedApplication,
    onSuccess: () => {
      setActionError(null);
      return invalidate();
    },
    onError: () => setActionError("Could not remove application"),
  });

  const nextStage = (item: CandidateTrackedApplication) => {
    const index = STAGES.indexOf(item.stage);
    update.mutate({ id: item._id, stage: STAGES[(index + 1) % STAGES.length] });
  };

  return (
    <GshScreenShell constrainTabletWidth>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <ScrollView
          contentContainerStyle={styles.pad}
          keyboardShouldPersistTaps="handled"
        >
          <GshDarkFeedHeading
            pageLead
            title={ac("Application tracker")}
            subtitle={ac("Keep track of your applications in one place.")}
          />
          <View style={[styles.card, cardSurfaceStyle(false)]}>
            <Text style={styles.cardTitle}>{ac("Add an opportunity")}</Text>
            <TextInput
              style={styles.input}
              value={companyName}
              onChangeText={setCompanyName}
              placeholder={ac("Company")}
              placeholderTextColor={colors.placeholder}
            />
            <TextInput
              style={styles.input}
              value={roleTitle}
              onChangeText={setRoleTitle}
              placeholder={ac("Role title")}
              placeholderTextColor={colors.placeholder}
            />
            <TextInput
              style={styles.input}
              value={destination}
              onChangeText={setDestination}
              placeholder={ac("Destination (optional)")}
              placeholderTextColor={colors.placeholder}
            />
            <Pressable
              accessibilityRole="button"
              style={[
                styles.primary,
                (!companyName.trim() ||
                  !roleTitle.trim() ||
                  create.isPending) &&
                  styles.disabled,
              ]}
              disabled={
                !companyName.trim() || !roleTitle.trim() || create.isPending
              }
              onPress={() =>
                create.mutate({
                  companyName: companyName.trim(),
                  roleTitle: roleTitle.trim(),
                  destination: destination.trim(),
                })
              }
            >
              <Text style={styles.primaryText}>
                {create.isPending
                  ? ac("Adding…")
                  : create.isError
                    ? ac("Try again")
                    : ac("Add to tracker")}
              </Text>
            </Pressable>
          </View>

          {actionError ? (
            <Text accessibilityRole="alert" style={styles.error}>
              {ac(actionError)}. {ac("Please try again.")}
            </Text>
          ) : null}
          {query.isLoading ? <ActivityIndicator color={colors.brand} /> : null}
          {query.isError ? (
            <View style={[styles.card, cardSurfaceStyle(false)]}>
              <Text style={styles.error}>
                {ac("The tracker could not be loaded. Try again.")}
              </Text>
              <Pressable onPress={() => void query.refetch()}>
                <Text style={styles.link}>{ac("Try again")}</Text>
              </Pressable>
            </View>
          ) : null}
          {query.data?.data.map((item) => (
            <View key={item._id} style={[styles.card, cardSurfaceStyle(false)]}>
              <View style={styles.row}>
                <View style={styles.grow}>
                  <Text style={styles.itemTitle}>{item.roleTitle}</Text>
                  <Text style={styles.meta}>
                    {item.companyName}
                    {item.destination ? ` · ${item.destination}` : ""}
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  style={styles.iconButton}
                  onPress={() => remove.mutate(item._id)}
                  disabled={remove.isPending && remove.variables === item._id}
                  accessibilityLabel={`${ac("Remove")}: ${item.roleTitle}`}
                >
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color={colors.textMuted}
                  />
                </Pressable>
              </View>
              <Pressable
                accessibilityRole="button"
                style={styles.stage}
                onPress={() => nextStage(item)}
                disabled={update.isPending && update.variables?.id === item._id}
              >
                <Text style={styles.stageText}>
                  {update.isPending && update.variables?.id === item._id
                    ? ac("Saving…")
                    : ac("Stage: {stage} · Next: {next}", {
                        stage: stageLabel(item.stage),
                        next: stageLabel(
                          STAGES[
                            (STAGES.indexOf(item.stage) + 1) % STAGES.length
                          ],
                        ),
                      })}
                </Text>
              </Pressable>
            </View>
          ))}
          {!query.isLoading &&
          !query.isError &&
          query.data?.data.length === 0 ? (
            <Text style={styles.empty}>
              {ac("No tracked applications yet.")}
            </Text>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </GshScreenShell>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  pad: { ...stackScrollContentStyle, gap: 12 },
  card: {
    padding: 16,
    borderRadius: radii.lg,
    backgroundColor: colors.background,
    gap: 10,
  },
  cardTitle: {
    fontFamily: fontFamily.heading,
    fontSize: 17,
    color: colors.navy,
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: 12,
    fontSize: 16,
    color: colors.textPrimary,
    fontFamily: fontFamily.regular,
    backgroundColor: colors.surfaceMuted,
  },
  primary: {
    minHeight: 48,
    justifyContent: "center",
    backgroundColor: colors.brand,
    borderRadius: radii.md,
    padding: 13,
    alignItems: "center",
  },
  disabled: { opacity: 0.45 },
  primaryText: { color: colors.white, fontFamily: fontFamily.bold },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  grow: { flex: 1 },
  itemTitle: { fontFamily: fontFamily.bold, color: colors.navy, fontSize: 16 },
  meta: {
    marginTop: 4,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
    fontSize: 13,
  },
  stage: {
    minHeight: 44,
    alignSelf: "flex-start",
    justifyContent: "center",
    borderRadius: radii.md,
    backgroundColor: colors.brandSoft,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  stageText: {
    color: colors.brandDeep,
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
    textTransform: "capitalize",
  },
  error: { color: colors.textSecondary, fontFamily: fontFamily.regular },
  link: { color: colors.brand, fontFamily: fontFamily.bold },
  empty: {
    color: colors.textMuted,
    textAlign: "center",
    fontFamily: fontFamily.regular,
    padding: 20,
  },
});
