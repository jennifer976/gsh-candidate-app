import { Image, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { brandMarkNavy } from "@/lib/brand-assets";
import { colors } from "@/lib/theme";

type Props = {
  /** Fired once the cyan branded layer has laid out — safe to hide native splash. */
  onReady?: () => void;
};

/**
 * Must match `imageWidth` for expo-splash-screen in app.config.js so the native → JS handoff is invisible.
 * Android 12+ masks the splash icon to a 192dp circle; 176dp keeps the whole mark inside it.
 */
export const LAUNCH_MARK_SIZE = 176;

/** Full-bleed cyan launch layer with the GSH mark — a pixel match for the native splash. */
export function BrandedLaunchSplash({ onReady }: Props) {
  return (
    <View
      style={styles.root}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading Global Sponsor Hub"
      onLayout={() => onReady?.()}
    >
      <StatusBar hidden style="dark" />
      <Image
        source={brandMarkNavy}
        style={styles.mark}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.cyan,
    alignItems: "center",
    justifyContent: "center",
  },
  mark: {
    width: LAUNCH_MARK_SIZE,
    height: LAUNCH_MARK_SIZE,
  },
});
