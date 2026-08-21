import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { colors } from "@/components/remo-ui";
import { ScreenContainer } from "@/components/screen-container";

const sections = [
  { icon: "phone-android" as const, title: "بياناتك المحلية", body: "يعمل REMO PLAYER على ملفات الوسائط وقوائم التشغيل المحفوظة في جهازك. لا ننشئ حساباً ولا نرفع مكتبتك تلقائياً." },
  { icon: "translate" as const, title: "ترجمة الفيديو الذكية", body: "عند اختيار ترجمة فيديو بالذكاء الاصطناعي، يطلب التطبيق موافقتك قبل إرسال المحتوى اللازم للمعالجة عبر الإنترنت. يمكنك تجاهل الطلب ومتابعة التشغيل المحلي." },
  { icon: "backup" as const, title: "النسخ الاحتياطي", body: "تُصدَّر قوائم التشغيل إلى ملف JSON تختاره أنت عبر لوحة المشاركة. لا تُرسل النسخة الاحتياطية إلى خادم REMO PLAYER." },
  { icon: "folder-open" as const, title: "الصلاحيات", body: "تُستخدم صلاحية الوسائط لفهرسة وتشغيل ملفات الصوت والفيديو التي تختارها. يمكنك إلغاء الصلاحية من إعدادات Android في أي وقت." },
];

export default function PrivacyScreen() {
  const router = useRouter();
  return <ScreenContainer className="px-0"><View style={styles.header}><Pressable onPress={() => router.back()} style={({ pressed }) => [styles.back, pressed && styles.dimmed]}><MaterialIcons name="arrow-forward" size={22} color={colors.text} /></Pressable><View><Text style={styles.title}>الخصوصية</Text><Text style={styles.subtitle}>كيف يتعامل REMO PLAYER مع بياناتك</Text></View></View><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}><View style={styles.hero}><MaterialIcons name="shield" size={32} color={colors.cyan} /><Text style={styles.heroTitle}>وسائطك ملكك</Text><Text style={styles.heroBody}>صُمم REMO PLAYER ليبقي تجربة الموسيقى والفيديو محلية وواضحة، ويطلب إذنك فقط عند الحاجة.</Text></View>{sections.map((section) => <View key={section.title} style={styles.card}><View style={styles.icon}><MaterialIcons name={section.icon} size={22} color={colors.cyan} /></View><View style={styles.copy}><Text style={styles.cardTitle}>{section.title}</Text><Text style={styles.cardBody}>{section.body}</Text></View></View>)}</ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({
  header: { height: 82, paddingHorizontal: 18, flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between" }, back: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, title: { color: colors.text, fontSize: 24, fontWeight: "900", textAlign: "right" }, subtitle: { color: colors.muted, fontSize: 11, marginTop: 2, textAlign: "right" }, content: { padding: 16, paddingBottom: 46, gap: 11 }, hero: { borderRadius: 24, padding: 20, backgroundColor: "#102A42", borderWidth: 1, borderColor: "#236589", alignItems: "flex-end" }, heroTitle: { color: colors.text, marginTop: 10, fontSize: 20, fontWeight: "900", textAlign: "right" }, heroBody: { color: "#C5D6E8", marginTop: 7, fontSize: 13, lineHeight: 20, textAlign: "right" }, card: { padding: 15, borderRadius: 19, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, flexDirection: "row-reverse", alignItems: "flex-start", gap: 12 }, icon: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "#10263B" }, copy: { flex: 1, alignItems: "flex-end" }, cardTitle: { color: colors.text, fontSize: 14, fontWeight: "900", textAlign: "right" }, cardBody: { color: colors.muted, marginTop: 5, fontSize: 12, lineHeight: 19, textAlign: "right" }, dimmed: { opacity: 0.65 },
});
