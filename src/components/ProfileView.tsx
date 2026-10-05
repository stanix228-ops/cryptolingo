import React, { useState } from 'react';
import type { UserProgress } from '../types';
import { Share2, Zap, Flame, Check, Copy } from 'lucide-react';
import { getTelegramUser, haptic } from '../services/telegram';

interface ProfileViewProps {
  progress: UserProgress;
  onRefillLives: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  progress,
}) => {
  const user = getTelegramUser();
  const [copied, setCopied] = useState(false);

  const getLeague = (xp: number) => {
    if (xp >= 500) return { name: 'PRO TRADER', badge: 'LEVEL 04', nextXp: 1000 };
    if (xp >= 250) return { name: 'ADVANCED TRADER', badge: 'LEVEL 03', nextXp: 500 };
    if (xp >= 100) return { name: 'INTERMEDIATE TRADER', badge: 'LEVEL 02', nextXp: 250 };
    return { name: 'JUNIOR TRADER', badge: 'LEVEL 01', nextXp: 100 };
  };

  const league = getLeague(progress.xp);
  const botUsername = 'Cryptolingobot';
  const referralLink = `https://t.me/${botUsername}?start=ref_${user.id}`;

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    haptic.success();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTelegram = () => {
    haptic.medium();
    const text = encodeURIComponent('Practical cryptocurrency trading education on real charts in CryptoLingo Pro:');
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${text}`;
    window.open(shareUrl, '_blank');
  };

  return (
    <div className="flex flex-col max-w-md mx-auto px-3 py-4 pb-28 gap-4 animate-fadeIn select-none font-mono text-white">
      {/* Trader Identity Card */}
      <div className="p-4 bg-black border border-white/20 flex flex-col items-center text-center">
        <div className="w-14 h-14 bg-white text-black border border-white flex items-center justify-center font-black text-xl mb-2">
          {user.first_name ? user.first_name[0].toUpperCase() : 'T'}
        </div>

        <h2 className="text-sm font-black uppercase text-white tracking-wider">{user.first_name || 'TRADER'}</h2>
        <span className="text-[10px] text-neutral-400 mt-0.5">ID: @{user.username || 'USER'}</span>

        {/* League Rank */}
        <div className="mt-3 px-3 py-1 bg-white text-black font-black text-[10px] uppercase tracking-widest">
          [ {league.name} // {league.badge} ]
        </div>

        {/* Rank XP Progress */}
        <div className="w-full mt-4 border-t border-white/10 pt-3">
          <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
            <span>QUALIFICATION RATIO</span>
            <span className="text-white font-bold">{progress.xp} / {league.nextXp} XP</span>
          </div>
          <div className="w-full h-1.5 bg-neutral-900 border border-white/10 overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-300"
              style={{ width: `${Math.min(100, (progress.xp / league.nextXp) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 bg-black border border-white/20 flex items-center gap-2.5">
          <div className="w-7 h-7 bg-white text-black flex items-center justify-center font-bold text-xs">
            XP
          </div>
          <div>
            <div className="text-[9px] text-neutral-400 uppercase font-bold">TOTAL SCORE</div>
            <div className="text-xs font-black text-white">{progress.xp} XP</div>
          </div>
        </div>

        <div className="p-3 bg-black border border-white/20 flex items-center gap-2.5">
          <div className="w-7 h-7 bg-white text-black flex items-center justify-center font-bold text-xs">
            D
          </div>
          <div>
            <div className="text-[9px] text-neutral-400 uppercase font-bold">STREAK DAYS</div>
            <div className="text-xs font-black text-white">{progress.streakDays} DAYS</div>
          </div>
        </div>
      </div>

      {/* Referral Program */}
      <div className="p-4 bg-black border border-white/20 flex flex-col gap-2.5">
        <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
          <span className="text-[10px] uppercase font-bold text-white tracking-wider">
            PARTNERSHIP INVITATION SPEC
          </span>
          <span className="text-[9px] bg-white text-black px-1 font-bold">[ +5 LIVES ]</span>
        </div>
        <p className="text-[11px] text-neutral-400 leading-normal font-sans">
          Invite colleagues and partners: receive +5 attempts and +100 qualification points for each verified user.
        </p>

        <div className="flex gap-2 mt-1">
          <button
            onClick={handleShareTelegram}
            className="flex-1 py-2.5 px-3 bg-white text-black font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer hover:bg-neutral-200 transition-colors"
          >
            <Share2 className="w-3 h-3" />
            <span>[ SHARE LINK ]</span>
          </button>

          <button
            onClick={handleCopyReferral}
            className="p-2.5 bg-neutral-950 border border-white/20 text-white hover:bg-white hover:text-black transition-colors cursor-pointer"
            title="Copy"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
