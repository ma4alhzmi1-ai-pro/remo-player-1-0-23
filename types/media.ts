export type MediaKind = "audio" | "video";

export type MediaItem = {
  id: string;
  title: string;
  artist: string;
  album: string;
  uri: string;
  duration: number;
  mediaType: MediaKind;
  addedAt: number;
  thumbnailUri?: string;
  lyrics?: string;
  isFavorite?: boolean;
};

export type Playlist = {
  id: string;
  name: string;
  itemIds: string[];
  createdAt: number;
};

export type PlaybackSnapshot = {
  itemId: string;
  position: number;
  updatedAt: number;
  volume?: number;
};
