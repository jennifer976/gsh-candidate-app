import { ActivityIndicator, Image, StyleSheet, View } from "react-native";
import { brandMarkLight } from "@/lib/brand-assets";
import { colors } from "@/lib/theme";

/** In-app launch layer — hub mark on navy while fonts/auth hydrate. */
export function BrandedLaunchSplash() {
  return (
    <View style={styles.root}>
      <View style={styles.markWell}>
        <Image
          source={brandMarkLight}
          style={styles.mark}
          resizeMode="contain"
          accessibilityLabel="Global Sponsor Hub"
        />
      </View>
      <ActivityIndicator size="large" color={colors.cyan} style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.navyDeep,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  markWell: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(66,224,227,0.08)",
    marginBottom: 28,
  },
  mark: { width: 72, height: 72 },
  spinner: { marginTop: 4 },
});
