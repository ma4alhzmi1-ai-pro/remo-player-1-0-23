import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ScreenContainer } from "@/components/screen-container";
import { colors, Surface } from "@/components/remo-ui";
import { APP_VERSION, DEVELOPER_NAME } from "@/lib/app-release";

const policies = [
  { icon: "keyboard", title: "النصوص التي تكتبها", text: "لا تُرسل ريموكيبورد نصوصك المكتوبة إلى خادم تابع للتطبيق. تظل الكتابة داخل التطبيق أو الحقل الذي تستخدمه." },
  { icon: "content-paste", title: "الحافظة", text: "تُحفظ عناصر الحافظة وإعداداتها على جهازك محليًا. يمكنك حذفها من أدوات الحافظة أو من إعدادات النظام." },
  { icon: "mic", title: "الإدخال الصوتي", text: "عند الضغط على زر الصوت، يستخدم الكيبورد محرك التعرف الصوتي المتاح في جهازك. قد تطبق على هذا المحرك سياسة خصوصية مزود خدمة الجهاز أو الشبكة." },
  { icon: "public", title: "الروابط الخارجية", text: "صفحة عن المطور تفتح تلغرام والمدونة والمنصة الذكية في المتصفح. تخضع المواقع المفتوحة لسياسات الخصوصية الخاصة بها." },
  { icon: "lock", title: "التحديثات", text: "تتحقق ميزة التحديث من صفحة إصدارات المشروع على GitHub عند اختيارك لها، ولا تُنزّل أو تثبّت أي ملف تلقائيًا." },
];

export default function PrivacyScreen() {
  const router = useRouter();
  return <ScreenContainer className="px-5"><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
    <View style={styles.header}><Pressable onPress={() => router.back()} hitSlop={10} style={styles.back}><MaterialIcons name="arrow-forward" size={23} color={colors.text} /></Pressable><Text style={styles.title}>سياسة الخصوصية</Text></View>
    <Text style={styles.intro}>نحن نقدّر خصوصية الكتابة. تشرح هذه الصفحة كيفية تعامل ريموكيبورد مزخرف مع الميزات المحلية والخدمات التي يختارها المستخدم.</Text>
    {policies.map((policy) => <Surface key={policy.title} style={styles.policy}><View style={styles.icon}><MaterialIcons name={policy.icon as keyof typeof MaterialIcons.glyphMap} size={22} color={colors.sky} /></View><View style={styles.policyCopy}><Text style={styles.policyTitle}>{policy.title}</Text><Text style={styles.policyText}>{policy.text}</Text></View></Surface>)}
    <View style={styles.footer}><Text style={styles.footerText}>آخر تحديث: 28 أغسطس 2026 · الإصدار {APP_VERSION}</Text><Text style={styles.footerText}>المطور: {DEVELOPER_NAME}</Text></View>
  </ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({
  content: { paddingTop: 19, paddingBottom: 36 }, header: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }, back: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 13, backgroundColor: colors.raised }, title: { color: colors.text, fontSize: 23, fontWeight: "900", textAlign: "right" },
  intro: { color: colors.muted, fontSize: 14, lineHeight: 22, textAlign: "right", marginBottom: 16 }, policy: { marginBottom: 10, flexDirection: "row-reverse", alignItems: "flex-start", gap: 12 }, icon: { width: 37, height: 37, borderRadius: 12, backgroundColor: "#5CC8FF18", alignItems: "center", justifyContent: "center" }, policyCopy: { flex: 1 }, policyTitle: { color: colors.text, textAlign: "right", fontSize: 15, fontWeight: "900" }, policyText: { color: colors.muted, textAlign: "right", fontSize: 12, lineHeight: 20, marginTop: 4 }, footer: { alignItems: "center", gap: 4, marginTop: 15 }, footerText: { color: colors.muted, fontSize: 11 },
});
