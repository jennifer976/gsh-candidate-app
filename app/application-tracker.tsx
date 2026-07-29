import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshDarkFeedHeading } from "@/components/GshDarkFeedHeading";
import { GshScreenShell } from "@/components/GshScreenShell";
import {
  createTrackedApplication,
  deleteTrackedApplication,
  fetchTrackedApplications,
  patchTrackedApplication,
} from "@/lib/api-client";
import { stackScrollContentStyle } from "@/lib/screen-layout";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";
import type { CandidateTrackedApplication, TrackedApplicationStage } from "@/types/models";

const STAGES: TrackedApplicationStage[] = ["interested", "applied", "screen", "interview", "offer", "closed"];

export default function ApplicationTrackerScreen() {
  const client = useQueryClient();
  const [companyName, setCompanyName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [destination, setDestination] = useState("");
  const query = useQuery({ queryKey: ["candidate-tools", "tracked-applications"], queryFn: fetchTrackedApplications });
  const invalidate = () => client.invalidateQueries({ queryKey: ["candidate-tools", "tracked-applications"] });
  const create = useMutation({
    mutationFn: createTrackedApplication,
    onSuccess: () => {
      setCompanyName("");
      setRoleTitle("");
      setDestination("");
      void invalidate();
    },
    onError: (error: { message?: string }) => Alert.alert("Could not add application", error.message || "Try again."),
  });
  const update = useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: TrackedApplicationStage }) => patchTrackedApplication(id, { stage }),
    onSuccess: invalidate,
  });
  const remove = useMutation({ mutationFn: deleteTrackedApplication, onSuccess: invalidate });

  const nextStage = (item: CandidateTrackedApplication) => {
    const index = STAGES.indexOf(item.stage);
    update.mutate({ id: item._id, stage: STAGES[(index + 1) % STAGES.length] });
  };

  return (
    <GshScreenShell>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <ScrollView contentContainerStyle={styles.pad} keyboardShouldPersistTaps="handled">
          <GshDarkFeedHeading pageLead title="Application tracker" subtitle="A private workspace synced to your GSH account." />
          <View style={[styles.card, cardSurfaceStyle(false)]}>
            <Text style={styles.cardTitle}>Add an opportunity</Text>
            <TextInput style={styles.input} value={companyName} onChangeText={setCompanyName} placeholder="Company" placeholderTextColor={colors.placeholder} />
            <TextInput style={styles.input} value={roleTitle} onChangeText={setRoleTitle} placeholder="Role title" placeholderTextColor={colors.placeholder} />
            <TextInput style={styles.input} value={destination} onChangeText={setDestination} placeholder="Destination (optional)" placeholderTextColor={colors.placeholder} />
            <Pressable
              style={[styles.primary, (!companyName.trim() || !roleTitle.trim() || create.isPending) && styles.disabled]}
              disabled={!companyName.trim() || !roleTitle.trim() || create.isPending}
              onPress={() => create.mutate({ companyName: companyName.trim(), roleTitle: roleTitle.trim(), destination: destination.trim() })}
            >
              <Text style={styles.primaryText}>{create.isPending ? "Adding…" : "Add to tracker"}</Text>
            </Pressable>
          </View>

          {query.isLoading ? <ActivityIndicator color={colors.brand} /> : null}
          {query.isError ? (
            <View style={[styles.card, cardSurfaceStyle(false)]}>
              <Text style={styles.error}>The tracker could not be loaded. Sign in and try again.</Text>
              <Pressable onPress={() => void query.refetch()}><Text style={styles.link}>Try again</Text></Pressable>
            </View>
          ) : null}
          {query.data?.data.map((item) => (
            <View key={item._id} style={[styles.card, cardSurfaceStyle(false)]}>
              <View style={styles.row}>
                <View style={styles.grow}>
                  <Text style={styles.itemTitle}>{item.roleTitle}</Text>
                  <Text style={styles.meta}>{item.companyName}{item.destination ? ` · ${item.destination}` : ""}</Text>
                </View>
                <Pressable onPress={() => remove.mutate(item._id)} hitSlop={10} accessibilityLabel={`Delete ${item.roleTitle}`}>
                  <Ionicons name="trash-outline" size={20} color={colors.textMuted} />
                </Pressable>
              </View>
              <Pressable style={styles.stage} onPress={() => nextStage(item)}>
                <Text style={styles.stageText}>Stage: {item.stage} · tap to advance</Text>
              </Pressable>
            </View>
          ))}
          {!query.isLoading && !query.isError && query.data?.data.length === 0 ? (
            <Text style={styles.empty}>No tracked applications yet.</Text>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </GshScreenShell>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  pad: { ...stackScrollContentStyle, gap: 12 },
  card: { padding: 16, borderRadius: radii.lg, backgroundColor: colors.background, gap: 10 },
  cardTitle: { fontFamily: fontFamily.bold, fontSize: 17, color: colors.navy },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, padding: 12, color: colors.textPrimary, fontFamily: fontFamily.regular, backgroundColor: colors.white },
  primary: { backgroundColor: colors.brand, borderRadius: radii.pill, padding: 13, alignItems: "center" },
  disabled: { opacity: 0.45 },
  primaryText: { color: colors.white, fontFamily: fontFamily.bold },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  grow: { flex: 1 },
  itemTitle: { fontFamily: fontFamily.bold, color: colors.navy, fontSize: 16 },
  meta: { marginTop: 4, fontFamily: fontFamily.regular, color: colors.textSecondary, fontSize: 13 },
  stage: { alignSelf: "flex-start", borderRadius: radii.pill, backgroundColor: colors.brandSoft, paddingHorizontal: 10, paddingVertical: 7 },
  stageText: { color: colors.brandDeep, fontFamily: fontFamily.semiBold, fontSize: 12, textTransform: "capitalize" },
  error: { color: colors.textSecondary, fontFamily: fontFamily.regular },
  link: { color: colors.brand, fontFamily: fontFamily.bold },
  empty: { color: "rgba(255,255,255,0.65)", textAlign: "center", fontFamily: fontFamily.regular, padding: 20 },
});
