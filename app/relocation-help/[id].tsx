import Screen from "@/components/RelocationHelpRequestDetailScreen";
import { withSignIn } from "@/components/SignInGate";

export default withSignIn(Screen, {
  icon: "compass-outline",
  title: "Relocation help",
  body: "Sign in to ask a relocation specialist for help with your move.",
});
