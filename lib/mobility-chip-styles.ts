import { TextStyle, ViewStyle } from "react-native";
import { colors } from "@/lib/theme";

/** Colour-coded mobility / benefit pills — mirrors web hub semantics without overwhelming the card. */
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
  const relocate =
    raw.includes("relocat") || raw.includes("relocation") || raw.includes("relo ");
  const remote =
    raw.includes("remote") || raw.includes("cross-border") || raw.includes("cross border");
  const permit = raw.includes("permit") || raw.includes("work permit") || raw.includes("transfer");
  const offer = raw.includes("job offer") || raw.includes("offer support");
  const noSponsor = raw.includes("no sponsorship");

  const border = { borderWidth: 1 as const };

  if (noSponsor) {
    return {
      wrap: { ...border, backgroundColor: "#f4f4f5", borderColor: colors.borderStrong },
      text: { color: colors.textSecondary },
    };
  }
  if (visa) {
    return {
      wrap: { ...border, backgroundColor: "#ecfdf5", borderColor: "#a7f3d0" },
      text: { color: "#065f46" },
    };
  }
  if (relocate) {
    return {
      wrap: { ...border, backgroundColor: "#eff6ff", borderColor: "#bfdbfe" },
      text: { color: "#1e40af" },
    };
  }
  if (remote) {
    return {
      wrap: { ...border, backgroundColor: "#ecfeff", borderColor: "#a5f3fc" },
      text: { color: "#0e7490" },
    };
  }
  if (permit) {
    return {
      wrap: { ...border, backgroundColor: "#faf5ff", borderColor: "#e9d5ff" },
      text: { color: colors.purpleTextDark },
    };
  }
  if (offer) {
    return {
      wrap: { ...border, backgroundColor: "#fffbeb", borderColor: "#fde68a" },
      text: { color: "#92400e" },
    };
  }
  return {
    wrap: { ...border, backgroundColor: colors.surfaceMuted, borderColor: colors.border },
    text: { color: colors.textSecondary },
  };
}
