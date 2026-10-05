import React, { useState } from 'react';
import type { Module, Lesson, UserProgress } from '../types';
import { Lock, Check, ArrowRight, Clock, Layers } from 'lucide-react';
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

  // Generate ASCII / Solid blocks representation of progress
  const totalBlocks = 20;
  const filledBlocks = Math.round((progressPercent / 100) * totalBlocks);
  const emptyBlocks = totalBlocks - filledBlocks;
  const progressBlocks = '■'.repeat(filledBlocks) + '□'.repeat(emptyBlocks);

  return (
    <div className="flex flex-col max-w-md mx-auto px-3 py-4 pb-28 gap-4 select-none font-sans text-white">
      {/* Swiss Master Technical Header */}
      <div className="p-4 bg-black border-2 border-white flex flex-col gap-3 shadow-none">
        <div className="flex items-center justify-between border-b border-white/30 pb-2">
          <span className="font-mono text-[11px] font-bold tracking-widest uppercase text-white">
            OKX // CRYPTOLINGO ACADEMY
          </span>
          <span className="font-mono text-[11px] font-bold text-white bg-white text-black px-1.5 py-0.5">
            [ {completedTotal < 10 ? `0${completedTotal}` : completedTotal} / {totalLessons < 10 ? `0${totalLessons}` : totalLessons} OK ]
          </span>
        </div>

        <div>
          <h1 className="text-base font-black uppercase tracking-wider leading-tight text-white">
            Curriculum Specification 2026
          </h1>
          <p className="text-[11px] text-neutral-400 font-mono mt-1 leading-relaxed">
            Market analysis, liquidity orderbook dynamics, risk parameters.
          </p>
        </div>

        {/* Solid Segmented Block Progress Bar */}
        <div className="flex flex-col gap-1 pt-1">
          <div className="flex justify-between font-mono text-[10px] text-neutral-300">
            <span>PROGRESS RATIO</span>
            <span className="font-bold text-white">{progressPercent}%</span>
          </div>
          <div className="font-mono text-xs tracking-tighter text-white select-none">
            [ {progressBlocks} ]
          </div>
        </div>
      </div>

      {/* Swiss Square Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 font-mono text-[11px] no-scrollbar">
        <button
          onClick={() => {
            haptic.selection();
            setSelectedFilter('all');
          }}
          className={`px-3 py-1.5 border font-bold uppercase transition-all cursor-pointer ${
            selectedFilter === 'all'
              ? 'bg-white text-black border-white'
              : 'bg-black text-neutral-400 border-neutral-800 hover:border-white hover:text-white'
          }`}
        >
          [ ALL ]
        </button>

        {modules.map((mod) => (
          <button
            key={mod.id}
            onClick={() => {
              haptic.selection();
              setSelectedFilter(mod.id);
            }}
            className={`px-3 py-1.5 border font-bold uppercase whitespace-nowrap transition-all cursor-pointer ${
              selectedFilter === mod.id
                ? 'bg-white text-black border-white'
                : 'bg-black text-neutral-400 border-neutral-800 hover:border-white hover:text-white'
            }`}
          >
            [ 0{mod.number}. {mod.title.split(' ')[0]} ]
          </button>
        ))}
      </div>

      {/* Modules Feed */}
      <div className="flex flex-col gap-5">
        {filteredModules.map((module, mIdx) => {
          const modCompleted = module.lessons.filter((l) => progress.completedLessons[l.id]).length;
          const isModUnlocked = mIdx === 0 || !!progress.completedLessons[modules[mIdx - 1].lessons[modules[mIdx - 1].lessons.length - 1].id];

          return (
            <div
              key={module.id}
              className={`border-2 transition-all ${
                isModUnlocked
                  ? 'border-white bg-black'
                  : 'border-neutral-800 bg-neutral-950 opacity-50'
              }`}
            >
              {/* Module Header Bar */}
              <div className="p-3.5 border-b border-white/40 bg-neutral-950 flex flex-col gap-1.5">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="font-black bg-white text-black px-1.5 py-0.5 tracking-wider uppercase">
                    MODULE 0{module.number}
                  </span>
                  <span className="text-neutral-400 font-bold">
                    COMPLETED: {modCompleted}/{module.lessons.length}
                  </span>
                </div>

                <h2 className="text-sm font-black uppercase tracking-wide text-white mt-0.5">
                  {module.title}
                </h2>
                <p className="text-[11px] text-neutral-400 font-sans leading-normal">
                  {module.description}
                </p>
              </div>

              {/* Lesson Items */}
              <div className="divide-y divide-neutral-800">
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
                      className={`p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                        unlocked
                          ? 'hover:bg-neutral-900 cursor-pointer'
                          : 'cursor-not-allowed bg-black'
                      }`}
                    >
                      {/* Left: Index & Titles */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <span className="font-mono font-black text-xs text-white border border-neutral-700 bg-neutral-950 px-1.5 py-1 shrink-0">
                          {lIdx + 1 < 10 ? `0${lIdx + 1}` : lIdx + 1}
                        </span>

                        <div className="flex flex-col min-w-0">
                          <h3 className="text-xs font-black uppercase tracking-tight text-white leading-snug">
                            {lesson.title}
                          </h3>

                          <div className="flex items-center gap-2 mt-1 font-mono text-[10px] text-neutral-400">
                            <span>TIME: 03 MIN</span>
                            <span>•</span>
                            <span>THEORY / TEST / TERMINAL</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Sharp Action Button */}
                      <div className="shrink-0 flex items-center self-end sm:self-center">
                        {isCompleted ? (
                          <div className="px-3 py-1.5 border border-white text-white font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 bg-neutral-900">
                            <Check className="w-3 h-3 text-white" />
                            <span>[ COMPLETED ]</span>
                          </div>
                        ) : unlocked ? (
                          <button className="px-3.5 py-1.5 bg-white text-black font-mono text-[10px] font-black uppercase tracking-wider flex items-center gap-1 hover:bg-neutral-200 transition-colors">
                            <span>ENTER LESSON</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <div className="px-2.5 py-1.5 border border-neutral-800 text-neutral-600 font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            <span>[ ACCESS DENIED ]</span>
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
