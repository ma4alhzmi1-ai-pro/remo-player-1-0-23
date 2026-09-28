import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ScreenContainer } from "@/components/screen-container";
import { colors, SettingRow, Surface } from "@/components/remo-ui";
import { AI_PLATFORM_URL, APP_VERSION, BLOG_URL, DEVELOPER_COPYRIGHT, DEVELOPER_NAME, TELEGRAM_URL } from "@/lib/app-release";

const open = (url: string) => { Linking.openURL(url); };

export default function AboutDeveloperScreen() {
  const router = useRouter();
  return <ScreenContainer className="px-5"><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
    <View style={styles.header}><Pressable onPress={() => router.back()} hitSlop={10} style={styles.back}><MaterialIcons name="arrow-forward" size={23} color={colors.text} /></Pressable><Text style={styles.title}>عن المطور</Text></View>
    <Surface style={styles.hero}><View style={styles.avatar}><MaterialIcons name="code" size={31} color={colors.background} /></View><Text style={styles.name}>{DEVELOPER_NAME}</Text><Text style={styles.role}>برمجة وتطوير تطبيقات أندرويد</Text><Text style={styles.copyright}>{DEVELOPER_COPYRIGHT}</Text></Surface>
    <Text style={styles.section}>روابط المطور</Text>
    <Surface style={styles.list}>
      <SettingRow icon="send" title="قناة تلغرام" subtitle="t.me/moh_alymani1" tint="#67B7F7" onPress={() => open(TELEGRAM_URL)} />
      <SettingRow icon="article" title="مدونة محمد الحزمي للتقنية" subtitle="mohammedalhzmi.blogspot.com" tint={colors.gold} onPress={() => open(BLOG_URL)} />
      <SettingRow icon="auto-awesome" title="منصة الذكاء الاصطناعي" subtitle="mohammed-alhazmi-ai-complete-1.vercel.app" tint={colors.violet} onPress={() => open(AI_PLATFORM_URL)} />
    </Surface>
    <View style={styles.version}><Text style={styles.versionText}>ريموكيبورد مزخرف · الإصدار {APP_VERSION}</Text></View>
  </ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({
  content: { paddingTop: 19, paddingBottom: 36 }, header: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }, back: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 13, backgroundColor: colors.raised }, title: { color: colors.text, fontSize: 23, fontWeight: "900", textAlign: "right" },
  hero: { alignItems: "center", paddingVertical: 23, borderColor: "#D5AE5566" }, avatar: { width: 67, height: 67, borderRadius: 23, backgroundColor: colors.gold, alignItems: "center", justifyContent: "center" }, name: { color: colors.text, marginTop: 12, fontSize: 21, fontWeight: "900" }, role: { color: colors.muted, fontSize: 13, marginTop: 4 }, copyright: { color: colors.gold, textAlign: "center", lineHeight: 19, fontSize: 12, marginTop: 14 },
  section: { color: colors.text, fontWeight: "900", fontSize: 18, textAlign: "right", marginTop: 23, marginBottom: 10 }, list: { paddingVertical: 0, overflow: "hidden" }, version: { marginTop: 22, alignItems: "center" }, versionText: { color: colors.muted, fontSize: 12 },
});
