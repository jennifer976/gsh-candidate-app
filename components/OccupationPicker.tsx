import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { useEffect, useState } from "react";
import { Linking, Pressable, Text, TextInput, View } from "react-native";
import type { OccupationIdentifier } from "@/types/mobility";
import { colors, fontFamily } from "@/lib/theme";
type Search = typeof import("@/lib/occupations/search");
export function OccupationPicker({
  value,
  onChange,
}: {
  value: OccupationIdentifier[];
  onChange: (value: OccupationIdentifier[]) => void;
}) {
  const ac = useAccountCopy();
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState<Search>();
  const [failed, setFailed] = useState(false);
  const [results, setResults] = useState<ReturnType<Search["roleSuggestions"]>>(
    [],
  );
  useEffect(() => {
    let active = true;
    import("@/lib/occupations/search")
      .then((m) => {
        if (active) setSearch(m);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    const timer = setTimeout(
      () => setResults(search?.roleSuggestions(query) || []),
      180,
    );
    return () => clearTimeout(timer);
  }, [query, search]);
  const add = (code?: string) => {
    const label = query.trim();
    if (!label) return;
    const role = code
      ? {
          scheme: "ONET",
          schemeVersion: search!.OCCUPATION_VERSION,
          code,
          label,
        }
      : { scheme: "free_text", label };
    if (!value.some((v) => v.label === role.label && v.code === role.code))
      onChange([...value, role]);
    setQuery("");
    setResults([]);
  };
  return (
    <View style={{ gap: 10 }}>
      <TextInput
        accessibilityLabel={ac("Search roles you want")}
        value={query}
        onChangeText={setQuery}
        maxLength={240}
        placeholder={ac("Search a job title")}
        placeholderTextColor={colors.textMuted}
        style={{
          minHeight: 52,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 12,
          color: colors.navy,
          fontFamily: fontFamily.regular,
          fontSize: 16,
        }}
      />
      {query.trim().length >= 2 ? (
        <>
          <Text
            accessibilityLiveRegion="polite"
            style={{ fontSize: 12, color: colors.textMuted }}
          >
            {!search && !failed
              ? ac("Loading role suggestions…")
              : results.length
                ? ac("Choose the role that fits your work.")
                : ac("No close role found. You can keep your own title.")}
          </Text>
          {results.map((r) => (
            <Pressable
              key={r.code}
              accessibilityRole="button"
              onPress={() => add(r.code)}
              style={{
                minHeight: 48,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text
                style={{ color: colors.navy, fontFamily: fontFamily.semiBold }}
              >
                {r.label}
              </Text>
              {r.reason === "spelling" ? (
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>{ac("Possible spelling match")}</Text>
              ) : null}
            </Pressable>
          ))}
          <Pressable
            accessibilityRole="button"
            onPress={() => add()}
            style={{ minHeight: 44, justifyContent: "center" }}
          >
            <Text
              style={{ color: colors.navy, textDecorationLine: "underline" }}
            >{ac("I can’t find my role — use my title")}</Text>
          </Pressable>
        </>
      ) : null}
      {value.map((v, i) => (
        <View
          key={`${i}-${v.label}`}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            padding: 12,
            borderRadius: 16,
            backgroundColor: colors.surfaceMuted,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{ color: colors.navy, fontFamily: fontFamily.semiBold }}
            >
              {v.label}
            </Text>
            {search?.catalogueLabel(v) ? (
              <Text style={{ fontSize: 12, color: colors.textMuted }}>
                {search.catalogueLabel(v)}
              </Text>
            ) : null}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={ac("Remove: {label}", {label: v.label})}
            onPress={() => onChange(value.filter((_, j) => j !== i))}
            style={{ minHeight: 44, justifyContent: "center" }}
          >
            <Text style={{ color: colors.navy }}>{ac("Remove")}</Text>
          </Pressable>
        </View>
      ))}
      <Text style={{ fontSize: 12, lineHeight: 18, color: colors.textMuted }}>{ac("We keep your original title. English suggestions use O*NET 31.0 (CC BY 4.0), from the U.S. Department of Labor. Other languages can be saved as your own title. Selecting a role does not confirm qualifications or work rights.")}</Text>
      <View style={{ flexDirection: "row", gap: 20 }}>
        <Pressable
          accessibilityRole="link"
          onPress={() =>
            Linking.openURL("https://www.onetcenter.org/database.html")
          }
          style={{ minHeight: 44, justifyContent: "center" }}
        >
          <Text style={{ color: colors.navy, textDecorationLine: "underline" }}>{ac("Occupation source")}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="link"
          onPress={() =>
            Linking.openURL("https://creativecommons.org/licenses/by/4.0/")
          }
          style={{ minHeight: 44, justifyContent: "center" }}
        >
          <Text style={{ color: colors.navy, textDecorationLine: "underline" }}>{ac("Data licence")}</Text>
        </Pressable>
      </View>
    </View>
  );
}
