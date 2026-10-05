import React, { useState } from 'react';
import { Search, Lock, Unlock, Copy, Check, Share2, BookOpen, ExternalLink } from 'lucide-react';
import { GLOSSARY_TERMS, GLOSSARY_CATEGORIES } from '../data/glossary';
import type { UserProgress } from '../types';
import { haptic, getTelegramWebApp } from '../services/telegram';

interface GlossaryViewProps {
  progress: UserProgress;
  onUnlockGlossary: () => void;
}

export const GlossaryView: React.FC<GlossaryViewProps> = ({
  progress,
  onUnlockGlossary,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedTermId, setCopiedTermId] = useState<string | null>(null);

  const tg = getTelegramWebApp();
  const userId = tg?.initDataUnsafe?.user?.id || 777000;
  const botUsername = 'Cryptolingobot';
  const referralLink = `https://t.me/${botUsername}?start=ref_${userId}`;

  const isUnlocked = Boolean(progress.isGlossaryUnlocked || (progress.referralCount && progress.referralCount >= 1));

  const handleCopyLink = () => {
    haptic.medium();
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareTelegram = () => {
    haptic.heavy();
    const shareText = encodeURIComponent(
      'Практическое обучение торговле криптовалютой на графиках TradingView в CryptoLingo Pro. Присоединяйся:'
    );
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${shareText}`;
    window.open(shareUrl, '_blank');
  };

  const handleCopyTerm = (termId: string, text: string) => {
    haptic.selection();
    navigator.clipboard.writeText(text);
    setCopiedTermId(termId);
    setTimeout(() => setCopiedTermId(null), 2000);
  };

  const filteredTerms = GLOSSARY_TERMS.filter((t) => {
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      t.term.toLowerCase().includes(query) ||
      (t.termEn && t.termEn.toLowerCase().includes(query)) ||
      t.definition.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col max-w-md mx-auto px-3 py-4 pb-28 gap-4 select-none font-sans text-white">
      {/* Top Banner */}
      <div className="p-4 bg-black border border-white/25 flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-white/15 pb-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-white" />
            <span className="font-mono text-[11px] font-bold tracking-widest uppercase text-white">
              CRYPTOLINGO // GLOSSARY
            </span>
          </div>
          <span
            className={`font-mono text-[10px] font-bold px-1.5 py-0.5 ${
              isUnlocked ? 'bg-white text-black' : 'border border-white/30 text-neutral-400'
            }`}
          >
            {isUnlocked ? '[ ACCESS: UNLOCKED ]' : '[ ACCESS: LOCKED ]'}
          </span>
        </div>

        <div>
          <h1 className="text-sm font-black uppercase tracking-wider leading-tight text-white">
            Словарь терминов и Price Action
          </h1>
          <p className="text-[11px] text-neutral-400 font-mono mt-0.5 leading-relaxed">
            Энциклопедия рыночных понятий, биржевых ордеров, смарт-мани и деривативов.
          </p>
        </div>
      </div>

      {/* LOCKED STATE */}
      {!isUnlocked ? (
        <div className="flex flex-col gap-4">
          <div className="p-5 bg-black border border-white/30 flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 border border-white flex items-center justify-center bg-white text-black">
              <Lock className="w-6 h-6 stroke-[2.5]" />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                [ ТРЕБОВАНИЕ РАЗБЛОКИРОВКИ ]
              </span>
              <h2 className="text-base font-black uppercase tracking-wider text-white">
                Пригласите 1 партнера
              </h2>
              <p className="text-xs text-neutral-300 font-mono leading-relaxed max-w-xs mx-auto">
                Полная база из 50+ профессиональных терминов открывается после регистрации 1 друга по вашей реферальной ссылке.
              </p>
            </div>

            {/* Referral Progress Box */}
            <div className="w-full border border-white/20 p-3 bg-neutral-950 flex flex-col gap-2 text-left font-mono">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-neutral-400">СТАТУС РЕФЕРАЛОВ:</span>
                <span className="font-bold text-white">
                  [ {progress.referralCount || 0} / 1 ПРИГЛАШЕН ]
                </span>
              </div>
              <div className="text-xs text-white tracking-tighter">
                [ {progress.referralCount && progress.referralCount >= 1 ? '■■■■■■■■■■' : '□□□□□□□□□□'} ]
              </div>
            </div>

            {/* Referral Link Field */}
            <div className="w-full flex flex-col gap-1 text-left font-mono">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider">
                Ваша персональная ссылка:
              </span>
              <div className="flex items-center border border-white/25 bg-neutral-950 px-2.5 py-2 text-[11px] text-neutral-300 truncate">
                <span className="truncate">{referralLink}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="w-full flex flex-col gap-2 pt-1">
              <button
                onClick={handleCopyLink}
                className="w-full py-3 bg-white text-black font-mono font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-white active:bg-neutral-200 cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>[ ССЫЛКА СКОПИРОВАНА ]</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>СКОПИРОВАТЬ ССЫЛКУ</span>
                  </>
                )}
              </button>

              <button
                onClick={handleShareTelegram}
                className="w-full py-3 bg-black text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-white/30 hover:border-white active:bg-neutral-900 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>ОТПРАВИТЬ ПРИГЛАШЕНИЕ В TELEGRAM</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* UNLOCKED STATE */
        <div className="flex flex-col gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по терминам или понятиям..."
              className="w-full pl-9 pr-4 py-2.5 bg-black border border-white/25 text-white font-mono text-xs placeholder:text-neutral-600 focus:outline-none focus:border-white"
            />
          </div>

          {/* Category Filter Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 font-mono text-[10px] no-scrollbar">
            {GLOSSARY_CATEGORIES.map((cat) => (
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

          {/* Counter */}
          <div className="flex items-center justify-between font-mono text-[10px] text-neutral-400 px-0.5">
            <span>НАЙДЕНО ТЕРМИНОВ: {filteredTerms.length}</span>
            <span className="text-white font-bold">ДОСТУП: ПОЛНЫЙ</span>
          </div>

          {/* Terms List */}
          <div className="flex flex-col gap-2.5">
            {filteredTerms.map((t) => {
              const isCopied = copiedTermId === t.id;
              return (
                <div
                  key={t.id}
                  className="p-3.5 bg-black border border-white/20 flex flex-col gap-2 hover:border-white/50 transition-all"
                >
                  <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-white tracking-wide">{t.term}</h3>
                        <span className="font-mono text-[9px] uppercase px-1 py-0.2 border border-white/20 text-neutral-400 bg-neutral-950">
                          {t.categoryLabel}
                        </span>
                      </div>
                      {t.termEn && (
                        <span className="font-mono text-[10px] text-neutral-400 block mt-0.5">
                          {t.termEn}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() =>
                        handleCopyTerm(t.id, `${t.term} (${t.termEn || ''}) — ${t.definition}`)
                      }
                      title="Скопировать определение"
                      className="p-1 border border-white/15 hover:border-white text-neutral-400 hover:text-white transition-all cursor-pointer shrink-0"
                    >
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-white" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-neutral-200 font-sans leading-relaxed">
                    {t.definition}
                  </p>

                  {t.example && (
                    <div className="border-l-2 border-white/40 pl-2.5 py-0.5 mt-0.5 bg-neutral-950">
                      <span className="font-mono text-[10px] text-neutral-400 block">
                        ПРИМЕР: {t.example}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredTerms.length === 0 && (
              <div className="p-8 text-center border border-white/15 font-mono text-xs text-neutral-500">
                [ НИЧЕГО НЕ НАЙДЕНО ПО ЗАПРОСУ ]
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
