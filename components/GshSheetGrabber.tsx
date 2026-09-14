import { StyleSheet, View } from "react-native";
import { colors } from "@/lib/theme";

/** iOS page-sheet grabber — signals a real sheet, not a web dialog. */
export function GshSheetGrabber() {
  return (
    <View style={styles.wrap} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={styles.pill} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 4,
  },
  pill: {
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.borderStrong,
  },
});
