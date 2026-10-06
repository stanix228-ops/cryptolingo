import React, { useState } from 'react';
import type { Module, Lesson, UserProgress } from '../types';
import { Lock, Check, ArrowRight, ChevronDown, ChevronUp, Play, BookOpen } from 'lucide-react';
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
  // Track open/collapsed module IDs (default: module-1 is open)
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    'module-1': true,
  });

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

  const toggleModule = (moduleId: string) => {
    haptic.selection();
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const filteredModules =
    selectedFilter === 'all'
      ? modules
      : modules.filter((m) => m.id === selectedFilter);

  const totalBlocks = 20;
  const filledBlocks = Math.round((progressPercent / 100) * totalBlocks);
  const emptyBlocks = totalBlocks - filledBlocks;
  const progressBlocks = '■'.repeat(filledBlocks) + '□'.repeat(emptyBlocks);

  return (
    <div className="flex flex-col max-w-md mx-auto px-3 py-4 pb-28 gap-4 select-none font-sans text-white">
      {/* Academy Specification Header */}
      <div className="p-4 bg-black border border-white/25 flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-white/15 pb-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-white" />
            <span className="font-mono text-[11px] font-bold tracking-widest uppercase text-white">
              CRYPTOLINGO // ACADEMY
            </span>
          </div>
          <span className="font-mono text-[10px] font-bold text-black bg-white px-1.5 py-0.5">
            [ {completedTotal < 10 ? `0${completedTotal}` : completedTotal} / {totalLessons < 10 ? `0${totalLessons}` : totalLessons} УРОКОВ ]
          </span>
        </div>

        <div>
          <h1 className="text-sm font-black uppercase tracking-wider leading-tight text-white">
            10 Глав // 100 Уроков Трейдинга
          </h1>
          <p className="text-[11px] text-neutral-400 font-mono mt-0.5 leading-relaxed">
            Нажмите на модуль, чтобы открыть список уроков и начать обучение.
          </p>
        </div>

        {/* Solid Segmented Block Progress Bar */}
        <div className="flex flex-col gap-1 pt-1">
          <div className="flex justify-between font-mono text-[10px] text-neutral-400">
            <span>ОБЩИЙ ПРОГРЕСС КУРСА</span>
            <span className="font-bold text-white">{progressPercent}%</span>
          </div>
          <div className="font-mono text-xs tracking-tighter text-white select-none">
            [ {progressBlocks} ]
          </div>
        </div>
      </div>

      {/* Module Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 font-mono text-[10px] no-scrollbar">
        <button
          onClick={() => {
            haptic.selection();
            setSelectedFilter('all');
          }}
          className={`px-2.5 py-1.5 border font-bold uppercase transition-all cursor-pointer ${
            selectedFilter === 'all'
              ? 'bg-white text-black border-white'
              : 'bg-black text-neutral-400 border-white/15 hover:border-white hover:text-white'
          }`}
        >
          [ ВСЕ МОДУЛИ ]
        </button>

        {modules.map((mod) => (
          <button
            key={mod.id}
            onClick={() => {
              haptic.selection();
              setSelectedFilter(mod.id);
              // Auto-expand this module when filtered
              setExpandedModules((prev) => ({ ...prev, [mod.id]: true }));
            }}
            className={`px-2.5 py-1.5 border font-bold uppercase whitespace-nowrap transition-all cursor-pointer ${
              selectedFilter === mod.id
                ? 'bg-white text-black border-white'
                : 'bg-black text-neutral-400 border-white/15 hover:border-white hover:text-white'
            }`}
          >
            [ 0{mod.number}. {mod.title.split(' ')[0]} ]
          </button>
        ))}
      </div>

      {/* Expandable Modules Accordion List */}
      <div className="flex flex-col gap-3">
        {filteredModules.map((module, mIdx) => {
          const modCompleted = module.lessons.filter((l) => progress.completedLessons[l.id]).length;
          const isModUnlocked =
            mIdx === 0 ||
            !!progress.completedLessons[
              modules[mIdx - 1].lessons[modules[mIdx - 1].lessons.length - 1].id
            ];
          const isExpanded = !!expandedModules[module.id];
          const modPercent = Math.round((modCompleted / module.lessons.length) * 100);

          return (
            <div
              key={module.id}
              className={`border transition-all ${
                isModUnlocked
                  ? 'border-white/25 bg-black'
                  : 'border-white/10 bg-neutral-950 opacity-60'
              }`}
            >
              {/* Clickable Module Header */}
              <button
                onClick={() => {
                  if (isModUnlocked) {
                    toggleModule(module.id);
                  } else {
                    haptic.warning();
                  }
                }}
                className="w-full p-3.5 flex items-center justify-between gap-3 text-left transition-colors hover:bg-neutral-950 cursor-pointer"
              >
                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 font-mono text-[10px]">
                    <span className="font-black bg-white text-black px-1.5 py-0.5 tracking-wider uppercase">
                      МОДУЛЬ {module.number < 10 ? `0${module.number}` : module.number}
                    </span>
                    <span className="text-neutral-400 font-bold">
                      [ {modCompleted} / {module.lessons.length} ОК ]
                    </span>
                    {modCompleted === module.lessons.length && (
                      <span className="text-white border border-white px-1 font-bold">
                        ЗАВЕРШЕН
                      </span>
                    )}
                  </div>

                  <h2 className="text-xs font-black uppercase tracking-wide text-white leading-snug">
                    {module.title}
                  </h2>

                  <p className="text-[11px] text-neutral-400 font-sans line-clamp-1">
                    {module.description}
                  </p>

                  {/* Micro Progress Bar inside header */}
                  <div className="flex items-center gap-2 pt-0.5 font-mono text-[9px] text-neutral-500">
                    <div className="w-24 h-1 bg-neutral-800 overflow-hidden">
                      <div
                        className="h-full bg-white transition-all"
                        style={{ width: `${modPercent}%` }}
                      />
                    </div>
                    <span>{modPercent}%</span>
                  </div>
                </div>

                {/* Expand Arrow & Icon */}
                <div className="flex items-center gap-2 shrink-0">
                  {!isModUnlocked ? (
                    <div className="p-1.5 border border-white/15 text-neutral-500">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 font-mono text-[10px] text-neutral-400 bg-neutral-900 border border-white/15 px-2 py-1">
                      <span>{isExpanded ? 'СВЕРНУТЬ' : 'ОТКРЫТЬ'}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-white" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-white" />
                      )}
                    </div>
                  )}
                </div>
              </button>

              {/* Collapsible Lessons Container */}
              {isExpanded && isModUnlocked && (
                <div className="border-t border-white/15 divide-y divide-white/10 bg-black animate-in fade-in duration-200">
                  {module.lessons.map((lesson, lIdx) => {
                    const unlocked = isLessonUnlocked(mIdx, lIdx);
                    const completion = progress.completedLessons[lesson.id];
                    const isCompleted = !!completion;

                    return (
                      <div
                        key={lesson.id}
                        className={`p-3 flex items-center justify-between gap-3 transition-colors ${
                          unlocked ? 'hover:bg-neutral-950' : 'bg-neutral-950/40 opacity-50'
                        }`}
                      >
                        {/* Left: Lesson Index, Title & Description */}
                        <div className="flex items-start gap-2.5 flex-1 min-w-0">
                          <span className="font-mono font-bold text-[10px] text-white border border-white/20 bg-neutral-950 px-1.5 py-0.5 shrink-0 mt-0.5">
                            {module.number < 10 ? `0${module.number}` : module.number}.
                            {lIdx + 1 < 10 ? `0${lIdx + 1}` : lIdx + 1}
                          </span>

                          <div className="flex flex-col min-w-0">
                            <h3 className="text-xs font-bold uppercase tracking-tight text-white leading-snug">
                              {lesson.title}
                            </h3>

                            <p className="text-[10px] text-neutral-400 font-sans leading-tight mt-0.5 line-clamp-1">
                              {lesson.shortDesc}
                            </p>

                            <div className="flex items-center gap-2 mt-1 font-mono text-[9px] text-neutral-500">
                              <span>+{lesson.xpReward} XP</span>
                              <span>•</span>
                              <span>3 МИН</span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Action Button (НАЧАТЬ / ПЕРЕЙТИ / ЗАКРЫТО) */}
                        <div className="shrink-0 flex items-center">
                          {isCompleted ? (
                            <button
                              onClick={() => {
                                haptic.selection();
                                onSelectLesson(lesson);
                              }}
                              className="px-2.5 py-1.5 border border-white/40 hover:border-white text-white font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 transition-all cursor-pointer"
                            >
                              <Check className="w-3 h-3 text-white" />
                              <span>ПЕРЕЙТИ</span>
                            </button>
                          ) : unlocked ? (
                            <button
                              onClick={() => {
                                haptic.medium();
                                onSelectLesson(lesson);
                              }}
                              className="px-3 py-1.5 bg-white text-black font-mono text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 hover:bg-neutral-200 transition-all cursor-pointer border border-white shadow-sm"
                            >
                              <Play className="w-3 h-3 fill-black text-black" />
                              <span>НАЧАТЬ</span>
                            </button>
                          ) : (
                            <div className="px-2 py-1.5 border border-white/10 text-neutral-600 font-mono text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" />
                              <span>ЗАКРЫТО</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
