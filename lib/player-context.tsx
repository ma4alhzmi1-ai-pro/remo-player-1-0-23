import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from "expo-audio";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Alert, Platform } from "react-native";

import type { MediaItem } from "@/types/media";

type RepeatMode = "off" | "one";

type PlayerContextValue = {
  currentItem: MediaItem | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  speed: number;
  repeatMode: RepeatMode;
  shuffle: boolean;
  playItem: (item: MediaItem) => Promise<void>;
  setCurrentItem: (item: MediaItem | null) => void;
  togglePlayback: () => void;
  seekTo: (seconds: number) => Promise<void>;
  skipBy: (seconds: number) => Promise<void>;
  setSpeed: (speed: number) => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  stop: () => void;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const playerRef = useRef<AudioPlayer | null>(null);
  const statusSubscriptionRef = useRef<{ remove: () => void } | null>(null);
  const [currentItem, setCurrentItem] = useState<MediaItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeedState] = useState(1);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");
  const [shuffle, setShuffle] = useState(false);

  useEffect(() => {
    void setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: Platform.OS !== "web",
      interruptionModeAndroid: "duckOthers",
    });
    return () => {
      statusSubscriptionRef.current?.remove();
      playerRef.current?.remove();
    };
  }, []);

  const attachStatusListener = useCallback((player: AudioPlayer) => {
    statusSubscriptionRef.current?.remove();
    statusSubscriptionRef.current = player.addListener("playbackStatusUpdate", (status) => {
      setIsPlaying(status.playing);
      setCurrentTime(status.currentTime || 0);
      setDuration(status.duration || 0);
      if (status.didJustFinish && !player.loop) setIsPlaying(false);
    });
  }, []);

  const playItem = useCallback(async (item: MediaItem) => {
    if (item.mediaType === "video") {
      setCurrentItem(item);
      return;
    }
    try {
      let player = playerRef.current;
      if (!player) {
        player = createAudioPlayer({ uri: item.uri }, { updateInterval: 300 });
        playerRef.current = player;
        attachStatusListener(player);
      } else {
        player.replace({ uri: item.uri });
      }
      player.loop = repeatMode === "one";
      player.setPlaybackRate(speed);
      player.setActiveForLockScreen(true, {
        title: item.title,
        artist: item.artist,
        albumTitle: item.album,
      });
      setCurrentItem(item);
      setCurrentTime(0);
      setDuration(item.duration);
      player.play();
      setIsPlaying(true);
    } catch {
      Alert.alert("تعذّر تشغيل الملف", "تحقق من أن الملف ما زال متاحاً على جهازك ثم حاول مرة أخرى.");
    }
  }, [attachStatusListener, repeatMode, speed]);

  const togglePlayback = useCallback(() => {
    const player = playerRef.current;
    if (!player || !currentItem || currentItem.mediaType === "video") return;
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

  const setSpeed = useCallback((nextSpeed: number) => {
    const safeSpeed = Math.max(0.5, Math.min(nextSpeed, 2));
    playerRef.current?.setPlaybackRate(safeSpeed);
    setSpeedState(safeSpeed);
  }, []);

  const toggleRepeat = useCallback(() => {
    setRepeatMode((current) => {
      const next = current === "off" ? "one" : "off";
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

  const value = useMemo<PlayerContextValue>(() => ({
    currentItem,
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
    setSpeed,
    toggleRepeat,
    toggleShuffle,
    stop,
  }), [currentItem, isPlaying, currentTime, duration, speed, repeatMode, shuffle, playItem, togglePlayback, seekTo, skipBy, setSpeed, toggleRepeat, toggleShuffle, stop]);

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) throw new Error("usePlayer must be used within PlayerProvider");
  return context;
}
