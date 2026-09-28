import { useState } from 'react';
import { ARABIC_DECORATIONS, CALLIGRAPHY_FONTS } from '../data/keyboardData';
import { Sparkles, Copy, Check, Search, Type } from 'lucide-react';

interface DecorationStudioProps {
  initialText?: string;
}

export function DecorationStudio({ initialText = 'ريمو كيبورد الذهبي' }: DecorationStudioProps) {
  const [inputText, setInputText] = useState(initialText);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'decorations' | 'calligraphy'>('decorations');
  const [searchTerm, setSearchTerm] = useState('');

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredDecorations = ARABIC_DECORATIONS.filter(
    (s) => s.name.includes(searchTerm) || s.previewSample.includes(searchTerm)
  );

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 space-y-6 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            استوديو الخطوط والزخارف العربية الشامل (40 نمط)
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            محرك الخطوط الرقعة والكوفي والثلث والسلطاني والنقاء وأكثر من 40 نمط زخرفة من ريمو كيبورد
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['ريمو كيبورد', 'سبحان الله', 'رمضان كريم', 'البرنسيسة'].map((sample) => (
            <button
              key={sample}
              onClick={() => setInputText(sample)}
              className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-xs transition-all"
            >
              {sample}
            </button>
          ))}
        </div>
      </div>

      {/* Input & Search */}
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
            اكتب النص المراد تحويله:
          </label>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="أدخل اسماً أو عبارة هنا..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-base text-white focus:outline-none focus:border-amber-500 font-sans"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
            بحث في الأنماط:
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث بالاسم أو الشكل..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 pr-9"
            />
            <Search className="w-4 h-4 text-zinc-500 absolute right-3 top-3.5" />
          </div>
        </div>
      </div>

      {/* Tabs Switcher: Calligraphy Fonts vs 40 Decorations */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
        <button
          onClick={() => setActiveTab('decorations')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'decorations'
              ? 'bg-amber-500 text-black shadow-md'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>قائمة الزخارف العربية ({ARABIC_DECORATIONS.length} نمط)</span>
        </button>

        <button
          onClick={() => setActiveTab('calligraphy')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'calligraphy'
              ? 'bg-amber-500 text-black shadow-md'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <Type className="w-4 h-4" />
          <span>كيبورد الخطوط (كوفي، رقعة، ثلث، سلطاني، نقاء، إنجليزي)</span>
        </button>
      </div>

      {/* Content for Decorations Tab */}
      {activeTab === 'decorations' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredDecorations.map((style) => {
            const decorated = style.transform(inputText || 'ريمو كيبورد');
            const isCopied = copiedId === style.id;

            return (
              <div
                key={style.id}
                className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:border-amber-500/50 transition-all flex flex-col justify-between gap-3 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400">{style.name}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">#{style.id}</span>
                  </div>
                  <div className="text-base text-white font-semibold break-words select-all leading-relaxed">
                    {decorated}
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500 font-mono">نمط ريمو #{style.id}</span>
                  <button
                    onClick={() => handleCopy(decorated, style.id)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      isCopied
                        ? 'bg-emerald-500 text-black font-bold'
                        : 'bg-zinc-800 text-zinc-200 border border-zinc-700 hover:bg-zinc-700'
                    }`}
                  >
                    {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{isCopied ? 'تم النسخ' : 'نسخ'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Content for Calligraphy Fonts Tab */}
      {activeTab === 'calligraphy' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CALLIGRAPHY_FONTS.map((font) => {
            const transformed = font.transformText(inputText || 'ريمو كيبورد Remo');
            const isCopied = copiedId === font.id;

            return (
              <div
                key={font.id}
                className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:border-amber-500/50 transition-all flex flex-col justify-between gap-3 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400">{font.nameAr}</span>
                    <span className="text-[10px] text-zinc-400 px-1.5 py-0.5 rounded bg-zinc-800 font-mono">
                      {font.nameEn}
                    </span>
                  </div>
                  <div className="text-lg text-white font-medium break-words select-all leading-relaxed">
                    {transformed}
                  </div>
                  <p className="text-[11px] text-zinc-400">{font.description}</p>
                </div>

                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-amber-500/80 font-mono">يدعمه الكيبورد</span>
                  <button
                    onClick={() => handleCopy(transformed, font.id)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      isCopied
                        ? 'bg-emerald-500 text-black font-bold'
                        : 'bg-zinc-800 text-zinc-200 border border-zinc-700 hover:bg-zinc-700'
                    }`}
                  >
                    {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{isCopied ? 'تم النسخ' : 'نسخ'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
