import {
  View,
  Text,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Modal,
  BackHandler,
  Alert,
  PanResponder,
  LayoutChangeEvent,
  ScrollView,
  TextInput,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import * as Sharing from "expo-sharing";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";

import { colors, formatDuration } from "@/components/remo-ui";
import { ScreenContainer } from "@/components/screen-container";
import { usePlayer } from "@/lib/player-context";
import { useLibrary } from "@/lib/library-context";
import {
  getStoredPlayerTheme,
  savePlayerThemeId,
  saveCustomPlayerBg,
  pickPlayerBackgroundImage,
  PRESET_THEMES,
  type PlayerThemePreset,
} from "@/lib/player-theme";

export default function AudioPlayerScreen() {
  const router = useRouter();
  const { folderPath } = useLocalSearchParams<{ folderPath?: string }>();
  const musicLibraryRoute = folderPath
    ? `/(tabs)/music?folderPath=${encodeURIComponent(folderPath)}`
    : "/(tabs)/music";

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

  const { playlists, addItemToPlaylist, createPlaylist, updateMediaItem } = useLibrary();

  // Dialog / Menu States
  const [popupMenuVisible, setPopupMenuVisible] = useState(false);
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [sleepModalVisible, setSleepModalVisible] = useState(false);
  const [playlistModalVisible, setPlaylistModalVisible] = useState(false);
  const [lyricsModalVisible, setLyricsModalVisible] = useState(false);
  const [propertiesModalVisible, setPropertiesModalVisible] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [editedLyrics, setEditedLyrics] = useState("");
  const [fileDetails, setFileDetails] = useState<{ sizeStr: string; path: string }>({
    sizeStr: "جارِ الحساب...",
    path: "",
  });

  // Theme & Background States
  const [activeThemeId, setActiveThemeId] = useState<string>("anime-violet");
  const [customBgUri, setCustomBgUri] = useState<string | null>(null);

  // Scrubber & Sleep States
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubbingTime, setScrubbingTime] = useState(0);
  const [showLyricsOnDisc, setShowLyricsOnDisc] = useState(false);
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);
  const [progressBarWidth, setProgressBarWidth] = useState(0);
  const progressBarRef = useRef<View>(null);
  const progressLayout = useRef({ pageX: 0, width: 0 });
  const sleepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load saved theme and custom background on mount
  useEffect(() => {
    void getStoredPlayerTheme().then(({ themeId, customImageUri }) => {
      setActiveThemeId(themeId);
      setCustomBgUri(customImageUri);
    });
  }, []);

  const activeThemePreset: PlayerThemePreset = useMemo(() => {
    return (
      PRESET_THEMES.find((theme) => theme.id === activeThemeId) ?? PRESET_THEMES[0]
    );
  }, [activeThemeId]);

  const effectiveBgUri = useMemo(() => {
    if (customBgUri) return customBgUri;
    return activeThemePreset.imageUri ?? null;
  }, [customBgUri, activeThemePreset]);

  // Track Index in Playback Queue
  const currentIndex = useMemo(() => {
    if (!currentItem || !playbackQueue.length) return -1;
    return playbackQueue.findIndex((item) => item.uri === currentItem.uri);
  }, [currentItem, playbackQueue]);

  const hasPrevious = currentIndex > 0 || repeatMode === "all" || shuffle;
  const hasNext =
    (currentIndex >= 0 && currentIndex < playbackQueue.length - 1) ||
    repeatMode === "all" ||
    shuffle;

  const isFavorite = Boolean(currentItem?.isFavorite);

  const exitAudio = useCallback(() => {
    if (popupMenuVisible) {
      setPopupMenuVisible(false);
      return;
    }
    if (themeModalVisible) {
      setThemeModalVisible(false);
      return;
    }
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(musicLibraryRoute as never);
    }
  }, [popupMenuVisible, themeModalVisible, router, musicLibraryRoute]);

  // Android hardware back handler
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

  // Progress Bar Layout & Scrubber Gesture
  const updateProgressLayout = useCallback(() => {
    progressBarRef.current?.measure((_x, _y, width, _height, pageX) => {
      if (width > 0) {
        progressLayout.current = { pageX, width };
        setProgressBarWidth(width);
      }
    });
  }, []);

  const seekFromGesture = useCallback(
    (pageX: number, isFinal = false) => {
      if (!duration || duration <= 0) return;
      const { pageX: barX, width: barW } = progressLayout.current;
      const effectiveWidth = barW > 0 ? barW : progressBarWidth;
      if (effectiveWidth <= 0) return;

      let ratio = 0;
      if (barX > 0 && Number.isFinite(pageX)) {
        ratio = Math.max(0, Math.min(1, (pageX - barX) / effectiveWidth));
      } else {
        return;
      }

      const targetTime = ratio * duration;
      setScrubbingTime(targetTime);
      setIsScrubbing(true);
      if (isFinal) {
        setIsScrubbing(false);
        seekTo(targetTime);
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
          updateProgressLayout();
          seekFromGesture(evt.nativeEvent.pageX, false);
        },
        onPanResponderMove: (evt) => {
          seekFromGesture(evt.nativeEvent.pageX, false);
        },
        onPanResponderRelease: (evt) => {
          seekFromGesture(evt.nativeEvent.pageX, true);
        },
        onPanResponderTerminate: (evt) => {
          seekFromGesture(evt.nativeEvent.pageX, true);
        },
      }),
    [seekFromGesture, updateProgressLayout]
  );

  const onProgressBarLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    if (width > 0) {
      setProgressBarWidth(width);
      progressLayout.current.width = width;
    }
    updateProgressLayout();
  };

  // Jump forwards or backwards 10 seconds
  const seekRelative = (secondsDelta: number) => {
    if (!duration || duration <= 0) return;
    const current = isScrubbing ? scrubbingTime : currentTime;
    const target = Math.max(0, Math.min(duration, current + secondsDelta));
    seekTo(target);
  };

  // Share track
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

  // Toggle Favorite
  const handleToggleFavorite = async () => {
    if (!currentItem) return;
    const nextState = !isFavorite;
    await updateMediaItem(currentItem.id, { isFavorite: nextState });
    Alert.alert(
      nextState ? "أُضيفت إلى المفضلة" : "أُزيلت من المفضلة",
      nextState ? "تمت إضافة الأغنية إلى قائمة المفضلة بنجاح." : "تمت إزالة الأغنية من المفضلة."
    );
  };

  // Change Album Artwork
  const handleChangeCoverArt = async () => {
    if (!currentItem) return;
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("إذن الوصول", "يرجى منح الإذن للوصول للصور لتغيير صورة الغلاف.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });
      if (result.canceled || !result.assets || result.assets.length === 0) return;
      const pickedUri = result.assets[0].uri;
      await updateMediaItem(currentItem.id, { thumbnailUri: pickedUri });
      Alert.alert("تم تغيير الغلاف", "تم تحديث صورة الغلاف بنجاح.");
    } catch {
      Alert.alert("خطأ", "تعذر تغيير صورة الغلاف.");
    }
  };

  // Use as Ringtone
  const handleSetAsRingtone = () => {
    Alert.alert(
      "استخدام كنغمة رنين",
      `يمكنك استخدام "${currentItem?.title || "الأغنية"}" كنغمة رنين لهاتفك:\n\n1. اذهب إلى إعدادات الهاتف > الأصوات والاهتزاز > نغمة الرنين.\n2. اختر إضافة نغمة مخصصة وحدد هذا الملف.\nمسار الملف:\n${currentItem?.uri || ""}`,
      [{ text: "حسناً" }]
    );
  };

  // Open Properties Dialog
  const handleOpenProperties = async () => {
    if (!currentItem) return;
    let sizeStr = "غير متاح";
    const path = currentItem.uri || "";
    try {
      if (path.startsWith("file://")) {
        const info = await FileSystem.getInfoAsync(path);
        if (info.exists && info.size) {
          sizeStr = `${(info.size / (1024 * 1024)).toFixed(2)} ميجابايت`;
        }
      }
    } catch {
      // Ignore
    }
    setFileDetails({ sizeStr, path });
    setPropertiesModalVisible(true);
  };

  // Pick Custom Background from Device Gallery
  const handlePickCustomBackground = async () => {
    const pickedUri = await pickPlayerBackgroundImage();
    if (pickedUri) {
      setCustomBgUri(pickedUri);
      setActiveThemeId("custom");
      setThemeModalVisible(false);
      Alert.alert("تم تعيين الثيم", "تم ضبط صورتك الخاصة كخلفية لمشغل الموسيقى بنجاح.");
    }
  };

  // Select Preset Theme
  const handleSelectPresetTheme = async (presetId: string) => {
    setActiveThemeId(presetId);
    setCustomBgUri(null);
    await saveCustomPlayerBg(null);
    await savePlayerThemeId(presetId);
    setThemeModalVisible(false);
  };

  // Save Edited Lyrics
  const handleSaveLyrics = async () => {
    if (!currentItem) return;
    await updateMediaItem(currentItem.id, { lyrics: editedLyrics.trim() });
    setLyricsModalVisible(false);
    Alert.alert("تم الحفظ", "تم حفظ الكلمات بنجاح.");
  };

  // Add Track to Selected Playlist
  const handleAddToPlaylist = async (playlistId: string) => {
    if (!currentItem) return;
    await addItemToPlaylist(playlistId, currentItem.id);
    setPlaylistModalVisible(false);
    Alert.alert("تمت الإضافة", "تمت إضافة الأغنية إلى قائمة التشغيل بنجاح.");
  };

  // Create New Playlist & Add
  const handleCreateNewPlaylist = async () => {
    if (!newPlaylistName.trim() || !currentItem) return;
    const created = await createPlaylist(newPlaylistName.trim());
    if (created) {
      await addItemToPlaylist(created.id, currentItem.id);
      setNewPlaylistName("");
      setPlaylistModalVisible(false);
      Alert.alert("تمت الإضافة", `تم إنشاء قائمة "${created.name}" وإضافة الأغنية إليها.`);
    }
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
      <View style={styles.container}>
        {/* Background Image or Gradient */}
        {effectiveBgUri ? (
          <ImageBackground
            source={{ uri: effectiveBgUri }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          >
            {/* Deep translucent overlay veil matching the screenshot */}
            <LinearGradient
              colors={["rgba(10, 2, 25, 0.45)", "rgba(18, 5, 36, 0.82)", "rgba(10, 1, 20, 0.96)"]}
              style={StyleSheet.absoluteFillObject}
            />
          </ImageBackground>
        ) : (
          <LinearGradient
            colors={activeThemePreset.gradientColors}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        )}

        {/* Top Header Bar */}
        <View style={styles.topHeader}>
          {/* Left Action Buttons */}
          <View style={styles.headerLeftIcons}>
            {/* 3 Vertical Dots (Popup Menu) */}
            <Pressable
              onPress={() => setPopupMenuVisible(true)}
              style={({ pressed }) => [styles.topIconButton, pressed && styles.pressedIcon]}
              accessibilityLabel="خيارات إضافية"
            >
              <MaterialIcons name="more-vert" size={24} color="#FFFFFF" />
            </Pressable>

            {/* Sleep Timer */}
            <Pressable
              onPress={() => setSleepModalVisible(true)}
              style={({ pressed }) => [styles.topIconButton, pressed && styles.pressedIcon]}
              accessibilityLabel="مؤقت النوم"
            >
              <MaterialIcons
                name="schedule"
                size={22}
                color={sleepTimer !== null ? "#FF007F" : "#FFFFFF"}
              />
            </Pressable>

            {/* Settings */}
            <Pressable
              onPress={() => router.push("/(tabs)/settings")}
              style={({ pressed }) => [styles.topIconButton, pressed && styles.pressedIcon]}
              accessibilityLabel="الإعدادات"
            >
              <MaterialIcons name="settings" size={22} color="#FFFFFF" />
            </Pressable>

            {/* Theme & Wallpaper Gallery */}
            <Pressable
              onPress={() => setThemeModalVisible(true)}
              style={({ pressed }) => [styles.topIconButton, pressed && styles.pressedIcon]}
              accessibilityLabel="تغيير الثيم وخلفية المشغل"
            >
              <MaterialIcons name="image" size={22} color="#FFFFFF" />
            </Pressable>
          </View>

          {/* Right Action Button (Back Arrow) */}
          <Pressable
            onPress={exitAudio}
            style={({ pressed }) => [styles.topIconButton, pressed && styles.pressedIcon]}
            accessibilityLabel="رجوع"
          >
            <MaterialIcons name="arrow-forward" size={26} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* Floating White Popup Menu (Exact match to the user screenshot) */}
        <Modal
          visible={popupMenuVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setPopupMenuVisible(false)}
        >
          <Pressable style={styles.popupOverlay} onPress={() => setPopupMenuVisible(false)}>
            <View style={styles.popupCard} onStartShouldSetResponder={() => true}>
              {/* Item 1: إضافة إلى قائمة التشغيل */}
              <PopupMenuItem
                label="إضافة إلى قائمة التشغيل"
                iconName="add-circle-outline"
                iconColor="#E91E63"
                onPress={() => {
                  setPopupMenuVisible(false);
                  setPlaylistModalVisible(true);
                }}
              />

              {/* Item 2: إضافة إلى المفضلة */}
              <PopupMenuItem
                label={isFavorite ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
                iconName={isFavorite ? "favorite" : "favorite-border"}
                iconColor="#E91E63"
                onPress={() => {
                  setPopupMenuVisible(false);
                  void handleToggleFavorite();
                }}
              />

              {/* Item 3: تغيير صورة الغلاف */}
              <PopupMenuItem
                label="تغيير صورة الغلاف"
                iconName="local-offer"
                iconColor="#E91E63"
                onPress={() => {
                  setPopupMenuVisible(false);
                  void handleChangeCoverArt();
                }}
              />

              {/* Item 4: تحرير كلمات */}
              <PopupMenuItem
                label="تحرير كلمات"
                iconName="local-offer"
                iconColor="#E91E63"
                onPress={() => {
                  setPopupMenuVisible(false);
                  setEditedLyrics(currentItem.lyrics || "");
                  setLyricsModalVisible(true);
                }}
              />

              {/* Item 5: استخدام كنغمة رنين */}
              <PopupMenuItem
                label="استخدام كنغمة رنين"
                iconName="notifications-active"
                iconColor="#E91E63"
                onPress={() => {
                  setPopupMenuVisible(false);
                  handleSetAsRingtone();
                }}
              />

              {/* Item 6: مؤثرات صوتية */}
              <PopupMenuItem
                label="مؤثرات صوتية"
                iconName="tune"
                iconColor="#E91E63"
                onPress={() => {
                  setPopupMenuVisible(false);
                  router.push("/player/equalizer");
                }}
              />

              {/* Item 7: مشاركة */}
              <PopupMenuItem
                label="مشاركة"
                iconName="share"
                iconColor="#E91E63"
                onPress={() => {
                  setPopupMenuVisible(false);
                  void shareTrack();
                }}
              />

              {/* Item 8: الخصائص */}
              <PopupMenuItem
                label="الخصائص"
                iconName="info-outline"
                iconColor="#00BCD4"
                isLast
                onPress={() => {
                  setPopupMenuVisible(false);
                  void handleOpenProperties();
                }}
              />
            </View>
          </Pressable>
        </Modal>

        {/* Main Body */}
        <View style={styles.body}>
          {/* Circular Vinyl / Album Disc Artwork */}
          <View style={styles.discSection}>
            <Pressable
              onPress={() => setShowLyricsOnDisc((prev) => !prev)}
              style={({ pressed }) => [styles.circularDiscWrapper, pressed && { opacity: 0.95 }]}
            >
              {showLyricsOnDisc ? (
                <View style={styles.lyricsDiscContainer}>
                  <Text style={styles.lyricsDiscTitle}>كلمات الأغنية</Text>
                  <ScrollView
                    nestedScrollEnabled
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.lyricsScrollContent}
                  >
                    <Text style={styles.lyricsBodyText}>
                      {currentItem.lyrics || "لا توجد كلمات مرفقة حالياً.\nانقر على الخيارات لإضافة الكلمات."}
                    </Text>
                  </ScrollView>
                  <Text style={styles.lyricsBackHint}>انقر للعودة لصورة الغلاف</Text>
                </View>
              ) : currentItem.thumbnailUri ? (
                <Image
                  source={{ uri: currentItem.thumbnailUri }}
                  style={styles.circularDiscImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.circularDiscFallback}>
                  <View style={styles.circularDiscRingOuter} />
                  <View style={styles.circularDiscRingInner} />
                  <MaterialIcons name="music-note" size={54} color="#FFFFFF" />
                </View>
              )}
            </Pressable>

            {/* Pill Button: كلمات الأغنية (As in screenshot) */}
            <Pressable
              onPress={() => setShowLyricsOnDisc((prev) => !prev)}
              style={({ pressed }) => [styles.lyricsPillButton, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.lyricsPillText}>
                {showLyricsOnDisc ? "عرض صورة الغلاف" : "كلمات الأغنية"}
              </Text>
            </Pressable>
          </View>

          {/* Track Info Row */}
          <View style={styles.metaContainer}>
            <View style={styles.metaRow}>
              {/* Quick Add To Playlist Button (+) on the left */}
              <Pressable
                onPress={() => setPlaylistModalVisible(true)}
                style={({ pressed }) => [styles.quickActionIcon, pressed && styles.pressedIcon]}
                accessibilityLabel="إضافة لقائمة التشغيل"
              >
                <MaterialIcons name="add" size={28} color="#FFFFFF" />
              </Pressable>

              {/* Title & Artist Signature */}
              <View style={styles.metaCenter}>
                <Text style={styles.songTitle} numberOfLines={1}>
                  {currentItem.title || "Over the Horizon"}
                </Text>
                <Text style={styles.developerSignature} numberOfLines={1}>
                  {currentItem.artist || "برمجه وتطوير المطور محمد الحزمي"}
                </Text>
              </View>

              {/* Favorite Heart Button (♡/♥) on the right */}
              <Pressable
                onPress={handleToggleFavorite}
                style={({ pressed }) => [styles.quickActionIcon, pressed && styles.pressedIcon]}
                accessibilityLabel="المفضلة"
              >
                <MaterialIcons
                  name={isFavorite ? "favorite" : "favorite-border"}
                  size={26}
                  color={isFavorite ? "#FF007F" : "#FFFFFF"}
                />
              </Pressable>
            </View>
          </View>

          {/* Scrubber & Progress Bar */}
          <View style={styles.progressSection}>
            <View style={styles.timeRow}>
              {/* Current Time on the Left (RTL context) */}
              <Text style={styles.timeText}>{formatDuration(effectiveTime)}</Text>

              {/* Scrubber Line */}
              <View
                ref={progressBarRef}
                style={styles.progressTouch}
                onLayout={onProgressBarLayout}
                {...progressResponder.panHandlers}
              >
                <View style={styles.progressTrack} pointerEvents="none">
                  <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
                  <View style={[styles.progressThumb, { left: `${progressPercent}%` }]} />
                </View>
              </View>

              {/* Total Duration on the Right */}
              <Text style={styles.timeText}>{formatDuration(duration)}</Text>
            </View>
          </View>

          {/* Bottom Playback Controls Row (Exact sequence from screenshot) */}
          <View style={styles.playbackControlsRow}>
            {/* 1. Rewind 10 Seconds */}
            <Pressable
              onPress={() => seekRelative(-10)}
              style={({ pressed }) => [styles.controlSmallButton, pressed && styles.pressedIcon]}
              accessibilityLabel="ترجيع 10 ثوان"
            >
              <MaterialIcons name="replay-10" size={28} color="#FFFFFF" />
            </Pressable>

            {/* 2. Shuffle Toggle */}
            <Pressable
              onPress={toggleShuffle}
              style={({ pressed }) => [styles.controlSmallButton, pressed && styles.pressedIcon]}
              accessibilityLabel="خلط عشوائي"
            >
              <MaterialIcons
                name="shuffle"
                size={24}
                color={shuffle ? "#00F2FE" : "#FFFFFF"}
              />
            </Pressable>

            {/* 3. Previous Track */}
            <Pressable
              onPress={playPrevious}
              disabled={!hasPrevious}
              style={({ pressed }) => [
                styles.controlButton,
                !hasPrevious && { opacity: 0.35 },
                pressed && styles.pressedIcon,
              ]}
              accessibilityLabel="المسار السابق"
            >
              <MaterialIcons name="skip-previous" size={38} color="#FFFFFF" />
            </Pressable>

            {/* 4. Big Round Hot Pink Play/Pause Button */}
            <Pressable
              onPress={togglePlayback}
              style={({ pressed }) => [styles.playPauseRoundButton, pressed && { transform: [{ scale: 0.94 }] }]}
              accessibilityLabel={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
            >
              <MaterialIcons
                name={isPlaying ? "pause" : "play-arrow"}
                size={40}
                color="#FFFFFF"
              />
            </Pressable>

            {/* 5. Next Track */}
            <Pressable
              onPress={playNext}
              disabled={!hasNext}
              style={({ pressed }) => [
                styles.controlButton,
                !hasNext && { opacity: 0.35 },
                pressed && styles.pressedIcon,
              ]}
              accessibilityLabel="المسار التالي"
            >
              <MaterialIcons name="skip-next" size={38} color="#FFFFFF" />
            </Pressable>

            {/* 6. Repeat Toggle */}
            <Pressable
              onPress={toggleRepeat}
              style={({ pressed }) => [styles.controlSmallButton, pressed && styles.pressedIcon]}
              accessibilityLabel="تكرار"
            >
              <MaterialIcons
                name={repeatMode === "one" ? "repeat-one" : "repeat"}
                size={24}
                color={repeatMode !== "off" ? "#00F2FE" : "#FFFFFF"}
              />
            </Pressable>

            {/* 7. Forward 10 Seconds */}
            <Pressable
              onPress={() => seekRelative(10)}
              style={({ pressed }) => [styles.controlSmallButton, pressed && styles.pressedIcon]}
              accessibilityLabel="تقديم 10 ثوان"
            >
              <MaterialIcons name="forward-10" size={28} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        {/* Theme & Background Image Picker Modal */}
        <Modal
          visible={themeModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setThemeModalVisible(false)}
        >
          <Pressable style={styles.modalBackdrop} onPress={() => setThemeModalVisible(false)}>
            <View style={styles.themeSheet} onStartShouldSetResponder={() => true}>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>ثيم وخلفية مشغل الموسيقى</Text>
                <Pressable onPress={() => setThemeModalVisible(false)}>
                  <MaterialIcons name="close" size={24} color="#FFFFFF" />
                </Pressable>
              </View>

              {/* Prominent Custom Image Upload Button */}
              <Pressable
                onPress={() => void handlePickCustomBackground()}
                style={({ pressed }) => [styles.pickCustomImageButton, pressed && { opacity: 0.9 }]}
              >
                <LinearGradient
                  colors={["#E91E63", "#9C27B0"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.pickCustomGradient}
                >
                  <MaterialIcons name="add-photo-alternate" size={24} color="#FFFFFF" />
                  <View style={styles.pickCustomTextWrap}>
                    <Text style={styles.pickCustomTitle}>رفع صورة من الجهاز</Text>
                    <Text style={styles.pickCustomSubtitle}>
                      اضبط أي صورة من هاتفك كثيم وخلفية لمشغل الموسيقى
                    </Text>
                  </View>
                </LinearGradient>
              </Pressable>

              {/* Preset Themes List */}
              <Text style={styles.presetsLabel}>أو اختر من الثيمات الجاهزة:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetsScroll}>
                {PRESET_THEMES.map((theme) => (
                  <Pressable
                    key={theme.id}
                    onPress={() => void handleSelectPresetTheme(theme.id)}
                    style={[
                      styles.presetThemeCard,
                      activeThemeId === theme.id && !customBgUri && styles.presetThemeActive,
                    ]}
                  >
                    <LinearGradient
                      colors={theme.gradientColors}
                      style={styles.presetThemeGradient}
                    >
                      {theme.imageUri ? (
                        <Image source={{ uri: theme.imageUri }} style={styles.presetThemeThumb} />
                      ) : (
                        <MaterialIcons name="palette" size={28} color="#FFFFFF" />
                      )}
                      <Text style={styles.presetThemeName} numberOfLines={1}>
                        {theme.name}
                      </Text>
                      {activeThemeId === theme.id && !customBgUri && (
                        <View style={styles.activeCheckBadge}>
                          <MaterialIcons name="check" size={14} color="#FFFFFF" />
                        </View>
                      )}
                    </LinearGradient>
                  </Pressable>
                ))}
              </ScrollView>

              {customBgUri && (
                <Pressable
                  onPress={() => void handleSelectPresetTheme("anime-violet")}
                  style={styles.resetThemeButton}
                >
                  <MaterialIcons name="restart-alt" size={18} color="#FF5252" />
                  <Text style={styles.resetThemeText}>إلغاء الصورة المخصصة والعودة للافتراضي</Text>
                </Pressable>
              )}
            </View>
          </Pressable>
        </Modal>

        {/* Add to Playlist Modal */}
        <Modal
          visible={playlistModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setPlaylistModalVisible(false)}
        >
          <Pressable style={styles.modalBackdrop} onPress={() => setPlaylistModalVisible(false)}>
            <View style={styles.dialogCard} onStartShouldSetResponder={() => true}>
              <Text style={styles.dialogTitle}>إضافة إلى قائمة التشغيل</Text>

              {/* Create New Playlist Input */}
              <View style={styles.newPlaylistRow}>
                <TextInput
                  value={newPlaylistName}
                  onChangeText={setNewPlaylistName}
                  placeholder="اسم قائمة تشغيل جديدة..."
                  placeholderTextColor="#8E8E93"
                  style={styles.newPlaylistInput}
                />
                <Pressable
                  onPress={() => void handleCreateNewPlaylist()}
                  style={styles.newPlaylistAddBtn}
                >
                  <MaterialIcons name="add" size={22} color="#FFFFFF" />
                </Pressable>
              </View>

              {/* Playlists List */}
              <ScrollView style={styles.playlistsScrollView}>
                {playlists.length > 0 ? (
                  playlists.map((playlist) => (
                    <Pressable
                      key={playlist.id}
                      onPress={() => void handleAddToPlaylist(playlist.id)}
                      style={styles.playlistItem}
                    >
                      <MaterialIcons name="queue-music" size={24} color="#E91E63" />
                      <Text style={styles.playlistItemName}>{playlist.name}</Text>
                    </Pressable>
                  ))
                ) : (
                  <Text style={styles.noPlaylistsText}>لا توجد قوائم تشغيل. اكتب اسماً وأنشئ واحدة الآن!</Text>
                )}
              </ScrollView>

              <Pressable onPress={() => setPlaylistModalVisible(false)} style={styles.dialogCancelButton}>
                <Text style={styles.dialogCancelText}>إلغاء</Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>

        {/* Edit Lyrics Modal */}
        <Modal
          visible={lyricsModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setLyricsModalVisible(false)}
        >
          <Pressable style={styles.modalBackdrop} onPress={() => setLyricsModalVisible(false)}>
            <View style={styles.dialogCard} onStartShouldSetResponder={() => true}>
              <Text style={styles.dialogTitle}>تحرير كلمات الأغنية</Text>
              <TextInput
                value={editedLyrics}
                onChangeText={setEditedLyrics}
                placeholder="ألصق أو اكتب كلمات الأغنية هنا..."
                placeholderTextColor="#8E8E93"
                multiline
                style={styles.lyricsTextInput}
              />
              <View style={styles.dialogActionRow}>
                <Pressable onPress={() => setLyricsModalVisible(false)} style={styles.dialogBtnCancel}>
                  <Text style={styles.dialogBtnCancelText}>إلغاء</Text>
                </Pressable>
                <Pressable onPress={() => void handleSaveLyrics()} style={styles.dialogBtnSave}>
                  <Text style={styles.dialogBtnSaveText}>حفظ الكلمات</Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Modal>

        {/* Track Properties Modal */}
        <Modal
          visible={propertiesModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setPropertiesModalVisible(false)}
        >
          <Pressable style={styles.modalBackdrop} onPress={() => setPropertiesModalVisible(false)}>
            <View style={styles.dialogCard} onStartShouldSetResponder={() => true}>
              <View style={styles.propertiesHead}>
                <MaterialIcons name="info-outline" size={26} color="#00BCD4" />
                <Text style={styles.dialogTitle}>خصائص الملف الصوتي</Text>
              </View>

              <View style={styles.propRow}>
                <Text style={styles.propLabel}>العنوان:</Text>
                <Text style={styles.propValue} numberOfLines={1}>{currentItem.title || "غير معروف"}</Text>
              </View>
              <View style={styles.propRow}>
                <Text style={styles.propLabel}>الفنان:</Text>
                <Text style={styles.propValue} numberOfLines={1}>{currentItem.artist || "فنان غير معروف"}</Text>
              </View>
              <View style={styles.propRow}>
                <Text style={styles.propLabel}>الألبوم:</Text>
                <Text style={styles.propValue} numberOfLines={1}>{currentItem.album || "المكتبة الموسيقية"}</Text>
              </View>
              <View style={styles.propRow}>
                <Text style={styles.propLabel}>المدة:</Text>
                <Text style={styles.propValue}>{formatDuration(duration)}</Text>
              </View>
              <View style={styles.propRow}>
                <Text style={styles.propLabel}>الحجم:</Text>
                <Text style={styles.propValue}>{fileDetails.sizeStr}</Text>
              </View>
              <View style={styles.propRow}>
                <Text style={styles.propLabel}>المسار:</Text>
                <Text style={[styles.propValue, styles.propPath]} numberOfLines={2}>{fileDetails.path}</Text>
              </View>

              <Pressable onPress={() => setPropertiesModalVisible(false)} style={styles.dialogCancelButton}>
                <Text style={styles.dialogCancelText}>إغلاق</Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>

        {/* Sleep Timer Modal */}
        <Modal
          visible={sleepModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setSleepModalVisible(false)}
        >
          <Pressable style={styles.modalBackdrop} onPress={() => setSleepModalVisible(false)}>
            <View style={styles.dialogCard} onStartShouldSetResponder={() => true}>
              <Text style={styles.dialogTitle}>مؤقت النوم</Text>
              <Text style={styles.sleepDialogDesc}>
                {sleepTimer !== null
                  ? `مؤقت النوم نشط: سيتوقف التشغيل بعد ${sleepTimer} دقيقة.`
                  : "حدد مدة الإيقاف التلقائي للمشغل:"}
              </Text>

              <View style={styles.sleepOptionsGrid}>
                {[5, 15, 30, 45, 60].map((minutes) => (
                  <Pressable
                    key={minutes}
                    onPress={() => {
                      setSleepTimer(minutes);
                      setSleepModalVisible(false);
                      Alert.alert("مؤقت النوم", `تم ضبط مؤقت النوم على ${minutes} دقيقة.`);
                    }}
                    style={[
                      styles.sleepButton,
                      sleepTimer === minutes && styles.sleepButtonActive,
                    ]}
                  >
                    <Text style={[styles.sleepButtonText, sleepTimer === minutes && styles.sleepButtonTextActive]}>
                      {minutes} دقيقة
                    </Text>
                  </Pressable>
                ))}
              </View>

              {sleepTimer !== null && (
                <Pressable
                  onPress={() => {
                    setSleepTimer(null);
                    if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
                    setSleepModalVisible(false);
                    Alert.alert("مؤقت النوم", "تم إلغاء مؤقت النوم.");
                  }}
                  style={styles.cancelSleepBtn}
                >
                  <Text style={styles.cancelSleepBtnText}>إلغاء المؤقت</Text>
                </Pressable>
              )}

              <Pressable onPress={() => setSleepModalVisible(false)} style={styles.dialogCancelButton}>
                <Text style={styles.dialogCancelText}>إغلاق</Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      </View>
    </ScreenContainer>
  );
}

/**
 * Single Row for the Floating White Popup Menu (Exact layout from user screenshot)
 */
function PopupMenuItem({
  label,
  iconName,
  iconColor,
  isLast = false,
  onPress,
}: {
  label: string;
  iconName: keyof typeof MaterialIcons.glyphMap;
  iconColor: string;
  isLast?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.popupMenuItem,
        !isLast && styles.popupMenuItemBorder,
        pressed && styles.popupMenuItemPressed,
      ]}
    >
      <Text style={styles.popupMenuItemLabel}>{label}</Text>
      <View style={[styles.popupMenuIconCircle, { borderColor: `${iconColor}66` }]}>
        <MaterialIcons name={iconName} size={20} color={iconColor} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F031C",
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#0B1119",
  },
  errorText: {
    color: "#FFFFFF",
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  backButton: {
    backgroundColor: "#2EC5FF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  backButtonText: {
    color: "#06101A",
    fontWeight: "bold",
  },

  // Top Header Bar
  topHeader: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    zIndex: 10,
  },
  headerLeftIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  topIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  pressedIcon: {
    opacity: 0.6,
  },

  // Floating White Popup Menu (Exact styling from screenshot)
  popupOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingTop: 54,
    paddingLeft: 14,
  },
  popupCard: {
    width: 250,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  popupMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
  },
  popupMenuItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E0E0E0",
  },
  popupMenuItemPressed: {
    backgroundColor: "#F5F5F5",
  },
  popupMenuItemLabel: {
    color: "#212121",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "right",
    flex: 1,
    marginRight: 12,
  },
  popupMenuIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  // Main Body
  body: {
    flex: 1,
    justifyContent: "space-between",
    paddingBottom: 28,
  },

  // Circular Vinyl / Disc Artwork
  discSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10,
  },
  circularDiscWrapper: {
    width: 260,
    height: 260,
    borderRadius: 130,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    backgroundColor: "#160728",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  circularDiscImage: {
    width: "100%",
    height: "100%",
  },
  circularDiscFallback: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1C0D30",
  },
  circularDiscRingOuter: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.12)",
  },
  circularDiscRingInner: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.08)",
  },
  lyricsDiscContainer: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(20, 5, 35, 0.95)",
  },
  lyricsDiscTitle: {
    color: "#00F2FE",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },
  lyricsScrollContent: {
    paddingVertical: 10,
  },
  lyricsBodyText: {
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
  },
  lyricsBackHint: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
    marginTop: 6,
  },

  // Pill Button: كلمات الأغنية (Under the circular disc)
  lyricsPillButton: {
    marginTop: 18,
    paddingVertical: 8,
    paddingHorizontal: 22,
    borderRadius: 20,
    backgroundColor: "rgba(42, 18, 68, 0.75)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  lyricsPillText: {
    color: "#E2D9F3",
    fontSize: 14,
    fontWeight: "600",
  },

  // Track Info Row
  metaContainer: {
    paddingHorizontal: 22,
    marginTop: 10,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  metaCenter: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 12,
  },
  songTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  developerSignature: {
    color: "#D1C4E9",
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },

  // Scrubber & Progress Bar
  progressSection: {
    paddingHorizontal: 20,
    marginVertical: 12,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  timeText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "monospace",
    fontWeight: "500",
    minWidth: 46,
    textAlign: "center",
  },
  progressTouch: {
    flex: 1,
    height: 36,
    justifyContent: "center",
  },
  progressTrack: {
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.28)",
    borderRadius: 2,
    position: "relative",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#00F2FE",
    borderRadius: 2,
  },
  progressThumb: {
    position: "absolute",
    top: -6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#00F2FE",
    marginLeft: -8,
    elevation: 4,
    shadowColor: "#00F2FE",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },

  // Bottom Playback Controls Row (Exact sequence from screenshot)
  playbackControlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  controlSmallButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  playPauseRoundButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#E91E63", // Hot Pink / Magenta from screenshot
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#E91E63",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },

  // Modals & Bottom Sheets
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  themeSheet: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#1B0D2E",
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  sheetTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  pickCustomImageButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
  },
  pickCustomGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
  },
  pickCustomTextWrap: {
    flex: 1,
  },
  pickCustomTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  pickCustomSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    marginTop: 2,
  },
  presetsLabel: {
    color: "#E2D9F3",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "right",
  },
  presetsScroll: {
    marginBottom: 16,
  },
  presetThemeCard: {
    width: 100,
    height: 120,
    borderRadius: 14,
    overflow: "hidden",
    marginRight: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  presetThemeActive: {
    borderColor: "#00F2FE",
  },
  presetThemeGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  presetThemeThumb: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginBottom: 8,
  },
  presetThemeName: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
  activeCheckBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#00F2FE",
    alignItems: "center",
    justifyContent: "center",
  },
  resetThemeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
  },
  resetThemeText: {
    color: "#FF5252",
    fontSize: 13,
  },

  // General Dialog Card
  dialogCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#1A1028",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  dialogTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  newPlaylistRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  newPlaylistInput: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 12,
    color: "#FFFFFF",
    fontSize: 14,
    textAlign: "right",
  },
  newPlaylistAddBtn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: "#E91E63",
    alignItems: "center",
    justifyContent: "center",
  },
  playlistsScrollView: {
    maxHeight: 200,
    marginBottom: 14,
  },
  playlistItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  playlistItemName: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "500",
  },
  noPlaylistsText: {
    color: "#A098B2",
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 16,
  },
  dialogCancelButton: {
    alignItems: "center",
    paddingVertical: 10,
  },
  dialogCancelText: {
    color: "#A098B2",
    fontSize: 15,
  },

  // Lyrics Input
  lyricsTextInput: {
    minHeight: 140,
    maxHeight: 220,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    padding: 12,
    color: "#FFFFFF",
    fontSize: 14,
    textAlign: "right",
    textAlignVertical: "top",
    marginBottom: 16,
  },
  dialogActionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  dialogBtnCancel: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  dialogBtnCancelText: {
    color: "#A098B2",
    fontSize: 14,
  },
  dialogBtnSave: {
    backgroundColor: "#E91E63",
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 10,
  },
  dialogBtnSaveText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },

  // Properties Dialog
  propertiesHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
  },
  propRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
  },
  propLabel: {
    color: "#A098B2",
    fontSize: 13,
    fontWeight: "500",
  },
  propValue: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
    textAlign: "left",
    marginLeft: 8,
  },
  propPath: {
    fontSize: 11,
    color: "#00BCD4",
  },

  // Sleep Timer Dialog
  sleepDialogDesc: {
    color: "#D1C4E9",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 16,
  },
  sleepOptionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
    marginBottom: 16,
  },
  sleepButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  sleepButtonActive: {
    backgroundColor: "#E91E63",
    borderColor: "#E91E63",
  },
  sleepButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "500",
  },
  sleepButtonTextActive: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  cancelSleepBtn: {
    alignItems: "center",
    paddingVertical: 10,
    marginBottom: 8,
  },
  cancelSleepBtnText: {
    color: "#FF5252",
    fontSize: 14,
  },
});
