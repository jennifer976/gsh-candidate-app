import { ActivityIndicator, Image, StyleSheet, Text } from "react-native";
import Animated, { FadeIn, FadeInDown, ZoomIn } from "react-native-reanimated";
import { colors, fontFamily } from "@/lib/theme";

/** In-app splash after native splash — matches app.config (navy + artwork). */
export function BrandedSplash() {
  return (
    <Animated.View entering={FadeIn.duration(420)} style={styles.root}>
      <Animated.View entering={ZoomIn.duration(520).delay(40)}>
        <Image
          source={require("../assets/splash-artwork.jpg")}
          style={styles.artwork}
          resizeMode="contain"
          accessibilityRole="image"
          accessibilityLabel="Global Sponsor Hub"
        />
      </Animated.View>
      <Animated.Text entering={FadeInDown.duration(450).delay(140)} style={styles.title}>
        Global Sponsor Hub
      </Animated.Text>
      <Animated.Text entering={FadeInDown.duration(450).delay(200)} style={styles.subtitle}>
        Candidate
      </Animated.Text>
      <Animated.View entering={FadeIn.duration(380).delay(280)}>
        <ActivityIndicator size="small" color={colors.teal} style={styles.spinner} accessibilityLabel="Loading" />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.navy,
    paddingHorizontal: 28,
  },
  artwork: {
    width: "78%",
    maxWidth: 320,
    aspectRatio: 1,
    marginBottom: 22,
  },
  title: {
    fontSize: 22,
    fontFamily: fontFamily.bold,
    color: colors.white,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 15,
    fontFamily: fontFamily.semiBold,
    color: colors.teal,
    letterSpacing: 0.5,
    textAlign: "center",
  },
  spinner: { marginTop: 28 },
});
