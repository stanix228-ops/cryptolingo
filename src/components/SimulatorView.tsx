import React, { useState } from 'react';
import { TradingChart } from './TradingChart';
import { RefreshCw, Activity, ShieldCheck, BarChart3 } from 'lucide-react';
import { haptic } from '../services/telegram';

export const SimulatorView: React.FC = () => {
  const [balance, setBalance] = useState(10000);
  const [winCount, setWinCount] = useState(4);
  const [lossCount, setLossCount] = useState(1);
  const [key, setKey] = useState(0);

  const scenario = {
    symbol: 'BTC/USDT',
    candles: [
      { time: '2024-05-10', open: 63000, high: 63500, low: 61500, close: 61800 },
      { time: '2024-05-11', open: 61800, high: 62200, low: 60100, close: 60400 },
      { time: '2024-05-12', open: 60400, high: 60800, low: 58500, close: 58900 },
      { time: '2024-05-13', open: 58900, high: 59300, low: 56500, close: 58800 },
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
    <div className="flex flex-col max-w-md mx-auto px-4 py-4 pb-28 gap-4 animate-fadeIn select-none">
      {/* Top Bar Stats */}
      <div className="grid grid-cols-3 gap-2.5 font-mono">
        <div className="p-3.5 bg-[#0F1420] border border-[#1E293B] rounded-2xl flex flex-col shadow-lg">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Баланс USD</span>
          <span className="text-sm font-black text-[#00C076] mt-0.5">
            ${balance.toLocaleString()}
          </span>
        </div>

        <div className="p-3.5 bg-[#0F1420] border border-[#1E293B] rounded-2xl flex flex-col shadow-lg">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Винрейт</span>
          <span className="text-sm font-black text-[#F0B90B] mt-0.5">{winrate}%</span>
        </div>

        <div className="p-3.5 bg-[#0F1420] border border-[#1E293B] rounded-2xl flex flex-col shadow-lg">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Сделки W/L</span>
          <span className="text-sm font-black text-slate-200 mt-0.5">
            {winCount} <span className="text-slate-500 font-normal">/</span> {lossCount}
          </span>
        </div>
      </div>

      {/* Simulator Info Header */}
      <div className="p-4 bg-[#0F1420] border border-[#1E293B] rounded-3xl flex items-center justify-between shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#38BDF8]">
              СИМУЛЯТОР РЫНКА
            </span>
          </div>
          <h3 className="text-xs font-bold text-white mt-1 leading-snug">
            Кейс: Восстановление после импульсного сброса
          </h3>
        </div>
        <button
          onClick={handleReset}
          className="p-3 rounded-2xl bg-[#172033] border border-[#1E293B] text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="Сбросить симуляцию"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Chart Terminal */}
      <div key={key} className="h-[370px] w-full">
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
