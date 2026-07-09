import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshContentAccentBar, GshScreenIntro } from "@/components/gsh-ui-kit";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { stackScrollContentStyle } from "@/lib/screen-layout";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";

const FACTORS = ["Language", "Money", "Family", "Recognition", "Timeline"] as const;
const BUDGET_ITEMS = [
  "Flights",
  "Visa & immigration fees",
  "Shipping / removals",
  "Temporary housing",
  "Deposit + first month rent",
  "Furniture & setup",
  "Health cover gap",
  "Contingency buffer",
] as const;
const NEGOTIATION_ITEMS = [
  "Visa/immigration fees covered?",
  "Relocation structure confirmed?",
  "Clawback clause explained?",
  "Allowance gross or net?",
  "Temporary housing included?",
  "Family/dependant flights included?",
  "Start date flexible for visa processing?",
  "Benefit summary confirmed in writing?",
] as const;
const STORAGE_KEY = "gsh-relocation-worksheets-v1";

type Factor = (typeof FACTORS)[number];
type Tab = "scorecard" | "budget" | "negotiation";
type WorksheetState = {
  countryA: string;
  countryB: string;
  scores: Record<Factor, { a: number; b: number }>;
  currency: string;
  budget: Record<string, string>;
  negotiation: Record<string, boolean>;
};

function defaultState(): WorksheetState {
  return {
    countryA: "",
    countryB: "",
    scores: FACTORS.reduce((acc, f) => ({ ...acc, [f]: { a: 3, b: 3 } }), {} as Record<Factor, { a: number; b: number }>),
    currency: "USD",
    budget: BUDGET_ITEMS.reduce((acc, i) => ({ ...acc, [i]: "" }), {} as Record<string, string>),
    negotiation: NEGOTIATION_ITEMS.reduce((acc, i) => ({ ...acc, [i]: false }), {} as Record<string, boolean>),
  };
}

export default function RelocationWorksheetsScreen() {
  const [tab, setTab] = useState<Tab>("scorecard");
  const [state, setState] = useState<WorksheetState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (!active) return;
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as Partial<WorksheetState>;
          setState((prev) => ({
            ...prev,
            ...parsed,
            scores: { ...prev.scores, ...parsed.scores },
            budget: { ...prev.budget, ...parsed.budget },
            negotiation: { ...prev.negotiation, ...parsed.negotiation },
          }));
        } catch {
          /* ignore corrupt local worksheet data */
        }
      }
      setHydrated(true);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [hydrated, state]);

  const totals = useMemo(() => {
    const a = FACTORS.reduce((sum, f) => sum + (state.scores[f]?.a ?? 0), 0);
    const b = FACTORS.reduce((sum, f) => sum + (state.scores[f]?.b ?? 0), 0);
    return { a, b };
  }, [state.scores]);
  const budgetTotal = useMemo(
    () => Object.values(state.budget).reduce((sum, v) => sum + (Number(v) || 0), 0),
    [state.budget]
  );
  const negotiationDone = useMemo(
    () => Object.values(state.negotiation).filter(Boolean).length,
    [state.negotiation]
  );

  const setScore = (factor: Factor, side: "a" | "b", value: number) =>
    setState((s) => ({ ...s, scores: { ...s.scores, [factor]: { ...s.scores[factor], [side]: value } } }));

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <ScrollView contentContainerStyle={styles.pad} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <GshScreenIntro
            eyebrow="Tools"
            title="Relocation worksheets"
            subtitle="Compare destinations, estimate move costs, and track negotiation questions before accepting an offer."
            style={{ marginBottom: 10 }}
          />
          <GshContentAccentBar />

          <View style={styles.tabRow}>
            {[
              ["scorecard", "Scorecard"],
              ["budget", "Budget"],
              ["negotiation", "Questions"],
            ].map(([id, label]) => (
              <Pressable key={id} style={[styles.tab, tab === id && styles.tabOn]} onPress={() => setTab(id as Tab)}>
                <Text style={[styles.tabText, tab === id && styles.tabTextOn]}>{label}</Text>
              </Pressable>
            ))}
          </View>

          {tab === "scorecard" ? (
            <View style={[styles.card, cardSurfaceStyle(true)]}>
              <Text style={styles.cardTitle}>Country scorecard</Text>
              <View style={styles.twoCol}>
                <TextInput
                  style={styles.input}
                  value={state.countryA}
                  onChangeText={(countryA) => setState((s) => ({ ...s, countryA }))}
                  placeholder="Country A"
                  placeholderTextColor={colors.placeholder}
                />
                <TextInput
                  style={styles.input}
                  value={state.countryB}
                  onChangeText={(countryB) => setState((s) => ({ ...s, countryB }))}
                  placeholder="Country B"
                  placeholderTextColor={colors.placeholder}
                />
              </View>
              <View style={styles.scoreTotals}>
                <Text style={styles.scoreTotal}>{state.countryA || "Country A"}: {totals.a}/25</Text>
                <Text style={styles.scoreTotal}>{state.countryB || "Country B"}: {totals.b}/25</Text>
              </View>
              {FACTORS.map((factor) => (
                <View key={factor} style={styles.factorRow}>
                  <Text style={styles.factorLabel}>{factor}</Text>
                  <View style={styles.scoreButtons}>
                    {(["a", "b"] as const).map((side) => (
                      <View key={side} style={styles.scoreSide}>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Pressable
                            key={n}
                            style={[styles.scoreDot, state.scores[factor][side] === n && styles.scoreDotOn]}
                            onPress={() => setScore(factor, side, n)}
                          >
                            <Text style={[styles.scoreDotText, state.scores[factor][side] === n && styles.scoreDotTextOn]}>{n}</Text>
                          </Pressable>
                        ))}
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          ) : null}

          {tab === "budget" ? (
            <View style={[styles.card, cardSurfaceStyle(true)]}>
              <Text style={styles.cardTitle}>Move budget</Text>
              <View style={styles.totalBox}>
                <Text style={styles.totalLabel}>Estimated total</Text>
                <Text style={styles.totalValue}>{state.currency} {budgetTotal.toLocaleString()}</Text>
              </View>
              <TextInput
                style={[styles.input, styles.currencyInput]}
                value={state.currency}
                onChangeText={(currency) => setState((s) => ({ ...s, currency: currency.toUpperCase().slice(0, 3) }))}
                placeholder="Currency"
                placeholderTextColor={colors.placeholder}
                autoCapitalize="characters"
              />
              {BUDGET_ITEMS.map((item) => (
                <View key={item} style={styles.budgetRow}>
                  <Text style={styles.budgetLabel}>{item}</Text>
                  <TextInput
                    style={styles.budgetInput}
                    value={state.budget[item]}
                    onChangeText={(value) => setState((s) => ({ ...s, budget: { ...s.budget, [item]: value.replace(/[^\d.]/g, "") } }))}
                    keyboardType="decimal-pad"
                    placeholder="0"
                    placeholderTextColor={colors.placeholder}
                  />
                </View>
              ))}
            </View>
          ) : null}

          {tab === "negotiation" ? (
            <View style={[styles.card, cardSurfaceStyle(true)]}>
              <Text style={styles.cardTitle}>Negotiation checklist</Text>
              <Text style={styles.progress}>{negotiationDone}/{NEGOTIATION_ITEMS.length} answered</Text>
              {NEGOTIATION_ITEMS.map((item) => (
                <View key={item} style={styles.checkRow}>
                  <Ionicons name={state.negotiation[item] ? "checkmark-circle" : "ellipse-outline"} size={22} color={state.negotiation[item] ? colors.brand : colors.textMuted} />
                  <Text style={styles.checkText}>{item}</Text>
                  <Switch
                    value={state.negotiation[item]}
                    onValueChange={(value) => setState((s) => ({ ...s, negotiation: { ...s.negotiation, [item]: value } }))}
                  />
                </View>
              ))}
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  pad: { ...stackScrollContentStyle, gap: 14, paddingBottom: 40 },
  tabRow: { flexDirection: "row", gap: 8 },
  tab: { flex: 1, borderRadius: radii.pill, paddingVertical: 10, alignItems: "center", backgroundColor: colors.surfaceMuted },
  tabOn: { backgroundColor: colors.brand },
  tabText: { fontSize: 12, fontFamily: fontFamily.bold, color: colors.textSecondary },
  tabTextOn: { color: colors.white },
  card: { padding: 16, borderRadius: radii.lg },
  cardTitle: { fontSize: 18, fontFamily: fontFamily.bold, color: colors.navy, marginBottom: 12 },
  twoCol: { flexDirection: "row", gap: 10 },
  input: { flex: 1, minHeight: 46, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, fontFamily: fontFamily.medium, color: colors.textPrimary },
  scoreTotals: { marginTop: 12, gap: 5 },
  scoreTotal: { fontSize: 13, fontFamily: fontFamily.bold, color: colors.brandDeep },
  factorRow: { marginTop: 16, paddingTop: 14, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  factorLabel: { fontSize: 14, fontFamily: fontFamily.bold, color: colors.navy, marginBottom: 8 },
  scoreButtons: { gap: 8 },
  scoreSide: { flexDirection: "row", gap: 7 },
  scoreDot: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: colors.surfaceMuted },
  scoreDotOn: { backgroundColor: colors.brand },
  scoreDotText: { fontSize: 13, fontFamily: fontFamily.bold, color: colors.textSecondary },
  scoreDotTextOn: { color: colors.white },
  totalBox: { borderRadius: radii.md, padding: 14, backgroundColor: "rgba(14, 205, 209, 0.1)", marginBottom: 12 },
  totalLabel: { fontSize: 12, fontFamily: fontFamily.bold, color: colors.textMuted, textTransform: "uppercase" },
  totalValue: { marginTop: 4, fontSize: 24, fontFamily: fontFamily.extraBold, color: colors.navy },
  currencyInput: { flex: 0, width: 110, marginBottom: 10 },
  budgetRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 9, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  budgetLabel: { flex: 1, fontSize: 14, fontFamily: fontFamily.medium, color: colors.textMarketing },
  budgetInput: { width: 96, minHeight: 40, borderRadius: radii.sm, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 10, fontFamily: fontFamily.medium, color: colors.textPrimary, textAlign: "right" },
  progress: { fontSize: 13, fontFamily: fontFamily.bold, color: colors.brand, marginBottom: 8 },
  checkRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  checkText: { flex: 1, fontSize: 14, fontFamily: fontFamily.medium, color: colors.textMarketing, lineHeight: 20 },
});
