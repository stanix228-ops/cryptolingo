import React, { useState } from 'react';
import type { UserProgress } from '../types';
import { Share2, Zap, Flame, Check, Copy, Shield, Award, User, Layers } from 'lucide-react';
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
    if (xp >= 500) return { name: 'PRO Trader', badge: 'Высшая лига', color: 'from-[#A855F7] to-[#6366F1]', nextXp: 1000 };
    if (xp >= 250) return { name: 'Advanced Trader', badge: 'Золотая лига', color: 'from-[#38BDF8] to-[#0284C7]', nextXp: 500 };
    if (xp >= 100) return { name: 'Intermediate Trader', badge: 'Серебряная лига', color: 'from-[#00C076] to-[#05D688]', nextXp: 250 };
    return { name: 'Junior Trader', badge: 'Базовый уровень', color: 'from-[#F0B90B] to-[#D97706]', nextXp: 100 };
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
    const text = encodeURIComponent('Практическое обучение торговле криптовалютой на реальных графиках в CryptoLingo Pro:');
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${text}`;
    window.open(shareUrl, '_blank');
  };

  return (
    <div className="flex flex-col max-w-md mx-auto px-4 py-5 pb-28 gap-5 animate-fadeIn select-none">
      {/* Trader Identity Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-b from-[#0F1420] to-[#0B0E17] border border-[#1E293B] shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        <div className="w-18 h-18 rounded-2xl bg-[#172033] border border-[#1E293B] flex items-center justify-center font-mono font-black text-2xl text-[#00C076] mb-3 shadow-lg">
          {user.first_name ? user.first_name[0].toUpperCase() : 'T'}
        </div>

        <h2 className="text-lg font-black text-white tracking-tight">{user.first_name || 'Трейдер'}</h2>
        <span className="text-xs text-slate-400 font-mono mt-0.5">@{user.username || 'user'}</span>

        {/* League Rank Badge */}
        <div
          className={`mt-4 px-4 py-1.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-[#06080E] bg-gradient-to-r ${league.color} shadow-lg`}
        >
          {league.name}
        </div>

        {/* Rank XP Progress */}
        <div className="w-full mt-5">
          <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1.5">
            <span>{league.badge}</span>
            <span className="text-slate-300 font-bold">{progress.xp} / {league.nextXp} XP</span>
          </div>
          <div className="w-full h-2 bg-[#06080E] rounded-full overflow-hidden border border-[#1E293B]">
            <div
              className="h-full bg-gradient-to-r from-[#00C076] to-[#38BDF8] rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (progress.xp / league.nextXp) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 font-mono">
        <div className="p-4 rounded-3xl bg-[#0F1420] border border-[#1E293B] flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-[#00C076]/10 border border-[#00C076]/30 flex items-center justify-center text-[#00C076]">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Опыт</div>
            <div className="text-base font-black text-white">{progress.xp} XP</div>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-[#0F1420] border border-[#1E293B] flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-[#F0B90B]/10 border border-[#F0B90B]/30 flex items-center justify-center text-[#F0B90B]">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Серия дней</div>
            <div className="text-base font-black text-white">{progress.streakDays} дн.</div>
          </div>
        </div>
      </div>

      {/* Referral Program Card */}
      <div className="p-5 rounded-3xl bg-[#0F1420] border border-[#1E293B] flex flex-col gap-3 shadow-xl">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#38BDF8]" />
          <h3 className="text-xs font-mono font-bold uppercase text-white tracking-wider">
            Партнерская программа
          </h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Приглашайте коллег и партнеров: начисление +5 попыток и +100 баллов рейтинга за каждого квалифицированного ученика.
        </p>

        <div className="flex gap-2.5 mt-1">
          <button
            onClick={handleShareTelegram}
            className="flex-1 py-3 px-4 rounded-xl font-mono font-bold text-xs uppercase bg-[#38BDF8] text-[#06080E] flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#38BDF8]/20"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Пригласить в Telegram</span>
          </button>

          <button
            onClick={handleCopyReferral}
            className="p-3 rounded-xl bg-[#172033] border border-[#1E293B] text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Скопировать ссылку"
          >
            {copied ? <Check className="w-4 h-4 text-[#00C076]" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
