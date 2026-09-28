import { useState } from 'react';
import { SOURCE_FILES } from '../data/keyboardData';
import { FileCode, Terminal, Layers, Cpu, Copy, Check, ExternalLink } from 'lucide-react';

export function CodeExplorer() {
  const [selectedFile, setSelectedFile] = useState(SOURCE_FILES[0]);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const copyCommand = (cmd: string, id: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            هيكلية وملفات مشروع ريمو كيبورد (جاهزة للتعديل)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            تم جلب ووضع كافة ملفات المشروع في مساحة العمل داخل المجلد <code className="text-cyan-300 font-mono">repo_temp/</code>
          </p>
        </div>

        <span className="text-xs font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 px-2.5 py-1 rounded-full">
          Branch: remo-keyboard-v1.0.13
        </span>
      </div>

      {/* Grid of Files */}
      <div className="grid md:grid-cols-3 gap-3">
        {SOURCE_FILES.map((file) => {
          const isSelected = selectedFile.path === file.path;

          return (
            <button
              key={file.path}
              onClick={() => setSelectedFile(file)}
              className={`p-3.5 rounded-xl border text-right transition-all flex flex-col justify-between gap-2.5 ${
                isSelected
                  ? 'border-cyan-400 bg-cyan-950/30 ring-1 ring-cyan-400'
                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {file.category}
                  </span>
                  <FileCode className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                </div>
                <div className="text-xs font-bold text-white truncate font-mono">
                  {file.title}
                </div>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {file.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Selected File Details & Quick Action */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div className="space-y-0.5">
            <span className="text-[11px] text-slate-400">الملف المحدد حالياً:</span>
            <div className="font-mono text-xs font-bold text-cyan-300 break-all">
              repo_temp/{selectedFile.path}
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-mono">
            {selectedFile.category}
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {selectedFile.description}
        </p>

        <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          <span>يمكنك طلب أي تعديل أو ميزة جديدة في هذا الملف وسأقوم بكتابة الشفرة واختبارها فوراً.</span>
        </div>
      </div>

      {/* Build & Compilation Commands */}
      <div className="rounded-xl border border-slate-800 bg-black/40 p-4 space-y-3">
        <h4 className="text-xs font-bold text-white flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          أوامر البناء وإنشاء حزمة APK
        </h4>

        <div className="grid sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-lg border border-slate-800 bg-slate-950 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">بناء تطبيق الـ IME الأصلي عبر Gradle:</span>
              <button
                onClick={() => copyCommand('cd repo_temp/android-ime && ./gradlew assembleDebug', 'gradle')}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                {copiedCmd === 'gradle' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCmd === 'gradle' ? 'تم النسخ' : 'نسخ'}</span>
              </button>
            </div>
            <code className="block font-mono text-[11px] text-cyan-300 bg-slate-900 px-2.5 py-1.5 rounded border border-slate-800 overflow-x-auto">
              cd repo_temp/android-ime && ./gradlew assembleDebug
            </code>
          </div>

          <div className="p-3 rounded-lg border border-slate-800 bg-slate-950 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">سير عمل البناء التلقائي عبر GitHub Actions:</span>
              <a
                href="https://github.com/ma4alhzmi1-ai-pro/remo-player-1-0-23/actions"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                <span>فتح Actions</span>
              </a>
            </div>
            <code className="block font-mono text-[11px] text-emerald-300 bg-slate-900 px-2.5 py-1.5 rounded border border-slate-800 overflow-x-auto">
              .github/workflows/build-remo-keyboard-apk.yml
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
