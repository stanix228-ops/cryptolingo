import React, { useState } from 'react';
import type { Lesson, StepType } from '../types';
import { TradingChart } from './TradingChart';
import { X, ArrowRight, CheckCircle2, AlertCircle, Sparkles, BookOpen, Brain, TrendingUp, Trophy, Star } from 'lucide-react';
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
      particleCount: 90,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#00F59B', '#38BDF8', '#FFD200', '#A855F7'],
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
      <div className="px-4 py-3 border-b border-[#1E293B] bg-[#06080E]/90 backdrop-blur-xl flex items-center justify-between gap-3">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-[#0F1420] border border-[#1E293B] flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Glowing Progress Bar */}
        <div className="flex-1 h-3 bg-[#0F1420] rounded-full border border-[#1E293B] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#00F59B] via-[#38BDF8] to-[#FFD200] rounded-full transition-all duration-300 shadow-sm"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 px-3 py-1 rounded-full bg-[#0F1420] border border-[#1E293B]">
          {currentStep === 'theory' && <BookOpen className="w-3.5 h-3.5 text-[#38BDF8]" />}
          {currentStep === 'quiz' && <Brain className="w-3.5 h-3.5 text-[#FFD200]" />}
          {currentStep === 'practice' && <TrendingUp className="w-3.5 h-3.5 text-[#00F59B]" />}
          <span className="capitalize">{currentStep === 'theory' ? 'Теория' : currentStep === 'quiz' ? 'Тест' : 'График'}</span>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col items-center">
        {/* STEP 1: THEORY */}
        {currentStep === 'theory' && (
          <div className="w-full max-w-md flex flex-col gap-4 animate-fadeIn pb-6">
            {/* Title Badge */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#00F59B] bg-[#00F59B]/10 px-3 py-1 rounded-full w-fit border border-[#00F59B]/30">
                {lesson.theory.badge}
              </span>
              <h1 className="text-xl font-black text-white leading-tight">
                {lesson.theory.title}
              </h1>
            </div>

            {/* Theory Cards */}
            <div className="flex flex-col gap-3.5">
              {lesson.theory.points.map((pt, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#0F1420] border border-[#1E293B] shadow-lg flex flex-col gap-2 relative overflow-hidden"
                >
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        pt.badgeType === 'bull'
                          ? 'bg-[#00F59B]'
                          : pt.badgeType === 'bear'
                          ? 'bg-[#FF3366]'
                          : pt.badgeType === 'warning'
                          ? 'bg-[#FFD200]'
                          : 'bg-[#38BDF8]'
                      }`}
                    />
                    {pt.headline}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{pt.text}</p>
                  {pt.highlight && (
                    <div className="mt-1 px-3 py-2 rounded-xl bg-[#00F59B]/10 border border-[#00F59B]/20 text-[#00F59B] text-xs font-bold leading-snug">
                      💡 {pt.highlight}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Author Quote (Gerchik Gold Box) */}
            {lesson.theory.authorQuote && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FFD200]/10 via-[#0F1420] to-transparent border-l-4 border-[#FFD200] text-xs italic text-amber-200 shadow-md">
                {lesson.theory.authorQuote}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: QUIZ */}
        {currentStep === 'quiz' && (
          <div className="w-full max-w-md flex flex-col gap-5 animate-fadeIn pb-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#FFD200] bg-[#FFD200]/10 px-3 py-1 rounded-full border border-[#FFD200]/20">
                Вопрос {currentQuizIdx + 1} из {lesson.quiz.length}
              </span>
            </div>

            <h2 className="text-lg font-black text-white leading-snug">
              {lesson.quiz[currentQuizIdx].question}
            </h2>

            {/* Quiz Choices */}
            <div className="flex flex-col gap-3">
              {lesson.quiz[currentQuizIdx].options.map((opt, oIdx) => {
                const isSelected = selectedQuizOption === oIdx;
                const isCorrectOption = oIdx === lesson.quiz[currentQuizIdx].correctIndex;

                let btnStyles = 'bg-[#0F1420] border-[#1E293B] text-slate-200 hover:border-slate-700';

                if (isSelected && !isAnswerChecked) {
                  btnStyles = 'bg-[#38BDF8]/20 border-[#38BDF8] text-[#38BDF8] ring-2 ring-[#38BDF8]/40 shadow-lg';
                } else if (isAnswerChecked) {
                  if (isCorrectOption) {
                    btnStyles = 'bg-[#00F59B]/20 border-[#00F59B] text-[#00F59B] ring-2 ring-[#00F59B]/40 shadow-lg';
                  } else if (isSelected && !isCorrectOption) {
                    btnStyles = 'bg-[#FF3366]/20 border-[#FF3366] text-[#FF3366] ring-2 ring-[#FF3366]/40 shadow-lg';
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
                      <CheckCircle2 className="w-5 h-5 text-[#00F59B] shrink-0 ml-2" />
                    )}
                    {isAnswerChecked && isSelected && !isCorrectOption && (
                      <AlertCircle className="w-5 h-5 text-[#FF3366] shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation Feedback Card */}
            {isAnswerChecked && (
              <div
                className={`p-4 rounded-2xl border text-xs leading-relaxed animate-fadeIn shadow-lg ${
                  isCorrect
                    ? 'bg-[#00F59B]/10 border-[#00F59B]/40 text-emerald-200'
                    : 'bg-[#FF3366]/10 border-[#FF3366]/40 text-rose-200'
                }`}
              >
                <div className="font-extrabold mb-1 flex items-center gap-1.5">
                  {isCorrect ? '✨ Абсолютно верно!' : '⚠️ Пояснение к вопросу:'}
                </div>
                {lesson.quiz[currentQuizIdx].explanation}
              </div>
            )}
          </div>
        )}

        {/* STEP 3: INTERACTIVE CHART PRACTICE */}
        {currentStep === 'practice' && !isFinished && (
          <div className="w-full max-w-md flex flex-col h-full gap-3 animate-fadeIn">
            <div className="p-3.5 bg-[#0F1420] border border-[#1E293B] rounded-2xl shadow-md">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#00F59B] bg-[#00F59B]/10 px-2.5 py-0.5 rounded-full border border-[#00F59B]/20">
                Тренажер на графике
              </span>
              <p className="text-xs font-bold text-white mt-1.5 leading-snug">
                {lesson.practice.instruction}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                💡 {lesson.practice.hint}
              </p>
            </div>

            {/* TradingView Chart Container */}
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

        {/* STEP 4: VICTORY CELEBRATION */}
        {isFinished && (
          <div className="w-full max-w-md flex flex-col items-center justify-center h-full py-8 text-center animate-fadeIn gap-6">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#FFD200] to-[#F59E0B] flex items-center justify-center text-[#06080E] shadow-2xl shadow-[#FFD200]/30 animate-bounce">
              <Trophy className="w-12 h-12" />
            </div>

            <div>
              <div className="flex justify-center gap-1.5 mb-2">
                <Star className="w-6 h-6 fill-[#FFD200] text-[#FFD200]" />
                <Star className="w-6 h-6 fill-[#FFD200] text-[#FFD200]" />
                <Star className="w-6 h-6 fill-[#FFD200] text-[#FFD200]" />
              </div>
              <h2 className="text-2xl font-black text-white">Уровень пройден!</h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                Вы успешно закрепили теорию и выполнили практическое действие на реальных свечах!
              </p>
            </div>

            {/* Reward Badges */}
            <div className="flex gap-4 w-full justify-center">
              <div className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-[#0F1420] border border-[#1E293B]">
                <Sparkles className="w-5 h-5 text-[#00F59B]" />
                <div className="text-left">
                  <div className="text-[10px] text-slate-400 font-semibold">Опыт</div>
                  <div className="text-base font-black text-white font-mono">+{lesson.xpReward} XP</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-[#0F1420] border border-[#1E293B]">
                <span className="text-xl">💰</span>
                <div className="text-left">
                  <div className="text-[10px] text-slate-400 font-semibold">Монеты</div>
                  <div className="text-base font-black text-[#FFD200] font-mono">+{lesson.coinReward}</div>
                </div>
              </div>
            </div>

            <button
              onClick={handleFinishLesson}
              className="w-full py-4 rounded-2xl font-black text-sm btn-3d-bullish mt-4 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>ПРОДОЛЖИТЬ ПУТЬ</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Bottom Footer Button */}
      {!isFinished && currentStep !== 'practice' && (
        <div className="p-4 bg-[#06080E]/90 border-t border-[#1E293B] max-w-md mx-auto w-full">
          {currentStep === 'theory' && (
            <button
              onClick={() => {
                setCurrentStep('quiz');
                haptic.medium();
              }}
              className="w-full py-3.5 rounded-2xl font-black text-sm btn-3d-bullish flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>ПЕРЕЙТИ К ТЕСТУ</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {currentStep === 'quiz' && (
            <div>
              {!isAnswerChecked ? (
                <button
                  onClick={handleCheckQuiz}
                  disabled={selectedQuizOption === null}
                  className={`w-full py-3.5 rounded-2xl font-black text-sm transition-all ${
                    selectedQuizOption !== null
                      ? 'btn-3d-bullish cursor-pointer'
                      : 'bg-[#1E293B] text-slate-500 cursor-not-allowed'
                  }`}
                >
                  ПРОВЕРИТЬ ОТВЕТ
                </button>
              ) : (
                <button
                  onClick={handleNextQuiz}
                  className="w-full py-3.5 rounded-2xl font-black text-sm btn-3d-cyan flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{currentQuizIdx + 1 < lesson.quiz.length ? 'СЛЕДУЮЩИЙ ВОПРОС' : 'ПЕРЕЙТИ К ГРАФИКУ'}</span>
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
