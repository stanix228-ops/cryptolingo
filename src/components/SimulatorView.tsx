import React, { useState } from 'react';
import { TradingChart } from './TradingChart';
import { RefreshCw } from 'lucide-react';
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
    <div className="flex flex-col max-w-md mx-auto px-3 py-4 pb-28 gap-4 select-none font-mono text-white animate-fadeIn">
      {/* Top Bar Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 bg-black border border-white/20 flex flex-col">
          <span className="text-[9px] text-neutral-400 font-bold uppercase">USD BALANCE</span>
          <span className="text-xs font-black text-white mt-1">
            ${balance.toLocaleString()}
          </span>
        </div>

        <div className="p-3 bg-black border border-white/20 flex flex-col">
          <span className="text-[9px] text-neutral-400 font-bold uppercase">WIN RATE</span>
          <span className="text-xs font-black text-white mt-1">{winrate}%</span>
        </div>

        <div className="p-3 bg-black border border-white/20 flex flex-col">
          <span className="text-[9px] text-neutral-400 font-bold uppercase">W / L RECORD</span>
          <span className="text-xs font-black text-white mt-1">
            {winCount} / {lossCount}
          </span>
        </div>
      </div>

      {/* Simulator Info Header */}
      <div className="p-3 bg-black border border-white/20 flex items-center justify-between">
        <div>
          <span className="text-[9px] uppercase tracking-wider text-black bg-white px-1 font-bold">
            HISTORICAL SIMULATOR
          </span>
          <h3 className="text-xs font-bold text-white mt-1 uppercase">
            Case: Impulsive Reversal Dynamics
          </h3>
        </div>
        <button
          onClick={handleReset}
          className="p-2 bg-neutral-950 border border-white/20 text-white hover:bg-white hover:text-black transition-colors cursor-pointer"
          title="Reset"
        >
          <RefreshCw className="w-3.5 h-3.5" />
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
