import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";

import { colors, formatDuration } from "@/components/remo-ui";
import { ScreenContainer } from "@/components/screen-container";
import { usePlayer } from "@/lib/player-context";
import {
  createVideoMemoryCapsule,
  loadVideoMemoryCapsules,
  saveVideoMemoryCapsules,
  upsertVideoMemoryCapsule,
} from "@/lib/video-memory-capsules";

export default function EditVideoScreen() {
  const router = useRouter();
  const { currentItem } = usePlayer();
  const [measuredDuration, setMeasuredDuration] = useState(0);
  const safeDuration = Math.max(measuredDuration || currentItem?.duration || 0, 10);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(safeDuration);
  const [isPreviewingRange, setIsPreviewingRange] = useState(false);
  const player = useVideoPlayer(currentItem?.mediaType === "video" ? currentItem.uri : null);
  const clipDuration = useMemo(() => Math.max(0, end - start), [start, end]);

  useEffect(() => {
    setStart(0);
    setEnd(safeDuration);
  }, [safeDuration]);

  useEffect(() => {
    const sync = () => {
      if (player.duration > 1 && Math.abs(player.duration - measuredDuration) > 0.5) {
        setMeasuredDuration(player.duration);
      }
      if (isPreviewingRange && player.playing && player.currentTime >= end) {
        player.pause();
        player.currentTime = start;
        setIsPreviewingRange(false);
      }
    };
    const interval = setInterval(sync, 180);
    return () => clearInterval(interval);
  }, [end, isPreviewingRange, measuredDuration, player, start]);

  if (!currentItem || currentItem.mediaType !== "video") {
    return (
      <ScreenContainer>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>اختر فيديو من مكتبتك أولاً.</Text>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>العودة للفيديوهات</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  const adjustStart = (delta: number) => {
    const next = Math.max(0, Math.min(start + delta, end - 1));
    setStart(next);
    player.currentTime = next;
  };
  const adjustEnd = (delta: number) => {
    const next = Math.max(start + 1, Math.min(end + delta, safeDuration));
    setEnd(next);
  };
  const previewClip = () => {
    setIsPreviewingRange(true);
    player.currentTime = start;
    player.play();
  };
  const saveEditPlan = async () => {
    const existing = await loadVideoMemoryCapsules(currentItem.uri);
    let next = upsertVideoMemoryCapsule(existing, createVideoMemoryCapsule(start, `بداية ${formatDuration(start)}`));
    next = upsertVideoMemoryCapsule(next, createVideoMemoryCapsule(end, `نهاية ${formatDuration(end)}`));
    await saveVideoMemoryCapsules(currentItem.uri, next);
    Alert.alert(
      "تم حفظ علامات التحرير",
      `حُفظت علامتا البداية (${formatDuration(start)}) والنهاية (${formatDuration(end)}) ضمن كبسولات الذاكرة على شريط الفيديو.`
    );
  };
  const openAudioExtractor = () => {
    player.pause();
    router.push({
      pathname: "/converter",
      params: { uri: currentItem.uri, name: currentItem.title, mode: "audio" },
    } as never);
  };

  const leftPct = Math.max(0, Math.min(100, (start / safeDuration) * 100));
  const widthPct = Math.max(4, Math.min(100 - leftPct, (clipDuration / safeDuration) * 100));

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backIcon}>
            <MaterialIcons name="arrow-forward" size={23} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>تحرير المقطع</Text>
          <View style={styles.backIcon} />
        </View>
        <View style={styles.preview}>
          <VideoView style={styles.video} player={player} nativeControls contentFit="contain" surfaceType="textureView" />
        </View>
        <View style={styles.body}>
          <Text style={styles.title}>{currentItem.title}</Text>
          <Text style={styles.subtitle}>حدّد نطاق التشغيل واحفظه كعلامات على خط الوقت أو استخرج الصوت مباشرة.</Text>
          <View style={styles.timeline}>
            <View style={styles.timelineDim} />
            <View style={[styles.selection, { left: `${leftPct}%`, width: `${widthPct}%` }]}>
              <Text style={styles.selectionText}>{formatDuration(clipDuration)}</Text>
            </View>
          </View>
          <EditorControl label="بداية المقطع" value={start} decrease={() => adjustStart(-5)} increase={() => adjustStart(5)} />
          <EditorControl label="نهاية المقطع" value={end} decrease={() => adjustEnd(-5)} increase={() => adjustEnd(5)} />
          <View style={styles.actions}>
            <Pressable onPress={previewClip} style={({ pressed }) => [styles.previewButton, pressed && styles.dimmed]}>
              <MaterialIcons name="play-arrow" size={21} color={colors.background} />
              <Text style={styles.previewButtonText}>معاينة النطاق المحدد</Text>
            </Pressable>
            <Pressable onPress={() => void saveEditPlan()} style={({ pressed }) => [styles.saveButton, pressed && styles.dimmed]}>
              <MaterialIcons name="bookmark-add" size={20} color={colors.cyan} />
              <Text style={styles.saveButtonText}>حفظ العلامات على الشريط</Text>
            </Pressable>
          </View>
          <Pressable onPress={openAudioExtractor} style={({ pressed }) => [styles.extractButton, pressed && styles.dimmed]}>
            <MaterialIcons name="audiotrack" size={20} color={colors.cyan} />
            <Text style={styles.extractButtonText}>استخراج الصوت من هذا الفيديو (M4A)</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function EditorControl({ label, value, decrease, increase }: { label: string; value: number; decrease: () => void; increase: () => void }) {
  return (
    <View style={styles.control}>
      <Text style={styles.controlLabel}>{label}</Text>
      <View style={styles.controlActions}>
        <Pressable onPress={increase} style={styles.stepButton}><MaterialIcons name="add" size={20} color={colors.text} /></Pressable>
        <Text style={styles.controlValue}>{formatDuration(value)}</Text>
        <Pressable onPress={decrease} style={styles.stepButton}><MaterialIcons name="remove" size={20} color={colors.text} /></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 32 },
  header: { height: 58, paddingHorizontal: 16, flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between" },
  backIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  headerTitle: { color: colors.text, fontSize: 15, fontWeight: "900" },
  preview: { aspectRatio: 16 / 9, backgroundColor: "#02060B" },
  video: { flex: 1 },
  body: { padding: 20, alignItems: "flex-end" },
  title: { color: colors.text, fontSize: 20, fontWeight: "900", textAlign: "right" },
  subtitle: { color: colors.muted, fontSize: 12, lineHeight: 19, textAlign: "right", marginTop: 4 },
  timeline: { alignSelf: "stretch", height: 38, borderRadius: 12, backgroundColor: "#213750", overflow: "hidden", marginTop: 22, position: "relative", justifyContent: "center", direction: "ltr" },
  timelineDim: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, opacity: 0.35, backgroundColor: "#627691" },
  selection: { position: "absolute", top: 0, bottom: 0, backgroundColor: colors.cyan, alignItems: "center", justifyContent: "center", borderRadius: 8 },
  selectionText: { color: colors.background, fontSize: 12, fontWeight: "900" },
  control: { alignSelf: "stretch", minHeight: 62, marginTop: 13, borderRadius: 16, paddingHorizontal: 13, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between" },
  controlLabel: { color: colors.text, fontSize: 13, fontWeight: "800" },
  controlActions: { flexDirection: "row-reverse", alignItems: "center", gap: 9 },
  stepButton: { width: 31, height: 31, borderRadius: 10, backgroundColor: "#263F5B", alignItems: "center", justifyContent: "center" },
  controlValue: { minWidth: 48, color: colors.cyan, fontSize: 13, fontWeight: "900", textAlign: "center", fontVariant: ["tabular-nums"] },
  actions: { alignSelf: "stretch", flexDirection: "row-reverse", gap: 9, marginTop: 20 },
  previewButton: { flex: 1, minHeight: 47, borderRadius: 14, backgroundColor: colors.cyan, flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 6 },
  previewButtonText: { color: colors.background, fontSize: 12, fontWeight: "900" },
  saveButton: { flex: 1, minHeight: 47, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: "#1A526C", flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 6 },
  saveButtonText: { color: colors.text, fontSize: 12, fontWeight: "900" },
  extractButton: { alignSelf: "stretch", minHeight: 48, marginTop: 12, borderRadius: 14, backgroundColor: "#10283E", borderWidth: 1, borderColor: "#1C5F84", flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 8 },
  extractButtonText: { color: colors.cyan, fontSize: 13, fontWeight: "900" },
  dimmed: { opacity: 0.62 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14 },
  emptyText: { color: colors.muted, fontSize: 15 },
  backButton: { height: 42, paddingHorizontal: 16, borderRadius: 13, backgroundColor: colors.cyan, justifyContent: "center" },
  backText: { color: colors.background, fontWeight: "800" },
});
