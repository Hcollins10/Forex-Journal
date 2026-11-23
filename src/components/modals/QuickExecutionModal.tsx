import React, { useState, useEffect } from 'react';
import { X, Zap, ArrowUp, ArrowDown, Shield, DollarSign } from 'lucide-react';
import { Trade, TradeType, TradingSession } from '../../types/trade';
import { calculateForexPnlAndPips } from '../../services/forexData';

interface QuickExecutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteTrade: (trade: Trade) => void;
  accountId: string;
  accountBalance: number;
}

export const QuickExecutionModal: React.FC<QuickExecutionModalProps> = ({
  isOpen,
  onClose,
  onExecuteTrade,
  accountId,
  accountBalance,
}) => {
  if (!isOpen) return null;

  const [pair, setPair] = useState('EUR/USD');
  const [lotSize, setLotSize] = useState('1.00');
  const [slPips, setSlPips] = useState('20');
  const [tpPips, setTpPips] = useState('40');
  const [marketPrice, setMarketPrice] = useState(1.08500);

  // Live market price micro-tick simulation
  useEffect(() => {
    const basePrices: Record<string, number> = {
      'EUR/USD': 1.08520,
      'GBP/USD': 1.29410,
      'USD/JPY': 153.250,
      'GBP/JPY': 198.450,
      'XAU/USD': 2450.80,
    };

    setMarketPrice(basePrices[pair] || 1.08520);

    const interval = setInterval(() => {
      setMarketPrice(prev => {
        const delta = (Math.random() - 0.5) * (pair.includes('JPY') ? 0.04 : pair.includes('XAU') ? 0.4 : 0.00015);
        return Number((prev + delta).toFixed(pair.includes('JPY') ? 3 : pair.includes('XAU') ? 2 : 5));
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [pair]);

  const handleExecute = (direction: TradeType) => {
    const lots = parseFloat(lotSize) || 1.0;
    const isJpy = pair.includes('JPY');
    const isGold = pair.includes('XAU');
    const pipMult = isJpy ? 0.01 : isGold ? 0.1 : 0.0001;

    const stopPips = parseFloat(slPips) || 20;
    const targetPips = parseFloat(tpPips) || 40;

    const openP = marketPrice;
    const sl = direction === 'BUY' ? openP - (stopPips * pipMult) : openP + (stopPips * pipMult);
    const tp = direction === 'BUY' ? openP + (targetPips * pipMult) : openP - (targetPips * pipMult);

    // Simulate instant outcome or immediate market fill
    const exitP = direction === 'BUY' ? openP + (targetPips * pipMult * 0.95) : openP - (targetPips * pipMult * 0.95);
    const calc = calculateForexPnlAndPips(pair, direction, openP, exitP, lots);

    const newTrade: Trade = {
      id: `trade_${Date.now()}`,
      accountId,
      ticketNumber: `${Math.floor(8000000 + Math.random() * 1000000)}`,
      pair,
      type: direction,
      lotSize: lots,
      openPrice: openP,
      closePrice: exitP,
      stopLoss: Number(sl.toFixed(5)),
      takeProfit: Number(tp.toFixed(5)),
      openTime: new Date(Date.now() - 3600000).toISOString(),
      closeTime: new Date().toISOString(),
      pnl: calc.pnl,
      grossPnl: calc.grossPnl || calc.pnl,
      pips: calc.pips,
      commission: Number((lots * 6).toFixed(2)),
      swap: 0,
      status: 'CLOSED',
      plannedRR: Number((targetPips / stopPips).toFixed(2)),
      realizedRR: Number((targetPips / stopPips).toFixed(2)),
      session: 'London',
      timeframe: '5m',
      entryCategory: 'Liquidity Sweep',
      entryReason: `Simulated live market execution on ${pair} at ${openP}`,
      exitCategory: 'Hit Full Take Profit (TP)',
      exitReason: 'Order executed and hit projected liquidity target',
      tpCategory: 'Previous Day High / Low (PDH/PDL)',
      tpReason: `${targetPips} pips expansion target`,
      slCategory: 'Invalidation below Swing Low / High',
      slReason: `${stopPips} pips invalidation level`,
      emotionBefore: 'Calm & Disciplined',
      executionDiscipline: 'Followed Plan 100%',
      emotionAfter: 'Satisfied & Calm',
      disciplineScore: 5,
      notes: 'Quick market order simulation in ForexJournal Pro',
      mistakes: [],
    };

    onExecuteTrade(newTrade);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1e293b] border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-5 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white tracking-tight">Quick Forex Market Order</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Market Ticker */}
        <div className="bg-[#172131] border border-slate-800 rounded-lg p-4 text-center">
          <div className="text-[10px] text-slate-400 font-mono uppercase flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Market Feed
          </div>
          <div className="text-3xl font-extrabold font-mono text-white mt-1 tracking-tight">
            {marketPrice}
          </div>
          <div className="text-xs text-blue-400 font-bold mt-0.5">{pair}</div>
        </div>

        {/* Inputs */}
        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-mono text-[10px] uppercase">Select Pair</label>
            <select
              value={pair}
              onChange={e => setPair(e.target.value)}
              className="w-full bg-[#172131] border border-slate-800 rounded-lg p-2.5 text-white font-bold focus:outline-none focus:border-blue-500"
            >
              <option value="EUR/USD">EUR/USD</option>
              <option value="GBP/USD">GBP/USD</option>
              <option value="USD/JPY">USD/JPY</option>
              <option value="GBP/JPY">GBP/JPY</option>
              <option value="XAU/USD">XAU/USD (Gold)</option>
            </select>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-slate-400 mb-1 font-mono text-[10px] uppercase">Lot Size</label>
              <input
                type="number"
                step="0.1"
                value={lotSize}
                onChange={e => setLotSize(e.target.value)}
                className="w-full bg-[#172131] border border-slate-800 rounded-lg p-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-rose-400 mb-1 font-mono text-[10px] uppercase">SL (Pips)</label>
              <input
                type="number"
                value={slPips}
                onChange={e => setSlPips(e.target.value)}
                className="w-full bg-[#172131] border border-slate-800 rounded-lg p-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-emerald-400 mb-1 font-mono text-[10px] uppercase">TP (Pips)</label>
              <input
                type="number"
                value={tpPips}
                onChange={e => setTpPips(e.target.value)}
                className="w-full bg-[#172131] border border-slate-800 rounded-lg p-2 text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Execution Buy / Sell Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => handleExecute('SELL')}
            className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 rounded-lg shadow-sm active:scale-95 transition cursor-pointer"
          >
            <ArrowDown className="w-4 h-4" /> SELL MARKET
          </button>
          <button
            onClick={() => handleExecute('BUY')}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-lg shadow-sm active:scale-95 transition cursor-pointer"
          >
            <ArrowUp className="w-4 h-4" /> BUY MARKET
          </button>
        </div>
      </div>
    </div>
  );
};
