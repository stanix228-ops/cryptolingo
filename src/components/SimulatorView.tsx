import React, { useState } from 'react';
import { TradingChart } from './TradingChart';
import { Play, TrendingUp, TrendingDown, RefreshCw, Zap, Shield, Award } from 'lucide-react';
import { haptic } from '../services/telegram';

export const SimulatorView: React.FC = () => {
  const [balance, setBalance] = useState(10000); // $10,000 virtual USDT
  const [winCount, setWinCount] = useState(3);
  const [lossCount, setLossCount] = useState(1);
  const [key, setKey] = useState(0);

  // Sample historical challenge: BTC Dump Reversal
  const scenario = {
    symbol: 'BTC/USDT (Исторический реплей)',
    candles: [
      { time: '2024-05-10', open: 63000, high: 63500, low: 61500, close: 61800 },
      { time: '2024-05-11', open: 61800, high: 62200, low: 60100, close: 60400 },
      { time: '2024-05-12', open: 60400, high: 60800, low: 58500, close: 58900 },
      { time: '2024-05-13', open: 58900, high: 59300, low: 56500, close: 58800 }, // Pin-bar / Reversal
    ],
    futureCandles: [
      { time: '2024-05-14', open: 58800, high: 61200, low: 58400, close: 60800 },
      { time: '2024-05-15', open: 60800, high: 63500, low: 60500, close: 63000 },
      { time: '2024-05-16', open: 63000, high: 66000, low: 62800, close: 65500 },
    ],
  };

  const handleSuccess = () => {
    setBalance((prev) => prev + 600);
    setWinCount((prev) => prev + 1);
  };

  const handleError = () => {
    setBalance((prev) => Math.max(0, prev - 200));
    setLossCount((prev) => prev + 1);
  };

  const handleReset = () => {
    setKey((prev) => prev + 1);
    haptic.selection();
  };

  const winrate = Math.round((winCount / (winCount + lossCount || 1)) * 100);

  return (
    <div className="flex flex-col max-w-md mx-auto px-4 py-4 pb-24 gap-4 animate-fadeIn">
      {/* Top Simulator Stats Bar */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col">
          <span className="text-[10px] text-slate-400 font-semibold">Баланс тренажера</span>
          <span className="text-sm font-black text-emerald-400 font-mono">
            ${balance.toLocaleString()}
          </span>
        </div>

        <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col">
          <span className="text-[10px] text-slate-400 font-semibold">Винрейт</span>
          <span className="text-sm font-black text-amber-400 font-mono">{winrate}%</span>
        </div>

        <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col">
          <span className="text-[10px] text-slate-400 font-semibold">Сделки W/L</span>
          <span className="text-sm font-black text-slate-200 font-mono">
            {winCount} / {lossCount}
          </span>
        </div>
      </div>

      {/* Simulator Scenario Card */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
            Режим: Машина времени
          </span>
          <h3 className="text-xs font-bold text-white mt-1">
            Тест стратегии на историческом развороте
          </h3>
        </div>
        <button
          onClick={handleReset}
          className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors"
          title="Сбросить сценарий"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Trading Chart */}
      <div key={key} className="h-[360px] w-full">
        <TradingChart
          candles={scenario.candles}
          futureCandles={scenario.futureCandles}
          actionType="place_trade"
          expectedDirection="LONG"
          onSuccess={handleSuccess}
          onError={handleError}
        />
      </div>
    </div>
  );
};
