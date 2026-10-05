import React from 'react';
import { BookOpen, LineChart, User } from 'lucide-react';
import { haptic } from '../services/telegram';

interface BottomNavProps {
  activeTab: 'lessons' | 'simulator' | 'profile';
  onChangeTab: (tab: 'lessons' | 'simulator' | 'profile') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
}) => {
  const tabs = [
    { id: 'lessons', label: 'ACADEMY', icon: BookOpen },
    { id: 'simulator', label: 'TERMINAL', icon: LineChart },
    { id: 'profile', label: 'PROFILE', icon: User },
  ] as const;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-black border-t-2 border-white px-3 py-1.5 pb-safe select-none">
      <div className="max-w-md mx-auto flex items-center justify-around font-mono">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                haptic.selection();
                onChangeTab(tab.id);
              }}
              className={`flex-1 py-2 flex flex-col items-center gap-1 transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-black font-black'
                  : 'text-neutral-400 hover:text-white font-bold bg-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] tracking-wider uppercase">[ {tab.label} ]</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
