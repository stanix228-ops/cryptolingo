import React, { useState } from 'react';
import { TradingChart } from './TradingChart';
import { RefreshCw, DollarSign, Award } from 'lucide-react';
import { haptic } from '../services/telegram';

export const SimulatorView: React.FC = () => {
  const [balance, setBalance] = useState(10000);
  const [winCount, setWinCount] = useState(4);
  const [lossCount, setLossCount] = useState(1);
  const [key, setKey] = useState(0);

  const scenario = {
    symbol: 'BTC/USDT (Исторический реплей)',
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
    <div className="flex flex-col max-w-md mx-auto px-4 py-5 pb-28 gap-4 animate-fadeIn select-none">
      {/* Top Portfolio Bar */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-3.5 bg-[#0F1420] border border-[#1E293B] rounded-2xl flex flex-col shadow-lg">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Демо-депозит</span>
          <span className="text-base font-black text-[#00F59B] font-mono mt-0.5">
            ${balance.toLocaleString()}
          </span>
        </div>

        <div className="p-3.5 bg-[#0F1420] border border-[#1E293B] rounded-2xl flex flex-col shadow-lg">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Винрейт</span>
          <span className="text-base font-black text-[#FFD200] font-mono mt-0.5">{winrate}%</span>
        </div>

        <div className="p-3.5 bg-[#0F1420] border border-[#1E293B] rounded-2xl flex flex-col shadow-lg">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Сделки W/L</span>
          <span className="text-base font-black text-slate-200 font-mono mt-0.5">
            {winCount} <span className="text-slate-500 font-normal">/</span> {lossCount}
          </span>
        </div>
      </div>

      {/* Mode Description Bar */}
      <div className="p-4 bg-[#0F1420] border border-[#1E293B] rounded-3xl flex items-center justify-between shadow-xl">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-[#FFD200] bg-[#FFD200]/10 px-2.5 py-0.5 rounded-full border border-[#FFD200]/20">
            Режим: Машина времени
          </span>
          <h3 className="text-xs font-black text-white mt-1.5 leading-snug">
            Исторический разворот после дампа
          </h3>
        </div>
        <button
          onClick={handleReset}
          className="p-3 rounded-2xl bg-[#172033] border border-[#1E293B] text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="Сбросить сценарий"
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
