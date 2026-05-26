import { Platform } from "react-native";

/** Bottom inset for tab bar — respects gesture nav on Android 15+ edge-to-edge. */
export function tabBarBottomPadding(insetsBottom: number): number {
  if (Platform.OS === "android") {
    return Math.max(insetsBottom, 12);
  }
  return Math.max(insetsBottom, 8);
}
