import React, { useState } from "react";
import { ListMusic, Plus, Trash2, Music, Play, ChevronLeft } from "lucide-react";
import { Playlist, MediaItem } from "../types";

interface PlaylistsTabProps {
  playlists: Playlist[];
  mediaItems: MediaItem[];
  onCreatePlaylist: (name: string, description: string) => void;
  onDeletePlaylist: (id: string) => void;
  onPlayTrack: (item: MediaItem) => void;
}

export const PlaylistsTab: React.FC<PlaylistsTabProps> = ({
  playlists,
  mediaItems,
  onCreatePlaylist,
  onDeletePlaylist,
  onPlayTrack,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDesc, setNewPlaylistDesc] = useState("");
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    onCreatePlaylist(newPlaylistName.trim(), newPlaylistDesc.trim());
    setNewPlaylistName("");
    setNewPlaylistDesc("");
    setShowCreateModal(false);
  };

  const selectedPlaylist = playlists.find((p) => p.id === selectedPlaylistId);
  const playlistItems = selectedPlaylist
    ? mediaItems.filter((i) => selectedPlaylist.itemIds.includes(i.id))
    : [];

  return (
    <div className="space-y-4 pb-28 px-4 pt-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#F4F8FF] tracking-tight">قوائم التشغيل</h2>
          <p className="text-xs text-[#91A1B7]">نظم ملفاتك المفضلة في قوائم مخصصة</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2EC5FF] text-[#08111F] text-xs font-bold shadow-lg shadow-[#2EC5FF]/20 hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          <span>قائمة جديدة</span>
        </button>
      </div>

      {selectedPlaylist ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-[#111F33] p-4 rounded-2xl border border-[#1f3554]">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedPlaylistId(null)}
                className="p-2 rounded-xl bg-[#08111F] text-[#2EC5FF] hover:bg-[#1a2d4a]"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h3 className="text-base font-bold text-[#F4F8FF]">{selectedPlaylist.name}</h3>
                <p className="text-xs text-[#91A1B7]">{selectedPlaylist.description || "قائمة تشغيل محلية"} • {playlistItems.length} عنصر</p>
              </div>
            </div>

            <button
              onClick={() => {
                onDeletePlaylist(selectedPlaylist.id);
                setSelectedPlaylistId(null);
              }}
              className="p-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
              title="حذف القائمة"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            {playlistItems.length === 0 ? (
              <div className="text-center py-12 text-[#91A1B7] text-xs">القائمة فارغة حالياً. أضف بعض الملفات من مكتبة الموسيقى.</div>
            ) : (
              playlistItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onPlayTrack(item)}
                  className="bg-[#111F33] hover:bg-[#182842] border border-[#1f3554] rounded-2xl p-3 flex items-center gap-3 cursor-pointer transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#08111F] flex items-center justify-center text-[#2EC5FF]">
                    <Music className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-[#F4F8FF] truncate">{item.title}</h4>
                    <p className="text-xs text-[#91A1B7] truncate">{item.artist}</p>
                  </div>
                  <Play className="w-4 h-4 text-[#2EC5FF] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {playlists.map((pl) => (
            <div
              key={pl.id}
              onClick={() => setSelectedPlaylistId(pl.id)}
              className="bg-[#111F33] hover:bg-[#182842] border border-[#1f3554] rounded-2xl p-4 cursor-pointer transition-all shadow-sm group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-[#2EC5FF]/10 text-[#2EC5FF] flex items-center justify-center">
                  <ListMusic className="w-5 h-5" />
                </div>
                <span className="text-[11px] bg-[#08111F] text-[#91A1B7] px-2.5 py-1 rounded-full">
                  {pl.itemIds.length} عنصر
                </span>
              </div>
              <h3 className="text-base font-bold text-[#F4F8FF] group-hover:text-[#2EC5FF] transition-colors">{pl.name}</h3>
              <p className="text-xs text-[#91A1B7] truncate mt-1">{pl.description || "بدون وصف"}</p>
            </div>
          ))}
        </div>
      )}

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111F33] border border-[#1f3554] rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-[#F4F8FF] mb-4">إنشاء قائمة تشغيل جديدة</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#91A1B7] mb-1">اسم القائمة</label>
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="مثال: أغاني السفر والرحلات"
                  className="w-full bg-[#08111F] border border-[#1f3554] rounded-xl px-4 py-2.5 text-sm text-[#F4F8FF] focus:outline-none focus:border-[#2EC5FF]"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#91A1B7] mb-1">الوصف (اختياري)</label>
                <input
                  type="text"
                  value={newPlaylistDesc}
                  onChange={(e) => setNewPlaylistDesc(e.target.value)}
                  placeholder="وصف مختصر لمحتوى القائمة"
                  className="w-full bg-[#08111F] border border-[#1f3554] rounded-xl px-4 py-2.5 text-sm text-[#F4F8FF] focus:outline-none focus:border-[#2EC5FF]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[#91A1B7] hover:bg-[#08111F]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#2EC5FF] text-[#08111F] text-xs font-bold shadow-lg shadow-[#2EC5FF]/20"
                >
                  إنشاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
