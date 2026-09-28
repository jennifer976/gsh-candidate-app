import { useRouter } from "expo-router";
import { useCallback } from "react";
import { useAuthStore } from "@/lib/auth-store";

type PendingAction = { kind: "save_job" | "apply_job" | "follow_employer"; targetId: string };

/**
 * Guests can browse freely; personal actions send them to sign in and come back
 * (with the action replayed) through the candidate return intent.
 */
export function useSignInPrompt() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);

  const openSignIn = useCallback(
    (returnTo: string, action?: PendingAction) => {
      router.push({
        pathname: "/login",
        params: {
          returnTo,
          ...(action ? { pendingAction: action.kind, pendingTargetId: action.targetId } : {}),
        },
      });
    },
    [router],
  );

  const openRegister = useCallback(
    (returnTo?: string) => {
      router.push({ pathname: "/register", params: returnTo ? { returnTo } : {} });
    },
    [router],
  );

  return { signedIn: Boolean(token), openSignIn, openRegister };
}
