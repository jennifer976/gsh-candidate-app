import { ActivityIndicator, Image, StyleSheet, View } from "react-native";
import { brandLockupLight } from "@/lib/brand-assets";
import { colors, fontFamily } from "@/lib/theme";

/** In-app launch layer while fonts and auth hydrate — pairs with navy native splash. */
export function BrandedLaunchSplash() {
  return (
    <View style={styles.root}>
      <Image
        source={brandLockupLight}
        style={styles.logo}
        resizeMode="contain"
        accessibilityLabel="Global Sponsor Hub"
      />
      <ActivityIndicator size="large" color={colors.teal} style={styles.spinner} />
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
  logo: { width: 240, height: 52, marginBottom: 28 },
  spinner: { marginTop: 4 },
});
