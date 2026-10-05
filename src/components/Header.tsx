import React from 'react';
import { Heart, Flame, Zap, Coins, Sparkles, User as UserIcon } from 'lucide-react';
import { UserProgress } from '../types';

interface HeaderProps {
  progress: UserProgress;
  onOpenProfile: () => void;
  onOpenSimulator: () => void;
  activeTab: 'lessons' | 'simulator' | 'profile';
}

export const Header: React.FC<HeaderProps> = ({
  progress,
  onOpenProfile,
  onOpenSimulator,
  activeTab,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 select-none">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Logo / Brand */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
            <Sparkles className="w-5 h-5 text-slate-950 fill-slate-950" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              CryptoLingo
            </span>
          </div>
        </div>

        {/* Stats: Lives, Streak, XP */}
        <div className="flex items-center gap-2.5">
          {/* Lives */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-rose-400 text-xs font-bold shadow-inner">
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 animate-pulse" />
            <span>{progress.lives}</span>
          </div>

          {/* Streak */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-amber-400 text-xs font-bold">
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>{progress.streakDays}</span>
          </div>

          {/* XP */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-emerald-400 text-xs font-bold">
            <Zap className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
            <span>{progress.xp}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
