# Theme

## Compact token summary

### Stack
- Styling: React Native `StyleSheet` and inline `ViewStyle`/`TextStyle`; no CSS, CSS variables, Tailwind, NativeWind, or third-party component library.
- Theme source: `lib/theme.ts`; spacing/layout source: `lib/screen-layout.ts`.
- Interface style is forced light in `app.config.js`. Navy is reserved for intentional hero/header bands.

### Colors
- Brand: `navy #0d194e`, `navyDeep #070d2c`, `cyan #42e0e3`.
- Main surfaces: `background/white #ffffff`, `pale #f4f7fb`, `pale2/surfaceMuted #eef3f8`.
- Light text: `textPrimary #0d194e`, `textSecondary #475569`, `textMarketing #334155`, `textMuted #64748b`, `placeholder #94a3b8`.
- Dark text: `textOnDark #ffffff`, muted `rgba(255,255,255,0.6)`, dim `rgba(255,255,255,0.38)`.
- Borders: `border #e2e8f0`, `borderStrong #cbd5e1`, dark `rgba(255,255,255,0.12/0.22)`.
- Semantic: `error #b91c1c`; warning background/border/text `#fffbeb/#fde68a/#92400e`.
- Brand tints: `brandSoft rgba(66,224,227,0.16)`, `brandGlow rgba(66,224,227,0.22)`, unread background/border `rgba(66,224,227,0.08/0.72)`.
- Gradients are deliberately restrained: solid navy compatibility gradients plus subtle cyan mist. Legacy teal/purple aliases resolve to cyan/navy and must not create a purple lane.
- No dark-mode token set exists.

### Typography
- Body family: Inter 400/500/600/700/800, loaded through `@expo-google-fonts/inter`.
- Heading family: bundled Montserrat 600/700/800.
- Named styles: screen title 28px Montserrat 800; section title commonly 17–19px; marketing body 15/22; caption 13/18.
- Tight heading tracking is common (`-0.3` to `-0.8`); small eyebrows/taglines use uppercase/lowercase transforms and positive tracking.

### Radius, spacing, elevation
- Radius: `sm 8`, `md 10`, `lg/feed 20`, `xl 24`, `xxl 28`, `pill 999`.
- Core content inset: 16px; stack-header body gap 20px; stack bottom pad 48px.
- Feed rhythm: section gap 16px, item gap 10px.
- Tablet: breakpoint 600px, maximum content width 720px; stack scroll content max width 760px.
- Cards are flat: white/navy fills with 1px borders. Theme helpers intentionally add no shadow/glow/elevation.

### Platform chrome
- Inner-screen native header: navy background, white tint, 17px Montserrat 700, no shadow.
- Android status/navigation bars: white with dark content.
- Tab badges: cyan on navy text; tab surfaces remain white.

## Raw source: `lib/theme.ts`

```ts
/** GSH 2.0 candidate theme: navy + cyan highlights (no teal lane). */
import { TextStyle, ViewStyle } from "react-native";

export const colors = {
  // Core brand — navy + cyan only
  navy: "#0d194e",
  navyDeep: "#070d2c",
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
  pale: "#f4f7fb",
  pale2: "#eef3f8",
  surfaceMuted: "#eef3f8",
  surfaceLight: "#f4f7fb",

  // Text — dark backgrounds
  textOnDark: "#ffffff",
  textOnDarkMuted: "rgba(255,255,255,0.6)",
  textOnDarkDim: "rgba(255,255,255,0.38)",

  // Text — light backgrounds
  textPrimary: "#0d194e",
  textSecondary: "#475569",
  textMarketing: "#334155",
  textMuted: "#64748b",
  placeholder: "#94a3b8",

  // Borders
  border: "#e2e8f0",
  borderStrong: "#cbd5e1",
  borderOnDark: "rgba(255,255,255,0.12)",
  borderOnDarkStrong: "rgba(255,255,255,0.22)",

  // Navy carries actions; cyan is the only highlight.
  brand: "#0d194e",
  brandDeep: "#0d194e",
  brandSoft: "rgba(66,224,227,0.16)",
  brandGlow: "rgba(66,224,227,0.22)",
  secondary: "#0d194e",
  accent: "#42e0e3",
  error: "#b91c1c",
  white: "#ffffff",

  // Legacy chip names resolve to the neutral/cyan system.
  purpleMuted: "#f6f7f9",
  purpleBorder: "#e2e8f0",
  purpleText: "#0d194e",
  purpleTextDark: "#0d194e",
  secondaryTintBg: "rgba(66,224,227,0.14)",
  secondaryTintText: "#0d194e",
  treeapp: "#75be00",
  chipOnBg: "#0d194e",
  chipOnBorder: "#0d194e",
  unreadBorder: "rgba(66,224,227,0.72)",
  unreadBg: "rgba(66,224,227,0.08)",
  warningBg: "#fffbeb",
  warningBorder: "#fde68a",
  warningText: "#92400e",

  discoverCanvas: "#ffffff",
  foreground: "#171717",
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
  md: 10,
  lg: 20,
  xl: 24,
  xxl: 28,
  feed: 20,
  pill: 999,
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
export function cardSurfaceStyle(_interactive?: boolean): ViewStyle {
  return {
    backgroundColor: colors.background,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
  };
}

/** Flat feed section with a hairline boundary. */
export function feedCardStyle(): ViewStyle {
  return {
    backgroundColor: colors.background,
    borderRadius: radii.feed,
    borderWidth: 1,
    borderColor: colors.border,
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
    backgroundColor: colors.background,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
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
```

## Raw source: `lib/screen-layout.ts`

```ts
import type { ViewStyle } from "react-native";

/** Breathing room between native stack/tab header and first in-screen content */
export const STACK_HEADER_BODY_GAP = 20;

/** ScrollView content under a stack header (Tools, Settings, ATS, etc.) */
export const stackScrollContentStyle: ViewStyle = {
  width: "100%",
  maxWidth: 760,
  alignSelf: "center",
  paddingHorizontal: 16,
  paddingTop: STACK_HEADER_BODY_GAP,
  paddingBottom: 48,
};

/** FlatList header block with title/intro under stack or tab header */
export const stackListLeadStyle: ViewStyle = {
  paddingHorizontal: 16,
  paddingTop: STACK_HEADER_BODY_GAP,
  paddingBottom: 10,
};

/** Fixed header above FlatList (partners search, notifications) */
export const stackFlatListHeadWrapStyle: ViewStyle = {
  paddingHorizontal: 16,
  paddingTop: STACK_HEADER_BODY_GAP,
  paddingBottom: 12,
};

/** Home / Jobs navy feed — vertical rhythm between blocks */
export const FEED_SECTION_GAP = 16;
export const FEED_ITEM_GAP = 10;

/** Center main column on tablets / foldables (Android 16 may ignore portrait lock). */
export const TABLET_BREAKPOINT_WIDTH = 600;
export const TABLET_MAX_CONTENT_WIDTH = 720;
```

## Config note

No Tailwind config, global CSS, CSS modules, or CSS-variable theme files exist in this React Native repository. `app.config.js` supplies platform chrome and launch colors (`#0d194e`, `#42e0e3`, white system bars) but does not define additional reusable design tokens.
