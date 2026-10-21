import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { colors } from "@/components/remo-ui";
import { ScreenContainer } from "@/components/screen-container";
import { DEFAULT_VIDEO_SETTINGS, loadVideoSettings, saveVideoSettings, type VideoSettings } from "@/lib/video-settings";

const SEEK_OPTIONS = [5, 10, 15, 30] as const;
const SPEED_OPTIONS = [1.25, 1.5, 2] as const;

export default function VideoSettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState<VideoSettings>(DEFAULT_VIDEO_SETTINGS);

  useEffect(() => { void loadVideoSettings().then(setSettings); }, []);
  const update = (patch: Partial<VideoSettings>) => {
    setSettings((current) => {
      const next = { ...current, ...patch };
      void saveVideoSettings(next);
      return next;
    });
  };
  const toggle = (key: keyof VideoSettings) => update({ [key]: !settings[key] } as Partial<VideoSettings>);

  return <ScreenContainer edges={["top", "bottom", "left", "right"]}><ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
    <View style={styles.header}><Pressable onPress={() => router.back()} style={styles.backButton} accessibilityLabel="العودة"><MaterialIcons name="arrow-forward" size={23} color={colors.text} /></Pressable><Text style={styles.title}>فيديو</Text></View>
    <Text style={styles.sectionTitle}>التحكم</Text>
    <View style={styles.group}>
      <ValueRow title="فاصل التقديم/الترجيع السريع" value={`${settings.seekInterval}s`} options={SEEK_OPTIONS.map(String)} selected={String(settings.seekInterval)} onSelect={(value) => update({ seekInterval: Number(value) })} />
      <SwitchRow title="انقر مزدوجًا للتقديم/الترجيع" value={settings.doubleTapSeekEnabled} onToggle={() => toggle("doubleTapSeekEnabled")} />
      <SwitchRow title="اضغط مطولًا لتسريع التشغيل" value={settings.longPressSpeedEnabled} onToggle={() => toggle("longPressSpeedEnabled")} />
      <ValueRow title="سرعة الضغط المطول" value={`${settings.longPressSpeed}x`} options={SPEED_OPTIONS.map(String)} selected={String(settings.longPressSpeed)} onSelect={(value) => update({ longPressSpeed: Number(value) })} disabled={!settings.longPressSpeedEnabled} />
      <SwitchRow title="الاهتزاز عند الضغط مطولًا" value={settings.longPressVibrationEnabled} onToggle={() => toggle("longPressVibrationEnabled")} />
      <SwitchRow title="انقر فوق النسب للتبديل مباشرة" description="عند التفعيل يمكن تغيير نسبة العرض من خيارات المشغل مباشرة." value={settings.directAspectSwitchEnabled} onToggle={() => toggle("directAspectSwitchEnabled")} />
    </View>
    <Text style={styles.sectionTitle}>الذاكرة</Text>
    <View style={styles.group}>
      <SwitchRow title="تذكر التشغيل في الخلفية" value={settings.rememberBackgroundPlayback} onToggle={() => toggle("rememberBackgroundPlayback")} />
      <SwitchRow title="تذكر النسبة" description="يحفظ آخر نسبة عرض اختارها المستخدم للفيديو." value={settings.rememberAspectRatio} onToggle={() => toggle("rememberAspectRatio")} />
    </View>
  </ScrollView></ScreenContainer>;
}

function SwitchRow({ title, description, value, onToggle }: { title: string; description?: string; value: boolean; onToggle: () => void }) {
  return <View style={styles.row}><Switch value={value} onValueChange={onToggle} trackColor={{ false: "#CBD0D4", true: "#B8E9C1" }} thumbColor={value ? "#08B52B" : "#F3F4F5"} /><View style={styles.copy}><Text style={styles.rowTitle}>{title}</Text>{description ? <Text style={styles.description}>{description}</Text> : null}</View></View>;
}

function ValueRow({ title, value, options, selected, onSelect, disabled = false }: { title: string; value: string; options: string[]; selected: string; onSelect: (value: string) => void; disabled?: boolean }) {
  return <View style={[styles.valueRow, disabled && styles.disabled]}><View style={styles.valueHeader}><Text style={styles.value}>{value}</Text><Text style={styles.rowTitle}>{title}</Text></View><View style={styles.options}>{options.map((option) => <Pressable key={option} disabled={disabled} onPress={() => onSelect(option)} style={[styles.option, selected === option && styles.optionActive]}><Text style={[styles.optionText, selected === option && styles.optionTextActive]}>{option}{title.includes("فاصل") ? "s" : "x"}</Text></Pressable>)}</View></View>;
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 42 },
  header: { minHeight: 72, paddingHorizontal: 20, flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between" },
  title: { color: colors.text, fontSize: 27, fontWeight: "500", textAlign: "right" },
  backButton: { width: 42, height: 42, alignItems: "center", justifyContent: "center" },
  sectionTitle: { color: "#12B52E", fontSize: 16, fontWeight: "800", textAlign: "right", paddingHorizontal: 22, paddingTop: 19, paddingBottom: 8 },
  group: { marginHorizontal: 16, borderTopWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  row: { minHeight: 76, paddingHorizontal: 18, borderBottomWidth: 1, borderColor: colors.border, flexDirection: "row", alignItems: "center", gap: 16 },
  copy: { flex: 1, alignItems: "flex-end" },
  rowTitle: { color: colors.text, fontSize: 17, lineHeight: 24, textAlign: "right" },
  description: { color: colors.muted, fontSize: 11, lineHeight: 17, textAlign: "right", marginTop: 3 },
  valueRow: { minHeight: 110, paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: 1, borderColor: colors.border },
  valueHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  value: { color: colors.muted, fontSize: 16 },
  options: { flexDirection: "row-reverse", gap: 8, marginTop: 12 },
  option: { minWidth: 48, height: 34, paddingHorizontal: 10, borderRadius: 17, backgroundColor: colors.surfaceAlt, alignItems: "center", justifyContent: "center" },
  optionActive: { backgroundColor: "#12B52E" },
  optionText: { color: colors.muted, fontSize: 12, fontWeight: "800" },
  optionTextActive: { color: "#06101A" },
  disabled: { opacity: 0.45 },
});
