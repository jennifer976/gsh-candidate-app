import type { ReactNode } from "react";
import { Image, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { type IconName } from "@/components/Icon";
import { StatChip } from "@/components/v3/StatChip";
import { FloatIn } from "@/lib/motion";
import {
  PHOTO_ALT,
  SITE_PHOTOS,
  type SitePhotoKey,
} from "@/lib/sitePhotos";
import { colors, fontFamily, shadows } from "@/lib/theme";

export function PhotoEmpty({
  photo,
  chipIcon,
  chipLabel,
  title,
  body,
  children,
  style,
}: {
  photo: SitePhotoKey;
  chipIcon: IconName;
  chipLabel: string;
  title: string;
  body: string;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const alt = PHOTO_ALT[photo];

  return (
    <View style={[{ paddingTop: 36, paddingHorizontal: 24 }, style]}>
      <View
        style={{
          width: 200,
          height: 170,
          alignSelf: "center",
          marginBottom: 24,
        }}
      >
        <Image
          source={SITE_PHOTOS[photo]}
          accessibilityLabel={alt}
          accessible={Boolean(alt)}
          {...(alt ? {} : { accessible: false })}
          style={{
            position: "absolute",
            left: 10,
            width: 150,
            height: 170,
            borderRadius: 24,
            ...shadows.photo,
          }}
          resizeMode="cover"
        />
        <FloatIn delay={200} style={{ position: "absolute", right: 0, bottom: -12 }}>
          <StatChip icon={chipIcon} label={chipLabel} />
        </FloatIn>
      </View>
      <Text
        accessibilityRole="header"
        style={{
          fontFamily: fontFamily.headingStrong,
          fontSize: 20,
          lineHeight: 24,
          color: colors.navy,
          textAlign: "center",
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          marginTop: 8,
          fontFamily: fontFamily.regular,
          fontSize: 14,
          lineHeight: 21,
          color: colors.text2,
          textAlign: "center",
        }}
      >
        {body}
      </Text>
      {children ? <View style={{ marginTop: 20 }}>{children}</View> : null}
    </View>
  );
}
