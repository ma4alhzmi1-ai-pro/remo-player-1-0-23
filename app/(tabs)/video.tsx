import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, BackHandler, FlatList, Image, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { Artwork, colors, EmptyState, formatDuration, MediaRow } from "@/components/remo-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useLibrary } from "@/lib/library-context";
import { getMediaFolderName, getMediaFolderPath, groupMediaFolders, type MediaFolder } from "@/lib/media-folder-utils";
import { filterMediaItems, nextMediaSort, sortMediaItems, type MediaSort } from "@/lib/media-library-tools";
import { usePlayer } from "@/lib/player-context";
import type { MediaItem, Playlist } from "@/types/media";

type VideoView = "grid" | "folders" | "playlists";
type Folder = MediaFolder;
type VideoPlaylist = Playlist & { items: MediaItem[] };

const views: { id: VideoView; label: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
  { id: "grid", label: "شبكة", icon: "grid-view" },
  { id: "folders", label: "مجلدات", icon: "folder" },
  { id: "playlists", label: "قوائم", icon: "queue-music" },
];

export default function VideoScreen() {
  const router = useRouter();
  const { folderPath } = useLocalSearchParams<{ folderPath?: string }>();
  const { items, playlists, importFiles, isRefreshing, refreshDeviceLibrary, addItemToPlaylist, createPlaylist } = useLibrary();
  const { playItem } = usePlayer();
  const [view, setView] = useState<VideoView>("grid");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<MediaSort>("recent");
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<VideoPlaylist | null>(null);
  const [playlistTarget, setPlaylistTarget] = useState<MediaItem | null>(null);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  const videos = useMemo(() => sortMediaItems(items.filter((item) => item.mediaType === "video"), sort), [items, sort]);
  const matchingVideos = useMemo(() => filterMediaItems(videos, query), [query, videos]);
  const folders = useMemo(() => groupMediaFolders(matchingVideos), [matchingVideos]);
  const videoPlaylists = useMemo<VideoPlaylist[]>(() => playlists.map((playlist) => ({
    ...playlist,
    items: playlist.itemIds.map((id) => items.find((item) => item.id === id)).filter((item): item is MediaItem => item?.mediaType === "video"),
  })).filter((playlist) => playlist.items.length > 0), [items, playlists]);


  useEffect(() => {
    if (!selectedFolder && !selectedPlaylist) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (selectedFolder) { setSelectedFolder(null); return true; }
      if (selectedPlaylist) { setSelectedPlaylist(null); return true; }
      return false;
    });
    return () => sub.remove();
  }, [selectedFolder, selectedPlaylist]);
  useEffect(() => {
    if (!folderPath) return;
    const folder = folders.find((candidate) => candidate.path === folderPath);
    if (!folder) return;
    setView("folders");
    setSelectedPlaylist(null);
    setSelectedFolder(folder);
  }, [folderPath, folders]);
  const openVideo = async (item: MediaItem, source = matchingVideos, originFolderPath?: string) => {
    await playItem(item, source);
    const route = originFolderPath ? `/player/video?folderPath=${encodeURIComponent(originFolderPath)}` : "/player/video";
    router.push(route as never);
  };
  const goBack = () => router.canGoBack() ? router.back() : router.replace("/" as never);
  const addToPlaylist = async (playlistId: string) => {
    if (!playlistTarget) return;
    await addItemToPlaylist(playlistId, playlistTarget.id);
    setPlaylistTarget(null);
  };
  const createVideoPlaylist = async () => {
    const name = newPlaylistName.trim();
    if (!name || !playlistTarget) return;
    const created = await createPlaylist(name);
    if (!created) {
      Alert.alert("تعذر إنشاء القائمة", "اختر اسماً مختلفاً لقائمة التشغيل.");
      return;
    }
    await addItemToPlaylist(created.id, playlistTarget.id);
    setNewPlaylistName("");
    setPlaylistTarget(null);
  };

  if (selectedFolder) return <FolderDetail folder={selectedFolder} onBack={() => setSelectedFolder(null)} onOpenVideo={(item) => openVideo(item, selectedFolder.items, selectedFolder.path)} />;
  if (selectedPlaylist) return <PlaylistDetail playlist={selectedPlaylist} onBack={() => setSelectedPlaylist(null)} onOpenVideo={(item) => openVideo(item, selectedPlaylist.items)} />;

  return <ScreenContainer className="px-0">
    <FlatList
      key={`video-${view}`}
      data={(view === "grid" ? matchingVideos : view === "folders" ? folders : videoPlaylists) as (MediaItem | Folder | VideoPlaylist)[]}
      numColumns={view === "grid" ? 2 : 1}
      columnWrapperStyle={view === "grid" ? styles.gridRow : undefined}
      keyExtractor={(item) => "items" in item ? item.id : (item as MediaItem).id}
      renderItem={({ item }) => {
        if (view === "grid") return <VideoCard item={item as MediaItem} onPress={() => void openVideo(item as MediaItem)} onAddToPlaylist={() => setPlaylistTarget(item as MediaItem)} />;
        if (view === "folders") return <FolderRow folder={item as unknown as Folder} onPress={() => setSelectedFolder(item as unknown as Folder)} />;
        return <PlaylistRow playlist={item as unknown as VideoPlaylist} onPress={() => setSelectedPlaylist(item as unknown as VideoPlaylist)} />;
      }}
      ListHeaderComponent={<>
        <View style={styles.header}>
          <Pressable onPress={goBack} style={styles.headerButton} accessibilityLabel="رجوع"><MaterialIcons name="arrow-forward" size={25} color={colors.text} /></Pressable>
          <Text style={styles.headerTitle}>الفيديو</Text>
          <View style={styles.headerActions}>
            <Pressable onPress={() => void refreshDeviceLibrary()} style={styles.headerButton} accessibilityLabel="فهرسة الفيديوهات"><MaterialIcons name={isRefreshing ? "sync" : "refresh"} size={22} color={colors.text} /></Pressable>
            <Pressable onPress={() => void importFiles()} style={styles.headerButton} accessibilityLabel="استيراد فيديو"><MaterialIcons name="add-circle-outline" size={26} color={colors.text} /></Pressable>
          </View>
        </View>
        <View style={styles.search}><MaterialIcons name="search" size={21} color={colors.muted} /><TextInput value={query} onChangeText={setQuery} placeholder="ابحث في فيديوهاتك" placeholderTextColor={colors.muted} style={styles.searchInput} textAlign="right" returnKeyType="search" /></View>
        <View style={styles.viewTabs}>{views.map((option) => <Pressable key={option.id} onPress={() => setView(option.id)} style={[styles.viewTab, view === option.id && styles.viewTabActive]}><MaterialIcons name={option.icon} size={18} color={view === option.id ? colors.background : colors.muted} /><Text style={[styles.viewTabText, view === option.id && styles.viewTabTextActive]}>{option.label}</Text></Pressable>)}</View>
        <View style={styles.libraryLine}><Text style={styles.libraryCount}>{view === "grid" ? `${matchingVideos.length} مقطع` : view === "folders" ? `${folders.length} مجلدات` : `${videoPlaylists.length} قوائم فيديو`}</Text><Pressable onPress={() => setSort((current) => nextMediaSort(current))} style={styles.sortButton} accessibilityLabel="تغيير ترتيب الفيديوهات"><MaterialIcons name="sort" size={17} color={colors.cyan} /><Text style={styles.sortText}>{sort === "recent" ? "الأحدث" : sort === "title" ? "العنوان" : "المدة"}</Text></Pressable><Text style={styles.libraryHint}>مكتبتك المحلية</Text></View>
      </>}
      ListEmptyComponent={<EmptyState icon={view === "folders" ? "folder" : view === "playlists" ? "queue-music" : "video-library"} title={query ? "لا توجد نتائج مطابقة" : view === "playlists" ? "لا توجد قوائم فيديو" : "لا توجد فيديوهات هنا"} description={query ? "جرّب كلمة أخرى أو امسح البحث للعودة إلى مكتبتك كاملة." : view === "playlists" ? "أضف مقطعاً إلى قائمة من زر القائمة على بطاقة الفيديو." : "استورد مقاطعك أو افحص مكتبة الجهاز لتظهر هنا."} actionLabel={query || view === "playlists" ? undefined : isRefreshing ? "جارِ الفهرسة..." : "فهرسة الفيديوهات"} onAction={query || view === "playlists" ? undefined : () => void refreshDeviceLibrary()} />}
      contentContainerStyle={[styles.list, view === "grid" && styles.gridList]}
    />
    <PlaylistPicker visible={Boolean(playlistTarget)} playlists={playlists} name={newPlaylistName} onNameChange={setNewPlaylistName} onChoose={(id) => void addToPlaylist(id)} onCreate={() => void createVideoPlaylist()} onClose={() => { setPlaylistTarget(null); setNewPlaylistName(""); }} />
  </ScreenContainer>;
}

function FolderDetail({ folder, onBack, onOpenVideo }: { folder: Folder; onBack: () => void; onOpenVideo: (item: MediaItem) => void }) {
  return <ScreenContainer className="px-0"><DetailHeader title={folder.name} subtitle={`${folder.items.length} مقاطع فيديو · ${folder.path}`} onBack={onBack} /><FlatList data={folder.items} keyExtractor={(item) => item.id} renderItem={({ item }) => <MediaRow item={item} onPress={() => onOpenVideo(item)} />} contentContainerStyle={styles.detailList} /></ScreenContainer>;
}

function PlaylistDetail({ playlist, onBack, onOpenVideo }: { playlist: VideoPlaylist; onBack: () => void; onOpenVideo: (item: MediaItem) => void }) {
  return <ScreenContainer className="px-0"><DetailHeader title={playlist.name} subtitle={`${playlist.items.length} مقاطع فيديو`} onBack={onBack} /><FlatList data={playlist.items} keyExtractor={(item) => item.id} renderItem={({ item }) => <MediaRow item={item} onPress={() => onOpenVideo(item)} />} contentContainerStyle={styles.detailList} /></ScreenContainer>;
}

function DetailHeader({ title, subtitle, onBack }: { title: string; subtitle: string; onBack: () => void }) {
  return <View style={styles.detailHeader}><Pressable onPress={onBack} style={styles.headerButton}><MaterialIcons name="arrow-forward" size={24} color={colors.text} /></Pressable><View style={styles.detailCopy}><Text numberOfLines={1} style={styles.detailTitle}>{title}</Text><Text style={styles.detailSubtitle}>{subtitle}</Text></View></View>;
}

function VideoCard({ item, onPress, onAddToPlaylist }: { item: MediaItem; onPress: () => void; onAddToPlaylist: () => void }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.videoCard, pressed && styles.pressed]}>
    <View style={styles.videoPreview}>
      {item.thumbnailUri ? <Image source={{ uri: item.thumbnailUri }} style={styles.thumbnail} /> : <Artwork item={item} size={60} />}
      <View style={styles.playShade}><MaterialIcons name="play-circle-filled" size={37} color="rgba(255,255,255,0.92)" /></View>
      <View style={styles.durationBadge}><Text style={styles.durationText}>{item.duration ? formatDuration(item.duration) : "فيديو"}</Text></View>
      <Pressable onPress={(event) => { event.stopPropagation(); onAddToPlaylist(); }} style={styles.addToPlaylist} accessibilityLabel="إضافة إلى قائمة تشغيل"><MaterialIcons name="playlist-add" size={19} color={colors.text} /></Pressable>
    </View>
    <Text numberOfLines={2} style={styles.videoTitle}>{item.title}</Text>
    <Text numberOfLines={1} style={styles.videoMeta}>{getMediaFolderName(getMediaFolderPath(item.uri))}</Text>
  </Pressable>;
}

function FolderRow({ folder, onPress }: { folder: Folder; onPress: () => void }) { return <Pressable onPress={onPress} style={({ pressed }) => [styles.collectionRow, pressed && styles.pressed]}><View style={styles.collectionIcon}><MaterialIcons name="folder" size={28} color="#B7C0CC" /></View><View style={styles.collectionCopy}><Text numberOfLines={1} style={styles.collectionTitle}>{folder.name}</Text><Text numberOfLines={1} style={styles.collectionMeta}>{folder.items.length} مقاطع فيديو · {folder.path}</Text></View><MaterialIcons name="chevron-left" size={23} color={colors.muted} /></Pressable>; }
function PlaylistRow({ playlist, onPress }: { playlist: VideoPlaylist; onPress: () => void }) { return <Pressable onPress={onPress} style={({ pressed }) => [styles.collectionRow, pressed && styles.pressed]}><View style={[styles.collectionIcon, styles.playlistIcon]}><MaterialIcons name="queue-music" size={26} color={colors.cyan} /></View><View style={styles.collectionCopy}><Text numberOfLines={1} style={styles.collectionTitle}>{playlist.name}</Text><Text style={styles.collectionMeta}>{playlist.items.length} مقاطع فيديو</Text></View><MaterialIcons name="chevron-left" size={23} color={colors.muted} /></Pressable>; }

function PlaylistPicker({ visible, playlists, name, onNameChange, onChoose, onCreate, onClose }: { visible: boolean; playlists: Playlist[]; name: string; onNameChange: (value: string) => void; onChoose: (id: string) => void; onCreate: () => void; onClose: () => void }) {
  return <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}><Pressable onPress={onClose} style={styles.modalBackdrop}><Pressable onPress={() => undefined} style={styles.pickerSheet}><Text style={styles.pickerTitle}>إضافة إلى قائمة تشغيل</Text>{playlists.map((playlist) => <Pressable key={playlist.id} onPress={() => onChoose(playlist.id)} style={styles.pickerRow}><MaterialIcons name="queue-music" size={20} color={colors.cyan} /><Text style={styles.pickerText}>{playlist.name}</Text><MaterialIcons name="chevron-left" size={20} color={colors.muted} /></Pressable>)}<View style={styles.createRow}><TextInput value={name} onChangeText={onNameChange} placeholder="اسم قائمة فيديو جديدة" placeholderTextColor={colors.muted} style={styles.createInput} textAlign="right" returnKeyType="done" onSubmitEditing={onCreate} /><Pressable onPress={onCreate} style={styles.createButton}><MaterialIcons name="add" size={20} color={colors.background} /></Pressable></View><Pressable onPress={onClose} style={styles.cancelButton}><Text style={styles.cancelText}>إلغاء</Text></Pressable></Pressable></Pressable></Modal>;
}

const styles = StyleSheet.create({
  header: { height: 66, paddingHorizontal: 16, flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between" }, headerTitle: { color: colors.text, fontSize: 24, fontWeight: "900" }, headerActions: { flexDirection: "row-reverse", gap: 3 }, headerButton: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface }, search: { minHeight: 49, marginHorizontal: 16, paddingHorizontal: 14, borderRadius: 16, flexDirection: "row-reverse", alignItems: "center", gap: 8, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, searchInput: { flex: 1, minHeight: 44, color: colors.text, fontSize: 13 }, viewTabs: { marginTop: 13, marginHorizontal: 16, flexDirection: "row-reverse", gap: 8 }, viewTab: { flex: 1, minHeight: 39, borderRadius: 13, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 5 }, viewTabActive: { backgroundColor: colors.cyan, borderColor: colors.cyan }, viewTabText: { color: colors.muted, fontSize: 11, fontWeight: "800" }, viewTabTextActive: { color: colors.background }, libraryLine: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 10, flexDirection: "row-reverse", alignItems: "center", gap: 8 }, libraryCount: { color: colors.text, fontSize: 14, fontWeight: "900" }, libraryHint: { color: colors.muted, fontSize: 11, marginRight: "auto" }, sortButton: { minHeight: 30, paddingHorizontal: 8, borderRadius: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, flexDirection: "row-reverse", alignItems: "center", gap: 4 }, sortText: { color: colors.cyan, fontSize: 10, fontWeight: "800" }, list: { paddingBottom: 98 }, gridList: { paddingHorizontal: 12 }, gridRow: { gap: 10 }, videoCard: { flex: 1, maxWidth: "50%", padding: 4, marginBottom: 12 }, videoPreview: { height: 112, borderRadius: 15, overflow: "hidden", justifyContent: "center", alignItems: "center", backgroundColor: "#0D3E52", borderWidth: 1, borderColor: "#1B627D" }, thumbnail: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" }, playShade: { position: "absolute", alignItems: "center", justifyContent: "center", width: 50, height: 50, borderRadius: 25, backgroundColor: "rgba(0,0,0,0.25)" }, durationBadge: { position: "absolute", bottom: 7, right: 7, paddingHorizontal: 6, minHeight: 21, borderRadius: 7, backgroundColor: "rgba(0,0,0,0.76)", justifyContent: "center" }, durationText: { color: colors.text, fontSize: 10, fontWeight: "800" }, addToPlaylist: { position: "absolute", top: 6, left: 6, width: 31, height: 31, borderRadius: 10, backgroundColor: "rgba(0,0,0,0.58)", alignItems: "center", justifyContent: "center" }, videoTitle: { color: colors.text, fontSize: 12, lineHeight: 18, fontWeight: "800", textAlign: "right", marginTop: 6 }, videoMeta: { color: colors.muted, fontSize: 10, lineHeight: 15, textAlign: "right" }, collectionRow: { minHeight: 76, paddingHorizontal: 16, backgroundColor: colors.surface, flexDirection: "row-reverse", alignItems: "center", gap: 12, borderBottomWidth: 1, borderColor: colors.border }, collectionIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: "#223148", alignItems: "center", justifyContent: "center" }, playlistIcon: { backgroundColor: "#102C3C" }, collectionCopy: { flex: 1, alignItems: "flex-end" }, collectionTitle: { color: colors.text, fontSize: 16, fontWeight: "800", textAlign: "right" }, collectionMeta: { color: colors.muted, fontSize: 11, marginTop: 3 }, detailHeader: { minHeight: 74, paddingHorizontal: 16, flexDirection: "row-reverse", alignItems: "center", gap: 10 }, detailCopy: { flex: 1, alignItems: "flex-end" }, detailTitle: { color: colors.text, fontSize: 20, fontWeight: "900", textAlign: "right" }, detailSubtitle: { color: colors.muted, fontSize: 11, marginTop: 2 }, detailList: { paddingBottom: 94, borderTopWidth: 1, borderColor: colors.border }, modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "flex-end" }, pickerSheet: { padding: 20, paddingBottom: 26, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: colors.surface, borderTopWidth: 1, borderColor: colors.border }, pickerTitle: { color: colors.text, fontSize: 18, fontWeight: "900", textAlign: "right", marginBottom: 8 }, pickerRow: { minHeight: 50, flexDirection: "row-reverse", alignItems: "center", gap: 10, borderBottomWidth: 1, borderColor: colors.border }, pickerText: { flex: 1, color: colors.text, fontSize: 14, fontWeight: "800", textAlign: "right" }, createRow: { flexDirection: "row-reverse", gap: 8, marginTop: 15 }, createInput: { flex: 1, minHeight: 45, borderRadius: 13, paddingHorizontal: 12, color: colors.text, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, fontSize: 13 }, createButton: { width: 48, height: 45, borderRadius: 13, backgroundColor: colors.cyan, alignItems: "center", justifyContent: "center" }, cancelButton: { minHeight: 42, alignItems: "center", justifyContent: "center", marginTop: 8 }, cancelText: { color: colors.cyan, fontSize: 14, fontWeight: "900" }, pressed: { opacity: 0.65 },
});
