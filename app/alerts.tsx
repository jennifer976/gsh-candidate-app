import { withSignIn } from "@/components/SignInGate";
import { parseBudgetCost } from "@/lib/relocationBudget";
import {useAppLanguage, toIntlLocale} from "@/lib/i18n";
import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshGradientPrimaryButton } from "@/components/GshGradientPrimaryButton";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { GshScreenIntro, GshSectionTitle } from "@/components/gsh-ui-kit";
import {
  createJobSearchAlert,
  deleteJobSearchAlert,
  fetchCandidateNotificationPrefs,
  fetchJobMatches,
  fetchJobSearchAlerts,
  markAllJobMatchesRead,
  markJobMatchRead,
  patchCandidateNotificationPrefs,
  patchJobSearchAlert,
} from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import { persistCandidateReturnIntent } from "@/lib/candidate-return-intent";
import {
  normalizeJobMatches,
  type NormalizedJobMatch,
} from "@/lib/candidate-matches";
import { VISA_ROUTE_OPTIONS } from "@/lib/job-display";
import { stackScrollContentStyle } from "@/lib/screen-layout";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";
import type { JobSearchAlertDto } from "@/types/models";

function AlertsScreen() {
  const ac = useAccountCopy();
  const locale = toIntlLocale(useAppLanguage((s) => s.locale));
  const [actionError, setActionError] = useState<string | null>(null);
  const actionFailed = () =>
    setActionError("Could not save this change. Refresh before trying again.");

  const router = useRouter();
  const qc = useQueryClient();
  const token = useAuthStore((state) => state.token);

  const prefsQuery = useQuery({
    queryKey: ["candidate", "notification-prefs"],
    queryFn: fetchCandidateNotificationPrefs,
  });

  const matchesQuery = useQuery({
    queryKey: ["candidate", "job-matches"],
    queryFn: () => fetchJobMatches({ limit: 50 }),
  });

  const searchesQuery = useQuery({
    queryKey: ["candidate", "job-search-alerts"],
    queryFn: fetchJobSearchAlerts,
  });

  const [newName, setNewName] = useState("");
  const [newQ, setNewQ] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newIndustry, setNewIndustry] = useState("");
  const [newBenefit, setNewBenefit] = useState("");
  const [newVisaRoute, setNewVisaRoute] = useState("");
  const [newJobType, setNewJobType] = useState("");
  const [newExperienceLevel, setNewExperienceLevel] = useState("");
  const [newSkills, setNewSkills] = useState("");
  const [newWorkMode, setNewWorkMode] = useState("");
  const [newMinSalary, setNewMinSalary] = useState("");
  const [newMaxSalary, setNewMaxSalary] = useState("");
  const [newPostedWithinDays, setNewPostedWithinDays] = useState("");
  const pendingSearchFilters = () => ({
    q: newQ.trim() || undefined,
    location: newLocation.trim() || undefined,
    industry: newIndustry.trim() || undefined,
    benefit: newBenefit.trim() || undefined,
    visaRoute: newVisaRoute || undefined,
    jobType: newJobType.trim() || undefined,
    experienceLevel: newExperienceLevel.trim() || undefined,
    skills: newSkills.trim() || undefined,
    workMode: newWorkMode.trim() || undefined,
    minSalary: parseBudgetCost(newMinSalary) ?? undefined,
    maxSalary: parseBudgetCost(newMaxSalary) ?? undefined,
    postedWithinDays: newPostedWithinDays
      ? Number(newPostedWithinDays)
      : undefined,
  });

  const patchPrefs = useMutation({
    mutationFn: patchCandidateNotificationPrefs,
    onError: actionFailed,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["candidate", "notification-prefs"] }),
  });

  const markAll = useMutation({
    mutationFn: markAllJobMatchesRead,
    onError: actionFailed,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["candidate", "job-matches"] }),
  });

  const openMatch = useMutation({
    mutationFn: async (row: NormalizedJobMatch) => {
      await markJobMatchRead(row.id);
      return row.jobId;
    },
    onSuccess: (jobId) => {
      void qc.invalidateQueries({ queryKey: ["candidate", "job-matches"] });
      router.push(`/job/${jobId}`);
    },
    onError: actionFailed,
  });

  const toggleSearch = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      patchJobSearchAlert(id, { isActive: !isActive }),
    onError: actionFailed,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["candidate", "job-search-alerts"] }),
  });

  const removeSearch = useMutation({
    mutationFn: deleteJobSearchAlert,
    onError: actionFailed,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["candidate", "job-search-alerts"] }),
  });

  const createSearch = useMutation({
    mutationFn: () =>
      createJobSearchAlert(
        newName.trim() || ac("My search"),
        pendingSearchFilters(),
      ),
    onSuccess: () => {
      setNewName("");
      setNewQ("");
      setNewLocation("");
      setNewIndustry("");
      setNewBenefit("");
      setNewVisaRoute("");
      setNewJobType("");
      setNewExperienceLevel("");
      setNewSkills("");
      setNewWorkMode("");
      setNewMinSalary("");
      setNewMaxSalary("");
      setNewPostedWithinDays("");
      qc.invalidateQueries({ queryKey: ["candidate", "job-search-alerts"] });
    },
    onError: actionFailed,
  });

  const prefs = prefsQuery.data;
  const matches = normalizeJobMatches(matchesQuery.data?.data ?? []);
  const unread = matchesQuery.data?.unreadCount ?? 0;
  const searches = searchesQuery.data ?? [];

  const prefsErrNoData = prefsQuery.isError && prefsQuery.data === undefined;
  const matchesErrNoData =
    matchesQuery.isError && matchesQuery.data === undefined;
  const searchesErrNoData =
    searchesQuery.isError && searchesQuery.data === undefined;

  const prefsBoot = prefsQuery.isPending && prefsQuery.data === undefined;
  const matchesBoot = matchesQuery.isPending && matchesQuery.data === undefined;
  const searchesBoot =
    searchesQuery.isPending && searchesQuery.data === undefined;

  const refreshing =
    prefsQuery.isFetching ||
    matchesQuery.isFetching ||
    searchesQuery.isFetching;

  async function saveSearchOrAuthenticate() {
    setActionError(null);
    const min = parseBudgetCost(newMinSalary),
      max = parseBudgetCost(newMaxSalary);
    const days = newPostedWithinDays.trim();
    if (
      min === null ||
      max === null ||
      (min !== undefined && max !== undefined && min > max) ||
      (days &&
        (!/^\d+$/.test(days) ||
          !Number.isSafeInteger(Number(days)) ||
          Number(days) < 1))
    ) {
      setActionError("Check the salary range and number of days.");
      return;
    }
    if (token) {
      createSearch.mutate();
      return;
    }
    await persistCandidateReturnIntent("/alerts", {
      kind: "create_alert",
      name: newName.trim() || ac("My search"),
      filters: pendingSearchFilters(),
    });
    router.push({ pathname: "/login", params: { returnTo: "/alerts" } });
  }

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                void prefsQuery.refetch();
                void matchesQuery.refetch();
                void searchesQuery.refetch();
              }}
            />
          }
          contentContainerStyle={styles.pad}
        >
          <GshScreenIntro
            eyebrow={ac("Stay up to date")}
            title={ac("Alerts and notifications")}
            subtitle={ac(
              "Choose your updates and save searches for jobs that interest you.",
            )}
            style={{ marginBottom: 4 }}
          />
          {actionError ? (
            <Text
              accessibilityRole="alert"
              style={{ color: colors.error, marginVertical: 12 }}
            >
              {ac(actionError)}
            </Text>
          ) : null}
          {prefsBoot ? (
            <ActivityIndicator
              style={{ marginVertical: 16 }}
              color={colors.brand}
            />
          ) : prefsErrNoData ? (
            <View style={[styles.sectionErrCard, cardSurfaceStyle(false)]}>
              <Ionicons
                name="cloud-offline-outline"
                size={28}
                color={colors.textMuted}
              />
              <Text style={styles.sectionErrTitle}>
                {ac("Notification preferences could not be loaded")}
              </Text>
              <Text style={styles.sectionErrSub}>
                {ac("Check your connection and try again.")}
              </Text>
              <Pressable
                style={styles.sectionRetryBtn}
                onPress={() => void prefsQuery.refetch()}
                accessibilityRole="button"
                accessibilityLabel={ac("Try again")}
              >
                <Text style={styles.sectionRetryBtnText}>
                  {ac("Try again")}
                </Text>
              </Pressable>
            </View>
          ) : prefs ? (
            <View style={[styles.prefsCard, cardSurfaceStyle(false)]}>
              {prefsQuery.isError ? (
                <Text style={styles.staleHint}>
                  {ac(
                    "Could not refresh preferences. Showing your last saved settings.",
                  )}
                </Text>
              ) : null}
              <RowSwitch
                label={ac("Email notifications")}
                value={prefs.emailNotifications}
                onValueChange={(v) =>
                  patchPrefs.mutate({ emailNotifications: v })
                }
                disabled={patchPrefs.isPending}
                showDivider
              />
              <RowSwitch
                label={ac("Job alert emails")}
                value={prefs.jobAlerts}
                onValueChange={(v) => patchPrefs.mutate({ jobAlerts: v })}
                disabled={patchPrefs.isPending}
                showDivider
              />
              <RowSwitch
                label={ac("Application updates")}
                value={prefs.applicationUpdates}
                onValueChange={(v) =>
                  patchPrefs.mutate({ applicationUpdates: v })
                }
                disabled={patchPrefs.isPending}
                showDivider
              />
              <RowSwitch
                label={ac("Push notifications")}
                value={prefs.pushNotifications ?? true}
                onValueChange={(v) =>
                  patchPrefs.mutate({ pushNotifications: v })
                }
                disabled={patchPrefs.isPending}
              />
            </View>
          ) : null}

          <GshSectionTitle title={ac("New job matches")} topSpacing="md" />
          <Text style={styles.sub}>
            {matchesErrNoData
              ? ac("Matches could not be loaded.")
              : unread > 0
                ? ac("Unread: {count}", {
                    count: unread.toLocaleString(locale),
                  })
                : ac("You are up to date")}
          </Text>
          {!matchesErrNoData && matches.length > 0 ? (
            <Pressable
              style={[
                styles.secondaryBtn,
                markAll.isPending && styles.disabled,
              ]}
              onPress={() => markAll.mutate()}
              disabled={markAll.isPending}
            >
              <Text style={styles.secondaryBtnText}>
                {ac("Mark all as read")}
              </Text>
            </Pressable>
          ) : null}

          {matchesBoot ? (
            <ActivityIndicator
              style={{ marginVertical: 12 }}
              color={colors.brand}
            />
          ) : matchesErrNoData ? (
            <View style={[styles.sectionErrCard, cardSurfaceStyle(false)]}>
              <Ionicons
                name="cloud-offline-outline"
                size={28}
                color={colors.textMuted}
              />
              <Text style={styles.sectionErrTitle}>
                {ac("Matches could not be loaded.")}
              </Text>
              <Text style={styles.sectionErrSub}>
                {ac("Please try again.")}
              </Text>
              <Pressable
                style={styles.sectionRetryBtn}
                onPress={() => void matchesQuery.refetch()}
                accessibilityRole="button"
                accessibilityLabel={ac("Try again")}
              >
                <Text style={styles.sectionRetryBtnText}>
                  {ac("Try again")}
                </Text>
              </Pressable>
            </View>
          ) : (
            matches.map((row) => {
              return (
                <Pressable
                  key={row.id}
                  style={[
                    cardSurfaceStyle(true),
                    styles.matchCard,
                    !row.read && styles.matchUnread,
                  ]}
                  onPress={() => openMatch.mutate(row)}
                  disabled={openMatch.isPending}
                >
                  <Text style={styles.matchTitle} numberOfLines={2}>
                    {row.job?.title || ac("Job")}
                  </Text>
                  <Text style={styles.matchCo} numberOfLines={1}>
                    {row.job?.companyName || ""}
                  </Text>
                  <Text style={styles.matchHint} numberOfLines={1}>
                    {row.source === "followed_employer"
                      ? ac("From an employer you follow")
                      : ac("From a saved search")}
                  </Text>
                  {row.matchReasons.map((reason) => (
                    <Text key={reason} style={styles.matchReason}>
                      •{" "}
                      {reason.startsWith("Matches saved search: ")
                        ? ac("Matches saved search: {name}", {
                            name: reason.slice("Matches saved search: ".length),
                          })
                        : ac(reason)}
                    </Text>
                  ))}
                </Pressable>
              );
            })
          )}
          {!matchesBoot && !matchesErrNoData && matches.length === 0 ? (
            <View style={[styles.emptyCard, cardSurfaceStyle(false)]}>
              <Text style={styles.empty}>
                {ac("No matches yet. Add a saved search below.")}
              </Text>
            </View>
          ) : null}

          <GshSectionTitle title={ac("Saved searches")} topSpacing="lg" />
          <Text style={styles.sub}>
            {ac("We notify you when new jobs match your filters.")}
          </Text>

          {searchesBoot ? (
            <ActivityIndicator
              style={{ marginVertical: 12 }}
              color={colors.brand}
            />
          ) : searchesErrNoData ? (
            <View style={[styles.sectionErrCard, cardSurfaceStyle(false)]}>
              <Ionicons
                name="cloud-offline-outline"
                size={28}
                color={colors.textMuted}
              />
              <Text style={styles.sectionErrTitle}>
                {ac("Saved searches could not be loaded")}
              </Text>
              <Text style={styles.sectionErrSub}>
                {ac("Check your connection and try again.")}
              </Text>
              <Pressable
                style={styles.sectionRetryBtn}
                onPress={() => void searchesQuery.refetch()}
                accessibilityRole="button"
                accessibilityLabel={ac("Try again")}
              >
                <Text style={styles.sectionRetryBtnText}>
                  {ac("Try again")}
                </Text>
              </Pressable>
            </View>
          ) : (
            searches.map((s: JobSearchAlertDto) => (
              <View
                key={s._id}
                style={[cardSurfaceStyle(false), styles.searchRow]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.searchName}>
                    {s.name?.trim() || ac("Saved search")}
                  </Text>
                  <Text style={styles.searchFilters} numberOfLines={2}>
                    {formatFilters(s.filters, ac, locale)}
                  </Text>
                </View>
                <Switch
                  trackColor={{false: colors.border, true: "#bceff2"}}
                  thumbColor={s.isActive ? colors.accent : colors.white}
                  accessibilityLabel={s.name?.trim() || ac("Saved search")}
                  disabled={toggleSearch.isPending}
                  value={s.isActive}
                  onValueChange={() =>
                    toggleSearch.mutate({ id: s._id, isActive: s.isActive })
                  }
                />
                <Pressable
                  style={styles.deleteBtn}
                  accessibilityLabel={`${ac("Delete")}: ${s.name?.trim() || ac("Saved search")}`}
                  disabled={removeSearch.isPending}
                  onPress={() => {
                    if (Platform.OS === "web") {
                      if (globalThis.confirm(ac("Delete saved search?")))
                        removeSearch.mutate(s._id);
                    } else
                      Alert.alert(ac("Delete saved search?"), undefined, [
                        { text: ac("Cancel"), style: "cancel" },
                        {
                          text: ac("Delete"),
                          style: "destructive",
                          onPress: () => removeSearch.mutate(s._id),
                        },
                      ]);
                  }}
                >
                  <Text style={styles.deleteText}>✕</Text>
                </Pressable>
              </View>
            ))
          )}

          <GshSectionTitle title={ac("Add saved search")} topSpacing="md" />
          <TextInput
            style={styles.input}
            placeholder={ac("Name (optional)")}
            placeholderTextColor={colors.placeholder}
            value={newName}
            onChangeText={setNewName}
          />
          <TextInput
            style={styles.input}
            placeholder={ac("Keywords, such as engineer or nurse")}
            placeholderTextColor={colors.placeholder}
            value={newQ}
            onChangeText={setNewQ}
          />
          <TextInput
            style={styles.input}
            placeholder={ac("Location")}
            placeholderTextColor={colors.placeholder}
            value={newLocation}
            onChangeText={setNewLocation}
          />
          <TextInput
            style={styles.input}
            placeholder={ac("Industry")}
            placeholderTextColor={colors.placeholder}
            value={newIndustry}
            onChangeText={setNewIndustry}
          />
          <AlertChoices
            label={ac("Mobility or benefit")}
            value={newBenefit}
            onChange={setNewBenefit}
            options={[
              ["", "All"],
              ["Visa Sponsorship", "Visa sponsorship"],
              ["Relocation Support", "Relocation support"],
              ["Remote Friendly", "Remote friendly"],
              ["Cross-border Remote Allowed", "Remote \u2014 Global"],
              ["Job Offer Support", "Job offer support"],
            ]}
          />
          <AlertChoices
            label={ac("Job type")}
            value={newJobType}
            onChange={setNewJobType}
            options={[
              ["", "All"],
              ["full-time", "Full-time"],
              ["part-time", "Part-time"],
              ["contract", "Contract"],
              ["internship", "Internship"],
            ]}
          />
          <AlertChoices
            label={ac("Experience level")}
            value={newExperienceLevel}
            onChange={setNewExperienceLevel}
            options={[
              ["", "All"],
              ["Entry Level", "Entry Level"],
              ["Mid Level", "Mid Level"],
              ["Senior Level", "Senior Level"],
              ["Executive", "Executive"],
            ]}
          />
          <TextInput
            style={styles.input}
            placeholder={ac("Skills (separated by commas)")}
            placeholderTextColor={colors.placeholder}
            value={newSkills}
            onChangeText={setNewSkills}
          />
          <AlertChoices
            label={ac("Work arrangement")}
            value={newWorkMode}
            onChange={setNewWorkMode}
            options={[
              ["", "All"],
              ["remote", "Remote"],
              ["hybrid", "Hybrid"],
              ["onsite", "On-site"],
            ]}
          />
          <View style={styles.numericRow}>
            <TextInput
              style={[styles.input, styles.numericInput]}
              placeholder={ac("Minimum salary")}
              placeholderTextColor={colors.placeholder}
              value={newMinSalary}
              onChangeText={setNewMinSalary}
              keyboardType="number-pad"
            />
            <TextInput
              style={[styles.input, styles.numericInput]}
              placeholder={ac("Maximum salary")}
              placeholderTextColor={colors.placeholder}
              value={newMaxSalary}
              onChangeText={setNewMaxSalary}
              keyboardType="number-pad"
            />
          </View>
          <TextInput
            style={styles.input}
            placeholder={ac("Posted within days")}
            placeholderTextColor={colors.placeholder}
            value={newPostedWithinDays}
            onChangeText={setNewPostedWithinDays}
            keyboardType="number-pad"
          />
          <Text style={styles.routeLabel}>{ac("Visa route (optional)")}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.routeChipRow}
          >
            {["", ...VISA_ROUTE_OPTIONS.slice(0, 8)].map((route) => {
              const active = newVisaRoute === route;
              return (
                <Pressable
                  key={route || "any"}
                  style={[styles.routeChip, active && styles.routeChipActive]}
                  onPress={() => setNewVisaRoute(route)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <Text
                    style={[
                      styles.routeChipText,
                      active && styles.routeChipTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    {route || ac("Any route")}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <GshGradientPrimaryButton
            title={createSearch.isPending ? ac("Saving…") : ac("Save alert")}
            onPress={() => void saveSearchOrAuthenticate()}
            disabled={
              ![
                newQ,
                newLocation,
                newIndustry,
                newBenefit,
                newVisaRoute,
                newJobType,
                newExperienceLevel,
                newSkills,
                newWorkMode,
                newMinSalary,
                newMaxSalary,
                newPostedWithinDays,
              ].some((value) => value.trim()) || createSearch.isPending
            }
            containerStyle={{ marginTop: 4 }}
          />
        </ScrollView>
      </SafeAreaView>
    </GshScreenBackground>
  );
}

function AlertChoices({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[][];
}) {
  const ac = useAccountCopy();
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.routeLabel}>{label}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {options.map(([id, name]) => (
          <Pressable
            key={id}
            onPress={() => onChange(id)}
            accessibilityRole="radio"
            accessibilityState={{ selected: value === id }}
            style={[styles.routeChip, value === id && styles.routeChipActive]}
          >
            <Text
              style={[
                styles.routeChipText,
                value === id && styles.routeChipTextActive,
              ]}
            >
              {ac(name)}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function RowSwitch(props: {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
  showDivider?: boolean;
}) {
  return (
    <View
      style={[
        styles.switchRow,
        props.showDivider ? styles.switchRowDivider : null,
      ]}
    >
      <Text style={styles.switchLabel}>{props.label}</Text>
      <Switch
        trackColor={{false: colors.border, true: "#bceff2"}}
        thumbColor={props.value ? colors.accent : colors.white}
        accessibilityLabel={props.label}
        value={props.value}
        onValueChange={props.onValueChange}
        disabled={props.disabled}
      />
    </View>
  );
}

function formatFilters(
  f: Record<string, unknown>,
  ac: (key: string) => string,
  locale: string,
): string {
  const parts: string[] = [];
  if (typeof f.q === "string" && f.q.trim()) parts.push(`“${f.q.trim()}”`);
  if (typeof f.location === "string" && f.location.trim())
    parts.push(f.location.trim());
  if (typeof f.industry === "string" && f.industry.trim())
    parts.push(f.industry.trim());
  if (typeof f.benefit === "string" && f.benefit.trim())
    parts.push(f.benefit.trim());
  if (typeof f.visaRoute === "string" && f.visaRoute.trim())
    parts.push(`${ac("Visa route (optional)")}: ${f.visaRoute.trim()}`);
  const labels: Record<string,string> = {jobType:"Job type",experienceLevel:"Experience level",skills:"Skills",workMode:"Work arrangement",minSalary:"Minimum salary",maxSalary:"Maximum salary",postedWithinDays:"Posted within days"};
  const optionLabels: Record<string,string> = {"full-time":"Full-time","part-time":"Part-time",contract:"Contract",internship:"Internship",remote:"Remote",hybrid:"Hybrid",onsite:"On-site","Entry Level":"Entry Level","Mid Level":"Mid Level","Senior Level":"Senior Level",Executive:"Executive"};
  for (const [key,label] of Object.entries(labels)) {
    const value=f[key]; if (value===undefined || value===null || value==="") continue;
    const display=typeof value==="number" ? value.toLocaleString(locale) : typeof value==="string" ? (optionLabels[value] && key!=="skills" ? ac(optionLabels[value]) : value) : "";
    if(display) parts.push(`${ac(label)}: ${display}`);
  }
  return parts.length ? parts.join(" · ") : ac("Any filters");
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  pad: { ...stackScrollContentStyle, paddingBottom: 40 },
  sub: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 12,
    lineHeight: 20,
  },
  prefsCard: {
    paddingVertical: 4,
    marginBottom: 22,
    backgroundColor: colors.background,
  },
  staleHint: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 4,
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    lineHeight: 18,
  },
  sectionErrCard: {
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 14,
    gap: 8,
    backgroundColor: colors.background,
  },
  sectionErrTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
    textAlign: "center",
  },
  sectionErrSub: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 18,
  },
  sectionRetryBtn: {
    marginTop: 4,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: radii.md,
    backgroundColor: colors.brand,
  },
  sectionRetryBtnText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    color: colors.white,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  switchRowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  switchLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: fontFamily.medium,
    color: colors.textPrimary,
  },
  secondaryBtn: {
    alignSelf: "flex-start",
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radii.sm,
    backgroundColor: colors.purpleMuted,
    borderWidth: 1,
    borderColor: colors.purpleBorder,
  },
  secondaryBtnText: {
    color: colors.purpleTextDark,
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
  },
  matchCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: radii.lg,
    backgroundColor: colors.background,
  },
  matchUnread: {
    borderColor: colors.unreadBorder,
    backgroundColor: colors.unreadBg,
  },
  matchTitle: {
    fontSize: 16,
    fontFamily: fontFamily.bold,
    color: colors.textPrimary,
  },
  matchCo: {
    marginTop: 4,
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
  },
  matchHint: {
    marginTop: 6,
    fontSize: 12,
    fontFamily: fontFamily.medium,
    color: colors.textMuted,
  },
  matchReason: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
    fontFamily: fontFamily.regular,
    color: colors.brandDeep,
  },
  emptyCard: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 14,
    backgroundColor: colors.background,
  },
  empty: {
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 14,
    marginBottom: 12,
    backgroundColor: colors.background,
  },
  searchName: {
    fontSize: 15,
    fontFamily: fontFamily.bold,
    color: colors.textPrimary,
  },
  searchFilters: {
    marginTop: 4,
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
  },
  deleteBtn: { padding: 8 },
  deleteText: {
    fontSize: 18,
    color: colors.error,
    fontFamily: fontFamily.bold,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    fontSize: 16,
    fontFamily: fontFamily.regular,
    backgroundColor: colors.background,
    marginBottom: 10,
    color: colors.textPrimary,
  },
  numericRow: { flexDirection: "row", gap: 10 },
  numericInput: { flex: 1 },
  routeLabel: {
    marginTop: 4,
    marginBottom: 8,
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  routeChipRow: { gap: 8, paddingBottom: 10 },
  routeChip: {
    maxWidth: 220,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  routeChipActive: {
    borderColor: colors.teal,
    backgroundColor: colors.brandSoft,
  },
  routeChipText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
    color: colors.textSecondary,
  },
  routeChipTextActive: { color: colors.navy },
  disabled: { opacity: 0.55 },
});

export default withSignIn(AlertsScreen, {
  icon: "notifications-outline",
  title: "Get job alerts",
  body: "Sign in to hear about new sponsored jobs that match your search.",
});
