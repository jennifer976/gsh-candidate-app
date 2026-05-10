import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import * as Linking from "expo-linking";
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
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { fetchPartners } from "@/lib/api-client";
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
      <Text style={styles.eyebrow}>Directory</Text>
      <Text style={styles.screenTitle}>Partner firms</Text>
      <Text style={styles.lead}>
        This directory lists partner firms you can contact for relocation and legal help. Your employer partner portal (job posts,
        applicants, billing) lives on the web — not in this candidate app.
      </Text>
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
            keyExtractor={(item: PartnerListItem) => item.userId}
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
                    onPress={() =>
                      void Linking.openURL(item.companyWebsite.startsWith("http") ? item.companyWebsite : `https://${item.companyWebsite}`)
                    }
                    accessibilityRole="link"
                  >
                    <Text style={styles.link}>Website</Text>
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
  eyebrow: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  screenTitle: {
    fontFamily: fontFamily.extraBold,
    fontSize: 26,
    letterSpacing: -0.35,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  lead: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 21,
    marginBottom: 14,
  },
  searchInner: {
    paddingHorizontal: 2,
    paddingVertical: 2,
    backgroundColor: colors.background,
  },
  search: {
    borderRadius: radii.sm,
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
    color: colors.textPrimary,
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
  },
  title: { fontSize: 17, fontFamily: fontFamily.bold, color: colors.textPrimary },
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
