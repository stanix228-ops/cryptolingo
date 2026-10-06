import React, { useState } from 'react';
import type { UserProgress } from '../types';
import { Share2, Zap, Flame, Check, Copy, Trophy, Award, Lock, ExternalLink, Heart, Plus, Sparkles, Bookmark } from 'lucide-react';
import { getTelegramUser, haptic, openTelegramLink, shareToTelegram, copyText } from '../services/telegram';
import { ACHIEVEMENTS, type Achievement } from '../data/achievements';
import { AchievementBadge } from './AchievementBadge';
import confetti from 'canvas-confetti';

interface ProfileViewProps {
  progress: UserProgress;
  onRefillLives: () => void;
  onOpenLivesShop: () => void;
  onOpenNotes?: () => void;
  onClaimAchievement: (achId: string, rewardXp: number) => void;
  onClaimAllAchievements: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  progress,
  onOpenLivesShop,
  onOpenNotes,
  onClaimAchievement,
  onClaimAllAchievements,
}) => {
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

  const claimedList = progress.claimedAchievements || [];

  // Calculate achievements stats
  const unlockedAchievements = ACHIEVEMENTS.filter((ach) => ach.checkUnlocked(progress));
  const unlockedCount = unlockedAchievements.length;
  const totalCount = ACHIEVEMENTS.length;
  const achPercent = Math.round((unlockedCount / totalCount) * 100);

  // Unclaimed achievements & XP calculation
  const unclaimedAchievements = unlockedAchievements.filter((ach) => !claimedList.includes(ach.id));
  const totalUnclaimedXp = unclaimedAchievements.reduce((sum, ach) => sum + ach.rewardXp, 0);

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

  const triggerClaimConfetti = () => {
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#FFFFFF', '#AAAAAA', '#DDDDDD'],
    });
  };

  const currentLives = progress.lives;
  const maxLives = progress.maxLives || 5;

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

      {/* Lives / Energy Card with XP Shop Trigger */}
      <div className="p-3.5 bg-black border border-white/25 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-neutral-950 border border-white/20 flex items-center justify-center text-white">
            <Heart className="w-4 h-4 fill-white text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-neutral-400 uppercase font-bold">ЗАПАС ЖИЗНЕЙ ДЛЯ ТЕСТОВ</span>
            <span className="text-xs font-black text-white">
              {currentLives} / {maxLives} ЖИЗНЕЙ
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            haptic.medium();
            onOpenLivesShop();
          }}
          className="px-3 py-2 bg-white text-black font-black text-[10px] uppercase tracking-wider hover:bg-neutral-200 transition-colors cursor-pointer flex items-center gap-1"
        >
          <Plus className="w-3 h-3 text-black stroke-[3]" />
          <span>КУПИТЬ ЗА XP</span>
        </button>
      </div>

      {/* Trader Cheat Sheet / Notes Card */}
      <div className="p-3.5 bg-black border border-white/25 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-neutral-950 border border-white/20 flex items-center justify-center text-white">
            <Bookmark className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-neutral-400 uppercase font-bold">КОНСПЕКТ ТРЕЙДЕРА</span>
            <span className="text-xs font-black text-white">
              {(progress.savedNotes || []).length} СОХРАНЕННЫХ ШПАРГАЛОК
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            haptic.medium();
            onOpenNotes?.();
          }}
          className="px-3 py-2 bg-neutral-900 border border-white/30 text-white font-black text-[10px] uppercase tracking-wider hover:bg-white hover:text-black transition-colors cursor-pointer flex items-center gap-1"
        >
          <span>ОТКРЫТЬ</span>
        </button>
      </div>

      {/* Rank Privileges & Level-Up Roadmap */}
      <div className="p-3.5 bg-black border border-white/20 flex flex-col gap-2.5">
        <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
          <span className="text-[10px] font-bold text-white uppercase tracking-wider">
            ПРИВИЛЕГИИ РАНГОВ ТРЕЙДЕРА
          </span>
          <span className="text-[9px] bg-white text-black font-bold px-1">[ ROADMAP ]</span>
        </div>

        <div className="flex flex-col gap-2">
          {/* Level 01 */}
          <div className={`p-2 border flex items-center justify-between gap-2 text-[10px] ${progress.xp < 350 ? 'border-white bg-neutral-950' : 'border-white/20 bg-black opacity-60'}`}>
            <div className="flex flex-col">
              <span className="font-bold text-white uppercase">LVL 01: JUNIOR TRADER (0+ XP)</span>
              <span className="text-[9px] text-neutral-400 font-sans">Базовый доступ к 100 урокам, лимит 5 жизней</span>
            </div>
            <span className="font-bold text-white shrink-0">{progress.xp >= 0 ? '[ АКТИВЕН ]' : '[ ЗАКРЫТ ]'}</span>
          </div>

          {/* Level 02 */}
          <div className={`p-2 border flex items-center justify-between gap-2 text-[10px] ${progress.xp >= 350 && progress.xp < 1000 ? 'border-white bg-neutral-950' : 'border-white/20 bg-black'}`}>
            <div className="flex flex-col">
              <span className="font-bold text-white uppercase">LVL 02: ADVANCED TRADER (350+ XP)</span>
              <span className="text-[9px] text-neutral-400 font-sans">+1 слот к макс. жизням (до 6), значок верификации</span>
            </div>
            <span className={`font-bold shrink-0 ${progress.xp >= 350 ? 'text-white' : 'text-neutral-500'}`}>
              {progress.xp >= 350 ? '[ АКТИВЕН ]' : '[ 350 XP ]'}
            </span>
          </div>

          {/* Level 03 */}
          <div className={`p-2 border flex items-center justify-between gap-2 text-[10px] ${progress.xp >= 1000 && progress.xp < 2000 ? 'border-white bg-neutral-950' : 'border-white/20 bg-black'}`}>
            <div className="flex flex-col">
              <span className="font-bold text-white uppercase">LVL 03: PRO TRADER (1,000+ XP)</span>
              <span className="text-[9px] text-neutral-400 font-sans">Скидка -20% на жизни, PRO-индикаторы в терминале</span>
            </div>
            <span className={`font-bold shrink-0 ${progress.xp >= 1000 ? 'text-white' : 'text-neutral-500'}`}>
              {progress.xp >= 1000 ? '[ АКТИВЕН ]' : '[ 1,000 XP ]'}
            </span>
          </div>

          {/* Level 04 */}
          <div className={`p-2 border flex items-center justify-between gap-2 text-[10px] ${progress.xp >= 2000 ? 'border-white bg-neutral-950' : 'border-white/20 bg-black'}`}>
            <div className="flex flex-col">
              <span className="font-bold text-white uppercase">LVL 04: SENIOR TRADER (2,000+ XP)</span>
              <span className="text-[9px] text-neutral-400 font-sans">Полный доступ ко всем экспертным стратегиям</span>
            </div>
            <span className={`font-bold shrink-0 ${progress.xp >= 2000 ? 'text-white' : 'text-neutral-500'}`}>
              {progress.xp >= 2000 ? '[ АКТИВЕН ]' : '[ 2,000 XP ]'}
            </span>
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
        <div className="p-3.5 bg-black border border-white/25 flex flex-col gap-2.5">
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
            <span>ПРОГРЕСС ВЫПОЛНЕНИЯ</span>
            <span className="text-white font-bold">{achPercent}%</span>
          </div>

          <div className="font-mono text-xs tracking-tighter text-white select-none">
            [ {progressBlocks} ]
          </div>

          {/* Claim All Unclaimed XP Button if any */}
          {unclaimedAchievements.length > 0 && (
            <button
              onClick={() => {
                triggerClaimConfetti();
                onClaimAllAchievements();
              }}
              className="mt-1 w-full py-2.5 bg-white text-black font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer hover:bg-neutral-200 transition-all border border-white animate-pulse"
            >
              <Zap className="w-3.5 h-3.5 fill-black text-black" />
              <span>[ ЗАБРАТЬ ВСЕ НАГРАДЫ (+{totalUnclaimedXp} XP) ]</span>
            </button>
          )}
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
            const isClaimed = claimedList.includes(ach.id);
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
                    ? isClaimed
                      ? 'bg-black border-white/30 hover:border-white'
                      : 'bg-neutral-950 border-white shadow-sm ring-1 ring-white/30'
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

                  {/* Progress bar / Claim Button inside card */}
                  <div className="flex items-center justify-between gap-2 mt-1 pt-1.5 border-t border-white/10 text-[9px] font-mono">
                    <span className="text-neutral-500">СТАТУС: {p.label}</span>
                    {isUnlocked ? (
                      isClaimed ? (
                        <span className="text-neutral-400 bg-neutral-900 border border-white/15 px-1.5 py-0.5 font-bold flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                          ПОЛУЧЕНО
                        </span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerClaimConfetti();
                            onClaimAchievement(ach.id, ach.rewardXp);
                          }}
                          className="bg-white text-black px-2 py-0.5 font-black uppercase tracking-wider hover:bg-neutral-200 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Zap className="w-2.5 h-2.5 fill-black text-black" />
                          ЗАБРАТЬ +{ach.rewardXp} XP
                        </button>
                      )
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

            {selectedAchievement.checkUnlocked(progress) && !claimedList.includes(selectedAchievement.id) ? (
              <button
                onClick={() => {
                  triggerClaimConfetti();
                  onClaimAchievement(selectedAchievement.id, selectedAchievement.rewardXp);
                  setSelectedAchievement(null);
                }}
                className="w-full py-3 bg-white text-black font-black text-xs uppercase tracking-wider border border-white cursor-pointer hover:bg-neutral-200 flex items-center justify-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 fill-black text-black" />
                <span>[ ЗАБРАТЬ НАГРАДУ +{selectedAchievement.rewardXp} XP ]</span>
              </button>
            ) : (
              <button
                onClick={() => setSelectedAchievement(null)}
                className="w-full py-2.5 bg-neutral-950 border border-white/20 text-neutral-400 font-black text-xs uppercase tracking-wider cursor-pointer hover:text-white hover:border-white"
              >
                [ ЗАКРЫТЬ ]
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
