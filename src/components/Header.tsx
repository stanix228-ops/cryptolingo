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
    <header className="sticky top-0 z-40 bg-[#06080E]/90 backdrop-blur-xl border-b border-[#1E293B]/80 px-4 py-2.5 select-none transition-all">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Brand & Mascot Profile Button */}
        <button
          onClick={() => {
            haptic.selection();
            onOpenProfile();
          }}
          className="flex items-center gap-2.5 text-left group cursor-pointer"
        >
          <div className="relative w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-[#00F59B] to-[#38BDF8] shadow-lg shadow-[#00F59B]/20 shrink-0 group-hover:scale-105 transition-transform">
            <div className="w-full h-full rounded-full overflow-hidden bg-[#0F1420]">
              <img
                src="./mascot.jpg"
                alt="CryptoLingo Bull"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          </div>
          <div>
            <span className="font-black text-base tracking-tight bg-gradient-to-r from-[#00F59B] via-[#38BDF8] to-[#A855F7] bg-clip-text text-transparent block leading-tight">
              CryptoLingo
            </span>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wide flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00F59B] animate-ping" />
              Тренажер крипты
            </span>
          </div>
        </button>

        {/* Stats Pill Badges: Lives, Streak, XP */}
        <div className="flex items-center gap-2">
          {/* Lives ❤️ */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0F1420] border border-[#1E293B] text-[#FF3366] text-xs font-black shadow-inner">
            <Heart className="w-3.5 h-3.5 fill-[#FF3366] text-[#FF3366] animate-pulse" />
            <span>{progress.lives}</span>
          </div>

          {/* Streak 🔥 */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0F1420] border border-[#1E293B] text-[#FFD200] text-xs font-black shadow-inner">
            <Flame className="w-3.5 h-3.5 fill-[#FFD200] text-[#FFD200]" />
            <span>{progress.streakDays}</span>
          </div>

          {/* XP ⚡ */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#00F59B]/10 to-[#38BDF8]/10 border border-[#00F59B]/30 text-[#00F59B] text-xs font-black shadow-sm">
            <Zap className="w-3.5 h-3.5 fill-[#00F59B] text-[#00F59B]" />
            <span className="font-mono">{progress.xp}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
