import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshDarkFeedHeading } from "@/components/GshDarkFeedHeading";
import { GshScreenShell } from "@/components/GshScreenShell";
import { fetchPublicSponsorCompanies } from "@/lib/api-client";
import { stackFlatListHeadWrapStyle } from "@/lib/screen-layout";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";
import type { SponsorCompany } from "@/types/models";

export default function CompaniesScreen() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  useEffect(() => {
    const timeout = setTimeout(() => setSearch(q.trim()), 350);
    return () => clearTimeout(timeout);
  }, [q]);
  const query = useQuery({
    queryKey: ["sponsor-companies", search],
    queryFn: () => fetchPublicSponsorCompanies({ q: search || undefined, page: 1, perPage: 50 }),
  });
  const rows = query.data?.data ?? [];
  const header = (
    <View style={styles.head}>
      <GshDarkFeedHeading pageLead title="Company directory" subtitle="Search public sponsor-register records and verify against the listed official source." />
      <TextInput style={styles.search} value={q} onChangeText={setQ} placeholder="Search company name…" placeholderTextColor={colors.placeholder} />
    </View>
  );
  return (
    <GshScreenShell>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        {query.isLoading ? <><>{header}</><ActivityIndicator style={styles.loading} color={colors.brand} /></> : (
          <FlatList
            data={rows}
            keyExtractor={(item: SponsorCompany) => item.slug}
            contentContainerStyle={styles.list}
            ListHeaderComponent={header}
            refreshControl={<RefreshControl refreshing={query.isFetching} onRefresh={() => query.refetch()} />}
            renderItem={({ item }) => (
              <Pressable style={[styles.card, cardSurfaceStyle(false)]} onPress={() => router.push(`/company/${encodeURIComponent(item.slug)}`)}>
                <Text style={styles.title}>{item.companyName}</Text>
                <Text style={styles.meta}>{[item.city, item.country, item.visaRoute].filter(Boolean).join(" · ") || "Sponsor-register record"}</Text>
                <Text style={styles.status}>{item.sponsorStatus || "Listed"} · View source details</Text>
              </Pressable>
            )}
            ListEmptyComponent={<Text style={styles.empty}>{query.isError ? "Company directory could not be loaded." : "No companies match this search."}</Text>}
          />
        )}
      </SafeAreaView>
    </GshScreenShell>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  head: { ...stackFlatListHeadWrapStyle, gap: 14 },
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  loading: { marginTop: 40 },
  search: { backgroundColor: colors.white, color: colors.textPrimary, borderRadius: radii.md, padding: 13, fontFamily: fontFamily.regular },
  card: { padding: 16, borderRadius: radii.lg, marginBottom: 12, backgroundColor: colors.background },
  title: { color: colors.navy, fontFamily: fontFamily.bold, fontSize: 16 },
  meta: { color: colors.textSecondary, fontFamily: fontFamily.regular, fontSize: 13, marginTop: 6 },
  status: { color: colors.teal, fontFamily: fontFamily.semiBold, fontSize: 12, marginTop: 10 },
  empty: { color: colors.white, fontFamily: fontFamily.regular, textAlign: "center", padding: 30 },
});
