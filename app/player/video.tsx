import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Brightness from "expo-brightness";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import * as ScreenOrientation from "expo-screen-orientation";
import * as Sharing from "expo-sharing";
import * as VideoThumbnails from "expo-video-thumbnails";
import { StatusBar } from "expo-status-bar";
import { LibVlcPlayerView, type LibVlcPlayerViewRef, type MediaInfo as LibVlcMediaInfo, type MediaTracks as LibVlcMediaTracks } from "expo-libvlc-player";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, AppState, BackHandler, I18nManager, Modal, PanResponder, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { isPictureInPictureSupported, VideoView, useVideoPlayer, type SubtitleTrack } from "expo-video";

import { colors, formatDuration } from "@/components/remo-ui";
import { ScreenContainer } from "@/components/screen-container";
import { getPlaybackMemory, resumePosition, savePlaybackMemory } from "@/lib/playback-memory";
import { getSystemMusicVolume, setSystemMusicVolume } from "@/lib/native-audio-controls";
import { usePlayer } from "@/lib/player-context";
import { defaultSubtitleAppearance, loadLocalSubtitles, loadSubtitleAppearance, saveLocalSubtitles, saveSubtitleAppearance, type LocalSubtitleTrack } from "@/lib/subtitle-store";
import { parseSubtitleFile, supportsSubtitleImport } from "@/lib/subtitle-formats";
import { readVideoForTranslation } from "@/lib/translation-upload";
import { trpc } from "@/lib/trpc";
import { resolvePlayableVideoUri } from "@/lib/video-uri";
import { resolveLocalBrightness, resolveLocalVolume, resolveVideoGesture, shouldActivateVideoGesture } from "@/lib/video-gesture";
import { nextVideoPlaybackSpeed } from "@/lib/video-playback-settings";
import { resolveVideoProgressSeek } from "@/lib/video-progress";
import { resolveSafeVideoSeek } from "@/lib/video-seek";
import { shouldPauseVideoForBackground } from "@/lib/video-background-policy";
import { preferredVideoPlaybackEngine, shouldAdvanceAfterCompatibilityStop, shouldUseLibVlcFallback, type VideoPlaybackEngine } from "@/lib/video-engine";
import {
  checkExtractedCache,
  extractAndPrepareVideo,
  isExoPlayerSourceError,
  isLegacyExtractionFormat,
  cancelExtraction,
  type ExtractionProgress,
} from "@/lib/ffmpeg-extractor";
import { resolveFixedFrameLayout, resolveSourceAspect, resolveVideoContentFit, type FrameAspect, type VideoFitMode } from "@/lib/video-display-settings";
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
  { id: "source", label: "الأصل" },
  { id: "screen", label: "الشاشة" },
  { id: "16:9", label: "16:9", ratio: 16 / 9 },
  { id: "4:3", label: "4:3", ratio: 4 / 3 },
  { id: "1:1", label: "1:1", ratio: 1 },
  { id: "21:9", label: "21:9", ratio: 21 / 9 },
];
const subtitleTextColors = [
  { label: "أبيض", value: "#FFFFFF" },
  { label: "أصفر", value: "#FFE66D" },
  { label: "سماوي", value: "#75E6DA" },
  { label: "وردي", value: "#FF9FB2" },
];
const subtitleBackgroundColors = [
  { label: "أسود", value: "rgba(0,0,0,0.78)" },
  { label: "شفاف", value: "rgba(0,0,0,0.34)" },
  { label: "أزرق", value: "rgba(4,28,52,0.88)" },
  { label: "رمادي", value: "rgba(48,48,48,0.88)" },
];

export default function VideoPlayerScreen() {
  const router = useRouter();
  const { folderPath } = useLocalSearchParams<{ folderPath?: string }>();
  const { currentItem, playNext, playPrevious, repeatMode, stop, toggleRepeat } = usePlayer();
  const viewRef = useRef<any>(null);
  const vlcViewRef = useRef<LibVlcPlayerViewRef | null>(null);
  const touchStartX = useRef(0);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const temporarySpeedActiveRef = useRef(false);
  const originalPlaybackRateRef = useRef(1);
  const progressTrackWidth = useRef(0);
  const isAutoAdvancingRef = useRef(false);
  const isNavigatingVideoRef = useRef(false);
  const brightnessStartRef = useRef(1);
  const localBrightnessRef = useRef(1);
  const volumeStartRef = useRef(1);
  const volumeRef = useRef(1);
  const lastBrightnessUpdateRef = useRef(0);
  const lastVolumeUpdateRef = useRef(0);
  const pipActiveOrRequestedRef = useRef(false);
  const compatibilityErrorRef = useRef(false);
  const compatibilityStartedRef = useRef(false);
  const vlcResumeSeekRef = useRef(0);
  const lastSavedSecondRef = useRef(0);
  const [displayMode, setDisplayMode] = useState<DisplayMode>("auto");
  const [isSharing, setIsSharing] = useState(false);
  const [isCapturingFrame, setIsCapturingFrame] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(1);
  const [volumeHud, setVolumeHud] = useState(false);
  const [localBrightness, setLocalBrightness] = useState(1);
  const [brightnessHud, setBrightnessHud] = useState(false);
  const [speedHud, setSpeedHud] = useState(false);
  const [temporarySpeedActive, setTemporarySpeedActive] = useState(false);
  const [muted, setMuted] = useState(false);
  const [mirrored, setMirrored] = useState(false);
  const [nightMode, setNightMode] = useState(false);
  const [videoFit, setVideoFit] = useState<VideoFitMode>("auto");
  const [selectedFrameAspect, setSelectedFrameAspect] = useState<FrameAspect | null>(null);
  const [sourceAspect, setSourceAspect] = useState<number | null>(null);
  const [surfaceSize, setSurfaceSize] = useState({ width: 0, height: 0 });
  const [fitPanelOpen, setFitPanelOpen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(false);
  const [controlsActivity, setControlsActivity] = useState(0);
  const [controlsLocked, setControlsLocked] = useState(false);
  const [autoRotateEnabled, setAutoRotateEnabled] = useState(true);
  const [repeatStart, setRepeatStart] = useState<number | null>(null);
  const [repeatEnd, setRepeatEnd] = useState<number | null>(null);
  const [subtitleTrack, setSubtitleTrack] = useState<LocalSubtitleTrack | null>(null);
  const [subtitleEnabled, setSubtitleEnabled] = useState(true);
  const [subtitleAppearance, setSubtitleAppearance] = useState(defaultSubtitleAppearance);
  const subtitleAppearanceReadyRef = useRef(false);
  const [embeddedSubtitleTracks, setEmbeddedSubtitleTracks] = useState<SubtitleTrack[]>([]);
  const [embeddedSubtitleId, setEmbeddedSubtitleId] = useState<string | null>(null);
  const [vlcSubtitleTracks, setVlcSubtitleTracks] = useState<LibVlcMediaTracks["subtitle"]>([]);
  const [vlcSubtitleId, setVlcSubtitleId] = useState<number | undefined>(undefined);
  const [playbackEngine, setPlaybackEngine] = useState<VideoPlaybackEngine>("media3");
  const [vlcTime, setVlcTime] = useState(0);
  const [vlcDuration, setVlcDuration] = useState(0);
  const [compatibilityAttempt, setCompatibilityAttempt] = useState(0);
  const [subtitlePanelOpen, setSubtitlePanelOpen] = useState(false);
  const [translationOpen, setTranslationOpen] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState<TranslationLanguage>("العربية");
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubbingTime, setScrubbingTime] = useState(0);
  const [resolvedVideoUri, setResolvedVideoUri] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState<ExtractionProgress>({
    percent: 0,
    stage: "",
  });
  const extractionCanceledRef = useRef(false);
  const isSwitchingEngineRef = useRef(false);
  const playbackErrorRef = useRef<string | null>(null);
  useEffect(() => {
    playbackErrorRef.current = playbackError;
  }, [playbackError]);

  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const defaultFrameAspect: FrameAspect = "16:9";
  const frameAspect = selectedFrameAspect ?? defaultFrameAspect;
  const effectiveFit = resolveVideoContentFit(videoFit, isLandscape, displayMode === "cinematic");
  const mediaSurfaceWidth = surfaceSize.width || width;
  const mediaSurfaceHeight = surfaceSize.height || (isLandscape ? height : width / (16 / 9));
  const frameStyle = resolveFixedFrameLayout(frameAspect, mediaSurfaceWidth, mediaSurfaceHeight, sourceAspect ?? 16 / 9) ?? undefined;
  const pipSupported = Platform.OS !== "web" && isPictureInPictureSupported();
  const translateMutation = trpc.media.translateVideo.useMutation();
  const currentVideoUri = currentItem?.mediaType === "video" ? currentItem.uri : null;
  const usingCompatibilityEngine = playbackEngine === "libvlc";
  const player = useVideoPlayer(null, (videoPlayer) => {
    videoPlayer.staysActiveInBackground = false;
    videoPlayer.showNowPlayingNotification = false;
    videoPlayer.audioMixingMode = "duckOthers";
    videoPlayer.preservesPitch = true;
    videoPlayer.timeUpdateEventInterval = 0.25;
  });

  useEffect(() => {
    if (Platform.OS === "web") return;
    setSelectedFrameAspect("16:9");
    setAutoRotateEnabled(true);
    void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE).catch(() => undefined);
    return () => {
      void ScreenOrientation.unlockAsync().catch(() => undefined);
    };
  }, []);

  useEffect(() => {
    if (Platform.OS === "web") return;
    void Brightness.getBrightnessAsync().then((value) => {
      if (!Number.isFinite(value)) return;
      const safeValue = Math.max(0.2, Math.min(1, value));
      brightnessStartRef.current = safeValue;
      localBrightnessRef.current = safeValue;
      setLocalBrightness(safeValue);
    }).catch(() => undefined);
    void getSystemMusicVolume().then((value) => {
      if (value === null) return;
      volumeStartRef.current = value;
      volumeRef.current = value;
      setVolume(value);
    });
  }, []);

  useEffect(() => {
    if (!usingCompatibilityEngine) {
      setIsPlaying(player.playing);
    }
    const subscription = player.addListener("playingChange", ({ isPlaying: playing }) => {
      if (!usingCompatibilityEngine) {
        setIsPlaying(playing);
      }
    });
    return () => subscription.remove();
  }, [player, usingCompatibilityEngine]);

  useEffect(() => {
    const updateSourceAspect = (track = player.videoTrack) => {
      setSourceAspect(resolveSourceAspect(track?.size?.width ?? 0, track?.size?.height ?? 0));
    };
    updateSourceAspect(player.videoTrack ?? player.availableVideoTracks.find((track) => track.isSupported));
    const subscription = player.addListener("videoTrackChange", ({ videoTrack }) => updateSourceAspect(videoTrack));
    return () => subscription.remove();
  }, [player]);

  useEffect(() => {
    const syncEmbeddedSubtitles = (tracks = player.availableSubtitleTracks, selected = player.subtitleTrack) => {
      setEmbeddedSubtitleTracks(tracks);
      setEmbeddedSubtitleId(selected?.id ?? null);
    };
    syncEmbeddedSubtitles();
    const tracksSubscription = player.addListener("availableSubtitleTracksChange", ({ availableSubtitleTracks }) => syncEmbeddedSubtitles(availableSubtitleTracks));
    const selectedSubscription = player.addListener("subtitleTrackChange", ({ subtitleTrack: selected }) => syncEmbeddedSubtitles(player.availableSubtitleTracks, selected));
    return () => {
      tracksSubscription.remove();
      selectedSubscription.remove();
    };
  }, [player]);

    const switchToLibVlc = useCallback(() => {
    if (usingCompatibilityEngine) return;
    isSwitchingEngineRef.current = true;
    try {
      player.pause();
      player.replace(null as any);
    } catch {
      // ignore
    }
    setPlaybackEngine("libvlc");
    setPlaybackError(null);
    setTimeout(() => {
      isSwitchingEngineRef.current = false;
    }, 1200);
  }, [player, usingCompatibilityEngine]);

  const cancelActiveExtraction = useCallback(() => {
    extractionCanceledRef.current = true;
    setIsExtracting(false);
    if (currentVideoUri) {
      cancelExtraction(currentVideoUri);
    }
  }, [currentVideoUri]);

  const triggerFfmpegExtraction = useCallback(
    async (targetUri: string, filename?: string) => {
      if (isExtracting || usingCompatibilityEngine) return;
      setIsExtracting(true);
      extractionCanceledRef.current = false;
      setPlaybackError(null);
      try {
        player.pause();
      } catch {
        // ignore
      }

      const result = await extractAndPrepareVideo(targetUri, {
        fileName: filename,
        forceTranscode: true,
        signal: {
          get aborted() {
            return extractionCanceledRef.current;
          },
          set aborted(val: boolean) {
            extractionCanceledRef.current = val;
          },
        },
        onProgress: (p) => {
          setExtractionProgress(p);
        },
      });

      setIsExtracting(false);
      if (extractionCanceledRef.current) return;

      if (result.success && result.outputUri) {
        setResolvedVideoUri(result.outputUri);
        setPlaybackError(null);
        try {
          if (typeof player.replaceAsync === "function") {
            await player.replaceAsync({ uri: result.outputUri });
          } else {
            player.replace({ uri: result.outputUri });
          }
          player.play();
          setIsPlaying(true);
        } catch {
          switchToLibVlc();
        }
      } else {
        switchToLibVlc();
      }
    },
    [isExtracting, usingCompatibilityEngine, player, switchToLibVlc]
  );

  useEffect(() => {
    const subscription = player.addListener("statusChange", ({ status, error }) => {
      if (status === "error") {
        const errorMessage = typeof error === "string" ? error : error?.message;
        if (!usingCompatibilityEngine) {
          if (
            isExoPlayerSourceError(errorMessage) ||
            isLegacyExtractionFormat(currentVideoUri || currentItem?.title)
          ) {
            void triggerFfmpegExtraction(resolvedVideoUri || currentVideoUri!, currentItem?.title);
            return;
          }
          if (shouldUseLibVlcFallback(errorMessage)) {
            switchToLibVlc();
            return;
          }
        }
        if (errorMessage) setPlaybackError(errorMessage);
      }
      if (status === "readyToPlay") setPlaybackError(null);
    });
    return () => subscription.remove();
  }, [player, usingCompatibilityEngine, switchToLibVlc, currentVideoUri, currentItem?.title, resolvedVideoUri, triggerFfmpegExtraction]);

  useEffect(() => {
    player.staysActiveInBackground = false;
    player.showNowPlayingNotification = false;
  }, [player]);

  useEffect(() => {
    if (!currentVideoUri) return;
    let disposed = false;
    const loadForegroundVideo = async () => {
      const preferredEngine = preferredVideoPlaybackEngine(currentVideoUri, currentItem?.title);
      compatibilityErrorRef.current = false;
      compatibilityStartedRef.current = false;
      setPlaybackEngine(preferredEngine);
      setVlcTime(0);
      setVlcDuration(0);
      setVlcSubtitleTracks([]);
      setVlcSubtitleId(undefined);
      const memory = currentItem?.id ? await getPlaybackMemory(currentItem.id) : null;
      const resumeAt = resumePosition(memory, currentItem?.duration);
      vlcResumeSeekRef.current = resumeAt;
      lastSavedSecondRef.current = resumeAt;

      let playableUri = currentVideoUri;
      try {
        const cachedExtracted = await checkExtractedCache(currentVideoUri);
        if (cachedExtracted) {
          playableUri = cachedExtracted;
        } else {
          playableUri = await resolvePlayableVideoUri(currentVideoUri, currentItem?.title || currentVideoUri);
        }
      } catch {
        playableUri = currentVideoUri;
      }
      if (disposed) return;
      setResolvedVideoUri(playableUri);

      if (preferredEngine === "libvlc") {
        try {
          player.pause();
          player.replace(null as any);
        } catch {
          // ignore
        }
        return;
      }
      try {
        setPlaybackError(null);
        player.pause();
        player.staysActiveInBackground = false;
        player.showNowPlayingNotification = false;
        if (typeof player.replaceAsync === 'function') {
          await player.replaceAsync({ uri: playableUri });
        } else {
          player.replace({ uri: playableUri });
        }
        if (disposed) return;
        if (resumeAt > 0) {
          player.currentTime = resumeAt;
        }
        player.play();
        setIsPlaying(true);
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        if (!disposed) {
          if (!usingCompatibilityEngine) {
            if (
              isExoPlayerSourceError(message) ||
              isLegacyExtractionFormat(currentVideoUri || currentItem?.title)
            ) {
              void triggerFfmpegExtraction(playableUri, currentItem?.title);
              return;
            }
            if (shouldUseLibVlcFallback(message)) {
              switchToLibVlc();
              return;
            }
          }
          setPlaybackError("تعذر فتح هذا الفيديو. قد يكون الترميز غير مدعوم من جهاز Android أو أن الملف لم يعد متاحاً.");
        }
      }
    };
    void loadForegroundVideo();
    return () => {
      disposed = true;
      cancelActiveExtraction();
      try {
        player.pause();
        player.staysActiveInBackground = false;
        player.showNowPlayingNotification = false;
        player.replace(null as any);
      } catch {
        // ignore
      }
    };
  }, [currentVideoUri, currentItem?.id, currentItem?.duration, currentItem?.title, player, switchToLibVlc, usingCompatibilityEngine, cancelActiveExtraction, triggerFfmpegExtraction]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      player.staysActiveInBackground = false;
      player.showNowPlayingNotification = false;
      if (shouldPauseVideoForBackground(nextAppState, pipActiveOrRequestedRef.current)) {
        try {
          if (usingCompatibilityEngine) void vlcViewRef.current?.pause();
          player.pause();
          setIsPlaying(false);
        } catch {
          // ignore
        }
      }
    });
    return () => subscription.remove();
  }, [player, usingCompatibilityEngine]);

  useEffect(() => { player.loop = repeatMode === "one"; }, [player, repeatMode]);
  useEffect(() => {
    const subscription = player.addListener("playToEnd", () => {
      if (
        repeatMode === "one" ||
        isAutoAdvancingRef.current ||
        isSwitchingEngineRef.current ||
        usingCompatibilityEngine ||
        playbackErrorRef.current
      ) {
        return;
      }
      const dur = player.duration;
      const cur = player.currentTime;
      if (dur > 1 && cur >= Math.max(0, dur - 1.5)) {
        isAutoAdvancingRef.current = true;
        void playNext(repeatMode === "all").then((advanced) => {
          if (!advanced) setIsPlaying(false);
        }).finally(() => { isAutoAdvancingRef.current = false; });
      }
    });
    return () => subscription.remove();
  }, [player, playNext, repeatMode, usingCompatibilityEngine]);
  const playbackTime = usingCompatibilityEngine ? vlcTime : player.currentTime;
  const playbackDuration = usingCompatibilityEngine ? vlcDuration : player.duration;
  useEffect(() => {
    if (repeatStart === null || repeatEnd === null) return;
    if (playbackTime >= repeatEnd) {
      if (usingCompatibilityEngine) {
        void vlcViewRef.current?.seek(repeatStart * 1000, "time");
        setVlcTime(repeatStart);
      } else {
        player.currentTime = repeatStart;
      }
    }
  }, [playbackTime, player, repeatStart, repeatEnd, usingCompatibilityEngine]);

  useEffect(() => {
    if (!currentItem?.id || playbackTime < 4) return;
    const rounded = Math.floor(playbackTime);
    if (rounded - lastSavedSecondRef.current >= 4) {
      lastSavedSecondRef.current = rounded;
      void savePlaybackMemory({
        itemId: currentItem.id,
        position: playbackTime,
        updatedAt: Date.now(),
      });
    }
  }, [currentItem?.id, playbackTime]);
  const currentVideoId = currentItem?.mediaType === "video" ? currentItem.id : null;
  useEffect(() => {
    if (!currentVideoId) return;
    void loadLocalSubtitles(currentVideoId).then((saved) => {
      setSubtitleTrack(saved);
      setSubtitleEnabled(Boolean(saved));
    });
  }, [currentVideoId]);
  useEffect(() => {
    void loadSubtitleAppearance().then((appearance) => {
      setSubtitleAppearance(appearance);
      subtitleAppearanceReadyRef.current = true;
    }).catch(() => {
      subtitleAppearanceReadyRef.current = true;
    });
  }, []);
  useEffect(() => {
    if (!subtitleAppearanceReadyRef.current) return;
    void saveSubtitleAppearance(subtitleAppearance).catch(() => undefined);
  }, [subtitleAppearance]);
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

  useEffect(() => {
    if (!speedHud) return;
    const timeout = setTimeout(() => setSpeedHud(false), 1100);
    return () => clearTimeout(timeout);
  }, [speedHud]);

  useEffect(() => {
    if (!controlsVisible || controlsLocked || fitPanelOpen) return;
    const timeout = setTimeout(() => setControlsVisible(false), 3200);
    return () => clearTimeout(timeout);
  }, [controlsActivity, controlsLocked, controlsVisible, fitPanelOpen]);

  const safeSeekBy = useCallback((seconds: number) => {
    const target = resolveSafeVideoSeek(playbackTime, playbackDuration, seconds);
    if (target === null) return false;
    try {
      if (usingCompatibilityEngine) {
        void vlcViewRef.current?.seek(target * 1000, "time");
        setVlcTime(target);
        return true;
      }
      player.currentTime = target;
      return true;
    } catch {
      return false;
    }
  }, [playbackDuration, playbackTime, player, usingCompatibilityEngine]);
  const revealControls = useCallback(() => {
    setControlsVisible(true);
    setControlsActivity((activity) => activity + 1);
  }, []);
  const restoreTemporarySpeed = useCallback(() => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = null;
    if (usingCompatibilityEngine) return false;
    if (!temporarySpeedActiveRef.current) return false;
    player.playbackRate = originalPlaybackRateRef.current;
    temporarySpeedActiveRef.current = false;
    setTemporarySpeedActive(false);
    return true;
  }, [player, usingCompatibilityEngine]);
  const scheduleTemporarySpeed = useCallback(() => {
    if (controlsLocked || usingCompatibilityEngine) return;
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = setTimeout(() => {
      originalPlaybackRateRef.current = player.playbackRate || speed;
      player.playbackRate = 2;
      temporarySpeedActiveRef.current = true;
      setTemporarySpeedActive(true);
      longPressTimerRef.current = null;
    }, 360);
  }, [controlsLocked, player, speed, usingCompatibilityEngine]);
  useEffect(() => () => { restoreTemporarySpeed(); }, [restoreTemporarySpeed]);
  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => !controlsLocked,
    onMoveShouldSetPanResponder: (_, gesture) => shouldActivateVideoGesture(gesture.dx, gesture.dy, controlsLocked),
    onMoveShouldSetPanResponderCapture: (_, gesture) => shouldActivateVideoGesture(gesture.dx, gesture.dy, controlsLocked),
    onPanResponderTerminationRequest: () => false,
    onPanResponderGrant: (event) => {
      touchStartX.current = event.nativeEvent.locationX;
      brightnessStartRef.current = localBrightnessRef.current;
      volumeStartRef.current = volumeRef.current;
      void getSystemMusicVolume().then((systemVolume) => {
        if (systemVolume === null) return;
        volumeStartRef.current = systemVolume;
        volumeRef.current = systemVolume;
        setVolume(systemVolume);
      });
      scheduleTemporarySpeed();
    },
    onPanResponderMove: (_, gesture) => {
      if (Math.abs(gesture.dx) > 8 || Math.abs(gesture.dy) > 8) restoreTemporarySpeed();
      const action = resolveVideoGesture(gesture.dx, gesture.dy, touchStartX.current, width);
      if (action?.type === "brightness") {
        const nextBrightness = resolveLocalBrightness(brightnessStartRef.current, gesture.dy, mediaSurfaceHeight);
        if (nextBrightness !== null) {
          localBrightnessRef.current = nextBrightness;
          setLocalBrightness(nextBrightness);
          setBrightnessHud(true);
          const now = Date.now();
          if (now - lastBrightnessUpdateRef.current >= 70) {
            lastBrightnessUpdateRef.current = now;
            void Brightness.setBrightnessAsync(nextBrightness).catch(() => undefined);
          }
        }
      }
      if (action?.type === "volume") {
        const nextVolume = resolveLocalVolume(volumeStartRef.current, gesture.dy, mediaSurfaceHeight);
        if (nextVolume !== null) {
          volumeRef.current = nextVolume;
          setVolume(nextVolume);
          setVolumeHud(true);
          const now = Date.now();
          if (now - lastVolumeUpdateRef.current >= 70) {
            lastVolumeUpdateRef.current = now;
            void setSystemMusicVolume(nextVolume).then((systemVolume) => {
              if (systemVolume === null) {
                player.volume = nextVolume;
                return;
              }
              player.volume = 1;
              volumeRef.current = systemVolume;
              setVolume(systemVolume);
            });
          }
        }
      }
    },
    onPanResponderRelease: (_, gesture) => {
      if (controlsLocked) return;
      const action = resolveVideoGesture(gesture.dx, gesture.dy, touchStartX.current, width);
      const wasTemporarySpeed = restoreTemporarySpeed();
      if (action?.type === "seek") safeSeekBy(action.seconds);
      if (action?.type === "volume") setVolumeHud(true);
      if (action?.type === "brightness") setBrightnessHud(true);
      if (!action && !wasTemporarySpeed) revealControls();
    },
    onPanResponderTerminate: restoreTemporarySpeed,
  }), [controlsLocked, mediaSurfaceHeight, player, revealControls, restoreTemporarySpeed, safeSeekBy, scheduleTemporarySpeed, width]);
  const seekFromProgress = useCallback((locationX: number, isFinal = false) => {
    const target = resolveVideoProgressSeek(locationX, progressTrackWidth.current, playbackDuration);
    if (target === null) return;
    setScrubbingTime(target);
    setIsScrubbing(true);
    if (isFinal) {
      setIsScrubbing(false);
      if (usingCompatibilityEngine) {
        void vlcViewRef.current?.seek(target * 1000, "time");
        setVlcTime(target);
        return;
      }
      player.currentTime = target;
    }
  }, [playbackDuration, player, usingCompatibilityEngine]);

  const progressResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (event) => seekFromProgress(event.nativeEvent.locationX, false),
    onPanResponderMove: (event) => seekFromProgress(event.nativeEvent.locationX, false),
    onPanResponderRelease: (event) => seekFromProgress(event.nativeEvent.locationX, true),
    onPanResponderTerminate: (event) => seekFromProgress(event.nativeEvent.locationX, true),
  }), [seekFromProgress]);

  const videoLibraryRoute = folderPath ? `/(tabs)/video?folderPath=${encodeURIComponent(folderPath)}` : "/(tabs)/video";
  if (!currentItem || currentItem.mediaType !== "video") {
    return <ScreenContainer><View style={styles.empty}><Text style={styles.emptyText}>اختر فيديو من مكتبتك أولاً.</Text><Pressable onPress={() => router.canGoBack() ? router.back() : router.replace(videoLibraryRoute as never)} style={styles.backButton}><Text style={styles.backText}>العودة للفيديوهات</Text></Pressable></View></ScreenContainer>;
  }

  const activeCue = subtitleTrack?.cues.find((cue) => playbackTime >= cue.start && playbackTime <= cue.end);
  const effectivePlaybackTime = isScrubbing ? scrubbingTime : playbackTime;
  const progress = playbackDuration > 0 ? Math.min(100, (effectivePlaybackTime / playbackDuration) * 100) : 0;
  const exitVideo = async () => {
    if (isNavigatingVideoRef.current) return;
    isNavigatingVideoRef.current = true;
    restoreTemporarySpeed();
    setControlsVisible(false);
    setVolumeHud(false);
    setBrightnessHud(false);
    if (currentItem?.id && playbackTime >= 4) {
      void savePlaybackMemory({
        itemId: currentItem.id,
        position: playbackTime,
        updatedAt: Date.now(),
      });
    }
    try {
      if (usingCompatibilityEngine) await vlcViewRef.current?.stop();
      stop();
    } catch { /* ignore */ }
    if (Platform.OS !== "web") {
      void ScreenOrientation.unlockAsync().catch(() => undefined);
    }
    if (router.canGoBack()) router.back(); else router.replace(videoLibraryRoute as never);
  };
  
  useEffect(() => {
    const onHardwareBack = () => {
      if (controlsLocked) {
        setControlsLocked(false);
        return true;
      }
      if (subtitlePanelOpen) {
        setSubtitlePanelOpen(false);
        return true;
      }
      if (fitPanelOpen) {
        setFitPanelOpen(false);
        return true;
      }
      if (translationOpen) {
        setTranslationOpen(false);
        return true;
      }
      void exitVideo();
      return true;
    };
    const subscription = BackHandler.addEventListener("hardwareBackPress", onHardwareBack);
    return () => subscription.remove();
  }, [controlsLocked, subtitlePanelOpen, fitPanelOpen, translationOpen, exitVideo]);

  const rotateVideo = () => {
    setAutoRotateEnabled(false);
    const target = isLandscape ? ScreenOrientation.OrientationLock.PORTRAIT_UP : ScreenOrientation.OrientationLock.LANDSCAPE;
    void ScreenOrientation.lockAsync(target).catch(() => undefined);
  };
  const handleFirstFrame = () => {
    if (Platform.OS === "web") return;
    if (!selectedFrameAspect) setSelectedFrameAspect("16:9");
    if (!autoRotateEnabled || isLandscape) return;
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
    if (usingCompatibilityEngine) {
      try {
        if (isPlaying) {
          await vlcViewRef.current?.pause();
          setIsPlaying(false);
        } else {
          await vlcViewRef.current?.play();
          setIsPlaying(true);
        }
      } catch {
        setPlaybackError("تعذر تنفيذ أمر التشغيل في محرك التوافق. أعد المحاولة أو افتح ملفاً آخر.");
      }
      return;
    }
    if (player.playing) { player.pause(); setIsPlaying(false); return; }
    player.staysActiveInBackground = false;
    player.showNowPlayingNotification = false;
    player.play();
    setIsPlaying(true);
  };
  const cycleSpeed = () => {
    const next = nextVideoPlaybackSpeed(speed);
    try {
      if (usingCompatibilityEngine) {
        setSpeed(next);
        setSpeedHud(true);
        return;
      }
      player.preservesPitch = true;
      player.playbackRate = next;
      setSpeed(next);
      setSpeedHud(true);
    } catch {
      Alert.alert("تعذر تغيير السرعة", "لا يدعم هذا الفيديو تغيير السرعة حالياً.");
    }
  };
  const toggleMute = () => { const next = !muted; if (!usingCompatibilityEngine) player.muted = next; setMuted(next); };
  const openPip = async () => { if (!pipSupported) { Alert.alert("النافذة العائمة", "وضع النافذة العائمة غير مدعوم على هذا الجهاز أو يحتاج تفعيله من إعدادات النظام."); return; } pipActiveOrRequestedRef.current = true; try { if (usingCompatibilityEngine) await vlcViewRef.current?.startPictureInPicture(); else await viewRef.current?.startPictureInPicture(); } catch { pipActiveOrRequestedRef.current = false; Alert.alert("النافذة العائمة", "تعذر بدء النافذة العائمة الآن. تحقق من السماح بها لتطبيق REMO PLAYER في إعدادات Android."); } };
  const setAbPoint = () => { if (repeatStart === null || repeatEnd !== null) { setRepeatStart(playbackTime); setRepeatEnd(null); Alert.alert("تكرار A–B", "تم تحديد النقطة A. انتقل إلى نهاية المقطع واضغط الزر مرة أخرى لتحديد B."); } else { const end = Math.max(playbackTime, repeatStart + 1); setRepeatEnd(end); Alert.alert("تكرار A–B", `سيُكرر المشغل المقطع بين ${formatDuration(repeatStart)} و${formatDuration(end)}.`); } };
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
        time: Math.max(0, Math.round(playbackTime * 1000)),
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
  const selectEmbeddedSubtitle = (track: SubtitleTrack | null) => {
    try {
      player.subtitleTrack = track;
      setEmbeddedSubtitleId(track?.id ?? null);
      setSubtitleEnabled(Boolean(track) || Boolean(subtitleTrack));
    } catch {
      Alert.alert("تعذر اختيار الترجمة", "لا يدعم Android مسار الترجمة المحدد لهذا الفيديو.");
    }
  };
  const selectCompatibilitySubtitle = (trackId: number | undefined) => {
    setVlcSubtitleId(trackId);
    setSubtitleEnabled(trackId !== -1 || Boolean(subtitleTrack));
  };
  const handleCompatibilityFirstPlay = (info: LibVlcMediaInfo) => {
    compatibilityErrorRef.current = false;
    compatibilityStartedRef.current = true;
    setVlcDuration(Math.max(0, info.length / 1000));
    setSourceAspect(resolveSourceAspect((info as any)?.width, (info as any)?.height));
    setPlaybackError(null);
    setIsPlaying(true);
    if (vlcResumeSeekRef.current > 0) {
      const target = vlcResumeSeekRef.current;
      vlcResumeSeekRef.current = 0;
      void vlcViewRef.current?.seek(target * 1000, "time");
      setVlcTime(target);
    }
  };
  const handleCompatibilityStopped = () => {
    setIsPlaying(false);
    if (!shouldAdvanceAfterCompatibilityStop({
      hasStarted: compatibilityStartedRef.current,
      hasError: compatibilityErrorRef.current,
      isNavigating: isNavigatingVideoRef.current,
      isRepeatingOne: repeatMode === "one",
      isAutoAdvancing: isAutoAdvancingRef.current,
    })) return;
    if (vlcDuration > 1 && vlcTime < Math.max(0, vlcDuration - 2)) {
      return;
    }
    isAutoAdvancingRef.current = true;
    void playNext(repeatMode === "all").then((advanced) => {
      if (!advanced) setIsPlaying(false);
    }).finally(() => { isAutoAdvancingRef.current = false; });
  };
  const handleCompatibilityError = (message: string) => {
    compatibilityErrorRef.current = true;
    compatibilityStartedRef.current = false;
    setIsPlaying(false);
    setPlaybackError(`تعذر على محرك التوافق فتح هذا الفيديو: ${message}. قد يكون امتداداً خاصاً بجهاز التسجيل أو ملفاً تالفاً.`);
  };
  const retryCurrentVideo = async () => {
    if (!currentVideoUri) return;
    setPlaybackError(null);
    const playableUri = resolvedVideoUri || currentVideoUri;
    if (usingCompatibilityEngine) {
      compatibilityErrorRef.current = false;
      compatibilityStartedRef.current = false;
      setCompatibilityAttempt((attempt) => attempt + 1);
      return;
    }
    try {
      if (typeof player.replaceAsync === "function") {
        await player.replaceAsync({ uri: playableUri });
      } else {
        player.replace({ uri: playableUri });
      }
      player.play();
      setIsPlaying(true);
    } catch {
      switchToLibVlc();
    }
  };
  const importSubtitleFile = async () => { try { const result = await DocumentPicker.getDocumentAsync({ type: "*/*", multiple: false, copyToCacheDirectory: true }); if (result.canceled) return; const asset = result.assets[0]; if (!supportsSubtitleImport(asset.name)) { Alert.alert("صيغة ترجمة غير مدعومة", "اختر ملف ترجمة نصياً من صيغ SRT أو VTT أو ASS أو SSA أو SAMI أو SUB أو MPL أو PJS أو TXT."); return; } const content = await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.UTF8 }); const cues = parseSubtitleFile(content, asset.name); const extension = asset.name.split(".").pop()?.toUpperCase() ?? "SUB"; const track: LocalSubtitleTrack = { targetLanguage: `ملف ${extension}`, detectedLanguage: "ترجمة محلية", createdAt: Date.now(), cues }; await saveLocalSubtitles(currentItem.id, track); setSubtitleTrack(track); setSubtitleEnabled(true); Alert.alert("تم استيراد الترجمة", `أُضيفت ${cues.length} أسطر من ملف ${asset.name}.`); } catch (error) { const message = error instanceof Error ? error.message : "تعذر قراءة ملف الترجمة."; Alert.alert("تعذر استيراد الترجمة", message); } };
  const generateTranslation = async () => { try { const videoBase64 = await readVideoForTranslation(currentItem.uri); const generated = await translateMutation.mutateAsync({ videoBase64, targetLanguage }); const track: LocalSubtitleTrack = { ...generated, createdAt: Date.now() }; await saveLocalSubtitles(currentItem.id, track); setSubtitleTrack(track); setSubtitleEnabled(true); setTranslationOpen(false); Alert.alert("تم إنشاء الترجمة", `حُفظت ${track.cues.length} أسطر باللغة ${targetLanguage} داخل REMO PLAYER.`); } catch (error) { const message = error instanceof Error ? error.message : "تعذّر إنشاء الترجمة حالياً."; Alert.alert("تعذرت الترجمة", message); } };
  const displayIcon = (mode: DisplayMode): keyof typeof MaterialIcons.glyphMap => mode === "hdr" ? "hdr-on" : mode === "cinematic" ? "movie-filter" : mode === "quality" ? "high-quality" : "auto-awesome";
  const topActions: { icon: keyof typeof MaterialIcons.glyphMap; label: string; active?: boolean; onPress: () => void }[] = [
    ...displayModes.map((mode) => ({ icon: displayIcon(mode.id), label: mode.label, active: displayMode === mode.id, onPress: () => chooseMode(mode.id) })),
    { icon: "translate", label: "ترجمة", active: Boolean(subtitleTrack), onPress: () => setTranslationOpen(true) },
    { icon: "subtitles", label: "مسارات", active: usingCompatibilityEngine ? vlcSubtitleId !== undefined && vlcSubtitleId !== -1 : Boolean(embeddedSubtitleId), onPress: () => setSubtitlePanelOpen(true) },
    { icon: "subtitles", label: "استيراد", onPress: () => void importSubtitleFile() },
    { icon: "edit", label: "تحرير", onPress: () => router.push("/player/edit-video" as never) },
    { icon: "picture-in-picture-alt", label: "نافذة", onPress: () => void openPip() },
    { icon: "photo-camera", label: isCapturingFrame ? "يلتقط" : "لقطة", onPress: () => void captureFrame() },
    { icon: "share", label: isSharing ? "جارٍ" : "مشاركة", onPress: () => void shareVideo() },
  ];

  return <ScreenContainer edges={[]}>
    <StatusBar hidden animated />
    <View style={[styles.root, isLandscape && styles.landscapeRoot]}>
        <View onLayout={(event) => { const { width: nextWidth, height: nextHeight } = event.nativeEvent.layout; if (nextWidth > 0 && nextHeight > 0) setSurfaceSize({ width: nextWidth, height: nextHeight }); }} style={[styles.mediaSurface, isLandscape && styles.landscapeSurface]}>
        <View style={[styles.videoContainer, { overflow: "hidden" }, frameStyle, mirrored && styles.mirrored]}>
          {usingCompatibilityEngine ? (
            <LibVlcPlayerView
              // تعديل 2: إضافة playbackEngine إلى key لضمان إعادة التحميل عند التبديل
              key={`${currentItem.uri}-${compatibilityAttempt}-${playbackEngine}`}
              ref={vlcViewRef}
              style={styles.video}
              source={resolvedVideoUri || currentItem.uri}
              options={["--file-caching=1000", "--network-caching=1000", "--avcodec-hw=any"]}
              contentFit={effectiveFit}
              rate={Math.max(0.25, speed)}
              volume={100}
              mute={muted}
              repeat={repeatMode === "one"}
              autoplay
              pictureInPicture={pipSupported}
              tracks={vlcSubtitleId === undefined ? undefined : { subtitle: vlcSubtitleId }}
              onPlaying={() => { setIsPlaying(true); setPlaybackError(null); }}
              onPaused={() => setIsPlaying(false)}
              onStopped={handleCompatibilityStopped}
              onEncounteredError={({ message }) => handleCompatibilityError(message)}
              onTimeChanged={({ value }) => setVlcTime(Math.max(0, value / 1000))}
              onESAdded={(tracks) => setVlcSubtitleTracks(tracks.subtitle)}
              onFirstPlay={handleCompatibilityFirstPlay}
              onPictureInPictureStart={() => { pipActiveOrRequestedRef.current = true; setControlsVisible(false); }}
              onPictureInPictureStop={() => { pipActiveOrRequestedRef.current = false; }}
            />
          ) : (
            <VideoView ref={viewRef} onFirstFrameRender={handleFirstFrame} onPictureInPictureStart={() => { pipActiveOrRequestedRef.current = true; setControlsVisible(false); }} onPictureInPictureStop={() => { pipActiveOrRequestedRef.current = false; }} style={styles.video} player={player} nativeControls={false} allowsFullscreen allowsPictureInPicture startsPictureInPictureAutomatically={false} contentFit={effectiveFit} contentPosition={{ dx: 0, dy: 0 }} surfaceType="textureView" useExoShutter={false} />
          )}
        </View>
        <View collapsable={false} {...panResponder.panHandlers} style={styles.gestureSurface} />
        <Pressable onPress={exitVideo} style={styles.persistentBack} accessibilityLabel="العودة إلى مجلد الفيديو"><MaterialIcons name="arrow-forward" size={25} color={colors.text} /></Pressable>
        <Pressable onPress={() => setSubtitlePanelOpen(true)} style={[styles.captionButton, subtitlePanelOpen && styles.captionButtonActive]} accessibilityLabel="فتح إعدادات الترجمة"><MaterialIcons name="closed-caption" size={23} color={subtitlePanelOpen ? colors.background : colors.text} /><Text style={[styles.captionButtonText, subtitlePanelOpen && styles.captionButtonTextActive]}>CC</Text></Pressable>
        {nightMode ? <View pointerEvents="none" style={styles.nightOverlay} /> : null}
        {subtitleEnabled && activeCue ? <View pointerEvents="none" style={[styles.subtitleOverlay, { backgroundColor: subtitleAppearance.backgroundColor }]}><Text style={[styles.subtitleText, { color: subtitleAppearance.color, fontSize: subtitleAppearance.fontSize, lineHeight: Math.round(subtitleAppearance.fontSize * 1.4) }]}>{activeCue.text}</Text></View> : null}
        {volumeHud ? <><View pointerEvents="none" style={[styles.gestureMeter, styles.volumeMeter]}><View style={styles.gestureTrack}><View style={[styles.gestureFill, { height: `${Math.round(volume * 100)}%` }]} /></View><MaterialIcons name="volume-up" size={28} color={colors.text} /></View><View pointerEvents="none" style={styles.gestureReadout}><Text style={styles.gestureReadoutText}>الصوت: {Math.round(volume * 100)}%</Text></View></> : null}
        {brightnessHud ? <><View pointerEvents="none" style={[styles.gestureMeter, styles.brightnessMeter]}><View style={styles.gestureTrack}><View style={[styles.gestureFill, { height: `${Math.round(localBrightness * 100)}%` }]} /></View><MaterialIcons name="brightness-high" size={28} color={colors.text} /></View><View pointerEvents="none" style={styles.gestureReadout}><Text style={styles.gestureReadoutText}>السطوع داخل المشغل: {Math.round(localBrightness * 100)}%</Text></View></> : null}
        {temporarySpeedActive ? <View pointerEvents="none" style={[styles.temporarySpeedHud, { top: 24, minWidth: 250, minHeight: 54, paddingHorizontal: 14, flexDirection: "row-reverse", gap: 8 }]}><MaterialIcons name="fast-forward" size={23} color={colors.text} /><Text style={styles.volumeText}>زيادة سرعة التشغيل <Text style={{ color: "#39D353" }}>2×</Text></Text></View> : null}
        {speedHud && !temporarySpeedActive ? <View pointerEvents="none" style={[styles.temporarySpeedHud, { top: 24, minWidth: 130, minHeight: 45, paddingHorizontal: 14 }]}><Text style={styles.volumeText}>السرعة {speed}×</Text></View> : null}
        {playbackError ? (
          <View style={styles.playbackError}>
            <MaterialIcons name="error-outline" size={24} color="#FECACA" />
            <Text style={styles.playbackErrorText}>{playbackError}</Text>
            <View style={{ flexDirection: "row-reverse", flexWrap: "wrap", gap: 10, marginTop: 8, justifyContent: "center" }}>
              <Pressable onPress={retryCurrentVideo} style={styles.retryButton}>
                <Text style={styles.retryText}>إعادة المحاولة</Text>
              </Pressable>
              {currentVideoUri ? (
                <Pressable
                  onPress={() => void triggerFfmpegExtraction(resolvedVideoUri || currentVideoUri, currentItem?.title)}
                  style={[styles.retryButton, { backgroundColor: "#10B981" }]}
                >
                  <Text style={[styles.retryText, { color: "#FFFFFF" }]}>معالجة عبر FFmpeg</Text>
                </Pressable>
              ) : null}
              {!usingCompatibilityEngine ? (
                <Pressable onPress={switchToLibVlc} style={[styles.retryButton, { backgroundColor: colors.cyan }]}>
                  <Text style={[styles.retryText, { color: colors.background }]}>محرك التوافق (VLC)</Text>
                </Pressable>
              ) : null}
              <Pressable onPress={exitVideo} style={[styles.retryButton, { backgroundColor: "rgba(255,255,255,0.18)" }]}>
                <Text style={styles.retryText}>العودة للفيديوهات</Text>
              </Pressable>
            </View>
          </View>
        ) : null}
        {isExtracting ? (
          <View style={styles.extractionOverlay} pointerEvents="box-none">
            <View style={styles.extractionCard}>
              <View style={styles.extractionHeaderRow}>
                <ActivityIndicator size="small" color={colors.cyan} />
                <Text style={styles.extractionTitle}>محرك FFmpeg: استخراج وتجهيز الفيديو</Text>
              </View>
              <Text style={styles.extractionStage}>
                {extractionProgress.stage || "جارٍ معالجة الحاوية والترميز المتوافق..."}
              </Text>
              <View style={styles.extractionBarTrack}>
                <View
                  style={[
                    styles.extractionBarFill,
                    { width: `${Math.max(4, Math.min(100, extractionProgress.percent))}%` },
                  ]}
                />
              </View>
              <Text style={styles.extractionPercent}>{Math.round(extractionProgress.percent)}%</Text>
              <View style={{ flexDirection: "row-reverse", gap: 10, marginTop: 10 }}>
                <Pressable
                  onPress={() => {
                    cancelActiveExtraction();
                    switchToLibVlc();
                  }}
                  style={[styles.retryButton, { backgroundColor: colors.cyan }]}
                >
                  <Text style={[styles.retryText, { color: colors.background }]}>تشغيل عبر VLC فوراً</Text>
                </Pressable>
                <Pressable
                  onPress={cancelActiveExtraction}
                  style={[styles.retryButton, { backgroundColor: "rgba(255,255,255,0.18)" }]}
                >
                  <Text style={styles.retryText}>إلغاء</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ) : null}
        {controlsVisible && !controlsLocked ? <View style={styles.centerTransport} pointerEvents="box-none"><Pressable onPress={exitVideo} style={styles.centerBack} accessibilityLabel="العودة إلى مجلدات الفيديو"><MaterialIcons name="folder-open" size={23} color={colors.text} /></Pressable><Pressable onPress={() => void previousVideo()} style={styles.centerControl} accessibilityLabel="الفيديو السابق"><MaterialIcons name="skip-previous" size={31} color={colors.text} /></Pressable><Pressable onPress={() => void togglePlay()} style={[styles.centerControl, styles.centerPlay]} accessibilityLabel={isPlaying ? "إيقاف مؤقت" : "تشغيل"}><MaterialIcons name={isPlaying ? "pause" : "play-arrow"} size={39} color={colors.background} /></Pressable><Pressable onPress={() => void nextVideo()} style={styles.centerControl} accessibilityLabel="الفيديو التالي"><MaterialIcons name="skip-next" size={31} color={colors.text} /></Pressable></View> : null}
        {controlsVisible && !controlsLocked ? <View style={styles.overlay} pointerEvents="box-none" onTouchStart={revealControls}><View style={styles.controlDock}><View style={styles.overlayBottom}><View style={styles.progressWrap}><Text style={styles.time}>{formatDuration(playbackTime)}</Text><View {...progressResponder.panHandlers} onLayout={(event) => { progressTrackWidth.current = event.nativeEvent.layout.width; }} style={playerOverlayStyles.progressTouch}>
          {isScrubbing ? (
            <View style={[styles.scrubbingTooltip, { left: `${Math.max(0, Math.min(100, progress))}%` }]}>
              <Text style={styles.scrubbingTooltipText}>{formatDuration(scrubbingTime)}</Text>
            </View>
          ) : null}
          <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress}%` }]} /><View style={[playerOverlayStyles.progressThumb, { left: `${Math.max(0, Math.min(100, progress))}%` }]} /></View></View><Text style={styles.time}>{formatDuration(playbackDuration || currentItem.duration)}</Text></View><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickIcons}><Pressable onPress={exitVideo} style={styles.quickIcon} accessibilityLabel="العودة للفيديوهات"><MaterialIcons name="arrow-forward" size={20} color={colors.text} /></Pressable><Pressable onPress={() => safeSeekBy(-10)} style={styles.quickIcon} accessibilityLabel="تأخير عشر ثوان"><MaterialIcons name="replay-10" size={20} color={colors.text} /></Pressable><Pressable onPress={() => void previousVideo()} style={styles.quickIcon} accessibilityLabel="الفيديو السابق"><MaterialIcons name="skip-previous" size={20} color={colors.text} /></Pressable><Pressable onPress={() => void togglePlay()} style={styles.quickIcon} accessibilityLabel={isPlaying ? "إيقاف مؤقت" : "تشغيل"}><MaterialIcons name={isPlaying ? "pause" : "play-arrow"} size={22} color={colors.text} /></Pressable><Pressable onPress={() => void nextVideo()} style={styles.quickIcon} accessibilityLabel="الفيديو التالي"><MaterialIcons name="skip-next" size={20} color={colors.text} /></Pressable><Pressable onPress={() => safeSeekBy(10)} style={styles.quickIcon} accessibilityLabel="تقديم عشر ثوان"><MaterialIcons name="forward-10" size={20} color={colors.text} /></Pressable>{topActions.map((action) => <Pressable key={action.label} onPress={action.onPress} style={({ pressed }) => [styles.topAction, action.active && styles.topActionActive, pressed && styles.dimmed]}><MaterialIcons name={action.icon} size={17} color={action.active ? colors.background : colors.text} /><Text style={[styles.topActionText, action.active && styles.topActionTextActive]}>{action.label}</Text></Pressable>)}<Pressable onPress={() => setFitPanelOpen(true)} style={[styles.quickIcon, fitPanelOpen && styles.quickIconActive]} accessibilityLabel="احتواء وتمدد ونسب العرض"><MaterialIcons name="aspect-ratio" size={20} color={fitPanelOpen ? colors.background : colors.text} /></Pressable><Pressable onPress={cycleSpeed} style={styles.quickIcon}><Text style={styles.quickSpeed}>{speed}×</Text></Pressable><Pressable onPress={rotateVideo} style={styles.quickIcon}><MaterialIcons name="screen-rotation" size={20} color={colors.text} /></Pressable><Pressable onPress={() => setControlsLocked((locked) => !locked)} style={[styles.quickIcon, controlsLocked && styles.quickIconActive]}><MaterialIcons name={controlsLocked ? "lock" : "lock-open"} size={20} color={controlsLocked ? colors.background : colors.text} /></Pressable><Pressable onPress={() => setNightMode((enabled) => !enabled)} style={[styles.quickIcon, nightMode && styles.quickIconActive]} accessibilityLabel="الوضع الليلي"><MaterialIcons name="dark-mode" size={20} color={nightMode ? colors.background : colors.text} /></Pressable><Pressable onPress={toggleMute} style={[styles.quickIcon, muted && styles.quickIconActive]}><MaterialIcons name={muted ? "volume-off" : "volume-up"} size={20} color={muted ? colors.background : colors.text} /></Pressable><Pressable onPress={() => setMirrored((value) => !value)} style={[styles.quickIcon, mirrored && styles.quickIconActive]}><MaterialIcons name="flip" size={20} color={mirrored ? colors.background : colors.text} /></Pressable><Pressable onPress={toggleRepeat} style={[styles.quickIcon, repeatMode !== "off" && styles.quickIconActive]} accessibilityLabel={repeatMode === "off" ? "تكرار متوقف" : repeatMode === "one" ? "تكرار مقطع واحد" : "تكرار الكل"}><MaterialIcons name={repeatIcon} size={20} color={repeatMode !== "off" ? colors.background : colors.text} /></Pressable><Pressable onPress={setAbPoint} style={[styles.quickIcon, repeatStart !== null && styles.quickIconActive]}><MaterialIcons name="loop" size={20} color={repeatStart !== null ? colors.background : colors.text} /></Pressable></ScrollView></View></View></View> : null}
        {fitPanelOpen && !controlsLocked ? <View style={styles.fitPanel}><View style={styles.fitPanelHeader}><Pressable onPress={() => setFitPanelOpen(false)} style={styles.fitPanelClose}><MaterialIcons name="close" size={20} color={colors.text} /></Pressable><Text style={styles.fitPanelTitle}>الشاشة</Text></View><Text style={styles.fitPanelLabel}>طريقة العرض</Text><View style={styles.fitModeRow}>{fitModes.map((mode) => <Pressable key={mode.id} onPress={() => setVideoFit(mode.id)} style={[styles.fitModeButton, videoFit === mode.id && styles.fitModeButtonActive]}><MaterialIcons name={mode.icon} size={24} color={videoFit === mode.id ? colors.background : colors.text} /><Text style={[styles.fitModeText, videoFit === mode.id && styles.fitModeTextActive]}>{mode.label}</Text></Pressable>)}</View><Text style={styles.fitPanelLabel}>قياسي</Text><View style={styles.frameAspectRow}>{frameAspects.map((aspect) => <Pressable key={aspect.id} onPress={() => setSelectedFrameAspect(aspect.id)} style={[styles.frameAspectButton, frameAspect === aspect.id && styles.frameAspectButtonActive]}><Text style={[styles.frameAspectText, frameAspect === aspect.id && styles.frameAspectTextActive]}>{aspect.label}</Text></Pressable>)}</View></View> : null}
        {subtitlePanelOpen ? (
          <View style={styles.subtitleMenuOverlay}>
            <Pressable style={styles.subtitleMenuBackdrop} onPress={() => setSubtitlePanelOpen(false)} />
            <View style={styles.subtitleMenuSheet}>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8, gap: 4 }}>
              <View style={styles.subtitleMenuHeader}>
                <Pressable onPress={() => setSubtitleEnabled((enabled) => !enabled)} style={styles.subtitleToggleRow} accessibilityLabel={subtitleEnabled ? "إيقاف الترجمة" : "تشغيل الترجمة"}>
                  <View style={[styles.subtitleToggleTrack, subtitleEnabled && styles.subtitleToggleTrackOn]}>
                    <View style={[styles.subtitleToggleThumb, subtitleEnabled && styles.subtitleToggleThumbOn]} />
                  </View>
                </Pressable>
                <Pressable onPress={() => setSubtitlePanelOpen(false)} style={styles.subtitleMenuTitleRow} accessibilityLabel="إغلاق قائمة الترجمة">
                  <Text style={styles.subtitleMenuTitle}>العنوان الفرعي</Text>
                  <MaterialIcons name="arrow-forward" size={22} color={colors.text} />
                </Pressable>
              </View>

              <Text style={styles.subtitleMenuSection}>الترجمة الحالية</Text>
              {subtitleTrack ? (
                <Pressable onPress={() => setSubtitleEnabled((enabled) => !enabled)} style={styles.subtitleCurrentRow}>
                  <Text numberOfLines={2} style={styles.subtitleCurrentName}>{subtitleTrack.targetLanguage || "ترجمة خارجية"}</Text>
                  <MaterialIcons name={subtitleEnabled ? "check-circle" : "radio-button-unchecked"} size={20} color={subtitleEnabled ? colors.cyan : colors.muted} />
                </Pressable>
              ) : (
                <Text style={styles.subtitleCurrentEmpty}>لا توجد ترجمة خارجية محمّلة لهذا الفيديو</Text>
              )}

              <Pressable onPress={() => { setSubtitlePanelOpen(false); void importSubtitleFile(); }} style={styles.subtitleMenuItem}>
                <Text style={styles.subtitleMenuItemText}>فتح ملف</Text>
              </Pressable>
              <Pressable onPress={() => Alert.alert("تنزيل الترجمة", "سيتم إضافة تنزيل الترجمة عبر الإنترنت في إصدار لاحق.")} style={styles.subtitleMenuItem}>
                <Text style={styles.subtitleMenuItemText}>تنزيل عبر الإنترنت</Text>
              </Pressable>
              <Pressable onPress={() => { setSubtitlePanelOpen(false); setTranslationOpen(true); }} style={styles.subtitleMenuItem}>
                <Text style={styles.subtitleMenuItemText}>ترجمة AI</Text>
              </Pressable>
              <Pressable onPress={() => undefined} style={styles.subtitleMenuItem}>
                <Text style={styles.subtitleMenuItemText}>نمط الترجمة</Text>
              </Pressable>

              <Text style={styles.subtitleMenuSection}>مظهر الترجمة</Text>
              <View style={styles.subtitleSetting}>
                <Text style={styles.subtitleSettingLabel}>حجم الخط: {subtitleAppearance.fontSize}</Text>
                <View style={styles.subtitleChoiceRow}>
                  {[14, 18, 22, 26].map((size) => (
                    <Pressable key={size} onPress={() => setSubtitleAppearance((current) => ({ ...current, fontSize: size }))} style={[styles.subtitleSizeChoice, subtitleAppearance.fontSize === size && styles.subtitleChoiceActive]}>
                      <Text style={[styles.subtitleSizeText, subtitleAppearance.fontSize === size && styles.subtitleChoiceTextActive]}>{size}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              <View style={styles.subtitleSetting}>
                <Text style={styles.subtitleSettingLabel}>لون النص</Text>
                <View style={styles.subtitleChoiceRow}>
                  {subtitleTextColors.map((choice) => (
                    <Pressable key={choice.value} onPress={() => setSubtitleAppearance((current) => ({ ...current, color: choice.value }))} style={[styles.subtitleColorChoice, subtitleAppearance.color === choice.value && styles.subtitleChoiceActive]}>
                      <View style={[styles.subtitleColorDot, { backgroundColor: choice.value }]} />
                    </Pressable>
                  ))}
                </View>
              </View>
              <View style={styles.subtitleSetting}>
                <Text style={styles.subtitleSettingLabel}>خلفية النص</Text>
                <View style={styles.subtitleChoiceRow}>
                  {subtitleBackgroundColors.map((choice) => (
                    <Pressable key={choice.value} onPress={() => setSubtitleAppearance((current) => ({ ...current, backgroundColor: choice.value }))} style={[styles.subtitleColorChoice, subtitleAppearance.backgroundColor === choice.value && styles.subtitleChoiceActive]}>
                      <View style={[styles.subtitleColorDot, { backgroundColor: choice.value }]} />
                    </Pressable>
                  ))}
                </View>
              </View>

              <Text style={styles.subtitleMenuSection}>مسارات الترجمة المضمّنة</Text>
              {usingCompatibilityEngine ? (
                <>
                  <Pressable onPress={() => selectCompatibilitySubtitle(-1)} style={[styles.subtitleOption, vlcSubtitleId === -1 && styles.subtitleOptionActive]}>
                    <Text style={[styles.subtitleOptionText, vlcSubtitleId === -1 && styles.subtitleOptionTextActive]}>إيقاف الترجمة المضمنة</Text>
                  </Pressable>
                  {vlcSubtitleTracks.length ? vlcSubtitleTracks.map((track) => (
                    <Pressable key={track.id} onPress={() => selectCompatibilitySubtitle(track.id)} style={[styles.subtitleOption, vlcSubtitleId === track.id && styles.subtitleOptionActive]}>
                      <Text style={[styles.subtitleOptionText, vlcSubtitleId === track.id && styles.subtitleOptionTextActive]}>{track.name || "مسار ترجمة"}</Text>
                    </Pressable>
                  )) : <Text style={styles.noSubtitleText}>لم يعلن محرك التوافق عن مسار ترجمة مضمّن.</Text>}
                </>
              ) : (
                <>
                  <Pressable onPress={() => selectEmbeddedSubtitle(null)} style={[styles.subtitleOption, embeddedSubtitleId === null && styles.subtitleOptionActive]}>
                    <Text style={[styles.subtitleOptionText, embeddedSubtitleId === null && styles.subtitleOptionTextActive]}>إيقاف الترجمة المضمنة</Text>
                  </Pressable>
                  {embeddedSubtitleTracks.length ? embeddedSubtitleTracks.map((track) => (
                    <Pressable key={track.id} onPress={() => selectEmbeddedSubtitle(track)} style={[styles.subtitleOption, embeddedSubtitleId === track.id && styles.subtitleOptionActive]}>
                      <Text style={[styles.subtitleOptionText, embeddedSubtitleId === track.id && styles.subtitleOptionTextActive]}>{track.label || track.language || "مسار ترجمة"}</Text>
                    </Pressable>
                  )) : <Text style={styles.noSubtitleText}>لا يحتوي هذا الفيديو على مسارات ترجمة مضمّنة.</Text>}
                </>
              )}
              </ScrollView>
            </View>
          </View>
        ) : null}
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
  scrubbingTooltip: { position: "absolute", top: -36, transform: [{ translateX: "-50%" }], backgroundColor: "rgba(15, 23, 42, 0.9)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", zIndex: 30 },
  scrubbingTooltipText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  root: { flex: 1 },
  landscapeRoot: { backgroundColor: "#02060B" },
  header: { height: 58, paddingHorizontal: 16, flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between" },
  headerIcon: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, color: colors.text, fontSize: 13, fontWeight: "800", textAlign: "center", marginHorizontal: 8 },
  mediaSurface: { flex: 1, width: "100%", backgroundColor: "#02060B", overflow: "hidden", alignItems: "center", justifyContent: "center" },
  landscapeSurface: { flex: 1 },
  cinematicSurface: { aspectRatio: 2.25, marginVertical: 14 },
  videoContainer: { position: "absolute" },
  gestureSurface: { ...StyleSheet.absoluteFillObject, zIndex: 1, elevation: 1 },
  persistentBack: { position: "absolute", top: 18, right: 16, zIndex: 5, elevation: 5, width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(1, 8, 16, 0.78)", borderWidth: 1, borderColor: "rgba(255,255,255,0.28)" },
  captionButton: { position: "absolute", top: 18, right: 68, zIndex: 5, elevation: 5, minWidth: 52, height: 44, paddingHorizontal: 9, borderRadius: 14, flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 3, backgroundColor: "rgba(1, 8, 16, 0.78)", borderWidth: 1, borderColor: "rgba(255,255,255,0.28)" },
  captionButtonActive: { backgroundColor: colors.cyan, borderColor: colors.cyan },
  captionButtonText: { color: colors.text, fontSize: 12, fontWeight: "900" },
  captionButtonTextActive: { color: colors.background },
  mirrored: { transform: [{ scaleX: -1 }] },
  video: { width: "100%", height: "100%" },
  nightOverlay: { position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.44)" },
  localBrightnessOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "#000000" },
  subtitleOverlay: { position: "absolute", left: 22, right: 22, bottom: 20, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: "rgba(0,0,0,0.78)", alignItems: "center" },
  subtitleText: { color: "#FFFFFF", fontSize: 15, lineHeight: 22, fontWeight: "800", textAlign: "center" },
  gestureMeter: { position: "absolute", top: "30%", zIndex: 3, elevation: 3, width: 78, paddingVertical: 14, borderRadius: 16, backgroundColor: "rgba(0,0,0,0.62)", alignItems: "center", gap: 12 },
  volumeMeter: { left: 22 },
  brightnessMeter: { right: 22 },
  gestureTrack: { width: 8, height: 166, borderRadius: 4, overflow: "hidden", backgroundColor: "rgba(255,255,255,0.28)", justifyContent: "flex-end" },
  gestureFill: { width: "100%", borderRadius: 4, backgroundColor: "#39D353" },
  gestureReadout: { position: "absolute", top: 20, alignSelf: "center", zIndex: 3, elevation: 3, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12, backgroundColor: "rgba(0,0,0,0.70)" },
  gestureReadoutText: { color: colors.text, fontSize: 16, fontWeight: "900" },
  temporarySpeedHud: { position: "absolute", alignSelf: "center", zIndex: 3, elevation: 3, borderRadius: 18, backgroundColor: "rgba(0,0,0,0.68)", alignItems: "center", justifyContent: "center" },
  compatibilityBadge: { position: "absolute", top: 22, zIndex: 4, elevation: 4, minHeight: 28, paddingHorizontal: 9, borderRadius: 10, flexDirection: "row-reverse", alignItems: "center", gap: 4, backgroundColor: colors.cyan },
  compatibilityBadgeText: { color: colors.background, fontSize: 10, fontWeight: "900" },
  extractionOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 7,
    elevation: 7,
    backgroundColor: "rgba(0, 0, 0, 0.78)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  extractionCard: {
    width: "100%",
    maxWidth: 420,
    padding: 20,
    borderRadius: 18,
    backgroundColor: "rgba(15, 23, 42, 0.96)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
    alignItems: "center",
    gap: 10,
  },
  extractionHeaderRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  extractionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
    textAlign: "center",
  },
  extractionStage: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 18,
  },
  extractionBarTrack: {
    width: "100%",
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    overflow: "hidden",
    marginTop: 6,
  },
  extractionBarFill: {
    height: "100%",
    backgroundColor: colors.cyan,
    borderRadius: 3,
  },
  extractionPercent: {
    color: colors.cyan,
    fontSize: 13,
    fontWeight: "900",
  },
  playbackError: { position: "absolute", zIndex: 6, elevation: 6, left: 20, right: 20, alignSelf: "center", top: "36%", padding: 17, borderRadius: 18, backgroundColor: "rgba(69, 10, 10, 0.96)", borderWidth: 1, borderColor: "#F87171", alignItems: "center", gap: 10 },
  playbackErrorText: { color: "#FEF2F2", fontSize: 13, lineHeight: 20, fontWeight: "800", textAlign: "center" },
  retryButton: { minHeight: 38, paddingHorizontal: 16, borderRadius: 12, backgroundColor: "#FECACA", alignItems: "center", justifyContent: "center" },
  retryText: { color: "#7F1D1D", fontSize: 12, fontWeight: "900" },
  volumeText: { color: colors.text, fontSize: 14, fontWeight: "900" },
  centerTransport: { position: "absolute", top: "43%", alignSelf: "center", zIndex: 3, elevation: 3, flexDirection: "row-reverse", alignItems: "center", gap: 12 },
  centerControl: { width: 58, height: 58, borderRadius: 29, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(1, 8, 16, 0.78)", borderWidth: 1, borderColor: "rgba(255,255,255,0.28)" },
  centerPlay: { width: 70, height: 70, borderRadius: 35, backgroundColor: colors.cyan, borderColor: colors.cyan },
  centerBack: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(1, 8, 16, 0.78)", borderWidth: 1, borderColor: "rgba(255,255,255,0.28)" },
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 2, elevation: 2, justifyContent: "flex-end", backgroundColor: "rgba(0, 8, 15, 0.18)", paddingVertical: 10 },
  controlDock: { marginHorizontal: 10, padding: 9, borderRadius: 18, backgroundColor: "rgba(5, 13, 24, 0.90)", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  fitPanel: { position: "absolute", zIndex: 4, elevation: 4, left: 12, right: 12, top: 44, padding: 14, borderRadius: 18, backgroundColor: "rgba(7,15,27,0.96)", borderWidth: 1, borderColor: "rgba(255,255,255,0.18)" },
  subtitleMenuOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 8, elevation: 8, justifyContent: "center" },
  subtitleMenuBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)" },
  subtitleMenuSheet: { marginHorizontal: 28, maxHeight: "88%", paddingHorizontal: 18, paddingTop: 14, paddingBottom: 18, borderRadius: 18, backgroundColor: "rgba(8, 14, 22, 0.96)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", gap: 4 },
  subtitleMenuHeader: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  subtitleMenuTitleRow: { flexDirection: "row-reverse", alignItems: "center", gap: 8 },
  subtitleMenuTitle: { color: colors.text, fontSize: 18, fontWeight: "900" },
  subtitleToggleRow: { padding: 4 },
  subtitleToggleTrack: { width: 46, height: 26, borderRadius: 13, backgroundColor: "rgba(255,255,255,0.22)", justifyContent: "center", paddingHorizontal: 3 },
  subtitleToggleTrackOn: { backgroundColor: "#34C759" },
  subtitleToggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: "#FFFFFF", alignSelf: "flex-start" },
  subtitleToggleThumbOn: { alignSelf: "flex-end" },
  subtitleMenuSection: { color: "rgba(255,255,255,0.55)", fontSize: 13, fontWeight: "700", textAlign: "right", marginTop: 10, marginBottom: 2 },
  subtitleCurrentRow: { minHeight: 44, flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", gap: 10, paddingVertical: 6 },
  subtitleCurrentName: { flex: 1, color: "rgba(255,255,255,0.72)", fontSize: 13, lineHeight: 18, textAlign: "right" },
  subtitleCurrentEmpty: { color: "rgba(255,255,255,0.45)", fontSize: 12, textAlign: "right", paddingVertical: 8 },
  subtitleMenuItem: { minHeight: 48, justifyContent: "center", borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "rgba(255,255,255,0.12)" },
  subtitleMenuItemText: { color: colors.text, fontSize: 16, fontWeight: "600", textAlign: "right" },
  subtitleOption: { minHeight: 42, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.08)", paddingHorizontal: 12, alignItems: "flex-end", justifyContent: "center", marginTop: 4 },
  subtitleOptionActive: { backgroundColor: colors.cyan },
  subtitleOptionText: { color: colors.text, fontSize: 13, fontWeight: "800", textAlign: "right" },
  subtitleOptionTextActive: { color: colors.background },
  subtitleSetting: { paddingVertical: 3, gap: 6 },
  subtitleSettingLabel: { color: colors.text, fontSize: 12, fontWeight: "800", textAlign: "right" },
  subtitleChoiceRow: { flexDirection: "row-reverse", gap: 8 },
  subtitleSizeChoice: { minWidth: 42, height: 34, paddingHorizontal: 9, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
  subtitleSizeText: { color: colors.text, fontSize: 12, fontWeight: "900" },
  subtitleColorChoice: { width: 36, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
  subtitleColorDot: { width: 20, height: 20, borderRadius: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.55)" },
  subtitleChoiceActive: { borderColor: colors.cyan, backgroundColor: "rgba(72,207,255,0.24)" },
  subtitleChoiceTextActive: { color: colors.cyan },
  noSubtitleText: { color: colors.muted, fontSize: 12, lineHeight: 19, textAlign: "right", paddingVertical: 7 },
  fitPanelHeader: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between" },
  fitPanelClose: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.1)" },
  fitPanelTitle: { color: colors.text, fontSize: 17, fontWeight: "900", textAlign: "right" },
  fitPanelLabel: { color: colors.text, fontSize: 13, fontWeight: "800", textAlign: "right", marginTop: 12, marginBottom: 7 },
  fitModeRow: { flexDirection: "row-reverse", justifyContent: "space-between", gap: 7 },
  fitModeButton: { flex: 1, minHeight: 64, borderRadius: 13, alignItems: "center", justifyContent: "center", gap: 5, backgroundColor: "rgba(255,255,255,0.08)" },
  fitModeButtonActive: { backgroundColor: colors.cyan },
  fitModeText: { color: colors.text, fontSize: 10, fontWeight: "800" },
  fitModeTextActive: { color: colors.background },
  frameAspectRow: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 8 },
  frameAspectButton: { minWidth: 55, minHeight: 36, paddingHorizontal: 9, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.08)" },
  frameAspectButtonActive: { backgroundColor: colors.cyan },
  frameAspectText: { color: colors.text, fontSize: 11, fontWeight: "900" },
  frameAspectTextActive: { color: colors.background },
  lockOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 3, elevation: 3, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.22)" },
  unlockButton: { minHeight: 58, minWidth: 132, paddingHorizontal: 16, borderRadius: 18, backgroundColor: "rgba(0,0,0,0.76)", alignItems: "center", justifyContent: "center", gap: 4 },
  unlockText: { color: colors.text, fontSize: 11, fontWeight: "800" },
  overlayTop: { paddingHorizontal: 14, flexDirection: "row-reverse", alignItems: "center", gap: 8 },
  overlayTitle: { flex: 1, color: colors.text, fontSize: 12, fontWeight: "800", textAlign: "center" },
  overlayCircle: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.36)" },
  topActions: { paddingHorizontal: 14, gap: 7, alignItems: "center" },
  topAction: { minHeight: 31, paddingHorizontal: 9, borderRadius: 10, flexDirection: "row-reverse", alignItems: "center", gap: 4, backgroundColor: "rgba(8,17,31,0.78)", borderWidth: 1, borderColor: "rgba(255,255,255,0.13)" },
  topActionActive: { backgroundColor: colors.cyan, borderColor: colors.cyan },
  topActionText: { color: colors.text, fontSize: 10, fontWeight: "800" },
  topActionTextActive: { color: colors.background },
  overlayBottom: { paddingHorizontal: 15 },
  progressWrap: { flexDirection: "row-reverse", alignItems: "center", gap: 8 },
  time: { color: colors.text, fontSize: 10, fontVariant: ["tabular-nums"] },
  progressTrack: { flex: 1, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.42)", overflow: "hidden" },
  progressFill: { height: 4, borderRadius: 2, backgroundColor: colors.cyan },
  quickIcons: { marginTop: 10, flexDirection: "row-reverse", justifyContent: "flex-start", gap: 6, paddingHorizontal: 1 },
  quickIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: "rgba(8,17,31,0.79)", borderWidth: 1, borderColor: "rgba(255,255,255,0.11)", alignItems: "center", justifyContent: "center" },
  quickIconActive: { backgroundColor: colors.cyan, borderColor: colors.cyan },
  quickSpeed: { color: colors.text, fontSize: 10, fontWeight: "900" },
  resetAb: { alignSelf: "center", marginTop: 14, paddingHorizontal: 13, minHeight: 38, borderRadius: 13, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, flexDirection: "row-reverse", alignItems: "center", gap: 5 },
  resetAbText: { color: colors.cyan, fontSize: 12, fontWeight: "800" },
  dimmed: { opacity: 0.6 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14 },
  emptyText: { color: colors.muted, fontSize: 15 },
  backButton: { height: 42, paddingHorizontal: 16, borderRadius: 13, backgroundColor: colors.cyan, justifyContent: "center" },
  backText: { color: colors.background, fontWeight: "800" },
});

const playerOverlayStyles = StyleSheet.create({
  tenSecondControl: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.28)" },
  progressTouch: { flex: 1, minHeight: 30, justifyContent: "center" },
  progressThumb: { position: "absolute", top: -5, marginLeft: -7, width: 14, height: 14, borderRadius: 7, backgroundColor: colors.cyan },
});

const sheetStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "flex-end" },
  sheet: { padding: 20, paddingBottom: 30, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: colors.surface, borderTopWidth: 1, borderColor: colors.border },
  sheetHead: { flexDirection: "row-reverse", alignItems: "center", gap: 10 },
  headCopy: { flex: 1, alignItems: "flex-end" },
  title: { color: colors.text, fontSize: 18, lineHeight: 25, fontWeight: "900", textAlign: "right" },
  subtitle: { color: colors.muted, fontSize: 12, lineHeight: 18, textAlign: "right" },
  privacy: { flexDirection: "row-reverse", alignItems: "flex-start", gap: 8, padding: 12, borderRadius: 14, backgroundColor: "#102C3C", marginTop: 16 },
  privacyText: { flex: 1, color: colors.text, fontSize: 11, lineHeight: 18, textAlign: "right" },
  languageLabel: { color: colors.text, fontSize: 13, fontWeight: "800", textAlign: "right", marginTop: 17, marginBottom: 8 },
  languages: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 8 },
  language: { minHeight: 36, paddingHorizontal: 12, borderRadius: 11, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  languageActive: { backgroundColor: colors.cyan, borderColor: colors.cyan },
  languageText: { color: colors.text, fontSize: 12, fontWeight: "800" },
  languageTextActive: { color: colors.background },
  limit: { color: colors.muted, fontSize: 11, lineHeight: 17, textAlign: "right", marginTop: 12 },
  generate: { minHeight: 49, borderRadius: 15, backgroundColor: colors.cyan, marginTop: 17, flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 7 },
  generateText: { color: colors.background, fontSize: 13, fontWeight: "900" },
  cancel: { minHeight: 42, alignItems: "center", justifyContent: "center", marginTop: 7 },
  cancelText: { color: colors.cyan, fontSize: 13, fontWeight: "900" },
});