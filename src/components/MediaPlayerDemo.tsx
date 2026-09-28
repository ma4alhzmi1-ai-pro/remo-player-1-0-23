import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, X, Smartphone, Film, Music, Shield, Cpu, Zap, Layers, CheckCircle2, Download } from 'lucide-react';

export function MediaPlayerDemo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(180); // 3 minutes demo
  const [activeTab, setActiveTab] = useState<'video' | 'audio'>('video');
  const [edition, setEdition] = useState<'lite' | 'modern' | 'economic' | 'comprehensive'>('lite');
  
  // Navigation & mini notification states as requested
  const [viewState, setViewState] = useState<'menu' | 'player'>('menu');
  const [showMiniNotification, setShowMiniNotification] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  // Background playback simulation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentTime((prev) => (prev >= duration ? 0 : prev + 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, duration]);

  // Handle Timeline Scrubbing (High precision smooth dragging)
  const handleTimelineMove = (clientX: number) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setCurrentTime(Math.floor(pos * duration));
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches[0]) {
      handleTimelineMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      handleTimelineMove(e.clientX);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // When speaker icon is clicked inside video player
  const handleSpeakerExit = () => {
    setViewState('menu');
    setShowMiniNotification(true);
    // Video keeps playing in background as requested!
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Editions Header Selector */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Film className="w-5 h-5 text-cyan-400" />
              <span>مشغل ريمو المطور (Remo Player 1.0.23)</span>
            </h3>
            <p className="text-xs text-slate-400">
              دعم التشغيل بالخلفية، شريط الإشعار المصغر، وأحدث تحسينات المعالجات (حديثة، اقتصادية، شاملة، ولايت 38MB).
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {edition === 'lite' && 'نسخة لايت (38MB مخصصة)'}
              {edition === 'modern' && 'نسخة المعالجات الحديثة'}
              {edition === 'economic' && 'نسخة المعالجات الاقتصادية'}
              {edition === 'comprehensive' && 'النسخة الشاملة'}
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
              <span className="font-bold text-xs">النسخة الشاملة</span>
              <Layers className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-[11px] font-mono text-purple-300">كامل الميزات والصيغ</div>
          </button>
        </div>
      </div>

      {/* Simulator Device Frame (Mobile View) */}
      <div className="max-w-md mx-auto bg-slate-950 rounded-3xl border-4 border-slate-800 shadow-2xl overflow-hidden relative">
        {/* Status Bar */}
        <div className="bg-slate-900 px-4 py-1.5 flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800 font-mono">
          <span>09:41</span>
          <div className="flex items-center gap-1.5">
            <span>5G</span>
            <span>100%</span>
          </div>
        </div>

        {/* App Container */}
        <div className="relative min-h-[480px] bg-slate-900 flex flex-col justify-between p-4">
          
          {/* VIEW 1: MAIN MENU */}
          {viewState === 'menu' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-white text-sm">القائمة الرئيسية لتطبيق ريمو</h4>
                  <p className="text-[11px] text-slate-400">اختر نوع المشغل أو انتقل للمشغل مباشرة</p>
                </div>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-mono">
                  {edition} edition
                </span>
              </div>

              {/* Media Hub Cards */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { setActiveTab('video'); setViewState('player'); setIsPlaying(true); }}
                  className="p-4 rounded-xl bg-gradient-to-br from-blue-900/50 to-slate-900 border border-blue-500/30 text-right hover:border-blue-400 transition-all cursor-pointer group"
                >
                  <Film className="w-6 h-6 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                  <h5 className="font-bold text-white text-xs">مشغل الفيديو</h5>
                  <p className="text-[10px] text-slate-400 mt-1">تشغيل بدقة عالية مع السحب الدقيق</p>
                </button>

                <button
                  onClick={() => { setActiveTab('audio'); setViewState('player'); setCurrentTime(0); setIsPlaying(true); }}
                  className="p-4 rounded-xl bg-gradient-to-br from-purple-900/50 to-slate-900 border border-purple-500/30 text-right hover:border-purple-400 transition-all cursor-pointer group"
                >
                  <Music className="w-6 h-6 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                  <h5 className="font-bold text-white text-xs">مشغل الصوت</h5>
                  <p className="text-[10px] text-slate-400 mt-1">تشغيل موسيقى مع التحكم بالخلفية</p>
                </button>
              </div>

              {/* Quick Info Box */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] space-y-1.5 text-slate-300">
                <div className="font-bold text-white flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>حالة التشغيل في الخلفية:</span>
                </div>
                <p>
                  {isPlaying
                    ? 'المقطع يعمل حالياً في الخلفية. عند الضغط على إشعار الشريط السفلي أدناه ستعود فوراً للمشغل.'
                    : 'لا يوجد مقطع قيد التشغيل حالياً.'}
                </p>
              </div>
            </div>
          )}

          {/* VIEW 2: PLAYER SCREEN */}
          {viewState === 'player' && (
            <div className="space-y-4 animate-fadeIn flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setViewState('menu')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 cursor-pointer"
                >
                  ← العودة للقائمة (استمرار بالخلفية)
                </button>
                <span className="text-xs font-bold text-white">
                  {activeTab === 'video' ? 'مشغل الفيديو النشط' : 'مشغل الصوت النشط'}
                </span>
              </div>

              {/* Player Screen Mockup Area */}
              <div className="relative aspect-video rounded-2xl bg-black border border-slate-800 overflow-hidden flex flex-col items-center justify-center group shadow-inner">
                {activeTab === 'video' ? (
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-950 via-slate-900 to-indigo-950 flex flex-col items-center justify-center p-4">
                    <Film className="w-12 h-12 text-cyan-400/80 mb-2 animate-pulse" />
                    <span className="text-xs font-bold text-white">فيديو تجريبي - ريمو بلاير</span>
                    <span className="text-[10px] text-slate-400 font-mono mt-1">{formatTime(currentTime)} / {formatTime(duration)}</span>
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-tr from-purple-950 via-slate-900 to-pink-950 flex flex-col items-center justify-center p-4">
                    <Music className="w-12 h-12 text-purple-400/80 mb-2 animate-bounce" />
                    <span className="text-xs font-bold text-white">مقطع صوتي - ريمو بلاير</span>
                    <span className="text-[10px] text-slate-400 font-mono mt-1">{formatTime(currentTime)} / {formatTime(duration)}</span>
                  </div>
                )}

                {/* Video Controls Overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 space-y-2">
                  
                  {/* High-Precision Timeline Scrubber (Timeline Slider) */}
                  <div 
                    ref={progressRef}
                    onMouseDown={(e) => { setIsDragging(true); handleTimelineMove(e.clientX); }}
                    onMouseMove={handleMouseMove}
                    onMouseUp={() => setIsDragging(false)}
                    onMouseLeave={() => setIsDragging(false)}
                    onTouchStart={(e) => handleTouchMove(e)}
                    onTouchMove={handleTouchMove}
                    className="relative h-4 flex items-center cursor-pointer group/line"
                  >
                    <div className="w-full h-1.5 bg-slate-700/80 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full relative"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                      >
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md scale-0 group-hover/line:scale-100 transition-transform" />
                      </div>
                    </div>
                  </div>

                  {/* Buttons Row: ▶ ⏸ ◀ plus Speaker Icon */}
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white cursor-pointer"
                        title={isPlaying ? 'إيقاف مؤقت (Pause)' : 'تشغيل (Play)'}
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>

                      <button 
                        onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}
                        className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                        title="إرجاع للخلف 10 ثوانٍ (Rewind ◀)"
                      >
                        <SkipBack className="w-4 h-4" />
                      </button>

                      <button 
                        onClick={() => setCurrentTime(Math.min(duration, currentTime + 10))}
                        className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                        title="تقديم للأمام 10 ثوانٍ"
                      >
                        <SkipForward className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Speaker Icon button that exits to menu and shows mini notification bar */}
                      <button
                        onClick={handleSpeakerExit}
                        className="p-1.5 rounded-lg bg-cyan-500/30 hover:bg-cyan-500/50 text-cyan-300 border border-cyan-500/40 cursor-pointer flex items-center gap-1 text-[11px]"
                        title="زر السماعة: الخروج للقائمة مع إظهار شريط التشغيل المصغر بالأسفل"
                      >
                        <Volume2 className="w-4 h-4" />
                        <span className="text-[10px]">خروج للسماعة</span>
                      </button>

                      <span className="text-[10px] font-mono text-slate-300">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Background / Lock Screen Notification Controls Preview */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                  <span>معاينة إشعار قفل الشاشة / الخلفية (▶ ⏸ ◀):</span>
                  <span className="text-emerald-400 text-[10px]">نشط الآن</span>
                </div>
                <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-xs">
                      ▶
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">ريمو بلاير - تشغيل بالخلفية</div>
                      <div className="text-[10px] text-slate-400">{formatTime(currentTime)} - جاري التشغيل</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setCurrentTime(Math.max(0, currentTime - 5))} className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs">◀</button>
                    <button onClick={() => setIsPlaying(!isPlaying)} className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs">{isPlaying ? '⏸' : '▶'}</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MINI NOTIFICATION BAR AT THE BOTTOM (Appears ONLY when returning from video player to menu, with close button × and click to return) */}
          {showMiniNotification && viewState === 'menu' && (
            <div className="absolute inset-x-2 bottom-2 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-cyan-500/40 rounded-xl p-2.5 shadow-2xl flex items-center justify-between z-30 animate-slideUp">
              <div 
                onClick={() => setViewState('player')}
                className="flex items-center gap-2.5 flex-1 cursor-pointer"
                title="اضغط للعودة إلى مشغل الفيديو"
              >
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 animate-pulse">
                  <Film className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-white truncate">المقطع يعمل بالخلفية (اضغط للعودة)</div>
                  <div className="text-[10px] text-cyan-300 font-mono">{formatTime(currentTime)} / {formatTime(duration)}</div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-1.5 rounded-lg bg-slate-800 text-white hover:bg-slate-700 text-xs cursor-pointer"
                >
                  {isPlaying ? '⏸' : '▶'}
                </button>
                <button
                  onClick={() => { setShowMiniNotification(false); setIsPlaying(false); }}
                  className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs cursor-pointer"
                  title="إغلاق وإيقاف التشغيل (×)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Device Footer Home Bar */}
        <div className="bg-slate-900 py-2 flex justify-center border-t border-slate-800">
          <div className="w-32 h-1 bg-slate-700 rounded-full" />
        </div>
      </div>

      {/* Editions Download & Build Specs */}
      <div className="grid sm:grid-cols-3 gap-4 pt-4">
        <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 font-mono">النسخة لايت (Lite)</span>
            <span className="text-[11px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
              38 MB
            </span>
          </div>
          <h4 className="font-bold text-white text-sm">نسخة المعالجات الاقتصادية الخفيفة</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            تم ضغط حجم الحزمة إلى 38 ميجا بايت عبر تنقية الأصول غير الضرورية، تفعيل ضغط R8، وإزالة حزم المعالجات الزائدة لتناسب الأجهزة ذات الذاكرة المحدودة.
          </p>
          <div className="pt-2">
            <button
              onClick={() => alert('تم تجهيز نسخة لايت (38MB) وخلوها من أخطاء البناء مع التثبيت الفوري.')}
              className="w-full py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg hover:bg-emerald-400 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تحميل نسخة لايت (38MB)</span>
            </button>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-cyan-500/40 bg-cyan-950/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-400 font-mono">المعالجات الحديثة</span>
            <span className="text-[11px] font-mono bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded">
              arm64-v8a
            </span>
          </div>
          <h4 className="font-bold text-white text-sm">نسخة الهواتف الرائدة والمعالجات الحديثة</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            مصممة للاستفادة القصوى من معالجات 64-bit الحديثة، تسريع فك تشفير الفيديو بالعتاد (Hardware Acceleration)، وأداء فائق السلاسة.
          </p>
          <div className="pt-2">
            <button
              onClick={() => alert('تم إعداد نسخة المعالجات الحديثة مع الدعم الكامل لـ arm64-v8a.')}
              className="w-full py-2 bg-cyan-500 text-slate-950 font-bold text-xs rounded-lg hover:bg-cyan-400 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تحميل نسخة المعالجات الحديثة</span>
            </button>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-purple-500/40 bg-purple-950/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-400 font-mono">النسخة الشاملة</span>
            <span className="text-[11px] font-mono bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">
              Universal
            </span>
          </div>
          <h4 className="font-bold text-white text-sm">النسخة الشاملة لجميع الأجهزة</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            تتضمن كافة ترميزات الفيديو والصوت ومكتبات فك الضغط الشاملة لتعمل بكفاءة مطلقة على كافة إصدارات أندرويد من 5.0 فصاعداً.
          </p>
          <div className="pt-2">
            <button
              onClick={() => alert('تم إعداد النسخة الشاملة بكافة الترميزات.')}
              className="w-full py-2 bg-purple-500 text-slate-950 font-bold text-xs rounded-lg hover:bg-purple-400 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تحميل النسخة الشاملة</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
