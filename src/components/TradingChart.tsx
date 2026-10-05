import React, { useEffect, useRef, useState } from 'react';
import { createChart, CandlestickSeries, ColorType, LineStyle, IChartApi, ISeriesApi } from 'lightweight-charts';
import type { ChartCandle, PracticeActionType } from '../types';
import { Play, TrendingUp, TrendingDown, Target, CheckCircle2, AlertTriangle } from 'lucide-react';
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
        background: { type: ColorType.Solid, color: '#06080E' },
        textColor: '#94A3B8',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: '#141B2D', style: LineStyle.Dotted },
        horzLines: { color: '#141B2D', style: LineStyle.Dotted },
      },
      timeScale: {
        borderColor: '#1E293B',
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: '#1E293B',
        scaleMargins: { top: 0.15, bottom: 0.15 },
      },
      crosshair: {
        vertLine: { color: '#38BDF8', width: 1, style: LineStyle.Dashed },
        horzLine: { color: '#38BDF8', width: 1, style: LineStyle.Dashed },
      },
      handleScroll: true,
      handleScale: true,
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#00F59B',
      downColor: '#FF3366',
      borderUpColor: '#00F59B',
      borderDownColor: '#FF3366',
      wickUpColor: '#00F59B',
      wickDownColor: '#FF3366',
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
        message: '🎉 Точно в цель! Это именно та ключевая свеча разворота.',
      });
      setTimeout(() => {
        onSuccess();
      }, 1200);
    } else {
      haptic.error();
      setFeedback({
        type: 'error',
        message: '❌ Не совсем та свеча. Обратите внимание на длину тени и предыдущий тренд.',
      });
      onError('Неверная свеча');
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
        message: `🎯 Идеально! Уровень ${userLevelPrice.toLocaleString()} $ определен с высочайшей точностью!`,
      });
      setTimeout(() => {
        onSuccess();
      }, 1400);
    } else {
      haptic.error();
      setFeedback({
        type: 'error',
        message: `❌ Уровень немного не там (${userLevelPrice.toLocaleString()} $). Ищите точку касания нескольких минимумов.`,
      });
      onError('Неточный уровень');
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
            message: '🚀 ТЕЙК-ПРОФИТ ДОСТИГНУТ! Сделка закрыта с прибылью 1:3 по правилу Герчика!',
          });
          setTimeout(() => {
            onSuccess();
          }, 1500);
        } else {
          haptic.error();
          setFeedback({
            type: 'error',
            message: '❌ Сработал стоп-лосс. Позиция открыта против силы крупного игрока.',
          });
          onError('Убыточная позиция');
        }
      }
    }, 600);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#06080E] rounded-3xl border border-[#1E293B] overflow-hidden shadow-2xl">
      {/* Chart Top Info Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0F1420] border-b border-[#1E293B] text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00F59B] animate-ping" />
          <span className="font-extrabold text-white tracking-wider">LIVE TERMINAL</span>
          <span className="px-2 py-0.5 rounded bg-[#172033] text-slate-300 font-mono text-[11px] border border-[#1E293B]">
            BTC/USDT
          </span>
        </div>
        <div className="flex items-center gap-3">
          {actionType === 'find_candle' && (
            <span className="text-[#FFD200] font-bold flex items-center gap-1">
              <Target className="w-3.5 h-3.5" /> Нажмите на свечу
            </span>
          )}
          {actionType === 'draw_level' && userLevelPrice && (
            <span className="text-[#38BDF8] font-mono font-bold">
              Уровень: ${userLevelPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* Lightweight Chart Container */}
      <div className="relative flex-1 w-full min-h-[280px]">
        <div ref={chartContainerRef} className="absolute inset-0 w-full h-full" />
      </div>

      {/* Interactive Controls below Chart */}
      <div className="p-4 bg-[#0F1420] border-t border-[#1E293B] flex flex-col gap-3">
        {feedback.type && (
          <div
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold animate-fadeIn ${
              feedback.type === 'success'
                ? 'bg-[#00F59B]/15 text-[#00F59B] border border-[#00F59B]/40'
                : 'bg-[#FF3366]/15 text-[#FF3366] border border-[#FF3366]/40'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#00F59B]" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-[#FF3366]" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {actionType === 'draw_level' && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleValidateLevel}
              disabled={userLevelPrice === null}
              className={`flex-1 py-3.5 px-4 rounded-2xl font-black text-sm tracking-wide transition-all ${
                userLevelPrice !== null
                  ? 'btn-3d-cyan cursor-pointer'
                  : 'bg-[#1E293B] text-slate-500 cursor-not-allowed'
              }`}
            >
              {userLevelPrice ? `Подтвердить уровень ($${userLevelPrice.toLocaleString()})` : 'Кликните на графике для выбора уровня'}
            </button>
          </div>
        )}

        {actionType === 'place_trade' && (
          <div className="flex flex-col gap-2">
            <div className="flex gap-3">
              <button
                onClick={() => handleStartTradeSimulation('LONG')}
                disabled={isSimulating}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-black text-sm btn-3d-bullish cursor-pointer"
              >
                <TrendingUp className="w-4 h-4" />
                <span>ОТКРЫТЬ LONG 🟢</span>
              </button>
              <button
                onClick={() => handleStartTradeSimulation('SHORT')}
                disabled={isSimulating}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-black text-sm btn-3d-bearish cursor-pointer"
              >
                <TrendingDown className="w-4 h-4" />
                <span>ОТКРЫТЬ SHORT 🔴</span>
              </button>
            </div>
            {isSimulating && (
              <div className="flex items-center justify-center gap-2 py-1.5 text-xs text-[#FFD200] font-mono animate-pulse">
                <Play className="w-3.5 h-3.5 animate-spin" />
                <span>Симуляция движения рынка по свечам...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
