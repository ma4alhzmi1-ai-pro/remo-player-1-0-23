import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";

import { colors } from "@/components/remo-ui";
import { ScreenContainer } from "@/components/screen-container";
import { checkGithubForUpdate, currentAppVersion, openOfficialUpdate } from "@/lib/github-update-checker";
import { useLanguage, APP_LANGUAGE_OPTIONS } from "@/lib/language-provider";
import { useLibrary } from "@/lib/library-context";
import { ACCENT_THEMES } from "@/lib/theme-presets";
import { useThemeContext } from "@/lib/theme-provider";
import { getVideoBackgroundPlaybackSetting, setVideoBackgroundPlaybackSetting } from "@/lib/video-playback-settings";

export default function SettingsScreen() {
  const { refreshDeviceLibrary, isRefreshing, importFiles, exportPlaylistBackup, importPlaylistBackup } = useLibrary();
  const { accentTheme, setAccentTheme } = useThemeContext();
  const { language, setLanguage, t, isRTL } = useLanguage();
  const [videoBackgroundEnabled, setVideoBackgroundEnabled] = useState(true);

  useEffect(() => {
    void getVideoBackgroundPlaybackSetting().then(setVideoBackgroundEnabled);
  }, []);

  const handleToggleVideoBackground = async (value: boolean) => {
    setVideoBackgroundEnabled(value);
    await setVideoBackgroundPlaybackSetting(value);
  };

  const refresh = async () => { const complete = await refreshDeviceLibrary(); if (!complete) Alert.alert("REMO PLAYER", "Grant media permission from Android settings or import selected files."); };
  const exportBackup = async () => { if (!(await exportPlaylistBackup())) Alert.alert("REMO PLAYER", "File sharing is unavailable in this environment. Try the Android build."); };
  const importBackup = async () => { const count = await importPlaylistBackup(); Alert.alert("REMO PLAYER", count ? `${count}` : "0"); };
  const checkForUpdate = async () => {
    const result = await checkGithubForUpdate();
    if (result.status === "available") {
      Alert.alert(`يتوفر REMO PLAYER ${result.release.version}`, result.release.notes, [
        { text: "لاحقاً", style: "cancel" },
        { text: "فتح صفحة الإصدار", onPress: () => { void openOfficialUpdate(result.release.releaseUrl); } },
      ]);
      return;
    }
    Alert.alert("فحص التحديثات", result.status === "current" ? `أنت تستخدم الإصدار الأحدث (${currentAppVersion()}).` : "تعذر الاتصال بخدمة الإصدارات الآن. لن يؤثر ذلك في عمل التطبيق، حاول لاحقاً.");
  };
  return <ScreenContainer><ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}><View style={[styles.header, !isRTL && styles.leftAligned]}><Text style={[styles.title, !isRTL && styles.leftText]}>{t("settings")}</Text><Text style={[styles.subtitle, !isRTL && styles.leftText]}>{t("settingsSubtitle")}</Text></View>
    <View style={styles.settingCard}>
      <View style={styles.settingCardHead}>
        <View style={styles.settingIconWrap}><MaterialIcons name="ondemand-video" size={22} color={colors.cyan} /></View>
        <View style={styles.settingTextWrap}>
          <Text style={styles.settingTitle}>تشغيل الفيديو في الخلفية وقفل الشاشة</Text>
          <Text style={styles.settingDesc}>متابعة تشغيل صوت الفيديو عند الخروج من التطبيق أو قفل الشاشة وإظهار أزرار التحكم (التالي، السابق، تشغيل/إيقاف) في شريط الإشعارات.</Text>
        </View>
      </View>
      <View style={styles.switchRow}>
        <Text style={[styles.switchStatus, { color: videoBackgroundEnabled ? colors.cyan : colors.muted }]}>
          {videoBackgroundEnabled ? "مفعل (يعمل بالخلفية)" : "معطل (إيقاف مؤقت عند الخروج)"}
        </Text>
        <Switch
          value={videoBackgroundEnabled}
          onValueChange={(val) => void handleToggleVideoBackground(val)}
          thumbColor={videoBackgroundEnabled ? colors.cyan : "#8A9BA8"}
          trackColor={{ false: "#1B3042", true: "rgba(117, 230, 218, 0.35)" }}
        />
      </View>
    </View>
    <View style={styles.languageSection}><Text style={[styles.sectionTitle, !isRTL && styles.leftText]}>{t("language")}</Text><Text style={[styles.sectionDescription, !isRTL && styles.leftText]}>{t("languageDescription")}</Text><View style={styles.languageGrid}>{APP_LANGUAGE_OPTIONS.map((option) => <Pressable key={option.id} onPress={() => setLanguage(option.id)} style={({ pressed }) => [styles.languageCard, language === option.id && styles.languageActive, pressed && styles.pressed]}><MaterialIcons name={language === option.id ? "check-circle" : "language"} size={19} color={language === option.id ? "#06101A" : colors.cyan} /><Text style={[styles.languageNative, language === option.id && styles.languageNativeActive]}>{option.nativeLabel}</Text><Text style={[styles.languageLabel, language === option.id && styles.languageLabelActive]}>{option.label}</Text></Pressable>)}</View></View><View style={styles.themeSection}><Text style={[styles.sectionTitle, !isRTL && styles.leftText]}>{t("colorTheme")}</Text><Text style={[styles.sectionDescription, !isRTL && styles.leftText]}>{t("colorThemeDescription")}</Text><View style={styles.themeGrid}>{ACCENT_THEMES.map((theme) => <Pressable key={theme.id} onPress={() => setAccentTheme(theme.id)} style={({ pressed }) => [styles.themeCard, accentTheme === theme.id && { borderColor: theme.color, backgroundColor: `${theme.color}1A` }, pressed && styles.pressed]}><View style={[styles.themeDot, { backgroundColor: theme.color }]}>{accentTheme === theme.id ? <MaterialIcons name="check" size={16} color="#06101A" /> : null}</View><Text style={styles.themeName}>{theme.name}</Text><Text style={styles.themeDescription}>{theme.description}</Text></Pressable>)}</View></View><View style={styles.group}><ActionRow icon="system-update" title="التحقق من التحديثات" description="فحص صفحة إصدار REMO PLAYER الرسمية على GitHub" onPress={() => void checkForUpdate()} isRTL={isRTL} /><ActionRow icon="refresh" title={t("rescan")} description={t("rescanDescription")} onPress={() => void refresh()} disabled={isRefreshing} isRTL={isRTL} /><ActionRow icon="file-open" title={t("importFiles")} description={t("importFilesDescription")} onPress={() => void importFiles()} isRTL={isRTL} /><ActionRow icon="backup" title={t("backup")} description={t("backupDescription")} onPress={() => void exportBackup()} isRTL={isRTL} /><ActionRow icon="restore" title={t("restore")} description={t("restoreDescription")} onPress={() => void importBackup()} isRTL={isRTL} /><ActionRow icon="subtitles" title={t("formats")} description={t("formatsDescription")} onPress={() => Alert.alert("REMO PLAYER", "MP4, MKV, AVI, MOV, MP3, WAV, AAC, FLAC, SRT, VTT, ASS, SSA and more are indexed. Playback depends on the file codec and Android support.")} isRTL={isRTL} /><ActionRow icon="info-outline" title={t("about")} description={t("aboutDescription")} onPress={() => Alert.alert("REMO PLAYER", "REMO PLAYER")} isRTL={isRTL} /></View></ScrollView></ScreenContainer>;
}

function ActionRow({ icon, title, description, onPress, disabled, isRTL }: { icon: keyof typeof MaterialIcons.glyphMap; title: string; description: string; onPress: () => void; disabled?: boolean; isRTL: boolean }) { return <Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => [styles.row, !isRTL && styles.rowLtr, pressed && styles.pressed, disabled && styles.disabled]}><View style={styles.rowIcon}><MaterialIcons name={icon} size={22} color={colors.cyan} /></View><View style={[styles.rowCopy, !isRTL && styles.leftAligned]}><Text style={[styles.rowTitle, !isRTL && styles.leftText]}>{title}</Text><Text style={[styles.rowDescription, !isRTL && styles.leftText]}>{description}</Text></View><MaterialIcons name={isRTL ? "chevron-left" : "chevron-right"} size={22} color={colors.muted} /></Pressable>; }

const styles = StyleSheet.create({
  scroll: { paddingBottom: 42 },
  header: { paddingHorizontal: 18, paddingTop: 13, paddingBottom: 16, alignItems: "flex-end" },
  leftAligned: { alignItems: "flex-start" },
  title: { color: colors.text, fontSize: 25, lineHeight: 32, fontWeight: "900" },
  subtitle: { color: colors.muted, fontSize: 12, lineHeight: 18, textAlign: "right" },
  leftText: { textAlign: "left" },
  settingCard: {
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 16,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingCardHead: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: 12,
  },
  settingIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10263B",
  },
  settingTextWrap: {
    flex: 1,
    alignItems: "flex-end",
  },
  settingTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
    textAlign: "right",
    lineHeight: 20,
  },
  settingDesc: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 17,
    textAlign: "right",
    marginTop: 4,
  },
  switchRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  switchStatus: {
    fontSize: 12,
    fontWeight: "700",
  },
  languageSection: { marginHorizontal: 16, marginBottom: 14, padding: 16, borderRadius: 20, backgroundColor: "#0D2434", borderWidth: 1, borderColor: "#1C5F84" },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: "900", textAlign: "right" },
  sectionDescription: { color: colors.muted, fontSize: 11, lineHeight: 17, textAlign: "right", marginTop: 3 },
  languageGrid: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 8, marginTop: 12 },
  languageCard: { width: "48%", minHeight: 72, padding: 10, borderRadius: 15, borderWidth: 1, borderColor: colors.border, backgroundColor: "#10263B", alignItems: "flex-end" },
  languageActive: { backgroundColor: colors.cyan, borderColor: colors.cyan },
  languageNative: { color: colors.text, fontSize: 13, fontWeight: "900", marginTop: 4 },
  languageNativeActive: { color: "#06101A" },
  languageLabel: { color: colors.muted, fontSize: 10, marginTop: 1 },
  languageLabelActive: { color: "#0A3044" },
  themeSection: { marginHorizontal: 16, marginBottom: 14, padding: 16, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  themeGrid: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 8, marginTop: 12 },
  themeCard: { width: "48%", minHeight: 94, padding: 10, borderRadius: 15, borderWidth: 1, borderColor: colors.border, backgroundColor: "#10263B", alignItems: "flex-end" },
  themeDot: { width: 25, height: 25, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  themeName: { color: colors.text, fontSize: 12, fontWeight: "900", marginTop: 7, textAlign: "right" },
  themeDescription: { color: colors.muted, fontSize: 9, marginTop: 2, textAlign: "right" },
  group: { borderRadius: 18, overflow: "hidden", marginHorizontal: 16, borderWidth: 1, borderColor: colors.border },
  row: { minHeight: 76, paddingHorizontal: 13, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: "row-reverse", alignItems: "center", gap: 11 },
  rowLtr: { flexDirection: "row" },
  rowIcon: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "#10263B" },
  rowCopy: { flex: 1, alignItems: "flex-end" },
  rowTitle: { color: colors.text, fontSize: 14, lineHeight: 20, fontWeight: "800", textAlign: "right" },
  rowDescription: { color: colors.muted, fontSize: 11, lineHeight: 17, textAlign: "right" },
  pressed: { opacity: 0.65 },
  disabled: { opacity: 0.5 },
});
