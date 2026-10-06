import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LessonPath } from './components/LessonPath';
import { LessonModal } from './components/LessonModal';
import { SimulatorView } from './components/SimulatorView';
import { GlossaryView } from './components/GlossaryView';
import { ProfileView } from './components/ProfileView';
import { GlossaryPromoModal } from './components/GlossaryPromoModal';
import { BottomNav, type TabType } from './components/BottomNav';
import { SplashReveal } from './components/SplashReveal';
import { COURSE_MODULES } from './data/courses';
import type { Lesson, UserProgress } from './types';
import { initTelegramApp, getTelegramWebApp, getTelegramUser, haptic } from './services/telegram';

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
  referralCount: 0,
  isGlossaryUnlocked: false,
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

  const [activeTab, setActiveTab] = useState<TabType>('lessons');
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [showGlossaryPromo, setShowGlossaryPromo] = useState<boolean>(false);

  useEffect(() => {
    initTelegramApp();

    // 1. Process URL search parameters
    const urlParams = new URLSearchParams(window.location.search);
    const isUnlockedParam =
      urlParams.get('unlocked') === 'true' ||
      urlParams.get('unlock_glossary') === 'true' ||
      urlParams.get('ref_success') === '1';
    const tabParam = urlParams.get('tab') as TabType;

    if (isUnlockedParam) {
      setProgress((prev) => ({
        ...prev,
        referralCount: Math.max(1, (prev.referralCount || 0) + 1),
        isGlossaryUnlocked: true,
      }));
    }

    if (tabParam && ['lessons', 'simulator', 'glossary', 'profile'].includes(tabParam)) {
      setActiveTab(tabParam);
    }

    // 2. Process Telegram start_param
    const tg = getTelegramWebApp();
    const startParam = tg?.initDataUnsafe?.start_param;
    const currentUser = getTelegramUser();

    if (startParam) {
      if (startParam.startsWith('ref_')) {
        const inviterId = startParam.replace('ref_', '');
        if (inviterId && inviterId !== String(currentUser.id)) {
          fetch(`/api/referral?action=register&inviterId=${inviterId}&friendId=${currentUser.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ inviterId, friendId: currentUser.id }),
          }).catch((err) => console.warn('Referral registration failed', err));
        }
      } else if (startParam === 'unlocked' || startParam === 'glossary') {
        setProgress((prev) => ({
          ...prev,
          referralCount: Math.max(1, (prev.referralCount || 0) + 1),
          isGlossaryUnlocked: true,
        }));
        setActiveTab('glossary');
      }
    }

    // 3. Query remote referral status for currentUser
    if (currentUser.id) {
      fetch(`/api/referral?userId=${currentUser.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.ok && data.referralCount >= 1) {
            setProgress((prev) => ({
              ...prev,
              referralCount: Math.max(prev.referralCount || 0, data.referralCount),
              isGlossaryUnlocked: true,
            }));
          }
        })
        .catch(() => {
          // Offline fallback
        });
    }
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

    const completedLessonId = activeLesson.id;

    setProgress((prev) => {
      const newCompleted = {
        ...prev.completedLessons,
        [completedLessonId]: {
          stars,
          bestScore: Math.max(score, prev.completedLessons[completedLessonId]?.bestScore || 0),
          completedAt: new Date().toISOString(),
        },
      };

      const count = Object.keys(newCompleted).length;
      // Trigger promo after lesson 3 or when 3 lessons completed
      if (count === 3 || completedLessonId === 'lesson-1-3') {
        const seenPromo = localStorage.getItem('cryptolingo_seen_glossary_promo');
        if (!seenPromo) {
          localStorage.setItem('cryptolingo_seen_glossary_promo', 'true');
          setTimeout(() => {
            setShowGlossaryPromo(true);
          }, 400);
        }
      }

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

  const handleUnlockGlossary = () => {
    setProgress((prev) => ({
      ...prev,
      referralCount: Math.max(1, (prev.referralCount || 0) + 1),
      isGlossaryUnlocked: true,
    }));
  };

  return (
    <div className="min-h-screen bg-[#06080E] text-slate-100 flex flex-col selection:bg-white/20 font-sans">
      {/* Intro Splash Video on launch */}
      {showSplash && (
        <SplashReveal onComplete={() => setShowSplash(false)} />
      )}

      {/* Header */}
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

        {activeTab === 'glossary' && (
          <GlossaryView
            progress={progress}
            onUnlockGlossary={handleUnlockGlossary}
          />
        )}

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

      {/* Milestone Modal: Glossary Promo after Lesson 3 */}
      {showGlossaryPromo && (
        <GlossaryPromoModal
          onClose={() => setShowGlossaryPromo(false)}
          onGoToGlossary={() => {
            setShowGlossaryPromo(false);
            setActiveTab('glossary');
          }}
        />
      )}

      {/* Bottom Nav */}
      <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />
    </div>
  );
};

export default App;
