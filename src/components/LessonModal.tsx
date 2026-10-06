import React, { useState } from 'react';
import type { Lesson, StepType } from '../types';
import { TradingChart } from './TradingChart';
import {
  X,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Brain,
  TrendingUp,
  Award,
  Zap,
  Shield,
  Heart,
  Plus,
  Bookmark,
  Check,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Sliders,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { haptic } from '../services/telegram';

interface LessonModalProps {
  lesson: Lesson;
  lives: number;
  userXp: number;
  isSavedInNotes?: boolean;
  onClose: () => void;
  onComplete: (score: number, stars: number) => void;
  onLifeLost: () => void;
  onBuyLives: (amount: number, xpCost: number) => void;
  onToggleSaveNote?: (lessonId: string) => void;
}

export const LessonModal: React.FC<LessonModalProps> = ({
  lesson,
  lives,
  userXp,
  isSavedInNotes = false,
  onClose,
  onComplete,
  onLifeLost,
  onBuyLives,
  onToggleSaveNote,
}) => {
  const [currentStep, setCurrentStep] = useState<StepType>('theory');
  const [theorySubTab, setTheorySubTab] = useState<'theory' | 'schema' | 'checklist' | 'math'>('theory');
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [showNoLivesModal, setShowNoLivesModal] = useState(false);
  const [savedLocally, setSavedLocally] = useState(isSavedInNotes);

  const totalQuizCount = lesson.quiz.length;

  const progressPercent =
    currentStep === 'theory'
      ? 20
      : currentStep === 'quiz'
      ? 20 + ((currentQuizIdx + 1) / (totalQuizCount + 1)) * 60
      : currentStep === 'practice'
      ? 90
      : 100;

  const triggerConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#FFFFFF', '#888888', '#CCCCCC'],
    });
  };

  const handleCheckQuiz = () => {
    if (selectedQuizOption === null) return;

    const activeQuestion = lesson.quiz[currentQuizIdx];
    const correct = selectedQuizOption === activeQuestion.correctIndex;

    setIsCorrect(correct);
    setIsAnswerChecked(true);

    if (correct) {
      haptic.success();
    } else {
      haptic.error();
      onLifeLost();
      if (lives <= 1) {
        setTimeout(() => {
          setShowNoLivesModal(true);
        }, 500);
      }
    }
  };

  const handleNextQuiz = () => {
    if (currentQuizIdx + 1 < totalQuizCount) {
      setCurrentQuizIdx((prev) => prev + 1);
      setSelectedQuizOption(null);
      setIsAnswerChecked(false);
    } else {
      setCurrentStep('practice');
      setSelectedQuizOption(null);
      setIsAnswerChecked(false);
      haptic.medium();
    }
  };

  const handlePracticeSuccess = () => {
    haptic.success();
    triggerConfetti();
    setIsFinished(true);
  };

  const handlePracticeError = () => {
    onLifeLost();
    if (lives <= 1) {
      setTimeout(() => {
        setShowNoLivesModal(true);
      }, 500);
    }
  };

  const handleFinishLesson = () => {
    onComplete(100, 3);
  };

  const handleBuySingle = () => {
    if (userXp >= 50) {
      onBuyLives(1, 50);
      setShowNoLivesModal(false);
    }
  };

  const handleBuyFull = () => {
    if (userXp >= 150) {
      onBuyLives(5, 150);
      setShowNoLivesModal(false);
    }
  };

  const handleSaveNote = () => {
    haptic.medium();
    setSavedLocally(!savedLocally);
    onToggleSaveNote?.(lesson.id);
  };

  const renderSchemaGraphic = (schemaType?: string) => {
    switch (schemaType) {
      case 'candlestick':
      case 'pinbar':
        return (
          <div className="p-3 bg-neutral-950 border border-white/20 flex flex-col gap-2 font-mono text-[10px]">
            <div className="flex justify-between items-center border-b border-white/10 pb-1">
              <span className="text-white font-bold">СХЕМА: СВЕЧНОЙ ПАТТЕРН & ОТКУП</span>
              <span className="text-[#00C076] font-bold">BULLISH REJECTION</span>
            </div>
            <div className="flex items-center justify-around py-3">
              <div className="flex flex-col items-center gap-1">
                <svg width="40" height="70" viewBox="0 0 40 70">
                  <line x1="20" y1="5" x2="20" y2="65" stroke="#FFFFFF" strokeWidth="2" />
                  <rect x="10" y="10" width="20" height="15" fill="#00C076" stroke="#FFFFFF" strokeWidth="1" />
                </svg>
                <span className="text-[9px] text-[#00C076] font-bold">ПИН-БАР (LONG)</span>
                <span className="text-[8px] text-neutral-400">Тень откупа 75%</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <svg width="40" height="70" viewBox="0 0 40 70">
                  <line x1="20" y1="5" x2="20" y2="65" stroke="#FFFFFF" strokeWidth="2" />
                  <rect x="10" y="45" width="20" height="15" fill="#FF3B30" stroke="#FFFFFF" strokeWidth="1" />
                </svg>
                <span className="text-[9px] text-[#FF3B30] font-bold">ПАДАЮЩАЯ ЗВЕЗДА</span>
                <span className="text-[8px] text-neutral-400">Тень давления 75%</span>
              </div>
            </div>
            <span className="text-[9px] text-neutral-400">
              • Стоп-лосс выносится за противоположный кончик тени (+0.2% фильтр).
            </span>
          </div>
        );

      case 'support_resistance':
      case 'breakout':
        return (
          <div className="p-3 bg-neutral-950 border border-white/20 flex flex-col gap-2 font-mono text-[10px]">
            <div className="flex justify-between items-center border-b border-white/10 pb-1">
              <span className="text-white font-bold">СХЕМА: КЛЮЧЕВОЙ УРОВЕНЬ & ЗЕРКАЛО</span>
              <span className="text-white font-bold">FLIP LEVEL</span>
            </div>
            <div className="py-2 flex flex-col gap-2">
              <div className="flex items-center justify-between text-[#FF3B30] text-[9px]">
                <span>СОПРОТИВЛЕНИЕ (SELL ZONE)</span>
                <span>$68,000</span>
              </div>
              <div className="w-full h-0.5 bg-white" />
              <div className="flex items-center justify-between text-neutral-400 text-[9px] italic">
                <span>[ ИСТИННЫЙ ПРОБОЙ С ЗАКРЕПЛЕНИЕМ И РЕТЕСТОМ ]</span>
                <span className="text-white font-bold">BUY ON RETEST</span>
              </div>
              <div className="w-full h-0.5 bg-dashed border-t border-dashed border-white/40" />
              <div className="flex items-center justify-between text-[#00C076] text-[9px]">
                <span>ПОДДЕРЖКА (BUY ZONE)</span>
                <span>$65,000</span>
              </div>
            </div>
          </div>
        );

      case 'risk_reward':
        return (
          <div className="p-3 bg-neutral-950 border border-white/20 flex flex-col gap-2 font-mono text-[10px]">
            <div className="flex justify-between items-center border-b border-white/10 pb-1">
              <span className="text-white font-bold">МАТЕМАТИКА МАТОЖИДАНИЯ: 1 : 3 R:R</span>
              <span className="text-[#00C076] font-bold">PROFIT 3R</span>
            </div>
            <div className="flex flex-col gap-1 py-1">
              <div className="w-full h-4 bg-neutral-900 border border-white/20 flex text-[8px]">
                <div className="w-1/4 bg-[#FF3B30] h-full flex items-center justify-center text-black font-bold">
                  SL: 1R ($50)
                </div>
                <div className="w-3/4 bg-[#00C076] h-full flex items-center justify-center text-black font-bold">
                  TP: 3R ($150)
                </div>
              </div>
              <span className="text-[9px] text-neutral-400">
                При винрейте 40% (4 победы / 6 убытков): +$600 профита - $300 убытков = <b className="text-white">+$300 ЧИСТЫМИ</b>.
              </span>
            </div>
          </div>
        );

      case 'orderbook':
      case 'fvg_liquidity':
        return (
          <div className="p-3 bg-neutral-950 border border-white/20 flex flex-col gap-2 font-mono text-[10px]">
            <div className="flex justify-between items-center border-b border-white/10 pb-1">
              <span className="text-white font-bold">СТАКАН И ЗОНА ЛИКВИДНОСТИ (FVG)</span>
              <span className="text-white font-bold">INSTITUTIONAL FLOW</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[8px]">
              <div className="p-1.5 bg-black border border-[#FF3B30]/30 text-[#FF3B30] flex flex-col">
                <span className="font-bold border-b border-white/10 pb-0.5">ЛИКВИДНОСТЬ ПРОДАЖ (ASKS)</span>
                <span>$67,800 // СТОПЫ ШОРТИСТОВ</span>
                <span>$67,500 // ПЛОТНОСТЬ 4.5 BTC</span>
              </div>
              <div className="p-1.5 bg-black border border-[#00C076]/30 text-[#00C076] flex flex-col">
                <span className="font-bold border-b border-white/10 pb-0.5">ЛИКВИДНОСТЬ ПОКУПОК (BIDS)</span>
                <span>$66,500 // СТОПЫ ЛОНГИСТОВ</span>
                <span>$66,200 // ПЛОТНОСТЬ 6.1 BTC</span>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-3 bg-neutral-950 border border-white/20 flex flex-col gap-1.5 font-mono text-[10px]">
            <div className="flex justify-between items-center text-white font-bold">
              <span>ГРАФИЧЕСКИЙ СТАНДАРТ ТОРГОВЛИ</span>
              <span className="text-white">[ SPEC. 2026 ]</span>
            </div>
            <p className="text-[9px] text-neutral-400 font-sans">
              Соблюдайте правила входа: подтверждение структуры, расчет объема позиции и жесткий стоп-лосс.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between overflow-hidden animate-fadeIn select-none font-sans text-white">
      {/* Top Header */}
      <div className="px-3 py-2.5 border-b border-white/15 bg-black flex items-center justify-between gap-3">
        <button
          onClick={onClose}
          className="w-8 h-8 bg-neutral-950 border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Progress Bar */}
        <div className="flex-1 h-1.5 bg-neutral-950 border border-white/20 overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-200"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Lives Counter & Step Indicator */}
        <div className="flex items-center gap-1.5 font-mono text-[10px]">
          <div className="flex items-center gap-1 px-1.5 py-0.5 border border-white/20 bg-neutral-950 text-white font-bold">
            <Heart className="w-2.5 h-2.5 fill-white text-white" />
            <span>{lives}</span>
          </div>

          <div className="px-1.5 py-0.5 border border-white/20 bg-neutral-950 uppercase tracking-wider text-neutral-300">
            <span>
              {currentStep === 'theory'
                ? '[ ТЕОРИЯ ]'
                : currentStep === 'quiz'
                ? `[ ТЕСТ ${currentQuizIdx + 1}/${totalQuizCount} ]`
                : '[ ПРАКТИКА ]'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col items-center">
        {/* STEP 1: DEEP THEORY */}
        {currentStep === 'theory' && (
          <div className="w-full max-w-md flex flex-col gap-4 animate-fadeIn pb-6">
            {/* Header & Save Note button */}
            <div className="flex items-start justify-between gap-2 border-b border-white/15 pb-2">
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                  {lesson.theory.badge}
                </span>
                <h1 className="text-base font-black uppercase tracking-wide text-white leading-snug">
                  {lesson.title}
                </h1>
              </div>

              <button
                onClick={handleSaveNote}
                className={`p-2 border font-mono text-[10px] uppercase flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                  savedLocally
                    ? 'bg-white text-black border-white font-black'
                    : 'bg-neutral-950 text-neutral-400 border-white/20 hover:border-white hover:text-white'
                }`}
                title="Сохранить в конспект"
              >
                {savedLocally ? <Check className="w-3 h-3 text-black stroke-[3]" /> : <Bookmark className="w-3 h-3" />}
                <span>{savedLocally ? 'В КОНСПЕКТЕ' : 'В КОНСПЕКТ'}</span>
              </button>
            </div>

            {/* Theory Navigation Tabs */}
            <div className="grid grid-cols-4 gap-1 font-mono text-[9px]">
              {[
                { id: 'theory', label: '1. ТЕОРИЯ' },
                { id: 'schema', label: '2. СХЕМА' },
                { id: 'checklist', label: '3. ЧЕК-ЛИСТ' },
                { id: 'math', label: '4. РАСЧЕТ' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    haptic.selection();
                    setTheorySubTab(tab.id as any);
                  }}
                  className={`py-1.5 border font-bold uppercase transition-all cursor-pointer text-center ${
                    theorySubTab === tab.id
                      ? 'bg-white text-black border-white'
                      : 'bg-neutral-950 text-neutral-400 border-white/15 hover:border-white hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* SUB-TAB 1: Theory Points & Market Case */}
            {theorySubTab === 'theory' && (
              <div className="flex flex-col gap-3 animate-fadeIn">
                {/* Intro Market Case */}
                {lesson.theory.introCase && (
                  <div className="p-3.5 bg-neutral-950 border-2 border-white flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 text-white font-mono text-[10px] font-bold">
                      <span className="w-2 h-2 bg-white inline-block" />
                      <span>РЕАЛЬНЫЙ РЫНОЧНЫЙ КЕЙС:</span>
                    </div>
                    <p className="text-xs text-neutral-200 font-sans leading-relaxed">
                      {lesson.theory.introCase.situation}
                    </p>
                    <div className="p-2 bg-black border-l-2 border-white font-mono text-[11px] text-white">
                      ВЫВОД: {lesson.theory.introCase.takeaway}
                    </div>
                  </div>
                )}

                {/* 4 Deep Points */}
                {lesson.theory.points.map((pt, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-neutral-950 border border-white/15 flex flex-col gap-1.5"
                  >
                    <h3 className="font-mono text-xs font-black uppercase text-white flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-white shrink-0" />
                      {pt.headline}
                    </h3>
                    <p className="text-xs text-neutral-300 leading-relaxed font-sans">{pt.text}</p>
                    {pt.highlight && (
                      <div className="mt-1 p-2 bg-black border-l-2 border-white text-white text-[11px] font-mono leading-snug">
                        ПРАВИЛО: {pt.highlight}
                      </div>
                    )}
                  </div>
                ))}

                {/* Author Quote */}
                {lesson.theory.authorQuote && (
                  <div className="p-3 bg-neutral-950 border border-white/15 border-l-2 border-l-white font-mono text-[11px] text-neutral-300 italic">
                    {lesson.theory.authorQuote}
                  </div>
                )}
              </div>
            )}

            {/* SUB-TAB 2: Visual Graphic Schemas */}
            {theorySubTab === 'schema' && (
              <div className="flex flex-col gap-3 animate-fadeIn">
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[10px] text-neutral-400 uppercase">
                    ГРАФИЧЕСКИЙ РАЗБОР СЕТАПА
                  </span>
                  <h3 className="text-sm font-black uppercase text-white">
                    {lesson.theory.schemaVisual?.title || 'Анатомия сетапа'}
                  </h3>
                </div>

                {renderSchemaGraphic(lesson.theory.schemaVisual?.type)}

                <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                  {lesson.theory.schemaVisual?.caption ||
                    'Внимательно изучите геометрические пропорции и расположение зон стоп-лосса перед входом в сделку.'}
                </p>
              </div>
            )}

            {/* SUB-TAB 3: Step-by-Step 4-Step Checklist */}
            {theorySubTab === 'checklist' && (
              <div className="flex flex-col gap-3 animate-fadeIn">
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[10px] text-neutral-400 uppercase">
                    ПОШАГОВЫЙ АЛГОРИТМ ТРЕЙДЕРА
                  </span>
                  <h3 className="text-sm font-black uppercase text-white">
                    Чек-лист исполнения сделки
                  </h3>
                </div>

                <div className="flex flex-col gap-2">
                  {(lesson.theory.checklist || [
                    'Шаг 1: Определение тренда HTF D1/H4',
                    'Шаг 2: Разметка ключевой зоны интереса POI',
                    'Шаг 3: Подтверждение свечным паттерном с объемом',
                    'Шаг 4: Расчет риска 1% и R:R минимум 1 к 3',
                  ]).map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-neutral-950 border border-white/20 flex items-start gap-2.5 font-mono text-xs"
                    >
                      <span className="bg-white text-black font-black px-1.5 py-0.5 text-[10px] shrink-0">
                        0{idx + 1}
                      </span>
                      <span className="text-neutral-200 leading-snug">{item}</span>
                    </div>
                  ))}
                </div>

                {lesson.theory.proTip && (
                  <div className="p-3 bg-black border border-white/20 text-xs font-mono text-neutral-300">
                    СОВЕТ PRO: {lesson.theory.proTip}
                  </div>
                )}
              </div>
            )}

            {/* SUB-TAB 4: Risk Math & Formulas */}
            {theorySubTab === 'math' && (
              <div className="flex flex-col gap-3 animate-fadeIn font-mono">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-neutral-400 uppercase">
                    МАТЕМАТИКА И РАСЧЕТ РИСКА
                  </span>
                  <h3 className="text-sm font-black uppercase text-white">
                    Формула расчета объема ордера
                  </h3>
                </div>

                <div className="p-3.5 bg-neutral-950 border border-white/25 flex flex-col gap-2">
                  <span className="text-[10px] text-neutral-400 uppercase">БАЗОВАЯ ФОРМУЛА:</span>
                  <div className="p-2.5 bg-black border border-white text-white font-black text-xs">
                    {lesson.theory.riskFormula?.formula ||
                      'Объем позиции ($) = (Депозит × Риск %) / Дистанция до стопа %'}
                  </div>
                </div>

                <div className="p-3.5 bg-neutral-950 border border-white/15 flex flex-col gap-1.5">
                  <span className="text-[10px] text-neutral-400 uppercase">ПРАКТИЧЕСКИЙ ПРИМЕР:</span>
                  <p className="text-xs text-neutral-200 font-sans leading-relaxed">
                    {lesson.theory.riskFormula?.example ||
                      'При депозите $2,000, риске 1% ($20) и стопе 1.5% объем ордера = $20 / 0.015 = $1,333.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: 10-QUESTION TEST */}
        {currentStep === 'quiz' && (
          <div className="w-full max-w-md flex flex-col gap-4 animate-fadeIn pb-6">
            <div className="flex items-center justify-between font-mono text-[10px] text-neutral-400 border-b border-white/15 pb-1.5">
              <span>
                ВОПРОС {currentQuizIdx + 1} ИЗ {totalQuizCount}
              </span>
              <span className="bg-white text-black px-1.5 py-0.5 font-bold">
                ЭКЗАМЕН // 10 ЗАДАЧ
              </span>
            </div>

            <h2 className="text-sm font-black uppercase tracking-wide text-white leading-snug">
              {lesson.quiz[currentQuizIdx].question}
            </h2>

            {/* Options */}
            <div className="flex flex-col gap-2 font-mono text-xs">
              {lesson.quiz[currentQuizIdx].options.map((opt, oIdx) => {
                const isSelected = selectedQuizOption === oIdx;
                const isCorrectOption = oIdx === lesson.quiz[currentQuizIdx].correctIndex;

                let btnStyles = 'bg-black border-white/20 text-white hover:border-white';

                if (isSelected && !isAnswerChecked) {
                  btnStyles = 'bg-white text-black border-white font-bold';
                } else if (isAnswerChecked) {
                  if (isCorrectOption) {
                    btnStyles = 'bg-white text-black border-white font-bold';
                  } else if (isSelected && !isCorrectOption) {
                    btnStyles = 'bg-neutral-900 text-neutral-500 border-neutral-700 line-through';
                  }
                }

                return (
                  <button
                    key={oIdx}
                    onClick={() => {
                      if (!isAnswerChecked) {
                        setSelectedQuizOption(oIdx);
                        haptic.selection();
                      }
                    }}
                    className={`p-3 border text-left leading-relaxed transition-all flex items-center justify-between cursor-pointer ${btnStyles}`}
                  >
                    <span>
                      [ 0{oIdx + 1} ] {opt}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Explanation Feedback */}
            {isAnswerChecked && (
              <div
                className={`p-3 border text-xs font-mono leading-relaxed animate-fadeIn ${
                  isCorrect
                    ? 'bg-neutral-950 border-white text-white'
                    : 'bg-neutral-950 border-neutral-700 text-neutral-400'
                }`}
              >
                <div className="font-bold uppercase mb-1">
                  {isCorrect ? '[ СТАТУС: ВЕРНО ]' : '[ СТАТУС: ОШИБКА // СПИСАНА 1 ЖИЗНЬ ]'}
                </div>
                <p className="font-sans text-[11px] text-neutral-300">
                  {lesson.quiz[currentQuizIdx].explanation}
                </p>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: PRACTICE TERMINAL */}
        {currentStep === 'practice' && !isFinished && (
          <div className="w-full max-w-md flex flex-col h-full gap-2.5 animate-fadeIn">
            <div className="p-3 bg-neutral-950 border border-white/20 font-mono">
              <span className="text-[10px] font-black uppercase text-black bg-white px-1.5 py-0.5">
                ПРАКТИЧЕСКИЙ ТРЕНАЖЕР
              </span>
              <p className="text-xs font-bold text-white mt-1.5 leading-snug font-sans">
                {lesson.practice.instruction}
              </p>
              <p className="text-[10px] text-neutral-400 mt-1 font-mono">
                ПОДСКАЗКА: {lesson.practice.hint}
              </p>
            </div>

            {/* Chart Container */}
            <div className="flex-1 w-full min-h-[340px]">
              <TradingChart
                candles={lesson.practice.initialCandles}
                futureCandles={lesson.practice.futureCandles}
                actionType={lesson.practice.actionType}
                targetCandleIndex={lesson.practice.targetCandleIndex}
                targetLevelPrice={lesson.practice.targetLevelPrice}
                tolerancePercent={lesson.practice.tolerancePercent}
                expectedDirection={lesson.practice.expectedDirection}
                onSuccess={handlePracticeSuccess}
                onError={handlePracticeError}
              />
            </div>
          </div>
        )}

        {/* STEP 4: VICTORY SCREEN */}
        {isFinished && (
          <div className="w-full max-w-md flex flex-col items-center justify-center h-full py-8 text-center animate-fadeIn gap-5 font-mono">
            <div className="w-16 h-16 bg-white text-black border-2 border-white flex items-center justify-center font-black text-2xl">
              OK
            </div>

            <div>
              <span className="text-[10px] uppercase text-neutral-400 tracking-widest block">
                СТАТУС: УРОК И 10 ТЕСТОВ СДАНЫ
              </span>
              <h2 className="text-base font-black uppercase text-white mt-1">Квалификация подтверждена</h2>
              <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto leading-relaxed font-sans">
                Все 10 экзаменационных вопросов и практический сценарий успешно отработаны.
              </p>
            </div>

            {/* Rewards */}
            <div className="flex gap-2 w-full justify-center">
              <div className="flex items-center gap-2 px-4 py-2 bg-neutral-950 border border-white/20">
                <span className="text-[10px] text-neutral-400">XP НАГРАДА:</span>
                <span className="text-sm font-black text-white">+{lesson.xpReward}</span>
              </div>

              <div className="flex items-center gap-2 px-4 py-2 bg-neutral-950 border border-white/20">
                <span className="text-[10px] text-neutral-400">БАЛЛЫ:</span>
                <span className="text-sm font-black text-white">+{lesson.coinReward}</span>
              </div>
            </div>

            <button
              onClick={handleFinishLesson}
              className="w-full py-3 bg-white text-black font-black text-xs uppercase tracking-wider mt-4 cursor-pointer hover:bg-neutral-200 transition-colors"
            >
              [ ПЕРЕЙТИ К СЛЕДУЮЩЕМУ УРОКУ ]
            </button>
          </div>
        )}
      </div>

      {/* Out of Lives Modal during Quiz / Practice */}
      {showNoLivesModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-black border border-white/30 p-5 flex flex-col items-center text-center gap-3.5 font-mono">
            <div className="w-12 h-12 bg-neutral-950 border border-white/20 flex items-center justify-center text-white">
              <Heart className="w-6 h-6 fill-white text-white" />
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-black uppercase text-white">ЛИМИТ ПОПЫТОК ИСЧЕРПАН</h3>
              <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                Пополните запас жизней за накопленные очки XP, чтобы продолжить тест прямо сейчас:
              </p>
            </div>

            <div className="w-full flex flex-col gap-2 pt-1">
              <button
                onClick={handleBuySingle}
                disabled={userXp < 50}
                className={`w-full py-2.5 font-black text-[11px] uppercase tracking-wider border flex items-center justify-between px-3 ${
                  userXp >= 50
                    ? 'bg-white text-black border-white hover:bg-neutral-200 cursor-pointer'
                    : 'bg-neutral-950 text-neutral-600 border-white/10 cursor-not-allowed'
                }`}
              >
                <span>+1 ЖИЗНЬ</span>
                <span>[ 50 XP ]</span>
              </button>

              <button
                onClick={handleBuyFull}
                disabled={userXp < 150}
                className={`w-full py-2.5 font-black text-[11px] uppercase tracking-wider border flex items-center justify-between px-3 ${
                  userXp >= 150
                    ? 'bg-white text-black border-white hover:bg-neutral-200 cursor-pointer'
                    : 'bg-neutral-950 text-neutral-600 border-white/10 cursor-not-allowed'
                }`}
              >
                <span>ПОЛНЫЙ РЕЗЕРВ (5/5)</span>
                <span>[ 150 XP ]</span>
              </button>

              <button
                onClick={() => {
                  setShowNoLivesModal(false);
                  onClose();
                }}
                className="w-full py-2 bg-neutral-950 border border-white/20 text-neutral-400 font-bold text-[10px] uppercase tracking-wider hover:text-white transition-colors cursor-pointer mt-1"
              >
                [ ВЫЙТИ ИЗ УРОКА ]
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Footer Button */}
      {!isFinished && currentStep !== 'practice' && !showNoLivesModal && (
        <div className="p-3 bg-black border-t border-white/15 max-w-md mx-auto w-full font-mono">
          {currentStep === 'theory' && (
            <button
              onClick={() => {
                setCurrentStep('quiz');
                haptic.medium();
              }}
              className="w-full py-3 bg-white text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer hover:bg-neutral-200 transition-colors"
            >
              <span>[ ПЕРЕЙТИ К ЭКЗАМЕНУ (10 ВОПРОСОВ) ]</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {currentStep === 'quiz' && (
            <div>
              {!isAnswerChecked ? (
                <button
                  onClick={handleCheckQuiz}
                  disabled={selectedQuizOption === null}
                  className={`w-full py-3 font-black text-xs uppercase tracking-wider transition-all ${
                    selectedQuizOption !== null
                      ? 'bg-white text-black cursor-pointer hover:bg-neutral-200'
                      : 'bg-neutral-950 text-neutral-600 border border-white/10 cursor-not-allowed'
                  }`}
                >
                  [ ПРОВЕРИТЬ ОТВЕТ ]
                </button>
              ) : (
                <button
                  onClick={handleNextQuiz}
                  className="w-full py-3 bg-white text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer hover:bg-neutral-200 transition-colors"
                >
                  <span>
                    {currentQuizIdx + 1 < totalQuizCount
                      ? `[ СЛЕДУЮЩИЙ ВОПРОС (${currentQuizIdx + 2}/${totalQuizCount}) ]`
                      : '[ ОТКРЫТЬ ПРАКТИЧЕСКИЙ ГРАФИК ]'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
