/**
 * GSH Premium Theme
 * Dark-first design system — navy shells, glowing cards, teal/purple accents.
 * Matches the App Store showcase imagery and Jobie-style premium job app aesthetic.
 */
import { Platform, TextStyle, ViewStyle } from "react-native";

export const colors = {
  // Core brand
  navy: "#0d194e",
  navyDeep: "#080f2e",
  navyMid: "#111d5e",
  teal: "#0ecdd1",
  tealDim: "rgba(14,205,209,0.18)",
  purple: "#610a90",
  purpleBright: "#7c3aed",

  // Surface system — dark shells, light cards
  /** Page/screen background — deep navy */
  bgDark: "#080f2e",
  /** Card surface on dark bg */
  bgCard: "#111d5e",
  /** Elevated card — slightly lighter */
  bgCardElevated: "#162268",
  /** Frosted overlay */
  bgOverlay: "rgba(8,15,46,0.85)",

  // Light surface (forms, modals, input fields)
  background: "#ffffff",
  surfaceMuted: "#f8fafc",
  surfaceLight: "#f1f5f9",

  // Text — dark backgrounds
  textOnDark: "#ffffff",
  textOnDarkMuted: "rgba(255,255,255,0.6)",
  textOnDarkDim: "rgba(255,255,255,0.38)",

  // Text — light backgrounds
  textPrimary: "#0f172a",
  textSecondary: "#475569",
  textMarketing: "#334155",
  textMuted: "#64748b",
  placeholder: "#94a3b8",

  // Borders
  border: "#e2e8f0",
  borderStrong: "#cbd5e1",
  borderOnDark: "rgba(255,255,255,0.12)",
  borderOnDarkStrong: "rgba(255,255,255,0.22)",

  // Semantic
  brand: "#610a90",
  accent: "#0ecdd1",
  error: "#b91c1c",
  white: "#ffffff",

  // Chip palettes (unchanged — used in job chips)
  purpleMuted: "#f5f3ff",
  purpleBorder: "#e9d5ff",
  purpleText: "#6b21a8",
  purpleTextDark: "#581c87",
  secondaryTintBg: "#ede9fe",
  secondaryTintText: "#5b21b6",
  treeapp: "#75be00",
  chipOnBg: "#610a90",
  chipOnBorder: "#610a90",
  unreadBorder: "rgba(14, 205, 209, 0.45)",
  unreadBg: "rgba(14, 205, 209, 0.07)",
  warningBg: "#fffbeb",
  warningBorder: "#fde68a",
  warningText: "#92400e",

  /** Canvas behind floating cards on light screens */
  discoverCanvas: "#080f2e",
  foreground: "#171717",
} as const;

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
  xxl: 24,
  feed: 18,
  pill: 999,
} as const;

/** Glowing card on dark background — the signature GSH premium look */
export function darkCardStyle(glow?: "teal" | "purple" | "none"): ViewStyle {
  const glowColor =
    glow === "teal"
      ? "rgba(14,205,209,0.25)"
      : glow === "purple"
      ? "rgba(97,10,144,0.3)"
      : "rgba(255,255,255,0.06)";

  const base: ViewStyle = {
    backgroundColor: colors.bgCard,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.borderOnDark,
  };
  if (Platform.OS === "android") {
    return { ...base, elevation: 8 };
  }
  return {
    ...base,
    shadowColor: glowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
  };
}

/** White card on light background */
export function cardSurfaceStyle(interactive?: boolean): ViewStyle {
  const base: ViewStyle = {
    backgroundColor: colors.background,
    borderRadius: radii.lg,
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

/** Feed card — white on the dark canvas */
export function feedCardStyle(): ViewStyle {
  const base: ViewStyle = {
    backgroundColor: colors.background,
    borderRadius: radii.feed,
    borderWidth: 0,
  };
  if (Platform.OS === "android") {
    return { ...base, elevation: 4 };
  }
  return {
    ...base,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  };
}

// Legacy aliases — keep existing callers working
export const discoverFeedCardStyle = feedCardStyle;
export function discoverSearchFieldStyle(): ViewStyle {
  return {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.95)",
  };
}
export function cardCuratedSurfaceStyle(interactive?: boolean): ViewStyle {
  return {
    backgroundColor: colors.purpleMuted,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.purpleBorder,
  };
}

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

/** Hero gradient — deep navy to navyMid */
export const heroGradient = {
  colors: [colors.navyDeep, colors.navyMid] as const,
  start: { x: 0.2, y: 0 },
  end: { x: 0.8, y: 1 },
};

/** Teal→Purple CTA gradient */
export const gradient = {
  authCTA: ["#0ECDD1", "#610A90"] as const,
  heroBg: [colors.navyDeep, "#1a0a3e"] as const,
  cardAccent: ["rgba(14,205,209,0.15)", "rgba(97,10,144,0.15)"] as const,
};

/** Dark nav header for inner screens */
export const navHeader = {
  headerStyle: { backgroundColor: colors.navyDeep },
  headerTintColor: colors.white,
  headerTitleStyle: {
    color: colors.white,
    fontFamily: fontFamily.bold,
    fontSize: 17,
  },
  headerShadowVisible: false,
} as const;

export type GshColors = typeof colors;
