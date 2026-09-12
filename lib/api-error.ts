import { appCopy, type AppLanguage } from "./i18n/catalog";
import type { ApiError } from "./api-client";

export function isApiError(e: unknown): e is ApiError {
  return (
    typeof e === "object" &&
    e !== null &&
    "message" in e &&
    typeof (e as ApiError).message === "string" &&
    "status" in e &&
    typeof (e as ApiError).status === "number"
  );
}

export function getApiErrorStatus(e: unknown): number {
  return isApiError(e) ? e.status : 0;
}

export function getApiErrorMessage(e: unknown): string {
  if (isApiError(e)) return e.message;
  if (e instanceof Error) return e.message;
  return "Something went wrong";
}

export type ApiErrorPresentation = {
  title: string;
  subtitle: string;
  isSessionExpired: boolean;
};

/** User-facing copy — avoids blaming connectivity when the API returned a real error. */
export function presentApiError(
  e: unknown,
  locale: AppLanguage = "en",
): ApiErrorPresentation {
  const t = (key: Parameters<typeof appCopy>[1]) => appCopy(locale, key);
  const status = getApiErrorStatus(e);
  const message = getApiErrorMessage(e);

  if (status === 401) {
    return {
      title: t("errorSession"),
      subtitle: t("errorSessionHelp"),
      isSessionExpired: true,
    };
  }
  if (status === 0) {
    const timedOut = /timed out/i.test(message);
    return {
      title: timedOut ? t("errorTimeout") : t("errorConnection"),
      subtitle: timedOut ? t("errorTimeoutHelp") : t("errorConnectionHelp"),
      isSessionExpired: false,
    };
  }
  if (status >= 500) {
    return {
      title: t("errorServer"),
      subtitle: t("errorServerHelp"),
      isSessionExpired: false,
    };
  }
  return {
    title: t("errorLoad"),
    subtitle: t("errorLoadHelp"),
    isSessionExpired: false,
  };
}
