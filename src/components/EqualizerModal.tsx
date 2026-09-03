import React, { useState } from "react";
import { Sliders, X, Sparkles, RefreshCw } from "lucide-react";

interface EqualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EqualizerModal: React.FC<EqualizerModalProps> = ({ isOpen, onClose }) => {
  const [presets, setPresets] = useState<string>("عادي (Flat)");
  const [gains, setGains] = useState<{ [key: string]: number }>({
    "60Hz": 0,
    "230Hz": 2,
    "910Hz": 4,
    "4kHz": 1,
    "14kHz": 3,
  });

  if (!isOpen) return null;

  const handleSliderChange = (band: string, val: number) => {
    setGains((prev) => ({ ...prev, [band]: val }));
    setPresets("مخصص (Custom)");
  };

  const applyPreset = (name: string, values: { [key: string]: number }) => {
    setPresets(name);
    setGains(values);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#111F33] border border-[#2EC5FF]/30 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#F4F8FF] flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#2EC5FF]" /> المعادل الرسومي (Equalizer)
          </h3>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presets */}
        <div className="space-y-2">
          <span className="text-xs text-[#91A1B7]">الإعدادات المسبقة:</span>
          <div className="grid grid-cols-3 gap-2">
            {[
              { name: "عادي (Flat)", vals: { "60Hz": 0, "230Hz": 0, "910Hz": 0, "4kHz": 0, "14kHz": 0 } },
              { name: "تعزيز الباس (Bass)", vals: { "60Hz": 8, "230Hz": 5, "910Hz": -1, "4kHz": 2, "14kHz": 4 } },
              { name: "صوتي (Vocal)", vals: { "60Hz": -2, "230Hz": 1, "910Hz": 6, "4kHz": 5, "14kHz": 2 } },
              { name: "بوب (Pop)", vals: { "60Hz": 2, "230Hz": 4, "910Hz": 1, "4kHz": -2, "14kHz": -1 } },
              { name: "كلاسيك (Classic)", vals: { "60Hz": 5, "230Hz": 3, "910Hz": -2, "4kHz": 3, "14kHz": 5 } },
            ].map((p) => (
              <button
                key={p.name}
                onClick={() => applyPreset(p.name, p.vals)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                  presets === p.name
                    ? "bg-[#2EC5FF] text-[#08111F] shadow-lg shadow-[#2EC5FF]/30"
                    : "bg-[#08111F] text-[#91A1B7] hover:text-white border border-[#1f3554]"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Sliders */}
        <div className="bg-[#08111F] p-4 rounded-2xl border border-[#1f3554] space-y-4">
          <div className="flex justify-between text-xs text-[#91A1B7] border-b border-[#1f3554] pb-2">
            <span>الترددات الصوتية</span>
            <span className="text-[#2EC5FF] font-bold">{presets}</span>
          </div>

          <div className="grid grid-cols-5 gap-4 py-2">
            {Object.entries(gains).map(([band, val]) => {
              const numVal = val as number;
              return (
              <div key={band} className="flex flex-col items-center gap-2">
                <span className="text-[10px] text-[#2EC5FF] font-mono">{numVal > 0 ? `+${numVal}` : numVal}dB</span>
                <div className="h-32 flex items-center justify-center relative">
                  <input
                    type="range"
                    min={-12}
                    max={12}
                    step={1}
                    value={numVal}
                    onChange={(e) => handleSliderChange(band, parseFloat(e.target.value))}
                    className="w-32 h-2 bg-[#111F33] rounded appearance-none cursor-pointer accent-[#2EC5FF] -rotate-90 origin-center"
                  />
                </div>
                <span className="text-[11px] text-[#91A1B7] font-semibold mt-2">{band}</span>
              </div>
            );})}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#2EC5FF] to-[#8B5CF6] text-white text-xs font-bold shadow-lg"
          >
            حفظ وتطبيق
          </button>
        </div>
      </div>
    </div>
  );
};
