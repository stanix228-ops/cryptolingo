import React, { useState } from 'react';
import type { Lesson, StepType } from '../types';
import { TradingChart } from './TradingChart';
import { X, ArrowRight, CheckCircle2, AlertCircle, BookOpen, Brain, TrendingUp, Award, Zap, Shield, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { haptic } from '../services/telegram';

interface LessonModalProps {
  lesson: Lesson;
  onClose: () => void;
  onComplete: (score: number, stars: number) => void;
  onLifeLost: () => void;
}

export const LessonModal: React.FC<LessonModalProps> = ({
  lesson,
  onClose,
  onComplete,
  onLifeLost,
}) => {
  const [currentStep, setCurrentStep] = useState<StepType>('theory');
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const progressPercent =
    currentStep === 'theory'
      ? 25
      : currentStep === 'quiz'
      ? 25 + ((currentQuizIdx + 1) / (lesson.quiz.length + 1)) * 50
      : currentStep === 'practice'
      ? 85
      : 100;

  const triggerConfetti = () => {
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00C076', '#38BDF8', '#F0B90B', '#FFFFFF'],
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
    }
  };

  const handleNextQuiz = () => {
    if (currentQuizIdx + 1 < lesson.quiz.length) {
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

  const handleFinishLesson = () => {
    onComplete(100, 3);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#06080E] flex flex-col justify-between overflow-hidden animate-fadeIn select-none">
      {/* Top Header Navigation */}
      <div className="px-4 py-3 border-b border-[#1E293B] bg-[#06080E]/95 backdrop-blur-xl flex items-center justify-between gap-3">
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-xl bg-[#0F1420] border border-[#1E293B] flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Progress Bar */}
        <div className="flex-1 h-2 bg-[#0F1420] rounded-full border border-[#1E293B] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#00C076] to-[#38BDF8] rounded-full transition-all duration-300 shadow-sm"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-300 px-3 py-1 rounded-xl bg-[#0F1420] border border-[#1E293B]">
          {currentStep === 'theory' && <BookOpen className="w-3.5 h-3.5 text-[#38BDF8]" />}
          {currentStep === 'quiz' && <Brain className="w-3.5 h-3.5 text-[#F0B90B]" />}
          {currentStep === 'practice' && <TrendingUp className="w-3.5 h-3.5 text-[#00C076]" />}
          <span className="uppercase">{currentStep === 'theory' ? 'Теория' : currentStep === 'quiz' ? 'Тест' : 'Терминал'}</span>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col items-center">
        {/* STEP 1: THEORY */}
        {currentStep === 'theory' && (
          <div className="w-full max-w-md flex flex-col gap-4 animate-fadeIn pb-6">
            {/* Title Badge */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#00C076] bg-[#00C076]/10 px-2.5 py-1 rounded-md w-fit border border-[#00C076]/30">
                {lesson.theory.badge}
              </span>
              <h1 className="text-lg font-black text-white leading-tight">
                {lesson.theory.title}
              </h1>
            </div>

            {/* Theory Points */}
            <div className="flex flex-col gap-3">
              {lesson.theory.points.map((pt, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#0F1420] border border-[#1E293B] shadow-lg flex flex-col gap-2 relative"
                >
                  <h3 className="text-xs font-bold text-slate-100 flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        pt.badgeType === 'bull'
                          ? 'bg-[#00C076]'
                          : pt.badgeType === 'bear'
                          ? 'bg-[#F6465D]'
                          : pt.badgeType === 'warning'
                          ? 'bg-[#F0B90B]'
                          : 'bg-[#38BDF8]'
                      }`}
                    />
                    {pt.headline}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{pt.text}</p>
                  {pt.highlight && (
                    <div className="mt-1 px-3 py-2 rounded-xl bg-[#00C076]/10 border border-[#00C076]/20 text-[#00C076] text-xs font-bold leading-snug">
                      Инсайт: {pt.highlight}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Author Quote */}
            {lesson.theory.authorQuote && (
              <div className="p-4 rounded-2xl bg-[#121725] border-l-2 border-[#F0B90B] text-xs italic text-slate-300">
                {lesson.theory.authorQuote}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: QUIZ */}
        {currentStep === 'quiz' && (
          <div className="w-full max-w-md flex flex-col gap-4 animate-fadeIn pb-6">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-[#F0B90B] bg-[#F0B90B]/10 px-2.5 py-1 rounded-md border border-[#F0B90B]/20">
                Вопрос {currentQuizIdx + 1} из {lesson.quiz.length}
              </span>
            </div>

            <h2 className="text-base font-black text-white leading-snug">
              {lesson.quiz[currentQuizIdx].question}
            </h2>

            {/* Options */}
            <div className="flex flex-col gap-2.5">
              {lesson.quiz[currentQuizIdx].options.map((opt, oIdx) => {
                const isSelected = selectedQuizOption === oIdx;
                const isCorrectOption = oIdx === lesson.quiz[currentQuizIdx].correctIndex;

                let btnStyles = 'bg-[#0F1420] border-[#1E293B] text-slate-200 hover:border-slate-700';

                if (isSelected && !isAnswerChecked) {
                  btnStyles = 'bg-[#38BDF8]/15 border-[#38BDF8] text-[#38BDF8]';
                } else if (isAnswerChecked) {
                  if (isCorrectOption) {
                    btnStyles = 'bg-[#00C076]/15 border-[#00C076] text-[#00C076]';
                  } else if (isSelected && !isCorrectOption) {
                    btnStyles = 'bg-[#F6465D]/15 border-[#F6465D] text-[#F6465D]';
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
                    className={`p-4 rounded-2xl border text-left text-xs font-bold leading-relaxed transition-all flex items-center justify-between cursor-pointer ${btnStyles}`}
                  >
                    <span>{opt}</span>
                    {isAnswerChecked && isCorrectOption && (
                      <CheckCircle2 className="w-4 h-4 text-[#00C076] shrink-0 ml-2" />
                    )}
                    {isAnswerChecked && isSelected && !isCorrectOption && (
                      <AlertCircle className="w-4 h-4 text-[#F6465D] shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation Feedback */}
            {isAnswerChecked && (
              <div
                className={`p-4 rounded-2xl border text-xs leading-relaxed animate-fadeIn ${
                  isCorrect
                    ? 'bg-[#00C076]/10 border-[#00C076]/30 text-emerald-200'
                    : 'bg-[#F6465D]/10 border-[#F6465D]/30 text-rose-200'
                }`}
              >
                <div className="font-mono font-bold mb-1">
                  {isCorrect ? 'РЕЗУЛЬТАТ: ВЕРНО' : 'РЕЗУЛЬТАТ: ОШИБКА'}
                </div>
                {lesson.quiz[currentQuizIdx].explanation}
              </div>
            )}
          </div>
        )}

        {/* STEP 3: PRACTICE TERMINAL */}
        {currentStep === 'practice' && !isFinished && (
          <div className="w-full max-w-md flex flex-col h-full gap-3 animate-fadeIn">
            <div className="p-3 bg-[#0F1420] border border-[#1E293B] rounded-2xl">
              <span className="text-[10px] font-mono font-black uppercase text-[#00C076]">
                БИРЖЕВОЙ ТЕРМИНАЛ
              </span>
              <p className="text-xs font-bold text-white mt-1 leading-snug">
                {lesson.practice.instruction}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Подсказка: {lesson.practice.hint}
              </p>
            </div>

            {/* Chart Container */}
            <div className="flex-1 w-full min-h-[350px]">
              <TradingChart
                candles={lesson.practice.initialCandles}
                futureCandles={lesson.practice.futureCandles}
                actionType={lesson.practice.actionType}
                targetCandleIndex={lesson.practice.targetCandleIndex}
                targetLevelPrice={lesson.practice.targetLevelPrice}
                tolerancePercent={lesson.practice.tolerancePercent}
                expectedDirection={lesson.practice.expectedDirection}
                onSuccess={handlePracticeSuccess}
                onError={() => onLifeLost()}
              />
            </div>
          </div>
        )}

        {/* STEP 4: VICTORY SCREEN */}
        {isFinished && (
          <div className="w-full max-w-md flex flex-col items-center justify-center h-full py-8 text-center animate-fadeIn gap-6">
            <div className="w-20 h-20 rounded-3xl bg-[#00C076]/10 border border-[#00C076]/30 flex items-center justify-center text-[#00C076] shadow-xl">
              <Award className="w-10 h-10" />
            </div>

            <div>
              <span className="text-[11px] font-mono font-bold uppercase text-[#00C076] tracking-wider">
                КВАЛИФИКАЦИЯ ПОДТВЕРЖДЕНА
              </span>
              <h2 className="text-xl font-black text-white mt-1">Урок успешно завершен</h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                Практическое задание на графике выполнено в точности по правилам торговой системы.
              </p>
            </div>

            {/* Rewards */}
            <div className="flex gap-3 w-full justify-center">
              <div className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-[#0F1420] border border-[#1E293B]">
                <Zap className="w-4 h-4 text-[#00C076]" />
                <div className="text-left">
                  <div className="text-[10px] text-slate-400 font-mono">ОПЫТ</div>
                  <div className="text-sm font-black text-white font-mono">+{lesson.xpReward} XP</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-[#0F1420] border border-[#1E293B]">
                <Shield className="w-4 h-4 text-[#F0B90B]" />
                <div className="text-left">
                  <div className="text-[10px] text-slate-400 font-mono">БАЛЛЫ</div>
                  <div className="text-sm font-black text-[#F0B90B] font-mono">+{lesson.coinReward}</div>
                </div>
              </div>
            </div>

            <button
              onClick={handleFinishLesson}
              className="w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider bg-[#00C076] text-[#06080E] mt-4 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#00C076]/20"
            >
              <span>ПРОДОЛЖИТЬ ОБУЧЕНИЕ</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Bottom Footer Button */}
      {!isFinished && currentStep !== 'practice' && (
        <div className="p-4 bg-[#06080E]/95 border-t border-[#1E293B] max-w-md mx-auto w-full">
          {currentStep === 'theory' && (
            <button
              onClick={() => {
                setCurrentStep('quiz');
                haptic.medium();
              }}
              className="w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider bg-[#00C076] text-[#06080E] flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#00C076]/20"
            >
              <span>ПЕРЕЙТИ К ТЕСТИРОВАНИЮ</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {currentStep === 'quiz' && (
            <div>
              {!isAnswerChecked ? (
                <button
                  onClick={handleCheckQuiz}
                  disabled={selectedQuizOption === null}
                  className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all ${
                    selectedQuizOption !== null
                      ? 'bg-[#00C076] text-[#06080E] cursor-pointer shadow-lg shadow-[#00C076]/20'
                      : 'bg-[#1E293B] text-slate-500 cursor-not-allowed'
                  }`}
                >
                  ПРОВЕРИТЬ ВЫБОР
                </button>
              ) : (
                <button
                  onClick={handleNextQuiz}
                  className="w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider bg-[#38BDF8] text-[#06080E] flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#38BDF8]/20"
                >
                  <span>{currentQuizIdx + 1 < lesson.quiz.length ? 'СЛЕДУЮЩИЙ ВОПРОС' : 'ОТКРЫТЬ ТЕРМИНАЛ'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
