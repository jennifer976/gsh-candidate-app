import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshScreenIntro } from "@/components/gsh-ui-kit";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { fetchPartners } from "@/lib/api-client";
import { openExternalUrlInApp } from "@/lib/openMarketingBrowser";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";
import type { PartnerListItem } from "@/types/models";

export default function PartnersScreen() {
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 400);
    return () => clearTimeout(t);
  }, [q]);

  const query = useQuery({
    queryKey: ["partners", debounced],
    queryFn: () =>
      fetchPartners({
        q: debounced || undefined,
        page: 1,
        perPage: 40,
      }),
  });

  const rows = query.data?.data ?? [];

  const header = (
    <View style={styles.headWrap}>
      <GshScreenIntro
        eyebrow="Directory"
        title="Partner directory"
        subtitle="Firms for visas, relocation, and legal help. Tap a card for details; Company site opens in a sheet inside this app."
        style={{ marginBottom: 14 }}
      />
      <View style={[cardSurfaceStyle(false), styles.searchInner]}>
        <TextInput
          style={styles.search}
          placeholder="Search partners, categories…"
          placeholderTextColor={colors.placeholder}
          value={q}
          onChangeText={setQ}
        />
      </View>
    </View>
  );

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        {query.isLoading ? (
          <>
            {header}
            <View style={styles.center}>
              <ActivityIndicator size="large" color={colors.brand} />
            </View>
          </>
        ) : query.isError ? (
          <>
            {header}
            <View style={styles.errorWrap}>
              <Ionicons name="cloud-offline-outline" size={44} color={colors.textMuted} />
              <Text style={styles.errTitle}>Partners directory could not be loaded</Text>
              <Text style={styles.errSub}>Check your connection and pull down or retry.</Text>
              <Pressable
                style={styles.retryBtn}
                onPress={() => void query.refetch()}
                accessibilityRole="button"
                accessibilityLabel="Retry loading partners"
              >
                <Text style={styles.retryBtnText}>Try again</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <FlatList
            data={rows}
            keyExtractor={(item: PartnerListItem) => String(item._id ?? item.userId ?? item.businessName)}
            refreshControl={<RefreshControl refreshing={query.isFetching} onRefresh={() => query.refetch()} />}
            contentContainerStyle={[styles.listPad, rows.length === 0 && styles.listPadEmpty]}
            ListHeaderComponent={header}
            renderItem={({ item }) => (
              <View style={[cardSurfaceStyle(false), styles.card]}>
                <Text style={styles.title} numberOfLines={2}>
                  {item.businessName}
                </Text>
                <Text style={styles.cat}>{item.category}</Text>
                <Text style={styles.desc} numberOfLines={4}>
                  {item.companyDescription}
                </Text>
                {item.companyWebsite ? (
                  <Pressable
                    onPress={() => {
                      const raw = item.companyWebsite.startsWith("http") ? item.companyWebsite : `https://${item.companyWebsite}`;
                      try {
                        openExternalUrlInApp(raw);
                      } catch {
                        /* invalid URL */
                      }
                    }}
                    accessibilityRole="link"
                  >
                    <Text style={styles.link}>Company site</Text>
                  </Pressable>
                ) : null}
              </View>
            )}
            ListEmptyComponent={
              <View style={[styles.emptyCard, cardSurfaceStyle(false)]}>
                <Text style={styles.empty}>No partners match your search.</Text>
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
  headWrap: { paddingHorizontal: 16, paddingBottom: 12 },
  searchInner: {
    paddingHorizontal: 2,
    paddingVertical: 2,
    backgroundColor: colors.background,
    borderRadius: radii.lg,
  },
  search: {
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: fontFamily.regular,
    color: colors.textPrimary,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
    paddingVertical: 24,
    gap: 10,
  },
  errTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: 17,
    color: colors.navy,
    textAlign: "center",
  },
  errSub: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  retryBtn: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: radii.md,
    backgroundColor: colors.brand,
  },
  retryBtnText: { fontFamily: fontFamily.semiBold, fontSize: 15, color: colors.white },
  listPad: { paddingHorizontal: 16, paddingBottom: 32 },
  listPadEmpty: { flexGrow: 1 },
  card: {
    padding: 16,
    marginBottom: 12,
    backgroundColor: colors.background,
    borderRadius: radii.lg,
  },
  title: { fontSize: 17, fontFamily: fontFamily.bold, color: colors.navy },
  cat: { marginTop: 6, fontSize: 13, fontFamily: fontFamily.semiBold, color: colors.accent },
  desc: { marginTop: 8, fontSize: 14, fontFamily: fontFamily.regular, color: colors.textSecondary, lineHeight: 20 },
  link: { marginTop: 12, fontSize: 15, fontFamily: fontFamily.bold, color: colors.brand },
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
});
