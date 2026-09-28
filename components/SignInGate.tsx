import { Ionicons } from "@expo/vector-icons";
import { usePathname } from "expo-router";
import type { ComponentProps, ComponentType } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BrandStatePanel } from "@/components/gsh-brand";
import { useAuthStore } from "@/lib/auth-store";
import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { useSignInPrompt } from "@/lib/useSignInPrompt";
import { colors } from "@/lib/theme";

type IonName = ComponentProps<typeof Ionicons>["name"];

type GateCopy = {
  icon?: IonName;
  title?: string;
  body?: string;
};

export function SignInPanel({
  returnTo,
  icon = "lock-closed-outline",
  title = "Sign in to continue",
  body = "Create a free account or sign in to use this part of the app.",
  tone = "white",
}: GateCopy & { returnTo: string; tone?: "white" | "cyan" | "navy" }) {
  const ac = useAccountCopy();
  const { openSignIn, openRegister } = useSignInPrompt();
  return (
    <BrandStatePanel
      icon={icon}
      tone={tone}
      title={ac(title)}
      body={ac(body)}
      primary={{ label: ac("Create a free account"), onPress: () => openRegister(returnTo) }}
      secondary={{ label: ac("Sign in"), onPress: () => openSignIn(returnTo) }}
    />
  );
}

function SignInGateScreen(copy: GateCopy) {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
    >
      <SignInPanel returnTo={pathname || "/(tabs)/home"} {...copy} />
    </ScrollView>
  );
}

/** Personal screens render a sign-in panel for guests instead of calling authenticated APIs. */
export function withSignIn<P extends object>(Screen: ComponentType<P>, copy: GateCopy = {}) {
  function Gated(props: P) {
    const token = useAuthStore((s) => s.token);
    if (!token) return <SignInGateScreen {...copy} />;
    return <Screen {...props} />;
  }
  Gated.displayName = `withSignIn(${Screen.displayName ?? Screen.name ?? "Screen"})`;
  return Gated;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  content: { flexGrow: 1, justifyContent: "center" },
});
