import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import * as Brightness from "expo-brightness";
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import * as ScreenOrientation from "expo-screen-orientation";
import * as Sharing from "expo-sharing";
import * as VideoThumbnails from "expo-video-thumbnails";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Modal, PanResponder, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { isPictureInPictureSupported, VideoView } from "expo-video";

import { colors, formatDuration } from "@/components/remo-ui";
import { ScreenContainer } from "@/components/screen-container";
import { prepareMediaNotificationControls } from "@/lib/media-notification-permission";
import { usePlayer } from "@/lib/player-context";
import { loadLocalSubtitles, saveLocalSubtitles, type LocalSubtitleTrack } from "@/lib/subtitle-store";
import { parseSubtitleFile, supportsSubtitleImport } from "@/lib/subtitle-formats";
import { readVideoForTranslation } from "@/lib/translation-upload";
import { trpc } from "@/lib/trpc";
import { resolveVideoGesture, shouldActivateVideoGesture } from "@/lib/video-gesture";
import { nextVideoPlaybackSpeed } from "@/lib/video-playback-settings";
import { resolveVideoProgressSeek } from "@/lib/video-progress";
import { resolveSafeVideoSeek } from "@/lib/video-seek";
import { resolveFrameDimensions, resolveVideoContentFit, type FrameAspect, type VideoFitMode } from "@/lib/video-display-settings";
import type { MediaItem } from "@/types/media";

type DisplayMode = "auto" | "cinematic" | "hdr" | "quality";
type TranslationLanguage = "العربية" | "English" | "Français" | "Español" | "Türkçe";

const displayModes: { id: DisplayMode; label: string }[] = [
  { id: "auto", label: "تلقائي" },
  { id: "cinematic", label: "سينمائي" },
  { id: "hdr", label: "HDR" },
  { id: "quality", label: "الجودة" },
];
const translationLanguages: TranslationLanguage[] = ["العربية", "English", "Français", "Español", "Türkçe"];
const fitModes: { id: VideoFitMode; label: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
  { id: "auto", label: "تلقائي", icon: "auto-fix-high" },
  { id: "contain", label: "احتواء", icon: "fit-screen" },
  { id: "cover", label: "ملء", icon: "crop-free" },
  { id: "fill", label: "تمدد", icon: "aspect-ratio" },
];
const frameAspects: { id: FrameAspect; label: string; ratio?: number }[] = [
  { id: "screen", label: "الشاشة" },
  { id: "16:9", label: "16:9", ratio: 16 / 9 },
  { id: "4:3", label: "4:3", ratio: 4 / 3 },
  { id: "1:1", label: "1:1", ratio: 1 },
  { id: "21:9", label: "21:9", ratio: 21 / 9 },
];

export default function VideoPlayerScreen() {
  const router = useRouter();
  const { currentItem, playNext, playPrevious, repeatMode, toggleRepeat, videoPlayer } = usePlayer();
  const viewRef = useRef<any>(null);
  const touchStartX = useRef(0);
  const progressTrackWidth = useRef(0);
  const isAutoAdvancingRef = useRef(false);
  const isNavigatingVideoRef = useRef(false);
  const originalBrightnessRef = useRef<number | null>(null);
  const [displayMode, setDisplayMode] = useState<DisplayMode>("auto");
  const [isSharing, setIsSharing] = useState(false);
  const [isCapturingFrame, setIsCapturingFrame] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(1);
  const [volumeHud, setVolumeHud] = useState(false);
  const [brightness, setBrightness] = useState(0.7);
  const [brightnessHud, setBrightnessHud] = useState(false);
  const [backgroundEnabled, setBackgroundEnabled] = useState(true);
  const [muted, setMuted] = useState(false);
  const [mirrored, setMirrored] = useState(false);
  const [nightMode, setNightMode] = useState(false);
  const [videoFit, setVideoFit] = useState<VideoFitMode>("auto");
  const [frameAspect, setFrameAspect] = useState<FrameAspect>("screen");
  const [fitPanelOpen, setFitPanelOpen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(false);
  const [controlsLocked, setControlsLocked] = useState(false);
  const [autoRotateEnabled, setAutoRotateEnabled] = useState(true);
  const [repeatStart, setRepeatStart] = useState<number | null>(null);
  const [repeatEnd, setRepeatEnd] = useState<number | null>(null);
  const [subtitleTrack, setSubtitleTrack] = useState<LocalSubtitleTrack | null>(null);
  const [subtitleEnabled, setSubtitleEnabled] = useState(true);
  const [subtitleTime, setSubtitleTime] = useState(0);
  const [translationOpen, setTranslationOpen] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState<TranslationLanguage>("العربية");
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const effectiveFit = resolveVideoContentFit(videoFit, isLandscape, displayMode === "cinematic");
  const mediaSurfaceHeight = isLandscape ? height : width / (16 / 9);
  const frameStyle = resolveFrameDimensions(frameAspect, width, mediaSurfaceHeight) ?? undefined;
  const translateMutation = trpc.media.translateVideo.useMutation();
  const player = videoPlayer;

  useEffect(() => {
    if (Platform.OS === "web") return;
    void ScreenOrientation.unlockAsync();
    return () => { void ScreenOrientation.unlockAsync(); };
  }, []);

  useEffect(() => {
    if (Platform.OS === "web") return;
    let cancelled = false;
    void (async () => {
      try {
        const existing = await Brightness.getPermissionsAsync();
        const permission = existing.granted ? existing : await Brightness.requestPermissionsAsync();
        if (!permission.granted) return;
        const original = await Brightness.getBrightnessAsync();
        if (cancelled) return;
        originalBrightnessRef.current = original;
        setBrightness(original);
      } catch {
        // Brightness is optional. Playback continues if a device blocks the API.
      }
    })();
    return () => {
      cancelled = true;
      if (originalBrightnessRef.current !== null) {
        void Brightness.setBrightnessAsync(originalBrightnessRef.current).catch(() => undefined);
      }
    };
  }, []);

  useEffect(() => {
    setIsPlaying(player.playing);
    const subscription = player.addListener("playingChange", ({ isPlaying: playing }) => setIsPlaying(playing));
    return () => subscription.remove();
  }, [player]);

  useEffect(() => {
    player.staysActiveInBackground = backgroundEnabled;
    player.showNowPlayingNotification = true;
  }, [backgroundEnabled, player]);

  useEffect(() => { player.loop = repeatMode === "one"; }, [player, repeatMode]);
  useEffect(() => {
    const subscription = player.addListener("playToEnd", () => {
      if (repeatMode === "one" || isAutoAdvancingRef.current) return;
      isAutoAdvancingRef.current = true;
      void playNext(repeatMode === "all").then((advanced) => {
        if (!advanced) setIsPlaying(false);
      }).finally(() => { isAutoAdvancingRef.current = false; });
    });
    return () => subscription.remove();
  }, [player, playNext, repeatMode]);
  useEffect(() => {
    if (repeatStart === null || repeatEnd === null) return;
    const timer = setInterval(() => { if (player.currentTime >= repeatEnd) player.currentTime = repeatStart; }, 250);
    return () => clearInterval(timer);
  }, [player, repeatStart, repeatEnd]);
  useEffect(() => {
    const timer = setInterval(() => setSubtitleTime(player.currentTime), 250);
    return () => clearInterval(timer);
  }, [player]);
  const currentVideoId = currentItem?.mediaType === "video" ? currentItem.id : null;
  useEffect(() => {
    if (!currentVideoId) return;
    void loadLocalSubtitles(currentVideoId).then((saved) => {
      setSubtitleTrack(saved);
      setSubtitleEnabled(Boolean(saved));
    });
  }, [currentVideoId]);
  useEffect(() => {
    if (!volumeHud) return;
    const timeout = setTimeout(() => setVolumeHud(false), 900);
    return () => clearTimeout(timeout);
  }, [volumeHud]);

  useEffect(() => {
    if (!brightnessHud) return;
    const timeout = setTimeout(() => setBrightnessHud(false), 900);
    return () => clearTimeout(timeout);
  }, [brightnessHud]);

  const changeVolume = useCallback((amount: number) => {
    const nextVolume = Math.max(0, Math.min(1, Number((volume + amount).toFixed(2))));
    player.volume = nextVolume;
    setVolume(nextVolume);
    setVolumeHud(true);
  }, [player, volume]);
  const changeBrightness = useCallback((amount: number) => {
    const nextBrightness = Math.max(0.05, Math.min(1, Number((brightness + amount).toFixed(2))));
    setBrightness(nextBrightness);
    setBrightnessHud(true);
    if (Platform.OS !== "web") {
      void Brightness.setBrightnessAsync(nextBrightness).catch(() => undefined);
    }
  }, [brightness]);
  const safeSeekBy = useCallback((seconds: number) => {
    const target = resolveSafeVideoSeek(player.currentTime, player.duration, seconds);
    if (target === null) return false;
    try {
      player.currentTime = target;
      setSubtitleTime(target);
      return true;
    } catch {
      return false;
    }
  }, [player]);
  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => !controlsLocked,
    onMoveShouldSetPanResponder: (_, gesture) => shouldActivateVideoGesture(gesture.dx, gesture.dy, controlsLocked),
    onMoveShouldSetPanResponderCapture: (_, gesture) => shouldActivateVideoGesture(gesture.dx, gesture.dy, controlsLocked),
    onPanResponderTerminationRequest: () => false,
    onPanResponderGrant: (event) => { touchStartX.current = event.nativeEvent.locationX; },
    onPanResponderRelease: (_, gesture) => {
      if (controlsLocked) return;
      const action = resolveVideoGesture(gesture.dx, gesture.dy, touchStartX.current, width);
      if (action?.type === "seek") safeSeekBy(action.seconds);
      if (action?.type === "volume") changeVolume(action.delta);
      if (action?.type === "brightness") changeBrightness(action.delta);
      if (!action) setControlsVisible((visible) => !visible);
    },
  }), [changeBrightness, changeVolume, controlsLocked, safeSeekBy, width]);
  const seekFromProgress = useCallback((locationX: number) => {
    const target = resolveVideoProgressSeek(locationX, progressTrackWidth.current, player.duration);
    if (target === null) return;
    player.currentTime = target;
    setSubtitleTime(target);
  }, [player]);
  const progressResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (event) => seekFromProgress(event.nativeEvent.locationX),
    onPanResponderMove: (event) => seekFromProgress(event.nativeEvent.locationX),
  }), [seekFromProgress]);

  if (!currentItem || currentItem.mediaType !== "video") {
    return <ScreenContainer><View style={styles.empty}><Text style={styles.emptyText}>اختر فيديو من مكتبتك أولاً.</Text><Pressable onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)/video" as never)} style={styles.backButton}><Text style={styles.backText}>العودة للفيديوهات</Text></Pressable></View></ScreenContainer>;
  }

  const activeCue = subtitleTrack?.cues.find((cue) => subtitleTime >= cue.start && subtitleTime <= cue.end);
  const progress = player.duration > 0 ? Math.min(100, (player.currentTime / player.duration) * 100) : 0;
  const exitVideo = () => {
    if (!backgroundEnabled) {
      try { player.pause(); } catch { /* The native player may already be unavailable during navigation. */ }
    } else {
      player.staysActiveInBackground = true;
      player.showNowPlayingNotification = true;
    }
    if (router.canGoBack()) router.back(); else router.replace("/(tabs)/video" as never);
  };
  const rotateVideo = () => {
    setAutoRotateEnabled(false);
    const target = isLandscape ? ScreenOrientation.OrientationLock.PORTRAIT_UP : ScreenOrientation.OrientationLock.LANDSCAPE;
    void ScreenOrientation.lockAsync(target).catch(() => undefined);
  };
  const handleFirstFrame = () => {
    if (!autoRotateEnabled || isLandscape || Platform.OS === "web") return;
    void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE).catch(() => undefined);
  };
  const chooseMode = (mode: DisplayMode) => {
    if (mode === "quality") {
      const bestTrack = [...player.availableVideoTracks].filter((track) => track.isSupported).sort((a, b) => (b.size.width * b.size.height) - (a.size.width * a.size.height))[0];
      if (bestTrack) {
        Alert.alert("معلومات الجودة", `أعلى مسار متاح لهذا الملف هو ${bestTrack.size.width}×${bestTrack.size.height}. يختار Android المسار الفعلي وفق دعم الجهاز والترميز.`);
      } else {
        Alert.alert("معلومات الجودة", "لا يوفّر هذا الملف مسارات جودة قابلة للفحص؛ يستخدم Android أفضل جودة يدعمها الجهاز والترميز.");
      }
    }
    if (mode === "hdr") Alert.alert("HDR عند توفره", "يعرض Android HDR تلقائياً عندما يدعمه الفيديو وشاشة جهازك.");
    setDisplayMode(mode);
  };
  const togglePlay = async () => {
    if (player.playing) { player.pause(); setIsPlaying(false); return; }
    await prepareMediaNotificationControls();
    player.staysActiveInBackground = backgroundEnabled;
    player.showNowPlayingNotification = true;
    player.play();
    setIsPlaying(true);
  };
  const cycleSpeed = () => { const next = nextVideoPlaybackSpeed(speed); player.playbackRate = next; setSpeed(next); };
  const toggleBackground = () => { const next = !backgroundEnabled; player.staysActiveInBackground = next; setBackgroundEnabled(next); };
  const toggleMute = () => { const next = !muted; player.muted = next; setMuted(next); };
  const openPip = async () => { if (!isPictureInPictureSupported()) { Alert.alert("النافذة العائمة", "وضع النافذة العائمة غير مدعوم على هذا الجهاز أو يحتاج تفعيله من إعدادات النظام."); return; } try { await viewRef.current?.startPictureInPicture(); } catch { Alert.alert("النافذة العائمة", "تعذر بدء النافذة العائمة الآن. تحقق من السماح بها لتطبيق REMO PLAYER في إعدادات Android."); } };
  const setAbPoint = () => { if (repeatStart === null || repeatEnd !== null) { setRepeatStart(player.currentTime); setRepeatEnd(null); Alert.alert("تكرار A–B", "تم تحديد النقطة A. انتقل إلى نهاية المقطع واضغط الزر مرة أخرى لتحديد B."); } else { const end = Math.max(player.currentTime, repeatStart + 1); setRepeatEnd(end); Alert.alert("تكرار A–B", `سيُكرر المشغل المقطع بين ${formatDuration(repeatStart)} و${formatDuration(end)}.`); } };
  const resetAb = () => { setRepeatStart(null); setRepeatEnd(null); };
  const previousVideo = async () => {
    if (isNavigatingVideoRef.current) return;
    isNavigatingVideoRef.current = true;
    try {
      if (!(await playPrevious())) safeSeekBy(-10);
    } catch {
      Alert.alert("تعذر تشغيل السابق", "تعذر تبديل الفيديو الآن. حاول بعد لحظة.");
    } finally {
      setTimeout(() => { isNavigatingVideoRef.current = false; }, 600);
    }
  };
  const nextVideo = async () => {
    if (isNavigatingVideoRef.current) return;
    isNavigatingVideoRef.current = true;
    try {
      if (!(await playNext())) safeSeekBy(10);
    } catch {
      Alert.alert("تعذر تشغيل التالي", "تعذر تبديل الفيديو الآن. حاول بعد لحظة.");
    } finally {
      setTimeout(() => { isNavigatingVideoRef.current = false; }, 600);
    }
  };
  const repeatIcon: keyof typeof MaterialIcons.glyphMap = repeatMode === "one" ? "repeat-one" : "repeat";
  const shareVideo = async () => { setIsSharing(true); try { if (!(await Sharing.isAvailableAsync())) { Alert.alert("المشاركة غير متاحة", "لا تتوفر لوحة المشاركة في بيئة المعاينة أو على هذا الجهاز."); return; } await Sharing.shareAsync(currentItem.uri, { dialogTitle: `مشاركة ${currentItem.title}`, mimeType: "video/*" }); } catch { Alert.alert("تعذرت المشاركة", "تحقق من أن الملف ما زال متاحاً ويمكن للتطبيق قراءته."); } finally { setIsSharing(false); } };
  const captureFrame = async () => {
    setIsCapturingFrame(true);
    try {
      const existing = await MediaLibrary.getPermissionsAsync();
      const permission = existing.granted ? existing : await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("إذن الصور مطلوب", "اسمح بحفظ الصور لكي يتم حفظ لقطة الفيديو في معرض جهازك.");
        return;
      }
      const frame = await VideoThumbnails.getThumbnailAsync(currentItem.uri, {
        time: Math.max(0, Math.round(player.currentTime * 1000)),
        quality: 0.92,
      });
      await MediaLibrary.createAssetAsync(frame.uri);
      Alert.alert("تم حفظ اللقطة", "حُفظت لقطة الإطار الحالي في معرض الصور.");
    } catch {
      Alert.alert("تعذر التقاط لقطة", "تأكد من أن الفيديو متاح محلياً ومن أن Android يسمح بقراءة الملف وحفظ الصور.");
    } finally {
      setIsCapturingFrame(false);
    }
  };
  const importSubtitleFile = async () => { try { const result = await DocumentPicker.getDocumentAsync({ type: "*/*", multiple: false, copyToCacheDirectory: true }); if (result.canceled) return; const asset = result.assets[0]; if (!supportsSubtitleImport(asset.name)) { Alert.alert("صيغة ترجمة غير مدعومة", "اختر ملف ترجمة نصياً من صيغ SRT أو VTT أو ASS أو SSA أو SAMI أو SUB أو MPL أو PJS أو TXT."); return; } const content = await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.UTF8 }); const cues = parseSubtitleFile(content, asset.name); const extension = asset.name.split(".").pop()?.toUpperCase() ?? "SUB"; const track: LocalSubtitleTrack = { targetLanguage: `ملف ${extension}`, detectedLanguage: "ترجمة محلية", createdAt: Date.now(), cues }; await saveLocalSubtitles(currentItem.id, track); setSubtitleTrack(track); setSubtitleEnabled(true); Alert.alert("تم استيراد الترجمة", `أُضيفت ${cues.length} أسطر من ملف ${asset.name}.`); } catch (error) { const message = error instanceof Error ? error.message : "تعذر قراءة ملف الترجمة."; Alert.alert("تعذر استيراد الترجمة", message); } };
  const generateTranslation = async () => { try { const videoBase64 = await readVideoForTranslation(currentItem.uri); const generated = await translateMutation.mutateAsync({ videoBase64, targetLanguage }); const track: LocalSubtitleTrack = { ...generated, createdAt: Date.now() }; await saveLocalSubtitles(currentItem.id, track); setSubtitleTrack(track); setSubtitleEnabled(true); setTranslationOpen(false); Alert.alert("تم إنشاء الترجمة", `حُفظت ${track.cues.length} أسطر باللغة ${targetLanguage} داخل REMO PLAYER.`); } catch (error) { const message = error instanceof Error ? error.message : "تعذّر إنشاء الترجمة حالياً."; Alert.alert("تعذرت الترجمة", message); } };
  const displayIcon = (mode: DisplayMode): keyof typeof MaterialIcons.glyphMap => mode === "hdr" ? "hdr-on" : mode === "cinematic" ? "movie-filter" : mode === "quality" ? "high-quality" : "auto-awesome";
  const topActions: { icon: keyof typeof MaterialIcons.glyphMap; label: string; active?: boolean; onPress: () => void }[] = [
    ...displayModes.map((mode) => ({ icon: displayIcon(mode.id), label: mode.label, active: displayMode === mode.id, onPress: () => chooseMode(mode.id) })),
    { icon: "translate", label: "ترجمة", active: Boolean(subtitleTrack), onPress: () => setTranslationOpen(true) },
    { icon: "subtitles", label: "استيراد", onPress: () => void importSubtitleFile() },
    { icon: "content-cut", label: "تحرير", onPress: () => router.push("/player/edit-video" as never) },
    { icon: "picture-in-picture-alt", label: "نافذة", onPress: () => void openPip() },
    { icon: "photo-camera", label: isCapturingFrame ? "يلتقط" : "لقطة", onPress: () => void captureFrame() },
    { icon: "ios-share", label: isSharing ? "جارٍ" : "مشاركة", onPress: () => void shareVideo() },
  ];

  return <ScreenContainer edges={[]}>
    <View style={[styles.root, isLandscape && styles.landscapeRoot]}>
      {!isLandscape ? <View style={styles.header}><Pressable onPress={exitVideo} style={styles.headerIcon}><MaterialIcons name="arrow-forward" size={25} color={colors.text} /></Pressable><Text numberOfLines={1} style={styles.headerTitle}>{currentItem.title}</Text><Pressable onPress={() => void shareVideo()} disabled={isSharing} style={styles.headerIcon}><MaterialIcons name="share" size={21} color={colors.text} /></Pressable></View> : null}
      <View style={[styles.mediaSurface, isLandscape && styles.landscapeSurface, displayMode === "cinematic" && !isLandscape && styles.cinematicSurface]}>
        <View style={[styles.videoContainer, { width: "100%", height: "100%", overflow: "hidden" }, frameStyle, mirrored && styles.mirrored]}><VideoView ref={viewRef} onFirstFrameRender={handleFirstFrame} style={[styles.video, { width: "100%", height: "100%" }]} player={player} nativeControls={false} allowsFullscreen allowsPictureInPicture startsPictureInPictureAutomatically={false} contentFit={effectiveFit} surfaceType="textureView" useExoShutter={false} /></View>
        <View collapsable={false} {...panResponder.panHandlers} style={styles.gestureSurface} />
        {nightMode ? <View pointerEvents="none" style={styles.nightOverlay} /> : null}
        {subtitleEnabled && activeCue ? <View pointerEvents="none" style={styles.subtitleOverlay}><Text style={styles.subtitleText}>{activeCue.text}</Text></View> : null}
        {volumeHud ? <View pointerEvents="none" style={styles.volumeHud}><MaterialIcons name="volume-up" size={23} color={colors.text} /><Text style={styles.volumeText}>{Math.round(volume * 100)}%</Text></View> : null}
        {brightnessHud ? <View pointerEvents="none" style={styles.brightnessHud}><MaterialIcons name="brightness-high" size={23} color={colors.text} /><Text style={styles.volumeText}>{Math.round(brightness * 100)}%</Text></View> : null}
        {controlsVisible && !controlsLocked ? <View style={styles.overlay} pointerEvents="box-none">
          <View style={styles.overlayTop}><Pressable onPress={exitVideo} style={styles.overlayCircle}><MaterialIcons name="arrow-forward" size={23} color={colors.text} /></Pressable><Text numberOfLines={1} style={styles.overlayTitle}>{currentItem.title}</Text><Pressable onPress={() => subtitleTrack ? setSubtitleEnabled((enabled) => !enabled) : setTranslationOpen(true)} style={styles.overlayCircle}><MaterialIcons name="closed-caption" size={22} color={subtitleEnabled && subtitleTrack ? colors.cyan : colors.text} /></Pressable></View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.topActions}>{topActions.map((action) => <Pressable key={action.label} onPress={action.onPress} style={({ pressed }) => [styles.topAction, action.active && styles.topActionActive, pressed && styles.dimmed]}><MaterialIcons name={action.icon} size={17} color={action.active ? colors.background : colors.text} /><Text style={[styles.topActionText, action.active && styles.topActionTextActive]}>{action.label}</Text></Pressable>)}</ScrollView>
          <View style={styles.centerControls}><Pressable onPress={() => safeSeekBy(-10)} style={playerOverlayStyles.tenSecondControl}><MaterialIcons name="replay-10" size={28} color={colors.text} /></Pressable><Pressable onPress={() => void previousVideo()} style={styles.transport}><MaterialIcons name="skip-previous" size={30} color={colors.text} /></Pressable><Pressable onPress={() => void togglePlay()} style={styles.playButton}><MaterialIcons name={isPlaying ? "pause" : "play-arrow"} size={40} color={colors.text} /></Pressable><Pressable onPress={() => void nextVideo()} style={styles.transport}><MaterialIcons name="skip-next" size={30} color={colors.text} /></Pressable><Pressable onPress={() => safeSeekBy(10)} style={playerOverlayStyles.tenSecondControl}><MaterialIcons name="forward-10" size={28} color={colors.text} /></Pressable></View>
          <View style={styles.overlayBottom}><View style={styles.progressWrap}><Text style={styles.time}>{formatDuration(player.currentTime)}</Text><View {...progressResponder.panHandlers} onLayout={(event) => { progressTrackWidth.current = event.nativeEvent.layout.width; }} style={playerOverlayStyles.progressTouch}><View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress}%` }]} /><View style={[playerOverlayStyles.progressThumb, { left: `${Math.max(0, Math.min(100, progress))}%` }]} /></View></View><Text style={styles.time}>{formatDuration(player.duration || currentItem.duration)}</Text></View><View style={styles.quickIcons}><Pressable onPress={() => setFitPanelOpen(true)} style={[styles.quickIcon, fitPanelOpen && styles.quickIconActive]} accessibilityLabel="احتواء وتمدد ونسب العرض"><MaterialIcons name="aspect-ratio" size={20} color={fitPanelOpen ? colors.background : colors.text} /></Pressable><Pressable onPress={cycleSpeed} style={styles.quickIcon}><Text style={styles.quickSpeed}>{speed}×</Text></Pressable><Pressable onPress={toggleBackground} style={[styles.quickIcon, backgroundEnabled && styles.quickIconActive]}><MaterialIcons name="headset" size={20} color={backgroundEnabled ? colors.background : colors.text} /></Pressable><Pressable onPress={rotateVideo} style={styles.quickIcon}><MaterialIcons name="screen-rotation" size={20} color={colors.text} /></Pressable><Pressable onPress={() => setControlsLocked((locked) => !locked)} style={[styles.quickIcon, controlsLocked && styles.quickIconActive]}><MaterialIcons name={controlsLocked ? "lock" : "lock-open"} size={20} color={controlsLocked ? colors.background : colors.text} /></Pressable><Pressable onPress={() => setNightMode((enabled) => !enabled)} style={[styles.quickIcon, nightMode && styles.quickIconActive]} accessibilityLabel="الوضع الليلي"><MaterialIcons name="dark-mode" size={20} color={nightMode ? colors.background : colors.text} /></Pressable><Pressable onPress={toggleMute} style={[styles.quickIcon, muted && styles.quickIconActive]}><MaterialIcons name={muted ? "volume-off" : "volume-up"} size={20} color={muted ? colors.background : colors.text} /></Pressable><Pressable onPress={() => setMirrored((value) => !value)} style={[styles.quickIcon, mirrored && styles.quickIconActive]}><MaterialIcons name="flip" size={20} color={mirrored ? colors.background : colors.text} /></Pressable><Pressable onPress={() => void openPip()} style={styles.quickIcon}><MaterialIcons name="picture-in-picture-alt" size={20} color={colors.text} /></Pressable><Pressable onPress={toggleRepeat} style={[styles.quickIcon, repeatMode !== "off" && styles.quickIconActive]} accessibilityLabel={repeatMode === "off" ? "تكرار متوقف" : repeatMode === "one" ? "تكرار مقطع واحد" : "تكرار الكل"}><MaterialIcons name={repeatIcon} size={20} color={repeatMode !== "off" ? colors.background : colors.text} /></Pressable><Pressable onPress={setAbPoint} style={[styles.quickIcon, repeatStart !== null && styles.quickIconActive]}><MaterialIcons name="loop" size={20} color={repeatStart !== null ? colors.background : colors.text} /></Pressable></View></View>
        </View> : null}
        {fitPanelOpen && !controlsLocked ? <View style={styles.fitPanel}><View style={styles.fitPanelHeader}><Pressable onPress={() => setFitPanelOpen(false)} style={styles.fitPanelClose}><MaterialIcons name="close" size={20} color={colors.text} /></Pressable><Text style={styles.fitPanelTitle}>الشاشة</Text></View><Text style={styles.fitPanelLabel}>طريقة العرض</Text><View style={styles.fitModeRow}>{fitModes.map((mode) => <Pressable key={mode.id} onPress={() => setVideoFit(mode.id)} style={[styles.fitModeButton, videoFit === mode.id && styles.fitModeButtonActive]}><MaterialIcons name={mode.icon} size={24} color={videoFit === mode.id ? colors.background : colors.text} /><Text style={[styles.fitModeText, videoFit === mode.id && styles.fitModeTextActive]}>{mode.label}</Text></Pressable>)}</View><Text style={styles.fitPanelLabel}>قياسي</Text><View style={styles.frameAspectRow}>{frameAspects.map((aspect) => <Pressable key={aspect.id} onPress={() => setFrameAspect(aspect.id)} style={[styles.frameAspectButton, frameAspect === aspect.id && styles.frameAspectButtonActive]}><Text style={[styles.frameAspectText, frameAspect === aspect.id && styles.frameAspectTextActive]}>{aspect.label}</Text></Pressable>)}</View></View> : null}
        {controlsLocked ? <View style={styles.lockOverlay}><Pressable onPress={() => setControlsLocked(false)} style={styles.unlockButton}><MaterialIcons name="lock" size={24} color={colors.text} /><Text style={styles.unlockText}>المس لفك القفل</Text></Pressable></View> : null}
      </View>
      {!isLandscape && repeatEnd !== null ? <Pressable onPress={resetAb} style={styles.resetAb}><MaterialIcons name="restart-alt" size={19} color={colors.cyan} /><Text style={styles.resetAbText}>إلغاء تكرار A-B</Text></Pressable> : null}
    </View>
    <TranslationSheet visible={translationOpen} item={currentItem} selectedLanguage={targetLanguage} onSelectLanguage={setTargetLanguage} generating={translateMutation.isPending} onClose={() => setTranslationOpen(false)} onGenerate={() => void generateTranslation()} />
  </ScreenContainer>;
}

function TranslationSheet({ visible, item, selectedLanguage, onSelectLanguage, generating, onClose, onGenerate }: { visible: boolean; item: MediaItem; selectedLanguage: TranslationLanguage; onSelectLanguage: (language: TranslationLanguage) => void; generating: boolean; onClose: () => void; onGenerate: () => void }) {
  return <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}><Pressable onPress={onClose} style={sheetStyles.backdrop}><Pressable onPress={() => undefined} style={sheetStyles.sheet}><View style={sheetStyles.sheetHead}><MaterialIcons name="translate" size={24} color={colors.cyan} /><View style={sheetStyles.headCopy}><Text style={sheetStyles.title}>ترجمة ذكية للفيديو</Text><Text numberOfLines={1} style={sheetStyles.subtitle}>{item.title}</Text></View></View><View style={sheetStyles.privacy}><MaterialIcons name="privacy-tip" size={20} color={colors.cyan} /><Text style={sheetStyles.privacyText}>عند التأكيد، سترفع نسخة الفيديو المحدد إلى خدمة الذكاء الاصطناعي المدمجة لتفريغ الكلام وترجمته. تُحفظ الترجمة الناتجة على جهازك.</Text></View><Text style={sheetStyles.languageLabel}>لغة الترجمة</Text><View style={sheetStyles.languages}>{translationLanguages.map((language) => <Pressable key={language} onPress={() => onSelectLanguage(language)} style={[sheetStyles.language, selectedLanguage === language && sheetStyles.languageActive]}><Text style={[sheetStyles.languageText, selectedLanguage === language && sheetStyles.languageTextActive]}>{language}</Text></Pressable>)}</View><Text style={sheetStyles.limit}>يدعم الإصدار الحالي الفيديوهات القصيرة المتاحة محلياً حتى 6MB.</Text><Pressable disabled={generating} onPress={onGenerate} style={[sheetStyles.generate, generating && styles.dimmed]}>{generating ? <ActivityIndicator color={colors.background} /> : <><MaterialIcons name="auto-awesome" size={20} color={colors.background} /><Text style={sheetStyles.generateText}>أوافق وأنشئ الترجمة</Text></>}</Pressable><Pressable disabled={generating} onPress={onClose} style={sheetStyles.cancel}><Text style={sheetStyles.cancelText}>إلغاء</Text></Pressable></Pressable></Pressable></Modal>;
}

const styles = StyleSheet.create({
  root: { flex: 1 }, landscapeRoot: { backgroundColor: "#02060B" }, header: { height: 58, paddingHorizontal: 16, flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between" }, headerIcon: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" }, headerTitle: { flex: 1, color: colors.text, fontSize: 13, fontWeight: "800", textAlign: "center", marginHorizontal: 8 }, mediaSurface: { width: "100%", aspectRatio: 16 / 9, backgroundColor: "#02060B", overflow: "hidden", alignItems: "center", justifyContent: "center" }, landscapeSurface: { flex: 1, aspectRatio: undefined }, cinematicSurface: { aspectRatio: 2.25, marginVertical: 14 }, videoContainer: { flex: 1, alignSelf: "center" }, gestureSurface: { ...StyleSheet.absoluteFillObject, zIndex: 1, elevation: 1 }, mirrored: { transform: [{ scaleX: -1 }] }, video: { flex: 1 }, nightOverlay: { position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.44)" }, subtitleOverlay: { position: "absolute", left: 22, right: 22, bottom: 20, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: "rgba(0,0,0,0.78)", alignItems: "center" }, subtitleText: { color: "#FFFFFF", fontSize: 15, lineHeight: 22, fontWeight: "800", textAlign: "center" }, volumeHud: { position: "absolute", top: "41%", alignSelf: "center", minWidth: 84, minHeight: 68, borderRadius: 18, backgroundColor: "rgba(0,0,0,0.68)", alignItems: "center", justifyContent: "center", gap: 4 }, brightnessHud: { position: "absolute", top: "41%", alignSelf: "center", minWidth: 84, minHeight: 68, borderRadius: 18, backgroundColor: "rgba(0,0,0,0.68)", alignItems: "center", justifyContent: "center", gap: 4 }, volumeText: { color: colors.text, fontSize: 14, fontWeight: "900" }, overlay: { ...StyleSheet.absoluteFillObject, zIndex: 2, elevation: 2, justifyContent: "space-between", backgroundColor: "rgba(0, 8, 15, 0.28)", paddingVertical: 10 }, fitPanel: { position: "absolute", zIndex: 4, elevation: 4, left: 12, right: 12, top: 44, padding: 14, borderRadius: 18, backgroundColor: "rgba(7,15,27,0.96)", borderWidth: 1, borderColor: "rgba(255,255,255,0.18)" }, fitPanelHeader: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between" }, fitPanelClose: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.1)" }, fitPanelTitle: { color: colors.text, fontSize: 17, fontWeight: "900", textAlign: "right" }, fitPanelLabel: { color: colors.text, fontSize: 13, fontWeight: "800", textAlign: "right", marginTop: 12, marginBottom: 7 }, fitModeRow: { flexDirection: "row-reverse", justifyContent: "space-between", gap: 7 }, fitModeButton: { flex: 1, minHeight: 64, borderRadius: 13, alignItems: "center", justifyContent: "center", gap: 5, backgroundColor: "rgba(255,255,255,0.08)" }, fitModeButtonActive: { backgroundColor: colors.cyan }, fitModeText: { color: colors.text, fontSize: 10, fontWeight: "800" }, fitModeTextActive: { color: colors.background }, frameAspectRow: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 8 }, frameAspectButton: { minWidth: 55, minHeight: 36, paddingHorizontal: 9, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.08)" }, frameAspectButtonActive: { backgroundColor: colors.cyan }, frameAspectText: { color: colors.text, fontSize: 11, fontWeight: "900" }, frameAspectTextActive: { color: colors.background }, lockOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 3, elevation: 3, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.22)" }, unlockButton: { minHeight: 58, minWidth: 132, paddingHorizontal: 16, borderRadius: 18, backgroundColor: "rgba(0,0,0,0.76)", alignItems: "center", justifyContent: "center", gap: 4 }, unlockText: { color: colors.text, fontSize: 11, fontWeight: "800" }, overlayTop: { paddingHorizontal: 14, flexDirection: "row-reverse", alignItems: "center", gap: 8 }, overlayTitle: { flex: 1, color: colors.text, fontSize: 12, fontWeight: "800", textAlign: "center" }, overlayCircle: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.36)" }, topActions: { paddingHorizontal: 14, gap: 7, alignItems: "center" }, topAction: { minHeight: 31, paddingHorizontal: 9, borderRadius: 10, flexDirection: "row-reverse", alignItems: "center", gap: 4, backgroundColor: "rgba(8,17,31,0.78)", borderWidth: 1, borderColor: "rgba(255,255,255,0.13)" }, topActionActive: { backgroundColor: colors.cyan, borderColor: colors.cyan }, topActionText: { color: colors.text, fontSize: 10, fontWeight: "800" }, topActionTextActive: { color: colors.background }, centerControls: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 28 }, transport: { width: 45, height: 45, borderRadius: 23, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.25)" }, playButton: { width: 62, height: 62, borderRadius: 31, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: colors.text, backgroundColor: "rgba(0,0,0,0.36)" }, overlayBottom: { paddingHorizontal: 15 }, progressWrap: { flexDirection: "row-reverse", alignItems: "center", gap: 8 }, time: { color: colors.text, fontSize: 10, fontVariant: ["tabular-nums"] }, progressTrack: { flex: 1, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.42)", overflow: "hidden" }, progressFill: { height: 4, borderRadius: 2, backgroundColor: colors.cyan }, quickIcons: { marginTop: 10, flexDirection: "row-reverse", justifyContent: "space-between", gap: 5 }, quickIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: "rgba(8,17,31,0.79)", borderWidth: 1, borderColor: "rgba(255,255,255,0.11)", alignItems: "center", justifyContent: "center" }, quickIconActive: { backgroundColor: colors.cyan, borderColor: colors.cyan }, quickSpeed: { color: colors.text, fontSize: 10, fontWeight: "900" }, resetAb: { alignSelf: "center", marginTop: 14, paddingHorizontal: 13, minHeight: 38, borderRadius: 13, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, flexDirection: "row-reverse", alignItems: "center", gap: 5 }, resetAbText: { color: colors.cyan, fontSize: 12, fontWeight: "800" }, dimmed: { opacity: 0.6 }, empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14 }, emptyText: { color: colors.muted, fontSize: 15 }, backButton: { height: 42, paddingHorizontal: 16, borderRadius: 13, backgroundColor: colors.cyan, justifyContent: "center" }, backText: { color: colors.background, fontWeight: "800" },
});

const playerOverlayStyles = StyleSheet.create({
  tenSecondControl: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.28)" },
  progressTouch: { flex: 1, minHeight: 30, justifyContent: "center" },
  progressThumb: { position: "absolute", top: -5, marginLeft: -7, width: 14, height: 14, borderRadius: 7, backgroundColor: colors.cyan },
});

const sheetStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "flex-end" }, sheet: { padding: 20, paddingBottom: 30, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: colors.surface, borderTopWidth: 1, borderColor: colors.border }, sheetHead: { flexDirection: "row-reverse", alignItems: "center", gap: 10 }, headCopy: { flex: 1, alignItems: "flex-end" }, title: { color: colors.text, fontSize: 18, lineHeight: 25, fontWeight: "900", textAlign: "right" }, subtitle: { color: colors.muted, fontSize: 12, lineHeight: 18, textAlign: "right" }, privacy: { flexDirection: "row-reverse", alignItems: "flex-start", gap: 8, padding: 12, borderRadius: 14, backgroundColor: "#102C3C", marginTop: 16 }, privacyText: { flex: 1, color: colors.text, fontSize: 11, lineHeight: 18, textAlign: "right" }, languageLabel: { color: colors.text, fontSize: 13, fontWeight: "800", textAlign: "right", marginTop: 17, marginBottom: 8 }, languages: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 8 }, language: { minHeight: 36, paddingHorizontal: 12, borderRadius: 11, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" }, languageActive: { backgroundColor: colors.cyan, borderColor: colors.cyan }, languageText: { color: colors.text, fontSize: 12, fontWeight: "800" }, languageTextActive: { color: colors.background }, limit: { color: colors.muted, fontSize: 11, lineHeight: 17, textAlign: "right", marginTop: 12 }, generate: { minHeight: 49, borderRadius: 15, backgroundColor: colors.cyan, marginTop: 17, flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 7 }, generateText: { color: colors.background, fontSize: 13, fontWeight: "900" }, cancel: { minHeight: 42, alignItems: "center", justifyContent: "center", marginTop: 7 }, cancelText: { color: colors.cyan, fontSize: 13, fontWeight: "900" },
});
