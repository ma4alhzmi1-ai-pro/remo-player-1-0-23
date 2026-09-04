import React from "react";
import { Home, Music, Video, ListMusic, Search, Settings } from "lucide-react";
import { ActiveTab } from "../types";

interface BottomNavProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  const tabs = [
    { id: "home" as ActiveTab, label: "الرئيسية", icon: Home },
    { id: "music" as ActiveTab, label: "الموسيقى", icon: Music },
    { id: "video" as ActiveTab, label: "الفيديو", icon: Video },
    { id: "playlists" as ActiveTab, label: "القوائم", icon: ListMusic },
    { id: "search" as ActiveTab, label: "بحث", icon: Search },
    { id: "settings" as ActiveTab, label: "الإعدادات", icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#08111F]/95 backdrop-blur-lg border-t border-[#111F33] py-2 px-3">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? "text-[#2EC5FF] bg-[#2EC5FF]/10 font-semibold"
                  : "text-[#91A1B7] hover:text-[#F4F8FF]"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "scale-110" : ""} transition-transform`} />
              <span className="text-[11px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
