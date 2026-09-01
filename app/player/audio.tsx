import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Modal,
  Dimensions,
  BackHandler,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useMediaSession } from "@/hooks/useMediaSession";
import { usePlayerStore } from "@/store/player";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRef, useState, useEffect, useCallback } from "react";
import { PanResponder } from "react-native";
import { colors } from "@/constants/colors";
import { ScreenContainer } from "@/components/ScreenContainer";

const { width } = Dimensions.get("window");

export default function AudioPlayerScreen() {
  const router = useRouter();
  const {
    currentItem,
    isPlaying,
    progress,
    duration,
    togglePlayPause,
    seekTo,
    closeMediaSession,
    loadTrack,
    currentIndex,
    playlist,
  } = useMediaSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);
  const progressRef = useRef(0);

  const goBackToMusic = () => {
    router.push("/(tabs)/music");
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (menuOpen) {
          setMenuOpen(false);
          return true;
        }
        closeMediaSession();
        router.back();
        return true;
      }
    );
    return () => backHandler.remove();
  }, [menuOpen, closeMediaSession, router]);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (sleepTimer !== null && sleepTimer > 0) {
      timer = setTimeout(() => {
        setSleepTimer((prev) => (prev !== null ? prev - 1 : null));
        if (sleepTimer === 1) {
          closeMediaSession();
          setSleepTimer(null);
          Alert.alert("مؤقت النوم", "تم إيقاف التشغيل تلقائياً.");
        }
      }, 60000);
    }
    return () => clearTimeout(timer);
  }, [sleepTimer, closeMediaSession]);

  const progressResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {},
    onPanResponderMove: (evt, gestureState) => {
      const newProgress = Math.min(
        Math.max(gestureState.dx / (width - 40), 0),
        1
      );
      seekTo(newProgress * duration);
    },
    onPanResponderRelease: () => {},
  });

  const shareTrack = () => {
    Alert.alert("مشاركة", "سيتم فتح واجهة المشاركة");
  };

  const openEqualizer = () => {
    router.push("/player/equalizer");
  };

  const chooseSleep = (minutes: number) => {
    setSleepTimer(minutes);
    setMenuOpen(false);
    Alert.alert(`تم ضبط مؤقت النوم على ${minutes} دقيقة`);
  };

  if (!currentItem || currentItem.mediaType !== "audio") {
    return (
      <ScreenContainer>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>اختر مساراً من مكتبتك أولاً.</Text>
          <Pressable onPress={goBackToMusic} style={styles.backButton}>
            <Text style={styles.backButtonText}>العودة للمكتبة</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <LinearGradient
        colors={["#0B1119", "#1A2532"]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <Pressable onPress={closeMediaSession} style={styles.headerIcon}>
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Pressable onPress={() => setMenuOpen(true)} style={styles.headerIcon}>
            <MaterialIcons name="more-vert" size={24} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.body}>
          <View style={styles.discWrap}>
            {currentItem.thumbnailUri ? (
              <Image
                source={{ uri: currentItem.thumbnailUri }}
                style={styles.discImage}
              />
            ) : (
              <View style={styles.discFallback}>
                <MaterialIcons name="music-note" size={64} color={colors.muted} />
              </View>
            )}
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.title}>{currentItem.title || "بدون عنوان"}</Text>
            <Text style={styles.artist}>
              {currentItem.artist || "فنان غير معروف"}
            </Text>
            <Text style={styles.album}>
              {currentItem.album || "بدون ألبوم"}
            </Text>
          </View>

          <View style={styles.progressTouch} {...progressResponder.panHandlers}>
            <View style={styles.progressTrack}>
              <View
                style={[styles.progressFill, { width: `${(progress / duration) * 100}%` }]}
              />
              <View
                style={[styles.progressThumb, { left: `${(progress / duration) * 100}%` }]}
              />
            </View>
          </View>

          <View style={styles.primaryControls}>
            <Pressable
              onPress={() => {
                const prev = playlist[currentIndex - 1];
                if (prev) loadTrack(prev);
              }}
              style={styles.controlButton}
            >
              <MaterialIcons name="skip-previous" size={36} color={colors.text} />
            </Pressable>

            <Pressable onPress={togglePlayPause} style={styles.playButton}>
              <MaterialIcons
                name={isPlaying ? "pause" : "play-arrow"}
                size={48}
                color="#fff"
              />
            </Pressable>

            <Pressable
              onPress={() => {
                const next = playlist[currentIndex + 1];
                if (next) loadTrack(next);
              }}
              style={styles.controlButton}
            >
              <MaterialIcons name="skip-next" size={36} color={colors.text} />
            </Pressable>
          </View>

          {sleepTimer !== null && (
            <View style={styles.sleepIndicator}>
              <Text style={styles.sleepText}>
                النوم بعد {sleepTimer} دقيقة
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>

      <PlayerMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        onEdit={() => router.push("/player/edit-audio")}
        onLyrics={() => router.push("/player/lyrics")}
        onShare={shareTrack}
        onEqualizer={openEqualizer}
        onSleep={chooseSleep}
      />
    </ScreenContainer>
  );
}

function PlayerMenu({
  visible,
  onClose,
  onEdit,
  onLyrics,
  onShare,
  onEqualizer,
  onSleep,
}) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>خيارات المسار</Text>

          <MenuAction icon="edit" label="تعديل" onPress={onEdit} />
          <MenuAction icon="lyrics" label="الكلمات" onPress={onLyrics} />
          <MenuAction icon="share" label="مشاركة" onPress={onShare} />
          <MenuAction icon="equalizer" label="المؤثرات" onPress={onEqualizer} />

          <View style={styles.sleepSection}>
            <Text style={styles.sleepLabel}>مؤقت النوم</Text>
            <View style={styles.sleepOptions}>
              {[5, 15, 30].map((minutes) => (
                <Pressable
                  key={minutes}
                  onPress={() => onSleep(minutes)}
                  style={styles.sleepOption}
                >
                  <Text style={styles.sleepOptionText}>{minutes} د</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>إلغاء</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

function MenuAction({ icon, label, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.menuAction, pressed && styles.dimmed]}
    >
      <MaterialIcons name={icon} size={24} color={colors.text} />
      <Text style={styles.menuLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    color: colors.text,
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: colors.cyan,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerIcon: {
    padding: 8,
  },
  body: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  discWrap: {
    width: 240,
    height: 240,
    borderRadius: 120,
    overflow: "hidden",
    marginBottom: 32,
    backgroundColor: "#2A3542",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
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
  },
  metaRow: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },
  artist: {
    color: colors.muted,
    fontSize: 16,
    marginTop: 4,
    textAlign: "center",
  },
  album: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 2,
    textAlign: "center",
  },
  progressTouch: {
    width: "100%",
    height: 40,
    justifyContent: "center",
    marginBottom: 24,
  },
  progressTrack: {
    width: "100%",
    height: 4,
    backgroundColor: "#3A4A5A",
    borderRadius: 2,
    position: "relative",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.cyan,
    borderRadius: 2,
  },
  progressThumb: {
    position: "absolute",
    top: -8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.cyan,
    marginLeft: -8,
  },
  primaryControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    marginTop: 8,
  },
  controlButton: {
    padding: 8,
  },
  playButton: {
    backgroundColor: colors.cyan,
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.cyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  sleepIndicator: {
    marginTop: 20,
    backgroundColor: "#2A3542",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  sleepText: {
    color: colors.text,
    fontSize: 14,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#1A2532",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
  },
  sheetTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  menuAction: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2A3542",
  },
  menuLabel: {
    color: colors.text,
    fontSize: 16,
  },
  sleepSection: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#2A3542",
    paddingTop: 16,
  },
  sleepLabel: {
    color: colors.muted,
    fontSize: 14,
    marginBottom: 8,
  },
  sleepOptions: {
    flexDirection: "row",
    gap: 12,
  },
  sleepOption: {
    backgroundColor: "#2A3542",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  sleepOptionText: {
    color: colors.text,
    fontSize: 14,
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: "#2A3542",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: {
    color: colors.text,
    fontSize: 16,
  },
  dimmed: {
    opacity: 0.6,
  },
});
