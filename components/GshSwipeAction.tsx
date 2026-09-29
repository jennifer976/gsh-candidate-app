import type { ReactNode } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { RectButton, Swipeable } from "react-native-gesture-handler";
import { hapticMedium } from "@/lib/haptics";
import { colors, fontFamily } from "@/lib/theme";

type Action = {
  label: string;
  onPress: () => void;
  /** Destructive (red) vs primary brand action. */
  tone?: "primary" | "danger";
};

type Props = {
  children: ReactNode;
  /** Leading (left) actions — uncommon; prefer trailing. */
  leftActions?: Action[];
  /** Trailing (right) actions — Mail / Messages pattern. */
  rightActions?: Action[];
  enabled?: boolean;
};

/**
 * System-style swipe actions (Mail / Reminders), not custom card effects.
 * One primary trailing action is enough for most rows.
 */
export function GshSwipeAction({
  children,
  leftActions,
  rightActions,
  enabled = true,
}: Props) {
  if (!enabled || Platform.OS === "web") {
    return <>{children}</>;
  }

  const renderActions = (actions: Action[] | undefined, edge: "left" | "right") => {
    if (!actions?.length) return null;
    return (
      <View style={[styles.actions, edge === "left" ? styles.actionsLeft : styles.actionsRight]}>
        {actions.map((action) => (
          <RectButton
            key={action.label}
            style={[
              styles.actionBtn,
              action.tone === "danger" ? styles.actionDanger : styles.actionPrimary,
            ]}
            onPress={() => {
              void hapticMedium();
              action.onPress();
            }}
            accessibilityRole="button"
            accessibilityLabel={action.label}
          >
            <Text style={styles.actionLabel}>{action.label}</Text>
          </RectButton>
        ))}
      </View>
    );
  };

  return (
    <Swipeable
      friction={2}
      overshootFriction={8}
      enableTrackpadTwoFingerGesture
      renderLeftActions={
        leftActions?.length ? () => renderActions(leftActions, "left") : undefined
      }
      renderRightActions={
        rightActions?.length ? () => renderActions(rightActions, "right") : undefined
      }
    >
      {children}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  actionsLeft: { marginRight: 0 },
  actionsRight: { marginLeft: 0 },
  actionBtn: {
    width: 88,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  actionPrimary: { backgroundColor: colors.navy },
  actionDanger: { backgroundColor: colors.error },
  actionLabel: {
    fontSize: 13,
    fontFamily: fontFamily.semiBold,
    color: colors.white,
    textAlign: "center",
  },
});
