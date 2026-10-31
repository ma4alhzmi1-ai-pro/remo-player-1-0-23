import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { usePathname, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Alert, Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/components/remo-ui";
import { useThemeContext } from "@/lib/theme-provider";

type MenuContextValue = { openMenu: () => void; closeMenu: () => void };
const MenuContext = createContext<MenuContextValue | null>(null);

export function AppSideMenuProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();
  const value = useMemo(() => ({ openMenu: () => setVisible(true), closeMenu: () => setVisible(false) }), []);
  const hideForVideoPlayer = pathname === "/player/video";
  return <MenuContext.Provider value={value}>{children}<SideMenu visible={visible} onClose={() => setVisible(false)} />{hideForVideoPlayer ? null : <Pressable onPress={() => setVisible(true)} style={({ pressed }) => [styles.floating, pressed && styles.dimmed]} accessibilityLabel="فتح القائمة الجانبية"><MaterialIcons name="menu" size={25} color={colors.text} /></Pressable>}</MenuContext.Provider>;
}

export function useAppSideMenu() {
  const context = useContext(MenuContext);
  if (!context) throw new Error("useAppSideMenu must be used within AppSideMenuProvider");
  return context;
}

function SideMenu({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const router = useRouter();
  const { colorScheme, setColorScheme } = useThemeContext();
  const openLink = async (url: string) => {
    try { await WebBrowser.openBrowserAsync(url); } catch { Alert.alert("تعذر فتح الرابط", "تحقق من اتصال الإنترنت ثم حاول مرة أخرى."); }
  };
  const openSettings = () => { onClose(); router.push("/settings" as never); };
  const openVideoToAudio = () => { onClose(); router.push("/converter?mode=audio" as never); };
  const openPrivacy = () => { onClose(); router.push("/privacy" as never); };
  const openSupport = () => { onClose(); router.push("/support-developer" as never); };
  const toggleTheme = () => setColorScheme(colorScheme === "dark" ? "light" : "dark");
  return <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}><View style={styles.modalRoot}><Pressable onPress={onClose} style={styles.backdrop} /><View style={styles.drawer}>
    <View style={styles.drawerHead}><View style={styles.logoMark}><MaterialIcons name="play-arrow" size={29} color={colors.background} /></View><View style={styles.headCopy}><Text style={styles.appName}>REMO PLAYER</Text><Text style={styles.appSub}>مشغل الوسائط المحلي</Text></View><Pressable onPress={onClose} style={styles.close}><MaterialIcons name="close" size={22} color={colors.text} /></Pressable></View>
    <Text style={styles.section}>أدوات الوسائط والمحول</Text>
    <MenuRow icon="audiotrack" title="تحويل الفيديو إلى صوت" description="استخراج الصوت بجميع الصيغ (MP3, M4A, WAV...) والجودات" onPress={openVideoToAudio} />
    <MenuRow icon="transform" title="محول صيغ الفيديو (MP4)" description="تحويل الصيغ غير المتوافقة إلى MP4 وحفظها بالهاتف" onPress={() => { onClose(); router.push("/converter?mode=video" as never); }} />
    <Text style={styles.section}>إدارة التطبيق</Text>
    <MenuRow icon="settings" title="الإعدادات" description="المكتبة والتشغيل والصلاحيات" onPress={openSettings} />
    <MenuRow icon="shield" title="الخصوصية" description="بياناتك وصلاحيات الوسائط" onPress={openPrivacy} />
    <MenuRow icon={colorScheme === "dark" ? "light-mode" : "dark-mode"} title="الثيمات" description={colorScheme === "dark" ? "الوضع الداكن مفعل" : "الوضع الفاتح مفعل"} onPress={toggleTheme} />
    <MenuRow icon="info-outline" title="حول التطبيق" description="REMO PLAYER • إصدار محلي احترافي" onPress={() => Alert.alert("حول REMO PLAYER", "مشغل موسيقى وفيديو محلي مصمم لتشغيل ملفاتك وتنظيمها، مع أدوات تخصيص وترجمة ذكية للفيديوهات.")} />
    <MenuRow icon="favorite" title="ادعم المطور محمد الحزمي" description="دعم اختياري عبر محفظة جيب" onPress={openSupport} />
    <Text style={styles.section}>منصات المطور</Text>
    <MenuRow icon="campaign" title="تحديث التطبيق" description="قناة المطور على تيليجرام" onPress={() => void openLink("https://t.me/moh_alymani1")} />
    <MenuRow icon="article" title="مدونة المطور" description="مدونة محمد الحزمي على بلوجر" onPress={() => void openLink("https://mohammedalhzmi.blogspot.com")} />
    <MenuRow icon="auto-awesome" title="منصة الذكاء الاصطناعي" description="منصة محمد الحزمي للذكاء الاصطناعي" onPress={() => void openLink("https://mohammed-alhazmi-ai-complete-1.vercel.app/")} />
    <View style={styles.credit}><MaterialIcons name="verified" size={16} color={colors.cyan} /><Text style={styles.creditText}>برمجة وتطوير محمد الحزمي</Text></View>
  </View></View></Modal>;
}

function MenuRow({ icon, title, description, onPress }: { icon: keyof typeof MaterialIcons.glyphMap; title: string; description: string; onPress: () => void }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.dimmed]}><View style={styles.rowIcon}><MaterialIcons name={icon} size={21} color={colors.cyan} /></View><View style={styles.rowCopy}><Text style={styles.rowTitle}>{title}</Text><Text numberOfLines={1} style={styles.rowDescription}>{description}</Text></View><MaterialIcons name="chevron-left" size={22} color={colors.muted} /></Pressable>;
}

const styles = StyleSheet.create({
  floating: { position: "absolute", top: 52, right: 16, width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(12,31,50,0.92)", borderWidth: 1, borderColor: "#287CA2", elevation: 7, shadowColor: "#000", shadowOpacity: 0.35, shadowRadius: 9 },
  modalRoot: { flex: 1, flexDirection: "row-reverse" }, backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)" }, drawer: { width: "84%", maxWidth: 370, height: "100%", paddingTop: 52, backgroundColor: "#091827", borderLeftWidth: 1, borderColor: "#1C4A64" }, drawerHead: { paddingHorizontal: 18, paddingBottom: 18, flexDirection: "row-reverse", alignItems: "center", gap: 10, borderBottomWidth: 1, borderColor: "#1A3850" }, logoMark: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: colors.cyan }, headCopy: { flex: 1, alignItems: "flex-end" }, appName: { color: colors.text, fontSize: 16, fontWeight: "900", letterSpacing: 0.5 }, appSub: { color: colors.muted, fontSize: 10, marginTop: 2 }, close: { width: 36, height: 36, alignItems: "center", justifyContent: "center" }, section: { color: colors.cyan, fontSize: 11, fontWeight: "900", textAlign: "right", paddingHorizontal: 18, paddingTop: 18, paddingBottom: 7 }, row: { minHeight: 67, paddingHorizontal: 17, flexDirection: "row-reverse", alignItems: "center", gap: 10 }, rowIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: "#102A3E", alignItems: "center", justifyContent: "center" }, rowCopy: { flex: 1, alignItems: "flex-end" }, rowTitle: { color: colors.text, fontSize: 13, fontWeight: "800" }, rowDescription: { color: colors.muted, fontSize: 10, marginTop: 3, textAlign: "right" }, credit: { marginHorizontal: 17, marginTop: 17, paddingTop: 14, borderTopWidth: 1, borderColor: "#1A3850", flexDirection: "row-reverse", justifyContent: "center", gap: 5, alignItems: "center" }, creditText: { color: colors.muted, fontSize: 11, fontWeight: "800" }, dimmed: { opacity: 0.65 },
});
