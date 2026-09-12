import { useAppLanguage } from "@/lib/i18n";
import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import countryOptions from "@/lib/country-options.json";
import { canonicalCountryCode } from "@/lib/countries";
import { colors, fontFamily } from "@/lib/theme";

export function CountryPicker({
  label,
  hint,
  value,
  onChange,
  multiple = false,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  multiple?: boolean;
}) {
  const ac = useAccountCopy();
  const locale = useAppLanguage((s) => s.locale);
  const countryName = (code: string) => {
    const fallback = countryOptions.find((c) => c.code === code)?.label || code;
    if (!/^[A-Z]{2}$/.test(code)) return fallback;
    try {
      return (
        new Intl.DisplayNames([locale], { type: "region" }).of(code) || fallback
      );
    } catch {
      return fallback;
    }
  };
  const normalise = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase(locale);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const selected = value
    .split(",")
    .map((v) => canonicalCountryCode(v) || v.trim())
    .filter(Boolean);
  const needle = normalise(query.trim());
  const exact = canonicalCountryCode(query);
  const choices = countryOptions
    .filter(
      (c) =>
        !selected.includes(c.code) &&
        (c.code === exact ||
          normalise(c.label).includes(needle) ||
          normalise(countryName(c.code)).includes(needle)),
    )
    .slice(0, 12);
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
        <Text style={{ color: colors.textMuted, fontSize: 12, lineHeight: 18 }}>
          {hint}
        </Text>
      ) : null}
      {selected.map((code) => (
        <View
          key={code}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            paddingHorizontal: 12,
            borderRadius: 16,
            backgroundColor: colors.surfaceMuted,
          }}
        >
          <Text
            style={{
              flex: 1,
              color: colors.navy,
              fontFamily: fontFamily.regular,
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
            style={{ minHeight: 44, justifyContent: "center" }}
          >
            <Text style={{ color: colors.navy }}>{ac("Remove")}</Text>
          </Pressable>
        </View>
      ))}
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
                : ac("Choose a country")}
        </Text>
      </Pressable>
      {open ? (
        <>
          <TextInput
            accessibilityLabel={ac("Search: {label}", {
              label: label.replace(/\s*\*$/, ""),
            })}
            placeholder={ac("Search country name")}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="words"
            style={{
              minHeight: 52,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border,
              padding: 12,
              color: colors.navy,
              fontSize: 16,
              fontFamily: fontFamily.regular,
            }}
          />
          {choices.map((c) => (
            <Pressable
              key={c.code}
              accessibilityRole="button"
              onPress={() => choose(c.code)}
              style={{
                minHeight: 44,
                justifyContent: "center",
                borderBottomWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ color: colors.navy }}>{countryName(c.code)}</Text>
            </Pressable>
          ))}
          <Text
            accessibilityLiveRegion="polite"
            style={{ color: colors.textMuted, fontSize: 12 }}
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
