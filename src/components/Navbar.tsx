import React from "react";
import { Disc3, Plus, Search, Sparkles } from "lucide-react";

interface NavbarProps {
  onOpenUpload: () => void;
  onSearchClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenUpload, onSearchClick }) => {
  return (
    <header className="sticky top-0 z-30 bg-[#08111F]/90 backdrop-blur-md border-b border-[#111F33] px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#2EC5FF] to-[#8B5CF6] flex items-center justify-center shadow-lg shadow-[#2EC5FF]/20 animate-pulse">
          <Disc3 className="w-6 h-6 text-white animate-spin" style={{ animationDuration: "12s" }} />
        </div>
        <div>
          <h1 className="text-lg font-bold text-[#F4F8FF] tracking-tight flex items-center gap-2">
            Remo Player
            <span className="text-[10px] bg-[#8B5CF6]/20 text-[#8B5CF6] px-2 py-0.5 rounded-full font-semibold border border-[#8B5CF6]/30">
              v1.0.23
            </span>
          </h1>
          <p className="text-xs text-[#91A1B7]">مشغل الوسائط المحلي المتطور</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onSearchClick}
          className="p-2 rounded-xl bg-[#111F33] hover:bg-[#1a2d4a] text-[#91A1B7] hover:text-[#2EC5FF] transition-colors border border-[#1f3554]"
          title="بحث سحري"
        >
          <Search className="w-5 h-5" />
        </button>

        <button
          onClick={onOpenUpload}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#2EC5FF] to-[#1a95cc] text-white text-xs font-bold shadow-lg shadow-[#2EC5FF]/20 hover:opacity-95 transition-all transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة ملف</span>
        </button>
      </div>
    </header>
  );
};
