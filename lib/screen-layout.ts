import type { ViewStyle } from "react-native";

/** Breathing room between native stack/tab header and first in-screen content */
export const STACK_HEADER_BODY_GAP = 20;

/** ScrollView content under a stack header (Tools, Settings, ATS, etc.) */
export const stackScrollContentStyle: ViewStyle = {
  paddingHorizontal: 16,
  paddingTop: STACK_HEADER_BODY_GAP,
  paddingBottom: 48,
};

/** FlatList header block with title/intro under stack or tab header */
export const stackListLeadStyle: ViewStyle = {
  paddingHorizontal: 16,
  paddingTop: STACK_HEADER_BODY_GAP,
  paddingBottom: 10,
};

/** Fixed header above FlatList (partners search, notifications) */
export const stackFlatListHeadWrapStyle: ViewStyle = {
  paddingHorizontal: 16,
  paddingTop: STACK_HEADER_BODY_GAP,
  paddingBottom: 12,
};
