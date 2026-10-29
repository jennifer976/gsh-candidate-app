import { Image, StyleSheet, Text, View } from "react-native";
import { Eyebrow, GshMark } from "@/components/gsh-brand";
import { PHOTO_ALT, SITE_PHOTOS, type SitePhotoKey } from "@/lib/sitePhotos";
import { colors, fontFamily, shadows } from "@/lib/theme";

type Props = {
  label: string;
  title: string;
  photo: SitePhotoKey;
  onNavyEyebrow?: boolean;
};

/** Navy step hero with a photo breaking the top-right edge. */
export function StepHeroCard({ label, title, photo, onNavyEyebrow = true }: Props) {
  const alt = PHOTO_ALT[photo];
  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <GshMark size={160} color="rgba(255,255,255,0.06)" style={styles.mark} />
        <View style={styles.copy}>
          <Eyebrow onDark={onNavyEyebrow}>{label}</Eyebrow>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
        </View>
      </View>
      <Image
        source={SITE_PHOTOS[photo]}
        style={styles.photo}
        resizeMode="cover"
        accessibilityLabel={alt}
        accessible={Boolean(alt)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 8,
    marginHorizontal: 20,
    height: 116,
  },
  card: {
    height: 116,
    borderRadius: 24,
    backgroundColor: colors.navy,
    overflow: "visible",
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingRight: 120,
  },
  mark: {
    position: "absolute",
    top: -20,
    left: -28,
  },
  copy: { gap: 6, zIndex: 1 },
  title: {
    fontFamily: fontFamily.headingStrong,
    fontSize: 22,
    lineHeight: 26,
    color: colors.white,
  },
  photo: {
    position: "absolute",
    right: 14,
    top: -18,
    width: 98,
    height: 118,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: colors.white,
    transform: [{ rotate: "3deg" }],
    ...shadows.lift,
  },
});
