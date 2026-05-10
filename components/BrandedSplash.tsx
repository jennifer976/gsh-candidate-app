import { ActivityIndicator, Image, StyleSheet, Text } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { colors, fontFamily } from "@/lib/theme";

/** Matches native splash: hub mark on white (see app.json splash). */
export function BrandedSplash() {
  return (
    <Animated.View entering={FadeIn.duration(420)} style={styles.root}>
      <Animated.View entering={FadeInDown.duration(520).delay(60)}>
        <Image
          source={require("../assets/brand-mark.webp")}
          style={styles.mark}
          resizeMode="contain"
          accessibilityRole="image"
          accessibilityLabel="Global Sponsor Hub mark"
        />
      </Animated.View>
      <Animated.Text entering={FadeInDown.duration(450).delay(140)} style={styles.title}>
        Global Sponsor Hub
      </Animated.Text>
      <Animated.Text entering={FadeInDown.duration(450).delay(200)} style={styles.subtitle}>
        Candidate
      </Animated.Text>
      <Animated.View entering={FadeIn.duration(380).delay(280)}>
        <ActivityIndicator size="small" color={colors.navy} style={styles.spinner} accessibilityLabel="Loading" />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 28,
  },
  mark: {
    width: "44%",
    maxWidth: 168,
    aspectRatio: 1,
    marginBottom: 18,
  },
  title: {
    fontSize: 22,
    fontFamily: fontFamily.bold,
    color: colors.navy,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 15,
    fontFamily: fontFamily.semiBold,
    color: colors.accent,
    letterSpacing: 0.5,
    textAlign: "center",
  },
  spinner: { marginTop: 28 },
});
