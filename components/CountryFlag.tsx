import { Image, StyleSheet, View } from "react-native";
import { SvgXml } from "react-native-svg";
import { Icon } from "@/components/Icon";
import { SITE_FLAGS } from "@/lib/brand/siteFlags";
import { colors, shadows } from "@/lib/theme";

type SizeProp = number | "default" | "small" | "sm";

function resolveSize(size: SizeProp | undefined, width?: number): number {
  if (typeof width === "number" && width > 0) {
    // Pack 27: list flags are 28 or 20. Breakout sizes (e.g. 64) pass through.
    if (width <= 22) return 20;
    if (width <= 40) return 28;
    return width;
  }
  if (size === "small" || size === "sm") return 20;
  if (typeof size === "number" && size > 0) {
    if (size <= 22) return 20;
    if (size <= 40) return 28;
    return size;
  }
  return 28;
}

/** Round website flag (square SVG cropped in a circle), with flagcdn fallback. */
export function CountryFlag({
  iso2,
  width,
  size = "default",
}: {
  iso2?: string | null;
  width?: number;
  size?: SizeProp;
}) {
  const dim = resolveSize(size, width);
  const code = String(iso2 || "")
    .trim()
    .toLowerCase();
  const svg = code ? SITE_FLAGS[code] : undefined;
  const ring = dim >= 48 ? 3 : dim >= 28 ? 2 : 1.5;

  return (
    <View
      style={[
        styles.ring,
        {
          width: dim,
          height: dim,
          borderRadius: dim / 2,
          borderWidth: ring,
        },
        dim >= 48 ? shadows.lift : dim >= 28 ? shadows.card : null,
      ]}
    >
      {svg ? (
        <SvgXml xml={svg} width={dim} height={dim} />
      ) : code ? (
        <Image
          source={{ uri: `https://flagcdn.com/w160/${code}.png` }}
          style={{ width: dim, height: dim }}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
      ) : (
        <View style={styles.globe}>
          <Icon name="globe" size={14} color={colors.text2} strokeWidth={1.8} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    borderColor: colors.white,
    overflow: "hidden",
    backgroundColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
  },
  globe: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.line,
  },
});
