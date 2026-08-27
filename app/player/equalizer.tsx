import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PanResponder, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";

import { colors } from "@/components/remo-ui";
import { ScreenContainer } from "@/components/screen-container";
import { EQUALIZER_FREQUENCIES, EQUALIZER_PRESETS, clampEqualizerBand, isEqualizerPresetId, normalizeEqualizerBands, presetBands, type EqualizerPresetId } from "@/lib/equalizer-settings";
import { loadEqualizerSettings, saveEqualizerSettings, type RoomEffect, type StoredEqualizer } from "@/lib/equalizer-storage";
import { openBluetoothAudioSettings, openNativeEqualizer } from "@/lib/native-equalizer";
import { applyNativeAudioEffects } from "@/lib/native-audio-controls";


const roomOptions: { id: RoomEffect; label: string }[] = [
  { id: "none", label: "لا شيء" },
  { id: "small", label: "غرفة صغيرة" },
  { id: "medium", label: "غرفة متوسطة" },
  { id: "large", label: "غرفة كبيرة" },
];

export default function EqualizerScreen() {
  const router = useRouter();
  const [enabled, setEnabled] = useState(true);
  const [preset, setPreset] = useState<EqualizerPresetId>("heavy-metal");
  const [bands, setBands] = useState(() => presetBands("heavy-metal"));
  const [room, setRoom] = useState<RoomEffect>("none");
  const [bass, setBass] = useState(0);
  const [virtualizer, setVirtualizer] = useState(4);
  const [nativeStatus, setNativeStatus] = useState<"idle" | "panel" | "fallback" | "unsupported">("idle");
  const [bluetoothStatus, setBluetoothStatus] = useState<"idle" | "settings" | "pairing" | "unsupported">("idle");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    void loadEqualizerSettings().then((saved) => {
        setEnabled(Boolean(saved.enabled));
        setPreset(isEqualizerPresetId(saved.preset) ? saved.preset : "custom");
        setBands(normalizeEqualizerBands(saved.bands ?? []));
        setRoom(saved.room ?? "none");
        setBass(Math.max(0, Math.min(100, saved.bass ?? 0)));
        setVirtualizer(Math.max(0, Math.min(100, saved.virtualizer ?? 4)));
    }).finally(() => setIsHydrated(true));
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    const value: StoredEqualizer = { enabled, preset, bands: normalizeEqualizerBands(bands), room, bass, virtualizer };
    void saveEqualizerSettings(value);
    const timeout = setTimeout(() => { void applyNativeAudioEffects(value); }, 140);
    return () => clearTimeout(timeout);
  }, [bands, bass, enabled, isHydrated, preset, room, virtualizer]);

  const applyPreset = (id: EqualizerPresetId) => {
    setPreset(id);
    setBands(presetBands(id));
  };
  const setBand = (index: number, value: number) => {
    setPreset("custom");
    setBands((current) => current.map((band, bandIndex) => bandIndex === index ? clampEqualizerBand(value) : band));
  };
  const openAndroidPanel = async () => {
    const result = await openNativeEqualizer();
    setNativeStatus(result === "panel" ? "panel" : result === "sound-settings" ? "fallback" : "unsupported");
  };
  const openBluetooth = async () => {
    const result = await openBluetoothAudioSettings();
    setBluetoothStatus(result);
  };
  const nativeMessage = useMemo(() => {
    if (nativeStatus === "panel") return "تم فتح معادل Android. عدّل النطاقات هناك لتطبيق التأثير الفعلي على الصوت.";
    if (nativeStatus === "fallback") return "فُتحت إعدادات الصوت لأن جهازك لا يوفّر لوحة معادل مستقلة.";
    if (nativeStatus === "unsupported") return "لم يوفّر جهازك لوحة مؤثرات صوتية. استخدم معادل سماعتك أو معادل Android عند توفره.";
    return "يُطبَّق المنحنى المحفوظ على موسيقى REMO PLAYER عندما يكون مسار صوتي نشطاً ويدعم الجهاز مؤثرات Android.";
  }, [nativeStatus]);
  const bluetoothMessage = useMemo(() => {
    if (bluetoothStatus === "settings" || bluetoothStatus === "pairing") return "أكمل الاقتران أو اختر السماعة أو مكبر الصوت من إعدادات Bluetooth، ثم سيستخدم REMO PLAYER مخرج الصوت المتصل.";
    if (bluetoothStatus === "unsupported") return "لا يستطيع هذا الجهاز فتح إعدادات Bluetooth من داخل التطبيق. افتحها من شريط النظام ثم شغّل وسائطك.";
    return "اربط سماعة أو مكبر صوت عبر Bluetooth. سيقوم Android بتوجيه تشغيل الموسيقى والفيديو إلى الجهاز المتصل.";
  }, [bluetoothStatus]);

  return <ScreenContainer edges={["top", "bottom", "left", "right"]}>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}><Pressable onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)/music" as never)} style={styles.back}><MaterialIcons name="arrow-forward" size={27} color={colors.text} /></Pressable><Text style={styles.title}>هدف التعادل</Text><Switch value={enabled} onValueChange={setEnabled} trackColor={{ false: "#273343", true: "#25C43A" }} thumbColor={enabled ? "#21B72F" : "#A0AEC0"} /></View>
      <View style={[styles.panel, !enabled && styles.panelDisabled]}>
        <View style={styles.panelHeading}><Text style={styles.panelTitle}>إعداد مسبق</Text><MaterialIcons name="tune" size={22} color="#25C43A" /></View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetRow}>{EQUALIZER_PRESETS.map((item) => <Pressable key={item.id} onPress={() => applyPreset(item.id)} style={[styles.preset, preset === item.id && styles.presetActive]}><Text style={[styles.presetText, preset === item.id && styles.presetTextActive]}>{item.label}</Text></Pressable>)}</ScrollView>
        <View style={styles.chart}>{bands.map((value, index) => <FrequencyBand key={EQUALIZER_FREQUENCIES[index]} value={value} frequency={EQUALIZER_FREQUENCIES[index]} onChange={(next) => setBand(index, next)} disabled={!enabled} />)}</View>
      </View>
      <View style={styles.section}><Text style={styles.sectionTitle}>التردد</Text><View style={styles.roomRow}>{roomOptions.map((option) => <Pressable key={option.id} onPress={() => setRoom(option.id)} style={[styles.roomChip, room === option.id && styles.roomChipActive]}><Text style={[styles.roomText, room === option.id && styles.roomTextActive]}>{option.label}</Text></Pressable>)}</View></View>
      <View style={styles.section}><Text style={styles.sectionTitle}>تعزيز الصوت</Text><RangeControl value={bass} onChange={setBass} disabled={!enabled} /></View>
      <View style={styles.section}><Text style={styles.sectionTitle}>المحاكاة الظاهرية</Text><RangeControl value={virtualizer} onChange={setVirtualizer} disabled={!enabled} /></View>
      <View style={styles.nativeCard}><View style={styles.nativeCopy}><Text style={styles.nativeTitle}>تطبيق التأثير على Android</Text><Text style={styles.nativeText}>{nativeMessage}</Text></View><Pressable onPress={() => void openAndroidPanel()} style={styles.nativeButton}><MaterialIcons name="graphic-eq" size={22} color="#050905" /><Text style={styles.nativeButtonText}>فتح المعادل</Text></Pressable></View>
      <View style={[styles.nativeCard, styles.bluetoothCard]}><View style={styles.nativeCopy}><Text style={styles.nativeTitle}>السماعة أو مكبر الصوت</Text><Text style={styles.nativeText}>{bluetoothMessage}</Text></View><Pressable onPress={() => void openBluetooth()} style={[styles.nativeButton, styles.bluetoothButton]}><MaterialIcons name="bluetooth-audio" size={22} color="#071229" /><Text style={[styles.nativeButtonText, styles.bluetoothButtonText]}>إدارة Bluetooth</Text></Pressable></View>
      {Platform.OS !== "android" ? <Text style={styles.platformNote}>يتوفر تطبيق التأثير الصوتي من هذه الصفحة على Android فقط.</Text> : null}
    </ScrollView>
  </ScreenContainer>;
}

function FrequencyBand({ value, frequency, onChange, disabled }: { value: number; frequency: number; onChange: (value: number) => void; disabled: boolean }) {
  const height = 230;
  const percent = ((value + 12) / 24) * 100;
  const applyY = useCallback((y: number) => { if (!disabled) onChange(12 - (y / height) * 24); }, [disabled, onChange]);
  const responder = useMemo(() => PanResponder.create({ onStartShouldSetPanResponder: () => !disabled, onMoveShouldSetPanResponder: () => !disabled, onPanResponderGrant: (event) => applyY(event.nativeEvent.locationY), onPanResponderMove: (event) => applyY(event.nativeEvent.locationY) }), [applyY, disabled]);
  return <View style={styles.bandWrap}><Text style={styles.dbLabel}>{value >= 0 ? `${value}dB` : `${value}dB`}</Text><View {...responder.panHandlers} style={styles.bandHit}><View style={styles.bandRail}><View style={[styles.bandFill, { height: `${percent}%` }]} /><View style={[styles.bandThumb, { bottom: `${Math.max(0, Math.min(100, percent))}%` }]} /></View></View><Text style={styles.frequency}>{frequency >= 1000 ? `${frequency / 1000}kHz` : `${frequency}Hz`}</Text></View>;
}

function RangeControl({ value, onChange, disabled }: { value: number; onChange: (value: number) => void; disabled: boolean }) {
  const width = 290;
  const responder = useMemo(() => PanResponder.create({ onStartShouldSetPanResponder: () => !disabled, onMoveShouldSetPanResponder: () => !disabled, onPanResponderGrant: (event) => onChange(Math.round((event.nativeEvent.locationX / width) * 100)), onPanResponderMove: (event) => onChange(Math.round((event.nativeEvent.locationX / width) * 100)) }), [disabled, onChange]);
  const safeValue = Math.max(0, Math.min(100, value));
  return <View {...responder.panHandlers} style={styles.rangeHit}><View style={styles.rangeRail}><View style={[styles.rangeFill, { width: `${safeValue}%` }]} /><View style={[styles.rangeThumb, { left: `${safeValue}%` }]} /></View><Text style={styles.rangeValue}>{safeValue}%</Text></View>;
}

const styles = StyleSheet.create({
  content: { paddingBottom: 36, backgroundColor: "#050505" }, header: { minHeight: 74, paddingHorizontal: 18, flexDirection: "row-reverse", alignItems: "center", gap: 14 }, title: { flex: 1, color: "#FFFFFF", fontSize: 25, fontWeight: "900", textAlign: "right" }, back: { width: 44, height: 44, borderRadius: 16, alignItems: "center", justifyContent: "center" }, panel: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: "#202020", paddingVertical: 20 }, panelDisabled: { opacity: 0.42 }, panelHeading: { paddingHorizontal: 20, flexDirection: "row-reverse", alignItems: "center", gap: 8 }, panelTitle: { color: "#FFFFFF", fontSize: 17, fontWeight: "800" }, presetRow: { paddingHorizontal: 18, paddingVertical: 18, gap: 9 }, preset: { minHeight: 42, paddingHorizontal: 16, borderRadius: 22, backgroundColor: "#242424", alignItems: "center", justifyContent: "center" }, presetActive: { backgroundColor: "#25C43A" }, presetText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" }, presetTextActive: { color: "#071008" }, chart: { minHeight: 298, paddingHorizontal: 18, flexDirection: "row-reverse", justifyContent: "space-between" }, bandWrap: { flex: 1, alignItems: "center" }, dbLabel: { color: "#B5B5B5", fontSize: 12, fontWeight: "700", marginBottom: 10 }, bandHit: { width: 46, height: 230, justifyContent: "center", alignItems: "center" }, bandRail: { width: 6, height: 230, borderRadius: 3, backgroundColor: "#484848", overflow: "visible", justifyContent: "flex-end" }, bandFill: { width: 6, borderRadius: 3, backgroundColor: "#25C43A" }, bandThumb: { position: "absolute", width: 25, height: 25, borderRadius: 13, backgroundColor: "#F8FAFC", left: -10, transform: [{ translateY: 12 }] }, frequency: { color: "#C2C2C2", fontSize: 13, fontWeight: "700", marginTop: 12 }, section: { paddingHorizontal: 20, paddingTop: 24 }, sectionTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "800", textAlign: "right", marginBottom: 14 }, roomRow: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 9, justifyContent: "flex-start" }, roomChip: { minHeight: 41, paddingHorizontal: 15, borderRadius: 22, backgroundColor: "#242424", justifyContent: "center" }, roomChipActive: { backgroundColor: "#25C43A" }, roomText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" }, roomTextActive: { color: "#071008" }, rangeHit: { minHeight: 44, justifyContent: "center", paddingVertical: 8 }, rangeRail: { height: 7, borderRadius: 4, backgroundColor: "#3A3A3A", overflow: "visible" }, rangeFill: { height: 7, borderRadius: 4, backgroundColor: "#25C43A" }, rangeThumb: { position: "absolute", top: -8, width: 24, height: 24, borderRadius: 12, backgroundColor: "#F8FAFC", transform: [{ translateX: -12 }] }, rangeValue: { color: "#A5A5A5", fontSize: 11, fontWeight: "800", alignSelf: "flex-end", marginTop: 8 }, nativeCard: { marginHorizontal: 20, marginTop: 31, padding: 16, borderRadius: 20, backgroundColor: "#121A12", borderWidth: 1, borderColor: "#25572A", gap: 14 }, bluetoothCard: { marginTop: 12, backgroundColor: "#101722", borderColor: "#263E6B" }, nativeCopy: { alignItems: "flex-end" }, nativeTitle: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" }, nativeText: { color: "#B7C5B7", fontSize: 12, lineHeight: 19, textAlign: "right", marginTop: 5 }, nativeButton: { minHeight: 48, borderRadius: 14, backgroundColor: "#25C43A", flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 7 }, bluetoothButton: { backgroundColor: "#85B4FF" }, nativeButtonText: { color: "#071008", fontSize: 14, fontWeight: "900" }, bluetoothButtonText: { color: "#071229" }, platformNote: { color: "#A5A5A5", fontSize: 11, lineHeight: 18, textAlign: "center", paddingHorizontal: 28, marginTop: 16 },
});
