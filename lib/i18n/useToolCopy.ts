"use client";
import { useCallback } from "react";
import { useAppLanguage } from "@/lib/i18n";
import { toolCopy } from "./toolCopy";
export function useToolCopy() {
  const locale = useAppLanguage(s => s.locale);
  return useCallback(
    (key: string, values: Record<string, string | number> = {}) =>
      toolCopy(locale, key, values),
    [locale],
  );
}
