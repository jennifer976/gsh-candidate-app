import type { ComponentType } from "react";
import type { SvgProps } from "react-native-svg";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Banknote,
  Bell,
  BellRing,
  Bookmark,
  BriefcaseBusiness,
  Building2,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  CircleHelp,
  ClipboardList,
  Coins,
  Compass,
  Earth,
  ExternalLink,
  FileText,
  Gift,
  GitCompare,
  Globe,
  Heart,
  House,
  Lock,
  Mail,
  MapPin,
  Megaphone,
  MessageCircle,
  MessageSquare,
  Newspaper,
  PenLine,
  Plane,
  Scale,
  Search,
  Share2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  User,
  UsersRound,
  X,
} from "lucide-react-native";

export const ICON_NAMES = [
  "house",
  "briefcase-business",
  "heart",
  "message-circle",
  "user",
  "bell",
  "bell-ring",
  "search",
  "arrow-up-right",
  "arrow-right",
  "arrow-left",
  "chevron-right",
  "chevron-down",
  "x",
  "sliders-horizontal",
  "globe",
  "map-pin",
  "circle-check",
  "banknote",
  "users-round",
  "file-text",
  "share-2",
  "compass",
  "earth",
  "git-compare",
  "clipboard-list",
  "coins",
  "plane",
  "newspaper",
  "megaphone",
  "circle-help",
  "mail",
  "message-square",
  "scale",
  "shield-check",
  "building-2",
  "pen-line",
  "lock",
  "star",
  "external-link",
  "gift",
  "sparkles",
  "bookmark",
] as const;

export type IconName = (typeof ICON_NAMES)[number];

const MAP: Record<IconName, ComponentType<SvgProps>> = {
  house: House,
  "briefcase-business": BriefcaseBusiness,
  heart: Heart,
  "message-circle": MessageCircle,
  user: User,
  bell: Bell,
  "bell-ring": BellRing,
  search: Search,
  "arrow-up-right": ArrowUpRight,
  "arrow-right": ArrowRight,
  "arrow-left": ArrowLeft,
  "chevron-right": ChevronRight,
  "chevron-down": ChevronDown,
  x: X,
  "sliders-horizontal": SlidersHorizontal,
  globe: Globe,
  "map-pin": MapPin,
  "circle-check": CircleCheck,
  banknote: Banknote,
  "users-round": UsersRound,
  "file-text": FileText,
  "share-2": Share2,
  compass: Compass,
  earth: Earth,
  "git-compare": GitCompare,
  "clipboard-list": ClipboardList,
  coins: Coins,
  plane: Plane,
  newspaper: Newspaper,
  megaphone: Megaphone,
  "circle-help": CircleHelp,
  mail: Mail,
  "message-square": MessageSquare,
  scale: Scale,
  "shield-check": ShieldCheck,
  "building-2": Building2,
  "pen-line": PenLine,
  lock: Lock,
  star: Star,
  "external-link": ExternalLink,
  gift: Gift,
  sparkles: Sparkles,
  bookmark: Bookmark,
};

type Props = {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  fill?: string;
};

/** Decorative thin-line icon. The surrounding control carries the accessibility label. */
export function Icon({
  name,
  size = 20,
  color = "#0d194e",
  strokeWidth = 1.8,
  fill = "none",
}: Props) {
  const Comp = MAP[name];
  return (
    <Comp
      width={size}
      height={size}
      color={color}
      strokeWidth={strokeWidth}
      fill={fill}
      accessible={false}
      importantForAccessibility="no"
    />
  );
}
