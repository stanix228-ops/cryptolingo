import React, { useState } from 'react';
import { Search, Lock, Copy, Check, Share2, BookOpen, ExternalLink, RefreshCw, BarChart2, TrendingUp, ArrowUpRight, ArrowDownRight, Shield, Activity, Sliders } from 'lucide-react';
import { GLOSSARY_TERMS, GLOSSARY_CATEGORIES } from '../data/glossary';
import type { UserProgress } from '../types';
import { haptic, getTelegramWebApp, openTelegramLink, shareToTelegram, copyText } from '../services/telegram';

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
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const tg = getTelegramWebApp();
  const userId = tg?.initDataUnsafe?.user?.id || 6511326390;
  const botUsername = 'Cryptolingobot';
  const referralLink = `https://t.me/${botUsername}?start=ref_${userId}`;

  const isUnlocked = Boolean(progress.isGlossaryUnlocked || (progress.referralCount && progress.referralCount >= 1));

  const handleCopyLink = async () => {
    haptic.medium();
    const success = await copyText(referralLink);
    if (success) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleShareTelegram = () => {
    haptic.heavy();
    const shareText = 'Практическое обучение торговле криптовалютой на реальных графиках TradingView в CryptoLingo Pro:';
    shareToTelegram(referralLink, shareText);
  };

  const handleCheckReferrals = async () => {
    haptic.medium();
    setIsSyncing(true);
    setSyncMessage(null);

    try {
      const res = await fetch(`/api/referral?userId=${userId}`);
      const data = await res.json();

      if (data && data.ok) {
        if (data.referralCount >= 1 || data.unlocked) {
          haptic.success();
          onUnlockGlossary();
          setSyncMessage(`[ УСПЕХ: Найдено ${data.referralCount} рефералов. Доступ открыт! ]`);
        } else {
          haptic.warning();
          setSyncMessage('[ СТАТУС: 0 рефералов. Друг должен нажать START в боте по вашей ссылке ]');
        }
      } else {
        setSyncMessage('[ Ошибка синхронизации с облаком Telegram ]');
      }
    } catch (err) {
      console.error('Sync error', err);
      setSyncMessage('[ Ошибка сетевого запроса к серверу ]');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCopyTerm = async (termId: string, text: string) => {
    haptic.selection();
    await copyText(text);
    setCopiedTermId(termId);
    setTimeout(() => setCopiedTermId(null), 2000);
  };

  const renderTermDiagram = (id: string) => {
    switch (id) {
      case 'candlestick':
      case 'pin-bar':
      case 'shadow-wick':
        return (
          <div className="mt-2 p-2.5 bg-neutral-950 border border-white/15 flex items-center justify-between gap-4 font-mono text-[9px]">
            <div className="flex items-center gap-3">
              {/* Bullish Pinbar SVG */}
              <svg width="44" height="52" viewBox="0 0 44 52" className="shrink-0">
                <line x1="22" y1="4" x2="22" y2="48" stroke="#FFFFFF" strokeWidth="1.5" />
                <rect x="14" y="8" width="16" height="12" fill="#00C076" stroke="#FFFFFF" strokeWidth="1" />
                <circle cx="22" cy="4" r="2" fill="#FFFFFF" />
              </svg>
              <div className="flex flex-col text-neutral-400">
                <span className="text-white font-bold">[ СХЕМА: ПИН-БАР ]</span>
                <span>• Длинная нижняя тень (откуп)</span>
                <span>• Малое тело свечи наверху</span>
              </div>
            </div>
            <span className="text-[#00C076] font-bold border border-[#00C076]/40 px-1 py-0.5">
              СИГНАЛ ВВЕРХ
            </span>
          </div>
        );

      case 'long-short':
        return (
          <div className="mt-2 p-2.5 bg-neutral-950 border border-white/15 grid grid-cols-2 gap-2 font-mono text-[9px]">
            <div className="p-2 border border-[#00C076]/30 bg-black flex flex-col gap-1">
              <div className="flex items-center gap-1 text-[#00C076] font-bold">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>LONG (ЛОНГ)</span>
              </div>
              <span className="text-neutral-400">Покупка актива. Профит при росте цены выше входа.</span>
            </div>
            <div className="p-2 border border-[#FF3B30]/30 bg-black flex flex-col gap-1">
              <div className="flex items-center gap-1 text-[#FF3B30] font-bold">
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span>SHORT (ШОРТ)</span>
              </div>
              <span className="text-neutral-400">Продажа актива. Профит при падении котировок.</span>
            </div>
          </div>
        );

      case 'support-resistance':
      case 'support-level':
      case 'resistance-level':
        return (
          <div className="mt-2 p-2 bg-neutral-950 border border-white/15 flex flex-col gap-1.5 font-mono text-[9px]">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[#FF3B30] font-bold">─ СОПРОТИВЛЕНИЕ (УРОВЕНЬ ПРОДАВЦОВ) ─</span>
              <span className="text-white">SELL ZONE</span>
            </div>
            <div className="w-full h-4 border-y border-dashed border-white/20 flex items-center justify-center text-[8px] text-neutral-500">
              [ ЦЕНОВОЙ ДИАПАЗОН / КАНАЛ ]
            </div>
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[#00C076] font-bold">─ ПОДДЕРЖКА (УРОВЕНЬ ПОКУПАТЕЛЕЙ) ─</span>
              <span className="text-white">BUY ZONE</span>
            </div>
          </div>
        );

      case 'risk-reward':
        return (
          <div className="mt-2 p-2 bg-neutral-950 border border-white/15 flex flex-col gap-1 font-mono text-[9px]">
            <div className="flex justify-between items-center text-white font-bold">
              <span>СТАНДАРТ РИСКА 1 : 3</span>
              <span className="text-[#00C076]">TP: +$300 (3R)</span>
            </div>
            <div className="w-full h-3 bg-neutral-900 border border-white/10 flex">
              <div className="w-1/4 bg-[#FF3B30] h-full flex items-center justify-center text-[7px] text-black font-bold">
                SL 1R
              </div>
              <div className="w-3/4 bg-[#00C076] h-full flex items-center justify-center text-[7px] text-black font-bold">
                PROFIT 3R
              </div>
            </div>
            <span className="text-neutral-400 text-[8px]">
              При риске $100 в сделке потенциальная цель составляет +$300 чистой прибыли.
            </span>
          </div>
        );

      case 'orderbook':
        return (
          <div className="mt-2 p-2 bg-neutral-950 border border-white/15 grid grid-cols-2 gap-2 font-mono text-[8px]">
            <div className="border-r border-white/10 pr-2 flex flex-col text-[#FF3B30]">
              <span className="font-bold border-b border-white/10 pb-0.5 mb-0.5">ASKS (ПРОДАЖА)</span>
              <span>$67,500 ── 2.4 BTC</span>
              <span>$67,480 ── 1.1 BTC</span>
            </div>
            <div className="pl-1 flex flex-col text-[#00C076]">
              <span className="font-bold border-b border-white/10 pb-0.5 mb-0.5">BIDS (ПОКУПКА)</span>
              <span>$67,420 ── 3.8 BTC</span>
              <span>$67,400 ── 5.0 BTC</span>
            </div>
          </div>
        );

      default:
        return null;
    }
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
          <p className="text-xs text-neutral-300 font-sans mt-1 leading-relaxed">
            Терминологическая база, биржевой сленг и наглядные графические схемы.
          </p>
        </div>
      </div>

      {/* LOCKED STATE */}
      {!isUnlocked ? (
        <div className="p-5 bg-black border border-white/30 flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 bg-neutral-950 border border-white/20 flex items-center justify-center text-white">
            <Lock className="w-5 h-5" />
          </div>

          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-black uppercase tracking-wide text-white">
              РАЗДЕЛ ЗАБЛОКИРОВАН
            </h2>
            <p className="text-xs text-neutral-400 font-sans max-w-xs leading-relaxed">
              Для разблокировки полного словаря пригласите 1 друга по персональной реферальной ссылке.
            </p>
          </div>

          {syncMessage && (
            <div className="w-full p-2.5 bg-neutral-950 border border-white/20 text-white font-mono text-[11px] animate-fadeIn">
              {syncMessage}
            </div>
          )}

          <div className="w-full flex flex-col gap-2 pt-2">
            <button
              onClick={handleCheckReferrals}
              disabled={isSyncing}
              className="w-full py-3 bg-white text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-neutral-200 transition-colors cursor-pointer border border-white"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? '[ ПРОВЕРКА... ]' : '[ ПРОВЕРИТЬ РЕФЕРАЛОВ ]'}</span>
            </button>

            <button
              onClick={handleShareTelegram}
              className="w-full py-2.5 bg-neutral-900 border border-white/20 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>ОТПРАВИТЬ ССЫЛКУ В TELEGRAM</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="w-full py-2 bg-neutral-950 border border-white/10 text-neutral-400 font-mono text-[10px] uppercase hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              {copiedLink ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
              <span>{copiedLink ? 'ССЫЛКА СКОПИРОВАНА' : 'СКОПИРОВАТЬ ССЫЛКУ'}</span>
            </button>
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
              placeholder="Поиск по терминам или сленгу..."
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

          {/* Terms List with Visual SVG Schemas */}
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
                      title="Скопировать"
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

                  {/* Micro Visual SVG Diagram if available */}
                  {renderTermDiagram(t.id)}

                  {t.example && (
                    <div className="p-2 bg-neutral-950 border-l-2 border-white text-[11px] font-mono text-neutral-300">
                      ПРИМЕР: {t.example}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
