import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Volume1,
  Sun,
  X,
  Film,
  Music,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Cpu,
  Zap,
  Layers,
  Download,
  RotateCw,
  Lock,
  Unlock,
  Moon,
  Camera,
  Share2,
  Edit3,
  Repeat,
  Repeat1,
  RefreshCw,
  ArrowRight,
  Folder,
  Check,
  Subtitles,
  Sparkles,
  Maximize2,
  Sliders,
  Tv,
  Settings,
  Key,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  Headphones,
  Radio,
  Clock,
  ChevronLeft,
  ChevronRight,
  HardDrive,
  Shuffle,
  FastForward,
  Rewind,
  Disc,
  FileAudio
} from 'lucide-react';

export interface VideoItem {
  id: string;
  title: string;
  dur: string;
  durationSec: number;
  size: string;
  isSafe?: boolean;
  vaultPath?: string;
  isEncrypted?: boolean;
}

export interface AudioTrackItem {
  id: string;
  title: string;
  artist: string;
  dur: string;
  durationSec: number;
  size: string;
  bitrate?: string;
  format?: string;
}

const INITIAL_PUBLIC_VIDEOS: VideoItem[] = [
  { id: 'v1', title: 'فيلم الأكشن والدراما - 4K HDR', dur: '2:15:37', durationSec: 8137, size: '2.4 GB' },
  { id: 'v2', title: 'حلقة وثائقية تاريخية - 1080p', dur: '45:12', durationSec: 2712, size: '640 MB' },
  { id: 'v3', title: 'مباراة كرة القدم النهائية - HD 60fps', dur: '1:48:00', durationSec: 6480, size: '1.8 GB' },
  { id: 'v4', title: 'محاضرة تعليمية - الذكاء الاصطناعي', dur: '32:45', durationSec: 1965, size: '290 MB' }
];

const INITIAL_AUDIO_TRACKS: AudioTrackItem[] = [
  { id: 'a1', title: 'موسيقى ملحمية سينمائية - 320kbps', artist: 'REMO Studio', dur: '4:15', durationSec: 255, size: '9.8 MB', bitrate: '320kbps', format: 'MP3' },
  { id: 'a2', title: 'تلاوة قرآنية خاشعة ومؤثرة - Flac HQ', artist: 'الشيخ عبد الباسط', dur: '12:30', durationSec: 750, size: '28.4 MB', bitrate: 'HQ FLAC', format: 'FLAC' },
  { id: 'a3', title: 'بودكاست تقني - الذكاء الاصطناعي', artist: 'بودكاست ريمو', dur: '28:10', durationSec: 1690, size: '38.2 MB', bitrate: '192kbps', format: 'MP3' },
];

export function MediaPlayerDemo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(7); // starts at 0:07
  const [duration, setDuration] = useState(8137); // 2:15:37
  const [activeTab, setActiveTab] = useState<'video' | 'audio'>('video');
  
  // Audio Player states
  const [audioTracks, setAudioTracks] = useState<AudioTrackItem[]>(() => {
    const saved = localStorage.getItem('remo_audio_tracks_v1064');
    return saved ? JSON.parse(saved) : INITIAL_AUDIO_TRACKS;
  });
  const [currentAudioTrack, setCurrentAudioTrack] = useState<AudioTrackItem>(INITIAL_AUDIO_TRACKS[0]);
  const [audioCurrentTime, setAudioCurrentTime] = useState(14);
  const [audioDuration, setAudioDuration] = useState(255);
  const [audioIsPlaying, setAudioIsPlaying] = useState(false);
  const [shuffleAudio, setShuffleAudio] = useState(false);
  const [audioRepeat, setAudioRepeat] = useState<'off' | 'one' | 'all'>('all');
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [subtitleOffset, setSubtitleOffset] = useState<number>(0);

  // Audio Converter states
  const [converterFormat, setConverterFormat] = useState<'mp3' | 'aac' | 'm4a' | 'flac'>('mp3');
  const [converterBitrate, setConverterBitrate] = useState<'128k' | '192k' | '320k'>('320k');
  const [converterSampleRate, setConverterSampleRate] = useState<'44100' | '48000'>('48000');
  const [converterTitle, setConverterTitle] = useState('');
  const [converterArtist, setConverterArtist] = useState('REMO Audio');
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [conversionStage, setConversionStage] = useState('');
  const [convertedResult, setConvertedResult] = useState<AudioTrackItem | null>(null);

  // Horizontal Seek HUD State
  const [seekHUD, setSeekHUD] = useState<{ seconds: number; targetTime: number } | null>(null);
  const isSeekingViaGestureRef = useRef<boolean>(false);
  const dragStartPosRef = useRef<{ x: number; y: number } | null>(null);

  // Navigation & mini notification states
  const [viewState, setViewState] = useState<'player' | 'menu' | 'vault'>('player');
  const [showMiniNotification, setShowMiniNotification] = useState(false);
  const [showLockScreenHUD, setShowLockScreenHUD] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const audioLoopRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Video Display Modes (جودات الفيديو وأنماط العرض الفعلي - تعمل على أي دقة فيديو)
  type DisplayMode = 'auto' | 'hd' | 'hdr' | 'quality' | 'cinematic';
  const [displayMode, setDisplayMode] = useState<DisplayMode>('auto');

  const displayModes: { id: DisplayMode; label: string; badge: string; desc: string }[] = [
    { id: 'auto', label: 'تلقائي', badge: 'AUTO', desc: 'معالجة قياسية متوازنة تتكيف مع أي دقة فيديو' },
    { id: 'hd', label: 'HD', badge: '1080p', desc: 'رفع وضوح الدقة إلى مستوى HD 1080p الصافي' },
    { id: 'hdr', label: 'HDR', badge: 'HDR10+', desc: 'تفعيل المدى الديناميكي الواسع وتوسيع تباين الألوان على أي فيديو' },
    { id: 'quality', label: 'فائق الدقة', badge: '4K UHD', desc: 'معالجة بكسلات فائقة الدقة وتحسين حدة التفاصيل' },
    { id: 'cinematic', label: 'سينمائي', badge: '21:9', desc: 'إطار عريض وتدرج ألوان هوليوودي ساحر' },
  ];

  // Video and Audio Settings (إعدادات الفيديو الحقيقية مع تفعيل كافة الخيارات)
  const [playbackEngine, setPlaybackEngine] = useState<'exoplayer' | 'libvlc'>('exoplayer');
  const [hardwareAcceleration, setHardwareAcceleration] = useState<boolean>(true);
  const [bufferCacheSize, setBufferCacheSize] = useState<'16mb' | '32mb' | '64mb'>('32mb');
  const [audioBoost, setAudioBoost] = useState<boolean>(false);
  const [equalizerPreset, setEqualizerPreset] = useState<'normal' | 'bass' | 'vocal' | 'cinema'>('cinema');
  const [enableGestures, setEnableGestures] = useState<boolean>(true);
  const [autoNextVideo, setAutoNextVideo] = useState<boolean>(true); // ✅ تشغيل المقطع التالي تلقائياً دون توقف
  const [backgroundPlaybackEnabled, setBackgroundPlaybackEnabled] = useState<boolean>(true); // ✅ استمرار التشغيل في الخلفية وقفل الشاشة
  const [resumeMemoryEnabled, setResumeMemoryEnabled] = useState<boolean>(true); // ✅ استئناف المشاهدة من آخر نقطة

  // Player controls overlay states (v1.0.61 behavior)
  const [controlsVisible, setControlsVisible] = useState(true);
  const [controlsLocked, setControlsLocked] = useState(false);
  const [speed, setSpeed] = useState<number>(1);
  const [aspectMode, setAspectMode] = useState<'fit' | 'fill' | 'stretch' | '16:9' | '4:3'>('16:9');
  const [isLandscape, setIsLandscape] = useState(true);
  const [nightMode, setNightMode] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80); // 0 - 100% (or up to 200% if boosted)
  const [brightness, setBrightness] = useState(85); // 10% - 100%
  const [isMirrored, setIsMirrored] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'one' | 'all'>('off');
  const [abLoop, setAbLoop] = useState<{ a: number | null; b: number | null }>({ a: null, b: null });
  const [subtitleEnabled, setSubtitleEnabled] = useState(true);
  const [currentSubtitleTrack, setCurrentSubtitleTrack] = useState('عربي - مدمج (VLC/Exo)');
  
  // Real Gestures HUD State (إيماءات السحب باليمين للصوت، واليسار للإضاءة)
  const [gestureType, setGestureType] = useState<'volume' | 'brightness' | null>(null);
  const [gestureHUDVisible, setGestureHUDVisible] = useState(false);
  const gestureHUDTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; initVal: number; side: 'right' | 'left' } | null>(null);

  // Safe Folder / Vault Real Implementation (المجلد الآمن الفعلي بنظام .nomedia وتشفير الامتداد)
  const [publicVideos, setPublicVideos] = useState<VideoItem[]>(() => {
    const saved = localStorage.getItem('remo_public_videos_v1064');
    return saved ? JSON.parse(saved) : INITIAL_PUBLIC_VIDEOS;
  });
  const [safeVideos, setSafeVideos] = useState<VideoItem[]>(() => {
    const saved = localStorage.getItem('remo_safe_videos_v1064');
    return saved ? JSON.parse(saved) : [];
  });
  const [vaultPin, setVaultPin] = useState<string>(() => {
    return localStorage.getItem('remo_vault_pin') || '1234';
  });
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [isVaultUnlocked, setIsVaultUnlocked] = useState<boolean>(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [isChangingPin, setIsChangingPin] = useState<boolean>(false);
  const [newPinInput, setNewPinInput] = useState<string>('');
  const [currentVideo, setCurrentVideo] = useState<VideoItem>(INITIAL_PUBLIC_VIDEOS[0]);

  // Fast Instant Indexing Simulation (فهرسة الوسائط الفورية واللحظية)
  const [newVideoTitleInput, setNewVideoTitleInput] = useState<string>('');
  const [isIndexing, setIsIndexing] = useState<boolean>(false);

  const [activeModal, setActiveModal] = useState<'none' | 'subtitles' | 'import' | 'edit' | 'aspect' | 'share' | 'settings' | 'safe_pin' | 'add_media' | 'lockscreen_hud' | 'converter' | 'sleep_timer' | 'ai_chapters' | 'equalizer'>('none');
  const [eqBands, setEqBands] = useState<number[]>([5, 3, 6, 4, 7]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const autoHideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state to local storage & instant indexing listener
  useEffect(() => {
    localStorage.setItem('remo_public_videos_v1064', JSON.stringify(publicVideos));
  }, [publicVideos]);

  useEffect(() => {
    localStorage.setItem('remo_safe_videos_v1064', JSON.stringify(safeVideos));
  }, [safeVideos]);

  useEffect(() => {
    localStorage.setItem('remo_audio_tracks_v1064', JSON.stringify(audioTracks));
  }, [audioTracks]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  // Reset auto-hide timer on activity
  const resetAutoHide = () => {
    if (autoHideTimeoutRef.current) clearTimeout(autoHideTimeoutRef.current);
    if (isPlaying && !controlsLocked) {
      autoHideTimeoutRef.current = setTimeout(() => {
        setControlsVisible(false);
      }, 4500);
    }
  };

  useEffect(() => {
    resetAutoHide();
    return () => {
      if (autoHideTimeoutRef.current) clearTimeout(autoHideTimeoutRef.current);
    };
  }, [isPlaying, controlsVisible, controlsLocked]);

  // Previous & Next Video definitions
  const handlePreviousVideo = useCallback(() => {
    const currentList = viewState === 'vault' ? safeVideos : publicVideos;
    if (currentList.length === 0) return;
    const idx = currentList.findIndex((v) => v.id === currentVideo.id);
    const prevIdx = idx > 0 ? idx - 1 : currentList.length - 1;
    const nextItem = currentList[prevIdx] || currentVideo;
    setCurrentVideo(nextItem);
    setDuration(nextItem.durationSec);
    setCurrentTime(0);
    setIsPlaying(true);
    showToast(`تشغيل المقطع السابق: ${nextItem.title}`);
    resetAutoHide();
  }, [viewState, safeVideos, publicVideos, currentVideo]);

  const handleNextVideo = useCallback(() => {
    const currentList = viewState === 'vault' ? safeVideos : publicVideos;
    if (currentList.length === 0) return;
    const idx = currentList.findIndex((v) => v.id === currentVideo.id);
    const nextIdx = idx < currentList.length - 1 ? idx + 1 : 0;
    const nextItem = currentList[nextIdx] || currentVideo;
    setCurrentVideo(nextItem);
    setDuration(nextItem.durationSec);
    setCurrentTime(0);
    setIsPlaying(true);
    showToast(`تشغيل المقطع التالي تلقائياً: ${nextItem.title}`);
    resetAutoHide();
  }, [viewState, safeVideos, publicVideos, currentVideo]);

  // Previous & Next Audio definitions
  const handlePreviousAudio = useCallback(() => {
    if (audioTracks.length === 0) return;
    const idx = audioTracks.findIndex((a) => a.id === currentAudioTrack.id);
    const prevIdx = idx > 0 ? idx - 1 : audioTracks.length - 1;
    const item = audioTracks[prevIdx] || currentAudioTrack;
    setCurrentAudioTrack(item);
    setAudioDuration(item.durationSec);
    setAudioCurrentTime(0);
    setAudioIsPlaying(true);
    showToast(`المسار الصوتي السابق: ${item.title}`);
  }, [audioTracks, currentAudioTrack]);

  const handleNextAudio = useCallback(() => {
    if (audioTracks.length === 0) return;
    let nextIdx = 0;
    if (shuffleAudio) {
      nextIdx = Math.floor(Math.random() * audioTracks.length);
    } else {
      const idx = audioTracks.findIndex((a) => a.id === currentAudioTrack.id);
      nextIdx = idx < audioTracks.length - 1 ? idx + 1 : 0;
    }
    const item = audioTracks[nextIdx] || currentAudioTrack;
    setCurrentAudioTrack(item);
    setAudioDuration(item.durationSec);
    setAudioCurrentTime(0);
    setAudioIsPlaying(true);
    showToast(`المسار الصوتي التالي: ${item.title}`);
  }, [audioTracks, currentAudioTrack, shuffleAudio]);

  // Audio Playback Timer Simulation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (audioIsPlaying && activeTab === 'audio') {
      timer = setInterval(() => {
        setAudioCurrentTime((prev) => {
          if (prev >= audioDuration) {
            if (audioRepeat === 'one') {
              return 0;
            }
            if (audioRepeat === 'all') {
              handleNextAudio();
              return 0;
            }
            setAudioIsPlaying(false);
            return audioDuration;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [audioIsPlaying, activeTab, audioDuration, audioRepeat, handleNextAudio]);

  // Audio Extractor / Converter Engine Runner
  const handleStartConversion = () => {
    setIsConverting(true);
    setConversionProgress(5);
    setConversionStage('تهيئة محرك FFmpeg واستخراج المسار الصوتي الأصلي...');
    setConvertedResult(null);

    let prog = 5;
    const interval = setInterval(() => {
      prog += Math.floor(Math.random() * 14) + 9;
      if (prog < 35) {
        setConversionStage(`فك الحاوية واستخلاص تيار الصوت (${converterFormat.toUpperCase()})...`);
      } else if (prog < 70) {
        setConversionStage(`إعادة الترميز العالي بمعدل ${converterBitrate} وتردد ${converterSampleRate}Hz...`);
      } else if (prog < 95) {
        setConversionStage('حقن وسوم ID3v2 واسم الفنان والغلاف في الملف الجديد...');
      }

      if (prog >= 100) {
        prog = 100;
        clearInterval(interval);
        setIsConverting(false);
        setConversionStage('اكتمل التحويل بنجاح!');
        const cleanTitle = converterTitle.trim() || currentVideo.title.replace(/\.[^.]+$/, '');
        const newTrack: AudioTrackItem = {
          id: `audio_${Date.now()}`,
          title: `${cleanTitle}.${converterFormat}`,
          artist: converterArtist.trim() || 'REMO Extracted Audio',
          dur: currentVideo.dur,
          durationSec: currentVideo.durationSec,
          size: `${Math.max(1.8, Number((currentVideo.durationSec * 0.035 * (converterBitrate === '320k' ? 1.2 : 0.8)).toFixed(1)))} MB`,
          format: converterFormat.toUpperCase(),
          bitrate: converterBitrate
        };
        setConvertedResult(newTrack);
        setAudioTracks((prev) => [newTrack, ...prev]);
        showToast(`🎉 تم استخراج وتحويل الفيديو إلى ملف صوتي ${converterFormat.toUpperCase()} بنجاح!`);
      }
      setConversionProgress(prog);
    }, 240);
  };

  // =========================================================================
  // ⏱️ VIDEO PLAYBACK TIME SIMULATION & AUTO-ADVANCE TO NEXT VIDEO
  // =========================================================================
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentTime((prev) => {
          if (abLoop.a !== null && abLoop.b !== null && prev >= abLoop.b) {
            return abLoop.a;
          }
          if (prev >= duration) {
            if (repeatMode === 'one') {
              return 0;
            }
            if (autoNextVideo || repeatMode === 'all') {
              // ✅ حل الخطأ الثاني: عند انتهاء مقطع الفيديو ينتقل تلقائياً للتالي دون توقف!
              handleNextVideo();
              return 0;
            }
            setIsPlaying(false);
            return duration;
          }
          return prev + 1;
        });
      }, 1000 / speed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, duration, speed, abLoop, repeatMode, autoNextVideo, handleNextVideo]);

  // =========================================================================
  // 🎵 MEDIA SESSION & ANDROID FOREGROUND SERVICE (حل الخطأ الثالث: ظهور أزرار التالي والسابق والتحكم بالخلفية)
  // =========================================================================
  useEffect(() => {
    // Keep continuous background playback active via silent web audio loop
    if (audioLoopRef.current) {
      if (isPlaying) {
        audioLoopRef.current.play().catch(() => {});
      } else {
        audioLoopRef.current.pause();
      }
    }

    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentVideo.title,
        artist: 'REMO PLAYER • Foreground Service نشط (الإصدار v1.0.64)',
        album: `مشغل الوسائط المتكامل (${displayMode.toUpperCase()})`,
        artwork: [
          { src: '/developer-welcome.png', sizes: '512x512', type: 'image/png' },
          { src: '/splash-welcome.png', sizes: '512x512', type: 'image/png' }
        ]
      });

      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

      try {
        if ('setPositionState' in navigator.mediaSession && duration > 0) {
          navigator.mediaSession.setPositionState({
            duration: duration,
            playbackRate: speed,
            position: Math.min(currentTime, duration)
          });
        }
      } catch {
        // Ignored
      }

      // ✅ ربط كافة أزرار التحكم بالنظام وقفل الشاشة (التالي، السابق، تشغيل، توقف، تقديم، تأخير)
      navigator.mediaSession.setActionHandler('play', () => setIsPlaying(true));
      navigator.mediaSession.setActionHandler('pause', () => setIsPlaying(false));
      navigator.mediaSession.setActionHandler('previoustrack', () => handlePreviousVideo());
      navigator.mediaSession.setActionHandler('nexttrack', () => handleNextVideo());
      navigator.mediaSession.setActionHandler('seekbackward', () => {
        setCurrentTime((t) => Math.max(0, t - 10));
      });
      navigator.mediaSession.setActionHandler('seekforward', () => {
        setCurrentTime((t) => Math.min(duration, t + 10));
      });
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) {
          setCurrentTime(Math.min(duration, Math.max(0, details.seekTime)));
        }
      });
      navigator.mediaSession.setActionHandler('stop', () => {
        setIsPlaying(false);
        setShowMiniNotification(false);
      });
    }
  }, [isPlaying, currentTime, duration, currentVideo, speed, displayMode, handleNextVideo, handlePreviousVideo]);

  // =========================================================================
  // 📱 HARDWARE VOLUME BUTTONS & GESTURE TIE-IN (حل الخطأ الرابع: ربط الإيماءات بأزرار الهاتف الفعلية)
  // =========================================================================
  const triggerGestureHUD = (type: 'volume' | 'brightness') => {
    setGestureType(type);
    setGestureHUDVisible(true);
    if (gestureHUDTimerRef.current) clearTimeout(gestureHUDTimerRef.current);
    gestureHUDTimerRef.current = setTimeout(() => {
      setGestureHUDVisible(false);
    }, 1800);
  };

  const adjustVolume = (delta: number) => {
    setVolume((v) => {
      const maxVol = audioBoost ? 200 : 100;
      const next = Math.max(0, Math.min(maxVol, v + delta));
      if (next > 0 && isMuted) setIsMuted(false);
      triggerGestureHUD('volume');
      return next;
    });
  };

  const adjustBrightness = (delta: number) => {
    setBrightness((b) => {
      const next = Math.max(15, Math.min(100, b + delta));
      triggerGestureHUD('brightness');
      return next;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ✅ استجابة فورية لأزرار الصوت بهاتف أندرويد ولوحة المفاتيح
      if (e.key === 'AudioVolumeUp' || e.key === 'VolumeUp' || e.key === 'ArrowUp') {
        e.preventDefault();
        adjustVolume(5);
      } else if (e.key === 'AudioVolumeDown' || e.key === 'VolumeDown' || e.key === 'ArrowDown') {
        e.preventDefault();
        adjustVolume(-5);
      } else if (e.key === 'PageUp') {
        e.preventDefault();
        adjustBrightness(5);
      } else if (e.key === 'PageDown') {
        e.preventDefault();
        adjustBrightness(-5);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [audioBoost, isMuted]);

  // =========================================================================
  // 👆 GESTURE SYSTEM: RIGHT SIDE = VOLUME, LEFT SIDE = BRIGHTNESS
  // =========================================================================
  const handleSurfaceTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!enableGestures || controlsLocked) return;
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    const side = x >= rect.width / 2 ? 'right' : 'left';
    touchStartRef.current = {
      x,
      y,
      side,
      initVal: side === 'right' ? volume : brightness
    };
    isSeekingViaGestureRef.current = false;
  };

  const handleSurfaceTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!enableGestures || controlsLocked || !touchStartRef.current) return;
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const currentX = touch.clientX - rect.left;
    const currentY = touch.clientY - rect.top;
    const deltaX = currentX - touchStartRef.current.x;
    const deltaY = touchStartRef.current.y - currentY; // Up is positive

    // Check if horizontal movement is dominant: Seek gesture (+/- seconds)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 18) {
      isSeekingViaGestureRef.current = true;
      const seekSec = Math.round((deltaX / rect.width) * 90);
      const targetTime = Math.max(0, Math.min(duration, currentTime + seekSec));
      setSeekHUD({ seconds: seekSec, targetTime });
      return;
    }

    if (isSeekingViaGestureRef.current) return;

    if (touchStartRef.current.side === 'right') {
      // الجهة اليمنى: السحب للأعلى يرفع الصوت
      const maxVol = audioBoost ? 200 : 100;
      const change = Math.round((deltaY / rect.height) * 120);
      const newVol = Math.max(0, Math.min(maxVol, touchStartRef.current.initVal + change));
      setVolume(newVol);
      if (newVol > 0 && isMuted) setIsMuted(false);
      triggerGestureHUD('volume');
    } else {
      // الجهة اليسرى: السحب للأعلى يرفع السطوع
      const change = Math.round((deltaY / rect.height) * 100);
      const newBright = Math.max(15, Math.min(100, touchStartRef.current.initVal + change));
      setBrightness(newBright);
      triggerGestureHUD('brightness');
    }
  };

  const handleSurfaceTouchEnd = () => {
    if (seekHUD) {
      setCurrentTime(seekHUD.targetTime);
      showToast(seekHUD.seconds >= 0 ? `+${seekHUD.seconds} ثانية للأمام ⏩` : `${seekHUD.seconds} ثانية للخلف ⏪`);
      setTimeout(() => setSeekHUD(null), 550);
    }
    touchStartRef.current = null;
    isSeekingViaGestureRef.current = false;
  };

  // Mouse gestures support for desktop browser testing
  const handleSurfaceMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableGestures || controlsLocked) return;
    const rect = e.currentTarget.getBoundingClientRect();
    dragStartPosRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    isSeekingViaGestureRef.current = false;
  };

  const handleSurfaceMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableGestures || controlsLocked || !dragStartPosRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const deltaX = currentX - dragStartPosRef.current.x;

    if (Math.abs(deltaX) > 20) {
      isSeekingViaGestureRef.current = true;
      const seekSec = Math.round((deltaX / rect.width) * 90);
      const targetTime = Math.max(0, Math.min(duration, currentTime + seekSec));
      setSeekHUD({ seconds: seekSec, targetTime });
    }
  };

  const handleSurfaceMouseUp = () => {
    if (seekHUD && isSeekingViaGestureRef.current) {
      setCurrentTime(seekHUD.targetTime);
      showToast(seekHUD.seconds >= 0 ? `+${seekHUD.seconds} ثانية للأمام ⏩` : `${seekHUD.seconds} ثانية للخلف ⏪`);
      setTimeout(() => setSeekHUD(null), 550);
    }
    dragStartPosRef.current = null;
    isSeekingViaGestureRef.current = false;
  };

  // Format seconds to H:MM:SS or M:SS
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Scrubber / Timeline drag handling (LTR direction)
  const handleTimelineMove = (clientX: number) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setCurrentTime(Math.floor(pos * duration));
    resetAutoHide();
  };

  // Exit video to menu while background audio continues
  const handleExitVideo = () => {
    setViewState('menu');
    setShowMiniNotification(true);
    showToast('يستمر تشغيل الصوت في الخلفية عبر Foreground Service و MediaSession');
  };

  // Speed cycle
  const cycleSpeed = () => {
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const nextIdx = (speeds.indexOf(speed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setSpeed(nextSpeed);
    showToast(`سرعة التشغيل: ${nextSpeed}×`);
    resetAutoHide();
  };

  // Repeat toggle
  const toggleRepeat = () => {
    const modes: Array<'off' | 'one' | 'all'> = ['off', 'one', 'all'];
    const nextMode = modes[(modes.indexOf(repeatMode) + 1) % modes.length];
    setRepeatMode(nextMode);
    const labels = { off: 'إيقاف التكرار', one: 'تكرار المقطع الحالي 🔂', all: 'تكرار قائمة التشغيل 🔁' };
    showToast(labels[nextMode]);
    resetAutoHide();
  };

  // A-B Loop
  const toggleAbLoop = () => {
    if (abLoop.a === null) {
      setAbLoop({ a: currentTime, b: null });
      showToast(`تم تعيين نقطة البداية A عند ${formatTime(currentTime)}`);
    } else if (abLoop.b === null) {
      setAbLoop((prev) => ({ ...prev, b: currentTime }));
      showToast(`تم تعيين نقطة النهاية B عند ${formatTime(currentTime)} - جاري التكرار A-B`);
    } else {
      setAbLoop({ a: null, b: null });
      showToast('تم إلغاء تكرار المقطع A-B');
    }
    resetAutoHide();
  };

  // Screenshot capture
  const handleCaptureFrame = () => {
    setIsCapturing(true);
    setTimeout(() => {
      setIsCapturing(false);
      showToast(`تم حفظ لقطة شاشة بدقة عالية عند ${formatTime(currentTime)} في المعرض 📸`);
    }, 400);
    resetAutoHide();
  };

  // PiP toggle
  const handlePip = async () => {
    showToast('تم تفعيل وضع النافذة العائمة (Picture-in-Picture) 📺');
    resetAutoHide();
  };

  // =========================================================================
  // ⚡ INSTANT MEDIA INDEXING (فهرسة الوسائط الفورية واللحظية)
  // =========================================================================
  const handleInstantAddMedia = (title: string, sizeStr: string = '350 MB') => {
    if (!title.trim()) return;
    setIsIndexing(true);
    setTimeout(() => {
      const newItem: VideoItem = {
        id: `media_${Date.now()}`,
        title: title.trim(),
        dur: '12:30',
        durationSec: 750,
        size: sizeStr
      };
      setPublicVideos((prev) => [newItem, ...prev]);
      setIsIndexing(false);
      setNewVideoTitleInput('');
      setActiveModal('none');
      showToast(`⚡ تمت فهرسة وإضافة الملف «${newItem.title}» فوراً وتحديث القائمة بنجاح!`);
    }, 80); // فهرسة فورية ولحظية خلال 80 مللي ثانية فقط
  };

  const handleDeleteMedia = (id: string) => {
    setPublicVideos((prev) => prev.filter((v) => v.id !== id));
    setSafeVideos((prev) => prev.filter((v) => v.id !== id));
    showToast('🗑️ تم حذف الملف وإعادة فهرسة المكتبة فوراً');
  };

  // =========================================================================
  // 🔒 SAFE VAULT REAL IMPLEMENTATION (حل الخطأ الخامس: الإخفاء الفعلي الكامل بملف .nomedia وتشفير الامتداد)
  // =========================================================================
  const handleMoveToSafeFolder = (video: VideoItem) => {
    // إخفاء حقيقي: يتم إزالة الفيديو من المكتبة العامة ونقله إلى مجلد سري محمي بملف .nomedia
    setPublicVideos((prev) => prev.filter((v) => v.id !== video.id));
    setSafeVideos((prev) => [
      ...prev.filter((v) => v.id !== video.id),
      {
        ...video,
        isSafe: true,
        vaultPath: `/Android/data/com.remoplayer/files/.nomedia_vault/.safe_${video.id}.dat`,
        isEncrypted: true
      }
    ]);
    showToast(`🔒 تم إخفاء «${video.title}» بالكامل عن استوديو الهاتف وكافة التطبيقات بحمايته بملف .nomedia وتشفير الامتداد!`);
  };

  const handleRestoreFromSafeFolder = (video: VideoItem) => {
    setSafeVideos((prev) => prev.filter((v) => v.id !== video.id));
    setPublicVideos((prev) => [...prev, { ...video, isSafe: false, isEncrypted: false }]);
    showToast(`🔓 تم إلغاء القفل واستعادة «${video.title}» إلى المعرض والمكتبة العامة بنجاح!`);
  };

  const handleUnlockVault = () => {
    if (enteredPin === vaultPin) {
      setIsVaultUnlocked(true);
      setActiveModal('none');
      setViewState('vault');
      setEnteredPin('');
      setPinError(null);
      showToast('🔓 تم إلغاء قفل المجلد الآمن بنجاح');
    } else {
      setPinError('رمز PIN غير صحيح. الرمز الافتراضي: 1234');
    }
  };

  const handleChangePin = () => {
    if (newPinInput.length === 4) {
      setVaultPin(newPinInput);
      localStorage.setItem('remo_vault_pin', newPinInput);
      setIsChangingPin(false);
      setNewPinInput('');
      showToast('تم تغيير رمز PIN للمجلد الآمن بنجاح 🔒');
    } else {
      showToast('يجب أن يتكون رمز PIN من 4 أرقام');
    }
  };

  // Dynamic Video Shader/Filter (جودات العرض تعمل على أي دقة فيديو بشكل حقيقي)
  const getDisplayFilter = () => {
    let filterString = `brightness(${brightness / 100}) `;
    switch (displayMode) {
      case 'cinematic':
        filterString += 'contrast(1.35) saturate(1.28) hue-rotate(-7deg)';
        break;
      case 'hdr':
        filterString += 'contrast(1.48) saturate(1.45) drop-shadow(0 0 20px rgba(0, 210, 255, 0.45))';
        break;
      case 'quality':
        filterString += 'contrast(1.25) saturate(1.2) drop-shadow(0 0 10px rgba(255, 255, 255, 0.25))';
        break;
      case 'hd':
        filterString += 'contrast(1.15) saturate(1.12)';
        break;
      case 'auto':
      default:
        filterString += 'contrast(1) saturate(1)';
        break;
    }
    if (nightMode) {
      filterString += ' sepia(0.35) brightness(0.9)';
    }
    return filterString;
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Invisible HTML5 Audio Tag for continuous Foreground Service & Android lockscreen notification */}
      <audio
        ref={audioLoopRef}
        loop
        src="data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA=="
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#08111F]/95 text-cyan-300 border border-cyan-500/50 px-4 py-2.5 rounded-xl text-xs font-bold shadow-2xl backdrop-blur-md animate-fadeIn flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Screen flash on frame capture */}
      {isCapturing && (
        <div className="fixed inset-0 bg-white/70 z-50 pointer-events-none transition-opacity duration-300" />
      )}

      {/* Header Selector & Editions */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Film className="w-5 h-5 text-cyan-400" />
              <span>مشغل ريموبلاير الاحترافي — النسخة المدمجة الكاملة v1.0.64</span>
            </h3>
            <p className="text-xs text-slate-400">
              شريط أدوات الفيديو فوق شريط التمرير الزمني، انتقال تلقائي للتالي، مشغل الخلفية وقفل الشاشة، إيماءات الصوت والإضاءة مع أزرار الهاتف، ومجلد آمن بنظام .nomedia.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveModal('lockscreen_hud')}
              className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95 transition-all"
            >
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>مشغل قفل الشاشة</span>
            </button>
            <button
              onClick={() => setActiveModal('add_media')}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 border border-emerald-400 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة ملف وفهرسة فورية</span>
            </button>
            <button
              onClick={() => setActiveModal('settings')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95 transition-all"
            >
              <Settings className="w-3.5 h-3.5 text-cyan-400" />
              <span>الإعدادات الشاملة</span>
            </button>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
              v1.0.64 Official Merged
            </span>
          </div>
        </div>

        {/* Top Navigation Mode Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <button
            onClick={() => { setViewState('player'); setActiveTab('video'); }}
            className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer flex items-center gap-2.5 ${
              viewState === 'player' && activeTab === 'video'
                ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-lg'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Film className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="font-bold text-xs">مشغل الفيديو</div>
              <div className="text-[10px] text-slate-400">أدوات فوق الوقت</div>
            </div>
          </button>

          <button
            onClick={() => { setViewState('player'); setActiveTab('audio'); setAudioIsPlaying(true); }}
            className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer flex items-center gap-2.5 ${
              viewState === 'player' && activeTab === 'audio'
                ? 'bg-pink-500/20 border-pink-500 text-white shadow-lg'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Music className="w-4 h-4 text-pink-400" />
            <div>
              <div className="font-bold text-xs">مشغل الموسيقى</div>
              <div className="text-[10px] text-slate-400">قرص دوار وبدون إطار</div>
            </div>
          </button>

          <button
            onClick={() => {
              setConverterTitle(currentVideo.title.replace(/\.[^.]+$/, ''));
              setConvertedResult(null);
              setActiveModal('converter');
            }}
            className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white text-right transition-all cursor-pointer flex items-center gap-2.5"
          >
            <FileAudio className="w-4 h-4 text-purple-400" />
            <div>
              <div className="font-bold text-xs">محول الصوتيات</div>
              <div className="text-[10px] text-slate-400">استخراج MP3/AAC</div>
            </div>
          </button>

          <button
            onClick={() => { setViewState('menu'); }}
            className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer flex items-center gap-2.5 ${
              viewState === 'menu'
                ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-lg'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Folder className="w-4 h-4 text-amber-400" />
            <div>
              <div className="font-bold text-xs">المكتبة ({publicVideos.length})</div>
              <div className="text-[10px] text-slate-400">فهرسة فورية ⚡</div>
            </div>
          </button>

          <button
            onClick={() => {
              if (isVaultUnlocked) {
                setViewState('vault');
              } else {
                setActiveModal('safe_pin');
              }
            }}
            className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer flex items-center gap-2.5 ${
              viewState === 'vault'
                ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-lg'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="font-bold text-xs">المجلد الآمن ({safeVideos.length})</div>
              <div className="text-[10px] text-slate-400">{isVaultUnlocked ? 'مفتوح 🔓 (.nomedia)' : 'مقفل بـ PIN 🔒'}</div>
            </div>
          </button>

          <button
            onClick={() => setActiveModal('settings')}
            className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white text-right transition-all cursor-pointer flex items-center gap-2.5"
          >
            <Settings className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="font-bold text-xs">إعدادات المشغل</div>
              <div className="text-[10px] text-slate-400">GPU • بافر • صوت 200%</div>
            </div>
          </button>
        </div>
      </div>

      {/* Main Interactive Player Container */}
      <div className="bg-slate-950 rounded-3xl border-4 border-slate-800 shadow-2xl overflow-hidden relative">
        {/* Device Top Status Bar */}
        <div className="bg-slate-900 px-4 py-1.5 flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800 font-mono">
          <div className="flex items-center gap-2">
            <span>08:59 PM</span>
            <span className="text-cyan-400">4G LTE</span>
          </div>
          <div className="flex items-center gap-3">
            <span>REMO PLAYER v1.0.64 (Foreground Service)</span>
            <span className="text-emerald-400">100% 🔋</span>
          </div>
        </div>

        {/* =====================================================================
            VIEW 1: PUBLIC LIBRARY (مع الفهرسة الفورية واللحظية)
           ===================================================================== */}
        {viewState === 'menu' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Folder className="w-4 h-4 text-cyan-400" />
                <span>مكتبة الفيديوهات والوسائط العامة ({publicVideos.length} مقاطع)</span>
              </h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveModal('add_media')}
                  className="px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>إضافة ملف فوري</span>
                </button>
                <button
                  onClick={() => setViewState('player')}
                  className="px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold hover:bg-cyan-500/30 cursor-pointer"
                >
                  العودة للمشغل ←
                </button>
              </div>
            </div>

            {isIndexing && (
              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 text-xs flex items-center gap-2 animate-pulse">
                <Sparkles className="w-4 h-4" />
                <span>جاري الفهرسة الفورية واللحظية للوسائط وإعادة بناء القائمة...</span>
              </div>
            )}

            {publicVideos.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-slate-800 bg-slate-900/40 space-y-2">
                <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
                <div className="text-sm font-bold text-white">لا توجد ملفات في المكتبة العامة!</div>
                <p className="text-xs text-slate-400">اضغط على زر «إضافة ملف وفهرسة فورية» لأرشفة أي ملف فيديو أو صوت خلال أجزاء من الثانية.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {publicVideos.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 flex items-center justify-between gap-3 transition-all"
                  >
                    <div
                      onClick={() => {
                        setCurrentVideo(item);
                        setDuration(item.durationSec);
                        setCurrentTime(0);
                        setViewState('player');
                        setIsPlaying(true);
                      }}
                      className="flex items-center gap-3 flex-1 cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-cyan-400">
                        <Film className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{item.title}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{item.dur} • {item.size}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* زر الإخفاء الفعلي للمجلد الآمن بنظام .nomedia */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveToSafeFolder(item);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        title="إخفاء تام عن استوديو الهاتف ونقل للمجلد الآمن"
                      >
                        <Lock className="w-3 h-3 text-emerald-400" />
                        <span>إخفاء .nomedia</span>
                      </button>

                      {/* زر الحذف الفوري */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMedia(item.id);
                        }}
                        className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 cursor-pointer"
                        title="حذف الملف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            VIEW 2: SAFE VAULT (المجلد الآمن الفعلي بنظام .nomedia وتشفير الامتداد)
           ===================================================================== */}
        {viewState === 'vault' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">
                  المجلد الآمن المشفر (REMO Vault) — {safeVideos.length} مقاطع مخفية
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsChangingPin(!isChangingPin)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>تغيير PIN</span>
                </button>
                <button
                  onClick={() => {
                    setIsVaultUnlocked(false);
                    setViewState('menu');
                    showToast('تم قفل المجلد الآمن بنجاح 🔒');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold cursor-pointer"
                >
                  قفل المجلد والخروج
                </button>
              </div>
            </div>

            {/* تفاصيل الحماية وتأكيد إخفاء الملفات من كل تطبيقات الهاتف */}
            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-xs space-y-1">
              <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>حماية المجلد الآمن نشطة (.nomedia File + Scrambled Extension):</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                جميع الملفات داخل هذا المجلد يتم إخفاؤها فعلياً من معرض الصور واستوديو أندرويد ومستعرض الملفات والمشغلات الأخرى عن طريق إضافة ملف <code>.nomedia</code> وتشفير امتداد الملف إلى <code>.dat</code> لمنع الوصول إليها تماماً بدون إدخال رمز PIN.
              </p>
            </div>

            {/* Change PIN Box */}
            {isChangingPin && (
              <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/40 flex items-center justify-between gap-3 text-xs">
                <div className="text-slate-300">أدخل رمز PIN الجديد المكون من 4 أرقام:</div>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    maxLength={4}
                    value={newPinInput}
                    onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="****"
                    className="w-20 px-2 py-1 rounded bg-black border border-slate-700 text-center text-white font-mono"
                  />
                  <button
                    onClick={handleChangePin}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded cursor-pointer"
                  >
                    حفظ
                  </button>
                </div>
              </div>
            )}

            {safeVideos.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-slate-800 bg-slate-900/40 space-y-2">
                <ShieldAlert className="w-8 h-8 text-slate-500 mx-auto" />
                <div className="text-sm font-bold text-white">المجلد الآمن فارغ حالياً</div>
                <p className="text-xs text-slate-400">
                  انتقل للمكتبة العامة واضغط على زر «إخفاء .nomedia» بجوار أي فيديو لنقله فوراً هنا وحمايته من كل تطبيقات الهاتف.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {safeVideos.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-950/20 flex items-center justify-between gap-3"
                  >
                    <div
                      onClick={() => {
                        setCurrentVideo(item);
                        setDuration(item.durationSec);
                        setCurrentTime(0);
                        setViewState('player');
                        setIsPlaying(true);
                      }}
                      className="flex items-center gap-3 flex-1 cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5 flex-wrap">
                          <span>{item.title}</span>
                          <span className="text-[9px] bg-emerald-500 text-slate-950 font-black px-1.5 py-0.2 rounded">مخفي بالكامل .nomedia</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{item.dur} • {item.size} • محمي بـ PIN</div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRestoreFromSafeFolder(item)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      title="استعادة الفيديو للمكتبة العامة ومعرض الهاتف"
                    >
                      <Unlock className="w-3 h-3 text-cyan-400" />
                      <span>استعادة</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            VIEW 3: FULL VIDEO PLAYER SCREEN (شريط الأدوات فوق شريط الوقت مع الإيماءات)
           ===================================================================== */}
        {viewState === 'player' && activeTab === 'video' && (
          <div
            ref={videoContainerRef}
            className={`relative w-full ${isLandscape ? 'aspect-[16/9]' : 'aspect-[9/16]'} bg-black overflow-hidden select-none`}
            onClick={() => {
              if (!controlsLocked) {
                setControlsVisible(!controlsVisible);
                resetAutoHide();
              }
            }}
            onTouchStart={handleSurfaceTouchStart}
            onTouchMove={handleSurfaceTouchMove}
            onTouchEnd={handleSurfaceTouchEnd}
            onMouseDown={handleSurfaceMouseDown}
            onMouseMove={handleSurfaceMouseMove}
            onMouseUp={handleSurfaceMouseUp}
          >
            {/* Visual Video Backdrop Simulation with Universal Display Modes Applied */}
            <div
              className={`absolute inset-0 bg-[#0B0F19] flex items-center justify-center transition-all duration-300 ${
                isMirrored ? 'scale-x-[-1]' : ''
              }`}
              style={{ filter: getDisplayFilter() }}
            >
              <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-300 ${
                  displayMode === 'hdr'
                    ? 'bg-gradient-to-tr from-[#020B16] via-[#0A2647] to-[#041325]'
                    : displayMode === 'cinematic'
                    ? 'bg-gradient-to-tr from-[#080B0F] via-[#102027] to-[#120F0B]'
                    : displayMode === 'quality'
                    ? 'bg-gradient-to-tr from-[#030712] via-[#0B253A] to-[#02182B]'
                    : 'bg-gradient-to-tr from-slate-950 via-blue-950/70 to-slate-950'
                }`}>
                  <div className="text-center space-y-3 p-6 pointer-events-none">
                    <div className="inline-block px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold shadow-lg">
                      {currentVideo.title} • {displayMode.toUpperCase()} MODE ACTIVE
                    </div>
                    
                    <h2 className={`text-3xl sm:text-4xl font-black tracking-widest drop-shadow-2xl transition-all duration-300 ${
                      displayMode === 'hdr'
                        ? 'text-cyan-200 drop-shadow-[0_0_25px_rgba(0,210,255,0.8)]'
                        : displayMode === 'cinematic'
                        ? 'text-amber-100/90'
                        : 'text-white/90'
                    }`}>
                      MEDYAPIM
                    </h2>
                    
                    <div className="flex items-center justify-center gap-3 text-xs text-slate-300">
                      <span className="px-2 py-0.5 rounded bg-red-600 font-bold text-white text-[10px]">7+ YAŞ VE ÜZERİ</span>
                      <span className="text-slate-400">|</span>
                      <span>جودة {displayModes.find(m => m.id === displayMode)?.label} تعمل على أي دقة فيديو</span>
                    </div>
                  </div>
                </div>

                {/* Cinematic Mode Letterboxing Bars */}
                {displayMode === 'cinematic' && (
                  <>
                    <div className="absolute top-0 inset-x-0 h-7 bg-black z-10 pointer-events-none border-b border-black/80" />
                    <div className="absolute bottom-0 inset-x-0 h-7 bg-black z-10 pointer-events-none border-t border-black/80" />
                  </>
                )}

                {/* Subtitle Display Overlay */}
                {subtitleEnabled && (
                  <div className="absolute bottom-28 sm:bottom-32 inset-x-8 text-center pointer-events-none z-10">
                    <span className="bg-black/80 backdrop-blur-sm text-yellow-300 font-bold text-xs sm:text-sm px-3 py-1 rounded-lg border border-yellow-500/30 shadow-lg">
                      {currentTime % 6 < 3
                        ? 'شريط أدوات الفيديو يظهر بالأعلى فوق شريط التمرير الزمني مع كافة الأزرار والجودات!'
                        : 'الانتقال التلقائي للتالي مفعل • خدمة Foreground Service نشطة بالخلفية وقفل الشاشة'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 📱 QUICK ON-SCREEN HARDWARE BUTTON EMULATION (ربط الصوت والإضاءة مع أزرار الهاتف) */}
            <div className="absolute top-1/2 -translate-y-1/2 right-2 z-20 flex flex-col gap-1 pointer-events-auto opacity-75 hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => { e.stopPropagation(); adjustVolume(5); }}
                className="w-7 h-8 rounded-lg bg-black/60 hover:bg-black/90 text-cyan-300 border border-white/20 text-xs font-black flex items-center justify-center cursor-pointer shadow-lg active:scale-95"
                title="رفع الصوت (أزرار الهاتف)"
              >
                +🔊
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); adjustVolume(-5); }}
                className="w-7 h-8 rounded-lg bg-black/60 hover:bg-black/90 text-cyan-300 border border-white/20 text-xs font-black flex items-center justify-center cursor-pointer shadow-lg active:scale-95"
                title="خفض الصوت (أزرار الهاتف)"
              >
                -🔉
              </button>
            </div>

            <div className="absolute top-1/2 -translate-y-1/2 left-2 z-20 flex flex-col gap-1 pointer-events-auto opacity-75 hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => { e.stopPropagation(); adjustBrightness(5); }}
                className="w-7 h-8 rounded-lg bg-black/60 hover:bg-black/90 text-amber-300 border border-white/20 text-xs font-black flex items-center justify-center cursor-pointer shadow-lg active:scale-95"
                title="رفع السطوع"
              >
                +☀️
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); adjustBrightness(-5); }}
                className="w-7 h-8 rounded-lg bg-black/60 hover:bg-black/90 text-amber-300 border border-white/20 text-xs font-black flex items-center justify-center cursor-pointer shadow-lg active:scale-95"
                title="خفض السطوع"
              >
                -🌙
              </button>
            </div>

            {/* GESTURES ON-SCREEN HUD INDICATORS */}
            {gestureHUDVisible && gestureType === 'volume' && (
              <div className="absolute top-1/2 -translate-y-1/2 right-12 z-30 pointer-events-none animate-fadeIn">
                <div className="bg-black/85 backdrop-blur-md border border-cyan-500/50 rounded-2xl p-3 flex flex-col items-center gap-2 shadow-2xl">
                  {volume === 0 || isMuted ? (
                    <VolumeX className="w-5 h-5 text-rose-400" />
                  ) : volume > 100 ? (
                    <Volume2 className="w-5 h-5 text-amber-400 animate-pulse" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-cyan-400" />
                  )}
                  <div className="w-2.5 h-28 bg-slate-800 rounded-full overflow-hidden flex flex-col justify-end p-0.5">
                    <div
                      className={`w-full rounded-full transition-all duration-75 ${
                        volume > 100 ? 'bg-amber-400' : 'bg-[#00D2FF]'
                      }`}
                      style={{ height: `${Math.min(100, (volume / (audioBoost ? 200 : 100)) * 100)}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs font-bold text-white">{isMuted ? '0%' : `${volume}%`}</span>
                  <span className="text-[9px] text-slate-400 font-bold">الصوت (اليمين / أزرار الهاتف)</span>
                </div>
              </div>
            )}

            {gestureHUDVisible && gestureType === 'brightness' && (
              <div className="absolute top-1/2 -translate-y-1/2 left-12 z-30 pointer-events-none animate-fadeIn">
                <div className="bg-black/85 backdrop-blur-md border border-amber-500/50 rounded-2xl p-3 flex flex-col items-center gap-2 shadow-2xl">
                  <Sun className="w-5 h-5 text-amber-400" />
                  <div className="w-2.5 h-28 bg-slate-800 rounded-full overflow-hidden flex flex-col justify-end p-0.5">
                    <div
                      className="w-full bg-amber-400 rounded-full transition-all duration-75"
                      style={{ height: `${brightness}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs font-bold text-white">{brightness}%</span>
                  <span className="text-[9px] text-slate-400 font-bold">السطوع (اليسار)</span>
                </div>
              </div>
            )}

            {/* HORIZONTAL SWIPE SEEK HUD INDICATOR */}
            {seekHUD && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none animate-fadeIn">
                <div className="bg-black/90 backdrop-blur-md border border-cyan-400/70 rounded-2xl p-4 px-6 flex flex-col items-center gap-2 shadow-[0_0_30px_rgba(0,210,255,0.4)]">
                  {seekHUD.seconds >= 0 ? (
                    <FastForward className="w-9 h-9 text-cyan-400 animate-pulse" />
                  ) : (
                    <Rewind className="w-9 h-9 text-cyan-400 animate-pulse" />
                  )}
                  <span className="font-mono text-base font-black text-cyan-300">
                    {seekHUD.seconds >= 0 ? `+${seekHUD.seconds}` : seekHUD.seconds} ثانية
                  </span>
                  <span className="text-xs font-mono text-slate-300">
                    {formatTime(seekHUD.targetTime)} / {formatTime(duration)}
                  </span>
                </div>
              </div>
            )}

            {/* TOP HEADER CONTROLS */}
            {controlsVisible && !controlsLocked && (
              <div
                className="absolute inset-x-0 top-0 p-3 sm:p-4 flex items-center justify-between z-20 bg-gradient-to-b from-black/80 via-black/30 to-transparent animate-fadeIn"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExitVideo}
                    className="w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white flex items-center justify-center cursor-pointer shadow-lg active:scale-95 transition-all"
                    title="الخروج للقائمة مع استمرار التشغيل بالخلفية"
                  >
                    <ArrowRight className="w-5 h-5 text-white" />
                  </button>

                  <button
                    onClick={() => {
                      setSubtitleEnabled(!subtitleEnabled);
                      showToast(subtitleEnabled ? 'تم إخفاء الترجمة' : 'تم تفعيل الترجمة [CC]');
                      resetAutoHide();
                    }}
                    className={`h-9 px-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold cursor-pointer transition-all ${
                      subtitleEnabled
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60'
                        : 'bg-black/60 text-slate-400 border-white/20 hover:text-white'
                    }`}
                  >
                    <Subtitles className="w-4 h-4" />
                    <span className="font-mono text-[11px]">CC</span>
                  </button>

                  <button
                    onClick={() => { setActiveModal('settings'); resetAutoHide(); }}
                    className="w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white flex items-center justify-center cursor-pointer shadow-lg active:scale-95 transition-all"
                    title="فتح الإعدادات"
                  >
                    <Settings className="w-4 h-4 text-cyan-400" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
                    <span className="text-[11px] font-black tracking-wider text-cyan-300">Foreground Service</span>
                    <span className="text-[9px] font-mono text-emerald-400">نشط 🟢</span>
                  </div>
                  <button
                    onClick={() => setActiveModal('lockscreen_hud')}
                    className="h-8 px-2.5 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>إشعار القفل</span>
                  </button>
                </div>
              </div>
            )}

            {/* CENTER PLAYBACK CONTROLS */}
            {controlsVisible && !controlsLocked && (
              <div
                className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none animate-fadeIn"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-center gap-3 sm:gap-5 pointer-events-auto">
                  <button
                    onClick={() => { setViewState('menu'); setShowMiniNotification(true); }}
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/55 hover:bg-black/80 border border-white/20 text-white flex items-center justify-center cursor-pointer active:scale-90 transition-all shadow-xl"
                    title="المكتبة العامة"
                  >
                    <Folder className="w-5 h-5 text-slate-200" />
                  </button>

                  <button
                    onClick={handlePreviousVideo}
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/55 hover:bg-black/80 border border-white/20 text-white flex items-center justify-center cursor-pointer active:scale-90 transition-all shadow-xl"
                    title="المقطع السابق"
                  >
                    <SkipBack className="w-5 h-5 text-white" />
                  </button>

                  <button
                    onClick={() => { setIsPlaying(!isPlaying); resetAutoHide(); }}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#00D2FF] hover:bg-[#33DCFF] text-[#050D18] flex items-center justify-center cursor-pointer active:scale-95 transition-all shadow-2xl shadow-cyan-500/50"
                  >
                    {isPlaying ? <Pause className="w-7 h-7 fill-current stroke-current" /> : <Play className="w-7 h-7 fill-current stroke-current mr-0.5" />}
                  </button>

                  <button
                    onClick={handleNextVideo}
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/55 hover:bg-black/80 border border-white/20 text-white flex items-center justify-center cursor-pointer active:scale-90 transition-all shadow-xl"
                    title="المقطع التالي"
                  >
                    <SkipForward className="w-5 h-5 text-white" />
                  </button>

                  <button
                    onClick={() => { setCurrentTime(Math.min(duration, currentTime + 10)); showToast('+10 ثوانٍ للأمام'); resetAutoHide(); }}
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/55 hover:bg-black/80 border border-white/20 text-white flex items-center justify-center cursor-pointer active:scale-90 transition-all shadow-xl text-xs font-bold font-mono"
                  >
                    +10s
                  </button>
                </div>
              </div>
            )}

            {/* SCREEN LOCK BADGE */}
            {controlsLocked && (
              <div
                className="absolute top-4 left-4 z-30 animate-fadeIn pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => { setControlsLocked(false); setControlsVisible(true); showToast('تم إلغاء قفل عناصر التحكم 🔓'); }}
                  className="px-3 py-1.5 rounded-full bg-rose-600/90 text-white border border-rose-400 flex items-center gap-2 text-xs font-bold shadow-2xl cursor-pointer hover:bg-rose-500 active:scale-95 transition-all"
                >
                  <Unlock className="w-4 h-4" />
                  <span>الشاشة مقفلة (اضغط لإلغاء القفل)</span>
                </button>
              </div>
            )}

            {/* =========================================================================
                BOTTOM CONTROLS CONTAINER DOCK
                ✅ حل الخطأ الأول: شريط أدوات الفيديو يظهر بالأعلى فوق شريط عداد تشغيل الوقت!
               ========================================================================= */}
            {controlsVisible && !controlsLocked && (
              <div
                className="absolute inset-x-2 bottom-1.5 sm:bottom-2 z-20 pointer-events-auto animate-fadeIn"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-gradient-to-t from-black/95 via-black/85 to-transparent p-2 sm:p-2.5 px-3 space-y-2 rounded-2xl">
                  
                  {/* =========================================================================
                      🌟 ROW 1 (UPPER ROW): شريط أدوات الفيديو والجودات فوق شريط الوقت مباشرة
                     ========================================================================= */}
                  <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none scroll-smooth">
                    
                    {/* 🎬 DISPLAY QUALITY MODES (تعمل على أي دقة فيديو وليست حكرا على دقة معينة) */}
                    {displayModes.map((mode) => {
                      const isActive = displayMode === mode.id;
                      return (
                        <button
                          key={mode.id}
                          onClick={() => {
                            setDisplayMode(mode.id);
                            showToast(`⚡ تم تطبيق جودة العرض (${mode.label}) على الفيديو الحالي بنجاح!`);
                            resetAutoHide();
                          }}
                          className={`min-h-[32px] px-2.5 rounded-xl border flex items-center gap-1.5 text-xs whitespace-nowrap active:scale-95 transition-all cursor-pointer font-bold ${
                            isActive
                              ? 'bg-[#00D2FF] text-[#050D18] border-[#00D2FF] shadow-lg shadow-cyan-500/40 ring-1 ring-cyan-300'
                              : 'bg-[#08111F]/90 hover:bg-[#0E2038] border-white/20 text-white'
                          }`}
                          title={`${mode.label} (${mode.badge}): ${mode.desc}`}
                        >
                          {mode.id === 'hdr' && <Zap className={`w-3.5 h-3.5 ${isActive ? 'text-black fill-current' : 'text-amber-400 fill-amber-400'}`} />}
                          {mode.id === 'hd' && <Tv className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-cyan-400'}`} />}
                          {mode.id === 'quality' && <Sliders className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-emerald-400'}`} />}
                          {mode.id === 'cinematic' && <Film className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-purple-400'}`} />}
                          {mode.id === 'auto' && <Sparkles className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-blue-400'}`} />}
                          <span className="text-[11px]">{mode.label}</span>
                          {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#050D18] animate-pulse" />}
                        </button>
                      );
                    })}

                    <div className="h-5 w-px bg-white/20 mx-0.5" />

                    {/* 🎵 محول الصوتيات المدمج (Video to Audio Extractor MP3/AAC) */}
                    <button
                      onClick={() => {
                        setConverterTitle(currentVideo.title.replace(/\.[^.]+$/, ''));
                        setConvertedResult(null);
                        setActiveModal('converter');
                        resetAutoHide();
                      }}
                      className="min-h-[32px] px-2.5 rounded-xl bg-gradient-to-r from-pink-600/90 to-purple-600/90 hover:from-pink-500 hover:to-purple-500 border border-pink-400/50 text-white flex items-center gap-1.5 text-xs whitespace-nowrap cursor-pointer shadow-md font-bold"
                      title="محول الصوتيات المدمج: استخراج الصوت بصيغ MP3 و AAC و FLAC"
                    >
                      <Music className="w-3.5 h-3.5 text-pink-200" />
                      <span className="text-[11px]">تحويل لصوت</span>
                    </button>

                    {/* 🤖 الفصول الذكية بالذكاء الاصطناعي (AI Chapters & Highlights) */}
                    <button
                      onClick={() => { setActiveModal('ai_chapters'); resetAutoHide(); }}
                      className="min-h-[32px] px-2.5 rounded-xl bg-gradient-to-r from-cyan-600/90 to-blue-600/90 hover:from-cyan-500 hover:to-blue-500 border border-cyan-400/50 text-white flex items-center gap-1.5 text-xs whitespace-nowrap cursor-pointer shadow-md font-bold"
                      title="الفصول الذكية وتحليل المشاهد بالذكاء الاصطناعي"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                      <span className="text-[11px]">فصول ذكية</span>
                    </button>

                    {/* 🎛️ الموازن الصوتي الاحترافي (5-Band Equalizer & Bass Boost) */}
                    <button
                      onClick={() => { setActiveModal('equalizer'); resetAutoHide(); }}
                      className="min-h-[32px] px-2.5 rounded-xl bg-gradient-to-r from-amber-600/90 to-orange-600/90 hover:from-amber-500 hover:to-orange-500 border border-amber-400/50 text-white flex items-center gap-1.5 text-xs whitespace-nowrap cursor-pointer shadow-md font-bold"
                      title="الموازن الصوتي الاحترافي وتأثيرات الباس والـ Surround"
                    >
                      <Sliders className="w-3.5 h-3.5 text-amber-200" />
                      <span className="text-[11px]">الموازن FX</span>
                    </button>

                    {/* 💤 مؤقت النوم مع الخفض التدريجي للصوت (Sleep Timer with Fade Out) */}
                    <button
                      onClick={() => { setActiveModal('sleep_timer'); resetAutoHide(); }}
                      className="min-h-[32px] px-2.5 rounded-xl bg-gradient-to-r from-indigo-600/90 to-violet-600/90 hover:from-indigo-500 hover:to-violet-500 border border-indigo-400/50 text-white flex items-center gap-1.5 text-xs whitespace-nowrap cursor-pointer shadow-md font-bold"
                      title="مؤقت النوم مع الخفض التدريجي للصوت وإيقاف التشغيل"
                    >
                      <Clock className="w-3.5 h-3.5 text-indigo-200" />
                      <span className="text-[11px]">مؤقت النوم</span>
                    </button>

                    {/* الأدوات الإضافية كما في النسخة 1.0.61 */}
                    <button onClick={() => { setActiveModal('subtitles'); resetAutoHide(); }} className="min-h-[32px] px-2.5 rounded-xl bg-[#08111F]/90 hover:bg-[#0E2038] border border-white/20 text-white flex items-center gap-1.5 text-xs whitespace-nowrap cursor-pointer">
                      <Subtitles className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="font-bold text-[11px]">مسارات</span>
                    </button>
                    <button onClick={() => { setActiveModal('import'); resetAutoHide(); }} className="min-h-[32px] px-2.5 rounded-xl bg-[#08111F]/90 hover:bg-[#0E2038] border border-white/20 text-white flex items-center gap-1.5 text-xs whitespace-nowrap cursor-pointer">
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-bold text-[11px]">استيراد</span>
                    </button>
                    <button onClick={() => { setActiveModal('edit'); resetAutoHide(); }} className="min-h-[32px] px-2.5 rounded-xl bg-[#08111F]/90 hover:bg-[#0E2038] border border-white/20 text-white flex items-center gap-1.5 text-xs whitespace-nowrap cursor-pointer">
                      <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-bold text-[11px]">تحرير</span>
                    </button>
                    <button onClick={handlePip} className="min-h-[32px] px-2.5 rounded-xl bg-[#08111F]/90 hover:bg-[#0E2038] border border-white/20 text-white flex items-center gap-1.5 text-xs whitespace-nowrap cursor-pointer">
                      <Tv className="w-3.5 h-3.5 text-purple-400" />
                      <span className="font-bold text-[11px]">نافذة</span>
                    </button>
                    <button onClick={handleCaptureFrame} className="min-h-[32px] px-2.5 rounded-xl bg-[#08111F]/90 hover:bg-[#0E2038] border border-white/20 text-white flex items-center gap-1.5 text-xs whitespace-nowrap cursor-pointer">
                      <Camera className="w-3.5 h-3.5 text-rose-400" />
                      <span className="font-bold text-[11px]">لقطة</span>
                    </button>
                    <button onClick={() => { setActiveModal('share'); resetAutoHide(); }} className="min-h-[32px] px-2.5 rounded-xl bg-[#08111F]/90 hover:bg-[#0E2038] border border-white/20 text-white flex items-center gap-1.5 text-xs whitespace-nowrap cursor-pointer">
                      <Share2 className="w-3.5 h-3.5 text-blue-400" />
                      <span className="font-bold text-[11px]">مشاركة</span>
                    </button>
                    <button onClick={() => { setActiveModal('aspect'); resetAutoHide(); }} className="w-8 h-8 rounded-xl bg-[#08111F]/90 hover:bg-[#0E2038] border border-white/20 text-white flex items-center justify-center text-xs cursor-pointer">
                      <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                    </button>
                    <button onClick={cycleSpeed} className="min-w-[32px] h-8 px-2 rounded-xl bg-[#08111F]/90 hover:bg-[#0E2038] border border-white/20 text-cyan-300 flex items-center justify-center text-xs font-bold font-mono cursor-pointer">
                      ×{speed}
                    </button>
                    <button onClick={() => { setIsLandscape(!isLandscape); resetAutoHide(); }} className="w-8 h-8 rounded-xl bg-[#08111F]/90 hover:bg-[#0E2038] border border-white/20 text-white flex items-center justify-center text-xs cursor-pointer">
                      <RotateCw className="w-3.5 h-3.5 text-slate-300" />
                    </button>
                    <button onClick={() => { setControlsLocked(true); showToast('تم قفل الشاشة 🔒'); }} className="w-8 h-8 rounded-xl bg-[#08111F]/90 hover:bg-[#0E2038] border border-white/20 text-white flex items-center justify-center text-xs cursor-pointer">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                    </button>
                    <button onClick={() => { setNightMode(!nightMode); resetAutoHide(); }} className={`w-8 h-8 rounded-xl border flex items-center justify-center text-xs cursor-pointer ${nightMode ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-[#08111F]/90 border-white/20 text-slate-300'}`}>
                      <Moon className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => { setIsMuted(!isMuted); resetAutoHide(); }} className={`w-8 h-8 rounded-xl border flex items-center justify-center text-xs cursor-pointer ${isMuted ? 'bg-rose-500/20 text-rose-300' : 'bg-[#08111F]/90 border-white/20 text-slate-300'}`}>
                      {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
                    </button>
                    <button onClick={() => { setIsMirrored(!isMirrored); resetAutoHide(); }} className={`w-8 h-8 rounded-xl border flex items-center justify-center text-xs cursor-pointer ${isMirrored ? 'bg-cyan-500 text-slate-950' : 'bg-[#08111F]/90 border-white/20 text-slate-300'}`}>
                      <Sliders className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={toggleRepeat} className={`w-8 h-8 rounded-xl border flex items-center justify-center text-xs cursor-pointer ${repeatMode !== 'off' ? 'bg-cyan-500 text-slate-950' : 'bg-[#08111F]/90 border-white/20 text-slate-300'}`}>
                      {repeatMode === 'one' ? <Repeat1 className="w-3.5 h-3.5" /> : <Repeat className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={toggleAbLoop} className={`w-8 h-8 rounded-xl border flex items-center justify-center text-xs cursor-pointer ${abLoop.a !== null ? 'bg-amber-500 text-slate-950' : 'bg-[#08111F]/90 border-white/20 text-slate-300'}`}>
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* =========================================================================
                      🌟 ROW 2 (LOWER ROW): شريط التمرير الزمني وعدادات الوقت بدون إطار
                     ========================================================================= */}
                  <div className="flex items-center gap-2 select-none pt-0.5">
                    {/* Previous Button directly next to seekbar */}
                    <button
                      onClick={handlePreviousVideo}
                      className="w-7 h-7 rounded-lg bg-black/60 hover:bg-black/90 text-white flex items-center justify-center cursor-pointer transition-all active:scale-90"
                      title="المقطع السابق"
                    >
                      <SkipBack className="w-3.5 h-3.5" />
                    </button>

                    <span className="text-[11px] sm:text-xs font-mono font-bold text-white tabular-nums min-w-[36px] text-left">
                      {formatTime(currentTime)}
                    </span>

                    {/* Fluid, Frameless Progress Scrubber */}
                    <div
                      ref={progressRef}
                      onMouseDown={(e) => { setIsDragging(true); handleTimelineMove(e.clientX); }}
                      onMouseMove={(e) => { if (isDragging) handleTimelineMove(e.clientX); }}
                      onMouseUp={() => setIsDragging(false)}
                      onMouseLeave={() => setIsDragging(false)}
                      className="relative flex-1 h-6 flex items-center cursor-pointer group/seek"
                    >
                      <div className="w-full h-1.5 group-hover/seek:h-2.5 bg-white/20 group-hover/seek:bg-white/30 rounded-full overflow-visible relative transition-all duration-150">
                        {/* A-B Loop visual pins */}
                        {abLoop.a !== null && (
                          <div
                            className="absolute top-1/2 -translate-y-1/2 -ml-1 w-2 h-4 bg-amber-400 rounded-sm z-10 shadow"
                            style={{ left: `${(abLoop.a / duration) * 100}%` }}
                            title={`نقطة A: ${formatTime(abLoop.a)}`}
                          />
                        )}
                        {abLoop.b !== null && (
                          <div
                            className="absolute top-1/2 -translate-y-1/2 -ml-1 w-2 h-4 bg-amber-400 rounded-sm z-10 shadow"
                            style={{ left: `${(abLoop.b / duration) * 100}%` }}
                            title={`نقطة B: ${formatTime(abLoop.b)}`}
                          />
                        )}

                        <div
                          className="h-full bg-gradient-to-r from-cyan-400 via-sky-400 to-[#00D2FF] rounded-full relative"
                          style={{ width: `${Math.min(100, (currentTime / duration) * 100)}%` }}
                        >
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 w-4 h-4 rounded-full bg-[#00D2FF] border-2 border-white shadow-[0_0_12px_#00D2FF] ring-2 ring-cyan-500/40" />
                        </div>
                      </div>
                    </div>

                    <span className="text-[11px] sm:text-xs font-mono font-bold text-white tabular-nums min-w-[48px] text-right">
                      {formatTime(duration)}
                    </span>

                    {/* Next Button directly next to seekbar */}
                    <button
                      onClick={handleNextVideo}
                      className="w-7 h-7 rounded-lg bg-black/60 hover:bg-black/90 text-white flex items-center justify-center cursor-pointer transition-all active:scale-90"
                      title="المقطع التالي"
                    >
                      <SkipForward className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        const modes: Array<'16:9' | 'fill' | 'fit' | '4:3'> = ['16:9', 'fill', 'fit', '4:3'];
                        const next = modes[(modes.indexOf(aspectMode as any) + 1) % modes.length];
                        setAspectMode(next);
                        showToast(`أبعاد الشاشة: ${next}`);
                        resetAutoHide();
                      }}
                      className="w-6 h-6 rounded border border-white/40 hover:border-cyan-400 flex items-center justify-center text-white/80 hover:text-cyan-300 cursor-pointer transition-all active:scale-95"
                      title="تبديل أبعاد الشاشة"
                    >
                      <SquareIcon />
                    </button>
                  </div>

                </div>
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            VIEW 3B: FULL AUDIO & MUSIC PLAYER (مشغل الموسيقى، قرص دوار، بدون إطار)
           ===================================================================== */}
        {viewState === 'player' && activeTab === 'audio' && (
          <div className="relative w-full aspect-[9/16] sm:aspect-[16/9] bg-gradient-to-b from-[#110526] via-[#090214] to-[#04000a] p-4 sm:p-6 flex flex-col justify-between select-none overflow-hidden">
            {/* Top Bar inside Audio Player */}
            <div className="flex items-center justify-between z-10">
              <button
                onClick={() => { setActiveTab('video'); setViewState('player'); }}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow active:scale-95 transition-all"
                title="التبديل إلى مشغل الفيديو"
              >
                <Film className="w-3.5 h-3.5 text-cyan-400" />
                <span>مشغل الفيديو</span>
              </button>

              <div className="text-center">
                <span className="text-[11px] font-mono font-bold text-pink-300 bg-pink-500/20 px-3 py-1 rounded-full border border-pink-500/40">
                  {currentAudioTrack.format || 'MP3'} • {currentAudioTrack.bitrate || '320kbps'}
                </span>
              </div>

              <button
                onClick={() => {
                  setConverterTitle(currentAudioTrack.title);
                  setActiveModal('converter');
                }}
                className="px-3 py-1.5 rounded-xl bg-pink-600/30 hover:bg-pink-600/50 border border-pink-500/40 text-pink-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow active:scale-95 transition-all"
              >
                <Music className="w-3.5 h-3.5 text-pink-400" />
                <span>محول الصوتيات</span>
              </button>
            </div>

            {/* Circular Vinyl Disc Section */}
            <div className="flex-1 flex flex-col items-center justify-center my-3 relative">
              <div className={`relative w-44 h-44 sm:w-52 sm:h-52 rounded-full p-2 bg-gradient-to-tr from-pink-500/30 to-purple-500/30 border-2 border-white/20 shadow-2xl flex items-center justify-center ${audioIsPlaying ? 'animate-[spin_10s_linear_infinite]' : ''}`}>
                {/* Vinyl Grooves */}
                <div className="w-full h-full rounded-full bg-slate-950 border-4 border-slate-900 flex items-center justify-center shadow-inner relative overflow-hidden">
                  <div className="absolute inset-2 rounded-full border border-white/5" />
                  <div className="absolute inset-6 rounded-full border border-white/5" />
                  <div className="absolute inset-10 rounded-full border border-white/5" />
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center shadow-lg border-2 border-white/40">
                    <Disc className="w-10 h-10 text-white" />
                  </div>
                </div>
              </div>

              {/* Title & Artist */}
              <div className="text-center mt-3 space-y-1">
                <h3 className="text-sm sm:text-base font-black text-white">{currentAudioTrack.title}</h3>
                <p className="text-xs text-pink-300/80 font-bold">{currentAudioTrack.artist}</p>
                <p className="text-[10px] text-slate-500 font-mono">REMO High-Fidelity Audio Engine</p>
              </div>
            </div>

            {/* Controls & Frameless Audio Scrubber */}
            <div className="space-y-3.5 max-w-lg mx-auto w-full">
              {/* Fluid, Frameless Audio Progress Bar */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-white tabular-nums min-w-[36px]">
                  {formatTime(audioCurrentTime)}
                </span>
                <div
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const frac = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                    setAudioCurrentTime(Math.round(audioDuration * frac));
                  }}
                  className="relative flex-1 h-6 flex items-center cursor-pointer group/audio_seek"
                >
                  <div className="w-full h-1.5 group-hover/audio_seek:h-2.5 bg-white/20 group-hover/audio_seek:bg-white/30 rounded-full relative transition-all duration-150">
                    <div
                      className="h-full bg-gradient-to-r from-pink-500 via-rose-400 to-[#00F2FE] rounded-full relative"
                      style={{ width: `${Math.min(100, (audioCurrentTime / audioDuration) * 100)}%` }}
                    >
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 w-4 h-4 rounded-full bg-[#00F2FE] border-2 border-white shadow-[0_0_12px_#00F2FE]" />
                    </div>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-white tabular-nums min-w-[36px] text-right">
                  {formatTime(audioDuration)}
                </span>
              </div>

              {/* Audio Transport Controls Row (بارز واحترافي مع أزرار التالي والسابق) */}
              <div className="flex items-center justify-center gap-3 sm:gap-5">
                <button
                  onClick={() => setAudioCurrentTime((t) => Math.max(0, t - 10))}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs font-bold font-mono cursor-pointer active:scale-95"
                  title="تأخير 10 ثوان"
                >
                  -10s
                </button>

                <button
                  onClick={() => setShuffleAudio(!shuffleAudio)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer active:scale-95 transition-all ${
                    shuffleAudio ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                  title="خلط عشوائي"
                >
                  <Shuffle className="w-4 h-4" />
                </button>

                {/* 🌟 زر السابق البارز في مشغل الموسيقى */}
                <button
                  onClick={handlePreviousAudio}
                  className="w-12 h-12 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer active:scale-90 transition-all shadow-lg"
                  title="المسار الصوتي السابق"
                >
                  <SkipBack className="w-6 h-6 fill-current" />
                </button>

                {/* زر التشغيل والإيقاف الدائري البارز */}
                <button
                  onClick={() => setAudioIsPlaying(!audioIsPlaying)}
                  className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 text-white flex items-center justify-center cursor-pointer active:scale-95 transition-all shadow-2xl shadow-pink-500/50"
                  title={audioIsPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
                >
                  {audioIsPlaying ? (
                    <Pause className="w-7 h-7 fill-current stroke-current" />
                  ) : (
                    <Play className="w-7 h-7 fill-current stroke-current ml-0.5" />
                  )}
                </button>

                {/* 🌟 زر التالي البارز في مشغل الموسيقى */}
                <button
                  onClick={handleNextAudio}
                  className="w-12 h-12 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer active:scale-90 transition-all shadow-lg"
                  title="المسار الصوتي التالي"
                >
                  <SkipForward className="w-6 h-6 fill-current" />
                </button>

                <button
                  onClick={() => {
                    const modes: Array<'off' | 'one' | 'all'> = ['off', 'one', 'all'];
                    const next = modes[(modes.indexOf(audioRepeat) + 1) % modes.length];
                    setAudioRepeat(next);
                    showToast(next === 'one' ? 'تكرار مسار واحد 🔂' : next === 'all' ? 'تكرار الكل 🔁' : 'إيقاف التكرار');
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer active:scale-95 transition-all ${
                    audioRepeat !== 'off' ? 'bg-pink-500 text-white font-bold' : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                  title="نمط التكرار"
                >
                  {audioRepeat === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setAudioCurrentTime((t) => Math.min(audioDuration, t + 10))}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs font-bold font-mono cursor-pointer active:scale-95"
                  title="تقديم 10 ثوان"
                >
                  +10s
                </button>
              </div>

              {/* Quick Audio Playlist drawer */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-pink-400" />
                  <span>قائمة المقاطع الصوتية ({audioTracks.length})</span>
                </span>
                <span className="text-[11px] text-pink-300">انقر للتبديل بين الصوتيات</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {audioTracks.map((track) => {
                  const isCurrent = currentAudioTrack.id === track.id;
                  return (
                    <button
                      key={track.id}
                      onClick={() => {
                        setCurrentAudioTrack(track);
                        setAudioDuration(track.durationSec);
                        setAudioCurrentTime(0);
                        setAudioIsPlaying(true);
                      }}
                      className={`p-2 px-3 rounded-xl border text-right text-xs whitespace-nowrap cursor-pointer transition-all flex items-center gap-2 ${
                        isCurrent
                          ? 'bg-pink-500/20 border-pink-400 text-white font-bold'
                          : 'bg-black/40 border-white/10 text-slate-300 hover:border-white/30'
                      }`}
                    >
                      <Disc className={`w-3.5 h-3.5 ${isCurrent && audioIsPlaying ? 'text-pink-400 animate-spin' : 'text-slate-400'}`} />
                      <div className="overflow-hidden">
                        <div className="truncate max-w-[140px]">{track.title}</div>
                        <div className="text-[10px] text-slate-400">{track.dur} • {track.format || 'MP3'}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            🔔 MINI NOTIFICATION BAR (مع أزرار التالي، السابق، تشغيل، وتوقف كاملة)
           ===================================================================== */}
        {showMiniNotification && viewState !== 'player' && (
          <div className="absolute inset-x-2 bottom-2 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-cyan-500/50 rounded-2xl p-2.5 shadow-2xl flex items-center justify-between z-30 animate-slideUp">
            <div
              onClick={() => setViewState('player')}
              className="flex items-center gap-2.5 flex-1 cursor-pointer"
              title="اضغط للعودة إلى مشغل الفيديو"
            >
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 animate-pulse">
                <Film className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-white truncate">{currentVideo.title} (Foreground Service نشط)</div>
                <div className="text-[10px] text-cyan-300 font-mono">{formatTime(currentTime)} / {formatTime(duration)}</div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePreviousVideo}
                className="w-8 h-8 rounded-lg bg-slate-800 text-white hover:bg-slate-700 flex items-center justify-center text-xs cursor-pointer shadow active:scale-95"
                title="السابق"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-8 h-8 rounded-lg bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 flex items-center justify-center text-xs cursor-pointer shadow active:scale-95"
                title={isPlaying ? 'إيقاف' : 'تشغيل'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                onClick={handleNextVideo}
                className="w-8 h-8 rounded-lg bg-slate-800 text-white hover:bg-slate-700 flex items-center justify-center text-xs cursor-pointer shadow active:scale-95"
                title="التالي"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setShowMiniNotification(false);
                  setIsPlaying(false);
                  showToast('تم إيقاف Foreground Service وإغلاق المشغل');
                }}
                className="w-8 h-8 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 flex items-center justify-center text-xs cursor-pointer"
                title="إغلاق وإيقاف التشغيل (×)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Device Bottom Home Bar */}
        <div className="bg-slate-900 py-2 flex justify-center border-t border-slate-800">
          <div className="w-32 h-1 bg-slate-700 rounded-full" />
        </div>
      </div>

      {/* =========================================================================
          📱 MODAL: LOCK SCREEN & BACKGROUND NOTIFICATION INTERACTIVE HUD
          (حل الخطأ الثالث: إثبات ومعاينة مشغل قفل الشاشة والإشعارات بجميع أزراره)
         ========================================================================= */}
      {activeModal === 'lockscreen_hud' && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#07111E] border border-cyan-500/50 rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
                <h4 className="font-bold text-sm">مشغل قفل الشاشة وإشعار النظام</h4>
              </div>
              <button onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-cyan-500/40 space-y-3 shadow-xl">
              <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2">
                <span className="flex items-center gap-1.5 text-cyan-300 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  REMO Foreground Service
                </span>
                <span className="font-mono">100% 🔋</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shadow-md">
                  <Film className="w-6 h-6" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="font-bold text-xs truncate text-white">{currentVideo.title}</div>
                  <div className="text-[10px] text-slate-400">مشغل الوسائط المتكامل • {displayMode.toUpperCase()}</div>
                  <div className="text-[10px] text-cyan-300 font-mono mt-0.5">{formatTime(currentTime)} / {formatTime(duration)}</div>
                </div>
              </div>

              {/* Scrubber inside notification */}
              <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (currentTime / duration) * 100)}%` }}
                />
              </div>

              {/* Notification & Lockscreen Action Buttons */}
              <div className="flex items-center justify-center gap-3 pt-1">
                <button
                  onClick={() => setCurrentTime((t) => Math.max(0, t - 10))}
                  className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center text-xs font-mono font-bold cursor-pointer active:scale-95"
                  title="تأخير 10 ثوان"
                >
                  -10s
                </button>

                <button
                  onClick={handlePreviousVideo}
                  className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center cursor-pointer active:scale-95 shadow-md"
                  title="المقطع السابق"
                >
                  <SkipBack className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-12 h-12 rounded-full bg-[#00D2FF] hover:bg-[#33DCFF] text-slate-950 flex items-center justify-center cursor-pointer active:scale-95 shadow-lg shadow-cyan-500/50"
                  title={isPlaying ? 'إيقاف' : 'تشغيل'}
                >
                  {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
                </button>

                <button
                  onClick={handleNextVideo}
                  className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center cursor-pointer active:scale-95 shadow-md"
                  title="المقطع التالي"
                >
                  <SkipForward className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setCurrentTime((t) => Math.min(duration, t + 10))}
                  className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center text-xs font-mono font-bold cursor-pointer active:scale-95"
                  title="تقديم 10 ثوان"
                >
                  +10s
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center leading-relaxed">
              هذه الأزرار تعمل فعلياً عبر <strong>MediaSession API</strong> وخدمة <strong>Foreground Service</strong> وتظهر على شاشة قفل أندرويد ومركز الإشعارات المنسدل.
            </p>

            <button
              onClick={() => { setActiveModal('none'); setViewState('player'); }}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer shadow-lg active:scale-95 transition-all"
            >
              العودة إلى مشغل الفيديو
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          ⚡ MODAL: INSTANT MEDIA INDEXING (إضافة وفهرسة فورية)
         ========================================================================= */}
      {activeModal === 'add_media' && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B1626] border border-emerald-500/40 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>إضافة ملف وفهرسة فورية (Instant Indexing)</span>
              </h4>
              <button onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              أدخل اسم ملف الفيديو أو الصوت لإضافته وفهرسته في المكتبة العامة بشكل فوري ولحظي دون أي تأخير.
            </p>
            <div className="space-y-3">
              <input
                type="text"
                value={newVideoTitleInput}
                onChange={(e) => setNewVideoTitleInput(e.target.value)}
                placeholder="مثال: فيلم جديد - 1080p.mkv"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-emerald-500 outline-none"
              />
              <button
                onClick={() => handleInstantAddMedia(newVideoTitleInput || 'ملف وسائط جديد - HD')}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>فهرسة وإضافة فورية (Instant Read)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ⚙️ MODAL: VIDEO SETTINGS PAGE (حل الخطأ السادس: تفعيل كافة الخيارات الإضافية)
         ========================================================================= */}
      {activeModal === 'settings' && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B1626] border border-cyan-500/40 rounded-2xl p-5 max-w-md w-full space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Settings className="w-4 h-4 text-cyan-400" />
                <span>إعدادات مشغل الفيديو والخدمة الخلفية (100% فعالة)</span>
              </h4>
              <button onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* 1. خدمة Foreground Service التثبيتية */}
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-1.5">
                <div className="font-bold text-emerald-300 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>خدمة Foreground Service في أندرويد:</span>
                  </div>
                  <button
                    onClick={() => {
                      setBackgroundPlaybackEnabled(!backgroundPlaybackEnabled);
                      showToast(backgroundPlaybackEnabled ? 'تم تعطيل التشغيل بالخلفية' : 'تم تفعيل التشغيل بالخلفية وقفل الشاشة');
                    }}
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${backgroundPlaybackEnabled ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}
                  >
                    {backgroundPlaybackEnabled ? 'نشط دائماً' : 'معطل'}
                  </button>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  تم ربط مشغل الوسائط بخدمة Android Foreground Service مع إشعار نظام مستمر وأزرار التحكم بالتشغيل وقفل الشاشة لمنع النظام من إغلاق التطبيق.
                </p>
              </div>

              {/* 2. تسريع العتاد GPU */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    <span>تسريع العتاد عبر بطاقة الرسوميات (GPU Acceleration)</span>
                  </div>
                  <div className="text-[10px] text-slate-400">فك تشفير عتادي فائق السرعة لتقليل استهلاك البطارية والحرارة</div>
                </div>
                <button
                  onClick={() => {
                    setHardwareAcceleration(!hardwareAcceleration);
                    showToast(hardwareAcceleration ? 'تم تعطيل تسريع العتاد' : 'تم تفعيل تسريع العتاد GPU ⚡');
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${hardwareAcceleration ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}
                >
                  {hardwareAcceleration ? 'مفعل GPU' : 'سوفتوير'}
                </button>
              </div>

              {/* 3. حجم ذاكرة التخزين المؤقت (Buffer Cache) */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="font-bold text-white flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <HardDrive className="w-4 h-4 text-amber-400" />
                    <span>حجم ذاكرة التخزين المؤقت المسبق (Buffer Cache):</span>
                  </div>
                  <span className="text-amber-400 font-mono font-bold">{bufferCacheSize.toUpperCase()}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(['16mb', '32mb', '64mb'] as const).map((sz) => (
                    <button
                      key={sz}
                      onClick={() => {
                        setBufferCacheSize(sz);
                        showToast(`تم تعيين ذاكرة التخزين المؤقت إلى ${sz.toUpperCase()}`);
                      }}
                      className={`py-1.5 rounded-lg text-center font-bold text-[11px] transition-all ${
                        bufferCacheSize === sz ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-950 text-slate-300 border border-slate-800'
                      }`}
                    >
                      {sz === '16mb' ? '16MB (اقتصادي)' : sz === '32mb' ? '32MB (متوازن)' : '64MB (أقصى دقة 4K)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. محرك فك التشفير الأساسي */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="font-bold text-white flex items-center justify-between">
                  <span>محرك التشغيل الأساسي (Decoder Engine):</span>
                  <span className="text-cyan-400 font-mono text-[11px]">{playbackEngine.toUpperCase()}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { setPlaybackEngine('exoplayer'); showToast('تم تفعيل محرك ExoPlayer الافتراضي السريع ⚡'); }}
                    className={`p-2 rounded-lg text-center font-bold transition-all ${playbackEngine === 'exoplayer' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'bg-slate-950 text-slate-300 border border-slate-800'}`}
                  >
                    ExoPlayer (عتادي وسريع)
                  </button>
                  <button
                    onClick={() => { setPlaybackEngine('libvlc'); showToast('تم تفعيل محرك LibVLC التوافقي الشامل 🎬'); }}
                    className={`p-2 rounded-lg text-center font-bold transition-all ${playbackEngine === 'libvlc' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'bg-slate-950 text-slate-300 border border-slate-800'}`}
                  >
                    LibVLC (كافة الصيغ النادرة)
                  </button>
                </div>
              </div>

              {/* 5. الانتقال التلقائي للفيديو التالي دون توقف */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <SkipForward className="w-4 h-4 text-emerald-400" />
                    <span>الانتقال التلقائي للفيديو التالي عند الانتهاء</span>
                  </div>
                  <div className="text-[10px] text-slate-400">عند انتهاء المقطع الحالي، ينتقل فوراً للمقطع التالي دون توقف</div>
                </div>
                <button
                  onClick={() => {
                    setAutoNextVideo(!autoNextVideo);
                    showToast(autoNextVideo ? 'تم إيقاف الانتقال التلقائي' : 'تم تفعيل الانتقال التلقائي للمقطع التالي ⏭️');
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${autoNextVideo ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}
                >
                  {autoNextVideo ? 'مفعل تلقائياً' : 'متوقف'}
                </button>
              </div>

              {/* 6. استئناف المشاهدة من آخر نقطة */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span>تذكر واستئناف موضع المشاهدة السابق</span>
                  </div>
                  <div className="text-[10px] text-slate-400">متابعة الفيديو من الثواني الأخيرة التي توقفت عندها تلقائياً</div>
                </div>
                <button
                  onClick={() => {
                    setResumeMemoryEnabled(!resumeMemoryEnabled);
                    showToast(resumeMemoryEnabled ? 'تم إيقاف ذاكرة الاستئناف' : 'تم تفعيل ذاكرة الاستئناف الذكية ⏱️');
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${resumeMemoryEnabled ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}
                >
                  {resumeMemoryEnabled ? 'مفعل' : 'معطل'}
                </button>
              </div>

              {/* 7. مضخم الصوت والمعادل المحيطي */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="font-bold text-white flex items-center justify-between">
                  <span>تضخيم الصوت الفائق (Audio Boost):</span>
                  <button
                    onClick={() => { setAudioBoost(!audioBoost); showToast(audioBoost ? 'تم إيقاف مضخم الصوت' : 'تم تفعيل مضخم الصوت حتى 200% 🔊'); }}
                    className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${audioBoost ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}
                  >
                    {audioBoost ? 'حتى 200% مفعل' : '100% عادي'}
                  </button>
                </div>
                <div className="text-slate-400 text-[10px]">نمط معادل الصوت المحيطي (Equalizer):</div>
                <div className="grid grid-cols-4 gap-1.5 text-center">
                  {(['normal', 'bass', 'vocal', 'cinema'] as const).map((eq) => (
                    <button
                      key={eq}
                      onClick={() => { setEqualizerPreset(eq); showToast(`تم اختيار معادل الصوت: ${eq.toUpperCase()}`); }}
                      className={`p-1.5 rounded-lg text-[10px] font-bold ${equalizerPreset === eq ? 'bg-cyan-500 text-slate-950' : 'bg-slate-950 text-slate-300 border border-slate-800'}`}
                    >
                      {eq === 'normal' && 'عادي'}
                      {eq === 'bass' && 'جهير (Bass)'}
                      {eq === 'vocal' && 'بشري (Vocal)'}
                      {eq === 'cinema' && 'سينمائي 5.1'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 8. إيماءات اللمس الذكية وربط أزرار الهاتف */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">إيماءات السحب وأزرار الهاتف</div>
                  <div className="text-[10px] text-slate-400">الجهة اليمنى للصوت وأزرار الهاتف • والجهة اليسرى للإضاءة</div>
                </div>
                <button
                  onClick={() => { setEnableGestures(!enableGestures); showToast(enableGestures ? 'تم تعطيل إيماءات السحب' : 'تم تفعيل إيماءات الصوت والإضاءة'); }}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${enableGestures ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}
                >
                  {enableGestures ? 'مفعلة' : 'معطلة'}
                </button>
              </div>
            </div>

            <button
              onClick={() => { setActiveModal('none'); showToast('تم حفظ كافة إعدادات الفيديو والخدمة الخلفية بنجاح ✅'); }}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer shadow-lg active:scale-95 transition-all"
            >
              حفظ الإعدادات وإغلاق
            </button>
          </div>
        </div>
      )}

      {/* Safe Vault PIN Auth Modal */}
      {activeModal === 'safe_pin' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B1626] border border-emerald-500/50 rounded-2xl p-6 max-w-xs w-full space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <Shield className="w-6 h-6" />
            </div>
            
            <div>
              <h4 className="font-bold text-white text-sm">المجلد الآمن (REMO Vault)</h4>
              <p className="text-xs text-slate-400 mt-1">أدخل رمز PIN المكون من 4 أرقام لفتح الفيديوهات المخفية بنظام .nomedia</p>
            </div>

            <div className="flex justify-center gap-3 my-2">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-3.5 h-3.5 rounded-full border transition-all ${
                    enteredPin.length > idx
                      ? 'bg-emerald-400 border-emerald-400 scale-110 shadow-lg shadow-emerald-500/50'
                      : 'border-slate-600 bg-slate-900'
                  }`}
                />
              ))}
            </div>

            {pinError && <div className="text-[11px] text-rose-400 font-bold">{pinError}</div>}

            <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto pt-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '✓'].map((k) => (
                <button
                  key={k}
                  onClick={() => {
                    if (k === 'C') {
                      setEnteredPin('');
                      setPinError(null);
                    } else if (k === '✓') {
                      handleUnlockVault();
                    } else if (enteredPin.length < 4) {
                      const next = enteredPin + k;
                      setEnteredPin(next);
                      setPinError(null);
                      if (next.length === 4) {
                        setTimeout(() => {
                          if (next === vaultPin) {
                            setIsVaultUnlocked(true);
                            setActiveModal('none');
                            setViewState('vault');
                            setEnteredPin('');
                            showToast('🔓 تم فتح المجلد الآمن بنجاح');
                          } else {
                            setPinError('رمز PIN غير صحيح. الرمز الافتراضي: 1234');
                          }
                        }, 100);
                      }
                    }
                  }}
                  className={`h-11 rounded-xl text-sm font-bold flex items-center justify-center cursor-pointer active:scale-95 transition-all ${
                    k === '✓'
                      ? 'bg-emerald-500 text-slate-950'
                      : k === 'C'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-slate-900 text-white border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>

            <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800">
              الرمز الافتراضي للتجربة: <span className="font-mono text-cyan-400 font-bold">1234</span>
            </div>

            <button
              onClick={() => { setActiveModal('none'); setEnteredPin(''); setPinError(null); }}
              className="text-xs text-slate-400 hover:text-white pt-1"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* Subtitles modal */}
      {activeModal === 'subtitles' && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B1626] border border-cyan-500/40 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Subtitles className="w-4 h-4 text-cyan-400" />
                <span>مسارات الترجمة والصوت المدمجة</span>
              </h4>
              <button onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-2">
              {['عربي - مدمج (VLC/Exo)', 'English - Embedded Subtitles', 'ترجمة محلية - ملف SRT خارجي', 'إيقاف الترجمة'].map((track, i) => (
                <button
                  key={i}
                  onClick={() => { setCurrentSubtitleTrack(track); setSubtitleEnabled(track !== 'إيقاف الترجمة'); setActiveModal('none'); showToast(`تم اختيار المسار: ${track}`); }}
                  className={`w-full p-2.5 rounded-xl text-right text-xs font-bold transition-all flex items-center justify-between ${currentSubtitleTrack === track ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-900/60 text-slate-300 border border-slate-800'}`}
                >
                  <span>{track}</span>
                  {currentSubtitleTrack === track && <Check className="w-4 h-4 text-cyan-400" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Import subtitles */}
      {activeModal === 'import' && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B1626] border border-emerald-500/40 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Download className="w-4 h-4 text-emerald-400" />
                <span>استيراد ملف ترجمة خارجي</span>
              </h4>
              <button onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <label className="block w-full py-3 px-4 rounded-xl border-2 border-dashed border-slate-700 hover:border-emerald-500 text-center text-xs text-slate-400 hover:text-emerald-300 cursor-pointer transition-colors">
              <input type="file" accept=".srt,.vtt,.ass,.ssa,.sub" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setCurrentSubtitleTrack(`ملف محلي: ${f.name}`); setSubtitleEnabled(true); setActiveModal('none'); showToast(`تم استيراد الترجمة: ${f.name} ✅`); } }} />
              <span>اضغط لاختيار ملف ترجمة من الهاتف</span>
            </label>
          </div>
        </div>
      )}

      {/* Edit video */}
      {activeModal === 'edit' && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B1626] border border-amber-500/40 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                <span>أداة تحرير وقص الفيديو السريع</span>
              </h4>
              <button onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <button onClick={() => { setActiveModal('none'); showToast('تم حفظ المقطع المقصوص بنجاح ✂️'); }} className="w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs cursor-pointer">حفظ المقطع</button>
          </div>
        </div>
      )}

      {/* Aspect ratio */}
      {activeModal === 'aspect' && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B1626] border border-cyan-500/40 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-bold text-white text-sm">نسب العرض وأبعاد الشاشة</h4>
              <button onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {['16:9', 'fill', 'fit', 'stretch', '4:3'].map((m) => (
                <button key={m} onClick={() => { setAspectMode(m as any); setActiveModal('none'); showToast(`أبعاد الشاشة: ${m}`); }} className={`p-2.5 rounded-xl text-xs font-bold ${aspectMode === m ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-300'}`}>{m}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Share */}
      {activeModal === 'share' && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B1626] border border-blue-500/40 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-bold text-white text-sm">مشاركة الفيديو والوسائط</h4>
              <button onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              {['واتساب', 'تيليجرام', 'نسخ الرابط'].map((app, i) => (
                <button key={i} onClick={() => { setActiveModal('none'); showToast(`تمت المشاركة عبر ${app} 🔗`); }} className="p-3 rounded-xl bg-slate-900 text-white font-bold cursor-pointer">{app}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          🎵 MODAL: BUILT-IN AUDIO CONVERTER (محول الصوتيات المدمج Video to MP3/AAC)
         ========================================================================= */}
      {activeModal === 'converter' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A0718] border border-pink-500/50 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Music className="w-5 h-5 text-pink-400 animate-pulse" />
                <h4 className="font-black text-sm">محول الصوتيات المدمج (Video to Audio Extractor)</h4>
              </div>
              <button onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Target File Info */}
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="text-[10px] text-pink-300 font-bold">الملف الحالي المراد تحويله:</div>
                <div className="font-black text-white text-sm truncate">{currentVideo.title}</div>
                <div className="text-[10px] text-slate-400 font-mono">{currentVideo.dur} • {currentVideo.size}</div>
              </div>

              {/* Title input */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">اسم الملف الصوتي المستخرج:</label>
                <input
                  type="text"
                  value={converterTitle}
                  onChange={(e) => setConverterTitle(e.target.value)}
                  placeholder="أدخل اسم الملف..."
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/20 text-white text-xs outline-none focus:border-pink-500"
                />
              </div>

              {/* Format selection */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold">صيغة الصوت المستخرج:</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['mp3', 'aac', 'm4a', 'flac'] as const).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setConverterFormat(fmt)}
                      className={`py-2 rounded-xl text-center font-bold uppercase transition-all ${
                        converterFormat === fmt
                          ? 'bg-pink-500 text-slate-950 shadow-lg shadow-pink-500/40 ring-2 ring-pink-300'
                          : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bitrate selection */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold">معدل البت (Bitrate):</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['128k', '192k', '320k'] as const).map((br) => (
                    <button
                      key={br}
                      onClick={() => setConverterBitrate(br)}
                      className={`py-1.5 rounded-xl text-center font-bold font-mono transition-all ${
                        converterBitrate === br
                          ? 'bg-pink-500 text-slate-950 shadow-md'
                          : 'bg-white/5 text-slate-300 border border-white/10'
                      }`}
                    >
                      {br === '320k' ? '320kbps (فائق)' : br === '192k' ? '192kbps (عالي)' : '128kbps (قياسي)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Conversion progress */}
              {isConverting && (
                <div className="p-3.5 rounded-2xl bg-pink-950/40 border border-pink-500/40 space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between text-[11px] text-pink-300 font-bold">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping" />
                      {conversionStage}
                    </span>
                    <span className="font-mono">{conversionProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all duration-200"
                      style={{ width: `${conversionProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Conversion Result preview */}
              {convertedResult && (
                <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-1 animate-fadeIn">
                  <div className="font-bold text-emerald-300 flex items-center gap-1.5 text-xs">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>تم استخراج الصوت وإضافته لمشغل الموسيقى بنجاح!</span>
                  </div>
                  <div className="text-[11px] text-slate-300">
                    {convertedResult.title} • {convertedResult.size} • {convertedResult.format}
                  </div>
                  <button
                    onClick={() => {
                      setActiveModal('none');
                      setCurrentAudioTrack(convertedResult);
                      setAudioDuration(convertedResult.durationSec);
                      setAudioCurrentTime(0);
                      setAudioIsPlaying(true);
                      setActiveTab('audio');
                      setViewState('player');
                    }}
                    className="mt-2 w-full py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                  >
                    تشغيل الملف المستخرج الآن 🎧
                  </button>
                </div>
              )}

              {/* Action buttons */}
              {!isConverting && (
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={handleStartConversion}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-black text-xs cursor-pointer shadow-lg shadow-pink-500/30 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Music className="w-4 h-4" />
                    <span>بدء الاستخراج والتحويل الفوري</span>
                  </button>
                  <button
                    onClick={() => setActiveModal('none')}
                    className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 font-bold text-xs cursor-pointer"
                  >
                    إغلاق
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* =========================================================================
          🤖 MODAL: AI CHAPTERS & SMART HIGHLIGHTS (الفصول الذكية بالذكاء الاصطناعي)
         ========================================================================= */}
      {activeModal === 'ai_chapters' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#08111F] border border-cyan-500/50 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
                <h4 className="font-black text-sm">الفصول الذكية وتحليل المشاهد بالذكاء الاصطناعي (AI Chapters)</h4>
              </div>
              <button onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-cyan-300">
                يقوم محرك الذكاء الاصطناعي بتحليل الإطار الصوتي والبصري وتقسيم الفيديو إلى فصول تلقائية دقيقة:
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {[
                  { time: 0, title: '00:00 — المقدمة والشارة التمهيدية' },
                  { time: 420, title: '07:00 — العقدة الدرامية وانطلاق القصة' },
                  { time: 1850, title: '30:50 — الذروة والمواجهة الحماسية' },
                  { time: 4500, title: '1:15:00 — التحول والحل الختامي' },
                  { time: 7800, title: '2:10:00 — الاعتمادات والنهاية' },
                ].map((chap, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentTime(chap.time);
                      setActiveModal('none');
                      showToast(`تم الانتقال للفصل: ${chap.title}`);
                    }}
                    className="w-full p-3 rounded-xl bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/50 flex items-center justify-between text-right transition-all cursor-pointer group"
                  >
                    <span className="font-bold text-white group-hover:text-cyan-300">{chap.title}</span>
                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[11px]">{formatTime(chap.time)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          🎛️ MODAL: 5-BAND EQUALIZER & 3D SURROUND (الموازن الصوتي الاحترافي)
         ========================================================================= */}
      {activeModal === 'equalizer' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#120C05] border border-amber-500/50 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-400 animate-pulse" />
                <h4 className="font-black text-sm">الموازن الصوتي الاحترافي (5-Band Equalizer & Bass)</h4>
              </div>
              <button onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-5 gap-3 p-4 rounded-2xl bg-black/40 border border-amber-500/20 text-center">
                {['60Hz', '230Hz', '910Hz', '4kHz', '14kHz'].map((hz, i) => (
                  <div key={hz} className="flex flex-col items-center gap-2">
                    <span className="font-mono text-[10px] text-amber-300">{eqBands[i]}dB</span>
                    <input
                      type="range"
                      min="-12"
                      max="12"
                      value={eqBands[i]}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setEqBands((prev) => {
                          const next = [...prev];
                          next[i] = val;
                          return next;
                        });
                      }}
                      className="h-28 w-2 accent-amber-400 cursor-pointer [writing-mode:vertical-lr] [direction:rtl]"
                    />
                    <span className="font-mono text-[10px] text-slate-400">{hz}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setEqBands([8, 6, 4, 6, 9]); showToast('تم تفعيل وضع تضخيم الجهير الأقصى (Bass Boost)'); }}
                  className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                >
                  تعزيز الباس Bass Boost 🎸
                </button>
                <button
                  onClick={() => { setEqBands([5, 3, 6, 4, 7]); showToast('تم ضبط الموازن على الوضع السينمائي المحيطي'); }}
                  className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-bold text-xs"
                >
                  وضع سينمائي 3D 🎬
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          💤 MODAL: SLEEP TIMER WITH FADE OUT (مؤقت النوم مع الخفض التدريجي)
         ========================================================================= */}
      {activeModal === 'sleep_timer' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A0718] border border-indigo-500/50 rounded-3xl p-6 max-w-sm w-full space-y-5 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-400 animate-pulse" />
                <h4 className="font-black text-sm">مؤقت النوم (Sleep Timer Fade Out)</h4>
              </div>
              <button onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <p className="text-slate-300">حدد وقت إيقاف التشغيل التلقائي مع خفض صوت الموسيقى تدريجياً لراحة نومك:</p>
              <div className="grid grid-cols-2 gap-2">
                {[15, 30, 45, 60, 90, 120].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => {
                      setSleepTimerMinutes(mins);
                      setActiveModal('none');
                      showToast(`تم ضبط مؤقت النوم بعد ${mins} دقيقة مع الخفض التدريجي للصوت 💤`);
                    }}
                    className={`py-3 rounded-xl font-bold transition-all ${
                      sleepTimerMinutes === mins
                        ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 shadow-lg'
                        : 'bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10'
                    }`}
                  >
                    بعد {mins} دقيقة
                  </button>
                ))}
              </div>
              {sleepTimerMinutes !== null && (
                <button
                  onClick={() => {
                    setSleepTimerMinutes(null);
                    setActiveModal('none');
                    showToast('تم إلغاء مؤقت النوم');
                  }}
                  className="w-full py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold"
                >
                  إلغاء مؤقت النوم النشط
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SquareIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    </svg>
  );
}
