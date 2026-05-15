import { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { fontFamily } from "@/lib/theme";

const AVATAR_PALETTES = [
  { bg: "#e0e7ff", text: "#3730a3" },
  { bg: "#fef9c3", text: "#854d0e" },
  { bg: "#dcfce7", text: "#166534" },
  { bg: "#fce7f3", text: "#9d174d" },
  { bg: "#e0f2fe", text: "#0369a1" },
  { bg: "#ffedd5", text: "#9a3412" },
  { bg: "#f3e8ff", text: "#6b21a8" },
  { bg: "#d1fae5", text: "#065f46" },
];

function avatarPalette(initial: string) {
  const idx = (initial.toUpperCase().charCodeAt(0) || 65) % AVATAR_PALETTES.length;
  return AVATAR_PALETTES[idx];
}

type Props = {
  logoUrl?: string;
  companyName?: string;
  size?: number;
  radius?: number;
};

/**
 * Shows a real company logo when available, falls back to a coloured
 * letter-avatar. Handles image load errors gracefully.
 */
export function CompanyLogo({ logoUrl, companyName = "", size = 48, radius = 13 }: Props) {
  const [imgError, setImgError] = useState(false);

  const showLogo = !!logoUrl && !imgError;
  const initial = (companyName.trim().charAt(0) || "G").toUpperCase();
  const pal = avatarPalette(initial);
  const fontSize = Math.round(size * 0.36);

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: radius,
    overflow: "hidden" as const,
    backgroundColor: showLogo ? "#fff" : pal.bg,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    flexShrink: 0 as const,
  };

  if (showLogo) {
    return (
      <View style={containerStyle}>
        <Image
          source={{ uri: logoUrl }}
          style={{ width: size, height: size }}
          resizeMode="contain"
          onError={() => setImgError(true)}
          accessibilityLabel={`${companyName} logo`}
          accessibilityIgnoresInvertColors
        />
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <Text style={{ fontSize, fontFamily: fontFamily.bold, color: pal.text }}>{initial}</Text>
    </View>
  );
}
