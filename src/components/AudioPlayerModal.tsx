import React, { useState } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Volume2,
  Heart,
  ChevronDown,
  Disc3,
  Sliders,
  FileText,
  Cast,
} from "lucide-react";
import { MediaItem } from "../types";
import { LyricsView } from "./LyricsView";
import { EqualizerModal } from "./EqualizerModal";
import { CastModal } from "./CastModal";

interface AudioPlayerModalProps {
  currentTrack: MediaItem | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  repeatMode: "off" | "all" | "one";
  shuffle: boolean;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onVolumeChange: (vol: number) => void;
  onSpeedChange: (rate: number) => void;
  onToggleRepeat: () => void;
  onToggleShuffle: () => void;
  onToggleFavorite: (id: string) => void;
  onClose: () => void;
}

export const AudioPlayerModal: React.FC<AudioPlayerModalProps> = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  playbackRate,
  repeatMode,
  shuffle,
  onTogglePlay,
  onSeek,
  onNext,
  onPrev,
  onVolumeChange,
  onSpeedChange,
  onToggleRepeat,
  onToggleShuffle,
  onToggleFavorite,
  onClose,
}) => {
  const [showLyrics, setShowLyrics] = useState(false);
  const [showEqualizer, setShowEqualizer] = useState(false);
  const [showCastModal, setShowCastModal] = useState(false);

  if (!currentTrack) return null;

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "0:00";
    const mins = Math.floor(secs / 60);
    const remain = Math.floor(secs % 60);
    return `${mins}:${remain < 10 ? "0" : ""}${remain}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const speeds = [0.25, 0.5, 1.0, 1.5, 2.0, 4.0];

  return (
    <div className="fixed inset-0 z-50 bg-[#08111F]/95 backdrop-blur-2xl flex flex-col justify-between p-6 max-w-lg mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onClose}
          className="p-2.5 rounded-2xl bg-[#111F33] text-[#91A1B7] hover:text-white border border-[#1f3554]"
          title="تصغير"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        <div className="text-center">
          <span className="text-[10px] tracking-widest text-[#2EC5FF] font-semibold uppercase">قيد التشغيل الآن</span>
          <h3 className="text-xs text-[#91A1B7]">{currentTrack.album}</h3>
        </div>

        <button
          onClick={() => onToggleFavorite(currentTrack.id)}
          className={`p-2.5 rounded-2xl border transition-colors ${
            currentTrack.isFavorite
              ? "bg-red-500/10 border-red-500/30 text-red-400"
              : "bg-[#111F33] border-[#1f3554] text-[#91A1B7] hover:text-red-400"
          }`}
        >
          <Heart className={`w-5 h-5 ${currentTrack.isFavorite ? "fill-current" : ""}`} />
        </button>
      </div>

      {/* Main Art / Lyrics View */}
      <div className="my-auto flex flex-col items-center w-full max-w-md">
        {showLyrics ? (
          <div className="w-full">
            <LyricsView currentTrack={currentTrack} currentTime={currentTime} onSeekToTime={onSeek} />
          </div>
        ) : (
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl overflow-hidden bg-[#111F33] border-4 border-[#1f3554] shadow-2xl shadow-[#2EC5FF]/10 flex items-center justify-center">
            {currentTrack.thumbnailUri ? (
              <img src={currentTrack.thumbnailUri} alt="" className={`w-full h-full object-cover ${isPlaying ? "scale-105" : ""} transition-transform duration-700`} />
            ) : (
              <Disc3 className={`w-32 h-32 text-[#2EC5FF] ${isPlaying ? "animate-spin" : ""}`} style={{ animationDuration: "10s" }} />
            )}
            {isPlaying && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                <span className="text-xs text-[#2EC5FF] font-semibold bg-black/40 px-3 py-1 rounded-full backdrop-blur-md">
                  صوت عالي الدقة
                </span>
              </div>
            )}
          </div>
        )}

        {/* Title & Artist */}
        <div className="text-center mt-6">
          <h2 className="text-xl font-bold text-[#F4F8FF] mb-1">{currentTrack.title}</h2>
          <p className="text-sm text-[#91A1B7]">{currentTrack.artist}</p>
        </div>
      </div>

      {/* Controls & Progress */}
      <div className="space-y-4">
        {/* Seek bar */}
        <div className="space-y-1">
          <div className="relative w-full flex items-center">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => onSeek(parseFloat(e.target.value))}
              className="w-full h-2 bg-[#111F33] rounded-lg appearance-none cursor-pointer accent-[#2EC5FF]"
            />
          </div>
          <div className="flex justify-between text-xs text-[#91A1B7]">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Playback Buttons */}
        <div className="flex items-center justify-around">
          <button
            onClick={onToggleShuffle}
            className={`p-2.5 rounded-xl transition-colors ${shuffle ? "text-[#2EC5FF] bg-[#2EC5FF]/10" : "text-[#91A1B7]"}`}
            title="تشغيل عشوائي"
          >
            <Shuffle className="w-5 h-5" />
          </button>

          <button
            onClick={onPrev}
            className="p-3 rounded-2xl bg-[#111F33] text-[#F4F8FF] hover:bg-[#1f3554] transition-colors"
            title="السابق"
          >
            <SkipBack className="w-6 h-6" />
          </button>

          <button
            onClick={onTogglePlay}
            className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#2EC5FF] to-[#8B5CF6] text-white flex items-center justify-center shadow-xl shadow-[#2EC5FF]/30 hover:scale-105 transition-transform"
          >
            {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current translate-x-0.5" />}
          </button>

          <button
            onClick={onNext}
            className="p-3 rounded-2xl bg-[#111F33] text-[#F4F8FF] hover:bg-[#1f3554] transition-colors"
            title="التالي"
          >
            <SkipForward className="w-6 h-6" />
          </button>

          <button
            onClick={onToggleRepeat}
            className={`p-2.5 rounded-xl transition-colors ${repeatMode !== "off" ? "text-[#2EC5FF] bg-[#2EC5FF]/10" : "text-[#91A1B7]"}`}
            title="تكرار"
          >
            <Repeat className="w-5 h-5" />
          </button>
        </div>

        {/* Secondary options (Lyrics, Equalizer, Cast, Volume) */}
        <div className="flex items-center justify-between pt-2 border-t border-[#111F33]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLyrics(!showLyrics)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs transition-colors ${
                showLyrics ? "bg-[#2EC5FF] text-[#08111F] font-bold" : "bg-[#111F33] text-[#91A1B7] hover:text-white"
              }`}
              title="كلمات الأغنية"
            >
              <FileText className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowEqualizer(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs bg-[#111F33] text-[#91A1B7] hover:text-white transition-colors"
              title="المعادل الرسومي (Equalizer)"
            >
              <Sliders className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowCastModal(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs bg-[#111F33] text-[#91A1B7] hover:text-white transition-colors"
              title="بث إلى التلفزيون"
            >
              <Cast className="w-4 h-4" />
            </button>
          </div>

          {/* Speed selector */}
          <div className="flex items-center gap-0.5 bg-[#111F33] px-1.5 py-1 rounded-xl">
            {speeds.map((rate) => (
              <button
                key={rate}
                onClick={() => onSpeedChange(rate)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                  playbackRate === rate ? "bg-[#2EC5FF] text-[#08111F]" : "text-[#91A1B7] hover:text-white"
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>

          {/* Volume */}
          <div className="flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-[#91A1B7]" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-16 h-1.5 bg-[#111F33] rounded-lg accent-[#2EC5FF]"
            />
          </div>
        </div>
      </div>

      <EqualizerModal isOpen={showEqualizer} onClose={() => setShowEqualizer(false)} />
      <CastModal isOpen={showCastModal} onClose={() => setShowCastModal(false)} media={currentTrack} />
    </div>
  );
};
