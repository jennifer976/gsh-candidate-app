import { focusManager } from "@tanstack/react-query";
import { useEffect } from "react";
import { AppState, type AppStateStatus } from "react-native";

/**
 * Maps React Native foreground/background to TanStack Query focus state so
 * `refetchOnWindowFocus` runs when the user returns to the app.
 */
export function QueryFocusSync() {
  useEffect(() => {
    const onChange = (status: AppStateStatus) => {
      focusManager.setFocused(status === "active");
    };
    const sub = AppState.addEventListener("change", onChange);
    onChange(AppState.currentState);
    return () => sub.remove();
  }, []);

  return null;
}
