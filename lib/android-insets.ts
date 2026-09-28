import { Platform } from "react-native";

/** Bottom pad so tab icons/labels sit above Android gesture / 3-button nav. */
export function androidTabBarMetrics(insetsBottom: number) {
  // Edge-to-edge often under-reports; keep a floor so labels aren't clipped.
  const paddingBottom = Math.max(insetsBottom, 20);
  const paddingTop = 8;
  const content = 52;
  return {
    paddingTop,
    paddingBottom,
    height: content + paddingTop + paddingBottom,
  };
}

/** Extra space so list content clears the tab bar + Android gesture/nav bar. */
export function tabBarBottomPadding(insetsBottom: number): number {
  if (Platform.OS === "android") {
    const bar = androidTabBarMetrics(insetsBottom);
    return bar.height + 20;
  }
  return 56 + Math.max(insetsBottom, 8) + 16;
}

/** Bottom pad for full-screen modals / sticky footers above system nav. */
export function modalFooterPad(insetsBottom: number): number {
  return Math.max(insetsBottom, 16) + 12;
}
