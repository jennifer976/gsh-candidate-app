import {
  Image,
  type ImageSourcePropType,
  type ImageStyle,
  type StyleProp,
} from "react-native";
import {
  PHOTO_ALT,
  SITE_PHOTOS,
  type SitePhotoKey,
} from "@/lib/sitePhotos";
import { colors, shadows } from "@/lib/theme";

export function BreakoutPhoto({
  photo,
  source,
  rotate = 0,
  style,
}: {
  photo?: SitePhotoKey;
  source?: ImageSourcePropType;
  rotate?: number;
  style?: StyleProp<ImageStyle>;
}) {
  const resolved = source ?? (photo ? SITE_PHOTOS[photo] : undefined);
  if (!resolved) return null;

  const alt = photo ? PHOTO_ALT[photo] : undefined;

  return (
    <Image
      source={resolved}
      {...(alt
        ? { accessibilityLabel: alt, accessible: true }
        : { accessible: false })}
      style={[
        {
          borderWidth: 3,
          borderColor: colors.white,
          borderRadius: 20,
          transform: [{ rotate: `${rotate}deg` }],
          ...shadows.photo,
        },
        style,
      ]}
      resizeMode="cover"
    />
  );
}
