import { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ScreenContainer } from "@/components/screen-container";
import { colors, IconTile, PrimaryButton, SectionTitle, Surface } from "@/components/remo-ui";
import { loadSettings, type RemoSettings } from "@/lib/remo-storage";

export default function HomeScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState<RemoSettings | null>(null);
  const refresh = useCallback(() => { loadSettings().then(setSettings); }, []);
  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => {
    const timer = setTimeout(() => {
      Alert.alert("ريموكيبورد مزخرف", "هذا التطبيق برمجة وتطوير المطور محمد الحزمي 2026", [{ text: "حسنًا" }]);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} onScrollBeginDrag={refresh}>
        <View style={styles.topline}><View style={styles.logo}><MaterialIcons name="keyboard" size={23} color={colors.background} /></View><View style={styles.titleWrap}><Text style={styles.eyebrow}>لوحة مفاتيح عربية خفيفة</Text><Text style={styles.title}>ريموكيبورد مزخرف</Text></View></View>

        <Surface style={styles.activation}>
          <View style={styles.activationHead}><View style={styles.check}><MaterialIcons name="check" size={18} color={colors.background} /></View><Text style={styles.activationLabel}>ابدأ في دقيقتين</Text></View>
          <Text style={styles.activationTitle}>فعّل لوحة ريموكيبورد على جهازك</Text>
          <Text style={styles.activationText}>افتح إعدادات لوحات المفاتيح في أندرويد، فعّل ريموكيبورد، ثم اخترها من زر تغيير لوحة المفاتيح.</Text>
          <View style={styles.buttonRow}><View style={styles.grow}><PrimaryButton label="فتح خطوات التفعيل" icon="keyboard" onPress={() => Alert.alert("تفعيل ريموكيبورد", "بعد تثبيت نسخة Android الأصلية، افتح التطبيق ثم اختر «تفعيل ريموكيبورد» من صفحة الإعدادات. ستظهر لك إعدادات لوحات المفاتيح في الجهاز.")} /></View></View>
        </Surface>

        <SectionTitle title="وصول سريع" />
        <View style={styles.quickGrid}>
          <View style={styles.quickItem}><IconTile icon="keyboard" label="المعاينة" caption="جرّب المفاتيح" onPress={() => router.push("/keyboard-studio" as never)} /></View>
          <View style={styles.quickItem}><IconTile icon="auto-awesome" label="الزخرفة" caption="أنماط نصية" tint={colors.violet} onPress={() => router.push("/studio" as never)} /></View>
          <View style={styles.quickItem}><IconTile icon="content-paste" label="الحافظة" caption="نصوصك المحفوظة" tint={colors.green} onPress={() => router.push("/studio?tab=clipboard" as never)} /></View>
          <View style={styles.quickItem}><IconTile icon="palette" label="الثيمات" caption={settings ? `النشط: ${settings.theme === "navy" ? "داكن" : settings.theme === "rose" ? "وردي" : settings.theme === "ramadan" ? "إسلامي" : "فاتح"}` : "اختر مظهرك"} tint={colors.gold} onPress={() => router.push("/themes" as never)} /></View>
        </View>

        <SectionTitle title="ماذا يدعم ريموكيبورد؟" />
        <Surface>
          <Feature icon="translate" text="العربية والإنجليزية، والأرقام العربية الهندية والشرقية واللاتينية." />
          <Feature icon="keyboard-voice" text="تحويل الكلام إلى نص عبر خدمة التعرف الصوتي في جهازك." />
          <Feature icon="format-quote" text="ضغط مطول للتشكيل على ة، وللمد والتطويل على ت." />
          <Feature icon="lock" text="الحافظة والإعدادات محفوظة على جهازك افتراضيًا." last />
        </Surface>
      </ScrollView>
    </ScreenContainer>
  );
}

function Feature({ icon, text, last = false }: { icon: keyof typeof MaterialIcons.glyphMap; text: string; last?: boolean }) {
  return <View style={[styles.feature, !last && styles.divider]}><MaterialIcons name={icon} size={19} color={colors.sky} /><Text style={styles.featureText}>{text}</Text></View>;
}

const styles = StyleSheet.create({
  content: { paddingTop: 20, paddingBottom: 38 },
  topline: { flexDirection: "row-reverse", gap: 11, alignItems: "center", marginBottom: 22 },
  logo: { width: 45, height: 45, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: colors.sky },
  titleWrap: { flex: 1 }, eyebrow: { color: colors.muted, fontSize: 12, textAlign: "right" }, title: { color: colors.text, fontSize: 23, fontWeight: "900", textAlign: "right", marginTop: 1 },
  activation: { borderColor: "#4DB5E740", padding: 18 }, activationHead: { flexDirection: "row-reverse", alignItems: "center", gap: 7 }, check: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.green, alignItems: "center", justifyContent: "center" }, activationLabel: { color: colors.green, fontSize: 13, fontWeight: "800" }, activationTitle: { color: colors.text, fontWeight: "900", fontSize: 19, marginTop: 13, textAlign: "right" }, activationText: { color: colors.muted, fontSize: 13, lineHeight: 21, marginTop: 7, textAlign: "right" }, buttonRow: { flexDirection: "row", marginTop: 16 }, grow: { flex: 1 },
  quickGrid: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 10 }, quickItem: { width: "48.6%" },
  feature: { flexDirection: "row-reverse", alignItems: "flex-start", gap: 10, paddingVertical: 12 }, divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line }, featureText: { color: colors.text, fontSize: 13, lineHeight: 20, flex: 1, textAlign: "right" },
});
