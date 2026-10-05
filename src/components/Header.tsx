import React from 'react';
import { Heart, Flame, Zap, Shield, Activity } from 'lucide-react';
import type { UserProgress } from '../types';
import { haptic } from '../services/telegram';

interface HeaderProps {
  progress: UserProgress;
  onOpenProfile: () => void;
  onOpenSimulator: () => void;
  activeTab: 'lessons' | 'simulator' | 'profile';
}

export const Header: React.FC<HeaderProps> = ({
  progress,
  onOpenProfile,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#06080E]/95 backdrop-blur-xl border-b border-[#1E293B] px-4 py-2.5 select-none transition-all">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Brand & Terminal Badge */}
        <button
          onClick={() => {
            haptic.selection();
            onOpenProfile();
          }}
          className="flex items-center gap-2.5 text-left group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-[#0F1420] border border-[#1E293B] flex items-center justify-center text-[#00C076] font-mono font-black text-sm shadow-sm group-hover:border-[#00C076] transition-colors">
            OKX
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-white block leading-tight">
              CryptoLingo Pro
            </span>
            <span className="text-[10px] text-slate-400 font-mono tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00C076]" />
              TERMINAL ACADEMY
            </span>
          </div>
        </button>

        {/* Stats Badges without Emojis */}
        <div className="flex items-center gap-2">
          {/* Lives */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#0F1420] border border-[#1E293B] text-[#F6465D] text-xs font-bold font-mono">
            <Heart className="w-3.5 h-3.5 fill-[#F6465D] text-[#F6465D]" />
            <span>{progress.lives}</span>
          </div>

          {/* Streak */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#0F1420] border border-[#1E293B] text-[#F0B90B] text-xs font-bold font-mono">
            <Flame className="w-3.5 h-3.5 text-[#F0B90B]" />
            <span>{progress.streakDays}d</span>
          </div>

          {/* XP */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#00C076]/10 border border-[#00C076]/30 text-[#00C076] text-xs font-bold font-mono">
            <Zap className="w-3.5 h-3.5 fill-[#00C076] text-[#00C076]" />
            <span>{progress.xp} XP</span>
          </div>
        </div>
      </div>
    </header>
  );
};
