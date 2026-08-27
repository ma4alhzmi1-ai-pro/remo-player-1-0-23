import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { colors, SectionTitle, SettingRow, Surface } from "@/components/remo-ui";
import { defaultSettings, loadSettings, saveSettings, type NumeralId, type RemoSettings } from "@/lib/remo-storage";

const numeralLabels: Record<NumeralId, string> = { arabic_indic: "١٢٣ عربية هندية", eastern: "۱۲۳ شرقية", latin: "123 لاتينية" };

export default function SettingsScreen() {
  const [settings, setSettings] = useState<RemoSettings | null>(null);
  const refresh = useCallback(() => { loadSettings().then(setSettings); }, []);
  useEffect(() => { refresh(); }, [refresh]);
  const update = async (change: Partial<RemoSettings>) => { if (!settings) return; const next = { ...settings, ...change }; setSettings(next); await saveSettings(next); };
  const chooseNumerals = () => Alert.alert("نظام الأرقام", "اختَر الشكل الظاهر في صفحة الأرقام.", [
    { text: "١٢٣ عربية هندية", onPress: () => update({ numerals: "arabic_indic" }) }, { text: "۱۲۳ شرقية", onPress: () => update({ numerals: "eastern" }) }, { text: "123 لاتينية", onPress: () => update({ numerals: "latin" }) }, { text: "إلغاء", style: "cancel" },
  ]);
  const chooseHeight = () => Alert.alert("ارتفاع المفاتيح", "اختر توازنًا بين مساحة الشاشة ودقة اللمس.", [
    { text: "مدمج", onPress: () => update({ keyboardHeight: "compact" }) }, { text: "قياسي", onPress: () => update({ keyboardHeight: "standard" }) }, { text: "مريح", onPress: () => update({ keyboardHeight: "comfortable" }) }, { text: "إلغاء", style: "cancel" },
  ]);
  const reset = () => Alert.alert("استعادة الإعدادات", "سيُعاد ضبط الشكل والخيارات فقط، ولن تُحذف الحافظة أو الملصقات.", [{ text: "إلغاء", style: "cancel" }, { text: "استعادة", style: "destructive", onPress: () => { setSettings(defaultSettings); saveSettings(defaultSettings); } }]);
  return <ScreenContainer className="px-5"><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} onScrollBeginDrag={refresh}>
    <Text style={styles.title}>إعدادات الكيبورد</Text><Text style={styles.subtitle}>تحكم في تجربة الكتابة والخصوصية من مكان واحد.</Text>
    <SectionTitle title="الكتابة واللغات" /><Surface style={styles.list}><SettingRow icon="language" title="لغات الإدخال" subtitle="العربية والإنجليزية، والتبديل من زر 🌐" /><SettingRow icon="pin" title="نظام الأرقام" subtitle={settings ? numeralLabels[settings.numerals] : "جار التحميل"} onPress={chooseNumerals} /><SettingRow icon="keyboard" title="ارتفاع لوحة المفاتيح" subtitle={settings?.keyboardHeight === "compact" ? "مدمج" : settings?.keyboardHeight === "comfortable" ? "مريح" : "قياسي"} onPress={chooseHeight} /></Surface>
    <SectionTitle title="الاستجابة" /><Surface style={styles.list}><SettingRow icon="vibration" title="اهتزاز المفاتيح" subtitle="اهتزاز خفيف عند اللمس"><Switch value={settings?.vibration ?? true} onValueChange={(value) => update({ vibration: value })} trackColor={{ false: colors.line, true: colors.sky }} thumbColor={colors.text} /></SettingRow><SettingRow icon="volume-up" title="صوت المفاتيح" subtitle="يُفضل إبقاؤه متوقفًا لتجربة هادئة"><Switch value={settings?.keySound ?? false} onValueChange={(value) => update({ keySound: value })} trackColor={{ false: colors.line, true: colors.sky }} thumbColor={colors.text} /></SettingRow><SettingRow icon="auto-awesome" title="الاقتراحات الذكية" subtitle="اقتراحات من قاموس محلي أساسي"><Switch value={settings?.smartSuggestions ?? true} onValueChange={(value) => update({ smartSuggestions: value })} trackColor={{ false: colors.line, true: colors.sky }} thumbColor={colors.text} /></SettingRow></Surface>
    <SectionTitle title="الخصوصية والحافظة" /><Surface style={styles.list}><SettingRow icon="content-paste" title="الحافظة المحلية" subtitle={`الحد الحالي: ${settings?.clipboardLimit ?? 30} عنصرًا. النص الطويل لا يُقصَّر.`} /><SettingRow icon="mic" title="تحويل الصوت إلى نص" subtitle="يستخدم إذن الميكروفون ومحرك التعرف الصوتي المتاح في أندرويد." /></Surface>
    <Pressable onPress={reset} style={styles.reset}><Text style={styles.resetText}>استعادة الإعدادات الافتراضية</Text></Pressable>
  </ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({ content: { paddingTop: 20, paddingBottom: 36 }, title: { color: colors.text, fontSize: 23, fontWeight: "900", textAlign: "right" }, subtitle: { color: colors.muted, textAlign: "right", marginTop: 6, fontSize: 13 }, list: { paddingVertical: 0, overflow: "hidden" }, reset: { minHeight: 46, marginTop: 25, alignItems: "center", justifyContent: "center" }, resetText: { color: colors.danger, fontSize: 14, fontWeight: "800" } });
