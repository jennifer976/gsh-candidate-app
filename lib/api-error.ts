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
export function presentApiError(e: unknown): ApiErrorPresentation {
  const status = getApiErrorStatus(e);
  const message = getApiErrorMessage(e);

  if (status === 401) {
    return {
      title: "Session expired",
      subtitle: "Please sign in again to continue.",
      isSessionExpired: true,
    };
  }
  if (status === 0) {
    const timedOut = /timed out/i.test(message);
    return {
      title: timedOut ? "Request timed out" : "Could not reach the server",
      subtitle: timedOut
        ? "The connection took too long. Pull down to retry."
        : "Check your connection and pull down to retry.",
      isSessionExpired: false,
    };
  }
  if (status >= 500) {
    return {
      title: "Server error",
      subtitle: message || "Something went wrong on our side. Pull down to retry in a moment.",
      isSessionExpired: false,
    };
  }
  return {
    title: "Could not load data",
    subtitle: message || "Pull down to retry.",
    isSessionExpired: false,
  };
}
