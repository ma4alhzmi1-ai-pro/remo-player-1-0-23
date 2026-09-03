import React, { useState } from "react";
import { Cast, X, Tv, Wifi, CheckCircle2 } from "lucide-react";
import { MediaItem } from "../types";

interface CastModalProps {
  isOpen: boolean;
  onClose: () => void;
  media: MediaItem | null;
}

export const CastModal: React.FC<CastModalProps> = ({ isOpen, onClose, media }) => {
  const [scanning, setScanning] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<string | null>(null);

  if (!isOpen || !media) return null;

  const devices = [
    { id: "tv-1", name: "Samsung QLED 4K (غرفة المعيشة)", type: "Chromecast / DLNA" },
    { id: "tv-2", name: "LG WebOS TV", type: "AirPlay / Cast" },
    { id: "tv-3", name: "Google TV Chromecast", type: "Google Cast" },
  ];

  const handleConnect = (deviceName: string) => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setConnectedDevice(deviceName);
    }, 1500);
  };

  const handleDisconnect = () => {
    setConnectedDevice(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#111F33] border border-[#2EC5FF]/30 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#F4F8FF] flex items-center gap-2">
            <Cast className="w-5 h-5 text-[#2EC5FF]" /> بث الوسائط إلى التلفزيون (Chromecast)
          </h3>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-[#08111F] p-4 rounded-2xl border border-[#1f3554] space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#2EC5FF]/20 flex items-center justify-center text-[#2EC5FF]">
              <Tv className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#F4F8FF]">{media.title}</h4>
              <p className="text-xs text-[#91A1B7]">{media.artist || "مقطع محلي"}</p>
            </div>
          </div>
        </div>

        {connectedDevice ? (
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-400" />
              <div>
                <h4 className="text-xs font-bold text-green-400">متصل بـ {connectedDevice}</h4>
                <p className="text-[11px] text-[#91A1B7]">يتم الآن بث الوسائط بجودة عالية 4K</p>
              </div>
            </div>
            <button
              onClick={handleDisconnect}
              className="px-3 py-1.5 rounded-xl bg-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/30"
            >
              قطع الاتصال
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#91A1B7]">الأجهزة المتاحة على الشبكة المحلية:</span>
              <Wifi className="w-4 h-4 text-[#2EC5FF] animate-pulse" />
            </div>

            <div className="space-y-2">
              {devices.map((dev) => (
                <div
                  key={dev.id}
                  onClick={() => handleConnect(dev.name)}
                  className="bg-[#08111F] p-3.5 rounded-2xl border border-[#1f3554] hover:border-[#2EC5FF] cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <Tv className="w-5 h-5 text-[#91A1B7] group-hover:text-[#2EC5FF] transition-colors" />
                    <div>
                      <h4 className="text-xs font-semibold text-[#F4F8FF]">{dev.name}</h4>
                      <p className="text-[10px] text-[#91A1B7]">{dev.type}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#2EC5FF] opacity-0 group-hover:opacity-100 transition-opacity">
                    اتصال
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {scanning && (
          <div className="text-center text-xs text-[#2EC5FF] animate-pulse py-2">
            جاري البحث عن أجهزة Chromecast قريبة...
          </div>
        )}
      </div>
    </div>
  );
};
