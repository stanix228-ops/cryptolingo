import React, { useState } from 'react';
import { UserProgress } from '../types';
import { Trophy, Share2, Award, Zap, Shield, Flame, Check, Copy } from 'lucide-react';
import { getTelegramUser, haptic } from '../services/telegram';

interface ProfileViewProps {
  progress: UserProgress;
  onRefillLives: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  progress,
  onRefillLives,
}) => {
  const user = getTelegramUser();
  const [copied, setCopied] = useState(false);

  // League calculation based on XP
  const getLeague = (xp: number) => {
    if (xp >= 500) return { name: 'Крипто-Кит 🐋', color: 'from-purple-500 to-indigo-500' };
    if (xp >= 250) return { name: 'Свинг-Трейдер 📈', color: 'from-blue-500 to-cyan-500' };
    if (xp >= 100) return { name: 'Скальпер ⚡', color: 'from-emerald-500 to-teal-500' };
    return { name: 'Новичок в крипте 🌱', color: 'from-amber-500 to-yellow-500' };
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
    const text = encodeURIComponent('🚀 Я учусь торговать криптой на реальных графиках в CryptoLingo! Присоединяйся и получи бонусные жизни:');
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${text}`;
    window.open(shareUrl, '_blank');
  };

  return (
    <div className="flex flex-col max-w-md mx-auto px-4 py-4 pb-24 gap-5 animate-fadeIn">
      {/* User Identity Card */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col items-center text-center relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-10 inset-x-0 h-28 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none" />

        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 border-2 border-emerald-400 p-1 flex items-center justify-center text-3xl font-black text-white shadow-xl mb-3">
          {user.first_name ? user.first_name[0].toUpperCase() : 'C'}
        </div>

        <h2 className="text-lg font-black text-white">{user.first_name}</h2>
        <span className="text-xs text-slate-400 font-mono">@{user.username || 'trader'}</span>

        {/* League Badge */}
        <div
          className={`mt-3 px-4 py-1.5 rounded-full text-xs font-black text-slate-950 bg-gradient-to-r ${league.color} shadow-lg`}
        >
          {league.name}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-semibold">Всего опыта</div>
            <div className="text-base font-black text-white font-mono">{progress.xp} XP</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-semibold">Серия дней</div>
            <div className="text-base font-black text-white font-mono">{progress.streakDays} дн.</div>
          </div>
        </div>
      </div>

      {/* Referral Viral Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-500/30 flex flex-col gap-3 shadow-xl">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎁</span>
          <h3 className="text-sm font-bold text-white">Приглашай друзей за жизни!</h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Отправь свою реферальную ссылку другу: ты получишь <span className="text-emerald-400 font-bold">+5 жизней</span> и <span className="text-amber-400 font-bold">+100 монет</span>, когда он пройдет первый урок!
        </p>

        <div className="flex gap-2 mt-1">
          <button
            onClick={handleShareTelegram}
            className="flex-1 py-3 px-4 rounded-2xl font-bold text-xs btn-3d-blue text-white flex items-center justify-center gap-2 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Поделиться в Telegram</span>
          </button>

          <button
            onClick={handleCopyReferral}
            className="p-3 rounded-2xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Скопировать ссылку"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
