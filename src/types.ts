export type StepType = 'theory' | 'quiz' | 'practice';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ChartCandle {
  time: number | string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export type PracticeActionType = 
  | 'find_candle'        // Click the specific candle (e.g. Pin-bar, Hammer, Doji)
  | 'draw_level'         // Select or place support/resistance level
  | 'place_trade'        // Choose Long/Short, set SL/TP and simulate forward
  | 'predict_trend';     // Predict Up / Down for the next N candles

export interface PracticeScenario {
  symbol: string;
  timeframe: string;
  instruction: string;
  hint: string;
  actionType: PracticeActionType;
  initialCandles: ChartCandle[];
  futureCandles?: ChartCandle[];
  targetCandleIndex?: number; // For 'find_candle'
  targetLevelPrice?: number;  // For 'draw_level'
  tolerancePercent?: number;  // Tolerance for price level
  expectedDirection?: 'LONG' | 'SHORT'; // For 'place_trade' or 'predict_trend'
  minRiskReward?: number;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  shortDesc: string;
  icon: string;
  xpReward: number;
  coinReward: number;
  theory: {
    title: string;
    badge: string;
    points: {
      headline: string;
      text: string;
      highlight?: string;
      badgeType?: 'bull' | 'bear' | 'warning' | 'info';
    }[];
    proTip?: string;
    authorQuote?: string; // e.g. Quotes from Gerchik / Course
  };
  quiz: QuizQuestion[];
  practice: PracticeScenario;
}

export interface Module {
  id: string;
  number: number;
  title: string;
  description: string;
  badge: string;
  accentColor: string;
  lessons: Lesson[];
  requiredXp?: number;
}

export interface UserProgress {
  xp: number;
  coins: number;
  streakDays: number;
  lastActiveDate: string;
  lives: number;
  maxLives: number;
  lastLifeLostTimestamp: number | null;
  completedLessons: Record<string, { stars: number; bestScore: number; completedAt: string }>;
  unlockedModules: string[];
  equippedTitle: string;
  referralCount?: number;
  isGlossaryUnlocked?: boolean;
  unlockedAchievements?: string[];
  claimedAchievements?: string[];
  tradingStats?: {
    totalTrades: number;
    winningTrades: number;
    maxLeverageUsed: number;
    totalPnlUsd: number;
  };
}
