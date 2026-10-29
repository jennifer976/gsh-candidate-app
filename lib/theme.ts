/** Global Sponsor Hub candidate theme: navy with a cyan accent. Matches the website design system. */
import { TextStyle, ViewStyle } from "react-native";

export const colors = {
  // Core brand — navy + cyan only
  navy: "#0d194e",
  navyDeep: "#0d194e",
  navyMid: "#0d194e",
  /** Primary cyan accent (replaces darker teal). */
  cyan: "#42e0e3",
  /** @deprecated Use `cyan` — kept as alias so existing imports keep compiling. */
  teal: "#42e0e3",
  tealOnNavy: "#42e0e3",
  tealDim: "rgba(66,224,227,0.16)",
  // Compatibility aliases. New UI must not create a purple visual lane.
  purple: "#0d194e",
  purpleBright: "#0d194e",

  // Surface system
  bgDark: "#0d194e",
  bgCard: "#ffffff",
  bgCardElevated: "#ffffff",
  bgOverlay: "rgba(13,25,78,0.72)",

  // Light surface (forms, modals, input fields)
  background: "#ffffff",
  pale: "#f3f5f9",
  pale2: "#f3f5f9",
  surfaceMuted: "#f3f5f9",
  surfaceLight: "#f3f5f9",

  // Text — dark backgrounds
  textOnDark: "#ffffff",
  textOnDarkMuted: "rgba(255,255,255,0.6)",
  textOnDarkDim: "rgba(255,255,255,0.38)",

  // Text — light backgrounds
  textPrimary: "#0d194e",
  textSecondary: "#515a80",
  textMarketing: "#515a80",
  textMuted: "#515a80",
  placeholder: "#8a93ad",

  // New design-system tokens
  text2: "#515a80",
  muted: "#8a93ad",
  tone: "#646d93",
  mark: "#dfe3ec",
  panel: "#f3f5f9",
  line: "#e6e9f1",
  supportChipBg: "rgba(66,224,227,0.2)",
  supportChipBgOnNavy: "rgba(66,224,227,0.16)",
  onNavy2: "rgba(255,255,255,0.72)",
  onNavyLine: "rgba(255,255,255,0.14)",
  markOnNavy: "rgba(255,255,255,0.05)",
  scrimTop: "rgba(13,25,78,0.05)",
  scrimBottom: "rgba(13,25,78,0.9)",

  // Borders
  border: "#e6e9f1",
  borderStrong: "rgba(13,25,78,0.24)",
  borderOnDark: "rgba(255,255,255,0.12)",
  borderOnDarkStrong: "rgba(255,255,255,0.22)",

  // Navy carries actions; cyan is the only highlight.
  brand: "#0d194e",
  brandDeep: "#0d194e",
  brandSoft: "rgba(66,224,227,0.16)",
  brandGlow: "transparent",
  secondary: "#0d194e",
  accent: "#42e0e3",
  error: "#b91c1c",
  white: "#ffffff",

  // Legacy chip names resolve to the neutral/cyan system.
  purpleMuted: "#f3f5f9",
  purpleBorder: "#e6e9f1",
  purpleText: "#0d194e",
  purpleTextDark: "#0d194e",
  secondaryTintBg: "rgba(66,224,227,0.14)",
  secondaryTintText: "#0d194e",
  treeapp: "#75be00",
  chipOnBg: "#0d194e",
  chipOnBorder: "#0d194e",
  unreadBorder: "rgba(66,224,227,0.72)",
  unreadBg: "rgba(66,224,227,0.08)",
  warningBg: "#f3f5f9",
  warningBorder: "#0d194e",
  warningText: "#0d194e",

  discoverCanvas: "#ffffff",
  foreground: "#0d194e",
} as const;

export const fontFamily = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semiBold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
  extraBold: "Inter_800ExtraBold",
  heading: "Montserrat_700Bold",
  headingStrong: "Montserrat_800ExtraBold",
  headingMedium: "Montserrat_600SemiBold",
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 28,
  feed: 24,
  pill: 9999,
} as const;

/** Extra scroll padding so list content clears the floating tab bar. */
export const FLOATING_TAB_CLEARANCE = 130;

export const shadows = {
  card: {
    shadowColor: "#0d194e",
    shadowOpacity: 0.07,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  lift: {
    shadowColor: "#0d194e",
    shadowOpacity: 0.16,
    shadowRadius: 36,
    shadowOffset: { width: 0, height: 14 },
    elevation: 8,
  },
} as const;

export const type = {
  title: {
    fontFamily: "Montserrat_800ExtraBold",
    fontSize: 34,
    lineHeight: 36,
    letterSpacing: -1.2,
    color: "#0d194e",
  } satisfies TextStyle,
  section: {
    fontFamily: "Montserrat_800ExtraBold",
    fontSize: 21,
    lineHeight: 26,
    letterSpacing: -0.6,
    color: "#0d194e",
  } satisfies TextStyle,
  cardTitle: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.2,
    color: "#0d194e",
  } satisfies TextStyle,
  body: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    lineHeight: 22,
    color: "#515a80",
  } satisfies TextStyle,
  label: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    lineHeight: 20,
    color: "#0d194e",
  } satisfies TextStyle,
  eyebrow: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    lineHeight: 18,
    color: "#515a80",
  } satisfies TextStyle,
  big: {
    fontFamily: "Montserrat_800ExtraBold",
    fontSize: 40,
    lineHeight: 40,
    letterSpacing: -1.4,
  } satisfies TextStyle,
} as const;

/** Compatibility helper for legacy dark sections; intentionally has no glow/elevation. */
export function darkCardStyle(_accent?: "teal" | "purple" | "none"): ViewStyle {
  return {
    backgroundColor: colors.navy,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderOnDark,
  };
}

/** Flat native section on a light background. */
/** Brand card: white surface with soft navy shadow (no thick outline). */
export function cardSurfaceStyle(_interactive?: boolean): ViewStyle {
  return {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    ...shadows.card,
  };
}

export function feedCardStyle(): ViewStyle {
  return cardSurfaceStyle();
}

// Legacy aliases — keep existing callers working
export const discoverFeedCardStyle = feedCardStyle;
export function discoverSearchFieldStyle(): ViewStyle {
  return {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e6e9f1",
  };
}
export function cardCuratedSurfaceStyle(interactive?: boolean): ViewStyle {
  return cardSurfaceStyle(interactive);
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
    fontFamily: fontFamily.headingStrong,
    fontSize: 28,
    letterSpacing: -0.3,
    color: colors.textPrimary,
  } satisfies TextStyle,
  sectionLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
    color: colors.textSecondary,
  } satisfies TextStyle,
} as const;

/** Solid navy hero expressed in the existing gradient API. */
export const heroGradient = {
  colors: [colors.navy, colors.navy] as const,
  start: { x: 0.2, y: 0 },
  end: { x: 0.8, y: 1 },
};

/** Compatibility tokens. Visuals remain solid navy or subtle cyan. */
export const gradient = {
  authCTA: [colors.navy, colors.navy] as const,
  heroBg: [colors.navy, colors.navy] as const,
  cardAccent: ["rgba(66,224,227,0.14)", "rgba(66,224,227,0.04)"] as const,
  cyanGlow: ["rgba(66,224,227,0)", "rgba(66,224,227,0.10)"] as const,
  employerHeader: ["rgba(66,224,227,0.10)", "rgba(66,224,227,0)"] as const,
  curatedHeader: ["rgba(66,224,227,0.08)", "rgba(66,224,227,0)"] as const,
};

/** Vertical accent strip on the left edge of a card — signals lane (employer vs curated) */
export const accentStrip = {
  width: 4,
  borderTopLeftRadius: radii.feed,
  borderBottomLeftRadius: radii.feed,
} as const;

export const accentStripEmployer: ViewStyle = {
  ...accentStrip,
  position: "absolute",
  top: 0,
  bottom: 0,
  left: 0,
  backgroundColor: colors.teal,
};

export const accentStripCurated: ViewStyle = {
  ...accentStrip,
  position: "absolute",
  top: 0,
  bottom: 0,
  left: 0,
  backgroundColor: colors.teal,
};

/** Faint network watermark — drop the brand mark behind hero / empty states at low opacity */
export const networkWatermark: ViewStyle = {
  position: "absolute",
  opacity: 0.07,
  pointerEvents: "none" as const,
};

/** Dark nav header for inner screens */
export const navHeader = {
  headerStyle: { backgroundColor: colors.navy },
  headerTintColor: colors.white,
  headerTitleStyle: {
    color: colors.white,
    fontFamily: fontFamily.heading,
    fontSize: 17,
  },
  headerShadowVisible: false,
} as const;

export type GshColors = typeof colors;
