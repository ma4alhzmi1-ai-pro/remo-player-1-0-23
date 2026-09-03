import React, { useState } from "react";
import { Shield, Lock, Unlock, X, Eye, EyeOff, KeyRound } from "lucide-react";
import { MediaItem } from "../types";

interface SecureFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  secureVideos: MediaItem[];
  onUnlockSecure: () => void;
}

export const SecureFolderModal: React.FC<SecureFolderModalProps> = ({
  isOpen,
  onClose,
  secureVideos,
  onUnlockSecure,
}) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === "1234" || pin === "0000") {
      setIsUnlocked(true);
      setError(false);
      onUnlockSecure();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#111F33] border border-[#2EC5FF]/30 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#F4F8FF] flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#2EC5FF]" /> المجلد الخاص الآمن (Secure Vault)
          </h3>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isUnlocked ? (
          <form onSubmit={handleVerifyPin} className="space-y-4 py-4 text-center">
            <div className="w-16 h-16 rounded-full bg-[#2EC5FF]/10 text-[#2EC5FF] flex items-center justify-center mx-auto mb-2 border border-[#2EC5FF]/20">
              <Lock className="w-8 h-8" />
            </div>
            <h4 className="text-sm font-bold text-[#F4F8FF]">أدخل رمز المرور السري</h4>
            <p className="text-xs text-[#91A1B7]">مجلد محمي بتشفير عالي لحماية خصوصية مقاطع الفيديو الخاصة بك (جرب 1234)</p>

            <div className="flex justify-center gap-2 my-4">
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                className="w-36 text-center text-xl tracking-widest bg-[#08111F] text-white border border-[#1f3554] rounded-2xl py-3 focus:outline-none focus:border-[#2EC5FF]"
                autoFocus
              />
            </div>

            {error && <p className="text-xs text-red-400 font-semibold">رمز المرور غير صحيح. (جرب 1234)</p>}

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-[#2EC5FF] text-[#08111F] font-bold text-sm shadow-lg shadow-[#2EC5FF]/20"
            >
              فتح المجلد الآمن
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/30 p-3 rounded-2xl flex items-center gap-3">
              <Unlock className="w-5 h-5 text-green-400" />
              <span className="text-xs font-bold text-green-400">المجلد مفتوح وآمن</span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {secureVideos.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#91A1B7]">لا توجد مقاطع فيديو في المجلد الآمن حالياً.</div>
              ) : (
                secureVideos.map((v) => (
                  <div key={v.id} className="bg-[#08111F] p-3 rounded-2xl border border-[#1f3554] flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-white">{v.title}</h4>
                      <p className="text-[10px] text-[#91A1B7]">{v.duration ? `${Math.floor(v.duration / 60)} دقيقة` : "فيديو محلي"}</p>
                    </div>
                    <span className="text-[10px] bg-[#2EC5FF]/20 text-[#2EC5FF] px-2 py-1 rounded-lg">مشفر</span>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setIsUnlocked(false)}
              className="w-full py-2.5 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/20"
            >
              إقفال المجلد
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
