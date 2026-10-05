import React from 'react';
import { Module, Lesson, UserProgress } from '../types';
import { Lock, Star, Check, Play, Trophy, Sparkles } from 'lucide-react';
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
  // Check if a lesson is unlocked
  const isLessonUnlocked = (lessonId: string, moduleIndex: number, lessonIndex: number) => {
    if (moduleIndex === 0 && lessonIndex === 0) return true;

    // Previous lesson completed?
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
    <div className="flex flex-col items-center max-w-md mx-auto px-4 py-6 pb-24 gap-10">
      {modules.map((module, mIdx) => {
        const isModuleUnlocked = mIdx === 0 || !!progress.completedLessons[modules[mIdx - 1].lessons[modules[mIdx - 1].lessons.length - 1].id];

        return (
          <div key={module.id} className="w-full flex flex-col items-center">
            {/* Module Banner Header */}
            <div
              className={`w-full rounded-2xl p-5 mb-8 border transition-all shadow-xl relative overflow-hidden ${
                isModuleUnlocked
                  ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-slate-700/80'
                  : 'bg-slate-950/60 border-slate-800/40 opacity-75'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full text-slate-950"
                  style={{ backgroundColor: module.accentColor }}
                >
                  Модуль {module.number}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  {module.badge}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white mb-1">{module.title}</h2>
              <p className="text-xs text-slate-400 line-clamp-2">{module.description}</p>

              {/* Progress bar inside module */}
              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      backgroundColor: module.accentColor,
                      width: `${
                        (module.lessons.filter((l) => progress.completedLessons[l.id]).length /
                          module.lessons.length) *
                        100
                      }%`,
                    }}
                  />
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {module.lessons.filter((l) => progress.completedLessons[l.id]).length}/
                  {module.lessons.length}
                </span>
              </div>
            </div>

            {/* Stepping Path Nodes */}
            <div className="flex flex-col items-center gap-7 w-full">
              {module.lessons.map((lesson, lIdx) => {
                const unlocked = isLessonUnlocked(lesson.id, mIdx, lIdx);
                const completion = progress.completedLessons[lesson.id];
                const isCompleted = !!completion;

                // Subtle winding horizontal offset (Duolingo snake style)
                const offsetValues = [0, 45, -45, 30, -30];
                const xOffset = offsetValues[lIdx % offsetValues.length];

                return (
                  <div
                    key={lesson.id}
                    className="relative flex flex-col items-center transition-transform duration-300"
                    style={{ transform: `translateX(${xOffset}px)` }}
                  >
                    {/* Pulsing glow ring for current active lesson */}
                    {unlocked && !isCompleted && (
                      <div className="absolute -inset-2 rounded-full bg-emerald-500/20 animate-ping pointer-events-none" />
                    )}

                    {/* Lesson Node Button */}
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
                      className={`w-18 h-18 rounded-full flex flex-col items-center justify-center relative transition-all duration-150 ${
                        isCompleted
                          ? 'btn-3d-green text-slate-950 ring-4 ring-emerald-500/20'
                          : unlocked
                          ? 'btn-3d-yellow text-slate-950 animate-bounce ring-4 ring-amber-500/20'
                          : 'btn-3d-dark text-slate-500 cursor-not-allowed border border-slate-800'
                      }`}
                    >
                      {/* Node Icon */}
                      <span className="text-2xl filter drop-shadow-md">
                        {unlocked ? lesson.icon : <Lock className="w-6 h-6 text-slate-500" />}
                      </span>

                      {/* Stars for completed lessons */}
                      {isCompleted && (
                        <div className="absolute -bottom-1 flex items-center gap-0.5 bg-slate-950 px-1.5 py-0.5 rounded-full border border-amber-500/40">
                          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                        </div>
                      )}
                    </button>

                    {/* Lesson Title Caption */}
                    <div className="mt-2 text-center max-w-[130px]">
                      <span
                        className={`text-xs font-bold leading-tight line-clamp-2 ${
                          unlocked ? 'text-slate-200' : 'text-slate-500'
                        }`}
                      >
                        {lesson.title}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
