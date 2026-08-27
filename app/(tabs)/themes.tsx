import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ScreenContainer } from "@/components/screen-container";
import { KeyboardPreview } from "@/components/keyboard-preview";
import { colors, SectionTitle, Surface } from "@/components/remo-ui";
import { loadSettings, saveSettings, type RemoSettings, type ThemeId } from "@/lib/remo-storage";

const themes: { id: ThemeId; name: string; subtitle: string; color: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
  { id: "navy", name: "داكن شبابي", subtitle: "كحلي فحمي مع أزرق سماوي", color: "#5CC8FF", icon: "dark-mode" },
  { id: "rose", name: "نسائي وردي", subtitle: "وردي معتدل وناعم", color: "#F9ACD4", icon: "favorite" },
  { id: "ramadan", name: "إسلامي", subtitle: "أخضر داكن ولمسة ذهبية", color: "#D5AE55", icon: "nightlight-round" },
  { id: "light", name: "فاتح واضح", subtitle: "إضاءة مريحة للنهار", color: "#0077BE", icon: "light-mode" },
];

export default function ThemesScreen() {
  const [settings, setSettings] = useState<RemoSettings | null>(null);
  const refresh = useCallback(() => { loadSettings().then(setSettings); }, []);
  useEffect(() => { refresh(); }, [refresh]);
  const setTheme = async (theme: ThemeId) => { if (!settings) return; const next = { ...settings, theme }; setSettings(next); await saveSettings(next); };
  const safeTheme = settings?.theme ?? "navy";
  return <ScreenContainer className="px-5"><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
    <Text style={styles.title}>مظهر لوحة المفاتيح</Text><Text style={styles.subtitle}>اختر ثيمًا خفيفًا؛ تُحفظ الاختيارات محليًا وتنعكس في المعاينة.</Text>
    <SectionTitle title="معاينة الثيم النشط" /><KeyboardPreview onInput={() => {}} onDelete={() => {}} theme={safeTheme} />
    <SectionTitle title="الثيمات المتاحة" />{themes.map((theme) => <Pressable key={theme.id} onPress={() => setTheme(theme.id)} style={({ pressed }) => [styles.themeCard, safeTheme === theme.id && { borderColor: theme.color, backgroundColor: `${theme.color}15` }, pressed && { opacity: 0.75 }]}><View style={[styles.colorDot, { backgroundColor: theme.color }]}><MaterialIcons name={theme.icon} color={colors.background} size={19} /></View><View style={styles.themeCopy}><Text style={styles.themeName}>{theme.name}</Text><Text style={styles.themeSub}>{theme.subtitle}</Text></View>{safeTheme === theme.id ? <MaterialIcons name="check-circle" size={23} color={theme.color} /> : <MaterialIcons name="radio-button-unchecked" size={23} color={colors.muted} />}</Pressable>)}
    <Surface style={styles.note}><MaterialIcons name="info-outline" size={20} color={colors.gold} /><Text style={styles.noteText}>يستخدم الثيم نظام ألوان ومفاتيح برمجية بدل خلفيات عالية الحجم، للمحافظة على خفة التطبيق.</Text></Surface>
  </ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({ content: { paddingTop: 20, paddingBottom: 36 }, title: { color: colors.text, fontSize: 23, fontWeight: "900", textAlign: "right" }, subtitle: { color: colors.muted, textAlign: "right", marginTop: 6, fontSize: 13, lineHeight: 20 }, themeCard: { minHeight: 78, flexDirection: "row-reverse", alignItems: "center", gap: 13, marginBottom: 9, padding: 13, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line }, colorDot: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center" }, themeCopy: { flex: 1 }, themeName: { color: colors.text, fontSize: 16, fontWeight: "900", textAlign: "right" }, themeSub: { color: colors.muted, fontSize: 12, textAlign: "right", marginTop: 3 }, note: { marginTop: 12, flexDirection: "row-reverse", alignItems: "flex-start", gap: 9 }, noteText: { color: colors.muted, flex: 1, textAlign: "right", lineHeight: 20, fontSize: 12 } });
