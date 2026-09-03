import React, { useState, useEffect, useRef } from "react";
import { ActiveTab, AppSettings, MediaItem, Playlist } from "./types";
import { INITIAL_MEDIA_ITEMS, INITIAL_PLAYLISTS } from "./data/mockMedia";
import { Navbar } from "./components/Navbar";
import { BottomNav } from "./components/BottomNav";
import { HomeTab } from "./components/HomeTab";
import { MusicTab } from "./components/MusicTab";
import { VideoTab } from "./components/VideoTab";
import { PlaylistsTab } from "./components/PlaylistsTab";
import { SearchTab } from "./components/SearchTab";
import { SettingsTab } from "./components/SettingsTab";
import { MiniPlayer } from "./components/MiniPlayer";
import { AudioPlayerModal } from "./components/AudioPlayerModal";
import { VideoPlayerModal } from "./components/VideoPlayerModal";
import { UploadModal } from "./components/UploadModal";

export default function App() {
  // Load initial state from localStorage or defaults
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(() => {
    const saved = localStorage.getItem("remo_media_items");
    return saved ? JSON.parse(saved) : INITIAL_MEDIA_ITEMS;
  });

  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    const saved = localStorage.getItem("remo_playlists");
    return saved ? JSON.parse(saved) : INITIAL_PLAYLISTS;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem("remo_settings");
    return saved ? JSON.parse(saved) : {
      theme: "dark",
      defaultPlaybackRate: 1.0,
      autoPlayNext: true,
      haptics: true,
      showMiniPlayer: true,
    };
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>("home");

  // Playback state
  const [currentTrack, setCurrentTrack] = useState<MediaItem | null>(null);
  const [currentVideo, setCurrentVideo] = useState<MediaItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [repeatMode, setRepeatMode] = useState<"off" | "all" | "one">("off");
  const [shuffle, setShuffle] = useState(false);

  // Modals
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Audio element ref
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("remo_media_items", JSON.stringify(mediaItems));
  }, [mediaItems]);

  useEffect(() => {
    localStorage.setItem("remo_playlists", JSON.stringify(playlists));
  }, [playlists]);

  useEffect(() => {
    localStorage.setItem("remo_settings", JSON.stringify(settings));
  }, [settings]);

  // Handle track selection & play
  const handlePlayItem = (item: MediaItem) => {
    if (item.mediaType === "video") {
      setCurrentVideo(item);
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      }
    } else {
      setCurrentTrack(item);
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.src = item.uri;
        audioRef.current.playbackRate = playbackRate;
        audioRef.current.volume = volume;
        audioRef.current.play().catch((err) => console.log("Playback error:", err));
      }
    }
  };

  const handleTogglePlay = () => {
    if (!currentTrack) return;
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      audioRef.current?.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleNext = () => {
    if (!currentTrack) return;
    const audioList = mediaItems.filter((i) => i.mediaType === "audio");
    const currentIndex = audioList.findIndex((i) => i.id === currentTrack.id);
    let nextIndex = currentIndex + 1;
    if (shuffle) {
      nextIndex = Math.floor(Math.random() * audioList.length);
    } else if (nextIndex >= audioList.length) {
      nextIndex = 0;
    }
    if (audioList[nextIndex]) {
      handlePlayItem(audioList[nextIndex]);
    }
  };

  const handlePrev = () => {
    if (!currentTrack) return;
    const audioList = mediaItems.filter((i) => i.mediaType === "audio");
    const currentIndex = audioList.findIndex((i) => i.id === currentTrack.id);
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) prevIndex = audioList.length - 1;
    if (audioList[prevIndex]) {
      handlePlayItem(audioList[prevIndex]);
    }
  };

  const handleToggleFavorite = (id: string) => {
    setMediaItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isFavorite: !item.isFavorite } : item))
    );
    if (currentTrack && currentTrack.id === id) {
      setCurrentTrack((prev) => (prev ? { ...prev, isFavorite: !prev.isFavorite } : null));
    }
  };

  const handleAddToPlaylist = (playlistId: string, itemId: string) => {
    setPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id === playlistId) {
          const exists = pl.itemIds.includes(itemId);
          return {
            ...pl,
            itemIds: exists ? pl.itemIds.filter((id) => id !== itemId) : [...pl.itemIds, itemId],
          };
        }
        return pl;
      })
    );
  };

  const handleCreatePlaylist = (name: string, description: string) => {
    const newPl: Playlist = {
      id: `pl-${Date.now()}`,
      name,
      description,
      itemIds: [],
      createdAt: Date.now(),
    };
    setPlaylists((prev) => [...prev, newPl]);
  };

  const handleDeletePlaylist = (id: string) => {
    setPlaylists((prev) => prev.filter((p) => p.id !== id));
  };

  const handleAddMedia = (newItem: MediaItem) => {
    setMediaItems((prev) => [newItem, ...prev]);
    if (newItem.mediaType === "audio") {
      handlePlayItem(newItem);
    } else {
      setCurrentVideo(newItem);
    }
  };

  const handleResetData = () => {
    setMediaItems(INITIAL_MEDIA_ITEMS);
    setPlaylists(INITIAL_PLAYLISTS);
    localStorage.removeItem("remo_media_items");
    localStorage.removeItem("remo_playlists");
  };

  return (
    <div className="min-h-screen bg-[#08111F] text-[#F4F8FF] font-['Cairo',sans-serif] flex flex-col selection:bg-[#2EC5FF]/30">
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
        onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
        onEnded={() => {
          if (repeatMode === "one" && audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
          } else {
            handleNext();
          }
        }}
      />

      {/* Top Navbar */}
      <Navbar
        onOpenUpload={() => setShowUploadModal(true)}
        onSearchClick={() => setActiveTab("search")}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === "home" && (
          <HomeTab
            mediaItems={mediaItems}
            playlists={playlists}
            onPlayItem={handlePlayItem}
            onChangeTab={setActiveTab}
            currentTrack={currentTrack}
          />
        )}
        {activeTab === "music" && (
          <MusicTab
            mediaItems={mediaItems}
            playlists={playlists}
            onPlayTrack={handlePlayItem}
            onToggleFavorite={handleToggleFavorite}
            onAddToPlaylist={handleAddToPlaylist}
            onOpenUpload={() => setShowUploadModal(true)}
          />
        )}
        {activeTab === "video" && (
          <VideoTab
            mediaItems={mediaItems}
            onPlayVideo={handlePlayItem}
            onOpenUpload={() => setShowUploadModal(true)}
          />
        )}
        {activeTab === "playlists" && (
          <PlaylistsTab
            playlists={playlists}
            mediaItems={mediaItems}
            onCreatePlaylist={handleCreatePlaylist}
            onDeletePlaylist={handleDeletePlaylist}
            onPlayTrack={handlePlayItem}
          />
        )}
        {activeTab === "search" && (
          <SearchTab mediaItems={mediaItems} onPlayItem={handlePlayItem} />
        )}
        {activeTab === "settings" && (
          <SettingsTab
            settings={settings}
            onUpdateSettings={(newSet) => setSettings((s) => ({ ...s, ...newSet }))}
            mediaItems={mediaItems}
            playlists={playlists}
            onResetData={handleResetData}
          />
        )}
      </main>

      {/* Mini Player */}
      {settings.showMiniPlayer && (
        <MiniPlayer
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          onTogglePlay={handleTogglePlay}
          onNext={handleNext}
          onOpenModal={() => setShowAudioModal(true)}
          onClose={() => {
            audioRef.current?.pause();
            setIsPlaying(false);
            setCurrentTrack(null);
          }}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />

      {/* Full Audio Player Modal */}
      {showAudioModal && currentTrack && (
        <AudioPlayerModal
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          playbackRate={playbackRate}
          repeatMode={repeatMode}
          shuffle={shuffle}
          onTogglePlay={handleTogglePlay}
          onSeek={handleSeek}
          onNext={handleNext}
          onPrev={handlePrev}
          onVolumeChange={(v) => {
            setVolume(v);
            if (audioRef.current) audioRef.current.volume = v;
          }}
          onSpeedChange={(r) => {
            setPlaybackRate(r);
            if (audioRef.current) audioRef.current.playbackRate = r;
          }}
          onToggleRepeat={() =>
            setRepeatMode((m) => (m === "off" ? "all" : m === "all" ? "one" : "off"))
          }
          onToggleShuffle={() => setShuffle(!shuffle)}
          onToggleFavorite={handleToggleFavorite}
          onClose={() => setShowAudioModal(false)}
        />
      )}

      {/* Video Player Modal */}
      {currentVideo && (
        <VideoPlayerModal
          video={currentVideo}
          onClose={() => setCurrentVideo(null)}
        />
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onAddMedia={handleAddMedia}
        />
      )}
    </div>
  );
}
