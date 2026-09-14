import {
  FadeIn,
  FadeInDown,
  FadeInUp,
  type EntryOrExitLayoutType,
} from "react-native-reanimated";

/** Staggered entrance delays that match the marketing site’s calm reveal pace. */
export const MOTION = {
  hero: 80,
  primary: 160,
  secondary: 240,
  tertiary: 320,
  duration: 480,
} as const;

export function enterDown(delay = 0, reducedMotion?: boolean | null): EntryOrExitLayoutType | undefined {
  if (reducedMotion) return undefined;
  return FadeInDown.delay(delay).duration(MOTION.duration).springify().damping(18);
}

export function enterUp(delay = 0, reducedMotion?: boolean | null): EntryOrExitLayoutType | undefined {
  if (reducedMotion) return undefined;
  return FadeInUp.delay(delay).duration(MOTION.duration).springify().damping(18);
}

export function enterFade(delay = 0, reducedMotion?: boolean | null): EntryOrExitLayoutType | undefined {
  if (reducedMotion) return undefined;
  return FadeIn.delay(delay).duration(MOTION.duration - 80);
}
