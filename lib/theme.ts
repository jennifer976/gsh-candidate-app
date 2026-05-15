/**
 * Brand tokens aligned with global_sponsor_hub-fe/src/app/globals.css
 * (--gsh-shadow-card, gsh-marketing-card-surface, Inter / slate body copy).
 */
import { Platform, TextStyle, ViewStyle } from "react-native";

export const colors = {
  navy: "#0d194e",
  navyDeep: "#0a1340",
  teal: "#0ecdd1",
  purple: "#610a90",
  purpleMuted: "#f5f3ff",
  purpleBorder: "#e9d5ff",
  purpleText: "#6b21a8",
  purpleTextDark: "#581c87",

  treeapp: "#75be00",

  background: "#ffffff",
  foreground: "#171717",
  surfaceMuted: "#f8fafc",

  border: "#e2e8f0",
  borderStrong: "#cbd5e1",

  textPrimary: "#0f172a",
  textSecondary: "#475569",
  /** Web `.text-marketing-body` slate-700 */
  textMarketing: "#334155",
  textMuted: "#64748b",
  placeholder: "#94a3b8",

  brand: "#610a90",
  accent: "#0ecdd1",

  error: "#b91c1c",
  warningBg: "#fffbeb",
  warningBorder: "#fde68a",
  warningText: "#92400e",

  chipOnBg: "#610a90",
  chipOnBorder: "#610a90",

  unreadBorder: "rgba(14, 205, 209, 0.45)",
  unreadBg: "rgba(14, 205, 209, 0.07)",

  secondaryTintBg: "#ede9fe",
  secondaryTintText: "#5b21b6",

  white: "#ffffff",

  /** Job-style feed shell (Discover tab) — cool gray behind white cards */
  discoverCanvas: "#eef2f7",
} as const;

/** Loaded via `useFonts` in root layout — matches web Inter. */
export const fontFamily = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semiBold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
  extraBold: "Inter_800ExtraBold",
} as const;

export const radii = {
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  /** Job-board style cards (Discover feed) */
  feed: 18,
  pill: 999,
} as const;

/** Marketing shell gradient — mirrors `.header-hero-gradient` / `.gsh-marketing-shell-bg`. */
export const shellGradient = {
  colors: ["#ffffff", colors.surfaceMuted] as const,
  start: { x: 0.5, y: 0 },
  end: { x: 0.5, y: 1 },
};

/**
 * Card elevation approximating `--gsh-shadow-card` + optional purple lift
 * (`.gsh-marketing-card-surface--interactive`).
 */
/** Curated / agency external listings — distinct purple shell vs employer Hub cards. */
export function cardCuratedSurfaceStyle(interactive?: boolean): ViewStyle {
  const base: ViewStyle = {
    backgroundColor: colors.purpleMuted,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.purpleBorder,
  };
  if (Platform.OS === "android") {
    return { ...base, elevation: interactive ? 4 : 2 };
  }
  return {
    ...base,
    shadowColor: colors.purple,
    shadowOffset: { width: 0, height: interactive ? 4 : 2 },
    shadowOpacity: interactive ? 0.12 : 0.06,
    shadowRadius: interactive ? 14 : 10,
  };
}

export function cardSurfaceStyle(interactive?: boolean): ViewStyle {
  const base: ViewStyle = {
    backgroundColor: colors.background,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.92)",
  };
  if (Platform.OS === "android") {
    return { ...base, elevation: interactive ? 5 : 3 };
  }
  return {
    ...base,
    shadowColor: interactive ? colors.purple : "#0f172a",
    shadowOffset: { width: 0, height: interactive ? 5 : 2 },
    shadowOpacity: interactive ? 0.14 : 0.07,
    shadowRadius: interactive ? 16 : 12,
  };
}

/** Floating white cards on the Discover canvas (Figma-style elevation, GSH surfaces). */
export function discoverFeedCardStyle(): ViewStyle {
  const base: ViewStyle = {
    backgroundColor: colors.white,
    borderRadius: radii.feed,
    borderWidth: 0,
  };
  if (Platform.OS === "android") {
    return { ...base, elevation: 4 };
  }
  return {
    ...base,
    shadowColor: "#64748b",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
  };
}

/** In-card search field — pill, light border, soft lift */
export function discoverSearchFieldStyle(): ViewStyle {
  const base: ViewStyle = {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.95)",
  };
  if (Platform.OS === "android") {
    return { ...base, elevation: 1 };
  }
  return {
    ...base,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  };
}

/** Shared body copy — pair with `fontFamily.*` on Text. */
export const typography = {
  marketingBody: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMarketing,
  } satisfies TextStyle,
  caption: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  } satisfies TextStyle,
  screenTitle: {
    fontFamily: fontFamily.extraBold,
    fontSize: 24,
    letterSpacing: -0.3,
    color: colors.textPrimary,
  } satisfies TextStyle,
  sectionLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
    color: colors.textSecondary,
  } satisfies TextStyle,
} as const;

export const gradient = {
  authCTA: ["#0ECDD1", "#610A90"] as const,
};

export const navHeader = {
  headerStyle: { backgroundColor: colors.navy },
  headerTintColor: colors.white,
  headerTitleStyle: {
    color: colors.white,
    fontFamily: fontFamily.bold,
    fontSize: 17,
  },
  headerShadowVisible: false,
} as const;

export type GshColors = typeof colors;
