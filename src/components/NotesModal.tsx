import React, { useState } from 'react';
import { X, Bookmark, Search, Layers, Check, Zap, ArrowRight, BookOpen } from 'lucide-react';
import type { UserProgress, Lesson } from '../types';
import { COURSE_MODULES } from '../data/courses';
import { haptic } from '../services/telegram';

interface NotesModalProps {
  progress: UserProgress;
  onClose: () => void;
  onOpenLesson: (lesson: Lesson) => void;
}

export const NotesModal: React.FC<NotesModalProps> = ({
  progress,
  onClose,
  onOpenLesson,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const savedIds = progress.savedNotes || [];

  const allLessons = COURSE_MODULES.flatMap((m) => m.lessons);
  // Show saved lessons, or completed lessons if none explicitly saved yet
  const availableLessons = allLessons.filter(
    (l) => savedIds.includes(l.id) || progress.completedLessons[l.id]
  );

  const filteredLessons = availableLessons.filter((l) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      l.title.toLowerCase().includes(q) ||
      l.shortDesc.toLowerCase().includes(q) ||
      l.theory.points.some((p) => p.headline.toLowerCase().includes(q) || p.text.toLowerCase().includes(q))
    );
  });

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3.5 select-none font-mono text-white animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-black border border-white/30 flex flex-col p-4.5 gap-4 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/15 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-white text-black flex items-center justify-center font-bold text-xs">
              <Bookmark className="w-3.5 h-3.5 fill-black text-black" />
            </div>
            <div>
              <h2 className="text-xs font-black uppercase text-white tracking-wider">
                КОНСПЕКТ ТРЕЙДЕРА // ШПАРГАЛКА
              </h2>
              <span className="text-[9px] text-neutral-400 uppercase tracking-widest block">
                СХЕМЫ, ЧЕК-ЛИСТЫ И ФОРМУЛЫ
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 bg-neutral-950 border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по конспекту и формулам..."
            className="w-full pl-8 pr-3 py-2 bg-neutral-950 border border-white/20 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-white font-mono"
          />
        </div>

        {/* Counter */}
        <div className="flex items-center justify-between text-[10px] text-neutral-400 px-0.5">
          <span>СОХРАНЕНО СТАТЕЙ: {filteredLessons.length}</span>
          <span className="text-white font-bold">[ БАЗА ЗНАНИЙ ]</span>
        </div>

        {/* Notes list */}
        <div className="flex flex-col gap-3">
          {filteredLessons.length === 0 ? (
            <div className="p-6 border border-white/15 bg-neutral-950 text-center flex flex-col items-center gap-2">
              <BookOpen className="w-6 h-6 text-neutral-500" />
              <p className="text-xs text-neutral-400 font-sans">
                У вас пока нет сохраненных заметок. Проходите уроки и нажимайте кнопку «В КОНСПЕКТ», чтобы собирать шпаргалку!
              </p>
            </div>
          ) : (
            filteredLessons.map((lesson) => (
              <div
                key={lesson.id}
                className="p-3.5 bg-neutral-950 border border-white/20 flex flex-col gap-2.5"
              >
                <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-1.5">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-neutral-400 uppercase tracking-widest">
                      {lesson.theory.badge}
                    </span>
                    <h3 className="text-xs font-black uppercase text-white leading-snug">
                      {lesson.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      haptic.medium();
                      onClose();
                      onOpenLesson(lesson);
                    }}
                    className="px-2 py-1 bg-white text-black font-black text-[9px] uppercase tracking-wider hover:bg-neutral-200 transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                  >
                    <span>ОТКРЫТЬ</span>
                    <ArrowRight className="w-2.5 h-2.5 stroke-[3]" />
                  </button>
                </div>

                {/* Checklist preview */}
                {lesson.theory.checklist && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-neutral-400 uppercase font-bold">
                      ЧЕК-ЛИСТ ВХОДА:
                    </span>
                    {lesson.theory.checklist.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-[10px] text-neutral-300">
                        <Check className="w-2.5 h-2.5 text-white shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Risk formula preview */}
                {lesson.theory.riskFormula && (
                  <div className="p-2 bg-black border border-white/10 text-[9px] flex flex-col gap-0.5">
                    <span className="text-neutral-400 font-bold">ФОРМУЛА:</span>
                    <span className="text-white font-bold">{lesson.theory.riskFormula.formula}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-neutral-950 border border-white/20 text-neutral-400 font-bold text-[10px] uppercase tracking-wider hover:text-white hover:border-white transition-colors cursor-pointer"
        >
          [ ЗАКРЫТЬ ]
        </button>
      </div>
    </div>
  );
};
