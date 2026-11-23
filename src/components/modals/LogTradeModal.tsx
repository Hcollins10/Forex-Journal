import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Calculator, 
  Brain, 
  Target, 
  CheckCircle, 
  AlertTriangle, 
  DollarSign,
  Clock,
  Sparkles
} from 'lucide-react';
import { 
  Trade, 
  TradeType, 
  TradeStatus, 
  TradingSession, 
  EntryCategory, 
  ExitCategory, 
  EmotionBefore, 
  ExecutionDiscipline 
} from '../../types/trade';
import { calculateForexPnlAndPips } from '../../services/forexData';

interface LogTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTrade: (trade: Trade) => void;
  accountId: string;
}

export const LogTradeModal: React.FC<LogTradeModalProps> = ({
  isOpen,
  onClose,
  onSaveTrade,
  accountId,
}) => {
  if (!isOpen) return null;

  const nowStr = new Date().toISOString().slice(0, 16);

  const [pair, setPair] = useState('EUR/USD');
  const [type, setType] = useState<TradeType>('BUY');
  const [lotSize, setLotSize] = useState('1.00');
  const [openPrice, setOpenPrice] = useState('1.08500');
  const [closePrice, setClosePrice] = useState('1.08900');
  const [stopLoss, setStopLoss] = useState('1.08300');
  const [takeProfit, setTakeProfit] = useState('1.09100');
  const [openTime, setOpenTime] = useState(nowStr);
  const [closeTime, setCloseTime] = useState(nowStr);
  const [session, setSession] = useState<TradingSession>('London');
  const [timeframe, setTimeframe] = useState('15m');

  // Reasons & Psychology
  const [entryCategory, setEntryCategory] = useState<EntryCategory>('Liquidity Sweep');
  const [entryReason, setEntryReason] = useState('Swept previous London low with sharp bullish displacement and rejection wick');
  const [exitCategory, setExitCategory] = useState<ExitCategory>('Hit Full Take Profit (TP)');
  const [exitReason, setExitReason] = useState('Reached liquidity target at previous day high (PDH)');
  const [tpCategory, setTpCategory] = useState('Previous Day High / Low (PDH/PDL)');
  const [tpReason, setTpReason] = useState('Targeted resting buy-side liquidity above Asian session high');
  const [slCategory, setSlCategory] = useState('Invalidation below Swing Low / High');
  const [slReason, setSlReason] = useState('Placed 5 pips below liquidity sweep wick; breach invalidates setup');
  
  const [emotionBefore, setEmotionBefore] = useState<EmotionBefore>('Calm & Disciplined');
  const [executionDiscipline, setExecutionDiscipline] = useState<ExecutionDiscipline>('Followed Plan 100%');
  const [disciplineScore, setDisciplineScore] = useState(5);
  const [notes, setNotes] = useState('');

  // Auto calculate PnL and Pips
  const calc = calculateForexPnlAndPips(
    pair,
    type,
    parseFloat(openPrice) || 0,
    parseFloat(closePrice) || 0,
    parseFloat(lotSize) || 1
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const oPrice = parseFloat(openPrice) || 1;
    const cPrice = parseFloat(closePrice) || 1;
    const sl = parseFloat(stopLoss) || oPrice;
    const tp = parseFloat(takeProfit) || cPrice;
    const lots = parseFloat(lotSize) || 1;

    const plannedRisk = Math.abs(oPrice - sl);
    const plannedReward = Math.abs(tp - oPrice);
    const realizedRR = plannedRisk > 0 ? Number((Math.abs(cPrice - oPrice) / plannedRisk).toFixed(2)) : 1;

    const newTrade: Trade = {
      id: `trade_${Date.now()}`,
      accountId,
      ticketNumber: `${Math.floor(8000000 + Math.random() * 1000000)}`,
      pair,
      type,
      lotSize: lots,
      openPrice: oPrice,
      closePrice: cPrice,
      stopLoss: sl,
      takeProfit: tp,
      openTime: new Date(openTime).toISOString(),
      closeTime: new Date(closeTime).toISOString(),
      pnl: calc.pnl,
      grossPnl: calc.grossPnl || calc.pnl,
      pips: calc.pips,
      commission: Number((lots * 6).toFixed(2)),
      swap: 0,
      status: 'CLOSED',
      plannedRR: plannedRisk > 0 ? Number((plannedReward / plannedRisk).toFixed(2)) : 2,
      realizedRR,
      session,
      timeframe: timeframe as any,
      entryCategory,
      entryReason,
      exitCategory,
      exitReason,
      tpCategory,
      tpReason,
      slCategory,
      slReason,
      emotionBefore,
      executionDiscipline,
      emotionAfter: calc.pnl >= 0 ? 'Satisfied & Calm' : 'Neutral & Objective',
      disciplineScore,
      notes,
      mistakes: executionDiscipline !== 'Followed Plan 100%' ? [executionDiscipline] : [],
    };

    onSaveTrade(newTrade);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#1e293b] border border-slate-800 rounded-xl max-w-3xl w-full p-6 sm:p-7 space-y-5 shadow-2xl my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold">
              +
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Log Forex Trade with Full Audit Reasons</h2>
              <p className="text-[10px] text-slate-400 font-mono">Record execution details, TP/SL logic, and psychological mindset</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          
          {/* Section 1: Trade Specification */}
          <div className="space-y-3">
            <div className="text-[10px] font-bold uppercase text-slate-400 font-mono tracking-wider">
              1. Execution Details & Position
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Pair */}
              <div>
                <label className="block text-slate-400 mb-1 font-mono text-[10px] uppercase">Forex Pair</label>
                <select
                  value={pair}
                  onChange={e => setPair(e.target.value)}
                  className="w-full bg-[#172131] border border-slate-800 rounded-lg p-2.5 text-white font-bold focus:outline-none focus:border-blue-500"
                >
                  <option value="EUR/USD">EUR/USD</option>
                  <option value="GBP/USD">GBP/USD</option>
                  <option value="GBP/JPY">GBP/JPY</option>
                  <option value="USD/JPY">USD/JPY</option>
                  <option value="XAU/USD">XAU/USD (Gold)</option>
                  <option value="AUD/USD">AUD/USD</option>
                  <option value="USD/CAD">USD/CAD</option>
                  <option value="EUR/JPY">EUR/JPY</option>
                  <option value="NZD/USD">NZD/USD</option>
                </select>
              </div>

              {/* Type BUY/SELL */}
              <div>
                <label className="block text-slate-400 mb-1 font-mono text-[10px] uppercase">Direction</label>
                <div className="grid grid-cols-2 gap-1 bg-[#172131] p-1 rounded-lg border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setType('BUY')}
                    className={`py-1.5 rounded font-bold transition text-center cursor-pointer ${type === 'BUY' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400'}`}
                  >
                    BUY
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('SELL')}
                    className={`py-1.5 rounded font-bold transition text-center cursor-pointer ${type === 'SELL' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400'}`}
                  >
                    SELL
                  </button>
                </div>
              </div>

              {/* Lot Size */}
              <div>
                <label className="block text-slate-400 mb-1 font-mono text-[10px] uppercase">Lot Size</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={lotSize}
                  onChange={e => setLotSize(e.target.value)}
                  className="w-full bg-[#172131] border border-slate-800 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Session */}
              <div>
                <label className="block text-slate-400 mb-1 font-mono text-[10px] uppercase">Trading Session</label>
                <select
                  value={session}
                  onChange={e => setSession(e.target.value as TradingSession)}
                  className="w-full bg-[#172131] border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="London">London Session</option>
                  <option value="New York">New York Session</option>
                  <option value="Asian">Asian Session</option>
                  <option value="London/NY Overlap">London/NY Overlap</option>
                </select>
              </div>
            </div>

            {/* Prices */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div>
                <label className="block text-slate-400 mb-1 font-mono text-[10px] uppercase">Open Price</label>
                <input
                  type="number"
                  step="0.00001"
                  required
                  value={openPrice}
                  onChange={e => setOpenPrice(e.target.value)}
                  className="w-full bg-[#172131] border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-mono text-[10px] uppercase">Close Price</label>
                <input
                  type="number"
                  step="0.00001"
                  required
                  value={closePrice}
                  onChange={e => setClosePrice(e.target.value)}
                  className="w-full bg-[#172131] border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-rose-400 mb-1 font-mono text-[10px] uppercase">Stop Loss (SL)</label>
                <input
                  type="number"
                  step="0.00001"
                  value={stopLoss}
                  onChange={e => setStopLoss(e.target.value)}
                  className="w-full bg-[#172131] border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-emerald-400 mb-1 font-mono text-[10px] uppercase">Take Profit (TP)</label>
                <input
                  type="number"
                  step="0.00001"
                  value={takeProfit}
                  onChange={e => setTakeProfit(e.target.value)}
                  className="w-full bg-[#172131] border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* PnL and Pips Live Preview */}
            <div className="bg-[#172131] border border-slate-800 rounded-lg p-3 flex items-center justify-between font-mono">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-xs font-sans">Calculated Result:</span>
                <span className={`text-base font-bold ${calc.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {calc.pnl >= 0 ? '+' : ''}${calc.pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="text-slate-300 text-xs">
                {calc.pips >= 0 ? '+' : ''}{calc.pips} pips
              </div>
            </div>
          </div>

          {/* Section 2: Reasons for Entry, Exit, TP & SL */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <div className="text-[10px] font-bold uppercase text-slate-400 font-mono tracking-wider flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-blue-400" /> 2. Technical Reasons for Entry & Exit
            </div>

            {/* Entry Reason */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-blue-400 mb-1 font-medium font-mono text-[10px] uppercase">Entry Setup Category</label>
                <select
                  value={entryCategory}
                  onChange={e => setEntryCategory(e.target.value as EntryCategory)}
                  className="w-full bg-[#172131] border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Liquidity Sweep">Liquidity Sweep</option>
                  <option value="Fair Value Gap (FVG)">Fair Value Gap (FVG)</option>
                  <option value="Break of Structure (BOS)">Break of Structure (BOS)</option>
                  <option value="Order Block (OB)">Order Block (OB)</option>
                  <option value="Support / Resistance Bounce">Support / Resistance</option>
                  <option value="Trendline Continuation">Trendline Continuation</option>
                  <option value="High Impact News Release">News Momentum</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-400 mb-1 font-mono text-[10px] uppercase">Detailed Reason for Entry</label>
                <input
                  type="text"
                  required
                  placeholder="Why did you enter? (e.g. 15m liquidity grab + 5m MSS with displacement)"
                  value={entryReason}
                  onChange={e => setEntryReason(e.target.value)}
                  className="w-full bg-[#172131] border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Exit Reason */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-amber-400 mb-1 font-medium font-mono text-[10px] uppercase">Exit Reason Category</label>
                <select
                  value={exitCategory}
                  onChange={e => setExitCategory(e.target.value as ExitCategory)}
                  className="w-full bg-[#172131] border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Hit Full Take Profit (TP)">Hit Full Take Profit (TP)</option>
                  <option value="Hit Stop Loss (SL)">Hit Stop Loss (SL)</option>
                  <option value="Trailing Stop Loss Triggered">Trailing Stop Triggered</option>
                  <option value="Manual Discretionary Exit">Manual Discretionary Exit</option>
                  <option value="Breakeven Stop Hit">Breakeven Stop Hit</option>
                  <option value="Time / Session End Close">Session End Close</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-400 mb-1 font-mono text-[10px] uppercase">Detailed Reason for Exit</label>
                <input
                  type="text"
                  required
                  placeholder="Why did you exit? (e.g. Hit target PDH / Momentum stalled before NY open)"
                  value={exitReason}
                  onChange={e => setExitReason(e.target.value)}
                  className="w-full bg-[#172131] border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* TP & SL Logic */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-[#172131] p-3 rounded-lg border border-slate-800 space-y-2">
                <label className="block text-emerald-400 font-semibold font-mono text-[10px] uppercase">Reason for Take Profit (TP)</label>
                <input
                  type="text"
                  placeholder="TP Logic (e.g. PDH/PDL or 1:3 RR target)"
                  value={tpReason}
                  onChange={e => setTpReason(e.target.value)}
                  className="w-full bg-[#0f172a] border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="bg-[#172131] p-3 rounded-lg border border-slate-800 space-y-2">
                <label className="block text-rose-400 font-semibold font-mono text-[10px] uppercase">Reason for Stop Loss (SL)</label>
                <input
                  type="text"
                  placeholder="SL Logic (e.g. 5 pips below swing wick invalidation)"
                  value={slReason}
                  onChange={e => setSlReason(e.target.value)}
                  className="w-full bg-[#0f172a] border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Psychology & Emotions */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <div className="text-[10px] font-bold uppercase text-slate-400 font-mono tracking-wider flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-blue-400" /> 3. Emotional State & Discipline Score
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-mono text-[10px] uppercase">Pre-Trade Emotion</label>
                <select
                  value={emotionBefore}
                  onChange={e => setEmotionBefore(e.target.value as EmotionBefore)}
                  className="w-full bg-[#172131] border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Calm & Disciplined">Calm & Disciplined</option>
                  <option value="FOMO / Rushed">FOMO / Rushed</option>
                  <option value="Anxious / Hesitant">Anxious / Hesitant</option>
                  <option value="Overconfident / Greedy">Overconfident / Greedy</option>
                  <option value="Bored / Impatient">Bored / Impatient</option>
                  <option value="Revenge Mindset">Revenge Mindset</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono text-[10px] uppercase">Execution Quality</label>
                <select
                  value={executionDiscipline}
                  onChange={e => setExecutionDiscipline(e.target.value as ExecutionDiscipline)}
                  className="w-full bg-[#172131] border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Followed Plan 100%">Followed Plan 100%</option>
                  <option value="Cut Winner Early (Fear)">Cut Winner Early (Fear)</option>
                  <option value="Moved Stop Loss to Breakeven Too Early">Moved SL to BE Too Early</option>
                  <option value="Moved Stop Loss Back (Risk Violation)">Moved SL Back (Risk Violation)</option>
                  <option value="Added to Losing Position">Added to Losing Position</option>
                  <option value="Over-leveraged / Oversized">Over-leveraged / Oversized</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono text-[10px] uppercase">Discipline Score (1-5)</label>
                <div className="flex items-center gap-1.5 pt-1.5">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setDisciplineScore(star)}
                      className={`text-lg transition cursor-pointer ${star <= disciplineScore ? 'text-amber-400 scale-110' : 'text-slate-600'}`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="text-xs text-slate-400 ml-2 font-mono">{disciplineScore}/5</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#172131] border border-slate-700 text-slate-300 hover:bg-slate-800 font-medium transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow-sm hover:bg-blue-500 transition cursor-pointer"
            >
              Save & Audit Trade
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
