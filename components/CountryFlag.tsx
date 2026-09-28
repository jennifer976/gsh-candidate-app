import { Image, StyleSheet } from "react-native";
import { flagImageUrl } from "@/lib/publicResources";
import { colors } from "@/lib/theme";

export function CountryFlag({ iso2, width = 40 }: { iso2: string; width?: number }) {
  return (
    <Image
      source={{ uri: flagImageUrl(iso2) }}
      style={[styles.flag, { width, height: Math.round(width * 0.7) }]}
      resizeMode="cover"
      accessibilityIgnoresInvertColors
    />
  );
}

const styles = StyleSheet.create({
  flag: {
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.navy,
    backgroundColor: colors.pale,
  },
});
