import copy from "@/data/toolCopy.json";
/** For declared interface labels only. Never pass job, profile or user-entered text. */
export function toolCopy(
  locale: string,
  key: string,
  values: Record<string, string | number> = {},
) {
  const catalog: Record<string, string> =
    copy[locale as keyof typeof copy] ?? copy.en;
  return (catalog[key] ?? key).replace(/\{(\w+)\}/g, (match, name: string) =>
    Object.prototype.hasOwnProperty.call(values, name)
      ? String(values[name])
      : match,
  );
}
