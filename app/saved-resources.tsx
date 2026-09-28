import { withSignIn } from "@/components/SignInGate";
import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import {
  deleteCandidateResourceSave,
  fetchCandidateResourceSaves,
} from "@/lib/api-client";
import { getMarketingSiteUrl } from "@/lib/config";
import { openExternalUrlInApp } from "@/lib/openMarketingBrowser";
import {
  colors,
  feedCardStyle,
  fontFamily,
  navHeader,
  radii,
} from "@/lib/theme";

function SavedResourcesScreen() {
  const ac = useAccountCopy();

  const router = useRouter();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["candidate", "resource-saves"],
    queryFn: fetchCandidateResourceSaves,
  });
  const remove = useMutation({
    mutationFn: deleteCandidateResourceSave,
    onSuccess: () =>
      void queryClient.invalidateQueries({
        queryKey: ["candidate", "resource-saves"],
      }),
    onError: (error: unknown) =>
      Alert.alert(
        ac("Could not remove resource"),
        ac("Please try again."),
      ),
  });

  return (
    <GshScreenBackground>
      <Stack.Screen options={{ title: ac("Saved resources"), ...navHeader }} />
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        {query.isLoading ? (
          <ActivityIndicator style={styles.loading} color={colors.brand} />
        ) : query.isError ? (
          <View style={styles.center}>
            <Text style={styles.error}>
              {ac("Could not load saved resources.")}
            </Text>
            <Pressable onPress={() => void query.refetch()}>
              <Text style={styles.retry}>{ac("Try again")}</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={query.data?.data ?? []}
            keyExtractor={(item) => item.id ?? item._id}
            contentContainerStyle={styles.list}
            ListHeaderComponent={
              <View style={styles.header}>
                <Text style={styles.eyebrow}>{ac("Your shortlist")}</Text>
                <Text style={styles.heading}>{ac("Saved resources")}</Text>
                <Text style={styles.lead}>
                  {ac(
                    "Your saved guides and resources, ready when you need them.",
                  )}
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={[styles.card, feedCardStyle()]}>
                <Pressable
                  style={styles.main}
                  onPress={() =>
                    openExternalUrlInApp(
                      `${getMarketingSiteUrl()}/resources/${encodeURIComponent(item.resourceSlug)}`,
                    )
                  }
                >
                  <Ionicons
                    name="document-text-outline"
                    size={22}
                    color={colors.brand}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.meta}>{ac("Open guide")}</Text>
                  </View>
                  <Ionicons
                    name="open-outline"
                    size={18}
                    color={colors.textMuted}
                  />
                </Pressable>
                <Pressable
                  style={styles.remove}
                  onPress={() => remove.mutate(item.id ?? item._id)}
                  disabled={remove.isPending}
                >
                  <Text style={styles.removeText}>{ac("Remove")}</Text>
                </Pressable>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.center}>
                <Ionicons
                  name="bookmark-outline"
                  size={44}
                  color={colors.borderStrong}
                />
                <Text style={styles.empty}>
                  {ac("No saved resources yet.")}
                </Text>
                <Pressable
                  style={styles.browse}
                  onPress={() => router.push("/resources")}
                >
                  <Text style={styles.browseText}>
                    {ac("Browse resources")}
                  </Text>
                </Pressable>
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
  loading: { marginTop: 50 },
  list: { padding: 16, paddingBottom: 42, gap: 11 },
  header: { marginBottom: 12 },
  eyebrow: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: colors.accent,
    textTransform: "lowercase",
    letterSpacing: 0.8,
  },
  heading: {
    marginTop: 5,
    fontSize: 25,
    fontFamily: fontFamily.heading,
    color: colors.navy,
  },
  lead: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
  },
  card: { borderRadius: radii.lg, overflow: "hidden" },
  main: { flexDirection: "row", alignItems: "center", gap: 11, padding: 14 },
  title: { fontSize: 15, fontFamily: fontFamily.heading, color: colors.navy },
  meta: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
  },
  remove: {
    alignItems: "center",
    padding: 11,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  removeText: {
    fontSize: 13,
    fontFamily: fontFamily.semiBold,
    color: colors.error,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    gap: 12,
  },
  error: {
    textAlign: "center",
    fontFamily: fontFamily.medium,
    color: colors.navy,
  },
  retry: { fontFamily: fontFamily.bold, color: colors.teal },
  empty: {
    textAlign: "center",
    fontFamily: fontFamily.medium,
    color: colors.navy,
  },
  browse: {
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: radii.pill,
    backgroundColor: colors.brand,
  },
  browseText: { fontFamily: fontFamily.bold, color: colors.white },
});

export default withSignIn(SavedResourcesScreen, {
  icon: "bookmark-outline",
  title: "Saved resources",
  body: "Sign in to keep the templates and checklists you want to come back to.",
});
