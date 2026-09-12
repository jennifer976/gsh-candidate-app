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
import { CompanyLogo } from "@/components/CompanyLogo";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { deleteEmployerFollow, fetchEmployerFollows } from "@/lib/api-client";
import {
  colors,
  feedCardStyle,
  fontFamily,
  navHeader,
  radii,
} from "@/lib/theme";

export default function EmployerFollowsScreen() {
  const ac = useAccountCopy();

  const router = useRouter();
  const queryClient = useQueryClient();
  const follows = useQuery({
    queryKey: ["candidate", "employer-follows"],
    queryFn: fetchEmployerFollows,
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteEmployerFollow(id),
    onSuccess: () =>
      void queryClient.invalidateQueries({
        queryKey: ["candidate", "employer-follows"],
      }),
    onError: (error: unknown) =>
      Alert.alert(
        ac("Could not unfollow"),
        ac("Please try again."),
      ),
  });

  return (
    <GshScreenBackground>
      <Stack.Screen
        options={{ title: ac("Followed employers"), ...navHeader }}
      />
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        {follows.isLoading ? (
          <ActivityIndicator style={styles.loading} color={colors.brand} />
        ) : follows.isError ? (
          <View style={styles.center}>
            <Text style={styles.error}>
              {ac("Could not load followed employers.")}
            </Text>
            <Pressable onPress={() => void follows.refetch()}>
              <Text style={styles.retry}>{ac("Try again")}</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={follows.data ?? []}
            keyExtractor={(item) => item.id ?? item._id}
            contentContainerStyle={styles.list}
            ListHeaderComponent={
              <View style={styles.header}>
                <Text style={styles.eyebrow}>{ac("Role alerts")}</Text>
                <Text style={styles.heading}>{ac("Employers you follow")}</Text>
                <Text style={styles.lead}>
                  {ac(
                    "Follow this employer to hear about new jobs. This does not share your contact details.",
                  )}
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={[styles.card, feedCardStyle()]}>
                <Pressable
                  style={styles.company}
                  onPress={() =>
                    router.push(
                      `/company/employer/${encodeURIComponent(item.employerUserId)}`,
                    )
                  }
                >
                  <CompanyLogo
                    logoUrl={item.employer?.companyLogo ?? undefined}
                    companyName={item.employer?.companyName ?? "Employer"}
                    size={44}
                    radius={11}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.companyName}>
                      {item.employer?.companyName ?? "Employer"}
                    </Text>
                    <Text style={styles.companyMeta}>{ac("Following")}</Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={colors.textMuted}
                  />
                </Pressable>
                <Pressable
                  style={styles.remove}
                  onPress={() => remove.mutate(item.id ?? item._id)}
                  disabled={remove.isPending}
                >
                  <Text style={styles.removeText}>{ac("Unfollow")}</Text>
                </Pressable>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.center}>
                <Ionicons
                  name="notifications-outline"
                  size={44}
                  color={colors.borderStrong}
                />
                <Text style={styles.empty}>
                  {ac("You are not following any employers yet.")}
                </Text>
                <Pressable
                  style={styles.browse}
                  onPress={() => router.push("/companies")}
                >
                  <Text style={styles.browseText}>
                    {ac("Browse employers")}
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
  company: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  companyName: {
    fontSize: 15,
    fontFamily: fontFamily.bold,
    color: colors.navy,
  },
  companyMeta: {
    marginTop: 3,
    fontSize: 12,
    fontFamily: fontFamily.medium,
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
    lineHeight: 20,
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
