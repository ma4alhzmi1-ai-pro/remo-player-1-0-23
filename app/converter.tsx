import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";

import { convertVideoToMp4, type ConversionResult } from "@/lib/video-converter";
import { isConvertibleFormat, extensionOf, legacyVideoFormats } from "@/lib/media-utils";
import { ScreenContainer } from "@/components/screen-container";
import { colors } from "@/components/remo-ui";
import { usePlayer } from "@/lib/player-context";
import { useLibrary } from "@/lib/library-context";
import type { MediaItem } from "@/types/media";

export default function ConverterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ uri?: string; name?: string }>();
  const { playItem } = usePlayer();
  const { refreshDeviceLibrary } = useLibrary();

  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stageText, setStageText] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<{
    uri: string;
    name: string;
    size?: number;
  } | null>(null);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);

  // Pick a video file for conversion
  const pickFile = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["video/*", "*/*"],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) return;
      const asset = result.assets[0];

      if (!isConvertibleFormat(asset.name)) {
        Alert.alert(
          "تنبيه الصيغة",
          `الملف المختار (${asset.name}) قد لا يكون ملف فيديو معروف، هل تود متابعة التحويل إلى MP4 على أي حال؟`,
          [
            { text: "إلغاء", style: "cancel" },
            {
              text: "متابعة التحويل",
              onPress: () => {
                setSelectedAsset({
                  uri: asset.uri,
                  name: asset.name,
                  size: asset.size,
                });
                setConversionResult(null);
              },
            },
          ]
        );
        return;
      }

      setSelectedAsset({
        uri: asset.uri,
        name: asset.name,
        size: asset.size,
      });
      setConversionResult(null);
    } catch {
      Alert.alert("خطأ", "تعذر فتح مدير الملفات لاختيار الفيديو.");
    }
  }, []);

  // Check if passed from home screen
  useEffect(() => {
    if (params.uri && params.name && !selectedAsset) {
      setSelectedAsset({
        uri: params.uri,
        name: params.name,
      });
    }
  }, [params.uri, params.name, selectedAsset]);

  // Execute Conversion
  const startConversion = async () => {
    if (!selectedAsset) {
      Alert.alert("تنبيه", "يرجى اختيار أو رفع ملف الفيديو أولاً.");
      return;
    }

    setConverting(true);
    setProgress(0);
    setStageText("بدء تهيئة محول الفيديو...");

    try {
      const result = await convertVideoToMp4(
        selectedAsset.uri,
        selectedAsset.name,
        (prog) => {
          setProgress(prog.percent);
          if (prog.stage) setStageText(prog.stage);
        }
      );

      setConversionResult(result);
      void refreshDeviceLibrary();
    } catch (error) {
      Alert.alert(
        "تعذر التحويل",
        error instanceof Error ? error.message : "حدث خطأ أثناء معالجة ملف الفيديو."
      );
    } finally {
      setConverting(false);
    }
  };

  // Play Converted Video
  const handlePlayConverted = async () => {
    if (!conversionResult) return;

    const mediaItem: MediaItem = {
      id: `converted_${Date.now()}`,
      title: conversionResult.fileName.replace(/\.[^.]+$/, ""),
      artist: "REMO Converted",
      album: "محول REMO",
      uri: conversionResult.outputUri,
      duration: 0,
      mediaType: "video",
      addedAt: Date.now(),
    };

    await playItem(mediaItem, [mediaItem]);
    router.push("/player/video");
  };

  // Convert Another File
  const handleConvertAnother = () => {
    setConversionResult(null);
    setSelectedAsset(null);
    setProgress(0);
    setStageText("");
    // Immediately prompt file picker
    void pickFile();
  };

  // Share Converted File
  const handleShare = async () => {
    if (!conversionResult?.outputUri) return;
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(conversionResult.outputUri, {
          dialogTitle: `مشاركة ${conversionResult.fileName}`,
          mimeType: "video/mp4",
        });
      } else {
        Alert.alert("المشاركة غير متاحة", "لا يمكن المشاركة على هذا الجهاز.");
      }
    } catch {
      Alert.alert("خطأ", "تعذرت مشاركة الملف.");
    }
  };

  const fileExtension = selectedAsset ? extensionOf(selectedAsset.name).toUpperCase() : "";

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 40 }} />
        <Text style={styles.headerTitle}>محول صيغ الفيديو إلى MP4</Text>
        <Pressable onPress={() => router.back()} style={styles.headerBack}>
          <MaterialIcons name="arrow-forward" size={24} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner / Guide */}
        <View style={styles.infoBanner}>
          <View style={styles.infoBadge}>
            <MaterialIcons name="transform" size={20} color={colors.cyan} />
            <Text style={styles.infoBadgeText}>محول الفيديوهات غير المتوافقة</Text>
          </View>
          <Text style={styles.infoTitle}>تحويل الصيغ القديمة وغير المشغلة إلى MP4</Text>
          <Text style={styles.infoDesc}>
            يدعم تحويل جميع الصيغ النادرة والقديمة مثل FLV, MP5, MVR, DVD, VOB, AVI, WMV, 3GP, MKV إلى صيغة MP4 العالمية، مع الحفظ التلقائي في ذاكرة تخزين هاتفك.
          </Text>

          {/* Formats Pills */}
          <View style={styles.pillsWrap}>
            {["FLV", "MP5", "MVR", "DVD/VOB", "AVI", "WMV", "3GP", "MKV", "TS"].map((fmt) => (
              <View key={fmt} style={styles.pill}>
                <Text style={styles.pillText}>{fmt}</Text>
              </View>
            ))}
            <View style={styles.pillArrow}>
              <MaterialIcons name="arrow-forward" size={16} color={colors.cyan} />
            </View>
            <View style={[styles.pill, styles.pillTarget]}>
              <Text style={styles.pillTargetText}>MP4 (H.264)</Text>
            </View>
          </View>
        </View>

        {/* Upload / Pick File Card */}
        {!conversionResult && (
          <View style={styles.uploadCard}>
            <Pressable
              onPress={pickFile}
              disabled={converting}
              style={({ pressed }) => [styles.uploadDropZone, pressed && styles.pressed]}
            >
              <View style={styles.uploadIconCircle}>
                <MaterialIcons name="cloud-upload" size={36} color={colors.cyan} />
              </View>
              <Text style={styles.uploadTitle}>
                {selectedAsset ? "انقر لتغيير الملف المختار" : "رفع أو اختيار ملف فيديو للتحويل"}
              </Text>
              <Text style={styles.uploadSubtitle}>
                يدعم اختيار أي ملف فيديو من ذاكرة الهاتف أو بطاقة الذاكرة
              </Text>
            </Pressable>

            {/* Selected File Details */}
            {selectedAsset && (
              <View style={styles.selectedFileBox}>
                <View style={styles.fileIconWrap}>
                  <MaterialIcons name="movie" size={24} color={colors.cyan} />
                </View>
                <View style={styles.fileMeta}>
                  <Text style={styles.fileName} numberOfLines={1}>
                    {selectedAsset.name}
                  </Text>
                  <View style={styles.fileTags}>
                    <View style={styles.formatTag}>
                      <Text style={styles.formatTagText}>الصيغة: {fileExtension}</Text>
                    </View>
                    <View style={styles.targetTag}>
                      <Text style={styles.targetTagText}>الهدف: MP4</Text>
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
                <MaterialIcons name="play-arrow" size={22} color="#04121F" />
                <Text style={styles.convertActionText}>بدء التحويل وحفظه في الهاتف</Text>
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
              <MaterialIcons name="check-circle" size={44} color={colors.cyan} />
            </View>
            <Text style={styles.successTitle}>تم التحويل والحفظ بنجاح!</Text>
            <Text style={styles.successSubtitle}>
              تم تحويل الفيديو بصيغة MP4 القياسية وحفظه تلقائياً في ذاكرة تخزين هاتفك.
            </Text>

            {/* Storage Info Box */}
            <View style={styles.storageBox}>
              <MaterialIcons name="sd-card" size={20} color={colors.cyan} />
              <View style={styles.storageTextWrap}>
                <Text style={styles.storageTitle}>محفوظ في ذاكرة الهاتف</Text>
                <Text style={styles.storagePath} numberOfLines={2}>
                  {conversionResult.fileName}
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              {/* Play Converted Video */}
              <Pressable
                onPress={handlePlayConverted}
                style={({ pressed }) => [styles.playActionBtn, pressed && styles.pressed]}
              >
                <MaterialIcons name="play-circle-filled" size={24} color="#04121F" />
                <Text style={styles.playActionBtnText}>تشغيل الملف المحول</Text>
              </Pressable>

              {/* Convert Another File */}
              <Pressable
                onPress={handleConvertAnother}
                style={({ pressed }) => [styles.anotherActionBtn, pressed && styles.pressed]}
              >
                <MaterialIcons name="add-circle-outline" size={22} color={colors.cyan} />
                <Text style={styles.anotherActionBtnText}>تحويل ملف آخر</Text>
              </Pressable>

              {/* Share File */}
              <Pressable
                onPress={handleShare}
                style={({ pressed }) => [styles.shareActionBtn, pressed && styles.pressed]}
              >
                <MaterialIcons name="share" size={20} color={colors.muted} />
                <Text style={styles.shareActionBtnText}>مشاركة الفيديو المحول</Text>
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
    padding: 18,
    paddingBottom: 40,
  },
  infoBanner: {
    backgroundColor: "#102334",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#1E4C6E",
    marginBottom: 20,
  },
  infoBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  infoBadgeText: {
    color: colors.cyan,
    fontSize: 12,
    fontWeight: "800",
  },
  infoTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "right",
    marginBottom: 6,
    lineHeight: 25,
  },
  infoDesc: {
    color: "#B4C8DB",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "right",
    marginBottom: 14,
  },
  pillsWrap: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 6,
    alignItems: "center",
  },
  pill: {
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  pillText: {
    color: "#C5D6E8",
    fontSize: 11,
    fontWeight: "700",
  },
  pillArrow: {
    paddingHorizontal: 2,
  },
  pillTarget: {
    backgroundColor: colors.cyan,
  },
  pillTargetText: {
    color: "#04121F",
    fontSize: 11,
    fontWeight: "900",
  },
  uploadCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  uploadDropZone: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#205579",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(117, 230, 218, 0.03)",
  },
  uploadIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "rgba(117, 230, 218, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  uploadTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 6,
  },
  uploadSubtitle: {
    color: colors.muted,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  selectedFileBox: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#13202E",
    padding: 12,
    borderRadius: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#1E3B54",
  },
  fileIconWrap: {
    width: 44,
    height: 44,
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
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 6,
    textAlign: "right",
  },
  fileTags: {
    flexDirection: "row-reverse",
    gap: 8,
  },
  formatTag: {
    backgroundColor: "rgba(255, 107, 107, 0.15)",
    paddingVertical: 2,
    paddingHorizontal: 8,
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
    paddingHorizontal: 8,
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
    minHeight: 52,
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
    fontSize: 15,
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
    padding: 22,
    alignItems: "center",
  },
  successIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(117, 230, 218, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  successTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 6,
  },
  successSubtitle: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 20,
  },
  storageBox: {
    width: "100%",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(117, 230, 218, 0.08)",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(117, 230, 218, 0.2)",
    marginBottom: 22,
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
    minHeight: 52,
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
    fontSize: 16,
    fontWeight: "900",
  },
  anotherActionBtn: {
    backgroundColor: "#13202E",
    borderRadius: 14,
    minHeight: 48,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#1E4C6E",
  },
  anotherActionBtnText: {
    color: colors.cyan,
    fontSize: 14,
    fontWeight: "800",
  },
  shareActionBtn: {
    minHeight: 44,
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
