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
    { id: 'lessons', label: 'Академия', icon: BookOpen },
    { id: 'simulator', label: 'Терминал', icon: LineChart },
    { id: 'profile', label: 'Профиль', icon: User },
  ] as const;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#06080E]/95 backdrop-blur-2xl border-t border-[#1E293B] px-4 py-2 pb-safe select-none">
      <div className="max-w-md mx-auto flex items-center justify-around">
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
              className={`flex flex-col items-center gap-1 py-1.5 px-6 rounded-2xl transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'text-[#00C076] font-bold'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all duration-150 ${
                  isActive
                    ? 'bg-[#00C076]/10 text-[#00C076] scale-105'
                    : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono tracking-wider uppercase">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
