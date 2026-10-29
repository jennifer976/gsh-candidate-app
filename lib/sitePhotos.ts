import type { ImageSourcePropType } from "react-native";

export const SITE_PHOTOS = {
  "hero-walker": require("../assets/photos/hero-walker.webp"),
  "about-city": require("../assets/photos/about-city.webp"),
  dublin: require("../assets/photos/dublin.webp"),
  arrival: require("../assets/photos/arrival.webp"),
  toronto: require("../assets/photos/toronto.webp"),
  sydney: require("../assets/photos/sydney.webp"),
  berlin: require("../assets/photos/berlin.webp"),
  amsterdam: require("../assets/photos/amsterdam.webp"),
  newyork: require("../assets/photos/newyork.webp"),
  specialists: require("../assets/photos/specialists.webp"),
  relocation: require("../assets/photos/relocation.webp"),
  money: require("../assets/photos/money.webp"),
  employers: require("../assets/photos/employers.webp"),
  "talent-pool": require("../assets/photos/talent-pool.webp"),
  "plan-hero": require("../assets/photos/plan-hero.webp"),
  "plan-perks": require("../assets/photos/plan-perks.webp"),
  uk: require("../assets/photos/uk.webp"),
  uae: require("../assets/photos/uae.webp"),
} as const satisfies Record<string, ImageSourcePropType>;

export type SitePhotoKey = keyof typeof SITE_PHOTOS;

/** Same photo the website /countries page uses for each guide. */
export const COUNTRY_PHOTO: Record<string, SitePhotoKey> = {
  australia: "sydney",
  canada: "toronto",
  denmark: "money",
  finland: "employers",
  france: "plan-hero",
  germany: "berlin",
  iceland: "relocation",
  ireland: "dublin",
  netherlands: "amsterdam",
  "new-zealand": "plan-perks",
  norway: "arrival",
  portugal: "relocation",
  singapore: "talent-pool",
  spain: "arrival",
  sweden: "relocation",
  switzerland: "specialists",
  uae: "uae",
  uk: "uk",
  usa: "newyork",
};

export const PHOTO_ALT: Partial<Record<SitePhotoKey, string>> = {
  sydney: "Sydney Harbour and the Opera House",
  toronto: "A street in downtown Toronto",
  berlin: "A Berlin street with the television tower in the distance",
  dublin: "Ha'penny Bridge over the Liffey in Dublin",
  amsterdam: "Canal houses along a canal in Amsterdam",
  newyork: "Tall buildings on a street in New York",
  uk: "A sunny canal in Manchester city centre",
  uae: "The Louvre Abu Dhabi",
  "hero-walker": "A professional walking forward with a laptop and backpack",
};

export function sitePhoto(key: SitePhotoKey): ImageSourcePropType {
  return SITE_PHOTOS[key];
}

export function countryPhoto(slug: string): ImageSourcePropType | null {
  const key = COUNTRY_PHOTO[slug];
  return key ? SITE_PHOTOS[key] : null;
}
