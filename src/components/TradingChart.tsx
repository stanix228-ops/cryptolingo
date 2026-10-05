import React, { useEffect, useRef, useState } from 'react';
import { createChart, CandlestickSeries, ColorType, LineStyle, IChartApi, ISeriesApi } from 'lightweight-charts';
import type { ChartCandle, PracticeActionType } from '../types';
import { Play, TrendingUp, TrendingDown, Target, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
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
        textColor: '#848E9C',
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
      upColor: '#00C076',
      downColor: '#F6465D',
      borderUpColor: '#00C076',
      borderDownColor: '#F6465D',
      wickUpColor: '#00C076',
      wickDownColor: '#F6465D',
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
        message: 'Идентификация успешна: найдена точная сигнальная свеча разворота.',
      });
      setTimeout(() => {
        onSuccess();
      }, 1200);
    } else {
      haptic.error();
      setFeedback({
        type: 'error',
        message: 'Неверно выбранная свеча. Обратите внимание на пропорции тела и теней.',
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
        message: `Уровень подтвержден: ${userLevelPrice.toLocaleString()} USD (допустимая погрешность соблюдена).`,
      });
      setTimeout(() => {
        onSuccess();
      }, 1400);
    } else {
      haptic.error();
      setFeedback({
        type: 'error',
        message: `Уровень не подтвержден (${userLevelPrice.toLocaleString()} USD). Ищите точку касания нескольких экстремумов.`,
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
            message: 'Исполнение Take-Profit: позиция закрыта с расчетной прибылью 1:3.',
          });
          setTimeout(() => {
            onSuccess();
          }, 1500);
        } else {
          haptic.error();
          setFeedback({
            type: 'error',
            message: 'Срабатывание Stop-Loss: фиксация расчетного риска 1%.',
          });
          onError('Убыточная позиция');
        }
      }
    }, 600);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#06080E] rounded-3xl border border-[#1E293B] overflow-hidden shadow-2xl">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0F1420] border-b border-[#1E293B] text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00C076]" />
          <span className="font-mono font-bold text-white tracking-wider">BTC/USDT PERP</span>
          <span className="px-1.5 py-0.5 rounded bg-[#172033] text-slate-400 font-mono text-[10px] border border-[#1E293B]">
            15M
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono text-xs">
          {actionType === 'find_candle' && (
            <span className="text-[#F0B90B] font-bold flex items-center gap-1">
              <Target className="w-3.5 h-3.5" /> Выберите свечу
            </span>
          )}
          {actionType === 'draw_level' && userLevelPrice && (
            <span className="text-[#38BDF8] font-bold">
              Уровень: ${userLevelPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative flex-1 w-full min-h-[280px]">
        <div ref={chartContainerRef} className="absolute inset-0 w-full h-full" />
      </div>

      {/* Controls */}
      <div className="p-4 bg-[#0F1420] border-t border-[#1E293B] flex flex-col gap-3">
        {feedback.type && (
          <div
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold font-mono animate-fadeIn ${
              feedback.type === 'success'
                ? 'bg-[#00C076]/10 text-[#00C076] border border-[#00C076]/30'
                : 'bg-[#F6465D]/10 text-[#F6465D] border border-[#F6465D]/30'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#00C076]" />
            ) : (
              <ShieldAlert className="w-4 h-4 shrink-0 text-[#F6465D]" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {actionType === 'draw_level' && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleValidateLevel}
              disabled={userLevelPrice === null}
              className={`flex-1 py-3.5 px-4 rounded-2xl font-mono font-bold text-xs uppercase tracking-wider transition-all ${
                userLevelPrice !== null
                  ? 'bg-[#38BDF8] text-[#06080E] cursor-pointer shadow-lg shadow-[#38BDF8]/20'
                  : 'bg-[#1E293B] text-slate-500 cursor-not-allowed'
              }`}
            >
              {userLevelPrice ? `Подтвердить уровень ($${userLevelPrice.toLocaleString()})` : 'Кликните по графику для выбора цены'}
            </button>
          </div>
        )}

        {actionType === 'place_trade' && (
          <div className="flex flex-col gap-2">
            <div className="flex gap-3">
              <button
                onClick={() => handleStartTradeSimulation('LONG')}
                disabled={isSimulating}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-mono font-bold text-xs uppercase tracking-wider bg-[#00C076] text-[#06080E] shadow-lg shadow-[#00C076]/20 cursor-pointer"
              >
                <TrendingUp className="w-4 h-4" />
                <span>КУПИТЬ / ЛОНГ</span>
              </button>
              <button
                onClick={() => handleStartTradeSimulation('SHORT')}
                disabled={isSimulating}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-mono font-bold text-xs uppercase tracking-wider bg-[#F6465D] text-white shadow-lg shadow-[#F6465D]/20 cursor-pointer"
              >
                <TrendingDown className="w-4 h-4" />
                <span>ПРОДАТЬ / ШОРТ</span>
              </button>
            </div>
            {isSimulating && (
              <div className="flex items-center justify-center gap-2 py-1 text-xs text-[#F0B90B] font-mono animate-pulse">
                <Play className="w-3.5 h-3.5 animate-spin" />
                <span>Исполнение ордера: симуляция рыночных котировок...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
