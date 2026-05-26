import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshGradientPrimaryButton } from "@/components/GshGradientPrimaryButton";
import { GshContentAccentBar, GshLinkRow, GshScreenIntro } from "@/components/gsh-ui-kit";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import {
  convertAmount,
  CURRENCY_CODES,
  fetchLiveRatesToUsd,
  RATES_TO_USD,
} from "@/lib/currency/converterRates";
import { stackScrollContentStyle } from "@/lib/screen-layout";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";

type PickerTarget = "from" | "to" | null;

export default function CurrencyConverterScreen() {
  const router = useRouter();
  const [amount, setAmount] = useState("50000");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("GBP");
  const [rates, setRates] = useState<Record<string, number>>(RATES_TO_USD);
  const [lastUpdated, setLastUpdated] = useState("");
  const [liveError, setLiveError] = useState("");
  const [picker, setPicker] = useState<PickerTarget>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      const result = await fetchLiveRatesToUsd(CURRENCY_CODES);
      if (!active) return;
      if ("error" in result) {
        setLiveError("Using fallback rates at the moment.");
        return;
      }
      setRates((prev) => ({ ...prev, ...result.rates }));
      setLiveError("");
      setLastUpdated(result.updatedLabel);
    })();
    return () => {
      active = false;
    };
  }, []);

  const amountNum = useMemo(() => {
    const n = Number(amount);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }, [amount]);

  const converted = useMemo(() => convertAmount(amountNum, from, to, rates), [amountNum, from, to, rates]);

  const pickerValue = picker === "from" ? from : picker === "to" ? to : from;

  const swapCurrencies = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <ScrollView contentContainerStyle={styles.pad} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <GshScreenIntro
            eyebrow="Tools"
            title="Salary & currency converter"
            subtitle="Compare headline salaries across currencies when you are shortlisting countries — same tool as on the website, built for the app."
            style={{ marginBottom: 10 }}
          />
          <GshContentAccentBar />

          <View style={[styles.card, cardSurfaceStyle(true)]}>
            <Text style={styles.label}>Amount</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              accessibilityLabel="Amount"
            />

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>From</Text>
                <Pressable style={styles.select} onPress={() => setPicker("from")} accessibilityRole="button">
                  <Text style={styles.selectText}>{from}</Text>
                  <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
                </Pressable>
              </View>

              <Pressable
                style={styles.swapBtn}
                onPress={swapCurrencies}
                accessibilityRole="button"
                accessibilityLabel="Swap currencies"
              >
                <Ionicons name="swap-horizontal" size={22} color={colors.brand} />
              </Pressable>

              <View style={styles.col}>
                <Text style={styles.label}>To</Text>
                <Pressable style={styles.select} onPress={() => setPicker("to")} accessibilityRole="button">
                  <Text style={styles.selectText}>{to}</Text>
                  <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
                </Pressable>
              </View>
            </View>

            <Text style={styles.resultLabel}>Converted amount</Text>
            <Text style={styles.result} accessibilityLabel={`Converted amount ${converted} ${to}`}>
              {converted.toLocaleString(undefined, { maximumFractionDigits: 2 })} {to}
            </Text>

            <Text style={styles.meta}>
              {liveError || (lastUpdated ? `Live rates updated: ${lastUpdated}` : "Waiting for live rate update…")}
            </Text>
          </View>

          <GshGradientPrimaryButton title="Browse jobs" onPress={() => router.push("/(tabs)/jobs")} containerStyle={{ marginBottom: 12 }} />
          <GshLinkRow
            title="Compare countries"
            subtitle="Shortlist destinations before you apply"
            icon="git-compare-outline"
            accent="teal"
            onPress={() => router.push("/compare-countries")}
          />
          <GshLinkRow
            title="Visa route wizard"
            subtitle="Orientation for your destination"
            icon="sparkles-outline"
            accent="purple"
            onPress={() => router.push("/visa-wizard")}
          />
        </ScrollView>

        <Modal visible={picker !== null} animationType="slide" transparent onRequestClose={() => setPicker(null)}>
          <View style={styles.modalRoot}>
            <Pressable style={styles.modalBackdrop} onPress={() => setPicker(null)} accessibilityRole="button" accessibilityLabel="Close" />
            <View style={[styles.modalSheet, cardSurfaceStyle(true)]}>
              <Text style={styles.modalTitle}>Select currency</Text>
              <FlatList
                data={CURRENCY_CODES}
                keyExtractor={(c) => c}
                renderItem={({ item }) => (
                  <Pressable
                    style={styles.modalRow}
                    onPress={() => {
                      if (picker === "from") setFrom(item);
                      if (picker === "to") setTo(item);
                      setPicker(null);
                    }}
                    accessibilityRole="button"
                  >
                    <Text style={[styles.modalRowText, item === pickerValue && styles.modalRowActive]}>{item}</Text>
                  </Pressable>
                )}
              />
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  pad: { ...stackScrollContentStyle, paddingBottom: 40, gap: 12 },
  card: { padding: 18, borderRadius: radii.lg },
  label: { fontFamily: fontFamily.semiBold, fontSize: 13, color: colors.navy, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: fontFamily.regular,
    fontSize: 16,
    color: colors.navy,
    marginBottom: 14,
  },
  row: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  col: { flex: 1 },
  swapBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(97, 10, 144, 0.08)",
    marginBottom: 2,
  },
  select: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  selectText: { fontFamily: fontFamily.semiBold, fontSize: 15, color: colors.navy },
  resultLabel: { marginTop: 16, fontFamily: fontFamily.semiBold, fontSize: 13, color: colors.textMuted },
  result: { marginTop: 6, fontFamily: fontFamily.extraBold, fontSize: 28, color: colors.navy },
  meta: { marginTop: 12, fontFamily: fontFamily.regular, fontSize: 12, color: colors.textMuted, lineHeight: 18 },
  modalRoot: { flex: 1, justifyContent: "flex-end" },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(15,23,42,0.45)" },
  modalSheet: { maxHeight: "55%", borderTopLeftRadius: radii.lg, borderTopRightRadius: radii.lg, padding: 16 },
  modalTitle: { fontFamily: fontFamily.bold, fontSize: 16, color: colors.navy, marginBottom: 8 },
  modalRow: { paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  modalRowText: { fontFamily: fontFamily.regular, fontSize: 16, color: colors.navy },
  modalRowActive: { color: colors.brand, fontFamily: fontFamily.semiBold },
});
