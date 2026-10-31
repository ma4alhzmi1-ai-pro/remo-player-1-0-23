import { Download, FileArchive, Tag, ExternalLink, CheckCircle2, GitBranch, Sparkles, Film, Music, ShieldCheck } from 'lucide-react';

export function ReleaseDownloads() {
  return (
    <section className="space-y-6">
      {/* Release Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-cyan-950/40 via-slate-900 to-slate-950 p-6 sm:p-8">
        <div className="absolute top-0 left-0 -ml-16 -mt-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              الإصدار المدمج والنهائي جاهز للتحميل
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-xs font-mono font-medium">
              <GitBranch className="w-3.5 h-3.5" />
              branch: main
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-300 text-xs font-mono font-medium">
              <Tag className="w-3.5 h-3.5" />
              tag: v1.0.67
            </span>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Film className="w-8 h-8 text-cyan-400" />
              <span>ريموبلاير مشغل الفيديو والموسيقى <span className="text-cyan-400 font-mono">1.0.67</span></span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
              تطبيق مشغل وسائط أندرويد متكامل يجمع بين كافة ميزات الإصدار 1.0.61 والإصدار 1.0.64، مع شريط أدوات الفيديو فوق شريط التمرير الزمني، الموازن الصوتي الاحترافي، محول الصوتيات المدمج، ومحرك توضيح الحوارات بالذكاء الاصطناعي والمجلد الآمن.
            </p>
          </div>

          {/* Remo Player v1.0.67 Highlight */}
          <div className="p-4 rounded-xl border-2 border-cyan-500/50 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-950 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-cyan-300">حزمة مشغل ريموبلاير الكاملة (Remo Player v1.0.67 Full Package)</span>
                <span className="text-[10px] bg-cyan-500 text-slate-950 font-black px-2 py-0.5 rounded-full">v1.0.67 Merged Final</span>
              </div>
              <a
                href="https://github.com/ma4alhzmi1-ai-pro/remo-player-1-0-23/releases"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold"
              >
                <span>مستودع الإصدارات الرسمي</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              الإصدار المدمج المتكامل: شريط أدوات الفيديو فوق شريط التمرير الزمني، الانتقال التلقائي للفيديو التالي دون توقف، مشغل قفل الشاشة والإشعارات بأزرار التحكم الكاملة وخدمة Foreground Service، إيماءات الصوت والإضاءة مع أزرار الهاتف، والمجلد الآمن بنظام .nomedia وتشفير الامتداد.
            </p>
            <div className="flex items-center gap-3 pt-1 flex-wrap">
              <a
                href="https://github.com/ma4alhzmi1-ai-pro/remo-player-1-0-23/releases/download/v1.0.67/RemoPlayer-1.0.67-Full.zip"
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-lg active:scale-95 transition-all"
              >
                <Download className="w-4 h-4 text-slate-950" />
                <span>تحميل حزمة RemoPlayer-1.0.67-Full.zip (رابط مباشر)</span>
              </a>
              <span className="text-[11px] text-slate-400 font-mono">144 MB Uncompressed • APK + Full Assets</span>
            </div>
          </div>

          {/* Release Highlights */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 space-y-2 text-xs">
            <div className="font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>ملاحظات الإصدار المدمج v1.0.67:</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              «دمج كامل لجميع وظائف الإصدارين 1.0.61 و 1.0.64 دون أي نقص أو تعارض، مع إزالة كافة بقايا التطبيقات الأخرى، وتفعيل محرك توضيح الحوارات AI Vocal Clarity، المعاينة المصغرة الحية لشريط الوقت، والعلامات المرجعية الذكية.»
            </p>
          </div>

          {/* Download Action Cards */}
          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            {/* Direct Full ZIP */}
            <div className="p-4 rounded-xl border-2 border-cyan-500/70 bg-cyan-950/30 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-cyan-300">النسخة المدمجة الكاملة v1.0.67</span>
                <h3 className="text-lg font-bold text-white mt-1">RemoPlayer-1.0.67-Full.zip</h3>
                <p className="text-xs text-slate-400 mt-1">الحزمة الكاملة المتضمنة ملف APK والتطبيق وتطويرات المشغل المدمج.</p>
              </div>
              <a
                href="https://github.com/ma4alhzmi1-ai-pro/remo-player-1-0-23/releases/download/v1.0.67/RemoPlayer-1.0.67-Full.zip"
                target="_blank"
                rel="noreferrer"
                className="mt-4 w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                تحميل الحزمة الكاملة
              </a>
            </div>

            {/* GitHub Releases Browser */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400">سجل المستودع</span>
                <h3 className="text-lg font-bold text-white mt-1">GitHub Releases</h3>
                <p className="text-xs text-slate-400 mt-1">تصفح كافة الإصدارات السابقة والأصول والملاحظات على GitHub.</p>
              </div>
              <a
                href="https://github.com/ma4alhzmi1-ai-pro/remo-player-1-0-23/releases/tag/v1.0.67"
                target="_blank"
                rel="noreferrer"
                className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                فتح صفحة الإصدار
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
