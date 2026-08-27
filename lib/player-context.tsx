import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from "expo-audio";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Alert, AppState, Platform } from "react-native";

import { getPlaybackMemory, resumePosition, savePlaybackMemory } from "@/lib/playback-memory";
import { resolveMediaSessionPolicy } from "@/lib/media-session-policy";
import { useLibrary } from "@/lib/library-context";
import { buildPlaybackQueue, nextQueueItem, previousQueueItem } from "@/lib/playback-queue";
import type { MediaItem } from "@/types/media";

export type RepeatMode = "off" | "one" | "all";

type PlayerContextValue = {
  currentItem: MediaItem | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  speed: number;
  repeatMode: RepeatMode;
  shuffle: boolean;
  playbackQueue: MediaItem[];
  playItem: (item: MediaItem, queue?: MediaItem[]) => Promise<void>;
  setCurrentItem: (item: MediaItem | null) => void;
  togglePlayback: () => void;
  seekTo: (seconds: number) => Promise<void>;
  skipBy: (seconds: number) => Promise<void>;
  playNext: (wrap?: boolean) => Promise<boolean>;
  playPrevious: () => Promise<boolean>;
  setSpeed: (speed: number) => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  stop: () => void;
  dismissMediaSession: () => void;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

const lockScreenOptions = {
  showSeekBackward: true,
  showSeekForward: true,
  showSkipPrevious: true,
  showSkipNext: true,
};

function getLockScreenMetadata(item: MediaItem) {
  return {
    title: item.title,
    artist: item.artist || "REMO PLAYER",
    albumTitle: item.album || "REMO PLAYER",
  };
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const { items } = useLibrary();
  const playerRef = useRef<AudioPlayer | null>(null);
  const statusSubscriptionRef = useRef<{ remove: () => void } | null>(null);
  const [currentItem, setCurrentItem] = useState<MediaItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeedState] = useState(1);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");
  const [shuffle, setShuffle] = useState(false);
  const [playbackQueue, setPlaybackQueue] = useState<MediaItem[]>([]);
  const repeatModeRef = useRef<RepeatMode>("off");
  const autoAdvanceRef = useRef<(wrap: boolean) => Promise<boolean>>(async () => false);
  const remoteQueueActionRef = useRef<(action: "next" | "previous") => void>(() => undefined);
  const isAutoAdvancingRef = useRef(false);
  const currentItemRef = useRef<MediaItem | null>(null);
  const lastSnapshotSecondRef = useRef(0);

  useEffect(() => {
    currentItemRef.current = currentItem;
  }, [currentItem]);

  useEffect(() => {
    repeatModeRef.current = repeatMode;
  }, [repeatMode]);

  useEffect(() => {
    return () => {
      statusSubscriptionRef.current?.remove();
      playerRef.current?.remove();
    };
  }, []);

  const prepareAudioSession = useCallback(async (allowBackground = true) => {
    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        interruptionMode: "doNotMix",
        shouldPlayInBackground: Platform.OS !== "web" && allowBackground,
        shouldRouteThroughEarpiece: false,
      });
    } catch (error) {
      console.warn("تعذر تهيئة جلسة الصوت", error);
    }
  }, []);

  const releaseAudioPlayer = useCallback(() => {
    const player = playerRef.current;
    statusSubscriptionRef.current?.remove();
    statusSubscriptionRef.current = null;
    playerRef.current = null;
    try {
      // جلسة شاشة القفل تخص الموسيقى فقط. يجب إخلاؤها قبل تشغيل أي فيديو.
      player?.clearLockScreenControls();
      player?.pause();
      player?.remove();
    } catch (error) {
      console.warn("تعذر تحرير مشغل الصوت", error);
    }
  }, []);

  const attachStatusListener = useCallback((player: AudioPlayer) => {
    statusSubscriptionRef.current?.remove();
    const statusSubscription = player.addListener("playbackStatusUpdate", (status) => {
      setIsPlaying(status.playing);
      setCurrentTime(status.currentTime || 0);
      setDuration(status.duration || 0);
      const item = currentItemRef.current;
      const roundedSecond = Math.floor(status.currentTime || 0);
      if (item?.mediaType === "audio" && roundedSecond >= 4 && roundedSecond - lastSnapshotSecondRef.current >= 4) {
        lastSnapshotSecondRef.current = roundedSecond;
        void savePlaybackMemory({ itemId: item.id, position: status.currentTime || 0, updatedAt: Date.now() });
      }
      if (status.didJustFinish && !player.loop) {
        const shouldWrap = repeatModeRef.current === "all";
        if (isAutoAdvancingRef.current) return;
        isAutoAdvancingRef.current = true;
        void autoAdvanceRef.current(shouldWrap).then((advanced) => {
          if (!advanced) setIsPlaying(false);
        }).finally(() => { isAutoAdvancingRef.current = false; });
      }
    });
    const nativeControlPlayer = player as unknown as {
      addListener: (event: string, listener: (event: { action?: string }) => void) => { remove: () => void };
    };
    const controlSubscription = nativeControlPlayer.addListener("mediaControlAction", ({ action }) => {
      if (action === "next" || action === "previous") remoteQueueActionRef.current(action);
    });
    statusSubscriptionRef.current = {
      remove: () => {
        statusSubscription.remove();
        controlSubscription.remove();
      },
    };
  }, []);

  const playItem = useCallback(async (item: MediaItem, sourceQueue?: MediaItem[]) => {
    const queue = buildPlaybackQueue(item, sourceQueue, items);
    setPlaybackQueue(queue);
    if (item.mediaType === "video") {
      try {
        releaseAudioPlayer();
        await prepareAudioSession(false);
        currentItemRef.current = item;
        setCurrentItem(item);
        setCurrentTime(0);
        setDuration(item.duration);
        setIsPlaying(false);
      } catch {
        Alert.alert("تعذّر تشغيل الفيديو", "تحقق من أن الفيديو ما زال متاحاً على جهازك ثم حاول مرة أخرى.");
      }
      return;
    }
    try {
      const audioSession = resolveMediaSessionPolicy("audio");
      await prepareAudioSession(audioSession.allowBackgroundPlayback);
      let player = playerRef.current;
      if (!player) {
        player = createAudioPlayer({ uri: item.uri }, { updateInterval: 300, keepAudioSessionActive: true });
        playerRef.current = player;
        attachStatusListener(player);
      } else {
        player.replace({ uri: item.uri });
      }
      // لا تُفعّل هذه الجلسة للفيديو. وجودها للموسيقى فقط هو ما يبقي الصوت
      // عاملاً في الخلفية ويعرض بيانات المسار في شاشة القفل عند الخروج من التطبيق.
      if (audioSession.enableLockScreenControls) {
        player.setActiveForLockScreen(true, getLockScreenMetadata(item), lockScreenOptions);
      }
      player.loop = repeatMode === "one";
      player.setPlaybackRate(speed);
      const memory = await getPlaybackMemory(item.id);
      const resumeAt = resumePosition(memory, item.duration);
      if (resumeAt > 0) await player.seekTo(resumeAt);
      currentItemRef.current = item;
      setCurrentItem(item);
      lastSnapshotSecondRef.current = resumeAt;
      setCurrentTime(resumeAt);
      setDuration(item.duration);
      player.play();
      setIsPlaying(true);
    } catch {
      Alert.alert("تعذّر تشغيل الملف", "تحقق من أن الملف ما زال متاحاً على جهازك ثم حاول مرة أخرى.");
    }
  }, [attachStatusListener, items, prepareAudioSession, releaseAudioPlayer, repeatMode, speed]);

  const togglePlayback = useCallback(() => {
    const player = playerRef.current;
    if (!currentItem) return;
    if (currentItem.mediaType === "video") {
      return;
    }
    if (!player) return;
    if (player.playing) {
      player.pause();
      setIsPlaying(false);
    } else {
      player.play();
      setIsPlaying(true);
    }
  }, [currentItem]);

  const seekTo = useCallback(async (seconds: number) => {
    const player = playerRef.current;
    if (!player) return;
    const nextTime = Math.max(0, Math.min(seconds, duration || seconds));
    await player.seekTo(nextTime);
    setCurrentTime(nextTime);
  }, [duration]);

  const skipBy = useCallback(async (seconds: number) => {
    await seekTo(currentTime + seconds);
  }, [currentTime, seekTo]);

  const playNext = useCallback(async (wrap = true) => {
    if (!currentItem) return false;
    const queue = playbackQueue.length ? playbackQueue : items.filter((item) => item.mediaType === currentItem.mediaType);
    const nextItem = nextQueueItem(queue, currentItem.id, shuffle, Math.random, wrap);
    if (!nextItem) return false;
    await playItem(nextItem, queue);
    return true;
  }, [currentItem, items, playbackQueue, playItem, shuffle]);

  useEffect(() => {
    autoAdvanceRef.current = playNext;
  }, [playNext]);

  const playPrevious = useCallback(async () => {
    if (!currentItem) return false;
    const queue = playbackQueue.length ? playbackQueue : items.filter((item) => item.mediaType === currentItem.mediaType);
    const previousItem = previousQueueItem(queue, currentItem.id);
    if (!previousItem) return false;
    await playItem(previousItem, queue);
    return true;
  }, [currentItem, items, playbackQueue, playItem]);

  useEffect(() => {
    remoteQueueActionRef.current = (action) => {
      if (action === "next") {
        void playNext(repeatModeRef.current === "all");
      } else {
        void playPrevious();
      }
    };
  }, [playNext, playPrevious]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      const item = currentItemRef.current;
      const player = playerRef.current;
      const isLeavingForeground = nextAppState === "background" || nextAppState === "inactive";
      if (!isLeavingForeground || item?.mediaType !== "audio" || !player?.playing) return;
      void prepareAudioSession(true).then(() => {
        // لا يعاد تفعيل فيديو الخلفية أو إشعاره؛ هذا المسار للموسيقى فقط.
        player.setActiveForLockScreen(true, getLockScreenMetadata(item), lockScreenOptions);
      });
    });
    return () => subscription.remove();
  }, [prepareAudioSession]);

  const setSpeed = useCallback((nextSpeed: number) => {
    const safeSpeed = Math.max(0.5, Math.min(nextSpeed, 2));
    playerRef.current?.setPlaybackRate(safeSpeed);
    setSpeedState(safeSpeed);
  }, []);

  const toggleRepeat = useCallback(() => {
    setRepeatMode((current) => {
      const next: RepeatMode = current === "off" ? "one" : current === "one" ? "all" : "off";
      if (playerRef.current) playerRef.current.loop = next === "one";
      return next;
    });
  }, []);

  const toggleShuffle = useCallback(() => setShuffle((current) => !current), []);

  const stop = useCallback(() => {
    playerRef.current?.pause();
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  const dismissMediaSession = useCallback(() => {
    releaseAudioPlayer();
    currentItemRef.current = null;
    setCurrentItem(null);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    void prepareAudioSession(false);
  }, [prepareAudioSession, releaseAudioPlayer]);

  const value = useMemo<PlayerContextValue>(() => ({
    currentItem,
    playbackQueue,
    isPlaying,
    currentTime,
    duration,
    speed,
    repeatMode,
    shuffle,
    playItem,
    setCurrentItem,
    togglePlayback,
    seekTo,
    skipBy,
    playNext,
    playPrevious,
    setSpeed,
    toggleRepeat,
    toggleShuffle,
    stop,
    dismissMediaSession,
  }), [currentItem, playbackQueue, isPlaying, currentTime, duration, speed, repeatMode, shuffle, playItem, togglePlayback, seekTo, skipBy, playNext, playPrevious, setSpeed, toggleRepeat, toggleShuffle, stop, dismissMediaSession]);

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) throw new Error("usePlayer must be used within PlayerProvider");
  return context;
}
