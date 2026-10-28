import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
  Film,
  Music,
  Shield,
  Cpu,
  Zap,
  Layers,
  Download,
  RotateCw,
  Lock,
  Unlock,
  Moon,
  Sun,
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
  Minimize2,
  Sliders,
  Tv
} from 'lucide-react';

export function MediaPlayerDemo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(7); // starts at 0:07 as in screenshot
  const [duration] = useState(8137); // 2:15:37 as in screenshot
  const [activeTab, setActiveTab] = useState<'video' | 'audio'>('video');
  const [edition, setEdition] = useState<'lite' | 'modern' | 'economic' | 'comprehensive'>('lite');
  
  // Navigation & mini notification states
  const [viewState, setViewState] = useState<'player' | 'menu'>('player');
  const [showMiniNotification, setShowMiniNotification] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  // Player controls overlay states (v1.0.61 behavior)
  const [controlsVisible, setControlsVisible] = useState(true);
  const [controlsLocked, setControlsLocked] = useState(false);
  const [speed, setSpeed] = useState<number>(1);
  const [aspectMode, setAspectMode] = useState<'fit' | 'fill' | 'stretch' | '16:9' | '4:3'>('16:9');
  const [isLandscape, setIsLandscape] = useState(true);
  const [nightMode, setNightMode] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isMirrored, setIsMirrored] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'one' | 'all'>('off');
  const [abLoop, setAbLoop] = useState<{ a: number | null; b: number | null }>({ a: null, b: null });
  const [subtitleEnabled, setSubtitleEnabled] = useState(true);
  const [currentSubtitleTrack, setCurrentSubtitleTrack] = useState('عربي - مدمج (VLC/Exo)');
  
  // Modals & toast notifications
  const [activeModal, setActiveModal] = useState<'none' | 'subtitles' | 'import' | 'edit' | 'aspect' | 'share'>('none');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const autoHideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // WakeLock & Visibility change for background playback
  useEffect(() => {
    let wakeLock: any = null;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator && isPlaying) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        }
      } catch {
        // WakeLock ignored
      }
    };
    if (isPlaying) requestWakeLock();
    return () => {
      if (wakeLock) wakeLock.release().catch(() => {});
    };
  }, [isPlaying]);

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

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches[0]) handleTimelineMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) handleTimelineMove(e.clientX);
  };

  // Exit video to menu while background audio continues
  const handleExitVideo = () => {
    setViewState('menu');
    setShowMiniNotification(true);
    showToast('يستمر تشغيل الصوت في الخلفية عبر MediaSession');
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

  return (
    <div className="space-y-6" dir="rtl">
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
              <span>مشغل ريموبلاير الاحترافي — النسخة الكاملة v1.0.65</span>
            </h3>
            <p className="text-xs text-slate-400">
              استعادة شريط أدوات حاوية التحكم السفلية بالكامل كما في الإصدار 1.0.61 (مسارات، استيراد، تحرير، نافذة، لقطة، مشاركة، أبعاد، سرعة، قفل، صوت، تكرار) مع تشغيل الخلفية.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
              v1.0.65 Official Build
            </span>
          </div>
        </div>

        {/* Edition Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => setEdition('lite')}
            className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
              edition === 'lite'
                ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs">نسخة لايت (Lite)</span>
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-[11px] font-mono text-emerald-300">الحجم: 38 ميجا فقط</div>
          </button>

          <button
            onClick={() => setEdition('modern')}
            className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
              edition === 'modern'
                ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-lg shadow-cyan-500/10'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs">المعالجات الحديثة</span>
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-[11px] font-mono text-cyan-300">64-bit / تسريع عتادي</div>
          </button>

          <button
            onClick={() => setEdition('economic')}
            className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
              edition === 'economic'
                ? 'bg-amber-500/20 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs">المعالجات الاقتصادية</span>
              <Shield className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-[11px] font-mono text-amber-300">توفير البطارية والرام</div>
          </button>

          <button
            onClick={() => setEdition('comprehensive')}
            className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
              edition === 'comprehensive'
                ? 'bg-purple-500/20 border-purple-500 text-white shadow-lg shadow-purple-500/10'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs">النسخة الشاملة (144MB)</span>
              <Layers className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-[11px] font-mono text-purple-300">كافة الترميزات وVLC</div>
          </button>
        </div>
      </div>

      {/* Video / Audio Switcher */}
      <div className="flex items-center justify-between bg-slate-900/60 p-2 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('video')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'video'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>مشغل الفيديو (مع شريط الأدوات 1.0.61)</span>
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'audio'
                ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>مشغل الصوت والموسيقى</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setIsLandscape(!isLandscape)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 cursor-pointer text-[11px]"
            title="تبديل وضع العرض بين العريض (Landscape) والعمودي (Portrait)"
          >
            <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isLandscape ? 'وضع الشاشة العريضة (أفقي)' : 'وضع الشاشة العمودية'}</span>
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
            <span>REMO PLAYER v1.0.65</span>
            <span className="text-emerald-400">100% 🔋</span>
          </div>
        </div>

        {/* VIEW 1: MENU SCREEN (When user exits to menu with mini background bar) */}
        {viewState === 'menu' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Folder className="w-4 h-4 text-cyan-400" />
                <span>مكتبة الفيديوهات والوسائط (REMO Library)</span>
              </h4>
              <button
                onClick={() => setViewState('player')}
                className="px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold hover:bg-cyan-500/30 cursor-pointer"
              >
                العودة لشاشة المشغل ←
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: 'فيلم الأكشن والدراما - 4K HDR', dur: '2:15:37', size: '2.4 GB', active: true },
                { title: 'حلقة وثائقية تاريخية - 1080p', dur: '45:12', size: '640 MB', active: false },
                { title: 'مباراة كرة القدم النهائية - HD 60fps', dur: '1:48:00', size: '1.8 GB', active: false },
                { title: 'محاضرة تعليمية - الذكاء الاصطناعي', dur: '32:45', size: '290 MB', active: false }
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setViewState('player')}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                    item.active
                      ? 'bg-cyan-950/40 border-cyan-500/50 text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-cyan-400">
                      <Film className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">{item.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{item.dur} • {item.size}</div>
                    </div>
                  </div>
                  {item.active && (
                    <span className="text-[10px] bg-cyan-500 text-slate-950 px-2 py-0.5 rounded-full font-bold">
                      يعمل بالخلفية
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Background Playback Notice Card */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <Sparkles className="w-4 h-4" />
                <span>استمرار التشغيل بالخلفية مفعل بنجاح:</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                المشغل لا يتوقف عند التنقل بين القوائم أو الخروج من التطبيق. يمكنك استخدام الهاتف بحرية بينما يستمر الصوت في الخلفية، ويظهر شريط التحكم المصغر أسفل الشاشة.
              </p>
            </div>
          </div>
        )}

        {/* VIEW 2: FULL VIDEO PLAYER SCREEN (Matches 1.0.61 Screenshot 2) */}
        {viewState === 'player' && (
          <div
            className={`relative w-full ${isLandscape ? 'aspect-[16/9]' : 'aspect-[9/16]'} bg-black overflow-hidden select-none`}
            onClick={() => {
              if (!controlsLocked) {
                setControlsVisible(!controlsVisible);
                resetAutoHide();
              }
            }}
          >
            {/* Visual Video Backdrop Simulation */}
            <div
              className={`absolute inset-0 bg-[#0B0F19] flex items-center justify-center transition-all ${
                isMirrored ? 'scale-x-[-1]' : ''
              } ${nightMode ? 'sepia-[0.35] brightness-90' : ''}`}
            >
              <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                {/* Simulated Movie Frame Artwork */}
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-blue-950/70 to-slate-950 flex flex-col items-center justify-center">
                  <div className="text-center space-y-3 p-6 pointer-events-none">
                    <div className="inline-block px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold">
                      REMO PLAYER 4K HDR • EXOPLAYER + VLC ENGINE
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-black text-white/90 tracking-widest drop-shadow-2xl">
                      MEDYAPIM
                    </h2>
                    <div className="flex items-center justify-center gap-3 text-xs text-slate-300">
                      <span className="px-2 py-0.5 rounded bg-red-600 font-bold text-white text-[10px]">7+ YAŞ VE ÜZERİ</span>
                      <span className="text-slate-400">|</span>
                      <span>صوت محيطي 5.1</span>
                      <span className="text-slate-400">|</span>
                      <span>ترجمة عربية مدمجة</span>
                    </div>
                  </div>
                </div>

                {/* Subtitle Display Overlay */}
                {subtitleEnabled && (
                  <div className="absolute bottom-24 inset-x-8 text-center pointer-events-none z-10">
                    <span className="bg-black/80 backdrop-blur-sm text-yellow-300 font-bold text-xs sm:text-sm px-3 py-1 rounded-lg border border-yellow-500/30 shadow-lg">
                      {currentTime % 6 < 3
                        ? 'مرحباً بك في الإصدار المحدث 1.0.65 مع شريط أدوات التحكم السفلية الكاملة'
                        : 'REMO PLAYER — مشغل الفيديو والموسيقى بأعلى جودة مع استمرار التشغيل بالخلفية'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* TOP HEADER CONTROLS (v1.0.61) */}
            {controlsVisible && !controlsLocked && (
              <div
                className="absolute inset-x-0 top-0 p-3 sm:p-4 flex items-center justify-between z-20 bg-gradient-to-b from-black/80 via-black/30 to-transparent animate-fadeIn"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-2">
                  {/* Exit Video Arrow (Matches Screenshot 2 top-left) */}
                  <button
                    onClick={handleExitVideo}
                    className="w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white flex items-center justify-center cursor-pointer shadow-lg active:scale-95 transition-all"
                    title="الخروج للقائمة مع استمرار التشغيل بالخلفية"
                  >
                    <ArrowRight className="w-5 h-5 text-white" />
                  </button>

                  {/* Subtitle [CC] Toggle Button */}
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
                    title="تبديل الترجمة [CC]"
                  >
                    <Subtitles className="w-4 h-4" />
                    <span className="font-mono text-[11px]">CC</span>
                  </button>
                </div>

                {/* Watermark Logo (Matches Screenshot 2 top-right) */}
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
                  <span className="text-[11px] font-black tracking-wider text-cyan-300">شوف لايف</span>
                  <span className="text-[9px] font-mono text-slate-400">SHOOF.VIP</span>
                </div>
              </div>
            )}

            {/* CENTER PLAYBACK CONTROLS (Matches Screenshot 2 center) */}
            {controlsVisible && !controlsLocked && (
              <div
                className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none animate-fadeIn"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-center gap-3 sm:gap-5 pointer-events-auto">
                  {/* Folder Icon Button */}
                  <button
                    onClick={() => {
                      setViewState('menu');
                      setShowMiniNotification(true);
                    }}
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/55 hover:bg-black/80 border border-white/20 text-white flex items-center justify-center cursor-pointer active:scale-90 transition-all shadow-xl"
                    title="المجلدات ومكتبة الوسائط"
                  >
                    <Folder className="w-5 h-5 text-slate-200" />
                  </button>

                  {/* Skip Previous Video */}
                  <button
                    onClick={() => {
                      setCurrentTime(0);
                      showToast('بدء الفيديو من البداية 00:00');
                      resetAutoHide();
                    }}
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/55 hover:bg-black/80 border border-white/20 text-white flex items-center justify-center cursor-pointer active:scale-90 transition-all shadow-xl"
                    title="الفيديو السابق / البداية"
                  >
                    <SkipBack className="w-5 h-5 text-white" />
                  </button>

                  {/* Giant Central Play/Pause Button (Matches Screenshot 2 Cyan Circle) */}
                  <button
                    onClick={() => {
                      setIsPlaying(!isPlaying);
                      resetAutoHide();
                    }}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#00D2FF] hover:bg-[#33DCFF] text-[#050D18] flex items-center justify-center cursor-pointer active:scale-95 transition-all shadow-2xl shadow-cyan-500/50"
                    title={isPlaying ? 'إيقاف مؤقت (Pause)' : 'تشغيل (Play)'}
                  >
                    {isPlaying ? (
                      <Pause className="w-7 h-7 fill-current stroke-current" />
                    ) : (
                      <Play className="w-7 h-7 fill-current stroke-current mr-0.5" />
                    )}
                  </button>

                  {/* Skip Next Video */}
                  <button
                    onClick={() => {
                      setCurrentTime(0);
                      showToast('تشغيل الفيديو التالي');
                      resetAutoHide();
                    }}
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/55 hover:bg-black/80 border border-white/20 text-white flex items-center justify-center cursor-pointer active:scale-90 transition-all shadow-xl"
                    title="الفيديو التالي"
                  >
                    <SkipForward className="w-5 h-5 text-white" />
                  </button>

                  {/* Fast Seek +10s */}
                  <button
                    onClick={() => {
                      setCurrentTime(Math.min(duration, currentTime + 10));
                      showToast('+10 ثوانٍ للأمام');
                      resetAutoHide();
                    }}
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/55 hover:bg-black/80 border border-white/20 text-white flex items-center justify-center cursor-pointer active:scale-90 transition-all shadow-xl text-xs font-bold font-mono"
                    title="تقديم 10 ثوانٍ"
                  >
                    +10s
                  </button>
                </div>
              </div>
            )}

            {/* SCREEN LOCK BADGE (Appears when user locks controls) */}
            {controlsLocked && (
              <div
                className="absolute top-4 left-4 z-30 animate-fadeIn pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    setControlsLocked(false);
                    setControlsVisible(true);
                    showToast('تم إلغاء قفل عناصر التحكم 🔓');
                  }}
                  className="px-3 py-1.5 rounded-full bg-rose-600/90 text-white border border-rose-400 flex items-center gap-2 text-xs font-bold shadow-2xl cursor-pointer hover:bg-rose-500 active:scale-95 transition-all"
                >
                  <Unlock className="w-4 h-4" />
                  <span>الشاشة مقفلة (اضغط لإلغاء القفل)</span>
                </button>
              </div>
            )}

            {/* =========================================================================
                BOTTOM CONTROLS CONTAINER DOCK (شريط أدوات حاوية التحكم السفلية v1.0.61)
                Exactly matching Screenshot 2:
                Row 1: Time Left, Draggable Timeline Track, Time Right, Aspect Square Box
                Row 2: Horizontal Scrolling Toolbar with All 15+ Tools
               ========================================================================= */}
            {controlsVisible && !controlsLocked && (
              <div
                className="absolute inset-x-2 bottom-2 z-20 pointer-events-auto animate-fadeIn"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-[#050D18]/92 backdrop-blur-md border border-white/15 rounded-2xl p-2.5 px-3.5 shadow-2xl space-y-2">
                  
                  {/* ROW 1: TIMELINE SCRUBBER & TIMES */}
                  <div className="flex items-center gap-3 select-none">
                    {/* Elapsed Current Time (LTR Left) */}
                    <span className="text-[11px] sm:text-xs font-mono font-bold text-white tabular-nums min-w-[36px] text-left">
                      {formatTime(currentTime)}
                    </span>

                    {/* Timeline Scrubber Track */}
                    <div
                      ref={progressRef}
                      onMouseDown={(e) => {
                        setIsDragging(true);
                        handleTimelineMove(e.clientX);
                      }}
                      onMouseMove={handleMouseMove}
                      onMouseUp={() => setIsDragging(false)}
                      onMouseLeave={() => setIsDragging(false)}
                      onTouchStart={(e) => handleTouchMove(e)}
                      onTouchMove={handleTouchMove}
                      className="relative flex-1 h-5 flex items-center cursor-pointer group/seek"
                    >
                      <div className="w-full h-1.5 bg-white/20 rounded-full overflow-visible relative">
                        {/* Played Progress Fill */}
                        <div
                          className="h-full bg-gradient-to-r from-cyan-400 to-[#00D2FF] rounded-full relative"
                          style={{ width: `${Math.min(100, (currentTime / duration) * 100)}%` }}
                        >
                          {/* Cyan Scrubber Thumb (Matches Screenshot 2) */}
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 w-4 h-4 rounded-full bg-[#00D2FF] border-2 border-white shadow-lg ring-2 ring-cyan-500/40" />
                        </div>
                      </div>
                    </div>

                    {/* Total Duration (LTR Right) */}
                    <span className="text-[11px] sm:text-xs font-mono font-bold text-white tabular-nums min-w-[48px] text-right">
                      {formatTime(duration)}
                    </span>

                    {/* Fullscreen / Aspect Ratio Square Box [□] (Matches Screenshot 2 Right) */}
                    <button
                      onClick={() => {
                        const modes: Array<'16:9' | 'fill' | 'fit' | '4:3'> = ['16:9', 'fill', 'fit', '4:3'];
                        const next = modes[(modes.indexOf(aspectMode as any) + 1) % modes.length];
                        setAspectMode(next);
                        showToast(`أبعاد الشاشة: ${next}`);
                        resetAutoHide();
                      }}
                      className="w-6 h-6 rounded border border-white/40 hover:border-cyan-400 flex items-center justify-center text-white/80 hover:text-cyan-300 cursor-pointer transition-all active:scale-95"
                      title="تبديل ملء الشاشة وأبعاد العرض"
                    >
                      <SquareIcon />
                    </button>
                  </div>

                  {/* ROW 2: HORIZONTAL SCROLLABLE TOOLBAR (شريط الأدوات v1.0.61) */}
                  <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none scroll-smooth">
                    
                    {/* 1. مسارات (Subtitles Tracks) */}
                    <button
                      onClick={() => {
                        setActiveModal('subtitles');
                        resetAutoHide();
                      }}
                      className="min-h-[30px] px-2.5 rounded-xl bg-[#08111F]/80 hover:bg-[#0E2038] border border-white/15 text-white flex items-center gap-1.5 text-xs whitespace-nowrap active:scale-95 transition-all cursor-pointer"
                      title="مسارات الترجمة والصوت"
                    >
                      <Subtitles className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="font-bold text-[11px]">مسارات</span>
                    </button>

                    {/* 2. استيراد (Import Subtitles) */}
                    <button
                      onClick={() => {
                        setActiveModal('import');
                        resetAutoHide();
                      }}
                      className="min-h-[30px] px-2.5 rounded-xl bg-[#08111F]/80 hover:bg-[#0E2038] border border-white/15 text-white flex items-center gap-1.5 text-xs whitespace-nowrap active:scale-95 transition-all cursor-pointer"
                      title="استيراد ملف ترجمة خارجي (SRT, VTT, ASS)"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-bold text-[11px]">استيراد</span>
                    </button>

                    {/* 3. تحرير (Edit Video) */}
                    <button
                      onClick={() => {
                        setActiveModal('edit');
                        resetAutoHide();
                      }}
                      className="min-h-[30px] px-2.5 rounded-xl bg-[#08111F]/80 hover:bg-[#0E2038] border border-white/15 text-white flex items-center gap-1.5 text-xs whitespace-nowrap active:scale-95 transition-all cursor-pointer"
                      title="تحرير وقص الفيديو"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-bold text-[11px]">تحرير</span>
                    </button>

                    {/* 4. نافذة (Picture-in-Picture) */}
                    <button
                      onClick={handlePip}
                      className="min-h-[30px] px-2.5 rounded-xl bg-[#08111F]/80 hover:bg-[#0E2038] border border-white/15 text-white flex items-center gap-1.5 text-xs whitespace-nowrap active:scale-95 transition-all cursor-pointer"
                      title="نافذة عائمة (PiP)"
                    >
                      <Tv className="w-3.5 h-3.5 text-purple-400" />
                      <span className="font-bold text-[11px]">نافذة</span>
                    </button>

                    {/* 5. لقطة (Capture Frame) */}
                    <button
                      onClick={handleCaptureFrame}
                      className="min-h-[30px] px-2.5 rounded-xl bg-[#08111F]/80 hover:bg-[#0E2038] border border-white/15 text-white flex items-center gap-1.5 text-xs whitespace-nowrap active:scale-95 transition-all cursor-pointer"
                      title="أخذ لقطة شاشة من الفيديو"
                    >
                      <Camera className="w-3.5 h-3.5 text-rose-400" />
                      <span className="font-bold text-[11px]">لقطة</span>
                    </button>

                    {/* 6. مشاركة (Share Video) */}
                    <button
                      onClick={() => {
                        setActiveModal('share');
                        resetAutoHide();
                      }}
                      className="min-h-[30px] px-2.5 rounded-xl bg-[#08111F]/80 hover:bg-[#0E2038] border border-white/15 text-white flex items-center gap-1.5 text-xs whitespace-nowrap active:scale-95 transition-all cursor-pointer"
                      title="مشاركة الفيديو"
                    >
                      <Share2 className="w-3.5 h-3.5 text-blue-400" />
                      <span className="font-bold text-[11px]">مشاركة</span>
                    </button>

                    {/* 7. أبعاد الشاشة [⛶] */}
                    <button
                      onClick={() => {
                        setActiveModal('aspect');
                        resetAutoHide();
                      }}
                      className="w-8 h-8 rounded-xl bg-[#08111F]/80 hover:bg-[#0E2038] border border-white/15 text-white flex items-center justify-center text-xs active:scale-95 transition-all cursor-pointer"
                      title="أبعاد واحتواء وتمدد الشاشة"
                    >
                      <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                    </button>

                    {/* 8. السرعة [×1] */}
                    <button
                      onClick={cycleSpeed}
                      className="min-w-[32px] h-8 px-2 rounded-xl bg-[#08111F]/80 hover:bg-[#0E2038] border border-white/15 text-cyan-300 flex items-center justify-center text-xs font-bold font-mono active:scale-95 transition-all cursor-pointer"
                      title="تغيير سرعة التشغيل"
                    >
                      ×{speed}
                    </button>

                    {/* 9. تدوير الشاشة [⊘] */}
                    <button
                      onClick={() => {
                        setIsLandscape(!isLandscape);
                        showToast(isLandscape ? 'وضع العرض العمودي (Portrait)' : 'وضع العرض الأفقي (Landscape)');
                        resetAutoHide();
                      }}
                      className="w-8 h-8 rounded-xl bg-[#08111F]/80 hover:bg-[#0E2038] border border-white/15 text-white flex items-center justify-center text-xs active:scale-95 transition-all cursor-pointer"
                      title="تدوير الشاشة"
                    >
                      <RotateCw className="w-3.5 h-3.5 text-slate-300" />
                    </button>

                    {/* 10. قفل الشاشة [🔒] */}
                    <button
                      onClick={() => {
                        setControlsLocked(true);
                        showToast('تم قفل عناصر التحكم لمنع اللمس غير المقصود 🔒');
                      }}
                      className="w-8 h-8 rounded-xl bg-[#08111F]/80 hover:bg-[#0E2038] border border-white/15 text-white flex items-center justify-center text-xs active:scale-95 transition-all cursor-pointer"
                      title="قفل لمس الشاشة"
                    >
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                    </button>

                    {/* 11. الوضع الليلي [🌙] */}
                    <button
                      onClick={() => {
                        setNightMode(!nightMode);
                        showToast(nightMode ? 'تم إلغاء الوضع الليلي' : 'تم تفعيل الوضع الليلي وحماية العين 🌙');
                        resetAutoHide();
                      }}
                      className={`w-8 h-8 rounded-xl border flex items-center justify-center text-xs active:scale-95 transition-all cursor-pointer ${
                        nightMode
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                          : 'bg-[#08111F]/80 hover:bg-[#0E2038] border-white/15 text-slate-300'
                      }`}
                      title="الوضع الليلي وحماية العين"
                    >
                      <Moon className="w-3.5 h-3.5" />
                    </button>

                    {/* 12. الصوت وكتم الصوت [🔊] */}
                    <button
                      onClick={() => {
                        setIsMuted(!isMuted);
                        showToast(isMuted ? 'تم تشغيل الصوت 🔊' : 'تم كتم الصوت 🔇');
                        resetAutoHide();
                      }}
                      className={`w-8 h-8 rounded-xl border flex items-center justify-center text-xs active:scale-95 transition-all cursor-pointer ${
                        isMuted
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : 'bg-[#08111F]/80 hover:bg-[#0E2038] border-white/15 text-slate-300'
                      }`}
                      title="كتم / تشغيل الصوت"
                    >
                      {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
                    </button>

                    {/* 13. مرآة [◫] (Flip) */}
                    <button
                      onClick={() => {
                        setIsMirrored(!isMirrored);
                        showToast(isMirrored ? 'تم إلغاء انعكاس المرآة' : 'تم تفعيل انعكاس المرآة الأفقي ◫');
                        resetAutoHide();
                      }}
                      className={`w-8 h-8 rounded-xl border flex items-center justify-center text-xs active:scale-95 transition-all cursor-pointer ${
                        isMirrored
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                          : 'bg-[#08111F]/80 hover:bg-[#0E2038] border-white/15 text-slate-300'
                      }`}
                      title="مرآة وانعكاس أفقي"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                    </button>

                    {/* 14. تكرار [🔁] */}
                    <button
                      onClick={toggleRepeat}
                      className={`w-8 h-8 rounded-xl border flex items-center justify-center text-xs active:scale-95 transition-all cursor-pointer ${
                        repeatMode !== 'off'
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md'
                          : 'bg-[#08111F]/80 hover:bg-[#0E2038] border-white/15 text-slate-300'
                      }`}
                      title="وضع التكرار (إيقاف / واحد / الكل)"
                    >
                      {repeatMode === 'one' ? <Repeat1 className="w-3.5 h-3.5" /> : <Repeat className="w-3.5 h-3.5" />}
                    </button>

                    {/* 15. حلقة A-B [🔄] */}
                    <button
                      onClick={toggleAbLoop}
                      className={`w-8 h-8 rounded-xl border flex items-center justify-center text-xs active:scale-95 transition-all cursor-pointer ${
                        abLoop.a !== null
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-bold text-[10px]'
                          : 'bg-[#08111F]/80 hover:bg-[#0E2038] border-white/15 text-slate-300'
                      }`}
                      title="تكرار مقطع محدد A-B"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>

                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MINI NOTIFICATION BAR AT THE BOTTOM (When user is browsing menus) */}
        {showMiniNotification && viewState === 'menu' && (
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
                <div className="text-xs font-bold text-white truncate">فيلم الأكشن والدراما - 4K HDR (اضغط للعودة)</div>
                <div className="text-[10px] text-cyan-300 font-mono">{formatTime(currentTime)} / {formatTime(duration)}</div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-8 h-8 rounded-lg bg-slate-800 text-white hover:bg-slate-700 flex items-center justify-center text-xs cursor-pointer"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                onClick={() => {
                  setShowMiniNotification(false);
                  setIsPlaying(false);
                  showToast('تم إيقاف المشغل وإغلاق شريط الإشعار');
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
          INTERACTIVE MODALS FOR TOOLBAR ACTIONS
         ========================================================================= */}
      
      {/* 1. Modal: Subtitle Tracks */}
      {activeModal === 'subtitles' && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B1626] border border-cyan-500/40 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Subtitles className="w-4 h-4 text-cyan-400" />
                <span>مسارات الترجمة والصوت المدمجة</span>
              </h4>
              <button onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {[
                'عربي - مدمج (VLC/Exo)',
                'English - Embedded Subtitles',
                'ترجمة محلية - ملف SRT خارجي',
                'إيقاف الترجمة'
              ].map((track, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCurrentSubtitleTrack(track);
                    setSubtitleEnabled(track !== 'إيقاف الترجمة');
                    setActiveModal('none');
                    showToast(`تم اختيار المسار: ${track}`);
                  }}
                  className={`w-full p-2.5 rounded-xl text-right text-xs font-bold transition-all flex items-center justify-between ${
                    currentSubtitleTrack === track
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-900/60 text-slate-300 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span>{track}</span>
                  {currentSubtitleTrack === track && <Check className="w-4 h-4 text-cyan-400" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal: Import Subtitles */}
      {activeModal === 'import' && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B1626] border border-emerald-500/40 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Download className="w-4 h-4 text-emerald-400" />
                <span>استيراد ملف ترجمة خارجي</span>
              </h4>
              <button onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              اختر ملف ترجمة نصياً بصيغ (SRT, VTT, ASS, SSA, SAMI, SUB) لدمجه فوراً مع الفيديو الحالي.
            </p>
            <div className="space-y-2">
              <label className="block w-full py-3 px-4 rounded-xl border-2 border-dashed border-slate-700 hover:border-emerald-500 text-center text-xs text-slate-400 hover:text-emerald-300 cursor-pointer transition-colors">
                <input
                  type="file"
                  accept=".srt,.vtt,.ass,.ssa,.sub"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setCurrentSubtitleTrack(`ملف محلي: ${file.name}`);
                      setSubtitleEnabled(true);
                      setActiveModal('none');
                      showToast(`تم استيراد ملف الترجمة: ${file.name} بنجاح ✅`);
                    }
                  }}
                />
                <span>اضغط لاختيار ملف ترجمة من الهاتف</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal: Video Cutter / Edit */}
      {activeModal === 'edit' && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B1626] border border-amber-500/40 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                <span>أداة تحرير وقص الفيديو السريع</span>
              </h4>
              <button onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              حدد نقطة البداية ونقطة النهاية لحفظ مقطع فيديو جديد دون إعادة ضغط (Lossless Cut).
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-slate-400 text-[10px]">نقطة البداية:</div>
                <div className="font-mono font-bold text-white mt-1">00:07</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-slate-400 text-[10px]">نقطة النهاية:</div>
                <div className="font-mono font-bold text-white mt-1">02:30</div>
              </div>
            </div>
            <button
              onClick={() => {
                setActiveModal('none');
                showToast('تم تصدير وحفظ المقطع المقصوص في المعرض بنجاح ✂️');
              }}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-lg active:scale-95 transition-all"
            >
              حفظ المقطع المقصوص
            </button>
          </div>
        </div>
      )}

      {/* 4. Modal: Aspect Ratio */}
      {activeModal === 'aspect' && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B1626] border border-cyan-500/40 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-cyan-400" />
                <span>نسب العرض واحتواء وتمدد الشاشة</span>
              </h4>
              <button onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: '16:9', label: 'نسبة 16:9 قياسي' },
                { id: 'fill', label: 'ملء الشاشة بالكامل' },
                { id: 'fit', label: 'احتواء داخل الإطار' },
                { id: 'stretch', label: 'تمدد لكامل الحواف' },
                { id: '4:3', label: 'نسبة 4:3 كلاسيكي' }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setAspectMode(m.id as any);
                    setActiveModal('none');
                    showToast(`تم تطبيق: ${m.label}`);
                  }}
                  className={`p-2.5 rounded-xl text-xs font-bold transition-all text-center ${
                    aspectMode === m.id
                      ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. Modal: Share */}
      {activeModal === 'share' && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B1626] border border-blue-500/40 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Share2 className="w-4 h-4 text-blue-400" />
                <span>مشاركة الفيديو والوسائط</span>
              </h4>
              <button onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              مشاركة ملف الفيديو أو رابط البث المباشر مع التطبيقات الأخرى عبر مشاركة Android الأصلية.
            </p>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              {['واتساب', 'تيليجرام', 'نسخ الرابط'].map((app, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setActiveModal('none');
                    showToast(`تمت المشاركة بنجاح عبر ${app} 🔗`);
                  }}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500 text-white font-bold cursor-pointer"
                >
                  {app}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Release & Build Diagnostics Notice */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/30 space-y-3 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <h4 className="font-bold text-white text-sm">تقرير استعادة شريط الأدوات بالكامل (الإصدار v1.0.65)</h4>
          </div>
          <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/40">
            تطابق 100% مع 1.0.61
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          تم حل مشكلة اختفاء شريط الأدوات في اللقطة السابقة وإعادة بناء حاوية التحكم السفلية بالكامل:
          صف شريط التمرير الزمني مع أوقات البدء والانتهاء وزر ملء الشاشة، وتحته مباشرة شريط الأدوات الأفقي المتكامل بكافة أيقوناته الـ 15 (مسارات، استيراد، تحرير، نافذة، لقطة، مشاركة، أبعاد الشاشة، السرعة، تدوير، قفل، وضع ليلي، صوت، مرآة، تكرار، حلقة A-B).
        </p>
      </div>
    </div>
  );
}

// Inline square icon matching Screenshot 2 [□]
function SquareIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    </svg>
  );
}
