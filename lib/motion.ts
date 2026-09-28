import {
  FadeIn,
  FadeInDown,
  FadeInUp,
  type EntryOrExitLayoutType,
} from "react-native-reanimated";

/** Staggered entrance delays that match the marketing site’s calm reveal pace. */
export const MOTION = {
  hero: 40,
  primary: 60,
  secondary: 90,
  tertiary: 120,
  duration: 280,
} as const;

export function enterDown(delay = 0, reducedMotion?: boolean | null): EntryOrExitLayoutType | undefined {
  if (reducedMotion) return undefined;
  // No spring — springify() caused a visible wobble on Android load.
  return FadeInDown.delay(delay).duration(280);
}

export function enterUp(delay = 0, reducedMotion?: boolean | null): EntryOrExitLayoutType | undefined {
  if (reducedMotion) return undefined;
  return FadeInUp.delay(delay).duration(280);
}

export function enterFade(delay = 0, reducedMotion?: boolean | null): EntryOrExitLayoutType | undefined {
  if (reducedMotion) return undefined;
  return FadeIn.delay(delay).duration(220);
}
