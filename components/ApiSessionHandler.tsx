import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { getApiErrorStatus } from "@/lib/api-error";
import { useAuthStore } from "@/lib/auth-store";

/**
 * When an authenticated API call returns 401, clear stale tokens and return to login.
 */
export function ApiSessionHandler() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const qc = useQueryClient();

  useEffect(() => {
    if (!token) return;

    const onUnauthorized = (error: unknown) => {
      if (getApiErrorStatus(error) !== 401) return;
      clearAuth();
      qc.clear();
      router.replace("/login");
    };

    const unsubQuery = qc.getQueryCache().subscribe((event) => {
      if (event.type !== "updated") return;
      const { query } = event;
      if (query.state.status !== "error" || !query.state.error) return;
      onUnauthorized(query.state.error);
    });

    const unsubMutation = qc.getMutationCache().subscribe((event) => {
      if (event.type !== "updated") return;
      const { mutation } = event;
      if (mutation.state.status !== "error" || !mutation.state.error) return;
      onUnauthorized(mutation.state.error);
    });

    return () => {
      unsubQuery();
      unsubMutation();
    };
  }, [token, clearAuth, qc, router]);

  return null;
}
