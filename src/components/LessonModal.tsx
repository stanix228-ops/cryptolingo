import React, { useState } from 'react';
import { Lesson, StepType } from '../types';
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

  const totalSteps = 1 + lesson.quiz.length + 1; // Theory + Quizzes + Practice
  const progressPercent =
    currentStep === 'theory'
      ? 20
      : currentStep === 'quiz'
      ? 20 + ((currentQuizIdx + 1) / (lesson.quiz.length + 1)) * 50
      : currentStep === 'practice'
      ? 85
      : 100;

  // Trigger celebration confetti
  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10B981', '#3B82F6', '#F59E0B', '#EC4899'],
    });
  };

  // Handle Quiz selection
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
      // Move to Practice step!
      setCurrentStep('practice');
      setSelectedQuizOption(null);
      setIsAnswerChecked(false);
      haptic.medium();
    }
  };

  // Handle Practice Success
  const handlePracticeSuccess = () => {
    haptic.success();
    triggerConfetti();
    setIsFinished(true);
  };

  const handleFinishLesson = () => {
    onComplete(100, 3);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between overflow-hidden animate-fadeIn">
      {/* Top Header Navigation */}
      <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md flex items-center justify-between gap-3">
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Progress bar */}
        <div className="flex-1 h-3 bg-slate-900 rounded-full border border-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-1 text-xs font-bold text-slate-400 px-2 py-1 rounded-md bg-slate-900 border border-slate-800">
          {currentStep === 'theory' && <BookOpen className="w-3.5 h-3.5 text-blue-400" />}
          {currentStep === 'quiz' && <Brain className="w-3.5 h-3.5 text-amber-400" />}
          {currentStep === 'practice' && <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />}
          <span className="capitalize">{currentStep}</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col items-center">
        {/* STEP 1: THEORY */}
        {currentStep === 'theory' && (
          <div className="w-full max-w-md flex flex-col gap-4 animate-fadeIn">
            {/* Title & Badge */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full w-fit border border-emerald-500/20">
                {lesson.theory.badge}
              </span>
              <h1 className="text-xl font-black text-white leading-tight">
                {lesson.theory.title}
              </h1>
            </div>

            {/* Theory Cards */}
            <div className="flex flex-col gap-3">
              {lesson.theory.points.map((pt, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md flex flex-col gap-2"
                >
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    {pt.headline}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{pt.text}</p>
                  {pt.highlight && (
                    <div className="mt-1 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
                      💡 {pt.highlight}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Author Quote (Gerchik style) */}
            {lesson.theory.authorQuote && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-transparent border-l-4 border-amber-500 text-xs italic text-amber-200">
                {lesson.theory.authorQuote}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: QUIZ */}
        {currentStep === 'quiz' && (
          <div className="w-full max-w-md flex flex-col gap-5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                Вопрос {currentQuizIdx + 1} из {lesson.quiz.length}
              </span>
            </div>

            <h2 className="text-lg font-bold text-white">
              {lesson.quiz[currentQuizIdx].question}
            </h2>

            {/* Options */}
            <div className="flex flex-col gap-3">
              {lesson.quiz[currentQuizIdx].options.map((opt, oIdx) => {
                const isSelected = selectedQuizOption === oIdx;
                const isCorrectOption = oIdx === lesson.quiz[currentQuizIdx].correctIndex;

                let btnStyles = 'bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-700';

                if (isSelected && !isAnswerChecked) {
                  btnStyles = 'bg-blue-600/20 border-blue-500 text-blue-300 ring-2 ring-blue-500/30';
                } else if (isAnswerChecked) {
                  if (isCorrectOption) {
                    btnStyles = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30';
                  } else if (isSelected && !isCorrectOption) {
                    btnStyles = 'bg-red-500/20 border-red-500 text-red-300 ring-2 ring-red-500/30';
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
                    className={`p-4 rounded-2xl border text-left text-xs font-semibold leading-relaxed transition-all flex items-center justify-between ${btnStyles}`}
                  >
                    <span>{opt}</span>
                    {isAnswerChecked && isCorrectOption && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    )}
                    {isAnswerChecked && isSelected && !isCorrectOption && (
                      <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation card after answer */}
            {isAnswerChecked && (
              <div
                className={`p-4 rounded-2xl border text-xs leading-relaxed animate-fadeIn ${
                  isCorrect
                    ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                    : 'bg-red-950/40 border-red-500/30 text-red-200'
                }`}
              >
                <div className="font-bold mb-1 flex items-center gap-1.5">
                  {isCorrect ? '✨ Отлично!' : '⚠️ Обратите внимание:'}
                </div>
                {lesson.quiz[currentQuizIdx].explanation}
              </div>
            )}
          </div>
        )}

        {/* STEP 3: PRACTICE ON REAL CHART */}
        {currentStep === 'practice' && !isFinished && (
          <div className="w-full max-w-md flex flex-col h-full gap-3 animate-fadeIn">
            <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-2xl">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                Интерактивная практика
              </span>
              <p className="text-xs font-bold text-white mt-1">
                {lesson.practice.instruction}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                💡 {lesson.practice.hint}
              </p>
            </div>

            {/* Live Chart Container */}
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
                onError={(err) => onLifeLost()}
              />
            </div>
          </div>
        )}

        {/* STEP 4: CELEBRATION MODAL */}
        {isFinished && (
          <div className="w-full max-w-md flex flex-col items-center justify-center h-full py-8 text-center animate-fadeIn gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-slate-950 shadow-2xl shadow-amber-500/30 animate-bounce">
              <Trophy className="w-12 h-12" />
            </div>

            <div>
              <div className="flex justify-center gap-1.5 mb-2">
                <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
              </div>
              <h2 className="text-2xl font-black text-white">Уровень пройден!</h2>
              <p className="text-xs text-slate-400 mt-1">
                Вы успешно освоили теорию и подтвердили навык на реальном графике.
              </p>
            </div>

            {/* Rewards */}
            <div className="flex gap-4 w-full justify-center">
              <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 border border-slate-800">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <div className="text-left">
                  <div className="text-[10px] text-slate-400">Опыт</div>
                  <div className="text-base font-black text-white">+{lesson.xpReward} XP</div>
                </div>
              </div>

              <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-xl">💰</span>
                <div className="text-left">
                  <div className="text-[10px] text-slate-400">Монеты</div>
                  <div className="text-base font-black text-amber-400">+{lesson.coinReward}</div>
                </div>
              </div>
            </div>

            <button
              onClick={handleFinishLesson}
              className="w-full py-4 rounded-2xl font-extrabold text-sm text-slate-950 btn-3d-green mt-4 flex items-center justify-center gap-2"
            >
              <span>ПРОДОЛЖИТЬ ПУТЬ</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Bottom Action Footer for Theory & Quiz */}
      {!isFinished && currentStep !== 'practice' && (
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 max-w-md mx-auto w-full">
          {currentStep === 'theory' && (
            <button
              onClick={() => {
                setCurrentStep('quiz');
                haptic.medium();
              }}
              className="w-full py-3.5 rounded-2xl font-extrabold text-sm text-slate-950 btn-3d-green flex items-center justify-center gap-2 cursor-pointer"
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
                  className={`w-full py-3.5 rounded-2xl font-extrabold text-sm transition-all ${
                    selectedQuizOption !== null
                      ? 'btn-3d-green text-slate-950 cursor-pointer'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  ПРОВЕРИТЬ ОТВЕТ
                </button>
              ) : (
                <button
                  onClick={handleNextQuiz}
                  className="w-full py-3.5 rounded-2xl font-extrabold text-sm text-slate-950 btn-3d-blue flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{currentQuizIdx + 1 < lesson.quiz.length ? 'СЛЕДУЮЩИЙ ВОПРОС' : 'ПЕРЕЙТИ К ПРАКТИКЕ'}</span>
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
