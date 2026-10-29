import { useAppLanguage, toIntlLocale } from "@/lib/i18n";
import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { CountryFlag } from "@/components/CountryFlag";
import { GUIDE_COUNTRY_CODES } from "@/lib/guideCountryCodes";
import countryOptions from "@/lib/country-options.json";
import { canonicalCountryCode, countryDisplayName } from "@/lib/countries";
import { colors, fontFamily } from "@/lib/theme";

export function CountryPicker({
  label,
  hint,
  value,
  onChange,
  multiple = false,
  placeholder,
  guideFirst = false,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  multiple?: boolean;
  placeholder?: string;
  /** List the 19 guide countries first, then A–Z. */
  guideFirst?: boolean;
}) {
  const ac = useAccountCopy();
  const locale = useAppLanguage((s) => s.locale);
  const intlLocale = toIntlLocale(locale);
  const countryName = (code: string) =>
    /^[A-Z]{2}$/.test(code)
      ? countryDisplayName(code, locale)
      : countryOptions.find((c) => c.code === code)?.label || code;
  const normalise = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase(intlLocale);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const selected = value
    .split(",")
    .map((v) => canonicalCountryCode(v) || v.trim())
    .filter(Boolean);

  const ordered = useMemo(() => {
    if (!guideFirst) return countryOptions;
    const guideSet = new Set<string>(GUIDE_COUNTRY_CODES);
    const guides = GUIDE_COUNTRY_CODES.map(
      (code) =>
        countryOptions.find((c) => c.code === code) ?? {
          code,
          label: countryDisplayName(code, "en"),
        },
    );
    const rest = countryOptions
      .filter((c) => !guideSet.has(c.code))
      .slice()
      .sort((a, b) => a.label.localeCompare(b.label, "en"));
    return [...guides, ...rest];
  }, [guideFirst]);

  const needle = normalise(query.trim());
  const exact = canonicalCountryCode(query);
  const choices = ordered
    .filter(
      (c) =>
        !selected.includes(c.code) &&
        (!needle ||
          c.code === exact ||
          normalise(c.label).includes(needle) ||
          normalise(countryName(c.code)).includes(needle)),
    )
    .slice(0, guideFirst && !needle ? 30 : 12);
  const choose = (code: string) => {
    onChange(multiple ? [...selected, code].join(", ") : code);
    setQuery("");
    setOpen(false);
  };
  return (
    <View style={{ gap: 8 }}>
      <Text
        style={{
          color: colors.navy,
          fontFamily: fontFamily.semiBold,
          fontSize: 14,
        }}
      >
        {label}
      </Text>
      {hint ? (
        <Text style={{ color: colors.text2, fontSize: 13, lineHeight: 19 }}>
          {hint}
        </Text>
      ) : null}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {selected.map((code) => (
          <View
            key={code}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              paddingLeft: 6,
              paddingRight: 10,
              paddingVertical: 6,
              borderRadius: 999,
              backgroundColor: colors.panel,
            }}
          >
            <CountryFlag iso2={code.toLowerCase()} size="small" />
            <Text
              style={{
                color: colors.navy,
                fontFamily: fontFamily.semiBold,
                fontSize: 13,
              }}
            >
              {countryName(code)}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={ac("Remove {country}", {
                country: countryName(code),
              })}
              onPress={() =>
                onChange(selected.filter((v) => v !== code).join(", "))
              }
              hitSlop={8}
              style={{ minWidth: 28, minHeight: 28, justifyContent: "center" }}
            >
              <Text style={{ color: colors.muted, fontSize: 16 }}>×</Text>
            </Pressable>
          </View>
        ))}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(!open)}
        style={{ minHeight: 44, justifyContent: "center" }}
      >
        <Text style={{ color: colors.navy, textDecorationLine: "underline" }}>
          {open
            ? ac("Close country list")
            : selected.length && !multiple
              ? ac("Change country")
              : multiple
                ? ac("Add a country")
                : placeholder || ac("Choose a country")}
        </Text>
      </Pressable>
      {open ? (
        <>
          <TextInput
            accessibilityLabel={ac("Search: {label}", {
              label: label.replace(/\s*\*$/, ""),
            })}
            placeholder={ac("Search country name")}
            placeholderTextColor={colors.muted}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="words"
            style={{
              minHeight: 52,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.line,
              padding: 12,
              color: colors.navy,
              fontSize: 16,
              fontFamily: fontFamily.regular,
              backgroundColor: colors.white,
            }}
          />
          {choices.map((c) => (
            <Pressable
              key={c.code}
              accessibilityRole="button"
              onPress={() => choose(c.code)}
              style={{
                minHeight: 44,
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                borderBottomWidth: 1,
                borderColor: colors.line,
              }}
            >
              <CountryFlag iso2={c.code.toLowerCase()} size="small" />
              <Text style={{ color: colors.navy, fontFamily: fontFamily.medium }}>
                {countryName(c.code)}
              </Text>
            </Pressable>
          ))}
          <Text
            accessibilityLiveRegion="polite"
            style={{ color: colors.muted, fontSize: 12 }}
          >
            {choices.length
              ? ac("Type more letters to narrow the list.")
              : ac("No matching country. Try another name.")}
          </Text>
        </>
      ) : null}
    </View>
  );
}
