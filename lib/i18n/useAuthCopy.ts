"use client";
import { useCallback } from "react";
import { useAppLanguage } from "@/lib/i18n";
import copy from "@/data/authCopy.json";
export type AuthCopyKey = keyof typeof copy.en;
export function useAuthCopy() {
  const locale = useAppLanguage((s) => s.locale);
  return useCallback(
    (key: AuthCopyKey, values: Record<string, string | number> = {}) => {
      const catalog = copy[locale as keyof typeof copy] ?? copy.en;
      return catalog[key].replace(/\{(\w+)\}/g, (match, name: string) =>
        Object.prototype.hasOwnProperty.call(values, name)
          ? String(values[name])
          : match,
      );
    },
    [locale],
  );
}
