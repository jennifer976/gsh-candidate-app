import * as Clipboard from "expo-clipboard";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchCandidateOffers, trackReferralCodeCopy } from "@/lib/api-client";
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
  safe: { flex: 1, backgroundColor: "#f8fafc" },
  lead: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, fontSize: 14, color: "#64748b", lineHeight: 20 },
  listPad: { paddingHorizontal: 16, paddingBottom: 32 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  title: { fontSize: 17, fontWeight: "700", color: "#0f172a" },
  biz: { marginTop: 6, fontSize: 14, fontWeight: "600", color: "#4f46e5" },
  body: { marginTop: 10, fontSize: 14, color: "#475569", lineHeight: 20 },
  codeRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
    padding: 12,
  },
  code: { fontSize: 16, fontWeight: "800", color: "#0f172a", letterSpacing: 1 },
  copyBtn: { backgroundColor: "#4f46e5", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  copyText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  exp: { marginTop: 10, fontSize: 12, color: "#64748b" },
  empty: { textAlign: "center", color: "#64748b", marginTop: 40, paddingHorizontal: 24 },
});
