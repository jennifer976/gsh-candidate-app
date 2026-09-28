import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  appCopy,
  normalizeAppLanguage,
  toIntlLocale,
  type AppCopyKey,
  type AppLanguage,
} from "./catalog";

type LanguageState = {
  locale: AppLanguage;
  setLocale: (locale: AppLanguage) => void;
};
export const useAppLanguage = create<LanguageState>()(
  persist(
    (set) => ({
      locale: "en",
      setLocale: (locale) => set({ locale: normalizeAppLanguage(locale) }),
    }),
    {
      name: "global-sponsor-hub-language",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ locale: state.locale }),
      merge: (persisted, current) => ({
        ...current,
        locale: normalizeAppLanguage(
          (persisted as { locale?: unknown } | undefined)?.locale,
        ),
      }),
    },
  ),
);
export function useAppCopy() {
  const locale = useAppLanguage((state) => state.locale);
  const intlLocale = toIntlLocale(locale);
  const t = useCallback(
    (key: AppCopyKey, values?: Record<string, string | number>) =>
      appCopy(locale, key, values),
    [locale],
  );
  return { t, locale, intlLocale };
}
export { toIntlLocale };
