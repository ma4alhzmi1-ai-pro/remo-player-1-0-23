import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Artwork, colors, EmptyState, formatDuration, MediaRow } from "@/components/remo-ui";
import { ScreenContainer } from "@/components/screen-container";
import { checkGithubForUpdate, openOfficialUpdate } from "@/lib/github-update-checker";
import { useLibrary } from "@/lib/library-context";
import { usePlayer } from "@/lib/player-context";

export default function HomeScreen() {
  const router = useRouter();
  const { items, isReady, importFiles, isRefreshing, refreshDeviceLibrary } = useLibrary();
  const { currentItem, playItem, isPlaying } = usePlayer();
  const updateCheckStarted = useRef(false);
  const latest = items.slice(0, 4);
  const audioCount = items.filter((item) => item.mediaType === "audio").length;
  const videoCount = items.filter((item) => item.mediaType === "video").length;

  const openItem = async (item: (typeof items)[number]) => {
    await playItem(item, items.filter((candidate) => candidate.mediaType === item.mediaType));
    router.push(item.mediaType === "video" ? ("/player/video" as never) : ("/player/audio" as never));
  };

  useEffect(() => {
    if (updateCheckStarted.current) return;
    updateCheckStarted.current = true;
    void checkGithubForUpdate().then((result) => {
      if (result.status !== "available") return;
      Alert.alert(`يتوفر REMO PLAYER ${result.release.version}`, result.release.notes, [
        { text: "لاحقاً", style: "cancel" },
        { text: "فتح صفحة الإصدار", onPress: () => { void openOfficialUpdate(result.release.releaseUrl); } },
      ]);
    });
  }, []);

  if (isReady && items.length === 0) {
    return (
      <ScreenContainer className="px-0" safeAreaClassName="bg-background">
        <HomeHeader />
        <EmptyState
          icon="perm-media"
          title="مكتبتك جاهزة"
          description="امنح الإذن لفهرسة موسيقاك وفيديوهاتك أو استورد وحوّل الملفات التي تريد تشغيلها."
          actionLabel={isRefreshing ? "جارِ الفهرسة..." : "فهرسة وسائط الجهاز"}
          onAction={() => void refreshDeviceLibrary()}
        />
        <View style={styles.emptyActionRow}>
          <Pressable onPress={() => void importFiles()} style={({ pressed }) => [styles.secondaryImport, pressed && styles.pressed]}>
            <MaterialIcons name="file-open" size={18} color={colors.cyan} />
            <Text style={styles.secondaryImportText}>استيراد ملفات</Text>
          </Pressable>
        </View>
        <Pressable onPress={() => router.push("/converter" as never)} style={styles.converterFab}>
          <MaterialIcons name="transform" size={20} color={colors.cyan} />
          <Text style={styles.converterFabText}>محول الفيديو</Text>
        </Pressable>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="px-0" safeAreaClassName="bg-background">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <HomeHeader />
        <View style={styles.hero}>
          <View style={styles.heroGlow} />
          <View style={styles.heroCopy}>
            <Text style={styles.heroEyebrow}>REMO PLAYER</Text>
            <Text style={styles.heroTitle}>{currentItem ? "استمر من حيث توقفت" : "كل وسائطك في مكان واحد"}</Text>
            <Text numberOfLines={2} style={styles.heroSubtitle}>
              {currentItem ? currentItem.title : "نظّم مكتبتك، شغّل ملفاتك، وحوّل الصيغ القديمة بسهولة."}
            </Text>
          </View>
          {currentItem ? <Artwork item={currentItem} size={78} /> : <Image source={require("@/assets/images/icon.png")} style={styles.appIcon} />}
        </View>

        {currentItem ? (
          <Pressable onPress={() => void openItem(currentItem)} style={({ pressed }) => [styles.continueCard, pressed && styles.pressed]}>
            <View style={styles.continueIcon}>
              <MaterialIcons name={currentItem.mediaType === "video" ? "play-arrow" : "equalizer"} size={22} color={colors.background} />
            </View>
            <View style={styles.continueText}>
              <Text numberOfLines={1} style={styles.continueTitle}>{currentItem.title}</Text>
              <Text style={styles.continueMeta}>{currentItem.mediaType === "video" ? "فيديو" : "موسيقى"} · {formatDuration(currentItem.duration)}</Text>
            </View>
            <MaterialIcons name="chevron-left" size={22} color={colors.muted} />
          </Pressable>
        ) : null}

        {/* Navigation / Stats Row: Music, Video, and Library */}
        <View style={styles.statsRow}>
          <StatCard icon="library-music" label="مشغل الصوت" value={audioCount} onPress={() => router.push("/music" as never)} />
          <StatCard icon="movie" label="مشغل الفيديو" value={videoCount} onPress={() => router.push("/video" as never)} />
          <StatCard icon="folder-open" label="إضافة" value="+" onPress={() => void importFiles()} />
        </View>

        {/* Recent Media List */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>أُضيفت مؤخراً</Text>
          <Text style={styles.sectionHint}>{items.length} ملف</Text>
        </View>
        <View style={styles.recentList}>
          {latest.map((item) => (
            <MediaRow key={item.id} item={item} isCurrent={Boolean(currentItem && (currentItem.id === item.id || currentItem.uri === item.uri))} isPlaying={isPlaying} onPress={() => void openItem(item)} />
          ))}
        </View>
      </ScrollView>

      {/* Converter Floating Action Button */}
      <Pressable onPress={() => router.push("/converter" as never)} style={({ pressed }) => [styles.converterFab, pressed && styles.pressed]}>
        <MaterialIcons name="transform" size={20} color={colors.cyan} />
        <Text style={styles.converterFabText}>محول الفيديو</Text>
      </Pressable>
    </ScreenContainer>
  );
}

function HomeHeader() {
  const router = useRouter();
  return (
    <View style={styles.header}>
      <View style={styles.brand}>
        <Image source={require("@/assets/images/icon.png")} style={styles.brandIcon} />
        <View>
          <Text style={styles.brandName}>REMO PLAYER</Text>
          <Text style={styles.brandTagline}>مشغل وسائطك ومحول الفيديو</Text>
        </View>
      </View>
      <Pressable onPress={() => router.push("/settings" as never)} hitSlop={10} style={({ pressed }) => pressed && styles.pressed}>
        <MaterialIcons name="settings" size={23} color={colors.muted} />
      </Pressable>
    </View>
  );
}

function StatCard({
  icon,
  label,
  value,
  highlight,
  onPress,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: number | string;
  highlight?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.statCard,
        highlight && styles.statCardHighlight,
        pressed && styles.pressed,
      ]}
    >
      <MaterialIcons name={icon} size={22} color={highlight ? colors.cyan : colors.cyan} />
      <Text style={[styles.statValue, highlight && styles.statValueHighlight]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 96 },
  header: { height: 70, paddingHorizontal: 18, flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between" },
  brand: { flexDirection: "row-reverse", alignItems: "center", gap: 9 },
  brandIcon: { width: 34, height: 34, borderRadius: 10 },
  brandName: { color: colors.text, fontSize: 14, lineHeight: 18, fontWeight: "900", letterSpacing: 0.5 },
  brandTagline: { color: colors.muted, fontSize: 10, lineHeight: 15, textAlign: "right" },
  hero: { minHeight: 142, marginHorizontal: 16, padding: 18, borderRadius: 24, overflow: "hidden", backgroundColor: "#102B45", borderWidth: 1, borderColor: "#225779", flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between" },
  heroGlow: { position: "absolute", width: 180, height: 180, borderRadius: 90, backgroundColor: "#563FC5", opacity: 0.28, left: -55, bottom: -80 },
  heroCopy: { flex: 1, alignItems: "flex-end", paddingLeft: 10 },
  heroEyebrow: { color: colors.cyan, fontSize: 10, fontWeight: "900", letterSpacing: 1.1 },
  heroTitle: { color: colors.text, fontSize: 22, lineHeight: 30, fontWeight: "900", textAlign: "right", marginTop: 5 },
  heroSubtitle: { color: "#C5D6E8", fontSize: 12, lineHeight: 18, textAlign: "right", marginTop: 4 },
  appIcon: { width: 78, height: 78, borderRadius: 23 },
  continueCard: { marginHorizontal: 16, marginTop: 12, minHeight: 66, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, flexDirection: "row-reverse", alignItems: "center", gap: 10 },
  continueIcon: { width: 38, height: 38, borderRadius: 14, backgroundColor: colors.cyan, alignItems: "center", justifyContent: "center" },
  continueText: { flex: 1, alignItems: "flex-end" },
  continueTitle: { color: colors.text, fontSize: 14, fontWeight: "800" },
  continueMeta: { color: colors.muted, fontSize: 11, lineHeight: 17 },
  statsRow: { flexDirection: "row-reverse", gap: 8, paddingHorizontal: 16, marginTop: 16 },
  statCard: { flex: 1, minHeight: 88, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center", gap: 2 },
  statCardHighlight: { borderColor: "#23648B", backgroundColor: "#10283D" },
  statValue: { color: colors.text, fontSize: 18, lineHeight: 24, fontWeight: "900" },
  statValueHighlight: { color: colors.cyan },
  statLabel: { color: colors.muted, fontSize: 11, lineHeight: 16, textAlign: "center" },
  sectionHeader: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 18, marginTop: 22, marginBottom: 9 },
  sectionTitle: { color: colors.text, fontSize: 17, lineHeight: 24, fontWeight: "900" },
  sectionHint: { color: colors.muted, fontSize: 12 },
  recentList: { marginHorizontal: 16, borderRadius: 18, overflow: "hidden", borderWidth: 1, borderColor: colors.border },
  emptyActionRow: {
    flexDirection: "row-reverse",
    gap: 10,
    marginHorizontal: 20,
    marginTop: 14,
    justifyContent: "center",
  },
  secondaryImport: {
    flex: 1,
    minHeight: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    flexDirection: "row-reverse",
    borderWidth: 1,
    borderColor: "#1E6382",
    backgroundColor: "#0F263A",
  },
  secondaryImportText: { color: colors.cyan, fontSize: 13, fontWeight: "800" },
  converterFab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    zIndex: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#102334",
    borderRadius: 25,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#1E4C6E",
  },
  converterFabText: { color: colors.text, fontSize: 13, fontWeight: "800" },
  pressed: { opacity: 0.68 },
});
