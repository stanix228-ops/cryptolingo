import type { UserProgress } from '../types';
import {
  Zap,
  BookOpen,
  Award,
  Shield,
  Flame,
  TrendingUp,
  Target,
  Sparkles,
  Users,
  Compass,
  DollarSign,
  Scale,
  Brain,
  Crosshair,
  Crown,
  Trophy,
  CheckCircle2,
  Lock,
  Layers,
  BarChart2,
} from 'lucide-react';

export interface Achievement {
  id: string;
  title: string;
  category: 'academy' | 'terminal' | 'social' | 'mastery';
  categoryLabel: string;
  description: string;
  rewardXp: number;
  iconName: string;
  checkUnlocked: (p: UserProgress) => boolean;
  getProgress: (p: UserProgress) => { current: number; max: number; label: string };
}

export const ACHIEVEMENTS: Achievement[] = [
  // 1. Первый шаг
  {
    id: 'ach-first-step',
    title: 'Первый шаг',
    category: 'academy',
    categoryLabel: 'ОБУЧЕНИЕ',
    description: 'Пройти свой первый теоретический и практический урок',
    rewardXp: 50,
    iconName: 'BookOpen',
    checkUnlocked: (p) => Object.keys(p.completedLessons || {}).length >= 1,
    getProgress: (p) => {
      const c = Object.keys(p.completedLessons || {}).length;
      return { current: Math.min(1, c), max: 1, label: `${Math.min(1, c)} / 1` };
    },
  },

  // 2. Адепт блокчейна
  {
    id: 'ach-module-1',
    title: 'Адепт блокчейна',
    category: 'academy',
    categoryLabel: 'ОБУЧЕНИЕ',
    description: 'Полностью завершить все 10 уроков Модуля 01',
    rewardXp: 100,
    iconName: 'Layers',
    checkUnlocked: (p) => {
      const m1Lessons = Array.from({ length: 10 }, (_, i) => `lesson-1-${i + 1}`);
      return m1Lessons.every((id) => !!p.completedLessons[id]);
    },
    getProgress: (p) => {
      const m1Lessons = Array.from({ length: 10 }, (_, i) => `lesson-1-${i + 1}`);
      const done = m1Lessons.filter((id) => !!p.completedLessons[id]).length;
      return { current: done, max: 10, label: `${done} / 10` };
    },
  },

  // 3. Эрудит рынка
  {
    id: 'ach-three-modules',
    title: 'Эрудит рынка',
    category: 'academy',
    categoryLabel: 'ОБУЧЕНИЕ',
    description: 'Завершить 3 полных обучающих модуля (30 уроков)',
    rewardXp: 200,
    iconName: 'Compass',
    checkUnlocked: (p) => Object.keys(p.completedLessons || {}).length >= 30,
    getProgress: (p) => {
      const c = Object.keys(p.completedLessons || {}).length;
      return { current: Math.min(30, c), max: 30, label: `${Math.min(30, c)} / 30` };
    },
  },

  // 4. Экватор знаний
  {
    id: 'ach-halfway',
    title: 'Экватор знаний',
    category: 'academy',
    categoryLabel: 'ОБУЧЕНИЕ',
    description: 'Успешно пройти 50 уроков учебного плана',
    rewardXp: 350,
    iconName: 'Target',
    checkUnlocked: (p) => Object.keys(p.completedLessons || {}).length >= 50,
    getProgress: (p) => {
      const c = Object.keys(p.completedLessons || {}).length;
      return { current: Math.min(50, c), max: 50, label: `${Math.min(50, c)} / 50` };
    },
  },

  // 5. Институционал
  {
    id: 'ach-master-100',
    title: 'Институционал',
    category: 'mastery',
    categoryLabel: 'МАСТЕРСТВО',
    description: 'Пройти все 100 уроков курса от основ до про-стратегий',
    rewardXp: 1000,
    iconName: 'Crown',
    checkUnlocked: (p) => Object.keys(p.completedLessons || {}).length >= 100,
    getProgress: (p) => {
      const c = Object.keys(p.completedLessons || {}).length;
      return { current: Math.min(100, c), max: 100, label: `${Math.min(100, c)} / 100` };
    },
  },

  // 6. Абсолютная точность
  {
    id: 'ach-perfect-test',
    title: 'Абсолютная точность',
    category: 'academy',
    categoryLabel: 'ОБУЧЕНИЕ',
    description: 'Сдать любой квалификационный тест без единой ошибки на 3 звезды',
    rewardXp: 75,
    iconName: 'CheckCircle2',
    checkUnlocked: (p) => Object.values(p.completedLessons || {}).some((l) => l.stars === 3),
    getProgress: (p) => {
      const ok = Object.values(p.completedLessons || {}).some((l) => l.stars === 3);
      return { current: ok ? 1 : 0, max: 1, label: ok ? '1 / 1' : '0 / 1' };
    },
  },

  // 7. Дисциплина новичка
  {
    id: 'ach-streak-3',
    title: 'Дисциплина новичка',
    category: 'social',
    categoryLabel: 'ДИСЦИПЛИНА',
    description: 'Поддерживать ежедневный стрейк активности 3 дня подряд',
    rewardXp: 60,
    iconName: 'Flame',
    checkUnlocked: (p) => (p.streakDays || 0) >= 3,
    getProgress: (p) => {
      const s = p.streakDays || 1;
      return { current: Math.min(3, s), max: 3, label: `${Math.min(3, s)} / 3 ДНЕЙ` };
    },
  },

  // 8. Железная выдержка
  {
    id: 'ach-streak-7',
    title: 'Железная выдержка',
    category: 'social',
    categoryLabel: 'ДИСЦИПЛИНА',
    description: 'Поддерживать ежедневный стрейк активности 7 дней подряд',
    rewardXp: 150,
    iconName: 'Flame',
    checkUnlocked: (p) => (p.streakDays || 0) >= 7,
    getProgress: (p) => {
      const s = p.streakDays || 1;
      return { current: Math.min(7, s), max: 7, label: `${Math.min(7, s)} / 7 ДНЕЙ` };
    },
  },

  // 9. Легенда рынка
  {
    id: 'ach-streak-30',
    title: 'Легенда рынка',
    category: 'social',
    categoryLabel: 'ДИСЦИПЛИНА',
    description: 'Достичь непрерывного стрейка активности в 30 дней',
    rewardXp: 500,
    iconName: 'Trophy',
    checkUnlocked: (p) => (p.streakDays || 0) >= 30,
    getProgress: (p) => {
      const s = p.streakDays || 1;
      return { current: Math.min(30, s), max: 30, label: `${Math.min(30, s)} / 30 ДНЕЙ` };
    },
  },

  // 10. Набор высоты
  {
    id: 'ach-xp-500',
    title: 'Набор высоты',
    category: 'mastery',
    categoryLabel: 'КВАЛИФИКАЦИЯ',
    description: 'Набрать 500+ квалификационных очков XP в профиле',
    rewardXp: 100,
    iconName: 'Zap',
    checkUnlocked: (p) => (p.xp || 0) >= 500,
    getProgress: (p) => {
      const x = p.xp || 0;
      return { current: Math.min(500, x), max: 500, label: `${Math.min(500, x)} / 500 XP` };
    },
  },

  // 11. Торговый гроссмейстер
  {
    id: 'ach-xp-2000',
    title: 'Торговый гроссмейстер',
    category: 'mastery',
    categoryLabel: 'КВАЛИФИКАЦИЯ',
    description: 'Набрать 2,000+ очков XP и получить статус Senior Trader',
    rewardXp: 300,
    iconName: 'Award',
    checkUnlocked: (p) => (p.xp || 0) >= 2000,
    getProgress: (p) => {
      const x = p.xp || 0;
      return { current: Math.min(2000, x), max: 2000, label: `${Math.min(2000, x)} / 2000 XP` };
    },
  },

  // 12. Первый ордер
  {
    id: 'ach-first-trade',
    title: 'Первый ордер',
    category: 'terminal',
    categoryLabel: 'ТЕРМИНАЛ',
    description: 'Исполнить свою первую сделку в биржевом симуляторе',
    rewardXp: 50,
    iconName: 'Crosshair',
    checkUnlocked: (p) => (p.tradingStats?.totalTrades || 0) >= 1,
    getProgress: (p) => {
      const t = p.tradingStats?.totalTrades || 0;
      return { current: Math.min(1, t), max: 1, label: `${Math.min(1, t)} / 1` };
    },
  },

  // 13. Зеленый день
  {
    id: 'ach-profit-trade',
    title: 'Зеленый день',
    category: 'terminal',
    categoryLabel: 'ТЕРМИНАЛ',
    description: 'Закрыть позицию в терминале с положительным PnL',
    rewardXp: 75,
    iconName: 'TrendingUp',
    checkUnlocked: (p) => (p.tradingStats?.winningTrades || 0) >= 1,
    getProgress: (p) => {
      const w = p.tradingStats?.winningTrades || 0;
      return { current: Math.min(1, w), max: 1, label: `${Math.min(1, w)} / 1` };
    },
  },

  // 14. Снайпер рынка
  {
    id: 'ach-winrate-70',
    title: 'Снайпер рынка',
    category: 'terminal',
    categoryLabel: 'ТЕРМИНАЛ',
    description: 'Закрыть 5 прибыльных сделок в симуляторе',
    rewardXp: 150,
    iconName: 'Target',
    checkUnlocked: (p) => (p.tradingStats?.winningTrades || 0) >= 5,
    getProgress: (p) => {
      const w = p.tradingStats?.winningTrades || 0;
      return { current: Math.min(5, w), max: 5, label: `${Math.min(5, w)} / 5` };
    },
  },

  // 15. Укротитель плеча
  {
    id: 'ach-high-leverage',
    title: 'Укротитель плеча',
    category: 'terminal',
    categoryLabel: 'ТЕРМИНАЛ',
    description: 'Успешно закрыть позицию с плечом 20x или 50x в плюс',
    rewardXp: 120,
    iconName: 'Zap',
    checkUnlocked: (p) => (p.tradingStats?.maxLeverageUsed || 0) >= 20 && (p.tradingStats?.winningTrades || 0) >= 1,
    getProgress: (p) => {
      const lev = p.tradingStats?.maxLeverageUsed || 1;
      return { current: Math.min(20, lev), max: 20, label: `${lev}x / 20x` };
    },
  },

  // 16. Магнат симулятора
  {
    id: 'ach-profit-1000',
    title: 'Магнат симулятора',
    category: 'terminal',
    categoryLabel: 'ТЕРМИНАЛ',
    description: 'Заработать суммарно +$1,000 PnL чистой прибыли в терминале',
    rewardXp: 250,
    iconName: 'DollarSign',
    checkUnlocked: (p) => (p.tradingStats?.totalPnlUsd || 0) >= 1000,
    getProgress: (p) => {
      const pnl = Math.max(0, p.tradingStats?.totalPnlUsd || 0);
      return { current: Math.min(1000, Math.round(pnl)), max: 1000, label: `$${Math.round(pnl)} / $1,000` };
    },
  },

  // 17. Командный игрок
  {
    id: 'ach-referral-1',
    title: 'Командный игрок',
    category: 'social',
    categoryLabel: 'СООБЩЕСТВО',
    description: 'Пригласить 1 друга по персональной реферальной ссылке',
    rewardXp: 100,
    iconName: 'Users',
    checkUnlocked: (p) => (p.referralCount || 0) >= 1,
    getProgress: (p) => {
      const r = p.referralCount || 0;
      return { current: Math.min(1, r), max: 1, label: `${Math.min(1, r)} / 1` };
    },
  },

  // 18. Амбассадор CryptoLingo
  {
    id: 'ach-referral-3',
    title: 'Амбассадор CryptoLingo',
    category: 'social',
    categoryLabel: 'СООБЩЕСТВО',
    description: 'Пригласить 3 партнеров в обучающую академию',
    rewardXp: 300,
    iconName: 'Sparkles',
    checkUnlocked: (p) => (p.referralCount || 0) >= 3,
    getProgress: (p) => {
      const r = p.referralCount || 0;
      return { current: Math.min(3, r), max: 3, label: `${Math.min(3, r)} / 3` };
    },
  },

  // 19. Живой словарь
  {
    id: 'ach-glossary-master',
    title: 'Живой словарь',
    category: 'mastery',
    categoryLabel: 'БАЗА ЗНАНИЙ',
    description: 'Разблокировать доступ к полной базе терминов и Price Action',
    rewardXp: 80,
    iconName: 'BookOpen',
    checkUnlocked: (p) => !!p.isGlossaryUnlocked,
    getProgress: (p) => {
      const ok = !!p.isGlossaryUnlocked;
      return { current: ok ? 1 : 0, max: 1, label: ok ? '1 / 1 РАЗБЛОКИРОВАНО' : '0 / 1 ЗАКРЫТО' };
    },
  },

  // 20. Риск-контроллер
  {
    id: 'ach-iron-risk',
    title: 'Риск-контроллер',
    category: 'mastery',
    categoryLabel: 'МАСТЕРСТВО',
    description: 'Завершить все 10 уроков Модуля 08 (Риск-менеджмент и капитал)',
    rewardXp: 200,
    iconName: 'Shield',
    checkUnlocked: (p) => {
      const m8Lessons = Array.from({ length: 10 }, (_, i) => `lesson-8-${i + 1}`);
      return m8Lessons.every((id) => !!p.completedLessons[id]);
    },
    getProgress: (p) => {
      const m8Lessons = Array.from({ length: 10 }, (_, i) => `lesson-8-${i + 1}`);
      const done = m8Lessons.filter((id) => !!p.completedLessons[id]).length;
      return { current: done, max: 10, label: `${done} / 10` };
    },
  },
];
