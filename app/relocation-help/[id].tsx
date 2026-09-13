import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { useQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchMyRelocationHelpRequest } from "@/lib/api-client";
import { colors, fontFamily, navHeader, radii } from "@/lib/theme";

export default function RelocationHelpDetailScreen() {
  const ac = useAccountCopy();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const requestId = String(id || "");
  const query = useQuery({
    queryKey: ["phase6", "relocation-help", requestId],
    queryFn: () => fetchMyRelocationHelpRequest(requestId),
    enabled: Boolean(requestId),
    retry: false,
  });

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <Stack.Screen options={{ title: ac("Plan the move"), ...navHeader }} />
      <ScrollView contentContainerStyle={styles.content}>
        {query.isLoading ? <ActivityIndicator color={colors.brand} /> : null}
        <View style={styles.card}>
          <Text style={styles.title}>{ac("Plan the move")}</Text>
          <Text style={styles.copy}>
            {ac(
              "Specialist request tracking is not live on this app yet. Use country guides, worksheets, and mobility partners instead.",
            )}
          </Text>
          <Pressable style={styles.button} onPress={() => router.replace("/relocation-help")} accessibilityRole="button">
            <Text style={styles.buttonText}>{ac("Open planning tools")}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceMuted },
  content: { padding: 16, paddingBottom: 48, gap: 16 },
  card: { padding: 18, borderRadius: radii.lg, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, gap: 10 },
  title: { fontSize: 22, fontFamily: fontFamily.extraBold, color: colors.navy },
  copy: { fontSize: 14, lineHeight: 21, fontFamily: fontFamily.regular, color: colors.textSecondary },
  button: { minHeight: 48, alignItems: "center", justifyContent: "center", borderRadius: radii.pill, backgroundColor: colors.brand, paddingHorizontal: 18 },
  buttonText: { color: colors.white, fontSize: 15, fontFamily: fontFamily.bold },
});
