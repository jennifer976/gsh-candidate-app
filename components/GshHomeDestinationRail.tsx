import { Ionicons } from "@expo/vector-icons";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { CountryFlag } from "@/components/CountryFlag";
import { DepthPressable, SectionHeading } from "@/components/gsh-brand";
import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { colors, fontFamily } from "@/lib/theme";

const DESTINATIONS = [
  {
    label: "Canada",
    iso2: "ca",
    location: "Canada",
    uri: "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=800&q=75",
  },
  {
    label: "Australia",
    iso2: "au",
    location: "Australia",
    uri: "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?auto=format&fit=crop&w=800&q=75",
  },
  {
    label: "UK",
    iso2: "gb",
    location: "United Kingdom",
    uri: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=75",
  },
  {
    label: "Ireland",
    iso2: "ie",
    location: "Ireland",
    uri: "https://images.unsplash.com/photo-1590089415225-401ed6f9db8e?auto=format&fit=crop&w=800&q=75",
  },
] as const;

const CARD_W = 148;
const CARD_H = 170;

/** Destination rail: photo cards with a navy edge and cyan depth that open Jobs filtered to the country. */
export function GshHomeDestinationRail() {
  const router = useRouter();
  const ac = useAccountCopy();

  return (
    <View>
      <SectionHeading
        eyebrow={ac("Where to next?")}
        title={ac("Popular destinations")}
        actionLabel={ac("See all")}
        onAction={() => router.push("/countries")}
        style={styles.heading}
      />
      <ScrollView
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rail}
        decelerationRate="fast"
        snapToInterval={CARD_W + 12}
      >
        {DESTINATIONS.map((d) => (
          <DepthPressable
            key={d.iso2}
            onPress={() =>
              router.push({
                pathname: "/(tabs)/jobs",
                params: { location: d.location },
              })
            }
            face={colors.navy}
            depthColor={colors.cyan}
            depth={5}
            radius={22}
            borderWidth={2}
            borderColor={colors.navy}
            accessibilityLabel={ac("Browse jobs in {country}", { country: ac(d.label) })}
            innerStyle={{ width: CARD_W, height: CARD_H }}
          >
            <Image source={{ uri: d.uri }} style={styles.image} />
            <LinearGradient
              colors={["transparent", "rgba(7,13,44,0.2)", "rgba(7,13,44,0.9)"]}
              locations={[0.3, 0.6, 1]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.flag}>
              <CountryFlag iso2={d.iso2} width={28} />
            </View>
            <View style={styles.copy}>
              <Text style={styles.name} numberOfLines={1}>
                {ac(d.label)}
              </Text>
              <View style={styles.arrow}>
                <Ionicons name="arrow-forward" size={14} color={colors.navy} />
              </View>
            </View>
          </DepthPressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { paddingHorizontal: 20, marginBottom: 12 },
  rail: { paddingHorizontal: 20, gap: 12, paddingBottom: 4, paddingTop: 2 },
  image: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  flag: { position: "absolute", top: 10, left: 10 },
  copy: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  name: {
    flex: 1,
    fontSize: 18,
    fontFamily: fontFamily.headingStrong,
    textTransform: "uppercase",
    color: colors.white,
    letterSpacing: -0.4,
  },
  arrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.cyan,
    alignItems: "center",
    justifyContent: "center",
  },
});
