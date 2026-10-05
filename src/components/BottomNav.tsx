import React from 'react';
import { Map, LineChart, User } from 'lucide-react';
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
    { id: 'lessons', label: 'Уроки', icon: Map },
    { id: 'simulator', label: 'Тренажер', icon: LineChart },
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
              className={`flex flex-col items-center gap-1 py-1.5 px-5 rounded-2xl transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'text-[#00F59B] font-black'
                  : 'text-slate-400 hover:text-slate-200 font-bold'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-[#00F59B]/15 text-[#00F59B] scale-110 shadow-lg shadow-[#00F59B]/20'
                    : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
