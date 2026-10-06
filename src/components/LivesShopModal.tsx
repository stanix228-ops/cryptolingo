import React from 'react';
import { Heart, Zap, X, Shield, Plus, Users, Clock, Check } from 'lucide-react';
import type { UserProgress } from '../types';
import { haptic, shareToTelegram, getTelegramUser } from '../services/telegram';

interface LivesShopModalProps {
  progress: UserProgress;
  onClose: () => void;
  onBuyLives: (amount: number, xpCost: number) => void;
  onUpgradeMaxLives: (extraLives: number, xpCost: number) => void;
}

export const LivesShopModal: React.FC<LivesShopModalProps> = ({
  progress,
  onClose,
  onBuyLives,
  onUpgradeMaxLives,
}) => {
  const user = getTelegramUser();
  const currentLives = progress.lives;
  const maxLives = progress.maxLives || 5;
  const userXp = progress.xp || 0;
  const missingLives = Math.max(0, maxLives - currentLives);

  const fullRefillCost = Math.min(150, missingLives * 40);

  const handleBuySingleLife = () => {
    if (userXp < 50) {
      haptic.error();
      return;
    }
    if (currentLives >= maxLives) {
      haptic.warning();
      return;
    }
    haptic.success();
    onBuyLives(1, 50);
  };

  const handleBuyFullRefill = () => {
    if (userXp < 150) {
      haptic.error();
      return;
    }
    if (currentLives >= maxLives) {
      haptic.warning();
      return;
    }
    haptic.success();
    onBuyLives(missingLives, 150);
  };

  const handleBuyUpgrade = () => {
    if (userXp < 300) {
      haptic.error();
      return;
    }
    haptic.success();
    onUpgradeMaxLives(5, 300);
  };

  const handleInviteFriend = () => {
    haptic.heavy();
    const referralLink = `https://t.me/Cryptolingobot?start=ref_${user.id || 6511326390}`;
    const text = 'Практическое обучение торговле криптовалютой в CryptoLingo Pro:';
    shareToTelegram(referralLink, text);
  };

  const filledHearts = Math.min(currentLives, maxLives);
  const emptyHearts = Math.max(0, maxLives - filledHearts);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3.5 select-none font-mono text-white animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-black border border-white/30 flex flex-col p-4.5 gap-4 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/15 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-white text-black flex items-center justify-center font-bold text-xs">
              <Heart className="w-3.5 h-3.5 fill-black text-black" />
            </div>
            <div>
              <h2 className="text-xs font-black uppercase text-white tracking-wider">
                ЭНЕРГИЯ И ЖИЗНИ // МАГАЗИН XP
              </h2>
              <span className="text-[9px] text-neutral-400 uppercase tracking-widest block">
                РЕЗЕРВ ПОПЫТОК ДЛЯ ТЕСТОВ
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 bg-neutral-950 border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Current State Banner */}
        <div className="p-3 bg-neutral-950 border border-white/15 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-neutral-400 uppercase">ТЕКУЩИЙ ЗАПАС ЖИЗНЕЙ</span>
            <span className="font-bold text-white">
              {currentLives} / {maxLives} [ {'■'.repeat(filledHearts)}{'□'.repeat(emptyHearts)} ]
            </span>
          </div>

          <div className="w-full h-2 bg-neutral-900 border border-white/10 overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-300"
              style={{ width: `${Math.min(100, (currentLives / maxLives) * 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[9px] text-neutral-400 pt-1 border-t border-white/10">
            <span className="flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              АВТО-ВОССТАНОВЛЕНИЕ: +1 ЖИЗНЬ / 15 МИН
            </span>
            <span className="font-bold text-white bg-neutral-900 px-1 border border-white/10">
              БАЛАНС: {userXp} XP
            </span>
          </div>
        </div>

        {/* Store Options Grid */}
        <div className="flex flex-col gap-2.5">
          {/* Item 1: 1 Life */}
          <div className="p-3 bg-black border border-white/20 flex items-center justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black uppercase text-white">+1 ЖИЗНЬ</span>
                <span className="text-[8px] bg-neutral-900 border border-white/20 text-neutral-300 px-1">
                  ЭКСПРЕСС
                </span>
              </div>
              <span className="text-[10px] text-neutral-400 font-sans">
                Быстрое пополнение для одной попытки в тесте
              </span>
            </div>

            <button
              onClick={handleBuySingleLife}
              disabled={userXp < 50 || currentLives >= maxLives}
              className={`px-3 py-2 font-black text-[10px] uppercase tracking-wider shrink-0 transition-all border ${
                userXp >= 50 && currentLives < maxLives
                  ? 'bg-white text-black border-white hover:bg-neutral-200 cursor-pointer'
                  : 'bg-neutral-950 text-neutral-600 border-white/10 cursor-not-allowed'
              }`}
            >
              [ 50 XP ]
            </button>
          </div>

          {/* Item 2: Full Refill */}
          <div className="p-3 bg-black border border-white/30 flex items-center justify-between gap-3 relative overflow-hidden">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black uppercase text-white">ПОЛНЫЙ РЕЗЕРВ (5/5)</span>
                <span className="text-[8px] bg-white text-black font-bold px-1">
                  ВЫГОДНО -40%
                </span>
              </div>
              <span className="text-[10px] text-neutral-400 font-sans">
                Восстановление всех потраченных жизней до максимума
              </span>
            </div>

            <button
              onClick={handleBuyFullRefill}
              disabled={userXp < 150 || currentLives >= maxLives}
              className={`px-3 py-2 font-black text-[10px] uppercase tracking-wider shrink-0 transition-all border ${
                userXp >= 150 && currentLives < maxLives
                  ? 'bg-white text-black border-white hover:bg-neutral-200 cursor-pointer'
                  : 'bg-neutral-950 text-neutral-600 border-white/10 cursor-not-allowed'
              }`}
            >
              [ 150 XP ]
            </button>
          </div>

          {/* Item 3: Upgrade Max Lives */}
          <div className="p-3 bg-black border border-white/20 flex items-center justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black uppercase text-white">+5 К МАКС. ЖИЗНЯМ</span>
                <span className="text-[8px] bg-neutral-900 border border-white/20 text-neutral-300 px-1">
                  UPGRADE
                </span>
              </div>
              <span className="text-[10px] text-neutral-400 font-sans">
                Увеличивает вместимость до {maxLives + 5} жизней навсегда
              </span>
            </div>

            <button
              onClick={handleBuyUpgrade}
              disabled={userXp < 300}
              className={`px-3 py-2 font-black text-[10px] uppercase tracking-wider shrink-0 transition-all border ${
                userXp >= 300
                  ? 'bg-white text-black border-white hover:bg-neutral-200 cursor-pointer'
                  : 'bg-neutral-950 text-neutral-600 border-white/10 cursor-not-allowed'
              }`}
            >
              [ 300 XP ]
            </button>
          </div>
        </div>

        {/* Free Refill via Referral */}
        <div className="p-3 bg-neutral-950 border border-white/15 flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
            <span className="text-[9px] font-bold text-white uppercase tracking-wider">
              БЕСПЛАТНЫЙ БОНУС ПАРТНЕРА
            </span>
            <span className="text-[8px] bg-white text-black px-1 font-bold">+100 XP & +3 ЖИЗНИ</span>
          </div>
          <p className="text-[10px] text-neutral-400 font-sans">
            Пригласите друга для совместного обучения и моментально получите бонусные жизни и очки опыта.
          </p>
          <button
            onClick={handleInviteFriend}
            className="w-full py-2 bg-neutral-900 border border-white/25 text-white font-black text-[10px] uppercase tracking-wider hover:bg-white hover:text-black transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Users className="w-3 h-3" />
            <span>[ ПРИГЛАСИТЬ В TELEGRAM ]</span>
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-neutral-950 border border-white/20 text-neutral-400 font-bold text-[10px] uppercase tracking-wider hover:text-white hover:border-white transition-colors cursor-pointer"
        >
          [ ВЕРНУТЬСЯ НАЗАД ]
        </button>
      </div>
    </div>
  );
};
