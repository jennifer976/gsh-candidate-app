import { StyleSheet, View } from "react-native";

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
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#d5dae6",
  },
});
