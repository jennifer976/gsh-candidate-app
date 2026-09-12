import { useAppLanguage } from "@/lib/i18n";
import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { useLayoutEffect, useMemo } from "react";
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
import { candidateBenefitOffers } from "@/lib/benefit-offers";
import {
  RELOCATION_PERKS_FALLBACK_SUBTITLE,
  RELOCATION_PERKS_FALLBACK_TITLE,
  RELOCATION_PERKS_QUERY_KEY,
  useRelocationPerksNav,
} from "@/lib/use-relocation-perks-nav";
import { openExternalUrlInApp } from "@/lib/openMarketingBrowser";
import { resolveUploadAssetUrl } from "@/lib/media-url";
import {
  CANDIDATE_PERK_CATEGORY_ORDER,
  candidatePerkCategoryLabel,
  normalizePerkCategory,
} from "@/lib/perkCategories";
import { stackFlatListHeadWrapStyle } from "@/lib/screen-layout";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";
import type { BenefitOfferView } from "@/types/models";

function openAffiliate(url: string) {
  const href = url.startsWith("http") ? url : `https://${url}`;
  try {
    openExternalUrlInApp(href);
  } catch {
    void Linking.openURL(href);
  }
}

function PerkCard({ item }: { item: BenefitOfferView }) {
  const ac = useAccountCopy();
  const locale = useAppLanguage((s) => s.locale);

  const logo = resolveUploadAssetUrl(item.logoUrl);
  return (
    <View style={[cardSurfaceStyle(false), styles.card]}>
      <View style={styles.cardTop}>
        <CompanyLogo
          companyName={item.title}
          logoUrl={logo || undefined}
          size={48}
          radius={radii.md}
        />
        <View style={styles.cardHeadText}>
          <Text style={styles.category}>
            {ac(candidatePerkCategoryLabel(item.category))}
          </Text>
          <Text style={styles.title}>{item.title}</Text>
        </View>
      </View>
      <Text style={styles.body}>{item.description}</Text>
      {item.disclosure ? (
        <Text style={styles.disclosure}>{item.disclosure}</Text>
      ) : null}
      {item.validUntil ? (
        <Text style={styles.validity}>
          {ac("Valid until")}{" "}
          {new Date(item.validUntil).toLocaleDateString(locale)}
        </Text>
      ) : null}
      {item.redemptionCode ? (
        <Text style={styles.codeLine}>
          {ac("Code:")} <Text style={styles.code}>{item.redemptionCode}</Text>
        </Text>
      ) : null}
      {item.redemptionKind === "external_offer" && item.destinationUrl ? (
        <Pressable
          style={styles.cta}
          onPress={() => openAffiliate(item.destinationUrl!)}
          accessibilityRole="link"
        >
          <Text style={styles.ctaText}>{ac("View offer")}</Text>
          <Ionicons name="open-outline" size={16} color={colors.white} />
        </Pressable>
      ) : null}
      {item.termsUrl ? (
        <Pressable
          onPress={() => openAffiliate(item.termsUrl!)}
          accessibilityRole="link"
        >
          <Text style={styles.terms}>{ac("Read offer terms")}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export default function RelocationPerksScreen() {
  const ac = useAccountCopy();
  const locale = useAppLanguage((s) => s.locale);

  const navigation = useNavigation();
  const query = useQuery({
    queryKey: [...RELOCATION_PERKS_QUERY_KEY],
    queryFn: () => fetchRelocationPerks("candidate"),
  });

  const data = query.data;
  const perks = useMemo(() => {
    const list = candidateBenefitOffers(data);
    const orderIndex = new Map(
      CANDIDATE_PERK_CATEGORY_ORDER.map((key, i) => [key, i]),
    );
    return [...list].sort((a, b) => {
      const aKey = normalizePerkCategory(a.category);
      const bKey = normalizePerkCategory(b.category);
      const aOrder =
        orderIndex.get(
          aKey as (typeof CANDIDATE_PERK_CATEGORY_ORDER)[number],
        ) ?? 99;
      const bOrder =
        orderIndex.get(
          bKey as (typeof CANDIDATE_PERK_CATEGORY_ORDER)[number],
        ) ?? 99;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.title.localeCompare(b.title);
    });
  }, [data]);
  const comingSoon = data?.comingSoon === true;
  const { title: screenTitle, subtitle: screenSubtitle } =
    useRelocationPerksNav();

  useLayoutEffect(() => {
    navigation.setOptions({ title: screenTitle });
  }, [navigation, screenTitle]);

  const header = (
    <View style={styles.headWrap}>
      <GshScreenIntro
        eyebrow={ac("Move")}
        title={screenTitle}
        subtitle={screenSubtitle}
      />
      <Text style={styles.disclosure}>
        {ac(
          "Some links earn Global Sponsor Hub a commission. You buy from the provider under its terms. A link does not always include a discount.",
        )}
      </Text>
      {comingSoon ? (
        <View style={[cardSurfaceStyle(false), styles.soonCard]}>
          <View style={styles.soonIconWrap}>
            <Ionicons name="sparkles" size={28} color={colors.brand} />
          </View>
          <Text style={styles.soonTitle}>{ac("Offers unavailable")}</Text>
          <Text style={styles.soonBody}>
            {ac("No offers are available right now. Check back later.")}
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
            <Ionicons
              name="cloud-offline-outline"
              size={40}
              color={colors.textMuted}
            />
            <Text style={styles.errorText}>
              {ac("Offers could not be loaded.")}
            </Text>
            <Pressable
              style={styles.retryBtn}
              onPress={() => void query.refetch()}
            >
              <Text style={styles.retryText}>{ac("Try again")}</Text>
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
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={query.isFetching}
                onRefresh={() => query.refetch()}
              />
            }
            contentContainerStyle={[
              styles.listPad,
              perks.length === 0 && styles.listPadEmpty,
            ]}
            ListHeaderComponent={header}
            renderItem={({ item }) => <PerkCard item={item} />}
            ListEmptyComponent={
              <View style={[cardSurfaceStyle(false), styles.emptyCard]}>
                <Text style={styles.empty}>
                  {ac("No offers are available right now. Check back later.")}
                </Text>
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
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
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
  title: {
    marginTop: 4,
    fontSize: 17,
    fontFamily: fontFamily.heading,
    color: colors.navy,
  },
  body: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
    lineHeight: 21,
  },
  disclosure: {
    marginTop: 10,
    padding: 10,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceMuted,
    fontSize: 12,
    lineHeight: 17,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
  },
  validity: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: fontFamily.semiBold,
    color: colors.textSecondary,
  },
  codeLine: {
    marginTop: 10,
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
  },
  code: { fontFamily: fontFamily.bold, color: colors.textPrimary },
  cta: {
    minHeight: 48,
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.brand,
    borderRadius: 99,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  ctaText: { fontFamily: fontFamily.bold, fontSize: 15, color: colors.white },
  terms: {
    marginTop: 11,
    textAlign: "center",
    textDecorationLine: "underline",
    fontSize: 12,
    fontFamily: fontFamily.semiBold,
    color: colors.brandDeep,
  },
  emptyCard: { padding: 24, marginTop: 8, backgroundColor: colors.background },
  empty: {
    textAlign: "center",
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    fontSize: 15,
  },
  errorText: {
    marginTop: 8,
    textAlign: "center",
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    fontSize: 15,
  },
  retryBtn: {
    minHeight: 48,
    justifyContent: "center",
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 99,
    backgroundColor: colors.brand,
  },
  retryText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    color: colors.white,
  },
});
