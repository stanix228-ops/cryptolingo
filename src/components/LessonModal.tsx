import React, { useState } from 'react';
import type { Lesson, StepType } from '../types';
import { TradingChart } from './TradingChart';
import { X, ArrowRight, CheckCircle2, AlertCircle, BookOpen, Brain, TrendingUp, Award, Zap, Shield } from 'lucide-react';
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

        {/* Step Indicator */}
        <div className="flex items-center gap-1 font-mono text-[10px] text-white px-2 py-0.5 border border-white/20 bg-neutral-950 uppercase tracking-wider">
          <span>{currentStep === 'theory' ? '[ THEORY ]' : currentStep === 'quiz' ? '[ TEST ]' : '[ TERMINAL ]'}</span>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col items-center">
        {/* STEP 1: THEORY */}
        {currentStep === 'theory' && (
          <div className="w-full max-w-md flex flex-col gap-4 animate-fadeIn pb-6">
            <div className="flex flex-col gap-1 border-b border-white/15 pb-2">
              <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                {lesson.theory.badge}
              </span>
              <h1 className="text-base font-black uppercase tracking-wide text-white leading-snug">
                {lesson.theory.title}
              </h1>
            </div>

            {/* Theory Points */}
            <div className="flex flex-col gap-3">
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
                      SPEC: {pt.highlight}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Author Quote */}
            {lesson.theory.authorQuote && (
              <div className="p-3 bg-neutral-950 border border-white/15 border-l-2 border-l-white font-mono text-[11px] text-neutral-300 italic">
                {lesson.theory.authorQuote}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: QUIZ */}
        {currentStep === 'quiz' && (
          <div className="w-full max-w-md flex flex-col gap-4 animate-fadeIn pb-6">
            <div className="flex items-center justify-between font-mono text-[10px] text-neutral-400 border-b border-white/15 pb-1.5">
              <span>QUESTION {currentQuizIdx + 1} OF {lesson.quiz.length}</span>
              <span className="bg-white text-black px-1 font-bold">QUALIFICATION</span>
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
                    <span>[ 0{oIdx + 1} ] {opt}</span>
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
                  {isCorrect ? '[ STATUS: VALIDATED ]' : '[ STATUS: REJECTED ]'}
                </div>
                <p className="font-sans text-[11px] text-neutral-300">{lesson.quiz[currentQuizIdx].explanation}</p>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: PRACTICE TERMINAL */}
        {currentStep === 'practice' && !isFinished && (
          <div className="w-full max-w-md flex flex-col h-full gap-2.5 animate-fadeIn">
            <div className="p-3 bg-neutral-950 border border-white/20 font-mono">
              <span className="text-[10px] font-black uppercase text-black bg-white px-1.5 py-0.5">
                EXECUTION PARAMETER
              </span>
              <p className="text-xs font-bold text-white mt-1.5 leading-snug font-sans">
                {lesson.practice.instruction}
              </p>
              <p className="text-[10px] text-neutral-400 mt-1 font-mono">
                GUIDE: {lesson.practice.hint}
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
                onError={() => onLifeLost()}
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
                STATUS: QUALIFICATION COMPLETED
              </span>
              <h2 className="text-base font-black uppercase text-white mt-1">Lesson Passed</h2>
              <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto leading-relaxed font-sans">
                Execution executed accurately within defined risk parameters.
              </p>
            </div>

            {/* Rewards */}
            <div className="flex gap-2 w-full justify-center">
              <div className="flex items-center gap-2 px-4 py-2 bg-neutral-950 border border-white/20">
                <span className="text-[10px] text-neutral-400">XP GAINED:</span>
                <span className="text-sm font-black text-white">+{lesson.xpReward}</span>
              </div>

              <div className="flex items-center gap-2 px-4 py-2 bg-neutral-950 border border-white/20">
                <span className="text-[10px] text-neutral-400">SCORE:</span>
                <span className="text-sm font-black text-white">+{lesson.coinReward}</span>
              </div>
            </div>

            <button
              onClick={handleFinishLesson}
              className="w-full py-3 bg-white text-black font-black text-xs uppercase tracking-wider mt-4 cursor-pointer hover:bg-neutral-200 transition-colors"
            >
              [ PROCEED TO NEXT LESSON ]
            </button>
          </div>
        )}
      </div>

      {/* Bottom Footer Button */}
      {!isFinished && currentStep !== 'practice' && (
        <div className="p-3 bg-black border-t border-white/15 max-w-md mx-auto w-full font-mono">
          {currentStep === 'theory' && (
            <button
              onClick={() => {
                setCurrentStep('quiz');
                haptic.medium();
              }}
              className="w-full py-3 bg-white text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer hover:bg-neutral-200 transition-colors"
            >
              <span>[ PROCEED TO TEST ]</span>
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
                  [ VALIDATE SELECTION ]
                </button>
              ) : (
                <button
                  onClick={handleNextQuiz}
                  className="w-full py-3 bg-white text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer hover:bg-neutral-200 transition-colors"
                >
                  <span>{currentQuizIdx + 1 < lesson.quiz.length ? '[ NEXT QUESTION ]' : '[ OPEN TERMINAL ]'}</span>
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
