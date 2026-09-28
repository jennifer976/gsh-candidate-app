import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import type { ErrorBoundaryProps } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

/** Uses system fonts and plain native views so recovery works before app fonts/providers load. */
export function AppErrorBoundary({retry}: ErrorBoundaryProps) {
  const ac = useAccountCopy();
  const [failed,setFailed] = useState(false);
  const [busy,setBusy] = useState(false);
  async function recover() { setBusy(true); try { await retry(); } catch { setFailed(true); } finally { setBusy(false); } }
  return <ScrollView contentContainerStyle={{flexGrow:1,justifyContent:"center",padding:28,backgroundColor:"#ffffff"}}>
    <View style={{width:"100%",maxWidth:560,alignSelf:"center"}} accessibilityRole="alert">
      <Text style={{fontSize:12,fontWeight:"700",letterSpacing:2,color:"#42e0e3"}}>GLOBAL SPONSOR HUB</Text>
      <Text style={{marginTop:20,fontSize:32,fontWeight:"800",letterSpacing:-1,color:"#0d194e"}}>{ac("Let's try that again.")}</Text>
      <Text style={{marginTop:16,fontSize:16,lineHeight:25,color:"#475569"}}>{ac("This screen could not be opened. If you were saving something, check its status before repeating the action.")}</Text>
      {failed ? <Text accessibilityRole="alert" style={{marginTop:16,color:"#0d194e"}}>{ac("This screen still could not be opened. You can try again.")}</Text> : null}
      <Pressable accessibilityRole="button" accessibilityState={{disabled:busy,busy}} disabled={busy} onPress={() => void recover()} style={{marginTop:28,minHeight:52,borderRadius:99,paddingHorizontal:28,alignItems:"center",justifyContent:"center",backgroundColor:"#0d194e",opacity:busy ? 0.6 : 1}}><Text style={{fontWeight:"700",fontSize:16,color:"#ffffff"}}>{ac(busy ? "Opening…" : "Try again")}</Text></Pressable>
    </View>
  </ScrollView>;
}
