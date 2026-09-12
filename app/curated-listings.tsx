import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { Ionicons } from "@expo/vector-icons";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import { CuratedExternalJobCard } from "@/components/CuratedExternalJobCard";
import { GshScreenIntro, GshSectionTitle } from "@/components/gsh-ui-kit";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { fetchPublicExternalJobListings } from "@/lib/api-client";
import { STACK_HEADER_BODY_GAP } from "@/lib/screen-layout";
import {
  cardCuratedSurfaceStyle,
  colors,
  fontFamily,
  radii,
} from "@/lib/theme";

export default function CuratedListingsScreen() {
  const ac = useAccountCopy();

  const router = useRouter();
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [pullRefreshing, setPullRefreshing] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 400);
    return () => clearTimeout(t);
  }, [q]);

  const extInfinite = useInfiniteQuery({
    queryKey: ["external-job-listings", "public", debouncedQ],
    initialPageParam: 1,
    staleTime: 120_000,
    queryFn: ({ pageParam }) =>
      fetchPublicExternalJobListings({
        q: debouncedQ || undefined,
        page: pageParam,
        perPage: 25,
      }),
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((acc, p) => acc + p.data.length, 0);
      return loaded < lastPage.total ? allPages.length + 1 : undefined;
    },
  });

  const rows = useMemo(
    () => extInfinite.data?.pages.flatMap((p) => p.data) ?? [],
    [extInfinite.data],
  );

  const listBootloading = extInfinite.isLoading && !extInfinite.data;
  const activeError = extInfinite.isError;

  const onRefresh = useCallback(() => {
    setPullRefreshing(true);
    void extInfinite.refetch().finally(() => setPullRefreshing(false));
  }, [extInfinite]);

  const onEndReached = useCallback(() => {
    if (extInfinite.hasNextPage && !extInfinite.isFetchingNextPage) {
      void extInfinite.fetchNextPage();
    }
  }, [extInfinite]);

  const emptyBody = listBootloading ? (
    <View style={styles.emptyWrap}>
      <ActivityIndicator size="large" color={colors.brand} />
      <Text style={styles.loadingHint}>{ac("Loading external jobs…")}</Text>
    </View>
  ) : activeError ? (
    <View style={styles.emptyWrap}>
      <Ionicons
        name="cloud-offline-outline"
        size={44}
        color={colors.textMuted}
      />
      <Text style={styles.errTitle}>{ac("Could not load external jobs")}</Text>
      <Text style={styles.errSub}>
        {ac("Check your connection and try again.")}
      </Text>
      <Pressable
        style={styles.retryBtn}
        onPress={() => void extInfinite.refetch()}
        accessibilityRole="button"
      >
        <Text style={styles.retryBtnText}>{ac("Try again")}</Text>
      </Pressable>
    </View>
  ) : rows.length === 0 ? (
    <View style={styles.emptyWrap}>
      <Ionicons name="search-outline" size={44} color={colors.borderStrong} />
      <Text style={styles.empty}>
        {debouncedQ
          ? ac("No jobs match this search. Try other keywords.")
          : ac("No external jobs are available right now.")}
      </Text>
      {debouncedQ ? (
        <Pressable
          style={styles.retryBtn}
          onPress={() => setQ("")}
          accessibilityRole="button"
        >
          <Text style={styles.retryBtnText}>{ac("Clear search")}</Text>
        </Pressable>
      ) : null}
    </View>
  ) : null;

  const footer = extInfinite.hasNextPage ? (
    <View style={styles.extLoadMore}>
      {extInfinite.isFetchingNextPage ? (
        <ActivityIndicator
          size="small"
          color={colors.brand}
          accessibilityLabel={ac("Loading more jobs")}
        />
      ) : null}
    </View>
  ) : null;

  const listHeader = (
    <>
      <View style={styles.listHeadTop}>
        <GshScreenIntro
          eyebrow={ac("Jobs")}
          title={ac("External jobs")}
          subtitle={ac(
            "External jobs come from other sources or are shared by agencies. Open the linked website to apply. They are separate from direct and employer-connected jobs.",
          )}
          style={{ marginBottom: 10 }}
        />
        <View style={styles.accentBar} />
      </View>
      <View style={[styles.intro, cardCuratedSurfaceStyle(false)]}>
        <GshSectionTitle
          title={ac("External jobs")}
          topSpacing="none"
          style={{ marginTop: 0, marginBottom: 8 }}
        />
        <Text style={styles.introBody}>
          {ac(
            "Open a job to review the details. Applications go to the website shown in the listing.",
          )}
        </Text>
      </View>
      <View style={styles.searchOuter}>
        <View style={styles.searchWrap}>
          <Ionicons
            name="search"
            size={20}
            color={colors.placeholder}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.search}
            placeholder={ac("Search external jobs")}
            placeholderTextColor={colors.placeholder}
            value={q}
            onChangeText={setQ}
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel={ac("Search external jobs")}
            returnKeyType="search"
          />
          {q.length > 0 ? (
            <Pressable
              onPress={() => setQ("")}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel={ac("Clear search")}
            >
              <Ionicons
                name="close-circle"
                size={22}
                color={colors.placeholder}
              />
            </Pressable>
          ) : null}
        </View>
      </View>
    </>
  );

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <FlatList
          data={activeError ? [] : rows}
          keyExtractor={(item) => item._id}
          ListHeaderComponent={listHeader}
          ListFooterComponent={footer}
          ListEmptyComponent={emptyBody}
          refreshControl={
            <RefreshControl refreshing={pullRefreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={[
            styles.listPad,
            rows.length === 0 && !listBootloading && styles.listPadGrow,
          ]}
          keyboardShouldPersistTaps="handled"
          onEndReached={onEndReached}
          onEndReachedThreshold={0.35}
          renderItem={({ item }) => (
            <CuratedExternalJobCard
              job={item}
              onPress={() => router.push(`/external-job/${item._id}`)}
            />
          )}
        />
      </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  listHeadTop: {
    paddingHorizontal: 16,
    paddingTop: STACK_HEADER_BODY_GAP,
    marginBottom: 4,
  },
  accentBar: { height: 3, backgroundColor: colors.teal, marginBottom: 8 },
  intro: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: radii.lg,
  },
  introBody: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    lineHeight: 21,
  },
  searchOuter: { paddingHorizontal: 16, paddingVertical: 8 },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.92)",
    paddingHorizontal: 12,
  },
  searchIcon: { marginRight: 4 },
  search: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: fontFamily.regular,
    color: colors.textPrimary,
  },
  listPad: { paddingHorizontal: 16, paddingBottom: 24, gap: 10 },
  listPadGrow: { flexGrow: 1 },
  emptyWrap: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
    gap: 12,
  },
  loadingHint: {
    fontFamily: fontFamily.medium,
    fontSize: 15,
    color: colors.textMuted,
  },
  errTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: 17,
    color: colors.navy,
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
    paddingHorizontal: 20,
    borderRadius: radii.md,
    backgroundColor: colors.brand,
  },
  retryBtnText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    color: colors.white,
  },
  empty: {
    textAlign: "center",
    color: colors.textMuted,
    fontSize: 15,
    fontFamily: fontFamily.regular,
    lineHeight: 22,
  },
  extLoadMore: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
