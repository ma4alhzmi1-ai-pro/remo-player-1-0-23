import React, { useRef, useState, useEffect } from "react";
import { Play, Pause, X, Maximize2, Volume2, VolumeX, RotateCcw, RotateCw, Sun, Sliders, Cast } from "lucide-react";
import { MediaItem } from "../types";
import { CastModal } from "./CastModal";

interface VideoPlayerModalProps {
  video: MediaItem | null;
  onClose: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ video, onClose }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [brightness, setBrightness] = useState(100); // 50% to 150%
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [showCastModal, setShowCastModal] = useState(false);

  const speeds = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 3.0, 4.0];

  // Gesture overlay states
  const [overlayInfo, setOverlayInfo] = useState<{ type: "volume" | "brightness" | "seek" | "speed"; value: string } | null>(null);

  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const gestureType = useRef<"volume" | "brightness" | "seek" | null>(null);
  const initialValue = useRef<number>(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && showControls) {
      timer = setTimeout(() => setShowControls(false), 3500);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, showControls]);

  if (!video) return null;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "0:00";
    const mins = Math.floor(secs / 60);
    const remain = Math.floor(secs % 60);
    return `${mins}:${remain < 10 ? "0" : ""}${remain}`;
  };

  const handleSpeedChange = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    setOverlayInfo({ type: "speed", value: `${rate}x` });
    setTimeout(() => setOverlayInfo(null), 1000);
  };

  // Touch and Mouse gesture handlers for Android-like volume/brightness/scrubbing
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    touchStartX.current = clientX;
    touchStartY.current = clientY;

    const width = window.innerWidth;
    if (clientX < width / 3) {
      // Left side: Brightness
      gestureType.current = "brightness";
      initialValue.current = brightness;
    } else if (clientX > (width / 3) * 2) {
      // Right side: Volume
      gestureType.current = "volume";
      initialValue.current = volume;
    } else {
      // Center: Seek
      gestureType.current = "seek";
      initialValue.current = currentTime;
    }
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!gestureType.current) return;
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const deltaY = touchStartY.current - clientY; // Up is positive
    const deltaX = clientX - touchStartX.current;

    if (gestureType.current === "brightness") {
      const newBrightness = Math.min(150, Math.max(30, initialValue.current + deltaY * 0.5));
      setBrightness(newBrightness);
      setOverlayInfo({ type: "brightness", value: `${Math.round(newBrightness)}%` });
    } else if (gestureType.current === "volume") {
      const newVol = Math.min(1, Math.max(0, initialValue.current + deltaY * 0.005));
      setVolume(newVol);
      if (videoRef.current) videoRef.current.volume = newVol;
      setIsMuted(newVol === 0);
      setOverlayInfo({ type: "volume", value: `${Math.round(newVol * 100)}%` });
    } else if (gestureType.current === "seek") {
      const seekDelta = (deltaX / window.innerWidth) * duration;
      const newTime = Math.min(duration, Math.max(0, initialValue.current + seekDelta));
      setCurrentTime(newTime);
      setOverlayInfo({ type: "seek", value: formatTime(newTime) });
    }
  };

  const handleTouchEnd = () => {
    if (gestureType.current === "seek" && videoRef.current) {
      videoRef.current.currentTime = currentTime;
    }
    gestureType.current = null;
    setTimeout(() => setOverlayInfo(null), 1000);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={() => setShowControls(true)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseMoveCapture={handleTouchMove}
      onMouseUp={handleTouchEnd}
      className="fixed inset-0 z-50 bg-black flex flex-col justify-between select-none overflow-hidden"
    >
      {/* Top Header */}
      <div
        className={`absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/80 to-transparent p-4 flex items-center justify-between transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div>
          <h3 className="text-sm font-bold text-white">{video.title}</h3>
          <p className="text-xs text-gray-300">{video.artist} • {video.album}</p>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          title="إغلاق"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Video Element with Hardware Acceleration & Brightness Filter */}
      <div
        className="relative w-full h-full flex items-center justify-center cursor-pointer"
        onClick={() => {
          setShowControls(!showControls);
        }}
      >
        <video
          ref={videoRef}
          src={video.uri}
          autoPlay
          playsInline
          preload="auto"
          style={{ filter: `brightness(${brightness}%)`, transform: "translateZ(0)" }}
          onTimeUpdate={() => videoRef.current && setCurrentTime(videoRef.current.currentTime)}
          onLoadedMetadata={() => {
            if (videoRef.current) {
              setDuration(videoRef.current.duration);
              videoRef.current.playbackRate = playbackRate;
            }
          }}
          onEnded={() => setIsPlaying(false)}
          className="max-w-full max-h-full object-contain transition-all will-change-transform"
        />

        {/* Center overlay indicator for volume/brightness/seek/speed */}
        {overlayInfo && (
          <div className="absolute z-40 bg-black/80 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 flex flex-col items-center shadow-2xl">
            {overlayInfo.type === "brightness" && <Sun className="w-8 h-8 text-yellow-400 mb-1" />}
            {overlayInfo.type === "volume" && <Volume2 className="w-8 h-8 text-[#2EC5FF] mb-1" />}
            {overlayInfo.type === "seek" && <Sliders className="w-8 h-8 text-green-400 mb-1" />}
            {overlayInfo.type === "speed" && <Play className="w-8 h-8 text-purple-400 mb-1" />}
            <span className="text-lg font-bold text-white">{overlayInfo.value}</span>
          </div>
        )}

        {/* Center play/pause indicator on pause */}
        {!isPlaying && !overlayInfo && (
          <div className="absolute w-20 h-20 rounded-full bg-[#2EC5FF]/90 text-[#08111F] flex items-center justify-center shadow-2xl">
            <Play className="w-8 h-8 fill-current translate-x-0.5" />
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 space-y-3 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Speed Selector bar (0.25x to 4x) */}
        <div className="flex items-center justify-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
          {speeds.map((rate) => (
            <button
              key={rate}
              onClick={(e) => {
                e.stopPropagation();
                handleSpeedChange(rate);
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                playbackRate === rate
                  ? "bg-[#2EC5FF] text-[#08111F] shadow-lg shadow-[#2EC5FF]/30"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>

        {/* Advanced Interactive Seekbar */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-white font-semibold min-w-[35px] text-right">{formatTime(currentTime)}</span>
          <div className="relative flex-1 flex items-center h-4 cursor-pointer">
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-white/30 rounded-lg appearance-none cursor-pointer accent-[#2EC5FF]"
            />
          </div>
          <span className="text-xs text-white font-semibold min-w-[35px]">{formatTime(duration)}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!videoRef.current) return;
                videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
              }}
              className="p-2.5 rounded-xl text-gray-300 hover:text-white transition-colors"
              title="تراجع 10 ثواني"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!videoRef.current) return;
                videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 10);
              }}
              className="p-2.5 rounded-xl text-gray-300 hover:text-white transition-colors"
              title="تقدم 10 ثواني"
            >
              <RotateCw className="w-5 h-5" />
            </button>

            {/* Volume control */}
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!videoRef.current) return;
                  videoRef.current.muted = !isMuted;
                  setIsMuted(!isMuted);
                }}
                className="text-gray-300 hover:text-white"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setVolume(v);
                  if (videoRef.current) videoRef.current.volume = v;
                  setIsMuted(v === 0);
                }}
                className="w-16 h-1 bg-white/30 rounded accent-[#2EC5FF] cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowCastModal(true);
              }}
              className="p-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
              title="بث إلى التلفزيون"
            >
              <Cast className="w-5 h-5" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (document.fullscreenElement) {
                  document.exitFullscreen();
                } else {
                  document.documentElement.requestFullscreen();
                }
              }}
              className="p-2.5 rounded-xl text-gray-300 hover:text-white transition-colors"
              title="ملء الشاشة"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <CastModal isOpen={showCastModal} onClose={() => setShowCastModal(false)} media={video} />
    </div>
  );
};
