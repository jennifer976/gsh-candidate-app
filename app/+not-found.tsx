import { Redirect } from "expo-router";

/** Unknown routes land on the entry redirect (login or home). */
export default function NotFound() {
  return <Redirect href="/" />;
}
