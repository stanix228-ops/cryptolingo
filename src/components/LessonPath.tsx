import React, { useState } from 'react';
import type { Module, Lesson, UserProgress } from '../types';
import { Lock, Star, CheckCircle2, Play, Clock, BookOpen, Layers, Shield, ChevronRight, Award, TrendingUp } from 'lucide-react';
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
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Total lessons count
  const allLessons = modules.flatMap((m) => m.lessons);
  const totalLessons = allLessons.length;
  const completedTotal = allLessons.filter((l) => progress.completedLessons[l.id]).length;
  const progressPercent = Math.round((completedTotal / (totalLessons || 1)) * 100);

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

  const filteredModules = selectedFilter === 'all' 
    ? modules 
    : modules.filter((m) => m.id === selectedFilter);

  return (
    <div className="flex flex-col max-w-md mx-auto px-4 py-4 pb-28 gap-5 select-none animate-fadeIn">
      {/* Academy Overview Dashboard Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-[#0F1420] via-[#121724] to-[#0A0D15] border border-[#1E293B] shadow-2xl relative overflow-hidden">
        {/* Subtle Ambient Light */}
        <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-[#00C076]/10 blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00C076] animate-ping" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#00C076] font-bold">
              OKX ACADEMY PRO
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400">
            {completedTotal} / {totalLessons} Завершено
          </span>
        </div>

        <h1 className="text-xl font-black text-white tracking-tight leading-snug">
          Программа профессионального трейдинга
        </h1>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          Практический курс анализа рынка, уровней ликвидности и управления рисками на реальных графиках.
        </p>

        {/* Global Progress Bar */}
        <div className="mt-4 flex flex-col gap-1.5">
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>Прогресс квалификации</span>
            <span className="text-white font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-[#06080E] rounded-full overflow-hidden border border-[#1E293B]">
            <div
              className="h-full bg-gradient-to-r from-[#00C076] to-[#38BDF8] rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-bold">
        <button
          onClick={() => {
            haptic.selection();
            setSelectedFilter('all');
          }}
          className={`px-4 py-2 rounded-2xl whitespace-nowrap transition-all cursor-pointer ${
            selectedFilter === 'all'
              ? 'bg-[#00C076] text-[#06080E] shadow-md shadow-[#00C076]/20 font-black'
              : 'bg-[#0F1420] text-slate-400 border border-[#1E293B] hover:text-white'
          }`}
        >
          Все модули
        </button>

        {modules.map((mod) => (
          <button
            key={mod.id}
            onClick={() => {
              haptic.selection();
              setSelectedFilter(mod.id);
            }}
            className={`px-4 py-2 rounded-2xl whitespace-nowrap transition-all cursor-pointer ${
              selectedFilter === mod.id
                ? 'bg-[#00C076] text-[#06080E] shadow-md shadow-[#00C076]/20 font-black'
                : 'bg-[#0F1420] text-slate-400 border border-[#1E293B] hover:text-white'
            }`}
          >
            Модуль 0{mod.number}
          </button>
        ))}
      </div>

      {/* Modules & Lessons Feed */}
      <div className="flex flex-col gap-6">
        {filteredModules.map((module, mIdx) => {
          const modCompleted = module.lessons.filter((l) => progress.completedLessons[l.id]).length;
          const isModComplete = modCompleted === module.lessons.length;
          const isModUnlocked = mIdx === 0 || !!progress.completedLessons[modules[mIdx - 1].lessons[modules[mIdx - 1].lessons.length - 1].id];

          return (
            <div
              key={module.id}
              className={`rounded-3xl border transition-all duration-300 overflow-hidden shadow-2xl ${
                isModUnlocked
                  ? 'bg-[#0F1420] border-[#1E293B]'
                  : 'bg-[#0A0D14]/70 border-[#151D2C] opacity-60'
              }`}
            >
              {/* Module Header Bar */}
              <div className="p-5 border-b border-[#1E293B] bg-gradient-to-r from-[#121725] to-[#0F1420] relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-black uppercase text-[#06080E]"
                      style={{ backgroundColor: module.accentColor }}
                    >
                      МОДУЛЬ 0{module.number}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">
                      {module.badge}
                    </span>
                  </div>

                  <span className="text-xs font-mono text-slate-300 font-bold">
                    {modCompleted}/{module.lessons.length}
                  </span>
                </div>

                <h2 className="text-base font-extrabold text-white tracking-tight">
                  {module.title}
                </h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {module.description}
                </p>
              </div>

              {/* Lesson Items List */}
              <div className="divide-y divide-[#1E293B]">
                {module.lessons.map((lesson, lIdx) => {
                  const unlocked = isLessonUnlocked(mIdx, lIdx);
                  const completion = progress.completedLessons[lesson.id];
                  const isCompleted = !!completion;

                  return (
                    <div
                      key={lesson.id}
                      onClick={() => {
                        if (unlocked) {
                          haptic.medium();
                          onSelectLesson(lesson);
                        } else {
                          haptic.warning();
                        }
                      }}
                      className={`p-4.5 flex items-center justify-between gap-3 transition-colors ${
                        unlocked
                          ? 'hover:bg-[#141B2B] cursor-pointer'
                          : 'cursor-not-allowed opacity-50'
                      }`}
                    >
                      {/* Left Side: Number & Info */}
                      <div className="flex items-center gap-3.5 flex-1 min-w-0">
                        {/* Number Index Badge */}
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-black text-xs shrink-0 border ${
                            isCompleted
                              ? 'bg-[#00C076]/10 border-[#00C076]/30 text-[#00C076]'
                              : unlocked
                              ? 'bg-[#38BDF8]/10 border-[#38BDF8]/30 text-[#38BDF8]'
                              : 'bg-[#151D2C] border-[#1E293B] text-slate-500'
                          }`}
                        >
                          {lIdx + 1 < 10 ? `0${lIdx + 1}` : lIdx + 1}
                        </div>

                        {/* Title and Badges */}
                        <div className="flex flex-col min-w-0">
                          <h3 className="text-xs font-bold text-white leading-tight truncate">
                            {lesson.title}
                          </h3>

                          {/* Meta Tags: Duration, Type */}
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                            <span className="flex items-center gap-0.5">
                              <Clock className="w-3 h-3 text-slate-400" />
                              3 мин
                            </span>
                            <span className="w-1 h-1 rounded-full bg-slate-600" />
                            <span>Теория + Тест + График</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Status Badge */}
                      <div className="shrink-0 flex items-center gap-2">
                        {isCompleted ? (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00C076]/10 border border-[#00C076]/30 text-[#00C076] text-xs font-bold font-mono">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>ПРОЙДЕНО</span>
                          </div>
                        ) : unlocked ? (
                          <button className="px-3.5 py-1.5 rounded-xl bg-[#00C076] text-[#06080E] text-xs font-black flex items-center gap-1 shadow-md shadow-[#00C076]/20">
                            <span>НАЧАТЬ</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <div className="w-8 h-8 rounded-xl bg-[#151D2C] border border-[#1E293B] flex items-center justify-center text-slate-500">
                            <Lock className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
