import React, { useState, useRef, useEffect } from 'react';
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
  Plus
} from 'lucide-react';

interface VideoItem {
  id: string;
  title: string;
  dur: string;
  durationSec: number;
  size: string;
  isSafe?: boolean;
}

const INITIAL_PUBLIC_VIDEOS: VideoItem[] = [
  { id: 'v1', title: 'فيلم الأكشن والدراما - 4K HDR', dur: '2:15:37', durationSec: 8137, size: '2.4 GB' },
  { id: 'v2', title: 'حلقة وثائقية تاريخية - 1080p', dur: '45:12', durationSec: 2712, size: '640 MB' },
  { id: 'v3', title: 'مباراة كرة القدم النهائية - HD 60fps', dur: '1:48:00', durationSec: 6480, size: '1.8 GB' },
  { id: 'v4', title: 'محاضرة تعليمية - الذكاء الاصطناعي', dur: '32:45', durationSec: 1965, size: '290 MB' }
];

export function MediaPlayerDemo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(7); // starts at 0:07
  const [duration, setDuration] = useState(8137); // 2:15:37
  const [activeTab, setActiveTab] = useState<'video' | 'audio'>('video');
  const [edition, setEdition] = useState<'lite' | 'modern' | 'economic' | 'comprehensive'>('lite');
  
  // Navigation & mini notification states
  const [viewState, setViewState] = useState<'player' | 'menu' | 'vault'>('player');
  const [showMiniNotification, setShowMiniNotification] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const audioLoopRef = useRef<HTMLAudioElement | null>(null);

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

  // Video and Audio Settings (إعدادات الفيديو الحقيقية)
  const [playbackEngine, setPlaybackEngine] = useState<'exoplayer' | 'libvlc'>('exoplayer');
  const [hardwareAcceleration, setHardwareAcceleration] = useState<boolean>(true);
  const [bufferCacheSize, setBufferCacheSize] = useState<'16mb' | '32mb' | '64mb'>('32mb');
  const [audioBoost, setAudioBoost] = useState<boolean>(false);
  const [equalizerPreset, setEqualizerPreset] = useState<'normal' | 'bass' | 'vocal' | 'cinema'>('cinema');
  const [enableGestures, setEnableGestures] = useState<boolean>(true);

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

  // Safe Folder / Vault Real Implementation (المجلد الآمن الفعلي)
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

  // Modals & toast notifications
  const [activeModal, setActiveModal] = useState<'none' | 'subtitles' | 'import' | 'edit' | 'aspect' | 'share' | 'settings' | 'safe_pin' | 'add_media'>('none');
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
      }, 4000);
    }
  };

  useEffect(() => {
    resetAutoHide();
    return () => {
      if (autoHideTimeoutRef.current) clearTimeout(autoHideTimeoutRef.current);
    };
  }, [isPlaying, controlsVisible, controlsLocked]);

  // Video playback time simulation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentTime((prev) => {
          if (abLoop.a !== null && abLoop.b !== null && prev >= abLoop.b) {
            return abLoop.a;
          }
          if (prev >= duration) {
            if (repeatMode === 'one') return 0;
            if (repeatMode === 'all') return 0;
            setIsPlaying(false);
            return duration;
          }
          return prev + 1;
        });
      }, 1000 / speed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, duration, speed, abLoop, repeatMode]);

  // =========================================================================
  // 🎵 MEDIA SESSION & LOCK SCREEN CONTROLS WITH FOREGROUND SERVICE & NOTIFICATION
  // =========================================================================
  useEffect(() => {
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

      // Notification and Lockscreen action handlers (التالي، السابق، تشغيل، توقف، تقديم، تأخير)
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
  }, [isPlaying, currentTime, duration, currentVideo, speed, displayMode]);

  // Hardware Volume Keys Integration (الاستجابة لرفع وخفض الصوت بأزرار الهاتف)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'AudioVolumeUp') {
        e.preventDefault();
        setVolume((v) => {
          const maxVol = audioBoost ? 200 : 100;
          const next = Math.min(maxVol, v + 5);
          triggerGestureHUD('volume');
          return next;
        });
      } else if (e.key === 'ArrowDown' || e.key === 'AudioVolumeDown') {
        e.preventDefault();
        setVolume((v) => {
          const next = Math.max(0, v - 5);
          triggerGestureHUD('volume');
          return next;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [audioBoost]);

  // WakeLock
  useEffect(() => {
    let wakeLock: any = null;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator && isPlaying) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        }
      } catch {
        // Ignored
      }
    };
    if (isPlaying) requestWakeLock();
    return () => {
      if (wakeLock) wakeLock.release().catch(() => {});
    };
  }, [isPlaying]);

  // =========================================================================
  // 👆 GESTURE SYSTEM (الجهة اليمنى للصوت، والجهة اليسرى للإضاءة)
  // =========================================================================
  const triggerGestureHUD = (type: 'volume' | 'brightness') => {
    setGestureType(type);
    setGestureHUDVisible(true);
    if (gestureHUDTimerRef.current) clearTimeout(gestureHUDTimerRef.current);
    gestureHUDTimerRef.current = setTimeout(() => {
      setGestureHUDVisible(false);
    }, 1800);
  };

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
  };

  const handleSurfaceTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!enableGestures || controlsLocked || !touchStartRef.current) return;
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const currentY = touch.clientY - rect.top;
    const deltaY = touchStartRef.current.y - currentY; // Up is positive

    if (touchStartRef.current.side === 'right') {
      // RIGHT SIDE = VOLUME (السحب للأعلى يرفع الصوت)
      const maxVol = audioBoost ? 200 : 100;
      const change = Math.round((deltaY / rect.height) * 120);
      const newVol = Math.max(0, Math.min(maxVol, touchStartRef.current.initVal + change));
      setVolume(newVol);
      if (newVol > 0 && isMuted) setIsMuted(false);
      triggerGestureHUD('volume');
    } else {
      // LEFT SIDE = BRIGHTNESS (السحب للأعلى يرفع الإضاءة)
      const change = Math.round((deltaY / rect.height) * 100);
      const newBright = Math.max(15, Math.min(100, touchStartRef.current.initVal + change));
      setBrightness(newBright);
      triggerGestureHUD('brightness');
    }
  };

  const handleSurfaceTouchEnd = () => {
    touchStartRef.current = null;
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

  // Previous & Next Video
  const handlePreviousVideo = () => {
    const currentList = viewState === 'vault' ? safeVideos : publicVideos;
    const idx = currentList.findIndex((v) => v.id === currentVideo.id);
    const prevIdx = idx > 0 ? idx - 1 : currentList.length - 1;
    const nextItem = currentList[prevIdx] || currentVideo;
    setCurrentVideo(nextItem);
    setDuration(nextItem.durationSec);
    setCurrentTime(0);
    showToast(`تشغيل المقطع السابق: ${nextItem.title}`);
    resetAutoHide();
  };

  const handleNextVideo = () => {
    const currentList = viewState === 'vault' ? safeVideos : publicVideos;
    const idx = currentList.findIndex((v) => v.id === currentVideo.id);
    const nextIdx = idx < currentList.length - 1 ? idx + 1 : 0;
    const nextItem = currentList[nextIdx] || currentVideo;
    setCurrentVideo(nextItem);
    setDuration(nextItem.durationSec);
    setCurrentTime(0);
    showToast(`تشغيل المقطع التالي: ${nextItem.title}`);
    resetAutoHide();
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
  // 🔒 SAFE VAULT LOGIC (المجلد الآمن الفعلي)
  // =========================================================================
  const handleMoveToSafeFolder = (video: VideoItem) => {
    setPublicVideos((prev) => prev.filter((v) => v.id !== video.id));
    setSafeVideos((prev) => [...prev.filter((v) => v.id !== video.id), { ...video, isSafe: true }]);
    showToast(`🔒 تم إخفاء «${video.title}» ونقله للمجلد الآمن بنجاح!`);
  };

  const handleRestoreFromSafeFolder = (video: VideoItem) => {
    setSafeVideos((prev) => prev.filter((v) => v.id !== video.id));
    setPublicVideos((prev) => [...prev, { ...video, isSafe: false }]);
    showToast(`🔓 تم إلغاء القفل واستعادة «${video.title}» إلى المكتبة العامة!`);
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
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#08111F]/95 text-cyan-300 border border-cyan-500/50 px-4 py-2 rounded-xl text-xs font-bold shadow-2xl backdrop-blur-md animate-fadeIn flex items-center gap-2">
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
              <span>مشغل ريموبلاير الاحترافي — النسخة الكاملة v1.0.64</span>
            </h3>
            <p className="text-xs text-slate-400">
              جودات العرض تعمل على أي دقة فيديو، فهرسة فورية ولحظية للوسائط، خدمة Foreground Service مثبتة للتشغيل بالخلفية وقفل الشاشة، وإيماءات الصوت والإضاءة.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
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
              <span>الإعدادات</span>
            </button>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
              v1.0.64 Official Build
            </span>
          </div>
        </div>

        {/* Top Navigation Mode Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => { setViewState('player'); }}
            className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer flex items-center gap-2.5 ${
              viewState === 'player'
                ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-lg'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Film className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="font-bold text-xs">مشغل الفيديو</div>
              <div className="text-[10px] text-slate-400">الشاشة والإيماءات</div>
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
              <div className="font-bold text-xs">المكتبة العامة ({publicVideos.length})</div>
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
              <div className="text-[10px] text-slate-400">{isVaultUnlocked ? 'مفتوح 🔓' : 'مقفل بـ PIN 🔒'}</div>
            </div>
          </button>

          <button
            onClick={() => setActiveModal('settings')}
            className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white text-right transition-all cursor-pointer flex items-center gap-2.5"
          >
            <Settings className="w-4 h-4 text-purple-400" />
            <div>
              <div className="font-bold text-xs">Foreground Service</div>
              <div className="text-[10px] text-slate-400">مثبت بالخلفية وقفل الشاشة</div>
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
                      {/* زر الإخفاء للمجلد الآمن */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveToSafeFolder(item);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        title="إخفاء ونقل للمجلد الآمن"
                      >
                        <Lock className="w-3 h-3 text-emerald-400" />
                        <span>إخفاء</span>
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
            VIEW 2: SAFE VAULT (المجلد الآمن الفعلي المحمي بـ PIN)
           ===================================================================== */}
        {viewState === 'vault' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
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
                  انتقل للمكتبة العامة واضغط على زر «إخفاء» بجوار أي فيديو لنقله فوراً هنا وحمايته.
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
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{item.title}</span>
                          <span className="text-[9px] bg-emerald-500 text-slate-950 font-black px-1.5 py-0.2 rounded">مخفي</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{item.dur} • {item.size}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRestoreFromSafeFolder(item)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
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
            VIEW 3: FULL VIDEO PLAYER SCREEN (جودات العرض تعمل على أي دقة فيديو)
           ===================================================================== */}
        {viewState === 'player' && (
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
                      <span>جودة {displayModes.find(m => m.id === displayMode)?.label} تعمل على أي دقة</span>
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
                  <div className="absolute bottom-24 inset-x-8 text-center pointer-events-none z-10">
                    <span className="bg-black/80 backdrop-blur-sm text-yellow-300 font-bold text-xs sm:text-sm px-3 py-1 rounded-lg border border-yellow-500/30 shadow-lg">
                      {currentTime % 6 < 3
                        ? 'أزرار الجودات (تلقائي، HD، HDR، 4K، سينمائي) مفعلة وتعمل على أي دقة فيديو!'
                        : 'Foreground Service نشط في الخلفية وشاشة القفل للتحكم المستمر'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* GESTURES ON-SCREEN HUD INDICATORS */}
            {gestureHUDVisible && gestureType === 'volume' && (
              <div className="absolute top-1/2 -translate-y-1/2 right-6 z-30 pointer-events-none animate-fadeIn">
                <div className="bg-black/80 backdrop-blur-md border border-cyan-500/50 rounded-2xl p-3 flex flex-col items-center gap-2 shadow-2xl">
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
                  <span className="text-[9px] text-slate-400">الصوت (اليمين)</span>
                </div>
              </div>
            )}

            {gestureHUDVisible && gestureType === 'brightness' && (
              <div className="absolute top-1/2 -translate-y-1/2 left-6 z-30 pointer-events-none animate-fadeIn">
                <div className="bg-black/80 backdrop-blur-md border border-amber-500/50 rounded-2xl p-3 flex flex-col items-center gap-2 shadow-2xl">
                  <Sun className="w-5 h-5 text-amber-400" />
                  <div className="w-2.5 h-28 bg-slate-800 rounded-full overflow-hidden flex flex-col justify-end p-0.5">
                    <div
                      className="w-full bg-amber-400 rounded-full transition-all duration-75"
                      style={{ height: `${brightness}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs font-bold text-white">{brightness}%</span>
                  <span className="text-[9px] text-slate-400">السطوع (اليسار)</span>
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
                  >
                    <Settings className="w-4 h-4 text-cyan-400" />
                  </button>
                </div>

                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
                  <span className="text-[11px] font-black tracking-wider text-cyan-300">Foreground Service</span>
                  <span className="text-[9px] font-mono text-emerald-400">نشط 🟢</span>
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
                  >
                    <Folder className="w-5 h-5 text-slate-200" />
                  </button>

                  <button
                    onClick={handlePreviousVideo}
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/55 hover:bg-black/80 border border-white/20 text-white flex items-center justify-center cursor-pointer active:scale-90 transition-all shadow-xl"
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
                BOTTOM CONTROLS CONTAINER DOCK (أزرار الجودات تعمل على أي دقة فيديو)
               ========================================================================= */}
            {controlsVisible && !controlsLocked && (
              <div
                className="absolute inset-x-2 bottom-2 z-20 pointer-events-auto animate-fadeIn"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-[#050D18]/92 backdrop-blur-md border border-white/15 rounded-2xl p-2.5 px-3.5 shadow-2xl space-y-2">
                  
                  {/* ROW 1: TIMELINE SCRUBBER & TIMES */}
                  <div className="flex items-center gap-3 select-none">
                    <span className="text-[11px] sm:text-xs font-mono font-bold text-white tabular-nums min-w-[36px] text-left">
                      {formatTime(currentTime)}
                    </span>

                    <div
                      ref={progressRef}
                      onMouseDown={(e) => { setIsDragging(true); handleTimelineMove(e.clientX); }}
                      onMouseMove={(e) => { if (isDragging) handleTimelineMove(e.clientX); }}
                      onMouseUp={() => setIsDragging(false)}
                      onMouseLeave={() => setIsDragging(false)}
                      className="relative flex-1 h-5 flex items-center cursor-pointer group/seek"
                    >
                      <div className="w-full h-1.5 bg-white/20 rounded-full overflow-visible relative">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-400 to-[#00D2FF] rounded-full relative"
                          style={{ width: `${Math.min(100, (currentTime / duration) * 100)}%` }}
                        >
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 w-4 h-4 rounded-full bg-[#00D2FF] border-2 border-white shadow-lg ring-2 ring-cyan-500/40" />
                        </div>
                      </div>
                    </div>

                    <span className="text-[11px] sm:text-xs font-mono font-bold text-white tabular-nums min-w-[48px] text-right">
                      {formatTime(duration)}
                    </span>

                    <button
                      onClick={() => {
                        const modes: Array<'16:9' | 'fill' | 'fit' | '4:3'> = ['16:9', 'fill', 'fit', '4:3'];
                        const next = modes[(modes.indexOf(aspectMode as any) + 1) % modes.length];
                        setAspectMode(next);
                        showToast(`أبعاد الشاشة: ${next}`);
                        resetAutoHide();
                      }}
                      className="w-6 h-6 rounded border border-white/40 hover:border-cyan-400 flex items-center justify-center text-white/80 hover:text-cyan-300 cursor-pointer transition-all active:scale-95"
                    >
                      <SquareIcon />
                    </button>
                  </div>

                  {/* ROW 2: HORIZONTAL SCROLLABLE TOOLBAR (أزرار الجودات العامة لأي فيديو) */}
                  <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none scroll-smooth">
                    
                    {/* 🎬 DISPLAY QUALITY MODES (تعمل على أي دقة فيديو وليست حكرا على دقة معينة) */}
                    {displayModes.map((mode) => {
                      const isActive = displayMode === mode.id;
                      return (
                        <button
                          key={mode.id}
                          onClick={() => {
                            setDisplayMode(mode.id);
                            showToast(`⚡ تم تطبق جودة العرض (${mode.label}) على الفيديو الحالي بنجاح!`);
                            resetAutoHide();
                          }}
                          className={`min-h-[30px] px-2.5 rounded-xl border flex items-center gap-1.5 text-xs whitespace-nowrap active:scale-95 transition-all cursor-pointer font-bold ${
                            isActive
                              ? 'bg-[#00D2FF] text-[#050D18] border-[#00D2FF] shadow-lg shadow-cyan-500/40 ring-1 ring-cyan-300'
                              : 'bg-[#08111F]/80 hover:bg-[#0E2038] border-white/15 text-white'
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

                    {/* الأدوات الإضافية v1.0.61 */}
                    <button onClick={() => { setActiveModal('subtitles'); resetAutoHide(); }} className="min-h-[30px] px-2.5 rounded-xl bg-[#08111F]/80 hover:bg-[#0E2038] border border-white/15 text-white flex items-center gap-1.5 text-xs whitespace-nowrap cursor-pointer">
                      <Subtitles className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="font-bold text-[11px]">مسارات</span>
                    </button>
                    <button onClick={() => { setActiveModal('import'); resetAutoHide(); }} className="min-h-[30px] px-2.5 rounded-xl bg-[#08111F]/80 hover:bg-[#0E2038] border border-white/15 text-white flex items-center gap-1.5 text-xs whitespace-nowrap cursor-pointer">
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-bold text-[11px]">استيراد</span>
                    </button>
                    <button onClick={() => { setActiveModal('edit'); resetAutoHide(); }} className="min-h-[30px] px-2.5 rounded-xl bg-[#08111F]/80 hover:bg-[#0E2038] border border-white/15 text-white flex items-center gap-1.5 text-xs whitespace-nowrap cursor-pointer">
                      <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-bold text-[11px]">تحرير</span>
                    </button>
                    <button onClick={handlePip} className="min-h-[30px] px-2.5 rounded-xl bg-[#08111F]/80 hover:bg-[#0E2038] border border-white/15 text-white flex items-center gap-1.5 text-xs whitespace-nowrap cursor-pointer">
                      <Tv className="w-3.5 h-3.5 text-purple-400" />
                      <span className="font-bold text-[11px]">نافذة</span>
                    </button>
                    <button onClick={handleCaptureFrame} className="min-h-[30px] px-2.5 rounded-xl bg-[#08111F]/80 hover:bg-[#0E2038] border border-white/15 text-white flex items-center gap-1.5 text-xs whitespace-nowrap cursor-pointer">
                      <Camera className="w-3.5 h-3.5 text-rose-400" />
                      <span className="font-bold text-[11px]">لقطة</span>
                    </button>
                    <button onClick={() => { setActiveModal('share'); resetAutoHide(); }} className="min-h-[30px] px-2.5 rounded-xl bg-[#08111F]/80 hover:bg-[#0E2038] border border-white/15 text-white flex items-center gap-1.5 text-xs whitespace-nowrap cursor-pointer">
                      <Share2 className="w-3.5 h-3.5 text-blue-400" />
                      <span className="font-bold text-[11px]">مشاركة</span>
                    </button>
                    <button onClick={() => { setActiveModal('aspect'); resetAutoHide(); }} className="w-8 h-8 rounded-xl bg-[#08111F]/80 hover:bg-[#0E2038] border border-white/15 text-white flex items-center justify-center text-xs cursor-pointer">
                      <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                    </button>
                    <button onClick={cycleSpeed} className="min-w-[32px] h-8 px-2 rounded-xl bg-[#08111F]/80 hover:bg-[#0E2038] border border-white/15 text-cyan-300 flex items-center justify-center text-xs font-bold font-mono cursor-pointer">
                      ×{speed}
                    </button>
                    <button onClick={() => { setIsLandscape(!isLandscape); resetAutoHide(); }} className="w-8 h-8 rounded-xl bg-[#08111F]/80 hover:bg-[#0E2038] border border-white/15 text-white flex items-center justify-center text-xs cursor-pointer">
                      <RotateCw className="w-3.5 h-3.5 text-slate-300" />
                    </button>
                    <button onClick={() => { setControlsLocked(true); showToast('تم قفل الشاشة 🔒'); }} className="w-8 h-8 rounded-xl bg-[#08111F]/80 hover:bg-[#0E2038] border border-white/15 text-white flex items-center justify-center text-xs cursor-pointer">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                    </button>
                    <button onClick={() => { setNightMode(!nightMode); resetAutoHide(); }} className={`w-8 h-8 rounded-xl border flex items-center justify-center text-xs cursor-pointer ${nightMode ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-[#08111F]/80 border-white/15 text-slate-300'}`}>
                      <Moon className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => { setIsMuted(!isMuted); resetAutoHide(); }} className={`w-8 h-8 rounded-xl border flex items-center justify-center text-xs cursor-pointer ${isMuted ? 'bg-rose-500/20 text-rose-300' : 'bg-[#08111F]/80 border-white/15 text-slate-300'}`}>
                      {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
                    </button>
                    <button onClick={() => { setIsMirrored(!isMirrored); resetAutoHide(); }} className={`w-8 h-8 rounded-xl border flex items-center justify-center text-xs cursor-pointer ${isMirrored ? 'bg-cyan-500 text-slate-950' : 'bg-[#08111F]/80 border-white/15 text-slate-300'}`}>
                      <Sliders className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={toggleRepeat} className={`w-8 h-8 rounded-xl border flex items-center justify-center text-xs cursor-pointer ${repeatMode !== 'off' ? 'bg-cyan-500 text-slate-950' : 'bg-[#08111F]/80 border-white/15 text-slate-300'}`}>
                      {repeatMode === 'one' ? <Repeat1 className="w-3.5 h-3.5" /> : <Repeat className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={toggleAbLoop} className={`w-8 h-8 rounded-xl border flex items-center justify-center text-xs cursor-pointer ${abLoop.a !== null ? 'bg-amber-500 text-slate-950' : 'bg-[#08111F]/80 border-white/15 text-slate-300'}`}>
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>

                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            🔔 MINI NOTIFICATION BAR (مع أزرار التالي، السابق، وتشغيل Foreground Service)
           ===================================================================== */}
        {showMiniNotification && viewState !== 'player' && (
          <div className="absolute inset-x-2 bottom-2 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-cyan-500/40 rounded-2xl p-2.5 shadow-2xl flex items-center justify-between z-30 animate-slideUp">
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
                className="w-8 h-8 rounded-lg bg-slate-800 text-white hover:bg-slate-700 flex items-center justify-center text-xs cursor-pointer"
                title="السابق"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-8 h-8 rounded-lg bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 flex items-center justify-center text-xs cursor-pointer"
                title={isPlaying ? 'إيقاف' : 'تشغيل'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                onClick={handleNextVideo}
                className="w-8 h-8 rounded-lg bg-slate-800 text-white hover:bg-slate-700 flex items-center justify-center text-xs cursor-pointer"
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
          ⚙️ MODAL: VIDEO SETTINGS PAGE (Foreground Service & Decoder Options)
         ========================================================================= */}
      {activeModal === 'settings' && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B1626] border border-cyan-500/40 rounded-2xl p-5 max-w-md w-full space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Settings className="w-4 h-4 text-cyan-400" />
                <span>إعدادات مشغل الفيديو والخدمة الخلفية (Foreground Service)</span>
              </h4>
              <button onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* خدمة Foreground Service التثبيتية */}
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-1.5">
                <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>خدمة Foreground Service في أندرويد نشطة:</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  تم ربط مشغل الوسائط بخدمة Android Foreground Service مع إشعار نظام مستمر وزر «التحكم بالتشغيل» لضمان ثبات التشغيل في الخلفية وشاشة القفل دون أن يقوم النظام بإغلاق التطبيق.
                </p>
              </div>

              {/* محرك فك التشفير الأساسي */}
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

              {/* مضخم الصوت والمعادل */}
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

              {/* إيماءات اللمس الذكية */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">إيماءات السحب الذكية على الفيديو</div>
                  <div className="text-[10px] text-slate-400">الجهة اليمنى للصوت • والجهة اليسرى للإضاءة</div>
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
              <p className="text-xs text-slate-400 mt-1">أدخل رمز PIN المكون من 4 أرقام لفتح الفيديوهات المخفية</p>
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
