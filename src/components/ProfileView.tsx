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
    if (xp >= 500) return { name: 'Крипто-Кит 🐋', badge: 'Легендарная лига', color: 'from-[#A855F7] to-[#6366F1]', nextXp: 1000 };
    if (xp >= 250) return { name: 'Свинг-Трейдер 📈', badge: 'Золотая лига', color: 'from-[#38BDF8] to-[#0284C7]', nextXp: 500 };
    if (xp >= 100) return { name: 'Скальпер ⚡', badge: 'Серебряная лига', color: 'from-[#00F59B] to-[#05D688]', nextXp: 250 };
    return { name: 'Новичок в крипте 🌱', badge: 'Бронзовая лига', color: 'from-[#FFD200] to-[#F59E0B]', nextXp: 100 };
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
    const text = encodeURIComponent('🚀 Я учусь торговать криптой на реальных графиках в CryptoLingo! Заходи и получи бонусные жизни:');
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${text}`;
    window.open(shareUrl, '_blank');
  };

  return (
    <div className="flex flex-col max-w-md mx-auto px-4 py-5 pb-28 gap-5 animate-fadeIn select-none">
      {/* User Hero Identity Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-b from-[#0F1420] to-[#0B0E17] border border-[#1E293B] shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-10 inset-x-0 h-28 bg-gradient-to-b from-[#00F59B]/15 to-transparent pointer-events-none" />

        <div className="relative w-22 h-22 rounded-full p-[3px] bg-gradient-to-tr from-[#00F59B] via-[#38BDF8] to-[#FFD200] shadow-xl mb-3">
          <div className="w-full h-full rounded-full overflow-hidden bg-[#0F1420]">
            <img
              src="./mascot.jpg"
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <h2 className="text-xl font-black text-white tracking-tight">{user.first_name || 'Трейдер'}</h2>
        <span className="text-xs text-slate-400 font-mono mt-0.5">@{user.username || 'cryptouser'}</span>

        {/* League Rank Badge */}
        <div
          className={`mt-4 px-5 py-2 rounded-full text-xs font-black text-[#06080E] bg-gradient-to-r ${league.color} shadow-lg`}
        >
          {league.name}
        </div>

        {/* Rank XP Progress */}
        <div className="w-full mt-5">
          <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-1.5">
            <span>{league.badge}</span>
            <span className="font-mono text-slate-300">{progress.xp} / {league.nextXp} XP</span>
          </div>
          <div className="w-full h-2.5 bg-[#06080E] rounded-full overflow-hidden border border-[#1E293B]">
            <div
              className="h-full bg-gradient-to-r from-[#00F59B] to-[#38BDF8] rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (progress.xp / league.nextXp) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-3xl bg-[#0F1420] border border-[#1E293B] flex items-center gap-3 shadow-lg">
          <div className="w-11 h-11 rounded-2xl bg-[#00F59B]/10 border border-[#00F59B]/30 flex items-center justify-center text-[#00F59B]">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Всего опыта</div>
            <div className="text-lg font-black text-white font-mono">{progress.xp} XP</div>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-[#0F1420] border border-[#1E293B] flex items-center gap-3 shadow-lg">
          <div className="w-11 h-11 rounded-2xl bg-[#FFD200]/10 border border-[#FFD200]/30 flex items-center justify-center text-[#FFD200]">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Серия дней</div>
            <div className="text-lg font-black text-white font-mono">{progress.streakDays} дн.</div>
          </div>
        </div>
      </div>

      {/* Referral Gift Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#121B2F] via-[#0F1420] to-[#0A0D15] border border-[#38BDF8]/30 flex flex-col gap-3 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🎁</span>
          <div>
            <h3 className="text-sm font-black text-white">Приглашай друзей за жизни!</h3>
            <span className="text-[10px] text-[#00F59B] font-bold">Награда: +5 жизней и +100 монет</span>
          </div>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Отправь свою реферальную ссылку другу: получи мгновенное восстановление всех жизней, когда он пройдет первый уровень!
        </p>

        <div className="flex gap-2.5 mt-2">
          <button
            onClick={handleShareTelegram}
            className="flex-1 py-3.5 px-4 rounded-2xl font-black text-xs btn-3d-cyan flex items-center justify-center gap-2 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Поделиться в Telegram</span>
          </button>

          <button
            onClick={handleCopyReferral}
            className="p-3.5 rounded-2xl bg-[#172033] border border-[#1E293B] text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Скопировать ссылку"
          >
            {copied ? <Check className="w-4 h-4 text-[#00F59B]" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
