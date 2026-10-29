import { Image, StyleSheet, View } from "react-native";
import { flagImageUrl } from "@/lib/publicResources";

/** Round flag with a 2px white ring. Default 28; pass size="small" for 20. */
export function CountryFlag({
  iso2,
  width,
  size = "default",
}: {
  iso2: string;
  width?: number;
  size?: "default" | "small";
}) {
  const dim = width ?? (size === "small" ? 20 : 28);
  return (
    <View
      style={[
        styles.ring,
        {
          width: dim,
          height: dim,
          borderRadius: dim / 2,
        },
      ]}
    >
      <Image
        source={{ uri: flagImageUrl(iso2) }}
        style={{
          width: dim,
          height: dim,
          borderRadius: dim / 2,
        }}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    borderWidth: 2,
    borderColor: "#ffffff",
    overflow: "hidden",
    backgroundColor: "#f3f5f9",
  },
});
