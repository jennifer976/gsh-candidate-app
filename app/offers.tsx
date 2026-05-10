import * as Clipboard from "expo-clipboard";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchCandidateOffers, trackReferralCodeCopy } from "@/lib/api-client";
import { colors } from "@/lib/theme";
import type { CandidateOfferItem } from "@/types/models";

export default function OffersScreen() {
  const query = useQuery({
    queryKey: ["referral-codes", "candidate"],
    queryFn: () => fetchCandidateOffers({ page: 1, perPage: 40 }),
  });

  const track = useMutation({
    mutationFn: (id: string) => trackReferralCodeCopy(id),
  });

  async function copyCode(item: CandidateOfferItem) {
    await Clipboard.setStringAsync(item.referral_code);
    track.mutate(item._id);
    Alert.alert("Copied", `${item.referral_code} copied to clipboard.`);
  }

  const rows = query.data?.data ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <Text style={styles.lead}>Partner perks & discount codes for candidates.</Text>
      <FlatList
        data={rows}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={query.isFetching} onRefresh={() => query.refetch()} />}
        contentContainerStyle={styles.listPad}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.biz}>{item.partner?.businessName || item.businessName || "Partner"}</Text>
            <Text style={styles.body}>{item.description}</Text>
            <View style={styles.codeRow}>
              <Text style={styles.code}>{item.referral_code}</Text>
              <Pressable style={styles.copyBtn} onPress={() => void copyCode(item)}>
                <Text style={styles.copyText}>Copy</Text>
              </Pressable>
            </View>
            {item.expiryDate ? (
              <Text style={styles.exp}>Expires {new Date(item.expiryDate).toLocaleDateString()}</Text>
            ) : null}
          </View>
        )}
        ListEmptyComponent={
          query.isLoading ? null : <Text style={styles.empty}>No public offers right now. Check back soon.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceMuted },
  lead: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, fontSize: 14, color: colors.textMuted, lineHeight: 20 },
  listPad: { paddingHorizontal: 16, paddingBottom: 32 },
  card: {
    backgroundColor: colors.background,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: { fontSize: 17, fontWeight: "700", color: colors.textPrimary },
  biz: { marginTop: 6, fontSize: 14, fontWeight: "600", color: colors.brand },
  body: { marginTop: 10, fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  codeRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 10,
    padding: 12,
  },
  code: { fontSize: 16, fontWeight: "800", color: colors.textPrimary, letterSpacing: 1 },
  copyBtn: { backgroundColor: colors.brand, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  copyText: { color: colors.white, fontWeight: "700", fontSize: 14 },
  exp: { marginTop: 10, fontSize: 12, color: colors.textMuted },
  empty: { textAlign: "center", color: colors.textMuted, marginTop: 40, paddingHorizontal: 24 },
});
