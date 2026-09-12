import { useEffect, useState } from "react";
import { Image, Text, View } from "react-native";
import { colors, fontFamily } from "@/lib/theme";

const AVATAR_PALETTES = [
  { bg: colors.surfaceMuted, text: colors.navy },
  { bg: colors.brandSoft, text: colors.navy },
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

  useEffect(() => {
    setImgError(false);
  }, [logoUrl]);

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
          style={{ width: size - 4, height: size - 4 }}
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
