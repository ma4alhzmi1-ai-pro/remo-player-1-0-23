import { useState } from "react";
import {
  Film,
  Music,
  Download,
  Sparkles,
  GitBranch,
  Tag,
  Shield,
  Smartphone,
  Bell,
  CheckCircle2,
  Tv,
  Folder
} from "lucide-react";
import { MediaPlayerDemo } from "./components/MediaPlayerDemo";
import { ReleaseDownloads } from "./components/ReleaseDownloads";
import { UpdateNotificationModal } from "./components/UpdateNotificationModal";

export default function App() {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'player' | 'downloads' | 'features'>('player');
  const [isCheckingOnline, setIsCheckingOnline] = useState(false);

  const checkOnlineUpdate = async () => {
    setIsCheckingOnline(true);
    try {
      await fetch('/version.json');
    } catch {
      // offline fallback
    }
    setTimeout(() => {
      setIsCheckingOnline(false);
      setShowUpdateModal(true);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-cyan-500 selection:text-black" dir="rtl">
      {/* 🚀 إشعار شريط التحديث المثبت بأعلى التطبيق */}
      <div className="bg-gradient-to-r from-cyan-900 via-blue-900 to-slate-900 text-white px-4 py-2 shadow-xl border-b border-cyan-500/30 flex items-center justify-between flex-wrap gap-2 sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400"></span>
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-black text-xs bg-cyan-500 text-slate-950 px-2.5 py-0.5 rounded-full font-mono">
              REMO PLAYER v1.0.67
            </span>
            <span className="font-bold text-xs sm:text-sm text-cyan-100">
              النسخة المدمجة المتكاملة (دمج 1.0.61 و 1.0.64 مع محرك توضيح الحوارات AI والمعاينة الحية والمجلد الآمن)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <a
            href="https://github.com/ma4alhzmi1-ai-pro/remo-player-1-0-23/releases/download/v1.0.67/RemoPlayer-1.0.67-Full.zip"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1 bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-lg text-xs font-black shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تحميل v1.0.67 (Full ZIP)</span>
          </a>
          <button
            onClick={checkOnlineUpdate}
            disabled={isCheckingOnline}
            className="px-2.5 py-1 bg-black/40 hover:bg-black/60 rounded-lg text-xs text-cyan-200 border border-cyan-500/30 transition-colors cursor-pointer flex items-center gap-1"
          >
            <Bell className="w-3.5 h-3.5 text-cyan-300" />
            <span>{isCheckingOnline ? 'جاري الفحص...' : 'سجل التحديثات'}</span>
          </button>
        </div>
      </div>

      {/* مودال إشعار التحديث */}
      <UpdateNotificationModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
      />

      {/* ترويسة التطبيق الرئيسية (Main Header) */}
      <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md sticky top-10 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base sm:text-lg text-white tracking-tight">
                  ريمو بلاير | Remo Player Pro
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  v1.0.67 Merged
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                مشغل الفيديو والموسيقى المدمج — دمج كامل ومتقدم لكافة ميزات 1.0.61 و 1.0.64
              </p>
            </div>
          </div>

          {/* تبويبات المشغل */}
          <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('player')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'player'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>المشغل</span>
            </button>
            <button
              onClick={() => setActiveTab('downloads')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'downloads'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>التحميل والحزم</span>
            </button>
            <button
              onClick={() => setActiveTab('features')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'features'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>الميزات المدمجة</span>
            </button>
          </div>
        </div>
      </header>

      {/* المحتوى الرئيسي */}
      <main className="max-w-6xl mx-auto px-3 sm:px-6 py-4">
        {activeTab === 'player' && (
          <MediaPlayerDemo />
        )}

        {activeTab === 'downloads' && (
          <ReleaseDownloads />
        )}

        {activeTab === 'features' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-cyan-500/30 space-y-4">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                <span>تفاصيل الدمج الكامل بين نسختي 1.0.61 و 1.0.64 في الإصدار v1.0.67</span>
              </h2>
              <div className="grid md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-black/40 border border-slate-800 space-y-2">
                  <h3 className="font-bold text-cyan-300">ما تم دمجه من نسخة 1.0.61:</h3>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    <li>شريط الأدوات الكامل (15 أداة تحكم) واستيراد الترجمة وقص الفيديو و PiP واللقطة والمشاركة.</li>
                    <li>أبعاد الشاشة المتعددة والتدوير وقفل الشاشة ونقاط التكرار A-B Loop.</li>
                    <li>التحكم في سرعة التشغيل وعكس الفيديو أفقياً والوضع الليلي وكتم الصوت.</li>
                  </ul>
                </div>
                <div className="p-4 rounded-xl bg-black/40 border border-slate-800 space-y-2">
                  <h3 className="font-bold text-cyan-300">ما تم دمجه وتطويره من نسخة 1.0.64:</h3>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    <li>شريط أدوات الفيديو يظهر بالأعلى فوق شريط التمرير الزمني.</li>
                    <li>إيماءات السحب باليمين للصوت وباليسار للسطوع مع مؤشر HUD ومحاكاة أزرار الهاتف.</li>
                    <li>محول الصوتيات المدمج لاستخراج MP3/AAC/FLAC من أي فيديو.</li>
                    <li>المجلد الآمن الفعلي بنظام .nomedia وتشفير الامتداد لمنع ظهوره في استوديو الهاتف.</li>
                    <li>مشغل قفل الشاشة والإشعارات بالخلفية عبر Foreground Service.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
