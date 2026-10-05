import React from 'react';
import type { Module, Lesson, UserProgress } from '../types';
import { Lock, Star, Sparkles, Gift } from 'lucide-react';
import { haptic } from '../services/telegram';

interface LessonPathProps {
  modules: Module[];
  progress: UserProgress;
  onSelectLesson: (lesson: Lesson) => void;
}

export const LessonPath: React.FC<LessonPathProps> = ({
  modules,
  progress,
  onSelectLesson,
}) => {
  const isLessonUnlocked = (moduleIndex: number, lessonIndex: number) => {
    if (moduleIndex === 0 && lessonIndex === 0) return true;

    if (lessonIndex > 0) {
      const prevLessonId = modules[moduleIndex].lessons[lessonIndex - 1].id;
      return !!progress.completedLessons[prevLessonId];
    } else if (moduleIndex > 0) {
      const prevModule = modules[moduleIndex - 1];
      const lastLessonOfPrevModule = prevModule.lessons[prevModule.lessons.length - 1].id;
      return !!progress.completedLessons[lastLessonOfPrevModule];
    }
    return false;
  };

  return (
    <div className="flex flex-col items-center max-w-md mx-auto px-4 py-6 pb-28 gap-12 select-none">
      {modules.map((module, mIdx) => {
        const completedCount = module.lessons.filter((l) => progress.completedLessons[l.id]).length;
        const isModuleComplete = completedCount === module.lessons.length;
        const isModuleUnlocked = mIdx === 0 || !!progress.completedLessons[modules[mIdx - 1].lessons[modules[mIdx - 1].lessons.length - 1].id];

        return (
          <div key={module.id} className="w-full flex flex-col items-center relative">
            {/* Module Banner Card */}
            <div
              className={`w-full rounded-3xl p-5 mb-10 border transition-all duration-300 relative overflow-hidden shadow-2xl ${
                isModuleUnlocked
                  ? 'bg-gradient-to-br from-[#0F1420] via-[#121826] to-[#0B0E17] border-[#1E293B]'
                  : 'bg-[#0A0D14]/60 border-[#151D2C] opacity-60'
              }`}
            >
              {/* Top ambient color glow */}
              <div
                className="absolute -top-12 -right-12 w-36 h-36 rounded-full blur-3xl opacity-20 pointer-events-none"
                style={{ backgroundColor: module.accentColor }}
              />

              <div className="flex items-center justify-between mb-2.5">
                <span
                  className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full text-[#06080E] shadow-md"
                  style={{ backgroundColor: module.accentColor }}
                >
                  Модуль {module.number}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  {module.badge}
                </span>
              </div>

              <h2 className="text-lg font-extrabold text-white mb-1 tracking-tight">
                {module.title}
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                {module.description}
              </p>

              {/* Progress Bar with glowing fill */}
              <div className="mt-4 flex items-center gap-3">
                <div className="flex-1 h-2.5 bg-[#06080E] rounded-full overflow-hidden border border-[#1E293B]">
                  <div
                    className="h-full rounded-full transition-all duration-500 shadow-sm"
                    style={{
                      backgroundColor: module.accentColor,
                      width: `${(completedCount / module.lessons.length) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-xs font-mono font-bold text-slate-300">
                  {completedCount}/{module.lessons.length}
                </span>
              </div>
            </div>

            {/* Path Nodes List */}
            <div className="flex flex-col items-center gap-8 w-full relative">
              {module.lessons.map((lesson, lIdx) => {
                const unlocked = isLessonUnlocked(mIdx, lIdx);
                const completion = progress.completedLessons[lesson.id];
                const isCompleted = !!completion;

                // Alternating organic curve offset
                const offsets = [0, 48, -48, 32, -32];
                const xOffset = offsets[lIdx % offsets.length];

                return (
                  <div
                    key={lesson.id}
                    className="relative flex flex-col items-center transition-transform duration-300 z-10"
                    style={{ transform: `translateX(${xOffset}px)` }}
                  >
                    {/* Active Pulsing Glow Ring */}
                    {unlocked && !isCompleted && (
                      <div className="absolute -inset-2.5 rounded-full bg-[#FFD200]/25 animate-ping pointer-events-none" />
                    )}

                    {/* Lesson Round Node */}
                    <button
                      onClick={() => {
                        if (unlocked) {
                          haptic.medium();
                          onSelectLesson(lesson);
                        } else {
                          haptic.warning();
                        }
                      }}
                      disabled={!unlocked}
                      className={`w-20 h-20 rounded-full flex flex-col items-center justify-center relative transition-all duration-150 cursor-pointer ${
                        isCompleted
                          ? 'btn-3d-bullish ring-4 ring-[#00F59B]/20'
                          : unlocked
                          ? 'btn-3d-gold ring-4 ring-[#FFD200]/30 animate-bounce'
                          : 'btn-3d-dark text-slate-500 cursor-not-allowed border border-[#1E293B]'
                      }`}
                    >
                      {/* Node Icon */}
                      <span className="text-3xl filter drop-shadow-md">
                        {unlocked ? lesson.icon : <Lock className="w-6 h-6 text-slate-500" />}
                      </span>

                      {/* Stars for Completed Lessons */}
                      {isCompleted && (
                        <div className="absolute -bottom-2 flex items-center gap-0.5 bg-[#06080E] px-2 py-0.5 rounded-full border border-[#FFD200]/50 shadow-md">
                          <Star className="w-2.5 h-2.5 fill-[#FFD200] text-[#FFD200]" />
                          <Star className="w-2.5 h-2.5 fill-[#FFD200] text-[#FFD200]" />
                          <Star className="w-2.5 h-2.5 fill-[#FFD200] text-[#FFD200]" />
                        </div>
                      )}
                    </button>

                    {/* Lesson Caption */}
                    <div className="mt-2.5 text-center max-w-[140px]">
                      <span
                        className={`text-xs font-extrabold leading-tight block line-clamp-2 ${
                          unlocked ? 'text-slate-200' : 'text-slate-500'
                        }`}
                      >
                        {lesson.title}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Module Reward Chest at the end */}
              <div className="relative flex flex-col items-center mt-2 z-10">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center border transition-all ${
                    isModuleComplete
                      ? 'bg-gradient-to-tr from-[#FFD200] to-[#F59E0B] text-[#06080E] border-[#FFD200] shadow-lg shadow-[#FFD200]/30 animate-bounce'
                      : 'bg-[#0F1420] border-[#1E293B] text-slate-500'
                  }`}
                >
                  <Gift className="w-8 h-8" />
                </div>
                <span className="text-[11px] font-bold text-slate-400 mt-2">
                  {isModuleComplete ? 'Награда получена! 🎁' : 'Сундук модуля 🔒'}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
