import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { VideoPlayer, VideoView, useVideoPlayer } from "expo-video";

import { colors, formatDuration } from "@/components/remo-ui";
import { ScreenContainer } from "@/components/screen-container";
import { loadLocalSubtitles, saveLocalSubtitles, type LocalSubtitleTrack } from "@/lib/subtitle-store";
import { parseSubtitleFile, supportsSubtitleImport } from "@/lib/subtitle-formats";
import { readVideoForTranslation } from "@/lib/translation-upload";
import { usePlayer } from "@/lib/player-context";
import { trpc } from "@/lib/trpc";
import type { MediaItem } from "@/types/media";

type DisplayMode = "auto" | "cinematic" | "hdr" | "ultra";
type QuickOption = "speed" | "background" | "mute" | "mirror" | "equalizer" | "pip" | "ab" | "night";
type TranslationLanguage = "العربية" | "English" | "Français" | "Español" | "Türkçe";

const displayModes: Array<{ id: DisplayMode; label: string }> = [
  { id: "auto", label: "تلقائي" },
  { id: "cinematic", label: "سينمائي" },
  { id: "hdr", label: "HDR" },
  { id: "ultra", label: "فائق الدقة" },
];
const translationLanguages: TranslationLanguage[] = ["العربية", "English", "Français", "Español", "Türkçe"];

export default function VideoPlayerScreen() {
  const router = useRouter();
  const { currentItem } = usePlayer();
  const viewRef = useRef<any>(null);
  const [displayMode, setDisplayMode] = useState<DisplayMode>("auto");
  const [isSharing, setIsSharing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [backgroundEnabled, setBackgroundEnabled] = useState(true);
  const [muted, setMuted] = useState(false);
  const [mirrored, setMirrored] = useState(false);
  const [nightMode, setNightMode] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [repeatStart, setRepeatStart] = useState<number | null>(null);
  const [repeatEnd, setRepeatEnd] = useState<number | null>(null);
  const [subtitleTrack, setSubtitleTrack] = useState<LocalSubtitleTrack | null>(null);
  const [subtitleEnabled, setSubtitleEnabled] = useState(true);
  const [subtitleTime, setSubtitleTime] = useState(0);
  const [translationOpen, setTranslationOpen] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState<TranslationLanguage>("العربية");
  const translateMutation = trpc.media.translateVideo.useMutation();
  const player = useVideoPlayer(currentItem?.mediaType === "video" ? currentItem.uri : null, (videoPlayer) => {
    videoPlayer.staysActiveInBackground = true;
    videoPlayer.showNowPlayingNotification = true;
    videoPlayer.timeUpdateEventInterval = 0.35;
  });

  useEffect(() => {
    if (repeatStart === null || repeatEnd === null) return;
    const timer = setInterval(() => { if (player.currentTime >= repeatEnd) player.currentTime = repeatStart; }, 250);
    return () => clearInterval(timer);
  }, [player, repeatStart, repeatEnd]);

  useEffect(() => {
    const timer = setInterval(() => setSubtitleTime(player.currentTime), 300);
    return () => clearInterval(timer);
  }, [player]);

  useEffect(() => {
    if (!currentItem || currentItem.mediaType !== "video") return;
    void loadLocalSubtitles(currentItem.id).then((saved) => {
      setSubtitleTrack(saved);
      setSubtitleEnabled(Boolean(saved));
    });
  }, [currentItem?.id, currentItem?.mediaType]);

  if (!currentItem || currentItem.mediaType !== "video") {
    return <ScreenContainer><View style={styles.empty}><Text style={styles.emptyText}>اختر فيديو من مكتبتك أولاً.</Text><Pressable onPress={() => router.back()} style={styles.backButton}><Text style={styles.backText}>العودة للفيديوهات</Text></Pressable></View></ScreenContainer>;
  }

  const activeCue = subtitleTrack?.cues.find((cue) => subtitleTime >= cue.start && subtitleTime <= cue.end);
  const chooseMode = (mode: DisplayMode) => {
    if (mode === "ultra") {
      const bestTrack = [...player.availableVideoTracks].filter((track) => track.isSupported).sort((a, b) => (b.size.width * b.size.height) - (a.size.width * a.size.height))[0];
      Alert.alert("الجودة الفائقة", bestTrack ? `يستخدم Android أفضل مسار مدعوم: ${bestTrack.size.width}×${bestTrack.size.height}.` : "سيستمر Android باستخدام أفضل جودة يمكن للملف والجهاز تشغيلها.");
    }
    if (mode === "hdr") Alert.alert("HDR عند توفره", "يعرض Android HDR تلقائياً إذا كان الفيديو وشاشة جهازك يدعمانه.");
    setDisplayMode(mode);
  };
  const togglePlay = () => { if (player.playing) { player.pause(); setIsPlaying(false); } else { player.play(); setIsPlaying(true); } };
  const cycleSpeed = () => { const values = [0.5, 0.75, 1, 1.25, 1.5, 2]; const next = values[(values.indexOf(speed) + 1) % values.length]; player.playbackRate = next; setSpeed(next); };
  const toggleBackground = () => { const next = !backgroundEnabled; player.staysActiveInBackground = next; setBackgroundEnabled(next); };
  const toggleMute = () => { const next = !muted; player.muted = next; setMuted(next); };
  const openPip = async () => { try { await viewRef.current?.startPictureInPicture(); } catch { Alert.alert("النافذة العائمة", "وضع النافذة العائمة غير مدعوم على هذا الجهاز أو يحتاج تفعيله من إعدادات النظام."); } };
  const setAbPoint = () => {
    if (repeatStart === null || repeatEnd !== null) {
      setRepeatStart(player.currentTime); setRepeatEnd(null);
      Alert.alert("تكرار A–B", "تم تحديد النقطة A. انتقل إلى نهاية المقطع واضغط الزر مرة أخرى لتحديد B.");
    } else {
      const end = Math.max(player.currentTime, repeatStart + 1); setRepeatEnd(end);
      Alert.alert("تكرار A–B", `سيُكرر المشغل المقطع بين ${formatDuration(repeatStart)} و${formatDuration(end)}.`);
    }
  };
  const resetAb = () => { setRepeatStart(null); setRepeatEnd(null); };
  const selectOption = (option: QuickOption) => {
    if (option === "speed") cycleSpeed();
    if (option === "background") toggleBackground();
    if (option === "mute") toggleMute();
    if (option === "mirror") setMirrored((value) => !value);
    if (option === "equalizer") Alert.alert("معادل الصوت", "يستخدم REMO PLAYER معالجة الصوت الأصلية في Android. يتطلب المعادل متعدد النطاقات محرك صوت مخصصاً.");
    if (option === "pip") void openPip();
    if (option === "ab") setAbPoint();
    if (option === "night") setNightMode((value) => !value);
  };
  const shareVideo = async () => {
    setIsSharing(true);
    try {
      if (!(await Sharing.isAvailableAsync())) { Alert.alert("المشاركة غير متاحة", "لا تتوفر لوحة المشاركة في بيئة المعاينة أو على هذا الجهاز."); return; }
      await Sharing.shareAsync(currentItem.uri, { dialogTitle: `مشاركة ${currentItem.title}`, mimeType: "video/*" });
    } catch { Alert.alert("تعذرت المشاركة", "تحقق من أن الملف ما زال متاحاً ويمكن للتطبيق قراءته."); } finally { setIsSharing(false); }
  };
  const importSubtitleFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "*/*", multiple: false, copyToCacheDirectory: true });
      if (result.canceled) return;
      const asset = result.assets[0];
      if (!supportsSubtitleImport(asset.name)) {
        Alert.alert("صيغة ترجمة غير مدعومة", "اختر ملف ترجمة نصياً من صيغ SRT أو VTT أو ASS أو SSA أو SAMI أو SUB أو MPL أو PJS أو TXT.");
        return;
      }
      const content = await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.UTF8 });
      const cues = parseSubtitleFile(content, asset.name);
      const extension = asset.name.split(".").pop()?.toUpperCase() ?? "SUB";
      const track: LocalSubtitleTrack = { targetLanguage: `ملف ${extension}`, detectedLanguage: "ترجمة محلية", createdAt: Date.now(), cues };
      await saveLocalSubtitles(currentItem.id, track);
      setSubtitleTrack(track);
      setSubtitleEnabled(true);
      Alert.alert("تم استيراد الترجمة", `أُضيفت ${cues.length} أسطر من ملف ${asset.name}.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "تعذر قراءة ملف الترجمة.";
      Alert.alert("تعذر استيراد الترجمة", message);
    }
  };
  const generateTranslation = async () => {
    try {
      const videoBase64 = await readVideoForTranslation(currentItem.uri);
      const generated = await translateMutation.mutateAsync({ videoBase64, targetLanguage });
      const track: LocalSubtitleTrack = { ...generated, createdAt: Date.now() };
      await saveLocalSubtitles(currentItem.id, track);
      setSubtitleTrack(track);
      setSubtitleEnabled(true);
      setTranslationOpen(false);
      Alert.alert("تم إنشاء الترجمة", `حُفظت ${track.cues.length} أسطر باللغة ${targetLanguage} داخل REMO PLAYER.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "تعذّر إنشاء الترجمة حالياً.";
      Alert.alert("تعذرت الترجمة", message);
    }
  };
  const optionData: Array<{ id: QuickOption; icon: keyof typeof MaterialIcons.glyphMap; label: string; active?: boolean }> = [
    { id: "speed", icon: "speed", label: `${speed}×` },
    { id: "background", icon: "headset", label: "خلفية", active: backgroundEnabled },
    { id: "mute", icon: muted ? "volume-off" : "volume-up", label: "كتم", active: muted },
    { id: "mirror", icon: "flip", label: "مرآة", active: mirrored },
    { id: "equalizer", icon: "equalizer", label: "المعادل" },
    { id: "pip", icon: "picture-in-picture-alt", label: "نافذة" },
    { id: "ab", icon: "repeat", label: repeatEnd !== null ? "A–B يعمل" : "تكرار A-B", active: repeatStart !== null },
    { id: "night", icon: "dark-mode", label: "ليلي", active: nightMode },
  ];

  return <ScreenContainer edges={["top", "bottom", "left", "right"]}>
    <View style={styles.header}>
      <Pressable onPress={() => router.back()} style={styles.headerIcon}><MaterialIcons name="arrow-forward" size={25} color={colors.text} /></Pressable>
      <Text numberOfLines={1} style={styles.headerTitle}>{currentItem.title}</Text>
      <Pressable onPress={() => void shareVideo()} disabled={isSharing} style={[styles.headerIcon, isSharing && styles.dimmed]}><MaterialIcons name="share" size={21} color={colors.text} /></Pressable>
    </View>
    <Pressable onPress={() => setControlsVisible((visible) => !visible)} style={[styles.mediaSurface, displayMode === "cinematic" && styles.cinematicSurface]}>
      <View style={[styles.videoContainer, mirrored && styles.mirrored]}><VideoView ref={viewRef} style={styles.video} player={player} nativeControls={false} allowsFullscreen allowsPictureInPicture contentFit={displayMode === "cinematic" ? "cover" : "contain"} surfaceType="textureView" /></View>
      {nightMode ? <View pointerEvents="none" style={styles.nightOverlay} /> : null}
      {subtitleEnabled && activeCue ? <View pointerEvents="none" style={styles.subtitleOverlay}><Text style={styles.subtitleText}>{activeCue.text}</Text></View> : null}
      {controlsVisible ? <View style={styles.overlay} pointerEvents="box-none">
        <View style={styles.overlayTop}><Text numberOfLines={1} style={styles.overlayTitle}>{currentItem.title}</Text><View style={styles.overlayTopIcons}><Pressable onPress={() => subtitleTrack ? setSubtitleEnabled((enabled) => !enabled) : setTranslationOpen(true)}><MaterialIcons name="closed-caption" size={23} color={subtitleEnabled && subtitleTrack ? colors.cyan : colors.text} /></Pressable><MaterialIcons name="hd" size={25} color={colors.text} /></View></View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickOptions}>{optionData.map((option) => <Pressable key={option.id} onPress={() => selectOption(option.id)} style={({ pressed }) => [styles.quickOption, option.active && styles.quickActive, pressed && styles.dimmed]}><View style={[styles.quickIcon, option.active && styles.quickIconActive]}><MaterialIcons name={option.icon} size={22} color={option.active ? colors.background : colors.text} /></View><Text style={styles.quickLabel}>{option.label}</Text></Pressable>)}</ScrollView>
        <View style={styles.overlayBottom}><View style={styles.progressWrap}><Text style={styles.time}>{formatDuration(player.currentTime)}</Text><View style={styles.progressTrack}><View style={styles.progressFill} /></View><Text style={styles.time}>{formatDuration(player.duration || currentItem.duration)}</Text></View><View style={styles.playControls}><Pressable onPress={() => player.seekBy(-10)} style={styles.transport}><MaterialIcons name="replay-10" size={28} color={colors.text} /></Pressable><Pressable onPress={() => player.seekBy(-10)} style={styles.transport}><MaterialIcons name="skip-previous" size={29} color={colors.text} /></Pressable><Pressable onPress={togglePlay} style={styles.playButton}><MaterialIcons name={isPlaying ? "pause" : "play-arrow"} size={38} color={colors.text} /></Pressable><Pressable onPress={() => player.seekBy(10)} style={styles.transport}><MaterialIcons name="skip-next" size={29} color={colors.text} /></Pressable><Pressable onPress={() => player.seekBy(10)} style={styles.transport}><MaterialIcons name="forward-10" size={28} color={colors.text} /></Pressable></View></View>
      </View> : null}
    </Pressable>
    <View style={styles.body}>
      <View style={styles.modeRow}>{displayModes.map((mode) => <Pressable key={mode.id} onPress={() => chooseMode(mode.id)} style={[styles.modeButton, displayMode === mode.id && styles.modeActive]}><Text style={[styles.modeText, displayMode === mode.id && styles.modeTextActive]}>{mode.label}</Text></Pressable>)}</View>
      <Pressable onPress={() => setTranslationOpen(true)} style={({ pressed }) => [styles.translateButton, pressed && styles.dimmed]}><MaterialIcons name="translate" size={21} color={colors.background} /><View style={styles.translateCopy}><Text style={styles.translateTitle}>{subtitleTrack ? `الترجمة: ${subtitleTrack.targetLanguage}` : "ترجمة ذكية للفيديو"}</Text><Text style={styles.translateHint}>{subtitleTrack ? "اضغط لتغيير اللغة أو إعادة إنشاء الترجمة" : "تفريغ وترجمة الكلام عبر الإنترنت"}</Text></View><MaterialIcons name="chevron-left" size={23} color={colors.background} /></Pressable>
      <View style={styles.actionRow}><Pressable onPress={() => router.push("/player/edit-video" as never)} style={styles.actionButton}><MaterialIcons name="content-cut" size={20} color={colors.cyan} /><Text style={styles.actionText}>تحرير</Text></Pressable><Pressable onPress={() => void importSubtitleFile()} style={styles.actionButton}><MaterialIcons name="subtitles" size={20} color={colors.cyan} /><Text style={styles.actionText}>استيراد ترجمة</Text></Pressable><Pressable onPress={() => void shareVideo()} disabled={isSharing} style={styles.actionButton}><MaterialIcons name="ios-share" size={20} color={colors.cyan} /><Text style={styles.actionText}>{isSharing ? "جارٍ..." : "مشاركة"}</Text></Pressable>{repeatEnd !== null ? <Pressable onPress={resetAb} style={styles.actionButton}><MaterialIcons name="restart-alt" size={20} color={colors.cyan} /><Text style={styles.actionText}>إلغاء A-B</Text></Pressable> : null}</View>
      <Text style={styles.note}>يدعم REMO PLAYER فهرسة الامتدادات الشائعة والمطلوبة؛ بينما يتحدد التشغيل الفعلي بترميز الملف ودعم Android. يمكنك استيراد ملفات SRT وVTT وASS وSSA وSAMI وSUB وMPL وPJS وTXT النصية.</Text>
    </View>
    <TranslationSheet visible={translationOpen} item={currentItem} selectedLanguage={targetLanguage} onSelectLanguage={setTargetLanguage} generating={translateMutation.isPending} onClose={() => setTranslationOpen(false)} onGenerate={() => void generateTranslation()} />
  </ScreenContainer>;
}

function TranslationSheet({ visible, item, selectedLanguage, onSelectLanguage, generating, onClose, onGenerate }: { visible: boolean; item: MediaItem; selectedLanguage: TranslationLanguage; onSelectLanguage: (language: TranslationLanguage) => void; generating: boolean; onClose: () => void; onGenerate: () => void }) {
  return <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}><Pressable onPress={onClose} style={sheetStyles.backdrop}><Pressable onPress={() => undefined} style={sheetStyles.sheet}><View style={sheetStyles.sheetHead}><MaterialIcons name="translate" size={24} color={colors.cyan} /><View style={sheetStyles.headCopy}><Text style={sheetStyles.title}>ترجمة ذكية للفيديو</Text><Text numberOfLines={1} style={sheetStyles.subtitle}>{item.title}</Text></View></View><View style={sheetStyles.privacy}><MaterialIcons name="privacy-tip" size={20} color={colors.cyan} /><Text style={sheetStyles.privacyText}>عند التأكيد، سترفع نسخة الفيديو المحدد إلى خدمة الذكاء الاصطناعي المدمجة لتفريغ الكلام وترجمته. تُحفظ الترجمة الناتجة على جهازك.</Text></View><Text style={sheetStyles.languageLabel}>لغة الترجمة</Text><View style={sheetStyles.languages}>{translationLanguages.map((language) => <Pressable key={language} onPress={() => onSelectLanguage(language)} style={[sheetStyles.language, selectedLanguage === language && sheetStyles.languageActive]}><Text style={[sheetStyles.languageText, selectedLanguage === language && sheetStyles.languageTextActive]}>{language}</Text></Pressable>)}</View><Text style={sheetStyles.limit}>يدعم الإصدار الحالي الفيديوهات القصيرة المتاحة محلياً حتى 6MB.</Text><Pressable disabled={generating} onPress={onGenerate} style={[sheetStyles.generate, generating && styles.dimmed]}>{generating ? <ActivityIndicator color={colors.background} /> : <><MaterialIcons name="auto-awesome" size={20} color={colors.background} /><Text style={sheetStyles.generateText}>أوافق وأنشئ الترجمة</Text></>}</Pressable><Pressable disabled={generating} onPress={onClose} style={sheetStyles.cancel}><Text style={sheetStyles.cancelText}>إلغاء</Text></Pressable></Pressable></Pressable></Modal>;
}

const styles = StyleSheet.create({
  header: { height: 58, paddingHorizontal: 16, flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between" }, headerIcon: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" }, headerTitle: { flex: 1, color: colors.text, fontSize: 13, fontWeight: "800", textAlign: "center", marginHorizontal: 8 }, mediaSurface: { width: "100%", aspectRatio: 16 / 9, backgroundColor: "#02060B", overflow: "hidden" }, cinematicSurface: { aspectRatio: 2.25, marginVertical: 14 }, videoContainer: { flex: 1 }, mirrored: { transform: [{ scaleX: -1 }] }, video: { flex: 1 }, nightOverlay: { position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.44)" }, subtitleOverlay: { position: "absolute", left: 22, right: 22, bottom: 20, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: "rgba(0,0,0,0.78)", alignItems: "center" }, subtitleText: { color: "#FFFFFF", fontSize: 15, lineHeight: 22, fontWeight: "800", textAlign: "center" }, overlay: { ...StyleSheet.absoluteFillObject, justifyContent: "space-between", backgroundColor: "rgba(0, 8, 15, 0.3)", paddingVertical: 12 }, overlayTop: { paddingHorizontal: 15, flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between" }, overlayTitle: { flex: 1, color: colors.text, fontSize: 12, fontWeight: "800", textAlign: "right", marginLeft: 10 }, overlayTopIcons: { flexDirection: "row-reverse", gap: 12 }, quickOptions: { paddingHorizontal: 16, gap: 11, alignItems: "center" }, quickOption: { width: 58, alignItems: "center", gap: 4 }, quickIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: "rgba(12,18,27,0.82)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" }, quickActive: { opacity: 1 }, quickIconActive: { backgroundColor: colors.cyan, borderColor: colors.cyan }, quickLabel: { color: colors.text, fontSize: 9, lineHeight: 12, textAlign: "center", fontWeight: "700" }, overlayBottom: { paddingHorizontal: 16 }, progressWrap: { flexDirection: "row-reverse", alignItems: "center", gap: 9 }, time: { color: colors.text, fontSize: 11, fontVariant: ["tabular-nums"] }, progressTrack: { flex: 1, height: 3, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.44)" }, progressFill: { height: 3, width: "16%", borderRadius: 2, backgroundColor: colors.text }, playControls: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginTop: 9 }, transport: { width: 40, height: 40, alignItems: "center", justifyContent: "center" }, playButton: { width: 58, height: 58, borderRadius: 29, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: colors.text, backgroundColor: "rgba(0,0,0,0.32)" }, body: { padding: 16, alignItems: "flex-end" }, modeRow: { alignSelf: "stretch", flexDirection: "row-reverse", gap: 7 }, modeButton: { flex: 1, minHeight: 35, borderRadius: 11, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" }, modeActive: { backgroundColor: colors.cyan, borderColor: colors.cyan }, modeText: { color: colors.text, fontSize: 11, fontWeight: "800" }, modeTextActive: { color: colors.background }, translateButton: { alignSelf: "stretch", minHeight: 58, marginTop: 12, paddingHorizontal: 12, borderRadius: 15, backgroundColor: colors.cyan, flexDirection: "row-reverse", alignItems: "center", gap: 9 }, translateCopy: { flex: 1, alignItems: "flex-end" }, translateTitle: { color: colors.background, fontSize: 13, fontWeight: "900" }, translateHint: { color: "#064057", fontSize: 10, lineHeight: 15, textAlign: "right" }, actionRow: { alignSelf: "stretch", flexDirection: "row-reverse", gap: 9, marginTop: 12 }, actionButton: { flex: 1, minHeight: 43, paddingHorizontal: 7, borderRadius: 13, backgroundColor: colors.surface, borderWidth: 1, borderColor: "#1A526C", flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 5 }, actionText: { color: colors.text, fontSize: 11, fontWeight: "800" }, note: { color: colors.muted, fontSize: 11, lineHeight: 17, textAlign: "right", marginTop: 13 }, dimmed: { opacity: 0.6 }, empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14 }, emptyText: { color: colors.muted, fontSize: 15 }, backButton: { height: 42, paddingHorizontal: 16, borderRadius: 13, backgroundColor: colors.cyan, justifyContent: "center" }, backText: { color: colors.background, fontWeight: "800" },
});

const sheetStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "flex-end" }, sheet: { padding: 20, paddingBottom: 30, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: colors.surface, borderTopWidth: 1, borderColor: colors.border }, sheetHead: { flexDirection: "row-reverse", alignItems: "center", gap: 10 }, headCopy: { flex: 1, alignItems: "flex-end" }, title: { color: colors.text, fontSize: 18, lineHeight: 25, fontWeight: "900", textAlign: "right" }, subtitle: { color: colors.muted, fontSize: 12, lineHeight: 18, textAlign: "right" }, privacy: { flexDirection: "row-reverse", alignItems: "flex-start", gap: 8, padding: 12, borderRadius: 14, backgroundColor: "#102C3C", marginTop: 16 }, privacyText: { flex: 1, color: colors.text, fontSize: 11, lineHeight: 18, textAlign: "right" }, languageLabel: { color: colors.text, fontSize: 13, fontWeight: "800", textAlign: "right", marginTop: 17, marginBottom: 8 }, languages: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 8 }, language: { minHeight: 36, paddingHorizontal: 12, borderRadius: 11, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" }, languageActive: { backgroundColor: colors.cyan, borderColor: colors.cyan }, languageText: { color: colors.text, fontSize: 12, fontWeight: "800" }, languageTextActive: { color: colors.background }, limit: { color: colors.muted, fontSize: 11, lineHeight: 17, textAlign: "right", marginTop: 12 }, generate: { minHeight: 49, borderRadius: 15, backgroundColor: colors.cyan, marginTop: 17, flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 7 }, generateText: { color: colors.background, fontSize: 13, fontWeight: "900" }, cancel: { minHeight: 42, alignItems: "center", justifyContent: "center", marginTop: 7 }, cancelText: { color: colors.cyan, fontSize: 13, fontWeight: "900" },
});
