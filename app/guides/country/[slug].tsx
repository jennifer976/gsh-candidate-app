import { Redirect, useLocalSearchParams } from "expo-router";
import { countryForVisaGuide } from "@/lib/publicResources";

/** The website merged standalone country guides into the country pages. */
export default function RetiredCountryGuide() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const country = countryForVisaGuide(String(slug ?? ""));
  return <Redirect href={country ? `/country/${country.slug}` : "/countries"} />;
}
