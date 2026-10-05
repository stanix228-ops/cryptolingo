import React from 'react';
import { Heart, Flame, Zap } from 'lucide-react';
import type { UserProgress } from '../types';

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
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5 select-none">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Logo / Mascot Brand */}
        <button 
          onClick={onOpenProfile}
          className="flex items-center gap-2.5 text-left group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-emerald-400 shadow-md shadow-emerald-500/20 bg-slate-900 shrink-0 group-hover:scale-105 transition-transform">
            <img 
              src="./mascot.jpg" 
              alt="CryptoLingo Bull" 
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to text if image not available
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent block leading-none">
              CryptoLingo
            </span>
            <span className="text-[10px] text-slate-400 font-medium leading-tight">
              Тренажер крипты
            </span>
          </div>
        </button>

        {/* Stats: Lives, Streak, XP */}
        <div className="flex items-center gap-2">
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
