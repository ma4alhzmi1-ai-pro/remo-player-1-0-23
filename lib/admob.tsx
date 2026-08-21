import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/components/remo-ui";

type ConsentState = "loading" | "accepted" | "declined";
type AdContextValue = { consent: ConsentState; setConsent: (next: Exclude<ConsentState, "loading">) => Promise<void> };
const CONSENT_KEY = "remo-player.ad-consent.v1";
const AdContext = createContext<AdContextValue | null>(null);

export function AdMobProvider({ children }: { children: ReactNode }) {
  const [consent, setConsentState] = useState<ConsentState>("loading");
  useEffect(() => { void AsyncStorage.getItem(CONSENT_KEY).then((value) => setConsentState(value === "accepted" || value === "declined" ? value : "declined")); }, []);
  const setConsent = useCallback(async (next: Exclude<ConsentState, "loading">) => { await AsyncStorage.setItem(CONSENT_KEY, next); setConsentState(next); }, []);
  const value = useMemo(() => ({ consent, setConsent }), [consent, setConsent]);
  return <AdContext.Provider value={value}>{children}</AdContext.Provider>;
}

export function useAdMob() {
  const context = useContext(AdContext);
  if (!context) throw new Error("useAdMob must be used within AdMobProvider");
  return context;
}

export function OptionalBannerAd() { return null; }

export function AdConsentSettings() {
  const { consent, setConsent } = useAdMob();
  const openChoice = () => Alert.alert("إعلانات REMO PLAYER", "تعمل إعلانات AdMob في نسخة Android المنشورة فقط. يمكنك تحديد تفضيلك هنا قبل إنشاء APK.", [
    { text: "إيقاف", onPress: () => void setConsent("declined"), style: "destructive" },
    { text: "تفعيل", onPress: () => void setConsent("accepted") },
  ]);
  return <Pressable onPress={openChoice} style={({ pressed }) => [styles.row, pressed && styles.dimmed]}><View style={styles.icon}><MaterialIcons name="campaign" size={22} color={colors.cyan} /></View><View style={styles.copy}><Text style={styles.title}>إعلانات AdMob</Text><Text style={styles.description}>{consent === "accepted" ? "الإعلانات مفعلة لـ APK" : "الإعلانات متوقفة"}</Text></View><MaterialIcons name="chevron-left" size={22} color={colors.muted} /></Pressable>;
}

export function RewardedAdButton() { return <Pressable onPress={() => Alert.alert("إعلان مكافأة", "إعلانات المكافأة تعمل في نسخة Android المنشورة بعد ربط AdMob، وليست متاحة في معاينة الويب.")} style={({ pressed }) => [styles.reward, pressed && styles.dimmed]}><MaterialIcons name="card-giftcard" size={20} color={colors.cyan} /><View style={styles.copy}><Text style={styles.title}>دعم REMO PLAYER</Text><Text style={styles.description}>إعلان مكافأة متاح في APK</Text></View><MaterialIcons name="play-circle-outline" size={24} color={colors.cyan} /></Pressable>; }

const styles = StyleSheet.create({
  row: { minHeight: 76, paddingHorizontal: 13, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: "row-reverse", alignItems: "center", gap: 11 }, icon: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "#10263B" }, copy: { flex: 1, alignItems: "flex-end" }, title: { color: colors.text, fontSize: 14, lineHeight: 20, fontWeight: "800", textAlign: "right" }, description: { color: colors.muted, fontSize: 11, lineHeight: 17, textAlign: "right" }, reward: { minHeight: 65, marginHorizontal: 16, marginTop: 13, borderRadius: 16, paddingHorizontal: 13, backgroundColor: "#0D2638", borderWidth: 1, borderColor: "#1E6382", flexDirection: "row-reverse", alignItems: "center", gap: 10 }, dimmed: { opacity: 0.65 },
});
