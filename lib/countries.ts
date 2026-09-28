import countryNames from "@/data/countryNames.json";

const ISO_ALPHA_2_CODES =
  "AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW".split(
    " ",
  );

const aliases: Record<string, string> = {
  uk: "GB",
  unitedkingdom: "GB",
  greatbritain: "GB",
  england: "GB",
  usa: "US",
  us: "US",
  unitedstates: "US",
  unitedstatesofamerica: "US",
  uae: "AE",
  unitedarabemirates: "AE",
  southkorea: "KR",
  northkorea: "KP",
  czechrepublic: "CZ",
  czechia: "CZ",
  ivorycoast: "CI",
  coteivoire: "CI",
  drc: "CD",
  democraticrepublicofthecongo: "CD",
  congo: "CG",
  russia: "RU",
  vietnam: "VN",
  laos: "LA",
  bolivia: "BO",
  tanzania: "TZ",
  venezuela: "VE",
  moldova: "MD",
  syria: "SY",
  palestine: "PS",
  taiwan: "TW",
  capeverde: "CV",
};

const normalized = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]/g, "");

const NAMES = countryNames as Record<string, Record<string, string>>;

/** Hermes cannot name regions at runtime, so names are bundled (see scripts/sync-country-names.cjs). */
export function countryDisplayName(code: string, locale: string): string {
  const upper = code.trim().toUpperCase();
  const primary = locale.toLowerCase().split(/[-_]/)[0];
  return NAMES[primary]?.[upper] ?? NAMES.en[upper] ?? code;
}

let names: Map<string, string> | undefined;
function nameMap() {
  if (names) return names;
  names = new Map(Object.entries(aliases));
  for (const catalog of Object.values(NAMES)) {
    for (const [code, name] of Object.entries(catalog)) {
      const key = normalized(name);
      if (!names.has(key)) names.set(key, code);
    }
  }
  ISO_ALPHA_2_CODES.forEach((code) => names!.set(code.toLowerCase(), code));
  return names;
}

export function canonicalCountryCode(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  const upper = value.trim().toUpperCase();
  if (ISO_ALPHA_2_CODES.includes(upper)) return upper;
  return nameMap().get(normalized(value));
}

export function canonicalCountryList(value: string, maximum: number): string[] {
  const result: string[] = [];
  for (const item of value.split(",")) {
    const code = canonicalCountryCode(item);
    if (code && !result.includes(code)) result.push(code);
    if (result.length === maximum) break;
  }
  return result;
}

export function isCountryInputListValid(value: string): boolean {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .every((item) => Boolean(canonicalCountryCode(item)));
}
