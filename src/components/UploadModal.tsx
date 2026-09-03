import React, { useState } from "react";
import { Upload, X, Music, Video, Link as LinkIcon } from "lucide-react";
import { MediaItem, MediaKind } from "../types";

interface UploadModalProps {
  onClose: () => void;
  onAddMedia: (item: MediaItem) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ onClose, onAddMedia }) => {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [album, setAlbum] = useState("");
  const [uri, setUri] = useState("");
  const [mediaType, setMediaType] = useState<MediaKind>("audio");
  const [duration, setDuration] = useState("180");
  const [thumbnailUri, setThumbnailUri] = useState("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setUri(objectUrl);
    setTitle(file.name.replace(/\.[^/.]+$/, ""));
    setArtist("ملف محلي");
    setAlbum("مكتبتي");

    if (file.type.startsWith("video")) {
      setMediaType("video");
      setThumbnailUri("https://images.unsplash.com/photo-1536240478700-b869070f9279?w=400&q=80");
    } else {
      setMediaType("audio");
      setThumbnailUri("https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !uri.trim()) return;

    const newItem: MediaItem = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      artist: artist.trim() || "فنان غير معروف",
      album: album.trim() || "ألبوم محلي",
      uri: uri.trim(),
      duration: parseInt(duration) || 180,
      mediaType,
      addedAt: Date.now(),
      thumbnailUri: thumbnailUri.trim() || undefined,
      isFavorite: false,
    };

    onAddMedia(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111F33] border border-[#1f3554] rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#F4F8FF] flex items-center gap-2">
            <Upload className="w-5 h-5 text-[#2EC5FF]" /> إضافة ملف وسائط جديد
          </h3>
          <button onClick={onClose} className="p-1 rounded-xl text-[#91A1B7] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Local File Picker */}
        <div className="bg-[#08111F] border border-dashed border-[#2EC5FF]/40 rounded-2xl p-6 text-center">
          <input
            type="file"
            accept="audio/*,video/*"
            onChange={handleFileUpload}
            className="hidden"
            id="local-file-input"
          />
          <label htmlFor="local-file-input" className="cursor-pointer flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-[#2EC5FF]/10 text-[#2EC5FF] flex items-center justify-center">
              <Upload className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-[#F4F8FF]">اختر ملف من جهازك (موسيقى أو فيديو)</span>
            <span className="text-xs text-[#91A1B7]">MP3, MP4, WAV, AAC, M4A</span>
          </label>
        </div>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-[#1f3554]"></div>
          <span className="flex-shrink mx-4 text-xs text-[#91A1B7]">أو أدخل الرابط والبيانات يدوياً</span>
          <div className="flex-grow border-t border-[#1f3554]"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-[#91A1B7] mb-1">نوع الوسائط</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMediaType("audio")}
                className={`py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
                  mediaType === "audio"
                    ? "bg-[#2EC5FF] text-[#08111F] border-[#2EC5FF]"
                    : "bg-[#08111F] text-[#91A1B7] border-[#1f3554]"
                }`}
              >
                <Music className="w-4 h-4" /> صوت
              </button>
              <button
                type="button"
                onClick={() => setMediaType("video")}
                className={`py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
                  mediaType === "video"
                    ? "bg-[#2EC5FF] text-[#08111F] border-[#2EC5FF]"
                    : "bg-[#08111F] text-[#91A1B7] border-[#1f3554]"
                }`}
              >
                <Video className="w-4 h-4" /> فيديو
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#91A1B7] mb-1">عنوان الملف *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="اسم الأغنية أو الفيديو"
              className="w-full bg-[#08111F] border border-[#1f3554] rounded-xl px-4 py-2.5 text-sm text-[#F4F8FF] focus:outline-none focus:border-[#2EC5FF]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#91A1B7] mb-1">الفنان / المنشئ</label>
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="اسم الفنان"
                className="w-full bg-[#08111F] border border-[#1f3554] rounded-xl px-4 py-2.5 text-sm text-[#F4F8FF] focus:outline-none focus:border-[#2EC5FF]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#91A1B7] mb-1">الألبوم</label>
              <input
                type="text"
                value={album}
                onChange={(e) => setAlbum(e.target.value)}
                placeholder="اسم الألبوم"
                className="w-full bg-[#08111F] border border-[#1f3554] rounded-xl px-4 py-2.5 text-sm text-[#F4F8FF] focus:outline-none focus:border-[#2EC5FF]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#91A1B7] mb-1">رابط الملف (URI) *</label>
            <input
              type="text"
              value={uri}
              onChange={(e) => setUri(e.target.value)}
              placeholder="https://..."
              className="w-full bg-[#08111F] border border-[#1f3554] rounded-xl px-4 py-2.5 text-sm text-[#F4F8FF] focus:outline-none focus:border-[#2EC5FF]"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[#91A1B7] hover:bg-[#08111F]"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#2EC5FF] text-[#08111F] text-xs font-bold shadow-lg shadow-[#2EC5FF]/20"
            >
              إضافة للمكتبة
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
