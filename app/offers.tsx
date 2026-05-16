import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshScreenIntro } from "@/components/gsh-ui-kit";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { fetchCandidateOffers, trackReferralCodeCopy } from "@/lib/api-client";
import { stackFlatListHeadWrapStyle } from "@/lib/screen-layout";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";
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

  const header = (
    <View style={styles.headWrap}>
      <GshScreenIntro eyebrow="Perks" title="Offers & codes" subtitle="Partner perks and discount codes for candidates." />
    </View>
  );

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <FlatList
          data={rows}
          keyExtractor={(item) => item._id}
          refreshControl={<RefreshControl refreshing={query.isFetching} onRefresh={() => query.refetch()} />}
          contentContainerStyle={[styles.listPad, rows.length === 0 && styles.listPadEmpty]}
          ListHeaderComponent={header}
          renderItem={({ item }) => (
            <View style={[cardSurfaceStyle(false), styles.card]}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.biz}>{item.partner?.businessName || item.businessName || "Partner"}</Text>
              <Text style={styles.body}>{item.description}</Text>
              <View style={styles.codeRow}>
                <Text style={styles.code}>{item.referral_code}</Text>
                <Pressable style={styles.copyBtn} onPress={() => void copyCode(item)} accessibilityRole="button">
                  <Text style={styles.copyText}>Copy</Text>
                </Pressable>
              </View>
              {item.expiryDate ? (
                <Text style={styles.exp}>Expires {new Date(item.expiryDate).toLocaleDateString()}</Text>
              ) : null}
            </View>
          )}
          ListEmptyComponent={
            query.isLoading ? (
              <ActivityIndicator style={{ marginVertical: 48 }} color={colors.brand} accessibilityLabel="Loading offers" />
            ) : query.isError ? (
              <View style={[styles.emptyCard, cardSurfaceStyle(false)]}>
                <Ionicons name="cloud-offline-outline" size={40} color={colors.textMuted} style={{ alignSelf: "center" }} />
                <Text style={[styles.empty, { marginTop: 12 }]}>Offers could not be loaded.</Text>
                <Pressable
                  style={styles.retryBtn}
                  onPress={() => void query.refetch()}
                  accessibilityRole="button"
                  accessibilityLabel="Retry loading offers"
                >
                  <Text style={styles.retryBtnText}>Try again</Text>
                </Pressable>
              </View>
            ) : (
              <View style={[styles.emptyCard, cardSurfaceStyle(false)]}>
                <Text style={styles.empty}>No public offers right now. Check back soon.</Text>
              </View>
            )
          }
        />
      </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  headWrap: stackFlatListHeadWrapStyle,
  listPad: { paddingHorizontal: 16, paddingBottom: 32 },
  listPadEmpty: { flexGrow: 1 },
  card: {
    padding: 16,
    marginBottom: 12,
    backgroundColor: colors.background,
    borderRadius: radii.lg,
  },
  title: { fontSize: 17, fontFamily: fontFamily.bold, color: colors.navy },
  biz: { marginTop: 6, fontSize: 14, fontFamily: fontFamily.semiBold, color: colors.brand },
  body: { marginTop: 10, fontSize: 14, fontFamily: fontFamily.regular, color: colors.textSecondary, lineHeight: 21 },
  codeRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.sm,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  code: {
    fontSize: 16,
    fontFamily: fontFamily.extraBold,
    color: colors.textPrimary,
    letterSpacing: 1,
    flex: 1,
  },
  copyBtn: {
    backgroundColor: colors.brand,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.sm,
  },
  copyText: { color: colors.white, fontFamily: fontFamily.bold, fontSize: 14 },
  exp: { marginTop: 10, fontSize: 12, fontFamily: fontFamily.regular, color: colors.textMuted },
  emptyCard: {
    paddingVertical: 28,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: colors.background,
  },
  empty: {
    textAlign: "center",
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  retryBtn: {
    marginTop: 16,
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: radii.md,
    backgroundColor: colors.brand,
  },
  retryBtnText: { fontFamily: fontFamily.semiBold, fontSize: 15, color: colors.white },
});
