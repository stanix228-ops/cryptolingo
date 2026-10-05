import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LessonPath } from './components/LessonPath';
import { LessonModal } from './components/LessonModal';
import { SimulatorView } from './components/SimulatorView';
import { ProfileView } from './components/ProfileView';
import { BottomNav } from './components/BottomNav';
import { SplashReveal } from './components/SplashReveal';
import { COURSE_MODULES } from './data/courses';
import type { Lesson, UserProgress } from './types';
import { initTelegramApp, haptic } from './services/telegram';

const STORAGE_KEY = 'cryptolingo_user_progress';

const DEFAULT_PROGRESS: UserProgress = {
  xp: 0,
  coins: 100,
  streakDays: 1,
  lastActiveDate: new Date().toISOString().slice(0, 10),
  lives: 5,
  maxLives: 5,
  lastLifeLostTimestamp: null,
  completedLessons: {},
  unlockedModules: ['module-1'],
  equippedTitle: 'Junior Trader',
};

export const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);

  const [progress, setProgress] = useState<UserProgress>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_PROGRESS;
    } catch {
      return DEFAULT_PROGRESS;
    }
  });

  const [activeTab, setActiveTab] = useState<'lessons' | 'simulator' | 'profile'>('lessons');
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    initTelegramApp();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.error('Failed to save user progress', e);
    }
  }, [progress]);

  // Handle life regeneration (1 life every 15 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev.lives < prev.maxLives) {
          return {
            ...prev,
            lives: Math.min(prev.maxLives, prev.lives + 1),
          };
        }
        return prev;
      });
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleCompleteLesson = (score: number, stars: number) => {
    if (!activeLesson) return;

    setProgress((prev) => {
      const newCompleted = {
        ...prev.completedLessons,
        [activeLesson.id]: {
          stars,
          bestScore: Math.max(score, prev.completedLessons[activeLesson.id]?.bestScore || 0),
          completedAt: new Date().toISOString(),
        },
      };

      return {
        ...prev,
        xp: prev.xp + activeLesson.xpReward,
        coins: prev.coins + activeLesson.coinReward,
        completedLessons: newCompleted,
      };
    });

    setActiveLesson(null);
  };

  const handleLifeLost = () => {
    setProgress((prev) => ({
      ...prev,
      lives: Math.max(0, prev.lives - 1),
      lastLifeLostTimestamp: Date.now(),
    }));
  };

  const handleRefillLives = () => {
    setProgress((prev) => ({
      ...prev,
      lives: prev.maxLives,
    }));
  };

  return (
    <div className="min-h-screen bg-[#06080E] text-slate-100 flex flex-col selection:bg-[#00C076]/20 font-sans">
      {/* Intro Splash Video on launch */}
      {showSplash && (
        <SplashReveal onComplete={() => setShowSplash(false)} />
      )}

      {/* Persistent OKX Header */}
      <Header
        progress={progress}
        onOpenProfile={() => setActiveTab('profile')}
        onOpenSimulator={() => setActiveTab('simulator')}
        activeTab={activeTab}
      />

      {/* Main Tab Content */}
      <main className="flex-1 overflow-x-hidden">
        {activeTab === 'lessons' && (
          <LessonPath
            modules={COURSE_MODULES}
            progress={progress}
            onSelectLesson={(lesson) => {
              if (progress.lives > 0) {
                setActiveLesson(lesson);
              } else {
                haptic.error();
                alert('Лимит попыток исчерпан. Ожидайте автоматического восстановления либо пригласите партнера.');
              }
            }}
          />
        )}

        {activeTab === 'simulator' && <SimulatorView />}

        {activeTab === 'profile' && (
          <ProfileView
            progress={progress}
            onRefillLives={handleRefillLives}
          />
        )}
      </main>

      {/* Lesson Modal */}
      {activeLesson && (
        <LessonModal
          lesson={activeLesson}
          onClose={() => setActiveLesson(null)}
          onComplete={handleCompleteLesson}
          onLifeLost={handleLifeLost}
        />
      )}

      {/* Bottom Nav */}
      <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />
    </div>
  );
};

export default App;
