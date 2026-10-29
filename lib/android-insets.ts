import { FLOATING_TAB_CLEARANCE } from "@/lib/theme";

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

/**
 * Bottom padding for tab screen lists so content clears the floating tab bar.
 * Uses FLOATING_TAB_CLEARANCE (130) + the safe-area inset.
 */
export function tabBarBottomPadding(insetsBottom: number): number {
  return FLOATING_TAB_CLEARANCE + Math.max(insetsBottom, 0);
}

/** Bottom pad for full-screen modals / sticky footers above system nav. */
export function modalFooterPad(insetsBottom: number): number {
  return Math.max(insetsBottom, 16) + 12;
}
