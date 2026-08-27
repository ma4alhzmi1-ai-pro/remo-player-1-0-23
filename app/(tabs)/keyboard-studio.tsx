import { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { ScreenContainer } from "@/components/screen-container";
import { KeyboardPreview } from "@/components/keyboard-preview";
import { colors, PrimaryButton, SectionTitle, Surface } from "@/components/remo-ui";
import { loadSettings, rememberClipboardText, type RemoSettings } from "@/lib/remo-storage";

export default function KeyboardStudioScreen() {
  const [text, setText] = useState("");
  const [settings, setSettings] = useState<RemoSettings | null>(null);
  const refresh = useCallback(() => { loadSettings().then(setSettings); }, []);
  useEffect(() => { refresh(); }, [refresh]);

  const append = (value: string) => setText((current) => current + value);
  const remove = () => setText((current) => current.slice(0, -1));
  const copyText = async () => {
    if (!text.trim()) return Alert.alert("لا يوجد نص", "جرّب مفاتيح المعاينة أولًا، ثم انسخ ما كتبته.");
    await Clipboard.setStringAsync(text);
    await rememberClipboardText(text, settings?.clipboardLimit ?? 30);
    Alert.alert("تم النسخ", "أُضيف النص إلى حافظة ريموكيبورد المحلية.");
  };

  return <ScreenContainer className="px-5"><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} onScrollBeginDrag={refresh}>
    <Text style={styles.title}>معاينة لوحة المفاتيح</Text>
    <Text style={styles.subtitle}>هذه معاينة آمنة قبل التفعيل. المفاتيح في النسخة الأصلية تكتب داخل أي تطبيق على جهاز أندرويد.</Text>
    <SectionTitle title="مساحة الاختبار" />
    <Surface style={styles.writer}><TextInput multiline value={text} onChangeText={setText} placeholder="اكتب أو جرّب مفاتيح ريمو…" placeholderTextColor={colors.muted} style={styles.input} textAlign="right" textAlignVertical="top" /></Surface>
    <View style={styles.copy}><PrimaryButton label="نسخ النص إلى الحافظة" icon="content-copy" quiet onPress={copyText} /></View>
    <SectionTitle title="نمط المفاتيح: كمبيوتر" action="اضغط مطولًا على ة أو ت" />
    <KeyboardPreview onInput={append} onDelete={remove} theme={settings?.theme ?? "navy"} />
    <View style={styles.tip}><Text style={styles.tipTitle}>عن الإدخال الصوتي</Text><Text style={styles.tipText}>زر الصوت في لوحة المفاتيح الأصلية يطلب إذن الميكروفون ثم يستخدم محرك التعرف الصوتي المتوفر في جهازك. تعتمد الدقة على المحرك واللهجة وجودة الصوت.</Text></View>
  </ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({
  content: { paddingTop: 20, paddingBottom: 36 }, title: { color: colors.text, fontSize: 23, fontWeight: "900", textAlign: "right" }, subtitle: { color: colors.muted, textAlign: "right", marginTop: 7, fontSize: 13, lineHeight: 20 },
  writer: { minHeight: 135, padding: 12 }, input: { color: colors.text, fontSize: 17, lineHeight: 26, minHeight: 105 }, copy: { marginTop: 10, alignSelf: "stretch" },
  tip: { borderRightWidth: 3, borderRightColor: colors.sky, marginTop: 20, backgroundColor: "#5CC8FF15", borderRadius: 13, padding: 14 }, tipTitle: { color: colors.sky, fontWeight: "900", fontSize: 15, textAlign: "right" }, tipText: { color: colors.muted, textAlign: "right", lineHeight: 20, fontSize: 12, marginTop: 4 },
});
