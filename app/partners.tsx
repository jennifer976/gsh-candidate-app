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
import { fetchPartners } from "@/lib/api-client";
import { colors } from "@/lib/theme";
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

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.search}
          placeholder="Search partners, categories…"
          placeholderTextColor={colors.placeholder}
          value={q}
          onChangeText={setQ}
        />
      </View>
      {query.isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.brand} />
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item: PartnerListItem) => item.userId}
          refreshControl={<RefreshControl refreshing={query.isFetching} onRefresh={() => query.refetch()} />}
          contentContainerStyle={styles.listPad}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.title} numberOfLines={2}>
                {item.businessName}
              </Text>
              <Text style={styles.cat}>{item.category}</Text>
              <Text style={styles.desc} numberOfLines={4}>
                {item.companyDescription}
              </Text>
              {item.companyWebsite ? (
                <Pressable onPress={() => void Linking.openURL(item.companyWebsite.startsWith("http") ? item.companyWebsite : `https://${item.companyWebsite}`)}>
                  <Text style={styles.link}>Website</Text>
                </Pressable>
              ) : null}
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No partners match your search.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceMuted },
  searchWrap: { paddingHorizontal: 16, paddingVertical: 12 },
  search: {
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textPrimary,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
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
  cat: { marginTop: 6, fontSize: 13, fontWeight: "600", color: colors.accent },
  desc: { marginTop: 8, fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  link: { marginTop: 10, fontSize: 15, fontWeight: "700", color: colors.brand },
  empty: { textAlign: "center", color: colors.textMuted, marginTop: 40 },
});
