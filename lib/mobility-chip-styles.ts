import { TextStyle, ViewStyle } from "react-native";
import { colors } from "@/lib/theme";

const border = { borderWidth: 1 as const };

/** Neutral pills by default; only visa / sponsorship gets a subtle teal accent so cards stay calm. */
export function mobilityChipStyle(label: string): {
  wrap: ViewStyle;
  text: TextStyle;
} {
  const raw = label.trim().toLowerCase();
  const visa =
    raw.includes("visa") ||
    raw.includes("sponsor") ||
    raw.includes("sponsorship") ||
    raw === "visa sponsorship";
  const noSponsor = raw.includes("no sponsorship");

  if (noSponsor) {
    return {
      wrap: { ...border, backgroundColor: colors.surfaceMuted, borderColor: colors.border },
      text: { color: colors.textMuted },
    };
  }
  if (visa) {
    return {
      wrap: { ...border, backgroundColor: "rgba(14, 205, 209, 0.08)", borderColor: "rgba(14, 205, 209, 0.35)" },
      text: { color: colors.navy },
    };
  }
  return {
    wrap: { ...border, backgroundColor: colors.surfaceMuted, borderColor: colors.border },
    text: { color: colors.textSecondary },
  };
}
