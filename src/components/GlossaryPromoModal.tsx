import React, { useState } from 'react';
import { BookOpen, Share2, Copy, Check, ArrowRight, X } from 'lucide-react';
import { getTelegramUser, haptic, shareToTelegram, copyText } from '../services/telegram';

interface GlossaryPromoModalProps {
  onClose: () => void;
  onGoToGlossary: () => void;
}

export const GlossaryPromoModal: React.FC<GlossaryPromoModalProps> = ({
  onClose,
  onGoToGlossary,
}) => {
  const [copied, setCopied] = useState(false);
  const user = getTelegramUser();
  const botUsername = 'Cryptolingobot';
  const referralLink = `https://t.me/${botUsername}?start=ref_${user.id || 6511326390}`;

  const handleCopy = async () => {
    haptic.medium();
    const ok = await copyText(referralLink);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShare = () => {
    haptic.heavy();
    const text = 'Практическое обучение торговле криптовалютой на реальных графиках TradingView в CryptoLingo Pro:';
    shareToTelegram(referralLink, text);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 select-none font-mono">
      <div className="w-full max-w-sm bg-black border-2 border-white p-5 flex flex-col gap-4 text-white animate-in fade-in zoom-in-95 duration-200 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 p-1.5 border border-white/20 text-neutral-400 hover:text-white hover:border-white transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Tag */}
        <div className="flex items-center gap-2 border-b border-white/15 pb-2">
          <BookOpen className="w-4 h-4 text-white" />
          <span className="text-[10px] font-bold tracking-widest uppercase text-white">
            КВАЛИФИКАЦИЯ // УРОК 03 ЗАВЕРШЕН
          </span>
        </div>

        {/* Central Graphic Box */}
        <div className="w-14 h-14 bg-white text-black border border-white flex items-center justify-center self-center my-1 shadow-md">
          <BookOpen className="w-7 h-7 stroke-[2.2]" />
        </div>

        {/* Title & Explanatory text */}
        <div className="flex flex-col text-center gap-1.5">
          <span className="text-[9px] text-neutral-400 uppercase tracking-widest font-bold">
            [ НОВЫЙ РАЗДЕЛ РАЗБЛОКИРОВАН ]
          </span>
          <h2 className="text-base font-black uppercase tracking-wider text-white">
            Словарь Трейдера
          </h2>
          <p className="text-xs text-neutral-300 font-sans leading-relaxed mt-1">
            Поздравляем с прохождением 3-го урока! Вам стал доступен <span className="font-bold text-white">«Словарь профессиональных терминов и Price Action (50+ определений)»</span>.
          </p>
          <div className="mt-1 p-2 bg-neutral-950 border border-white/20 text-[11px] font-sans text-neutral-300 leading-snug">
            Чтобы открыть базу знаний, пригласите <span className="font-bold text-white">1 друга</span> по вашей персональной реферальной ссылке.
          </div>
        </div>

        {/* Referral Link Box */}
        <div className="flex flex-col gap-1 text-left">
          <span className="text-[9px] text-neutral-400 uppercase">Ваша персональная ссылка:</span>
          <div className="p-2 bg-neutral-950 border border-white/25 text-[10px] text-neutral-300 truncate font-mono">
            {referralLink}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-1">
          <button
            onClick={handleShare}
            className="w-full py-3 bg-white text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-white active:bg-neutral-200 cursor-pointer hover:bg-neutral-100 transition-all"
          >
            <Share2 className="w-4 h-4 text-black" />
            <span>ОТПРАВИТЬ ПРИГЛАШЕНИЕ ДРУГУ</span>
          </button>

          <button
            onClick={handleCopy}
            className="w-full py-2.5 bg-neutral-950 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-white/30 hover:border-white transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>[ ССЫЛКА СКОПИРОВАНА ]</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>СКОПИРОВАТЬ ССЫЛКУ</span>
              </>
            )}
          </button>

          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              onClick={() => {
                haptic.selection();
                onGoToGlossary();
              }}
              className="py-2 bg-black text-white font-bold text-[10px] uppercase tracking-wider border border-white/20 hover:border-white text-center cursor-pointer flex items-center justify-center gap-1"
            >
              <span>В СЛОВАРЬ</span>
              <ArrowRight className="w-3 h-3" />
            </button>

            <button
              onClick={() => {
                haptic.selection();
                onClose();
              }}
              className="py-2 bg-black text-neutral-400 hover:text-white font-bold text-[10px] uppercase tracking-wider border border-white/10 hover:border-white/30 text-center cursor-pointer"
            >
              ПРОДОЛЖИТЬ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
