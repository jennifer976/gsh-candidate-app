"use client";
import { useCallback } from "react";
import { useAppLanguage } from "@/lib/i18n";
import copy from "@/data/accountCopy.json";

/** Translate explicit interface copy. Never pass user-written content. */
export function useAccountCopy() {
  const locale = useAppLanguage((s) => s.locale);
  return useCallback(
    (key: string, values: Record<string, string | number> = {}) => {
      const catalog: Record<string, string> =
        copy[locale as keyof typeof copy] ?? copy.en;
      return (catalog[key] ?? key).replace(
        /\{(\w+)\}/g,
        (match, name: string) =>
          Object.prototype.hasOwnProperty.call(values, name)
            ? String(values[name])
            : match,
      );
    },
    [locale],
  );
}
