import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LessonPath } from './components/LessonPath';
import { LessonModal } from './components/LessonModal';
import { SimulatorView } from './components/SimulatorView';
import { GlossaryView } from './components/GlossaryView';
import { ProfileView } from './components/ProfileView';
import { GlossaryPromoModal } from './components/GlossaryPromoModal';
import { LivesShopModal } from './components/LivesShopModal';
import { ToastNotification, type ToastMessage } from './components/ToastNotification';
import { BottomNav, type TabType } from './components/BottomNav';
import { SplashReveal } from './components/SplashReveal';
import { COURSE_MODULES } from './data/courses';
import { ACHIEVEMENTS } from './data/achievements';
import type { Lesson, UserProgress } from './types';
import { initTelegramApp, getTelegramWebApp, getTelegramUser, haptic } from './services/telegram';

const STORAGE_KEY = 'cryptolingo_user_progress';

const DEFAULT_PROGRESS: UserProgress = {
  xp: 100, // Welcome bonus XP for every new trader
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
  unlockedAchievements: [],
  claimedAchievements: [],
  tradingStats: {
    totalTrades: 0,
    winningTrades: 0,
    maxLeverageUsed: 1,
    totalPnlUsd: 0,
  },
};

export const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);

  const [progress, setProgress] = useState<UserProgress>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_PROGRESS,
          ...parsed,
          claimedAchievements: parsed.claimedAchievements || [],
          tradingStats: parsed.tradingStats || DEFAULT_PROGRESS.tradingStats,
        };
      }
      return DEFAULT_PROGRESS;
    } catch {
      return DEFAULT_PROGRESS;
    }
  });

  const [activeTab, setActiveTab] = useState<TabType>('lessons');
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [showGlossaryPromo, setShowGlossaryPromo] = useState<boolean>(false);
  const [showLivesShop, setShowLivesShop] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (title: string, subtitle?: string, xpAmount?: number, type: 'xp' | 'success' | 'info' = 'xp') => {
    const newToast: ToastMessage = {
      id: `${Date.now()}-${Math.random()}`,
      title,
      subtitle,
      xpAmount,
      type,
    };
    setToasts((prev) => [newToast, ...prev.slice(0, 2)]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

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
        xp: prev.xp + 100,
        referralCount: Math.max(1, (prev.referralCount || 0) + 1),
        isGlossaryUnlocked: true,
      }));
      addToast('БОНУС РЕФЕРАЛА', 'Словарь разблокирован', 100, 'xp');
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
          xp: prev.xp + 100,
          referralCount: Math.max(1, (prev.referralCount || 0) + 1),
          isGlossaryUnlocked: true,
        }));
        addToast('СЛОВАРЬ РАЗБЛОКИРОВАН', 'Доступ открыт', 100, 'xp');
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

    // 4. Daily streak & check active date
    const todayStr = new Date().toISOString().slice(0, 10);
    setProgress((prev) => {
      if (prev.lastActiveDate === todayStr) return prev;

      const lastDate = new Date(prev.lastActiveDate);
      const todayDate = new Date(todayStr);
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));

      if (diffDays === 1) {
        addToast('БОНУС СТРЕЙКА', `${(prev.streakDays || 1) + 1} дней подряд`, 25, 'xp');
        return {
          ...prev,
          streakDays: (prev.streakDays || 1) + 1,
          lastActiveDate: todayStr,
          xp: prev.xp + 25,
        };
      } else if (diffDays > 1) {
        return {
          ...prev,
          streakDays: 1,
          lastActiveDate: todayStr,
          xp: prev.xp + 10,
        };
      }
      return prev;
    });
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
        const max = prev.maxLives || 5;
        if (prev.lives < max) {
          addToast('+1 ЖИЗНЬ ВОССТАНОВЛЕНА', 'Авто-регенерация', undefined, 'success');
          return {
            ...prev,
            lives: Math.min(max, prev.lives + 1),
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
    const reward = activeLesson.xpReward;

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
        xp: prev.xp + reward,
        coins: prev.coins + activeLesson.coinReward,
        completedLessons: newCompleted,
      };
    });

    addToast('УРОК СДАН', activeLesson.title, reward, 'xp');
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
      lives: prev.maxLives || 5,
    }));
    addToast('ЖИЗНИ ВОССТАНОВЛЕНЫ', 'Полный комплект (5/5)', undefined, 'success');
  };

  // Buy Lives with XP
  const handleBuyLives = (amount: number, xpCost: number) => {
    setProgress((prev) => {
      if (prev.xp < xpCost) return prev;
      const max = prev.maxLives || 5;
      return {
        ...prev,
        xp: prev.xp - xpCost,
        lives: Math.min(max, prev.lives + amount),
      };
    });
    addToast(`+${amount} ЖИЗНЕЙ ПОПОЛНЕНО`, `Списано -${xpCost} XP`, undefined, 'success');
  };

  // Upgrade Max Lives with XP
  const handleUpgradeMaxLives = (extraLives: number, xpCost: number) => {
    setProgress((prev) => {
      if (prev.xp < xpCost) return prev;
      const newMax = (prev.maxLives || 5) + extraLives;
      return {
        ...prev,
        xp: prev.xp - xpCost,
        maxLives: newMax,
        lives: newMax,
      };
    });
    addToast('UPGRADE: МАКСИМУМ ЖИЗНЕЙ УВЕЛИЧЕН', `Новый лимит: ${(progress.maxLives || 5) + extraLives}`, undefined, 'success');
  };

  // Claim Individual Achievement XP
  const handleClaimAchievement = (achId: string, rewardXp: number) => {
    const ach = ACHIEVEMENTS.find((a) => a.id === achId);
    setProgress((prev) => {
      const claimed = prev.claimedAchievements || [];
      if (claimed.includes(achId)) return prev;
      haptic.success();
      return {
        ...prev,
        xp: prev.xp + rewardXp,
        claimedAchievements: [...claimed, achId],
      };
    });
    addToast('НАГРАДА ПОЛУЧЕНА', ach?.title || 'Достижение разблокировано', rewardXp, 'xp');
  };

  // Claim All Unclaimed Achievements XP
  const handleClaimAllAchievements = () => {
    setProgress((prev) => {
      const claimed = prev.claimedAchievements || [];
      const unclaimed = ACHIEVEMENTS.filter(
        (ach) => ach.checkUnlocked(prev) && !claimed.includes(ach.id)
      );

      if (unclaimed.length === 0) return prev;

      const totalXp = unclaimed.reduce((sum, ach) => sum + ach.rewardXp, 0);
      const newClaimedIds = unclaimed.map((ach) => ach.id);

      haptic.success();
      addToast('ВСЕ НАГРАДЫ ПОЛУЧЕНЫ', `Забрано ${unclaimed.length} наград`, totalXp, 'xp');
      return {
        ...prev,
        xp: prev.xp + totalXp,
        claimedAchievements: [...claimed, ...newClaimedIds],
      };
    });
  };

  // Terminal Trade complete callback
  const handleTradeComplete = (stats: { isWin: boolean; pnlUsd: number; leverage: number }) => {
    const earnedXp = stats.isWin ? 10 : 2;

    setProgress((prev) => {
      const prevStats = prev.tradingStats || {
        totalTrades: 0,
        winningTrades: 0,
        maxLeverageUsed: 1,
        totalPnlUsd: 0,
      };

      const newStats = {
        totalTrades: prevStats.totalTrades + 1,
        winningTrades: prevStats.winningTrades + (stats.isWin ? 1 : 0),
        maxLeverageUsed: Math.max(prevStats.maxLeverageUsed, stats.leverage),
        totalPnlUsd: Number((prevStats.totalPnlUsd + stats.pnlUsd).toFixed(2)),
      };

      return {
        ...prev,
        xp: prev.xp + earnedXp,
        tradingStats: newStats,
      };
    });

    if (stats.isWin) {
      addToast('ПРИБЫЛЬНАЯ СДЕЛКА', `PnL: +$${stats.pnlUsd}`, 10, 'xp');
    } else {
      addToast('СДЕЛКА ИСПОЛНЕНА', `Плечо ${stats.leverage}x`, 2, 'xp');
    }
  };

  const handleUnlockGlossary = () => {
    setProgress((prev) => ({
      ...prev,
      xp: prev.xp + 100,
      referralCount: Math.max(1, (prev.referralCount || 0) + 1),
      isGlossaryUnlocked: true,
    }));
    addToast('СЛОВАРЬ РАЗБЛОКИРОВАН', 'Полный доступ открыт', 100, 'xp');
  };

  return (
    <div className="min-h-screen bg-[#06080E] text-slate-100 flex flex-col selection:bg-white/20 font-sans">
      {/* Real-time Toast Notifications */}
      <ToastNotification toasts={toasts} onDismiss={removeToast} />

      {/* Intro Splash Video on launch */}
      {showSplash && (
        <SplashReveal onComplete={() => setShowSplash(false)} />
      )}

      {/* Header */}
      <Header
        progress={progress}
        onOpenProfile={() => setActiveTab('profile')}
        onOpenSimulator={() => setActiveTab('simulator')}
        onOpenLivesShop={() => setShowLivesShop(true)}
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
                setShowLivesShop(true);
              }
            }}
          />
        )}

        {activeTab === 'simulator' && (
          <SimulatorView onTradeComplete={handleTradeComplete} />
        )}

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
            onOpenLivesShop={() => setShowLivesShop(true)}
            onClaimAchievement={handleClaimAchievement}
            onClaimAllAchievements={handleClaimAllAchievements}
          />
        )}
      </main>

      {/* Lesson Modal */}
      {activeLesson && (
        <LessonModal
          lesson={activeLesson}
          lives={progress.lives}
          userXp={progress.xp}
          onClose={() => setActiveLesson(null)}
          onComplete={handleCompleteLesson}
          onLifeLost={handleLifeLost}
          onBuyLives={handleBuyLives}
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

      {/* Energy & Lives Shop Modal */}
      {showLivesShop && (
        <LivesShopModal
          progress={progress}
          onClose={() => setShowLivesShop(false)}
          onBuyLives={handleBuyLives}
          onUpgradeMaxLives={handleUpgradeMaxLives}
        />
      )}

      {/* Bottom Nav */}
      <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />
    </div>
  );
};

export default App;
