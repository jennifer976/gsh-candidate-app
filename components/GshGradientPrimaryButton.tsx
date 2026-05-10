import { LinearGradient } from "expo-linear-gradient";
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { colors, gradient } from "@/lib/theme";

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  /** Applied to the outer pressable (e.g. marginTop) */
  containerStyle?: ViewStyle;
};

/** Primary CTA — teal → purple gradient matching web auth. */
export function GshGradientPrimaryButton({ title, onPress, disabled, loading, containerStyle }: Props) {
  const dim = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={dim}
      style={[styles.outer, containerStyle, dim && styles.dimmed]}
    >
      <LinearGradient colors={[...gradient.authCTA]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.grad}>
        {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.text}>{title}</Text>}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outer: { borderRadius: 12, overflow: "hidden" },
  dimmed: { opacity: 0.72 },
  grad: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },
  text: { color: colors.white, fontSize: 17, fontWeight: "600" },
});
