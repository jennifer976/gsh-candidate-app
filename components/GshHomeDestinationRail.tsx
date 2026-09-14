import { Image, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { GshPressable } from "@/components/GshPressable";
import { colors, fontFamily, radii } from "@/lib/theme";

const DESTINATIONS = [
  {
    label: "United Kingdom",
    short: "UK",
    location: "United Kingdom",
    uri: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=75",
  },
  {
    label: "Canada",
    short: "Canada",
    location: "Canada",
    uri: "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=800&q=75",
  },
  {
    label: "United Arab Emirates",
    short: "UAE",
    location: "United Arab Emirates",
    uri: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=75",
  },
  {
    label: "Germany",
    short: "Germany",
    location: "Germany",
    uri: "https://images.unsplash.com/photo-1599946347371-68eb71b16afc?auto=format&fit=crop&w=800&q=75",
  },
  {
    label: "Ireland",
    short: "Ireland",
    location: "Ireland",
    uri: "https://images.unsplash.com/photo-1590089415225-401ed6f9db8e?auto=format&fit=crop&w=800&q=75",
  },
] as const;

/**
 * Airbnb-style destination discovery cards.
 * Photos earn the space because they are the action (open Jobs filtered by country).
 */
export function GshHomeDestinationRail() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const cardW = Math.min(168, Math.max(148, width * 0.4));
  const cardH = Math.round(cardW * 1.22);

  return (
    <View>
      <View style={styles.headingRow}>
        <Text style={styles.heading}>Where next?</Text>
        <Text style={styles.headingHint}>Tap a place</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rail}
        decelerationRate="fast"
        snapToInterval={cardW + 12}
      >
        {DESTINATIONS.map((d) => (
          <GshPressable
            key={d.short}
            style={[styles.card, { width: cardW, height: cardH }]}
            onPress={() =>
              router.push({
                pathname: "/(tabs)/jobs",
                params: { location: d.location },
              })
            }
            accessibilityRole="button"
            accessibilityLabel={`Browse jobs in ${d.label}`}
            pressScale={0.97}
          >
            <Image source={{ uri: d.uri }} style={styles.image} />
            <LinearGradient
              colors={["transparent", "rgba(7,13,44,0.15)", "rgba(7,13,44,0.82)"]}
              locations={[0.35, 0.62, 1]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.copy}>
              <Text style={styles.short}>{d.short}</Text>
              <Text style={styles.cta}>View roles</Text>
            </View>
          </GshPressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headingRow: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  heading: {
    fontSize: 22,
    fontFamily: fontFamily.heading,
    color: colors.navy,
    letterSpacing: -0.4,
  },
  headingHint: {
    fontSize: 13,
    fontFamily: fontFamily.medium,
    color: colors.textMuted,
  },
  rail: { paddingHorizontal: 16, gap: 12, paddingBottom: 4 },
  card: {
    borderRadius: radii.lg,
    overflow: "hidden",
    backgroundColor: colors.navy,
  },
  image: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  copy: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 14,
    gap: 4,
  },
  short: {
    fontSize: 20,
    fontFamily: fontFamily.headingStrong,
    color: colors.white,
    letterSpacing: -0.4,
  },
  cta: {
    fontSize: 13,
    fontFamily: fontFamily.semiBold,
    color: colors.cyan,
  },
});
