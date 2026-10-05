import React from 'react';
import { BookOpen, LineChart, Bookmark, User } from 'lucide-react';
import { haptic } from '../services/telegram';

export type TabType = 'lessons' | 'simulator' | 'glossary' | 'profile';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
}) => {
  const tabs = [
    { id: 'lessons', label: 'ACADEMY', icon: BookOpen },
    { id: 'simulator', label: 'TERMINAL', icon: LineChart },
    { id: 'glossary', label: 'GLOSSARY', icon: Bookmark },
    { id: 'profile', label: 'PROFILE', icon: User },
  ] as const;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-black border-t border-white/25 px-2 py-1.5 pb-safe select-none">
      <div className="max-w-md mx-auto flex items-center justify-around font-mono">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                haptic.selection();
                onChangeTab(tab.id as TabType);
              }}
              className={`flex-1 py-1.5 flex flex-col items-center gap-1 transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-black font-black'
                  : 'text-neutral-400 hover:text-white font-bold bg-transparent'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="text-[9px] tracking-wider uppercase">[ {tab.label} ]</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
