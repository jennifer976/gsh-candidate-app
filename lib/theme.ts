/**
 * Brand tokens aligned with global_sponsor_hub-fe/src/app/globals.css
 * (gsh-navy, gsh-teal, gsh-purple, surfaces).
 */
export const colors = {
  navy: "#0d194e",
  navyDeep: "#0a1340",
  teal: "#0ecdd1",
  purple: "#610a90",
  /** Softer purple for subtle fills (approx. web purple + white mix) */
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
  textMuted: "#64748b",
  placeholder: "#94a3b8",

  /** Primary actions / links — brand purple */
  brand: "#610a90",
  /** Secondary accent — teal (matches marketing card hover ring) */
  accent: "#0ecdd1",

  error: "#b91c1c",
  warningBg: "#fffbeb",
  warningBorder: "#fde68a",
  warningText: "#92400e",

  /** Selected chips, toggles */
  chipOnBg: "#610a90",
  chipOnBorder: "#610a90",

  /** Cards / lists — teal-tinted unread (web interactive cards) */
  unreadBorder: "rgba(14, 205, 209, 0.45)",
  unreadBg: "rgba(14, 205, 209, 0.07)",

  /** Secondary outline button on purple theme */
  secondaryTintBg: "#ede9fe",
  secondaryTintText: "#5b21b6",

  white: "#ffffff",
} as const;

/** Linear gradient stops — matches web auth (`AUTH_PRIMARY_GRADIENT` teal → purple). */
export const gradient = {
  authCTA: ["#0ECDD1", "#610A90"] as const,
};

/**
 * Stack / tab screen headers — navy bar + light chrome (marketing site header family).
 * Spread into `screenOptions` alongside `contentStyle`.
 */
export const navHeader = {
  headerStyle: { backgroundColor: colors.navy },
  headerTintColor: colors.white,
  headerTitleStyle: { color: colors.white, fontWeight: "600" as const },
  headerShadowVisible: false,
} as const;

export type GshColors = typeof colors;
