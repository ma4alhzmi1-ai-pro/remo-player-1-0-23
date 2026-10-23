import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";

import {
  convertVideoToMp4,
  convertVideoToAudio,
  type ConversionResult,
  type AudioFormat,
  type AudioQuality,
  type AudioSampleRate,
  type AudioChannelMode,
  AUDIO_FORMAT_OPTIONS,
  AUDIO_QUALITY_OPTIONS,
  AUDIO_SAMPLE_RATE_OPTIONS,
} from "@/lib/video-converter";
import { isConvertibleFormat, extensionOf } from "@/lib/media-utils";
import { ScreenContainer } from "@/components/screen-container";
import { colors } from "@/components/remo-ui";
import { usePlayer } from "@/lib/player-context";
import { useLibrary } from "@/lib/library-context";
import type { MediaItem } from "@/types/media";

export default function ConverterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ uri?: string; name?: string; mode?: string }>();
  const { playItem } = usePlayer();
  const { refreshDeviceLibrary } = useLibrary();

  // Mode: "audio" (Video to Audio) or "video" (Video to MP4)
  const [activeTab, setActiveTab] = useState<"audio" | "video">(
    params.mode === "video" ? "video" : "audio"
  );

  // Audio configuration state
  const [selectedFormat, setSelectedFormat] = useState<AudioFormat>("mp3");
  const [selectedQuality, setSelectedQuality] = useState<AudioQuality>("320k");
  const [selectedSampleRate, setSelectedSampleRate] = useState<AudioSampleRate>("48000");
  const [selectedChannels, setSelectedChannels] = useState<AudioChannelMode>("stereo");
  const [audioTitle, setAudioTitle] = useState("");
  const [audioArtist, setAudioArtist] = useState("REMO Audio");

  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stageText, setStageText] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<{
    uri: string;
    name: string;
    size?: number;
  } | null>(null);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);

  // Handle incoming query params
  useEffect(() => {
    if (params.uri && params.name) {
      setSelectedAsset({
        uri: params.uri,
        name: params.name,
      });
      const cleanName = params.name.replace(/\.[^.]+$/, "");
      setAudioTitle(cleanName);
    }
  }, [params.uri, params.name]);

  // Pick a video file
  const pickFile = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["video/*", "*/*"],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) return;
      const asset = result.assets[0];

      setSelectedAsset({
        uri: asset.uri,
        name: asset.name,
        size: asset.size,
      });
      const cleanName = asset.name.replace(/\.[^.]+$/, "");
      setAudioTitle(cleanName);
      setConversionResult(null);
    } catch {
      Alert.alert("خطأ", "تعذر فتح منتقي الملفات. يرجى المحاولة مرة أخرى.");
    }
  }, []);

  // Start Conversion process
  const startConversion = useCallback(async () => {
    if (!selectedAsset) return;

    setConverting(true);
    setProgress(0);
    setStageText("بدء التحضير...");

    try {
      if (activeTab === "audio") {
        // Video to Audio
        const result = await convertVideoToAudio(
          selectedAsset.uri,
          {
            format: selectedFormat,
            quality: selectedQuality,
            sampleRate: selectedSampleRate,
            channels: selectedChannels,
            title: audioTitle.trim() || undefined,
            artist: audioArtist.trim() || undefined,
            customFileName: audioTitle.trim() || selectedAsset.name,
          },
          (p) => {
            setProgress(p.percent);
            if (p.stage) setStageText(p.stage);
          }
        );

        setConversionResult(result);
        void refreshDeviceLibrary();
      } else {
        // Video to MP4
        const result = await convertVideoToMp4(selectedAsset.uri, selectedAsset.name, (p) => {
          setProgress(p.percent);
          if (p.stage) setStageText(p.stage);
        });

        setConversionResult(result);
        void refreshDeviceLibrary();
      }
    } catch (error: any) {
      Alert.alert("فشل التحويل", error?.message || "حدث خطأ غير متوقع أثناء معالجة الملف.");
    } finally {
      setConverting(false);
    }
  }, [
    activeTab,
    selectedAsset,
    selectedFormat,
    selectedQuality,
    selectedSampleRate,
    selectedChannels,
    audioTitle,
    audioArtist,
    refreshDeviceLibrary,
  ]);

  // Play converted file immediately
  const handlePlayConverted = useCallback(async () => {
    if (!conversionResult) return;

    if (activeTab === "audio") {
      const audioItem: MediaItem = {
        id: `audio_converted_${Date.now()}`,
        title: audioTitle.trim() || conversionResult.fileName.replace(/\.[^.]+$/, ""),
        artist: audioArtist.trim() || "REMO Audio",
        uri: conversionResult.outputUri,
        duration: 0,
        mediaType: "audio",
        album: "REMO Audio",
        isFavorite: false,
        addedAt: Date.now(),
      };

      await playItem(audioItem);
      router.push("/player/audio" as never);
    } else {
      const videoItem: MediaItem = {
        id: `video_converted_${Date.now()}`,
        title: conversionResult.fileName.replace(/\.[^.]+$/, ""),
        artist: "REMO Video",
        uri: conversionResult.outputUri,
        duration: 0,
        mediaType: "video",
        album: "REMO Converted",
        isFavorite: false,
        addedAt: Date.now(),
      };

      await playItem(videoItem);
      router.push("/player/video" as never);
    }
  }, [conversionResult, activeTab, audioTitle, audioArtist, playItem, router]);

  // Share converted file
  const handleShare = useCallback(async () => {
    if (!conversionResult) return;
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(conversionResult.outputUri, {
          mimeType: activeTab === "audio" ? `audio/${selectedFormat}` : "video/mp4",
          dialogTitle: "مشاركة الملف المحول",
        });
      } else {
        Alert.alert("المشاركة غير متاحة", "ميزة المشاركة غير مدعومة في بيئة التشغيل الحالية.");
      }
    } catch {
      Alert.alert("خطأ", "تعذر مشاركة الملف.");
    }
  }, [conversionResult, activeTab, selectedFormat]);

  const handleConvertAnother = useCallback(() => {
    setConversionResult(null);
    setSelectedAsset(null);
    setProgress(0);
    setStageText("");
    void pickFile();
  }, [pickFile]);

  const fileExtension = selectedAsset ? extensionOf(selectedAsset.name).toUpperCase() : "";

  return (
    <ScreenContainer>
      {/* Top Navigation Bar */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.headerBack, pressed && styles.pressed]}
          accessibilityLabel="رجوع"
        >
          <MaterialIcons name="arrow-forward" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>
          {activeTab === "audio" ? "تحويل الفيديو إلى صوت" : "محول صيغ الفيديو"}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Mode Selector (Segmented Control) */}
        {!conversionResult && (
          <View style={styles.modeTabs}>
            <Pressable
              onPress={() => {
                if (!converting) setActiveTab("audio");
              }}
              style={[styles.modeTab, activeTab === "audio" && styles.modeTabActive]}
            >
              <MaterialIcons
                name="audiotrack"
                size={19}
                color={activeTab === "audio" ? "#04121F" : colors.muted}
              />
              <Text
                style={[
                  styles.modeTabText,
                  activeTab === "audio" && styles.modeTabTextActive,
                ]}
              >
                تحويل إلى صوت
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                if (!converting) setActiveTab("video");
              }}
              style={[styles.modeTab, activeTab === "video" && styles.modeTabActive]}
            >
              <MaterialIcons
                name="movie"
                size={19}
                color={activeTab === "video" ? "#04121F" : colors.muted}
              />
              <Text
                style={[
                  styles.modeTabText,
                  activeTab === "video" && styles.modeTabTextActive,
                ]}
              >
                تحويل إلى MP4
              </Text>
            </Pressable>
          </View>
        )}

        {/* Feature Overview Banner */}
        <View style={styles.infoBanner}>
          <View style={styles.infoBadge}>
            <MaterialIcons
              name={activeTab === "audio" ? "music-note" : "verified"}
              size={18}
              color={colors.cyan}
            />
            <Text style={styles.infoBadgeText}>
              {activeTab === "audio"
                ? "استخراج الصوت بجميع الصيغ والجودات"
                : "محول الفيديو فائق السرعة"}
            </Text>
          </View>
          <Text style={styles.infoTitle}>
            {activeTab === "audio"
              ? "تحويل أي مقطع فيديو إلى ملف صوتي نقي"
              : "تحويل الصيغ غير المتوافقة إلى MP4"}
          </Text>
          <Text style={styles.infoDesc}>
            {activeTab === "audio"
              ? "اختر صيغة الصوت (MP3, AAC, FLAC, WAV, M4A, OGG...) ومعدل البت المطلوب وحفظ الملف مباشرة في ذاكرة هاتفك ومكتبة الصوتيات."
              : "حوّل ملفات FLV, AVI, WMV, VOB, MP5 وغيرها إلى MP4 القياسي لتشغيلها بسلاسة على الهاتف ومشاركتها."}
          </Text>
        </View>

        {/* Audio Format & Quality Options (When in Audio Mode and before result) */}
        {activeTab === "audio" && !conversionResult && (
          <View style={styles.optionsContainer}>
            {/* Format Selection */}
            <Text style={styles.optionSectionTitle}>صيغة الصوت المستخرج:</Text>
            <View style={styles.badgeGrid}>
              {AUDIO_FORMAT_OPTIONS.map((fmt) => {
                const isSelected = selectedFormat === fmt.id;
                return (
                  <Pressable
                    key={fmt.id}
                    onPress={() => !converting && setSelectedFormat(fmt.id)}
                    style={[styles.formatChip, isSelected && styles.formatChipSelected]}
                  >
                    <Text
                      style={[
                        styles.formatChipLabel,
                        isSelected && styles.formatChipLabelSelected,
                      ]}
                    >
                      {fmt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.formatExplanation}>
              {AUDIO_FORMAT_OPTIONS.find((f) => f.id === selectedFormat)?.desc}
            </Text>

            {/* Quality (Bitrate) Selection */}
            <Text style={[styles.optionSectionTitle, { marginTop: 16 }]}>
              جودة الصوت ومعدل البت (Bitrate):
            </Text>
            <View style={styles.badgeGrid}>
              {AUDIO_QUALITY_OPTIONS.map((q) => {
                const isSelected = selectedQuality === q.id;
                return (
                  <Pressable
                    key={q.id}
                    onPress={() => !converting && setSelectedQuality(q.id)}
                    style={[styles.qualityChip, isSelected && styles.qualityChipSelected]}
                  >
                    <Text
                      style={[
                        styles.qualityChipLabel,
                        isSelected && styles.qualityChipLabelSelected,
                      ]}
                    >
                      {q.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.formatExplanation}>
              {AUDIO_QUALITY_OPTIONS.find((q) => q.id === selectedQuality)?.desc}
            </Text>

            {/* Sample Rate & Channels */}
            <View style={styles.rowSelectors}>
              {/* Sample Rate */}
              <View style={styles.halfSelector}>
                <Text style={styles.subOptionTitle}>التردد (Sample Rate):</Text>
                <View style={styles.compactGrid}>
                  {AUDIO_SAMPLE_RATE_OPTIONS.map((sr) => (
                    <Pressable
                      key={sr.id}
                      onPress={() => !converting && setSelectedSampleRate(sr.id)}
                      style={[
                        styles.compactChip,
                        selectedSampleRate === sr.id && styles.compactChipSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.compactChipText,
                          selectedSampleRate === sr.id && styles.compactChipTextSelected,
                        ]}
                      >
                        {sr.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Channels */}
              <View style={styles.halfSelector}>
                <Text style={styles.subOptionTitle}>قنوات الصوت:</Text>
                <View style={styles.compactGrid}>
                  <Pressable
                    onPress={() => !converting && setSelectedChannels("stereo")}
                    style={[
                      styles.compactChip,
                      selectedChannels === "stereo" && styles.compactChipSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.compactChipText,
                        selectedChannels === "stereo" && styles.compactChipTextSelected,
                      ]}
                    >
                      ستيريو (Stereo)
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => !converting && setSelectedChannels("mono")}
                    style={[
                      styles.compactChip,
                      selectedChannels === "mono" && styles.compactChipSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.compactChipText,
                        selectedChannels === "mono" && styles.compactChipTextSelected,
                      ]}
                    >
                      أحادي (Mono)
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Audio Metadata Tags */}
            <View style={styles.metadataCard}>
              <Text style={styles.subOptionTitle}>معلومات المقطع الصوتي (اختياري):</Text>
              <TextInput
                value={audioTitle}
                onChangeText={setAudioTitle}
                placeholder="عنوان المسار الصوتي..."
                placeholderTextColor={colors.muted}
                style={styles.textInput}
              />
              <TextInput
                value={audioArtist}
                onChangeText={setAudioArtist}
                placeholder="اسم الفنان / المنشد..."
                placeholderTextColor={colors.muted}
                style={[styles.textInput, { marginTop: 8 }]}
              />
            </View>
          </View>
        )}

        {/* Upload / Pick File Card */}
        {!conversionResult && (
          <View style={styles.uploadCard}>
            <Pressable
              onPress={pickFile}
              disabled={converting}
              style={({ pressed }) => [styles.uploadDropZone, pressed && styles.pressed]}
            >
              <View style={styles.uploadIconCircle}>
                <MaterialIcons
                  name={activeTab === "audio" ? "audio-file" : "cloud-upload"}
                  size={36}
                  color={colors.cyan}
                />
              </View>
              <Text style={styles.uploadTitle}>
                {selectedAsset ? "انقر لتغيير ملف الفيديو المختار" : "اختيار فيديو من ذاكرة الهاتف"}
              </Text>
              <Text style={styles.uploadSubtitle}>
                يدعم اختيار أي ملف فيديو بجميع الصيغ (MP4, MKV, FLV, AVI, WMV, MOV, TS...)
              </Text>
            </Pressable>

            {/* Selected File Details */}
            {selectedAsset && (
              <View style={styles.selectedFileBox}>
                <View style={styles.fileIconWrap}>
                  <MaterialIcons
                    name={activeTab === "audio" ? "audiotrack" : "movie"}
                    size={24}
                    color={colors.cyan}
                  />
                </View>
                <View style={styles.fileMeta}>
                  <Text style={styles.fileName} numberOfLines={1}>
                    {selectedAsset.name}
                  </Text>
                  <View style={styles.fileTags}>
                    <View style={styles.formatTag}>
                      <Text style={styles.formatTagText}>المصدر: {fileExtension}</Text>
                    </View>
                    <View style={styles.targetTag}>
                      <Text style={styles.targetTagText}>
                        الهدف:{" "}
                        {activeTab === "audio"
                          ? `${selectedFormat.toUpperCase()} (${selectedQuality})`
                          : "MP4"}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Conversion Trigger Button */}
            {selectedAsset && !converting && (
              <Pressable
                onPress={startConversion}
                style={({ pressed }) => [styles.convertActionBtn, pressed && styles.pressed]}
              >
                <MaterialIcons
                  name={activeTab === "audio" ? "graphic-eq" : "play-arrow"}
                  size={22}
                  color="#04121F"
                />
                <Text style={styles.convertActionText}>
                  {activeTab === "audio"
                    ? `استخراج وحفظ الصوت (${selectedFormat.toUpperCase()} - ${selectedQuality})`
                    : "بدء تحويل الفيديو إلى MP4"}
                </Text>
              </Pressable>
            )}

            {/* Converting Progress State */}
            {converting && (
              <View style={styles.progressCard}>
                <ActivityIndicator size="small" color={colors.cyan} />
                <Text style={styles.progressPercent}>{progress.toFixed(0)}%</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
                <Text style={styles.progressStageText}>{stageText}</Text>
              </View>
            )}
          </View>
        )}

        {/* Conversion Success Result Card */}
        {conversionResult && (
          <View style={styles.successCard}>
            <View style={styles.successIconCircle}>
              <MaterialIcons name="check-circle" size={46} color={colors.cyan} />
            </View>
            <Text style={styles.successTitle}>
              {activeTab === "audio"
                ? "تم استخراج وحفظ الصوت بنجاح!"
                : "تم تحويل الفيديو وحفظه بنجاح!"}
            </Text>
            <Text style={styles.successSubtitle}>
              {activeTab === "audio"
                ? `تم تحويل الصوت بصيغة ${selectedFormat.toUpperCase()} وبجودة ${selectedQuality} وحفظه في ذاكرة هاتفك ومكتبة REMO PLAYER.`
                : "تم تحويل الفيديو بصيغة MP4 القياسية وحفظه تلقائياً في ذاكرة تخزين هاتفك."}
            </Text>

            {/* Storage Info Box */}
            <View style={styles.storageBox}>
              <MaterialIcons
                name={activeTab === "audio" ? "library-music" : "sd-card"}
                size={22}
                color={colors.cyan}
              />
              <View style={styles.storageTextWrap}>
                <Text style={styles.storageTitle}>
                  {activeTab === "audio" ? "محفوظ في مكتبة الصوتيات" : "محفوظ في ذاكرة الهاتف"}
                </Text>
                <Text style={styles.storagePath} numberOfLines={2}>
                  {conversionResult.fileName}
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              {/* Play Converted Media */}
              <Pressable
                onPress={handlePlayConverted}
                style={({ pressed }) => [styles.playActionBtn, pressed && styles.pressed]}
              >
                <MaterialIcons
                  name={activeTab === "audio" ? "play-circle" : "play-circle-filled"}
                  size={24}
                  color="#04121F"
                />
                <Text style={styles.playActionBtnText}>
                  {activeTab === "audio" ? "تشغيل الصوت في مشغل الموسيقى" : "تشغيل الفيديو الآن"}
                </Text>
              </Pressable>

              {/* Convert Another File */}
              <Pressable
                onPress={handleConvertAnother}
                style={({ pressed }) => [styles.anotherActionBtn, pressed && styles.pressed]}
              >
                <MaterialIcons name="add-circle-outline" size={22} color={colors.cyan} />
                <Text style={styles.anotherActionBtnText}>
                  {activeTab === "audio" ? "تحويل مقطع فيديو آخر إلى صوت" : "تحويل فيديو آخر"}
                </Text>
              </Pressable>

              {/* Share File */}
              <Pressable
                onPress={handleShare}
                style={({ pressed }) => [styles.shareActionBtn, pressed && styles.pressed]}
              >
                <MaterialIcons name="share" size={20} color={colors.muted} />
                <Text style={styles.shareActionBtnText}>مشاركة الملف المحول</Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  headerTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "bold",
  },
  headerBack: {
    padding: 8,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  modeTabs: {
    flexDirection: "row-reverse",
    backgroundColor: "#101D28",
    padding: 4,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#1E3B54",
  },
  modeTab: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    borderRadius: 10,
  },
  modeTabActive: {
    backgroundColor: colors.cyan,
  },
  modeTabText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "700",
  },
  modeTabTextActive: {
    color: "#04121F",
    fontWeight: "900",
  },
  infoBanner: {
    backgroundColor: "#102334",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1E4C6E",
    marginBottom: 16,
  },
  infoBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  infoBadgeText: {
    color: colors.cyan,
    fontSize: 12,
    fontWeight: "800",
  },
  infoTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
    textAlign: "right",
    marginBottom: 6,
    lineHeight: 24,
  },
  infoDesc: {
    color: "#B4C8DB",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "right",
  },
  optionsContainer: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 16,
  },
  optionSectionTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
    textAlign: "right",
    marginBottom: 10,
  },
  badgeGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 8,
  },
  formatChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  formatChipSelected: {
    backgroundColor: "rgba(117, 230, 218, 0.18)",
    borderColor: colors.cyan,
  },
  formatChipLabel: {
    color: "#CAD8E6",
    fontSize: 13,
    fontWeight: "700",
  },
  formatChipLabelSelected: {
    color: colors.cyan,
    fontWeight: "900",
  },
  formatExplanation: {
    color: colors.muted,
    fontSize: 12,
    textAlign: "right",
    marginTop: 6,
    lineHeight: 16,
  },
  qualityChip: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  qualityChipSelected: {
    backgroundColor: "rgba(117, 230, 218, 0.18)",
    borderColor: colors.cyan,
  },
  qualityChipLabel: {
    color: "#CAD8E6",
    fontSize: 12,
    fontWeight: "700",
  },
  qualityChipLabelSelected: {
    color: colors.cyan,
    fontWeight: "900",
  },
  rowSelectors: {
    flexDirection: "row-reverse",
    gap: 12,
    marginTop: 16,
  },
  halfSelector: {
    flex: 1,
  },
  subOptionTitle: {
    color: "#B4C8DB",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "right",
    marginBottom: 6,
  },
  compactGrid: {
    gap: 6,
  },
  compactChip: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
  },
  compactChipSelected: {
    backgroundColor: "rgba(117, 230, 218, 0.15)",
    borderColor: colors.cyan,
  },
  compactChipText: {
    color: "#CAD8E6",
    fontSize: 11,
    fontWeight: "600",
  },
  compactChipTextSelected: {
    color: colors.cyan,
    fontWeight: "800",
  },
  metadataCard: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  textInput: {
    backgroundColor: "rgba(0,0,0,0.25)",
    borderWidth: 1,
    borderColor: "#1E3B54",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: colors.text,
    fontSize: 13,
    textAlign: "right",
  },
  uploadCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  uploadDropZone: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#205579",
    borderRadius: 16,
    padding: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(117, 230, 218, 0.03)",
  },
  uploadIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(117, 230, 218, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  uploadTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 6,
  },
  uploadSubtitle: {
    color: colors.muted,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  selectedFileBox: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#13202E",
    padding: 12,
    borderRadius: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#1E3B54",
  },
  fileIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "rgba(117, 230, 218, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  fileMeta: {
    flex: 1,
    alignItems: "flex-end",
  },
  fileName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 4,
    textAlign: "right",
  },
  fileTags: {
    flexDirection: "row-reverse",
    gap: 6,
  },
  formatTag: {
    backgroundColor: "rgba(255, 107, 107, 0.15)",
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 6,
  },
  formatTagText: {
    color: "#FF8E8E",
    fontSize: 11,
    fontWeight: "700",
  },
  targetTag: {
    backgroundColor: "rgba(117, 230, 218, 0.15)",
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 6,
  },
  targetTagText: {
    color: colors.cyan,
    fontSize: 11,
    fontWeight: "700",
  },
  convertActionBtn: {
    backgroundColor: colors.cyan,
    borderRadius: 14,
    minHeight: 50,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
    shadowColor: colors.cyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  convertActionText: {
    color: "#04121F",
    fontSize: 14,
    fontWeight: "900",
  },
  progressCard: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#13202E",
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1E3B54",
  },
  progressPercent: {
    color: colors.cyan,
    fontSize: 18,
    fontWeight: "900",
    marginTop: 6,
  },
  progressBar: {
    width: "100%",
    height: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 4,
    overflow: "hidden",
    marginVertical: 10,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.cyan,
  },
  progressStageText: {
    color: colors.muted,
    fontSize: 12,
    textAlign: "center",
  },
  successCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    alignItems: "center",
  },
  successIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "rgba(117, 230, 218, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  successTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 6,
  },
  successSubtitle: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    marginBottom: 18,
  },
  storageBox: {
    width: "100%",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(117, 230, 218, 0.08)",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(117, 230, 218, 0.2)",
    marginBottom: 20,
  },
  storageTextWrap: {
    flex: 1,
    alignItems: "flex-end",
  },
  storageTitle: {
    color: colors.cyan,
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 2,
  },
  storagePath: {
    color: "#C5D6E8",
    fontSize: 12,
    textAlign: "right",
  },
  actionButtons: {
    width: "100%",
    gap: 10,
  },
  playActionBtn: {
    backgroundColor: colors.cyan,
    borderRadius: 14,
    minHeight: 50,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: colors.cyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  playActionBtnText: {
    color: "#04121F",
    fontSize: 15,
    fontWeight: "900",
  },
  anotherActionBtn: {
    backgroundColor: "#13202E",
    borderRadius: 14,
    minHeight: 46,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#1E4C6E",
  },
  anotherActionBtnText: {
    color: colors.cyan,
    fontSize: 13,
    fontWeight: "800",
  },
  shareActionBtn: {
    minHeight: 42,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  shareActionBtnText: {
    color: colors.muted,
    fontSize: 13,
  },
  pressed: {
    opacity: 0.72,
  },
});
