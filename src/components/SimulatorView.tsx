import React, { useState, useEffect, useRef } from 'react';
import {
  createChart,
  CandlestickSeries,
  ColorType,
  LineStyle,
  IChartApi,
  ISeriesApi,
} from 'lightweight-charts';
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Sliders,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Check,
  X,
  Play,
  RotateCcw,
} from 'lucide-react';
import { haptic } from '../services/telegram';

interface MarketPair {
  symbol: string;
  name: string;
  basePrice: number;
  decimals: number;
  change24h: number;
  high24h: number;
  low24h: number;
  vol24h: string;
}

const MARKET_PAIRS: MarketPair[] = [
  {
    symbol: 'BTC/USDT',
    name: 'Bitcoin',
    basePrice: 67450.0,
    decimals: 1,
    change24h: 3.42,
    high24h: 68120.0,
    low24h: 65190.0,
    vol24h: '2.48B',
  },
  {
    symbol: 'ETH/USDT',
    name: 'Ethereum',
    basePrice: 3520.5,
    decimals: 2,
    change24h: 2.15,
    high24h: 3580.0,
    low24h: 3410.0,
    vol24h: '1.15B',
  },
  {
    symbol: 'SOL/USDT',
    name: 'Solana',
    basePrice: 156.8,
    decimals: 2,
    change24h: 5.84,
    high24h: 161.4,
    low24h: 147.2,
    vol24h: '680M',
  },
  {
    symbol: 'TON/USDT',
    name: 'Toncoin',
    basePrice: 5.78,
    decimals: 3,
    change24h: 3.2,
    high24h: 5.95,
    low24h: 5.52,
    vol24h: '142M',
  },
  {
    symbol: 'XRP/USDT',
    name: 'Ripple',
    basePrice: 0.584,
    decimals: 4,
    change24h: -0.65,
    high24h: 0.598,
    low24h: 0.572,
    vol24h: '310M',
  },
];

interface Position {
  id: string;
  symbol: string;
  direction: 'LONG' | 'SHORT';
  entryPrice: number;
  amountUsd: number;
  leverage: number;
  margin: number;
  liqPrice: number;
  timestamp: number;
}

interface ClosedTrade {
  id: string;
  symbol: string;
  direction: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice: number;
  amountUsd: number;
  leverage: number;
  pnlUsd: number;
  pnlPercent: number;
  isWin: boolean;
  timestamp: number;
}

const generateInitialCandles = (basePrice: number, count = 40) => {
  const candles = [];
  let current = basePrice * 0.94;
  const now = Math.floor(Date.now() / 1000) - count * 60;

  for (let i = 0; i < count; i++) {
    const time = now + i * 60;
    const delta = (Math.random() - 0.48) * (basePrice * 0.0035);
    const open = current;
    const close = open + delta;
    const high = Math.max(open, close) + Math.random() * (basePrice * 0.002);
    const low = Math.min(open, close) - Math.random() * (basePrice * 0.002);

    current = close;
    candles.push({
      time: time as any,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
    });
  }
  return candles;
};

export const SimulatorView: React.FC = () => {
  const [selectedPair, setSelectedPair] = useState<MarketPair>(MARKET_PAIRS[0]);
  const [timeframe, setTimeframe] = useState<string>('15m');
  const [balance, setBalance] = useState<number>(10000);
  const [leverage, setLeverage] = useState<number>(10);
  const [orderAmount, setOrderAmount] = useState<string>('500');
  const [currentPrice, setCurrentPrice] = useState<number>(selectedPair.basePrice);
  const [openPositions, setOpenPositions] = useState<Position[]>([]);
  const [closedTrades, setClosedTrades] = useState<ClosedTrade[]>([]);
  const [activeTab, setActiveTab] = useState<'positions' | 'history' | 'orderbook'>('positions');

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const lastCandleRef = useRef<any>(null);

  // Initialize or update Chart when pair changes
  useEffect(() => {
    if (!chartContainerRef.current) return;

    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#000000' },
        textColor: '#888888',
        fontSize: 10,
      },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.06)', style: LineStyle.Dotted },
        horzLines: { color: 'rgba(255,255,255,0.06)', style: LineStyle.Dotted },
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

    const initialData = generateInitialCandles(selectedPair.basePrice, 40);
    series.setData(initialData);
    chart.timeScale().fitContent();

    chartRef.current = chart;
    seriesRef.current = series;
    lastCandleRef.current = initialData[initialData.length - 1];
    setCurrentPrice(lastCandleRef.current.close);

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [selectedPair]);

  // Live real-time price & candlestick simulation loop
  useEffect(() => {
    const interval = setInterval(() => {
      if (!seriesRef.current || !lastCandleRef.current) return;

      const deltaPercent = (Math.random() - 0.495) * 0.0015;
      const newClose = Number((lastCandleRef.current.close * (1 + deltaPercent)).toFixed(selectedPair.decimals));
      const newHigh = Math.max(lastCandleRef.current.high, newClose);
      const newLow = Math.min(lastCandleRef.current.low, newClose);

      const updatedCandle = {
        ...lastCandleRef.current,
        high: newHigh,
        low: newLow,
        close: newClose,
      };

      seriesRef.current.update(updatedCandle);
      lastCandleRef.current = updatedCandle;
      setCurrentPrice(newClose);
    }, 600);

    return () => clearInterval(interval);
  }, [selectedPair]);

  // Calculations for current input
  const inputAmountNum = Number(orderAmount) || 0;
  const marginRequired = leverage > 0 ? Number((inputAmountNum / leverage).toFixed(2)) : 0;
  const estLiqLong = currentPrice > 0 ? Number((currentPrice * (1 - 0.9 / leverage)).toFixed(selectedPair.decimals)) : 0;
  const estLiqShort = currentPrice > 0 ? Number((currentPrice * (1 + 0.9 / leverage)).toFixed(selectedPair.decimals)) : 0;

  // Open Position
  const handleOpenPosition = (direction: 'LONG' | 'SHORT') => {
    if (marginRequired <= 0) return;
    if (marginRequired > balance) {
      haptic.error();
      alert('Недостаточно свободной маржи на балансе!');
      return;
    }

    haptic.heavy();
    const liqPrice = direction === 'LONG' ? estLiqLong : estLiqShort;
    const newPos: Position = {
      id: `${Date.now()}-${Math.random()}`,
      symbol: selectedPair.symbol,
      direction,
      entryPrice: currentPrice,
      amountUsd: inputAmountNum,
      leverage,
      margin: marginRequired,
      liqPrice,
      timestamp: Date.now(),
    };

    setBalance((prev) => Number((prev - marginRequired).toFixed(2)));
    setOpenPositions((prev) => [newPos, ...prev]);
  };

  // Close Position
  const handleClosePosition = (pos: Position) => {
    haptic.medium();
    const priceDiff =
      pos.direction === 'LONG'
        ? currentPrice - pos.entryPrice
        : pos.entryPrice - currentPrice;
    const pnlPercent = (priceDiff / pos.entryPrice) * pos.leverage * 100;
    const pnlUsd = (pos.amountUsd * (priceDiff / pos.entryPrice));
    const totalReturn = Math.max(0, pos.margin + pnlUsd);

    const closed: ClosedTrade = {
      id: pos.id,
      symbol: pos.symbol,
      direction: pos.direction,
      entryPrice: pos.entryPrice,
      exitPrice: currentPrice,
      amountUsd: pos.amountUsd,
      leverage: pos.leverage,
      pnlUsd: Number(pnlUsd.toFixed(2)),
      pnlPercent: Number(pnlPercent.toFixed(2)),
      isWin: pnlUsd > 0,
      timestamp: Date.now(),
    };

    if (pnlUsd > 0) {
      haptic.success();
    } else {
      haptic.warning();
    }

    setBalance((prev) => Number((prev + totalReturn).toFixed(2)));
    setOpenPositions((prev) => prev.filter((p) => p.id !== pos.id));
    setClosedTrades((prev) => [closed, ...prev]);
  };

  const handleResetBalance = () => {
    haptic.selection();
    setBalance(10000);
    setOpenPositions([]);
    setClosedTrades([]);
  };

  const wins = closedTrades.filter((t) => t.isWin).length;
  const losses = closedTrades.filter((t) => !t.isWin).length;
  const winrate = closedTrades.length > 0 ? Math.round((wins / closedTrades.length) * 100) : 0;
  const totalRealizedPnl = closedTrades.reduce((acc, t) => acc + t.pnlUsd, 0);

  // Generate simulated Orderbook based on currentPrice
  const orderbookAsks = [
    { price: currentPrice * 1.0018, amount: 0.84, total: 56.7 },
    { price: currentPrice * 1.0012, amount: 1.45, total: 98.2 },
    { price: currentPrice * 1.0008, amount: 2.18, total: 147.1 },
    { price: currentPrice * 1.0004, amount: 0.95, total: 64.2 },
  ];
  const orderbookBids = [
    { price: currentPrice * 0.9996, amount: 1.12, total: 75.4 },
    { price: currentPrice * 0.9992, amount: 2.85, total: 192.1 },
    { price: currentPrice * 0.9988, amount: 1.64, total: 110.5 },
    { price: currentPrice * 0.9982, amount: 3.40, total: 229.3 },
  ];

  return (
    <div className="flex flex-col max-w-md mx-auto px-3 py-4 pb-28 gap-3.5 select-none font-sans text-white">
      {/* Top Header & Account Stats */}
      <div className="p-3.5 bg-black border border-white/25 flex flex-col gap-2.5">
        <div className="flex items-center justify-between border-b border-white/15 pb-2">
          <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold">
            <Activity className="w-3.5 h-3.5 text-white" />
            <span className="tracking-widest uppercase">CRYPTOLINGO // TERMINAL</span>
          </div>
          <button
            onClick={handleResetBalance}
            className="flex items-center gap-1 px-1.5 py-0.5 border border-white/20 text-[10px] font-mono hover:border-white transition-all cursor-pointer text-neutral-400 hover:text-white"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>СБРОС $10K</span>
          </button>
        </div>

        {/* 3 Metrics */}
        <div className="grid grid-cols-3 gap-2 font-mono">
          <div className="p-2 border border-white/15 bg-neutral-950 flex flex-col">
            <span className="text-[9px] text-neutral-400 uppercase">ДЕПОЗИТ USD</span>
            <span className="text-xs font-black text-white mt-0.5">${balance.toLocaleString()}</span>
          </div>
          <div className="p-2 border border-white/15 bg-neutral-950 flex flex-col">
            <span className="text-[9px] text-neutral-400 uppercase">СЕССИЯ PNL</span>
            <span
              className={`text-xs font-black mt-0.5 ${
                totalRealizedPnl >= 0 ? 'text-[#00C076]' : 'text-[#FF3B30]'
              }`}
            >
              {totalRealizedPnl >= 0 ? `+$${totalRealizedPnl.toFixed(1)}` : `-$${Math.abs(totalRealizedPnl).toFixed(1)}`}
            </span>
          </div>
          <div className="p-2 border border-white/15 bg-neutral-950 flex flex-col">
            <span className="text-[9px] text-neutral-400 uppercase">ВИНРЕЙТ</span>
            <span className="text-xs font-black text-white mt-0.5">
              {winrate}% ({wins}W / {losses}L)
            </span>
          </div>
        </div>
      </div>

      {/* Crypto Asset Selector Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 font-mono text-[11px] no-scrollbar">
        {MARKET_PAIRS.map((pair) => (
          <button
            key={pair.symbol}
            onClick={() => {
              haptic.selection();
              setSelectedPair(pair);
            }}
            className={`px-2.5 py-1.5 border font-bold uppercase transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              selectedPair.symbol === pair.symbol
                ? 'bg-white text-black border-white'
                : 'bg-black text-neutral-400 border-white/15 hover:border-white hover:text-white'
            }`}
          >
            <span>{pair.symbol}</span>
            <span
              className={`text-[9px] ${
                selectedPair.symbol === pair.symbol
                  ? 'text-neutral-700'
                  : pair.change24h >= 0
                  ? 'text-[#00C076]'
                  : 'text-[#FF3B30]'
              }`}
            >
              {pair.change24h >= 0 ? `+${pair.change24h}%` : `${pair.change24h}%`}
            </span>
          </button>
        ))}
      </div>

      {/* Market Bar Details */}
      <div className="p-3 bg-black border border-white/20 flex items-center justify-between font-mono text-[11px]">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-base font-black text-white tracking-tight">
              ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: selectedPair.decimals })}
            </span>
            <span
              className={`text-[10px] font-bold ${
                selectedPair.change24h >= 0 ? 'text-[#00C076]' : 'text-[#FF3B30]'
              }`}
            >
              {selectedPair.change24h >= 0 ? `+${selectedPair.change24h}%` : `${selectedPair.change24h}%`}
            </span>
          </div>
          <span className="text-[9px] text-neutral-500 block">ПОСЛЕДНЯЯ ЦЕНА В СТАКАНЕ</span>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center gap-1">
          {['1m', '5m', '15m', '1H', '4H', '1D'].map((tf) => (
            <button
              key={tf}
              onClick={() => {
                haptic.selection();
                setTimeframe(tf);
              }}
              className={`px-1.5 py-0.5 text-[9px] border font-bold ${
                timeframe === tf
                  ? 'bg-white text-black border-white'
                  : 'bg-neutral-950 text-neutral-400 border-white/15 hover:text-white'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Trading Chart (Real green & red candlesticks) */}
      <div className="p-1 bg-black border border-white/25 flex flex-col">
        <div ref={chartContainerRef} className="h-[280px] w-full" />
      </div>

      {/* Orderbook & Depth mini preview toggle */}
      <div className="grid grid-cols-2 gap-2 font-mono text-[10px]">
        {/* Asks (Sellers) */}
        <div className="p-2 border border-white/15 bg-black flex flex-col gap-1">
          <span className="text-[9px] text-neutral-400 uppercase border-b border-white/10 pb-1">
            АСКИ (ПРОДАВЦЫ)
          </span>
          {orderbookAsks.map((a, i) => (
            <div key={i} className="flex justify-between text-[#FF3B30]">
              <span>${a.price.toFixed(selectedPair.decimals)}</span>
              <span className="text-neutral-400">{a.amount}</span>
            </div>
          ))}
        </div>

        {/* Bids (Buyers) */}
        <div className="p-2 border border-white/15 bg-black flex flex-col gap-1">
          <span className="text-[9px] text-neutral-400 uppercase border-b border-white/10 pb-1">
            БИДЫ (ПОКУПАТЕЛИ)
          </span>
          {orderbookBids.map((b, i) => (
            <div key={i} className="flex justify-between text-[#00C076]">
              <span>${b.price.toFixed(selectedPair.decimals)}</span>
              <span className="text-neutral-400">{b.amount}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Order Execution Console */}
      <div className="p-3.5 bg-black border border-white/25 flex flex-col gap-3 font-mono">
        <div className="flex items-center justify-between border-b border-white/15 pb-2 text-[11px]">
          <span className="font-bold text-white uppercase tracking-wider">
            ОРДЕР: {selectedPair.symbol}
          </span>
          <span className="text-[9px] bg-neutral-900 border border-white/20 text-neutral-300 px-1.5 py-0.5">
            ИЗОЛИРОВАННАЯ МАРЖА
          </span>
        </div>

        {/* Leverage Pills */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[10px] text-neutral-400">
            <span>КРЕДИТНОЕ ПЛЕЧО</span>
            <span className="text-white font-bold">{leverage}x</span>
          </div>
          <div className="grid grid-cols-6 gap-1">
            {[1, 2, 5, 10, 20, 50].map((lev) => (
              <button
                key={lev}
                onClick={() => {
                  haptic.selection();
                  setLeverage(lev);
                }}
                className={`py-1 text-[10px] font-bold border transition-all cursor-pointer ${
                  leverage === lev
                    ? 'bg-white text-black border-white'
                    : 'bg-neutral-950 text-neutral-400 border-white/15 hover:border-white hover:text-white'
                }`}
              >
                {lev}x
              </button>
            ))}
          </div>
        </div>

        {/* Amount Input */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[10px] text-neutral-400">
            <span>СУММА ОРДЕРА (USD)</span>
            <span>МАРЖА: ${marginRequired}</span>
          </div>
          <div className="relative">
            <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
            <input
              type="number"
              value={orderAmount}
              onChange={(e) => setOrderAmount(e.target.value)}
              className="w-full pl-7 pr-3 py-2 bg-neutral-950 border border-white/25 text-white font-mono text-xs focus:outline-none focus:border-white font-bold"
              placeholder="500"
            />
          </div>

          {/* Quick presets */}
          <div className="grid grid-cols-5 gap-1 mt-1">
            {['100', '250', '500', '1000', '2500'].map((amt) => (
              <button
                key={amt}
                onClick={() => {
                  haptic.selection();
                  setOrderAmount(amt);
                }}
                className="py-0.5 text-[9px] border border-white/15 bg-neutral-950 text-neutral-400 hover:text-white hover:border-white"
              >
                ${amt}
              </button>
            ))}
          </div>
        </div>

        {/* Calculations preview */}
        <div className="p-2 border border-white/10 bg-neutral-950 text-[10px] flex justify-between text-neutral-400">
          <div>
            <span>ЛИКВ. LONG: </span>
            <span className="text-white font-bold">${estLiqLong}</span>
          </div>
          <div>
            <span>ЛИКВ. SHORT: </span>
            <span className="text-white font-bold">${estLiqShort}</span>
          </div>
        </div>

        {/* EXECUTE BUTTONS: LONG / SHORT */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => handleOpenPosition('LONG')}
            className="py-3 bg-white text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border border-white hover:bg-neutral-200 active:scale-[0.98] transition-all cursor-pointer shadow-sm"
          >
            <div className="w-2 h-2 bg-[#00C076]" />
            <span>LONG / КУПИТЬ</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => handleOpenPosition('SHORT')}
            className="py-3 bg-neutral-900 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border border-white/40 hover:border-white active:scale-[0.98] transition-all cursor-pointer shadow-sm"
          >
            <div className="w-2 h-2 bg-[#FF3B30]" />
            <span>SHORT / ПРОДАТЬ</span>
            <ArrowDownRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* POSITIONS & HISTORY TABS */}
      <div className="flex flex-col gap-2 font-mono">
        <div className="flex border-b border-white/20">
          <button
            onClick={() => {
              haptic.selection();
              setActiveTab('positions');
            }}
            className={`flex-1 py-2 text-center text-xs font-bold uppercase transition-all cursor-pointer border-b-2 ${
              activeTab === 'positions'
                ? 'border-white text-white bg-neutral-950'
                : 'border-transparent text-neutral-500 hover:text-neutral-300'
            }`}
          >
            ОТКРЫТЫЕ ПОЗИЦИИ ({openPositions.length})
          </button>

          <button
            onClick={() => {
              haptic.selection();
              setActiveTab('history');
            }}
            className={`flex-1 py-2 text-center text-xs font-bold uppercase transition-all cursor-pointer border-b-2 ${
              activeTab === 'history'
                ? 'border-white text-white bg-neutral-950'
                : 'border-transparent text-neutral-500 hover:text-neutral-300'
            }`}
          >
            ИСТОРИЯ СДЕЛОК ({closedTrades.length})
          </button>
        </div>

        {/* Open Positions List */}
        {activeTab === 'positions' && (
          <div className="flex flex-col gap-2">
            {openPositions.map((pos) => {
              const priceDiff =
                pos.direction === 'LONG'
                  ? currentPrice - pos.entryPrice
                  : pos.entryPrice - currentPrice;
              const pnlPercent = (priceDiff / pos.entryPrice) * pos.leverage * 100;
              const pnlUsd = pos.amountUsd * (priceDiff / pos.entryPrice);
              const isProfit = pnlUsd >= 0;

              return (
                <div
                  key={pos.id}
                  className="p-3 bg-black border border-white/20 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-xs text-white">{pos.symbol}</span>
                      <span
                        className={`text-[9px] font-black px-1 py-0.5 border ${
                          pos.direction === 'LONG'
                            ? 'border-[#00C076] text-[#00C076]'
                            : 'border-[#FF3B30] text-[#FF3B30]'
                        }`}
                      >
                        {pos.direction} {pos.leverage}x
                      </span>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-xs font-black block ${
                          isProfit ? 'text-[#00C076]' : 'text-[#FF3B30]'
                        }`}
                      >
                        {isProfit ? `+$${pnlUsd.toFixed(2)}` : `-$${Math.abs(pnlUsd).toFixed(2)}`} (
                        {pnlPercent.toFixed(2)}%)
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[10px] text-neutral-400">
                    <div>
                      <span className="block text-[8px] uppercase">ВХОД</span>
                      <span className="text-white">${pos.entryPrice}</span>
                    </div>
                    <div>
                      <span className="block text-[8px] uppercase">ТЕКУЩАЯ</span>
                      <span className="text-white">${currentPrice}</span>
                    </div>
                    <div>
                      <span className="block text-[8px] uppercase">ЛИКВИДАЦИЯ</span>
                      <span className="text-[#FF3B30]">${pos.liqPrice}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleClosePosition(pos)}
                    className="w-full py-1.5 bg-neutral-900 hover:bg-white hover:text-black border border-white/30 font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer mt-1"
                  >
                    ЗАКРЫТЬ ПОЗИЦИЮ ПО РЫНКУ
                  </button>
                </div>
              );
            })}

            {openPositions.length === 0 && (
              <div className="p-8 text-center border border-white/10 text-neutral-500 text-xs font-mono">
                [ НЕТ ОТКРЫТЫХ ПОЗИЦИЙ // ВЫБЕРИТЕ ПАРУ И НАЖМИТЕ LONG / SHORT ]
              </div>
            )}
          </div>
        )}

        {/* History List */}
        {activeTab === 'history' && (
          <div className="flex flex-col gap-2">
            {closedTrades.map((t) => (
              <div
                key={t.id}
                className="p-2.5 bg-black border border-white/15 flex items-center justify-between text-[11px]"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white">{t.symbol}</span>
                    <span
                      className={`text-[9px] font-bold ${
                        t.direction === 'LONG' ? 'text-[#00C076]' : 'text-[#FF3B30]'
                      }`}
                    >
                      {t.direction} {t.leverage}x
                    </span>
                  </div>
                  <span className="text-[9px] text-neutral-500 block">
                    Вход: ${t.entryPrice} → Выход: ${t.exitPrice}
                  </span>
                </div>

                <div className="text-right">
                  <span
                    className={`font-black block ${
                      t.isWin ? 'text-[#00C076]' : 'text-[#FF3B30]'
                    }`}
                  >
                    {t.isWin ? `+$${t.pnlUsd.toFixed(2)}` : `-$${Math.abs(t.pnlUsd).toFixed(2)}`}
                  </span>
                  <span className="text-[9px] text-neutral-400">
                    {t.pnlPercent >= 0 ? `+${t.pnlPercent}%` : `${t.pnlPercent}%`}
                  </span>
                </div>
              </div>
            ))}

            {closedTrades.length === 0 && (
              <div className="p-8 text-center border border-white/10 text-neutral-500 text-xs font-mono">
                [ ИСТОРИЯ СДЕЛОК ПУСТА ]
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
