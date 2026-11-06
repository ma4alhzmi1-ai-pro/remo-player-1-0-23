import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { colors } from "@/components/remo-ui";
import { ScreenContainer } from "@/components/screen-container";
import { DEFAULT_VIDEO_SETTINGS, loadVideoSettings, saveVideoSettings, type VideoSettings } from "@/lib/video-settings";

const SEEK_OPTIONS = [5, 10, 15, 30] as const;
const SPEED_OPTIONS = [1.25, 1.5, 2] as const;
const DECODER_OPTIONS = ["auto", "hardware", "software"] as const;
const AUDIO_LANGUAGE_OPTIONS = ["auto", "ar", "en", "fr", "es", "tr"] as const;
const TOOL_OPTIONS = ["back", "rewind", "previous", "play", "next", "forward", "background", "options", "fit", "speed", "rotate", "lock", "night", "mute", "mirror", "repeat", "ab"] as const;
const TOOL_LABELS: Record<string, string> = { back: "رجوع", rewind: "ترجيع", previous: "السابق", play: "تشغيل/إيقاف", next: "التالي", forward: "تقديم", background: "الخلفية", options: "المزيد", fit: "نسبة العرض", speed: "السرعة", rotate: "تدوير الشاشة", lock: "قفل الأدوات", night: "الوضع الليلي", mute: "كتم الصوت", mirror: "عكس الصورة", repeat: "تكرار", ab: "تكرار A-B" };

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
      <SwitchRow title="اضغط مطولًا لتسريع التشغيل" value={settings.longPressSpeedEnabled} onToggle={() => toggle("longPressSpeedEnabled")} />
      <ValueRow title="سرعة الضغط المطول" value={`${settings.longPressSpeed}x`} options={SPEED_OPTIONS.map(String)} selected={String(settings.longPressSpeed)} onSelect={(value) => update({ longPressSpeed: Number(value) })} disabled={!settings.longPressSpeedEnabled} />
      <SwitchRow title="الاهتزاز عند الضغط مطولًا" value={settings.longPressVibrationEnabled} onToggle={() => toggle("longPressVibrationEnabled")} />
    </View>
    <Text style={styles.sectionTitle}>إعدادات شريط أدوات الفيديو</Text>
    <View style={styles.group}>
      <ValueRow title="مكان ظهور الشريط" value={settings.toolbarPosition === "center" ? "الوسط" : settings.toolbarPosition === "top" ? "الأعلى" : settings.toolbarPosition === "bottom" ? "الأسفل" : "الجوانب"} options={["center", "top", "bottom", "sides"]} selected={settings.toolbarPosition} onSelect={(value) => update({ toolbarPosition: value as VideoSettings["toolbarPosition"] })} />
      <View style={styles.valueRow}><Text style={styles.rowTitle}>الأدوات الظاهرة في الشريط</Text><View style={styles.options}>{TOOL_OPTIONS.map((tool) => { const selected = settings.toolbarTools.includes(tool); return <Pressable key={tool} onPress={() => update({ toolbarTools: selected ? settings.toolbarTools.filter((item) => item !== tool) : [...settings.toolbarTools, tool] })} style={[styles.option, selected && styles.optionActive]}><Text style={[styles.optionText, selected && styles.optionTextActive]}>{selected ? "✓ " : "□ "}{TOOL_LABELS[tool]}</Text></Pressable>; })}</View></View>
      <ValueRow title="لون الأزرار" value={settings.toolbarButtonColor} options={["#FFFFFF", "#39D353", "#48CFFF", "#FFB020"]} selected={settings.toolbarButtonColor} onSelect={(value) => update({ toolbarButtonColor: value })} />
      <ValueRow title="لون إطار الشريط" value={settings.toolbarBorderColor === "#39D353" ? "أخضر" : settings.toolbarBorderColor === "#48CFFF" ? "سماوي" : "أبيض"} options={["rgba(255,255,255,0.16)", "#39D353", "#48CFFF"]} selected={settings.toolbarBorderColor} onSelect={(value) => update({ toolbarBorderColor: value })} />
    </View>
    <Text style={styles.sectionTitle}>التحكم بشريط التشغيل (عداد الوقت)</Text>
    <View style={styles.group}>
      <ValueRow title="استايل خط التشغيل" value={settings.progressStyle === "solid" ? "متصل" : settings.progressStyle === "gradient" ? "متدرج" : "متقطع"} options={["solid", "gradient", "dashed"]} selected={settings.progressStyle} onSelect={(value) => update({ progressStyle: value as VideoSettings["progressStyle"] })} />
      <ValueRow title="شكل المؤشر" value={settings.progressThumb === "circle" ? "دائري" : settings.progressThumb === "diamond" ? "معيّن" : "مربع"} options={["circle", "diamond", "square"]} selected={settings.progressThumb} onSelect={(value) => update({ progressThumb: value as VideoSettings["progressThumb"] })} />
      <ValueRow title="اتجاه تقدم المؤشر" value={settings.progressDirection === "rtl" ? "يمين ← يسار" : "يسار ← يمين"} options={["rtl", "ltr"]} selected={settings.progressDirection} onSelect={(value) => update({ progressDirection: value as VideoSettings["progressDirection"] })} />
      <ValueRow title="اتجاه زيادة الوقت بالسحب" value={settings.seekDirection === "right" ? "السحب يميناً" : "السحب يساراً"} options={["right", "left"]} selected={settings.seekDirection} onSelect={(value) => update({ seekDirection: value as VideoSettings["seekDirection"] })} />
      <ValueRow title="سرعة متابعة المؤشر" value={`${settings.seekSensitivity}×`} options={["0.5", "1", "1.5", "2"]} selected={String(settings.seekSensitivity)} onSelect={(value) => update({ seekSensitivity: Number(value) })} />
    </View>
    <Text style={styles.sectionTitle}>متقدم</Text>
    <View style={styles.group}>
      <ValueRow title="وحدة فك الترميز الافتراضية" value={settings.decoderMode === "hardware" ? "HW" : settings.decoderMode === "software" ? "SW" : "تلقائي"} options={[...DECODER_OPTIONS]} selected={settings.decoderMode} onSelect={(value) => update({ decoderMode: value as VideoSettings["decoderMode"] })} />
      <SwitchRow title="تعزيز الجودة" description="يختار أعلى مسار فيديو مدعوم ويضبط التخزين المؤقت عند توفر مسارات متعددة." value={settings.qualityBoost} onToggle={() => toggle("qualityBoost")} />
      <ValueRow title="لغة الصوت المفضلة" value={settings.preferredAudioLanguage === "auto" ? "تلقائي" : settings.preferredAudioLanguage.toUpperCase()} options={[...AUDIO_LANGUAGE_OPTIONS]} selected={settings.preferredAudioLanguage} onSelect={(value) => update({ preferredAudioLanguage: value })} />
    </View>
  </ScrollView></ScreenContainer>;
}

function SwitchRow({ title, description, value, onToggle }: { title: string; description?: string; value: boolean; onToggle: () => void }) {
  return <View style={styles.row}><Switch value={value} onValueChange={onToggle} trackColor={{ false: "#CBD0D4", true: "#B8E9C1" }} thumbColor={value ? "#08B52B" : "#F3F4F5"} /><View style={styles.copy}><Text style={styles.rowTitle}>{title}</Text>{description ? <Text style={styles.description}>{description}</Text> : null}</View></View>;
}

function ValueRow({ title, value, options, selected, onSelect, disabled = false }: { title: string; value: string; options: string[]; selected: string; onSelect: (value: string) => void; disabled?: boolean }) {
  const labels: Record<string, string> = { auto: "تلقائي", hardware: "HW", software: "SW", ar: "العربية", en: "English", fr: "Français", es: "Español", tr: "Türkçe", center: "الوسط", top: "الأعلى", bottom: "الأسفل", sides: "الجوانب", solid: "متصل", gradient: "متدرج", dashed: "متقطع", circle: "دائري", diamond: "معيّن", square: "مربع", rtl: "يمين ← يسار", ltr: "يسار ← يمين", right: "السحب يميناً", left: "السحب يساراً", "#FFFFFF": "أبيض", "#39D353": "أخضر", "#48CFFF": "سماوي", "#FFB020": "ذهبي", "rgba(255,255,255,0.16)": "أبيض" };
  return <View style={[styles.valueRow, disabled && styles.disabled]}><View style={styles.valueHeader}><Text style={styles.value}>{value}</Text><Text style={styles.rowTitle}>{title}</Text></View><View style={styles.options}>{options.map((option) => <Pressable key={option} disabled={disabled} onPress={() => onSelect(option)} style={[styles.option, selected === option && styles.optionActive]}><Text style={[styles.optionText, selected === option && styles.optionTextActive]}>{labels[option] ?? option}{title.includes("فاصل") ? "s" : title.includes("سرعة") ? "x" : ""}</Text></Pressable>)}</View></View>;
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
