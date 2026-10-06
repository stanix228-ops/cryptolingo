import React, { useState } from 'react';
import type { UserProgress } from '../types';
import { Share2, Zap, Flame, Check, Copy, Trophy, Award, Lock, ExternalLink } from 'lucide-react';
import { getTelegramUser, haptic, openTelegramLink, shareToTelegram, copyText } from '../services/telegram';
import { ACHIEVEMENTS, type Achievement } from '../data/achievements';
import { AchievementBadge } from './AchievementBadge';

interface ProfileViewProps {
  progress: UserProgress;
  onRefillLives: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ progress }) => {
  const user = getTelegramUser();
  const [copied, setCopied] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  const getLeague = (xp: number) => {
    if (xp >= 2000) return { name: 'SENIOR TRADER', badge: 'LEVEL 04', nextXp: 5000, color: '#FFFFFF' };
    if (xp >= 1000) return { name: 'PRO TRADER', badge: 'LEVEL 03', nextXp: 2000, color: '#FFFFFF' };
    if (xp >= 350) return { name: 'ADVANCED TRADER', badge: 'LEVEL 02', nextXp: 1000, color: '#FFFFFF' };
    return { name: 'JUNIOR TRADER', badge: 'LEVEL 01', nextXp: 350, color: '#FFFFFF' };
  };

  const league = getLeague(progress.xp);
  const botUsername = 'Cryptolingobot';
  const referralLink = `https://t.me/${botUsername}?start=ref_${user.id || 6511326390}`;

  const handleCopyReferral = async () => {
    haptic.medium();
    const ok = await copyText(referralLink);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareTelegram = () => {
    haptic.heavy();
    const text = 'Практическое обучение торговле криптовалютой на реальных графиках TradingView в CryptoLingo Pro:';
    shareToTelegram(referralLink, text);
  };

  // Calculate achievements stats
  const unlockedCount = ACHIEVEMENTS.filter((ach) => ach.checkUnlocked(progress)).length;
  const totalCount = ACHIEVEMENTS.length;
  const achPercent = Math.round((unlockedCount / totalCount) * 100);

  const totalBlocks = 20;
  const filledBlocks = Math.round((achPercent / 100) * totalBlocks);
  const emptyBlocks = totalBlocks - filledBlocks;
  const progressBlocks = '■'.repeat(filledBlocks) + '□'.repeat(emptyBlocks);

  const filteredAchievements =
    selectedCategory === 'all'
      ? ACHIEVEMENTS
      : ACHIEVEMENTS.filter((ach) => ach.category === selectedCategory);

  const categories = [
    { id: 'all', label: `ВСЕ (${totalCount})` },
    { id: 'academy', label: 'ОБУЧЕНИЕ' },
    { id: 'terminal', label: 'ТЕРМИНАЛ' },
    { id: 'social', label: 'ДИСЦИПЛИНА' },
    { id: 'mastery', label: 'МАСТЕРСТВО' },
  ];

  return (
    <div className="flex flex-col max-w-md mx-auto px-3 py-4 pb-28 gap-4 select-none font-mono text-white">
      {/* Trader Identity Card */}
      <div className="p-4 bg-black border border-white/25 flex flex-col items-center text-center">
        <div className="w-14 h-14 bg-white text-black border border-white flex items-center justify-center font-black text-xl mb-2">
          {user.first_name ? user.first_name[0].toUpperCase() : 'T'}
        </div>

        <h2 className="text-sm font-black uppercase text-white tracking-wider">
          {user.first_name || 'Трейдер'}
        </h2>
        <span className="text-[10px] text-neutral-400 mt-0.5">
          ID: {user.id ? `@${user.username || user.id}` : '@TRADER_PRO'}
        </span>

        {/* League Rank */}
        <div className="mt-3 px-3 py-1 bg-white text-black font-black text-[10px] uppercase tracking-widest border border-white">
          [ {league.name} // {league.badge} ]
        </div>

        {/* Rank XP Progress */}
        <div className="w-full mt-4 border-t border-white/10 pt-3">
          <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
            <span>КВАЛИФИКАЦИОННЫЙ РАНГ</span>
            <span className="text-white font-bold">
              {progress.xp} / {league.nextXp} XP
            </span>
          </div>
          <div className="w-full h-1.5 bg-neutral-900 border border-white/10 overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-300"
              style={{ width: `${Math.min(100, (progress.xp / league.nextXp) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4 Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 bg-black border border-white/20 flex items-center gap-2.5">
          <div className="w-7 h-7 bg-white text-black flex items-center justify-center font-bold text-xs">
            XP
          </div>
          <div>
            <div className="text-[9px] text-neutral-400 uppercase font-bold">ОЧКИ ОПЫТА</div>
            <div className="text-xs font-black text-white">{progress.xp} XP</div>
          </div>
        </div>

        <div className="p-3 bg-black border border-white/20 flex items-center gap-2.5">
          <div className="w-7 h-7 bg-white text-black flex items-center justify-center font-bold text-xs">
            D
          </div>
          <div>
            <div className="text-[9px] text-neutral-400 uppercase font-bold">СТРЕЙК ДНЕЙ</div>
            <div className="text-xs font-black text-white">{progress.streakDays} ДНЕЙ</div>
          </div>
        </div>

        <div className="p-3 bg-black border border-white/20 flex items-center gap-2.5">
          <div className="w-7 h-7 bg-white text-black flex items-center justify-center font-bold text-xs">
            OK
          </div>
          <div>
            <div className="text-[9px] text-neutral-400 uppercase font-bold">УРОКОВ СДАНО</div>
            <div className="text-xs font-black text-white">
              {Object.keys(progress.completedLessons || {}).length} / 100
            </div>
          </div>
        </div>

        <div className="p-3 bg-black border border-white/20 flex items-center gap-2.5">
          <div className="w-7 h-7 bg-white text-black flex items-center justify-center font-bold text-xs">
            REF
          </div>
          <div>
            <div className="text-[9px] text-neutral-400 uppercase font-bold">РЕФЕРАЛОВ</div>
            <div className="text-xs font-black text-white">
              {progress.referralCount || 0} ПАРТНЕРОВ
            </div>
          </div>
        </div>
      </div>

      {/* ACHIEVEMENTS SECTION (20 Graphic Specifications) */}
      <div className="flex flex-col gap-3 pt-2">
        {/* Achievements Header */}
        <div className="p-3.5 bg-black border border-white/25 flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-white/15 pb-2">
            <div className="flex items-center gap-2">
              <Trophy className="w-3.5 h-3.5 text-white" />
              <span className="font-mono text-[11px] font-bold tracking-widest uppercase text-white">
                ДОСТИЖЕНИЯ И НАГРАДЫ
              </span>
            </div>
            <span className="font-mono text-[10px] font-bold bg-white text-black px-1.5 py-0.5">
              [ {unlockedCount} / {totalCount} ОК ]
            </span>
          </div>

          <div className="flex justify-between items-center text-[10px] text-neutral-400">
            <span>ПРОГРЕСС ДОСТИЖЕНИЙ</span>
            <span className="text-white font-bold">{achPercent}%</span>
          </div>

          <div className="font-mono text-xs tracking-tighter text-white select-none">
            [ {progressBlocks} ]
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 font-mono text-[10px] no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                haptic.selection();
                setSelectedCategory(cat.id);
              }}
              className={`px-2.5 py-1.5 border font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-white text-black border-white'
                  : 'bg-black text-neutral-400 border-white/15 hover:border-white hover:text-white'
              }`}
            >
              [ {cat.label} ]
            </button>
          ))}
        </div>

        {/* 20 Achievements List with Swiss Bauhaus Vector Badges */}
        <div className="flex flex-col gap-2.5">
          {filteredAchievements.map((ach) => {
            const isUnlocked = ach.checkUnlocked(progress);
            const p = ach.getProgress(progress);
            const progressRatio = Math.min(100, Math.round((p.current / (p.max || 1)) * 100));

            return (
              <div
                key={ach.id}
                onClick={() => {
                  haptic.selection();
                  setSelectedAchievement(ach);
                }}
                className={`p-3 border transition-all flex items-start gap-3 cursor-pointer ${
                  isUnlocked
                    ? 'bg-black border-white/40 hover:border-white shadow-sm'
                    : 'bg-neutral-950 border-white/10 hover:border-white/25 opacity-75'
                }`}
              >
                {/* SVG Bauhaus Badge */}
                <AchievementBadge id={ach.id} isUnlocked={isUnlocked} size="md" />

                {/* Details */}
                <div className="flex flex-col flex-1 min-w-0 gap-1">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <h3 className="font-black text-xs text-white uppercase tracking-tight truncate">
                        {ach.title}
                      </h3>
                      <span className="text-[8px] px-1 py-0.2 border border-white/20 text-neutral-400 shrink-0">
                        {ach.categoryLabel}
                      </span>
                    </div>

                    <span className="font-mono text-[10px] font-black text-white shrink-0">
                      +{ach.rewardXp} XP
                    </span>
                  </div>

                  <p className="text-[10px] text-neutral-400 font-sans leading-snug line-clamp-2">
                    {ach.description}
                  </p>

                  {/* Progress bar inside card */}
                  <div className="flex items-center justify-between gap-2 mt-1 pt-1 border-t border-white/10 text-[9px] font-mono">
                    <span className="text-neutral-500">СТАТУС: {p.label}</span>
                    {isUnlocked ? (
                      <span className="text-black bg-white px-1 font-bold flex items-center gap-0.5">
                        <Check className="w-2.5 h-2.5 text-black stroke-[3]" />
                        ВЫПОЛНЕНО
                      </span>
                    ) : (
                      <span className="text-neutral-400 font-bold">{progressRatio}%</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Referral Program Card */}
      <div className="p-4 bg-black border border-white/20 flex flex-col gap-2.5 mt-2">
        <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
          <span className="text-[10px] uppercase font-bold text-white tracking-wider">
            ПАРТНЕРСКАЯ ПРОГРАММА CRYPTOLINGO
          </span>
          <span className="text-[9px] bg-white text-black px-1 font-bold">[ +100 XP ]</span>
        </div>
        <p className="text-[11px] text-neutral-400 leading-normal font-sans">
          Приглашайте друзей по вашей персональной ссылке для совместного обучения и открытия Словаря терминов.
        </p>

        <div className="flex gap-2 mt-1">
          <button
            onClick={handleShareTelegram}
            className="flex-1 py-2.5 px-3 bg-white text-black font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer hover:bg-neutral-200 transition-colors"
          >
            <Share2 className="w-3 h-3 text-black" />
            <span>ОТПРАВИТЬ ССЫЛКУ</span>
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

      {/* Modal / Inspection for Selected Achievement */}
      {selectedAchievement && (
        <div
          onClick={() => setSelectedAchievement(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-black border border-white p-5 flex flex-col items-center text-center gap-4 animate-in fade-in zoom-in-95 duration-200"
          >
            <AchievementBadge
              id={selectedAchievement.id}
              isUnlocked={selectedAchievement.checkUnlocked(progress)}
              size="lg"
            />

            <div className="flex flex-col gap-1">
              <span className="text-[9px] text-neutral-400 uppercase tracking-widest border border-white/20 px-1.5 py-0.5 self-center">
                {selectedAchievement.categoryLabel}
              </span>
              <h2 className="text-base font-black uppercase text-white mt-1">
                {selectedAchievement.title}
              </h2>
              <p className="text-xs text-neutral-300 font-sans leading-relaxed mt-1">
                {selectedAchievement.description}
              </p>
            </div>

            <div className="w-full border border-white/15 p-2.5 bg-neutral-950 flex justify-between items-center font-mono text-xs">
              <span className="text-neutral-400">НАГРАДА:</span>
              <span className="font-black text-white">+{selectedAchievement.rewardXp} XP</span>
            </div>

            <div className="w-full border border-white/15 p-2.5 bg-neutral-950 flex justify-between items-center font-mono text-xs">
              <span className="text-neutral-400">ПРОГРЕСС:</span>
              <span className="font-black text-white">
                {selectedAchievement.getProgress(progress).label}
              </span>
            </div>

            <button
              onClick={() => setSelectedAchievement(null)}
              className="w-full py-2.5 bg-white text-black font-black text-xs uppercase tracking-wider border border-white cursor-pointer hover:bg-neutral-200"
            >
              [ ЗАКРЫТЬ ]
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
