import { router } from "expo-router";
import {
  editRoute,
  signupRoute,
  type OnboardingFrom,
} from "@/lib/onboardingFlow";

/** Every Finish / Finish now / Still to add tap goes through here. */
export function openProfileStep(
  step: number | null | undefined,
  from: OnboardingFrom,
  mode: "edit" | "signup" = "edit",
): void {
  if (step == null || step < 1 || step > 13) return;
  if (mode === "signup") {
    const route = signupRoute(step);
    router.push(route as never);
    return;
  }
  const route = editRoute(step, from);
  router.push(route as never);
}
