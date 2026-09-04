import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Modal,
  BackHandler,
  I18nManager,
  Alert,
  PanResponder,
  LayoutChangeEvent,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import * as Sharing from "expo-sharing";
import { colors, formatDuration } from "@/components/remo-ui";
import { ScreenContainer } from "@/components/screen-container";
import { usePlayer } from "@/lib/player-context";
import { resolveAudioProgressSeek } from "@/lib/audio-progress";

export default function AudioPlayerScreen() {
  const router = useRouter();
  const { folderPath } = useLocalSearchParams<{ folderPath?: string }>();
  const musicLibraryRoute = folderPath ? `/(tabs)/music?folderPath=${encodeURIComponent(folderPath)}` : "/(tabs)/music";
  const {
    currentItem,
    isPlaying,
    currentTime,
    duration,
    togglePlayback,
    seekTo,
    playNext,
    playPrevious,
    stop,
    repeatMode,
    toggleRepeat,
    shuffle,
    toggleShuffle,
    playbackQueue,
  } = usePlayer();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubbingTime, setScrubbingTime] = useState(0);
  const [discShape, setDiscShape] = useState<"circle" | "square">("circle");
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);
  const [progressBarWidth, setProgressBarWidth] = useState(0);
  const sleepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Current track index in queue
  const currentIndex = useMemo(() => {
    if (!currentItem || !playbackQueue.length) return -1;
    return playbackQueue.findIndex((item) => item.uri === currentItem.uri);
  }, [currentItem, playbackQueue]);

  const hasPrevious = currentIndex > 0 || repeatMode === "all" || shuffle;
  const hasNext = (currentIndex >= 0 && currentIndex < playbackQueue.length - 1) || repeatMode === "all" || shuffle;

  const exitAudio = useCallback(() => {
    if (menuOpen) {
      setMenuOpen(false);
      return;
    }
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(musicLibraryRoute as never);
    }
  }, [menuOpen, router, musicLibraryRoute]);

  // Android hardware back handler integrated with sequential exit
  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      exitAudio();
      return true;
    });
    return () => backHandler.remove();
  }, [exitAudio]);

  // Sleep timer manager
  useEffect(() => {
    if (sleepTimer === null || sleepTimer <= 0) return;

    sleepTimerRef.current = setTimeout(() => {
      setSleepTimer((prev) => {
        if (prev === null || prev <= 1) {
          stop();
          Alert.alert("مؤقت النوم", "تم إيقاف التشغيل تلقائياً بواسطة مؤقت النوم.");
          return null;
        }
        return prev - 1;
      });
    }, 60000);

    return () => {
      if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    };
  }, [sleepTimer, stop]);

  const seekFromGesture = useCallback(
    (locationX: number, isFinal = false) => {
      const targetTime = resolveAudioProgressSeek(locationX, progressBarWidth, duration);
      if (targetTime !== null) {
        setScrubbingTime(targetTime);
        setIsScrubbing(true);
        if (isFinal) {
          setIsScrubbing(false);
          seekTo(targetTime);
        }
      }
    },
    [progressBarWidth, duration, seekTo]
  );

  const progressResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
          seekFromGesture(evt.nativeEvent.locationX, false);
        },
        onPanResponderMove: (evt) => {
          seekFromGesture(evt.nativeEvent.locationX, false);
        },
        onPanResponderRelease: (evt) => {
          seekFromGesture(evt.nativeEvent.locationX, true);
        },
        onPanResponderTerminate: (evt) => {
          seekFromGesture(evt.nativeEvent.locationX, true);
        },
      }),
    [seekFromGesture]
  );

  const onProgressBarLayout = (event: LayoutChangeEvent) => {
    setProgressBarWidth(event.nativeEvent.layout.width);
  };

  const shareTrack = async () => {
    if (!currentItem?.uri) return;
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(currentItem.uri, {
          dialogTitle: `مشاركة ${currentItem.title || "المسار"}`,
          mimeType: "audio/*",
        });
      } else {
        Alert.alert("المشاركة غير متاحة", "لا يمكن المشاركة على هذا الجهاز.");
      }
    } catch {
      Alert.alert("تعذرت المشاركة", "حدث خطأ أثناء محاولة المشاركة.");
    }
  };

  const openEqualizer = () => {
    setMenuOpen(false);
    router.push("/player/equalizer");
  };

  const chooseSleep = (minutes: number) => {
    setSleepTimer(minutes);
    setMenuOpen(false);
    Alert.alert("مؤقت النوم", `تم ضبط مؤقت النوم على ${minutes} دقيقة`);
  };

  const cancelSleep = () => {
    setSleepTimer(null);
    if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    setMenuOpen(false);
    Alert.alert("مؤقت النوم", "تم إلغاء مؤقت النوم");
  };

  if (!currentItem) {
    return (
      <ScreenContainer>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>لا يوجد مقطع صوتي قيد التشغيل حالياً.</Text>
          <Pressable onPress={() => router.push("/(tabs)/music")} style={styles.backButton}>
            <Text style={styles.backButtonText}>الذهاب للمكتبة الموسيقية</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  const effectiveTime = isScrubbing ? scrubbingTime : currentTime;
  const progressPercent = duration > 0 ? Math.min(100, (effectiveTime / duration) * 100) : 0;

  return (
    <ScreenContainer>
      <LinearGradient
        colors={["#0B1119", "#131C26", "#1A2532"]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header - Back button on left, shape toggle & menu on right */}
        <View style={styles.header}>
          <Pressable onPress={exitAudio} style={styles.headerIcon} accessibilityLabel="رجوع">
            <MaterialIcons name="arrow-forward" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>
            مشغل الموسيقى
          </Text>
          <View style={styles.headerRightActions}>
            <Pressable onPress={() => setDiscShape(s => s === "circle" ? "square" : "circle")} style={styles.headerIcon} accessibilityLabel="تبديل شكل الغلاف">
              <MaterialIcons name={discShape === "circle" ? "crop-square" : "radio-button-unchecked"} size={22} color={colors.text} />
            </Pressable>
            <Pressable onPress={() => setMenuOpen(true)} style={styles.headerIcon} accessibilityLabel="خيارات القائمة">
              <MaterialIcons name="more-vert" size={24} color={colors.text} />
            </Pressable>
          </View>
        </View>

        <View style={styles.body}>
          {/* Disc Art */}
          <View style={styles.discWrap}>
            {currentItem.thumbnailUri ? (
              <Image
                source={{ uri: currentItem.thumbnailUri }}
                style={[styles.discImage, { borderRadius: discShape === "circle" ? 140 : 24 }]}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.discFallback, discShape === "circle" ? styles.discCircle : styles.discSquare]}>
                <MaterialIcons name="music-note" size={72} color={colors.cyan} />
              </View>
            )}
          </View>

          {/* Title & Artist */}
          <View style={styles.metaRow}>
            <Text style={styles.title} numberOfLines={2}>
              {currentItem.title || "بدون عنوان"}
            </Text>
            <Text style={styles.artist} numberOfLines={1}>
              {currentItem.artist || "فنان غير معروف"}
            </Text>
            {currentItem.album ? (
              <Text style={styles.album} numberOfLines={1}>
                {currentItem.album}
              </Text>
            ) : null}
          </View>

          {/* Progress Bar & Timestamps */}
          <View style={styles.progressSection}>
            <View
              style={styles.progressTouch}
              onLayout={onProgressBarLayout}
              {...progressResponder.panHandlers}
            >
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
                <View style={[styles.progressThumb, { left: `${progressPercent}%` }]} />
              </View>
            </View>

            <View style={styles.timeRow}>
              <Text style={styles.timeText}>{formatDuration(currentTime)}</Text>
              <Text style={styles.timeText}>{formatDuration(duration)}</Text>
            </View>
          </View>

          {/* Secondary Controls: Repeat & Shuffle */}
          <View style={styles.secondaryControls}>
            <Pressable onPress={toggleRepeat} style={styles.subControlButton}>
              <MaterialIcons
                name={repeatMode === "one" ? "repeat-one" : "repeat"}
                size={24}
                color={repeatMode !== "off" ? colors.cyan : colors.muted}
              />
            </Pressable>

            <Pressable onPress={openEqualizer} style={styles.subControlButton}>
              <MaterialIcons name="equalizer" size={24} color={colors.muted} />
            </Pressable>

            <Pressable onPress={toggleShuffle} style={styles.subControlButton}>
              <MaterialIcons
                name="shuffle"
                size={24}
                color={shuffle ? colors.cyan : colors.muted}
              />
            </Pressable>
          </View>

          {/* Primary Controls: Previous, Play/Pause, Next */}
          <View style={styles.primaryControls}>
            <Pressable
              onPress={() => playPrevious()}
              style={styles.controlButton}
              disabled={!hasPrevious}
            >
              <MaterialIcons
                name="skip-previous"
                size={42}
                color={!hasPrevious ? "rgba(255,255,255,0.25)" : colors.text}
              />
            </Pressable>

            <Pressable onPress={togglePlayback} style={styles.playButton}>
              <MaterialIcons
                name={isPlaying ? "pause" : "play-arrow"}
                size={44}
                color="#04121F"
              />
            </Pressable>

            <Pressable
              onPress={() => playNext()}
              style={styles.controlButton}
              disabled={!hasNext}
            >
              <MaterialIcons
                name="skip-next"
                size={42}
                color={!hasNext ? "rgba(255,255,255,0.25)" : colors.text}
              />
            </Pressable>
          </View>

          {/* Sleep Timer Indicator */}
          {sleepTimer !== null && (
            <Pressable onPress={() => setMenuOpen(true)} style={styles.sleepIndicator}>
              <MaterialIcons name="timer" size={16} color={colors.cyan} />
              <Text style={styles.sleepText}>إيقاف التشغيل بعد {sleepTimer} دقيقة</Text>
            </Pressable>
          )}
        </View>
      </LinearGradient>

      {/* Options Menu Modal */}
      <PlayerMenu
        visible={menuOpen}
        sleepTimer={sleepTimer}
        onClose={() => setMenuOpen(false)}
        onEdit={() => {
          setMenuOpen(false);
          router.push("/player/edit-audio");
        }}
        onLyrics={() => {
          setMenuOpen(false);
          router.push("/player/lyrics");
        }}
        onShare={() => {
          setMenuOpen(false);
          shareTrack();
        }}
        onEqualizer={openEqualizer}
        onSleep={chooseSleep}
        onCancelSleep={cancelSleep}
      />
    </ScreenContainer>
  );
}

function PlayerMenu({
  visible,
  sleepTimer,
  onClose,
  onEdit,
  onLyrics,
  onShare,
  onEqualizer,
  onSleep,
  onCancelSleep,
}: {
  visible: boolean;
  sleepTimer: number | null;
  onClose: () => void;
  onEdit: () => void;
  onLyrics: () => void;
  onShare: () => void;
  onEqualizer: () => void;
  onSleep: (minutes: number) => void;
  onCancelSleep: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>خيارات المسار الصوتي</Text>

          <MenuAction icon="edit" label="تعديل بيانات المسار والغلاف" onPress={onEdit} />
          <MenuAction icon="lyrics" label="عرض كلمات الأغنية" onPress={onLyrics} />
          <MenuAction icon="equalizer" label="المعادل والمؤثرات الصوتية" onPress={onEqualizer} />
          <MenuAction icon="share" label="مشاركة المسار" onPress={onShare} />

          <View style={styles.sleepSection}>
            <View style={styles.sleepSectionHeader}>
              <Text style={styles.sleepLabel}>مؤقت النوم</Text>
              {sleepTimer !== null && (
                <Pressable onPress={onCancelSleep}>
                  <Text style={styles.cancelSleepText}>إلغاء المؤقت</Text>
                </Pressable>
              )}
            </View>
            <View style={styles.sleepOptions}>
              {[5, 15, 30, 45, 60].map((minutes) => (
                <Pressable
                  key={minutes}
                  onPress={() => onSleep(minutes)}
                  style={[
                    styles.sleepOption,
                    sleepTimer === minutes && styles.sleepOptionActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.sleepOptionText,
                      sleepTimer === minutes && styles.sleepOptionTextActive,
                    ]}
                  >
                    {minutes} د
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>إغلاق</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

function MenuAction({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.menuAction, pressed && styles.dimmed]}
    >
      <MaterialIcons name={icon} size={22} color={colors.cyan} />
      <Text style={styles.menuLabel}>{label}</Text>
      <MaterialIcons name="chevron-left" size={20} color={colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerRightActions: { flexDirection: "row-reverse", alignItems: "center", gap: 4 },
  discCircle: { borderRadius: 140 },
  discSquare: { borderRadius: 24 },
  scrubbingTooltip: { position: "absolute", top: -38, transform: [{ translateX: "-50%" }], backgroundColor: "rgba(15, 23, 42, 0.95)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.25)", zIndex: 40 },
  scrubbingTooltipText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  gradient: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  errorText: {
    color: colors.text,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 24,
  },
  backButton: {
    backgroundColor: colors.cyan,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  backButtonText: {
    color: "#04121F",
    fontWeight: "bold",
    fontSize: 15,
  },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerIcon: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "600",
  },
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
  },
  discWrap: {
    width: 230,
    height: 230,
    borderRadius: 115,
    overflow: "hidden",
    backgroundColor: "#16202C",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 3,
    borderColor: "rgba(117, 230, 218, 0.25)",
  },
  discImage: {
    width: "100%",
    height: "100%",
  },
  discFallback: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111822",
  },
  metaRow: {
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 16,
    marginTop: 8,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  artist: {
    color: colors.cyan,
    fontSize: 15,
    marginTop: 6,
    textAlign: "center",
  },
  album: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 3,
    textAlign: "center",
  },
  progressSection: {
    width: "100%",
    marginTop: 8,
  },
  progressTouch: {
    width: "100%",
    height: 36,
    justifyContent: "center",
  },
  progressTrack: {
    width: "100%",
    height: 5,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 3,
    position: "relative",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.cyan,
    borderRadius: 3,
  },
  progressThumb: {
    position: "absolute",
    top: -6,
    width: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: "#FFFFFF",
    marginLeft: -8.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
    paddingHorizontal: 2,
  },
  timeText: {
    color: colors.muted,
    fontSize: 12,
    fontVariant: ["tabular-nums"],
  },
  secondaryControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "70%",
    marginTop: 4,
  },
  subControlButton: {
    padding: 10,
    borderRadius: 20,
  },
  primaryControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 32,
    marginTop: 8,
  },
  controlButton: {
    padding: 10,
  },
  playButton: {
    backgroundColor: colors.cyan,
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.cyan,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 10,
  },
  sleepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    backgroundColor: "rgba(117, 230, 218, 0.12)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(117, 230, 218, 0.2)",
  },
  sleepText: {
    color: colors.cyan,
    fontSize: 12,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#16202C",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  sheetTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  menuAction: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  menuLabel: {
    color: colors.text,
    fontSize: 15,
    flex: 1,
    textAlign: "right",
  },
  sleepSection: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  sleepSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sleepLabel: {
    color: colors.muted,
    fontSize: 14,
  },
  cancelSleepText: {
    color: "#FF6B6B",
    fontSize: 13,
  },
  sleepOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  sleepOption: {
    flex: 1,
    backgroundColor: "#0D141E",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  sleepOptionActive: {
    backgroundColor: "rgba(117, 230, 218, 0.15)",
    borderColor: colors.cyan,
  },
  sleepOptionText: {
    color: colors.text,
    fontSize: 13,
  },
  sleepOptionTextActive: {
    color: colors.cyan,
    fontWeight: "bold",
  },
  closeButton: {
    marginTop: 18,
    backgroundColor: "#0D141E",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  closeButtonText: {
    color: colors.muted,
    fontSize: 15,
  },
  dimmed: {
    opacity: 0.6,
  },
});
