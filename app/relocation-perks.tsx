import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CompanyLogo } from "@/components/CompanyLogo";
import { GshScreenIntro } from "@/components/gsh-ui-kit";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { fetchRelocationPerks } from "@/lib/api-client";
import { openExternalUrlInApp } from "@/lib/openMarketingBrowser";
import { resolveUploadAssetUrl } from "@/lib/media-url";
import { stackFlatListHeadWrapStyle } from "@/lib/screen-layout";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";
import type { RelocationPerkItem } from "@/types/models";

const CATEGORY_LABELS: Record<string, string> = {
  housing: "Housing",
  moving: "Moving",
  banking: "Banking",
  insurance: "Insurance",
  travel: "Travel",
  settlement: "Settlement",
  other: "Other",
};

function openAffiliate(url: string) {
  const href = url.startsWith("http") ? url : `https://${url}`;
  void openExternalUrlInApp(href).catch(() => Linking.openURL(href));
}

function PerkCard({ item }: { item: RelocationPerkItem }) {
  const logo = resolveUploadAssetUrl(item.logoUrl);
  return (
    <View style={[cardSurfaceStyle(false), styles.card]}>
      <View style={styles.cardTop}>
        <CompanyLogo companyName={item.title} logoUrl={logo || undefined} size={48} radius={radii.md} />
        <View style={styles.cardHeadText}>
          <Text style={styles.category}>
            {CATEGORY_LABELS[item.category || ""] || item.category || "Perk"}
          </Text>
          <Text style={styles.title}>{item.title}</Text>
        </View>
      </View>
      <Text style={styles.body}>{item.description}</Text>
      {item.promoCode ? (
        <Text style={styles.codeLine}>
          Code: <Text style={styles.code}>{item.promoCode}</Text>
        </Text>
      ) : null}
      {item.affiliateUrl?.trim() ? (
        <Pressable
          style={styles.cta}
          onPress={() => openAffiliate(item.affiliateUrl!.trim())}
          accessibilityRole="link"
        >
          <Text style={styles.ctaText}>View offer</Text>
          <Ionicons name="open-outline" size={16} color={colors.white} />
        </Pressable>
      ) : null}
    </View>
  );
}

export default function RelocationPerksScreen() {
  const query = useQuery({
    queryKey: ["relocation-perks", "candidate"],
    queryFn: () => fetchRelocationPerks("candidate"),
  });

  const data = query.data;
  const perks = data?.perks ?? [];
  const comingSoon = data?.comingSoon ?? true;

  const header = (
    <View style={styles.headWrap}>
      <GshScreenIntro
        eyebrow="Relocation"
        title={data?.title || "Relocation perks"}
        subtitle={
          data?.subtitle ||
          "Discounts and trusted services to help you move for work."
        }
      />
      {comingSoon ? (
        <View style={[cardSurfaceStyle(false), styles.soonCard]}>
          <View style={styles.soonIconWrap}>
            <Ionicons name="sparkles" size={28} color={colors.brand} />
          </View>
          <Text style={styles.soonTitle}>Coming soon</Text>
          <Text style={styles.soonBody}>
            We are finalising affiliate partnerships for housing, moving, banking, and more.
            Offers will appear here when they go live.
          </Text>
        </View>
      ) : null}
    </View>
  );

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        {query.isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.brand} />
          </View>
        ) : query.isError ? (
          <View style={styles.center}>
            <Ionicons name="cloud-offline-outline" size={40} color={colors.textMuted} />
            <Text style={styles.errorText}>Relocation perks could not be loaded.</Text>
            <Pressable style={styles.retryBtn} onPress={() => void query.refetch()}>
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </View>
        ) : comingSoon ? (
          <FlatList
            data={[]}
            renderItem={() => null}
            ListHeaderComponent={header}
            contentContainerStyle={styles.listPad}
          />
        ) : (
          <FlatList
            data={perks}
            keyExtractor={(item) => item._id}
            refreshControl={
              <RefreshControl refreshing={query.isFetching} onRefresh={() => query.refetch()} />
            }
            contentContainerStyle={[styles.listPad, perks.length === 0 && styles.listPadEmpty]}
            ListHeaderComponent={header}
            renderItem={({ item }) => <PerkCard item={item} />}
            ListEmptyComponent={
              <View style={[cardSurfaceStyle(false), styles.emptyCard]}>
                <Text style={styles.empty}>No active perks yet. Check back soon.</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  headWrap: stackFlatListHeadWrapStyle,
  listPad: { paddingHorizontal: 16, paddingBottom: 32 },
  listPadEmpty: { flexGrow: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 },
  soonCard: {
    marginTop: 8,
    padding: 20,
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: radii.lg,
  },
  soonIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  soonTitle: {
    marginTop: 14,
    fontSize: 18,
    fontFamily: fontFamily.bold,
    color: colors.navy,
  },
  soonBody: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
    lineHeight: 21,
  },
  card: {
    padding: 16,
    marginBottom: 12,
    backgroundColor: colors.background,
    borderRadius: radii.lg,
  },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  cardHeadText: { flex: 1, minWidth: 0 },
  category: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  title: { marginTop: 4, fontSize: 17, fontFamily: fontFamily.bold, color: colors.navy },
  body: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
    lineHeight: 21,
  },
  codeLine: { marginTop: 10, fontSize: 13, fontFamily: fontFamily.regular, color: colors.textSecondary },
  code: { fontFamily: fontFamily.bold, color: colors.textPrimary },
  cta: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.brand,
    borderRadius: radii.md,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  ctaText: { fontFamily: fontFamily.bold, fontSize: 15, color: colors.white },
  emptyCard: { padding: 24, marginTop: 8, backgroundColor: colors.background },
  empty: { textAlign: "center", fontFamily: fontFamily.regular, color: colors.textMuted, fontSize: 15 },
  errorText: {
    marginTop: 8,
    textAlign: "center",
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    fontSize: 15,
  },
  retryBtn: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: radii.md,
    backgroundColor: colors.brand,
  },
  retryText: { fontFamily: fontFamily.semiBold, fontSize: 15, color: colors.white },
});
