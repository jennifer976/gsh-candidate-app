import { withSignIn } from "@/components/SignInGate";
import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import * as Clipboard from "expo-clipboard";
import {
  ActivityIndicator,
  Alert,
  Linking,
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
const SIGNALS = ["unclear", "yes", "no", "case_by_case"] as const;
type MobilitySignal = (typeof SIGNALS)[number];

const csvValue = (value: unknown) =>
  `"${String(value ?? "").replaceAll('"', '""')}"`;

function ApplicationTrackerScreen() {
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
  const [roleUrl, setRoleUrl] = useState("");
  const [source, setSource] = useState("");
  const [stage, setStage] = useState<TrackedApplicationStage>("interested");
  const [appliedAt, setAppliedAt] = useState("");
  const [followUpAt, setFollowUpAt] = useState("");
  const [sponsorshipSignal, setSponsorshipSignal] =
    useState<MobilitySignal>("unclear");
  const [relocationSignal, setRelocationSignal] =
    useState<MobilitySignal>("unclear");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [outcome, setOutcome] = useState("");
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
      setRoleUrl("");
      setSource("");
      setStage("interested");
      setAppliedAt("");
      setFollowUpAt("");
      setSponsorshipSignal("unclear");
      setRelocationSignal("unclear");
      setContactName("");
      setContactEmail("");
      setNotes("");
      setOutcome("");
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

  const copyCsv = async () => {
    const rows = query.data?.data ?? [];
    const headers = [
      "Company",
      "Role",
      "Stage",
      "Destination",
      "Role URL",
      "Source",
      "Applied",
      "Follow-up",
      "Sponsorship",
      "Relocation",
      "Contact",
      "Contact email",
      "Notes",
      "Outcome",
    ];
    const csv = [
      headers.map(csvValue).join(","),
      ...rows.map((row) =>
        [
          row.companyName,
          row.roleTitle,
          row.stage,
          row.destination,
          row.roleUrl,
          row.source,
          row.appliedAt,
          row.followUpAt,
          row.sponsorshipSignal,
          row.relocationSignal,
          row.contactName,
          row.contactEmail,
          row.notes,
          row.outcome,
        ]
          .map(csvValue)
          .join(","),
      ),
    ].join("\n");
    await Clipboard.setStringAsync(csv);
    Alert.alert(ac("CSV copied"), ac("Paste it into a spreadsheet or notes app."));
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
          <View style={styles.headerActions}>
            <Text style={styles.headerHint}>
              {ac("Roles from company websites and other job boards")}
            </Text>
            <Pressable
              style={styles.exportButton}
              onPress={() => void copyCsv()}
              disabled={!query.data?.data.length}
            >
              <Ionicons name="download-outline" size={17} color={colors.navy} />
              <Text style={styles.exportText}>{ac("Copy CSV")}</Text>
            </Pressable>
          </View>
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
            <TextInput
              style={styles.input}
              value={roleUrl}
              onChangeText={setRoleUrl}
              placeholder={ac("Role URL (optional)")}
              placeholderTextColor={colors.placeholder}
              autoCapitalize="none"
              keyboardType="url"
            />
            <TextInput
              style={styles.input}
              value={source}
              onChangeText={setSource}
              placeholder={ac("Source, for example LinkedIn")}
              placeholderTextColor={colors.placeholder}
            />
            <Text style={styles.fieldLabel}>{ac("Stage")}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
            >
              {STAGES.map((value) => (
                <Pressable
                  key={value}
                  style={[styles.chip, stage === value && styles.chipActive]}
                  onPress={() => setStage(value)}
                >
                  <Text style={styles.chipText}>{stageLabel(value)}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <TextInput
              style={styles.input}
              value={appliedAt}
              onChangeText={setAppliedAt}
              placeholder={ac("Applied date: YYYY-MM-DD")}
              placeholderTextColor={colors.placeholder}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              value={followUpAt}
              onChangeText={setFollowUpAt}
              placeholder={ac("Follow-up date: YYYY-MM-DD")}
              placeholderTextColor={colors.placeholder}
              autoCapitalize="none"
            />
            <Text style={styles.fieldLabel}>{ac("Sponsorship signal")}</Text>
            <View style={styles.signalRow}>
              {SIGNALS.map((value) => (
                <Pressable
                  key={`s-${value}`}
                  style={[
                    styles.signal,
                    sponsorshipSignal === value && styles.signalActive,
                  ]}
                  onPress={() => setSponsorshipSignal(value)}
                >
                  <Text style={styles.signalText}>
                    {ac(value.replaceAll("_", " "))}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.fieldLabel}>{ac("Relocation signal")}</Text>
            <View style={styles.signalRow}>
              {SIGNALS.map((value) => (
                <Pressable
                  key={`r-${value}`}
                  style={[
                    styles.signal,
                    relocationSignal === value && styles.signalActive,
                  ]}
                  onPress={() => setRelocationSignal(value)}
                >
                  <Text style={styles.signalText}>
                    {ac(value.replaceAll("_", " "))}
                  </Text>
                </Pressable>
              ))}
            </View>
            <TextInput
              style={styles.input}
              value={contactName}
              onChangeText={setContactName}
              placeholder={ac("Contact name (optional)")}
              placeholderTextColor={colors.placeholder}
            />
            <TextInput
              style={styles.input}
              value={contactEmail}
              onChangeText={setContactEmail}
              placeholder={ac("Contact email (optional)")}
              placeholderTextColor={colors.placeholder}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              style={[styles.input, styles.multiline]}
              value={notes}
              onChangeText={(value) => setNotes(value.slice(0, 4000))}
              placeholder={ac("Notes (optional)")}
              placeholderTextColor={colors.placeholder}
              multiline
              textAlignVertical="top"
            />
            <TextInput
              style={[styles.input, styles.multiline]}
              value={outcome}
              onChangeText={(value) => setOutcome(value.slice(0, 1000))}
              placeholder={ac("Outcome or lesson (optional)")}
              placeholderTextColor={colors.placeholder}
              multiline
              textAlignVertical="top"
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
                  roleUrl: roleUrl.trim() || undefined,
                  source: source.trim() || undefined,
                  stage,
                  appliedAt: appliedAt.trim() || null,
                  followUpAt: followUpAt.trim() || null,
                  sponsorshipSignal,
                  relocationSignal,
                  contactName: contactName.trim() || undefined,
                  contactEmail: contactEmail.trim() || undefined,
                  notes: notes.trim() || undefined,
                  outcome: outcome.trim() || undefined,
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
                  {item.source ? (
                    <Text style={styles.detailText}>
                      {ac("Source")}: {item.source}
                    </Text>
                  ) : null}
                  {item.followUpAt ? (
                    <Text style={styles.detailText}>
                      {ac("Follow up")}: {item.followUpAt.slice(0, 10)}
                    </Text>
                  ) : null}
                  {item.contactName || item.contactEmail ? (
                    <Text style={styles.detailText}>
                      {[item.contactName, item.contactEmail].filter(Boolean).join(" · ")}
                    </Text>
                  ) : null}
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
              {item.roleUrl ? (
                <Pressable
                  style={styles.openRole}
                  onPress={() => void Linking.openURL(item.roleUrl!)}
                >
                  <Ionicons name="open-outline" size={16} color={colors.navy} />
                  <Text style={styles.openRoleText}>{ac("Open role")}</Text>
                </Pressable>
              ) : null}
              {item.notes ? <Text style={styles.notes}>{item.notes}</Text> : null}
              {item.outcome ? (
                <View style={styles.outcome}>
                  <Text style={styles.outcomeLabel}>{ac("Outcome or lesson")}</Text>
                  <Text style={styles.outcomeText}>{item.outcome}</Text>
                </View>
              ) : null}
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
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  headerHint: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  exportButton: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 13,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exportText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
    color: colors.navy,
  },
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
  multiline: { minHeight: 88 },
  fieldLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
    color: colors.textSecondary,
  },
  chips: { gap: 8 },
  chip: {
    minHeight: 42,
    justifyContent: "center",
    paddingHorizontal: 13,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  chipActive: {
    borderColor: colors.cyan,
    backgroundColor: colors.brandSoft,
  },
  chipText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
    color: colors.navy,
  },
  signalRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  signal: {
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  signalActive: {
    borderColor: colors.cyan,
    backgroundColor: colors.brandSoft,
  },
  signalText: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.navy,
    textTransform: "capitalize",
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
  detailText: {
    marginTop: 3,
    fontFamily: fontFamily.regular,
    fontSize: 12,
    color: colors.textMuted,
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
  openRole: {
    minHeight: 40,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  openRoleText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
    color: colors.navy,
  },
  notes: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
  },
  outcome: {
    padding: 12,
    borderRadius: radii.md,
    backgroundColor: colors.pale,
    gap: 4,
  },
  outcomeLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    textTransform: "uppercase",
    color: colors.textMuted,
  },
  outcomeText: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.navy,
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

export default withSignIn(ApplicationTrackerScreen, {
  icon: "document-text-outline",
  title: "Track your applications",
  body: "Sign in to see every job you have applied for and where it stands.",
});
