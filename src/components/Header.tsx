import React from 'react';
import { Heart, Flame, Zap } from 'lucide-react';
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
    <header className="sticky top-0 z-40 bg-black border-b-2 border-white px-3 py-2.5 select-none transition-all">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={() => {
            haptic.selection();
            onOpenProfile();
          }}
          className="flex items-center gap-2 text-left cursor-pointer"
        >
          <div className="w-8 h-8 bg-white text-black font-mono font-black text-xs flex items-center justify-center border border-white">
            OKX
          </div>
          <div>
            <span className="font-mono font-black text-xs uppercase tracking-wider text-white block leading-tight">
              CRYPTOLINGO PRO
            </span>
            <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-widest block">
              SPEC. 2026 // ACADEMY
            </span>
          </div>
        </button>

        {/* Stats Badges */}
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          {/* Lives */}
          <div className="flex items-center gap-1 px-2 py-0.5 border border-neutral-700 bg-neutral-950 text-white font-bold">
            <Heart className="w-3 h-3 text-white fill-white" />
            <span>{progress.lives}</span>
          </div>

          {/* Streak */}
          <div className="flex items-center gap-1 px-2 py-0.5 border border-neutral-700 bg-neutral-950 text-white font-bold">
            <Flame className="w-3 h-3 text-white" />
            <span>{progress.streakDays}D</span>
          </div>

          {/* XP */}
          <div className="flex items-center gap-1 px-2 py-0.5 border border-white bg-white text-black font-black">
            <Zap className="w-3 h-3 text-black fill-black" />
            <span>{progress.xp} XP</span>
          </div>
        </div>
      </div>
    </header>
  );
};
