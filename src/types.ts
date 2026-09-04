export type MediaKind = "audio" | "video";

export type MediaItem = {
  id: string;
  title: string;
  artist: string;
  album: string;
  uri: string;
  duration: number; // in seconds
  mediaType: MediaKind;
  addedAt: number;
  thumbnailUri?: string;
  lyrics?: string;
  isFavorite?: boolean;
  fileSize?: string;
};

export type Playlist = {
  id: string;
  name: string;
  itemIds: string[];
  createdAt: number;
  description?: string;
};

export type PlaybackSnapshot = {
  itemId: string | null;
  position: number;
  duration: number;
  isPlaying: boolean;
  repeatMode: "off" | "all" | "one";
  shuffle: boolean;
  volume: number;
  playbackRate: number;
};

export type AppSettings = {
  theme: "dark" | "midnight" | "deep-blue";
  defaultPlaybackRate: number;
  autoPlayNext: boolean;
  haptics: boolean;
  showMiniPlayer: boolean;
};

export type ActiveTab = "home" | "music" | "video" | "playlists" | "search" | "settings";
