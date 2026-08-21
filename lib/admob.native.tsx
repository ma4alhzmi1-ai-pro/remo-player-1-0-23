import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Constants from "expo-constants";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ComponentType, type ReactNode } from "react";
import { Alert, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/components/remo-ui";

type ConsentState = "loading" | "accepted" | "declined";
type AdMobModule = typeof import("react-native-google-mobile-ads");
type AdContextValue = { consent: ConsentState; setConsent: (next: Exclude<ConsentState, "loading">) => Promise<void> };

const CONSENT_KEY = "remo-player.ad-consent.v1";
const AdContext = createContext<AdContextValue | null>(null);

function getAdMob(): AdMobModule | null {
  if (Platform.OS === "web") return null;
  return require("react-native-google-mobile-ads") as AdMobModule;
}

function configuredBannerUnitId() {
  const unitId = Constants.expoConfig?.extra?.admobBannerUnitId;
  return typeof unitId === "string" && unitId.startsWith("ca-app-pub-") ? unitId : null;
}

export function AdMobProvider({ children }: { children: ReactNode }) {
  const [consent, setConsentState] = useState<ConsentState>("loading");

  useEffect(() => {
    void AsyncStorage.getItem(CONSENT_KEY).then((value) => setConsentState(value === "accepted" || value === "declined" ? value : "declined"));
  }, []);

  useEffect(() => {
    if (consent !== "accepted") return;
    const ads = getAdMob();
    if (!ads) return;
    void ads.default().setRequestConfiguration({ testDeviceIdentifiers: ["EMULATOR"] }).then(() => ads.default().initialize()).catch(() => undefined);
  }, [consent]);

  const setConsent = useCallback(async (next: Exclude<ConsentState, "loading">) => {
    await AsyncStorage.setItem(CONSENT_KEY, next);
    setConsentState(next);
  }, []);

  const value = useMemo(() => ({ consent, setConsent }), [consent, setConsent]);
  return <AdContext.Provider value={value}>{children}</AdContext.Provider>;
}

export function useAdMob() {
  const context = useContext(AdContext);
  if (!context) throw new Error("useAdMob must be used within AdMobProvider");
  return context;
}

export function OptionalBannerAd() {
  const { consent } = useAdMob();
  const ads = getAdMob();
  if (consent !== "accepted" || !ads) return null;
  const Banner = ads.BannerAd as ComponentType<any>;
  const unitId = configuredBannerUnitId() ?? ads.TestIds.BANNER;
  return <View style={styles.bannerWrap}><Text style={styles.sponsorLabel}>إعلان</Text><Banner unitId={unitId} size={ads.BannerAdSize.BANNER} requestOptions={{ requestNonPersonalizedAdsOnly: true }} /></View>;
}

export function AdConsentSettings() {
  const { consent, setConsent } = useAdMob();
  const openChoice = () => {
    Alert.alert("إعلانات REMO PLAYER", "تظهر الإعلانات خارج شاشة تشغيل الموسيقى والفيديو، وتُستخدم في وضع الاختبار إلى أن تضع معرّفات AdMob الخاصة بك. هل ترغب في تفعيلها؟", [
      { text: "ليس الآن", style: "cancel" },
      { text: "إيقاف الإعلانات", style: "destructive", onPress: () => void setConsent("declined") },
      { text: "تفعيل الإعلانات", onPress: () => void setConsent("accepted") },
    ]);
  };
  const label = consent === "accepted" ? "الإعلانات مفعلة" : consent === "loading" ? "جارٍ قراءة تفضيلك" : "الإعلانات متوقفة";
  return <Pressable onPress={openChoice} style={({ pressed }) => [styles.settingRow, pressed && styles.dimmed]}><View style={styles.settingIcon}><MaterialIcons name="campaign" size={22} color={colors.cyan} /></View><View style={styles.settingCopy}><Text style={styles.settingTitle}>إعلانات AdMob</Text><Text style={styles.settingDescription}>{label} · لا تظهر أثناء تشغيل الوسائط</Text></View><MaterialIcons name="chevron-left" size={22} color={colors.muted} /></Pressable>;
}

export function RewardedAdButton() {
  const { consent } = useAdMob();
  const rewardedRef = useRef<any>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (consent !== "accepted") { setReady(false); rewardedRef.current = null; return; }
    const ads = getAdMob();
    if (!ads) return;
    const rewarded = ads.RewardedAd.createForAdRequest(ads.TestIds.REWARDED, { requestNonPersonalizedAdsOnly: true });
    rewardedRef.current = rewarded;
    const loaded = rewarded.addAdEventListener(ads.AdEventType.LOADED, () => setReady(true));
    const closed = rewarded.addAdEventListener(ads.AdEventType.CLOSED, () => { setReady(false); rewarded.load(); });
    rewarded.load();
    return () => { loaded(); closed(); rewardedRef.current = null; };
  }, [consent]);

  const watch = () => {
    if (consent !== "accepted") { Alert.alert("فعّل الإعلانات أولاً", "افتح إعدادات AdMob وامنح موافقتك قبل تشغيل إعلان المكافأة."); return; }
    if (!ready || !rewardedRef.current) { Alert.alert("الإعلان قيد التجهيز", "سيظهر إعلان المكافأة عند جاهزيته. يمكنك المتابعة في استخدام التطبيق الآن."); return; }
    rewardedRef.current.show();
  };
  return <Pressable onPress={watch} style={({ pressed }) => [styles.rewardButton, pressed && styles.dimmed]}><MaterialIcons name="card-giftcard" size={20} color={colors.cyan} /><View style={styles.rewardCopy}><Text style={styles.rewardTitle}>دعم REMO PLAYER</Text><Text style={styles.rewardDescription}>{ready ? "شاهد إعلاناً قصيراً للمكافأة" : "إعلان مكافأة اختياري"}</Text></View><MaterialIcons name="play-circle-outline" size={24} color={colors.cyan} /></Pressable>;
}

const styles = StyleSheet.create({
  bannerWrap: { minHeight: 58, marginHorizontal: 16, marginTop: 17, marginBottom: 2, alignItems: "center", justifyContent: "center", borderRadius: 15, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, overflow: "hidden" },
  sponsorLabel: { position: "absolute", top: 4, right: 8, color: colors.muted, fontSize: 8, zIndex: 1 },
  settingRow: { minHeight: 76, paddingHorizontal: 13, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: "row-reverse", alignItems: "center", gap: 11 },
  settingIcon: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "#10263B" },
  settingCopy: { flex: 1, alignItems: "flex-end" },
  settingTitle: { color: colors.text, fontSize: 14, lineHeight: 20, fontWeight: "800", textAlign: "right" },
  settingDescription: { color: colors.muted, fontSize: 11, lineHeight: 17, textAlign: "right" },
  rewardButton: { minHeight: 65, marginHorizontal: 16, marginTop: 13, borderRadius: 16, paddingHorizontal: 13, backgroundColor: "#0D2638", borderWidth: 1, borderColor: "#1E6382", flexDirection: "row-reverse", alignItems: "center", gap: 10 },
  rewardCopy: { flex: 1, alignItems: "flex-end" },
  rewardTitle: { color: colors.text, fontSize: 13, fontWeight: "900" },
  rewardDescription: { color: colors.muted, fontSize: 10, marginTop: 3 },
  dimmed: { opacity: 0.65 },
});
