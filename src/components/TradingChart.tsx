import React, { useEffect, useRef, useState } from 'react';
import { createChart, CandlestickSeries, ColorType, LineStyle, IChartApi, ISeriesApi } from 'lightweight-charts';
import type { ChartCandle, PracticeActionType } from '../types';
import { Play, TrendingUp, TrendingDown, Target, Check, AlertTriangle, ShieldAlert } from 'lucide-react';
import { haptic } from '../services/telegram';

interface TradingChartProps {
  candles: ChartCandle[];
  futureCandles?: ChartCandle[];
  actionType: PracticeActionType;
  targetCandleIndex?: number;
  targetLevelPrice?: number;
  tolerancePercent?: number;
  expectedDirection?: 'LONG' | 'SHORT';
  onSuccess: () => void;
  onError: (msg: string) => void;
}

export const TradingChart: React.FC<TradingChartProps> = ({
  candles,
  futureCandles = [],
  actionType,
  targetCandleIndex,
  targetLevelPrice,
  tolerancePercent = 1.5,
  expectedDirection = 'LONG',
  onSuccess,
  onError,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  const [userLevelPrice, setUserLevelPrice] = useState<number | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#000000' },
        textColor: '#888888',
        fontSize: 10,
      },
      grid: {
        vertLines: { color: '#111111', style: LineStyle.Dotted },
        horzLines: { color: '#111111', style: LineStyle.Dotted },
      },
      timeScale: {
        borderColor: 'rgba(255,255,255,0.15)',
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: 'rgba(255,255,255,0.15)',
        scaleMargins: { top: 0.15, bottom: 0.15 },
      },
      crosshair: {
        vertLine: { color: '#FFFFFF', width: 1, style: LineStyle.Dashed },
        horzLine: { color: '#FFFFFF', width: 1, style: LineStyle.Dashed },
      },
      handleScroll: true,
      handleScale: true,
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#00C076',
      downColor: '#FF3B30',
      borderUpColor: '#00C076',
      borderDownColor: '#FF3B30',
      wickUpColor: '#00C076',
      wickDownColor: '#FF3B30',
    });

    const formattedData = candles.map((c) => ({
      time: c.time as any,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    series.setData(formattedData);
    chart.timeScale().fitContent();

    chart.subscribeClick((param) => {
      if (!param || !param.time || param.point === undefined) return;

      if (actionType === 'find_candle') {
        const clickedTime = param.time;
        const index = candles.findIndex((c) => c.time === clickedTime);
        if (index !== -1) {
          haptic.selection();
          checkCandleSelection(index);
        }
      } else if (actionType === 'draw_level') {
        const price = series.coordinateToPrice(param.point.y);
        if (price !== null) {
          haptic.selection();
          setUserLevelPrice(Math.round(price));
        }
      }
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [candles, actionType]);

  const checkCandleSelection = (idx: number) => {
    if (idx === targetCandleIndex) {
      haptic.success();
      setFeedback({
        type: 'success',
        message: 'IDENTIFICATION SUCCESSFUL: EXACT REVERSAL CANDLE VALIDATED.',
      });
      setTimeout(() => {
        onSuccess();
      }, 1200);
    } else {
      haptic.error();
      setFeedback({
        type: 'error',
        message: 'VALIDATION FAILED: CHECK WICK AND BODY PROPORTIONS.',
      });
      onError('Invalid selection');
    }
  };

  const handleValidateLevel = () => {
    if (userLevelPrice === null || !targetLevelPrice) return;

    const diff = Math.abs(userLevelPrice - targetLevelPrice);
    const diffPercent = (diff / targetLevelPrice) * 100;

    if (diffPercent <= tolerancePercent) {
      haptic.success();
      setFeedback({
        type: 'success',
        message: `LEVEL VALIDATED: ${userLevelPrice.toLocaleString()} USD CONFIRMED.`,
      });
      setTimeout(() => {
        onSuccess();
      }, 1400);
    } else {
      haptic.error();
      setFeedback({
        type: 'error',
        message: `DEVIATION DETECTED: LEVEL ${userLevelPrice.toLocaleString()} USD INVALID.`,
      });
      onError('Invalid price level');
    }
  };

  const handleStartTradeSimulation = (direction: 'LONG' | 'SHORT') => {
    if (isSimulating) return;

    setIsSimulating(true);
    haptic.medium();

    if (!seriesRef.current || futureCandles.length === 0) {
      if (direction === expectedDirection) {
        haptic.success();
        onSuccess();
      }
      return;
    }

    let currentIndex = 0;
    const initialData = [...candles];

    const interval = setInterval(() => {
      if (currentIndex < futureCandles.length) {
        const nextCandle = futureCandles[currentIndex];
        initialData.push(nextCandle);
        seriesRef.current?.setData(
          initialData.map((c) => ({
            time: c.time as any,
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close,
          }))
        );
        chartRef.current?.timeScale().scrollToRealTime();
        haptic.light();
        currentIndex++;
      } else {
        clearInterval(interval);
        setIsSimulating(false);

        if (direction === expectedDirection) {
          haptic.success();
          setFeedback({
            type: 'success',
            message: 'TAKE-PROFIT EXECUTED: POSITION CLOSED WITH 1:3 RR RATIO.',
          });
          setTimeout(() => {
            onSuccess();
          }, 1500);
        } else {
          haptic.error();
          setFeedback({
            type: 'error',
            message: 'STOP-LOSS TRIGGERED: 1% CAPITAL PRESERVATION EXECUTED.',
          });
          onError('Trade stopped out');
        }
      }
    }, 600);
  };

  return (
    <div className="flex flex-col h-full w-full bg-black border border-white/20 overflow-hidden font-mono select-none">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-neutral-950 border-b border-white/15 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-white" />
          <span className="font-bold text-white uppercase text-[11px]">BTC/USDT // SPEC. CHART</span>
        </div>
        <div className="text-[10px]">
          {actionType === 'find_candle' && (
            <span className="text-white font-bold">[ SELECT CANDLE ]</span>
          )}
          {actionType === 'draw_level' && userLevelPrice && (
            <span className="text-white font-bold">
              LVL: ${userLevelPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative flex-1 w-full min-h-[280px]">
        <div ref={chartContainerRef} className="absolute inset-0 w-full h-full" />
      </div>

      {/* Controls */}
      <div className="p-3 bg-neutral-950 border-t border-white/15 flex flex-col gap-2.5">
        {feedback.type && (
          <div
            className={`p-2 border text-[11px] font-mono uppercase ${
              feedback.type === 'success'
                ? 'bg-black text-white border-white'
                : 'bg-black text-neutral-400 border-neutral-700'
            }`}
          >
            <span>{feedback.message}</span>
          </div>
        )}

        {actionType === 'draw_level' && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleValidateLevel}
              disabled={userLevelPrice === null}
              className={`flex-1 py-2.5 px-3 border font-mono font-bold text-xs uppercase tracking-wider transition-all ${
                userLevelPrice !== null
                  ? 'bg-white text-black border-white cursor-pointer hover:bg-neutral-200'
                  : 'bg-black text-neutral-600 border-white/10 cursor-not-allowed'
              }`}
            >
              {userLevelPrice ? `CONFIRM LEVEL ($${userLevelPrice.toLocaleString()})` : '[ CLICK CHART TO POSITION LEVEL ]'}
            </button>
          </div>
        )}

        {actionType === 'place_trade' && (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <button
                onClick={() => handleStartTradeSimulation('LONG')}
                disabled={isSimulating}
                className="flex-1 py-2.5 px-3 font-mono font-black text-xs uppercase bg-white text-black border border-white cursor-pointer hover:bg-neutral-200"
              >
                [ BUY / LONG ]
              </button>
              <button
                onClick={() => handleStartTradeSimulation('SHORT')}
                disabled={isSimulating}
                className="flex-1 py-2.5 px-3 font-mono font-black text-xs uppercase bg-black text-white border border-white/40 cursor-pointer hover:bg-white hover:text-black hover:border-white"
              >
                [ SELL / SHORT ]
              </button>
            </div>
            {isSimulating && (
              <div className="flex items-center justify-center gap-1.5 py-1 text-[10px] text-white font-mono animate-pulse">
                <span>[ SIMULATION RUNNING IN REAL TIME ]</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
