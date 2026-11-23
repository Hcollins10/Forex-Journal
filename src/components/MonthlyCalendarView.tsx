import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  TrendingUp, 
  TrendingDown, 
  ChevronLeft, 
  ChevronRight, 
  Trophy, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Flame, 
  Layers, 
  Clock, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Trade, MonthPerformance, DayPerformance } from '../types/trade';
import { computeMonthlyPerformance } from '../services/forexData';

interface MonthlyCalendarViewProps {
  trades: Trade[];
  onOpenTradeDetail: (trade: Trade) => void;
}

export const MonthlyCalendarView: React.FC<MonthlyCalendarViewProps> = ({
  trades,
  onOpenTradeDetail,
}) => {
  const [selectedMonthKey, setSelectedMonthKey] = useState('2026-08');
  const [selectedDay, setSelectedDay] = useState<DayPerformance | null>(null);

  const monthPerformance = computeMonthlyPerformance(trades, selectedMonthKey);

  // Month navigation helpers
  const handlePrevMonth = () => {
    const [y, m] = selectedMonthKey.split('-').map(Number);
    const prevDate = new Date(y, m - 2, 1);
    const newKey = `${prevDate.getFullYear()}-${(prevDate.getMonth() + 1).toString().padStart(2, '0')}`;
    setSelectedMonthKey(newKey);
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    const [y, m] = selectedMonthKey.split('-').map(Number);
    const nextDate = new Date(y, m, 1);
    const newKey = `${nextDate.getFullYear()}-${(nextDate.getMonth() + 1).toString().padStart(2, '0')}`;
    setSelectedMonthKey(newKey);
    setSelectedDay(null);
  };

  // Calendar day calculation (padding for start of month)
  const [yearStr, monthStr] = selectedMonthKey.split('-');
  const firstDayOfMonth = new Date(parseInt(yearStr), parseInt(monthStr) - 1, 1).getDay();
  // Standard Monday-start offset: Sunday (0) becomes 6, Monday (1) becomes 0
  const startDayOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="space-y-6">
      {/* Month Header & High-Level Consistency Summary */}
      <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <h1 className="text-xl font-bold text-white tracking-tight">
                  {monthPerformance.monthName}
                </h1>
                <button
                  onClick={handleNextMonth}
                  className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                Monthly Performance Calendar & Consistency Audit
              </p>
            </div>
          </div>

          {/* Month Net Return Pill */}
          <div className="flex items-center gap-4">
            <div className="bg-[#172131] border border-slate-800 rounded-lg px-4 py-2 text-right">
              <div className="text-[10px] uppercase text-slate-500 font-bold">Month Net Return</div>
              <div className={`text-xl font-bold font-mono ${monthPerformance.totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {monthPerformance.totalPnl >= 0 ? '+' : ''}${monthPerformance.totalPnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>

        {/* Month Analytics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-5 pt-4 border-t border-slate-800">
          {/* Profitable Green Days */}
          <div className="bg-[#172131] border border-slate-800 rounded-lg p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold text-[10px] uppercase tracking-widest">
                <TrendingUp className="w-3.5 h-3.5" /> Profitable Days
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
              {monthPerformance.profitableDaysCount} <span className="text-xs text-slate-400 font-normal">days</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">
              Green winning sessions
            </div>
          </div>

          {/* Losing Red Days */}
          <div className="bg-[#172131] border border-slate-800 rounded-lg p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1.5 text-rose-400 font-bold text-[10px] uppercase tracking-widest">
                <TrendingDown className="w-3.5 h-3.5" /> Losing Days
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-rose-400 mt-1">
              {monthPerformance.losingDaysCount} <span className="text-xs text-slate-400 font-normal">days</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">
              Red drawdown sessions
            </div>
          </div>

          {/* Green Day Ratio % */}
          <div className="bg-[#172131] border border-slate-800 rounded-lg p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1.5 text-blue-400 font-bold text-[10px] uppercase tracking-widest">
                <CheckCircle2 className="w-3.5 h-3.5" /> Green Ratio
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              {monthPerformance.greenDayRatio}%
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">
              {monthPerformance.profitableDaysCount} / {monthPerformance.totalTradingDays} active days
            </div>
          </div>

          {/* Consistency Assessment */}
          <div className="bg-[#172131] border border-slate-800 rounded-lg p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold text-[10px] uppercase tracking-widest">
                <ShieldCheck className="w-3.5 h-3.5" /> Consistency
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
              {monthPerformance.greenDayRatio >= 65 ? 'High Edge' : 'Moderate'}
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">
              {monthPerformance.totalTradingDays} Total Trading Days
            </div>
          </div>
        </div>
      </div>

      {/* Highest Profit Day & Highest Loss Day of the Month */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {monthPerformance.bestDay && (
          <div 
            onClick={() => setSelectedDay(monthPerformance.bestDay)}
            className="bg-[#1e293b] border border-slate-800 hover:border-slate-700 rounded-xl p-4 cursor-pointer transition-colors shadow-sm"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5 uppercase tracking-widest">
                <Trophy className="w-3.5 h-3.5 text-emerald-400" /> Best Day of {monthPerformance.monthName}
              </span>
              <span className="text-xs font-mono text-slate-400">
                {monthPerformance.bestDay.dateStr}
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
              +${monthPerformance.bestDay.pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center justify-between font-mono">
              <span>{monthPerformance.bestDay.tradesCount} trades • {monthPerformance.bestDay.winRate}% win rate</span>
              <span className="text-blue-400 text-xs font-medium">Inspect trades →</span>
            </div>
          </div>
        )}

        {monthPerformance.worstDay && (
          <div 
            onClick={() => setSelectedDay(monthPerformance.worstDay)}
            className="bg-[#1e293b] border border-slate-800 hover:border-slate-700 rounded-xl p-4 cursor-pointer transition-colors shadow-sm"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5 uppercase tracking-widest">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" /> Worst Day of {monthPerformance.monthName}
              </span>
              <span className="text-xs font-mono text-slate-400">
                {monthPerformance.worstDay.dateStr}
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-rose-400 mt-1">
              -${Math.abs(monthPerformance.worstDay.pnl).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center justify-between font-mono">
              <span>{monthPerformance.worstDay.tradesCount} trades • High volatility leak</span>
              <span className="text-rose-400 text-xs font-medium">Inspect trades →</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Calendar Heatmap Grid */}
      <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-blue-400" /> Trading Heatmap & Day Breakdown
            </h2>
            <p className="text-xs text-slate-400">Green = Profitable Day, Red = Losing Day. Click any cell to view trades & reasons.</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              <span>Win</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
              <span>Loss</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-slate-800" />
              <span>No Trades</span>
            </div>
          </div>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
          {weekdays.map(d => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Day Tiles */}
        <div className="grid grid-cols-7 gap-2">
          {/* Leading empty tiles for month offset */}
          {Array.from({ length: startDayOffset }).map((_, i) => (
            <div key={`offset-${i}`} className="h-24 sm:h-28 bg-[#172131]/30 border border-slate-800/40 rounded-lg opacity-30" />
          ))}

          {/* Days of the month */}
          {monthPerformance.days.map(day => {
            const hasTrades = day.tradesCount > 0;
            const isProfit = day.pnl > 0;
            const isLoss = day.pnl < 0;
            const isSelected = selectedDay?.dateStr === day.dateStr;
            const isBest = monthPerformance.bestDay?.dateStr === day.dateStr;
            const isWorst = monthPerformance.worstDay?.dateStr === day.dateStr;

            return (
              <div
                key={day.dateStr}
                onClick={() => hasTrades && setSelectedDay(day)}
                className={`h-24 sm:h-28 rounded-lg p-2 sm:p-2.5 transition-colors flex flex-col justify-between border ${
                  hasTrades ? 'cursor-pointer' : 'cursor-default opacity-40'
                } ${
                  isSelected
                    ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900'
                    : ''
                } ${
                  isProfit
                    ? 'bg-emerald-950/30 hover:bg-emerald-950/50 border-emerald-500/30'
                    : isLoss
                    ? 'bg-rose-950/30 hover:bg-rose-950/50 border-rose-500/30'
                    : 'bg-[#172131] hover:bg-slate-800 border-slate-800'
                }`}
              >
                {/* Day Number + Special Badges */}
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-mono font-bold ${
                    isProfit ? 'text-emerald-400' : isLoss ? 'text-rose-400' : 'text-slate-400'
                  }`}>
                    {parseInt(day.dateStr.split('-')[2])}
                  </span>
                  
                  {isBest && (
                    <span className="text-[8px] bg-emerald-500/20 text-emerald-300 font-bold px-1 py-0.2 rounded border border-emerald-500/30 uppercase">
                      Best
                    </span>
                  )}
                  {isWorst && (
                    <span className="text-[8px] bg-rose-500/20 text-rose-300 font-bold px-1 py-0.2 rounded border border-rose-500/30 uppercase">
                      Loss
                    </span>
                  )}
                </div>

                {/* Day Net PnL */}
                {hasTrades ? (
                  <div>
                    <div className={`font-mono font-bold text-xs sm:text-sm ${
                      isProfit ? 'text-emerald-400' : isLoss ? 'text-rose-400' : 'text-slate-300'
                    }`}>
                      {isProfit ? '+' : ''}${day.pnl.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center justify-between">
                      <span>{day.tradesCount} {day.tradesCount === 1 ? 'trade' : 'trades'}</span>
                      <span className={day.winRate === 100 ? 'text-emerald-400' : ''}>{day.winRate}% W</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-600 font-mono text-center my-auto">
                    —
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Drilldown Drawer / Panel */}
      {selectedDay && (
        <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-600/10 text-blue-400 border border-blue-500/30 font-mono">
                  {selectedDay.dayOfWeek}
                </span>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Trades for {selectedDay.dateStr}
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {selectedDay.tradesCount} trades • {selectedDay.wins} Wins • {selectedDay.losses} Losses
              </p>
            </div>

            <div className="text-right">
              <div className="text-[10px] uppercase text-slate-500 font-bold">Day Total PnL</div>
              <div className={`text-xl font-bold font-mono ${selectedDay.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {selectedDay.pnl >= 0 ? '+' : ''}${selectedDay.pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Trades on this specific date */}
          <div className="space-y-3">
            {selectedDay.trades.map(trade => (
              <div
                key={trade.id}
                onClick={() => onOpenTradeDetail(trade)}
                className="bg-[#172131] border border-slate-800 hover:border-slate-700 rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-colors group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${
                      trade.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}>
                      {trade.type}
                    </span>
                    <span className="font-bold text-white text-xs">{trade.pair}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({trade.lotSize} lots • {trade.session} session)</span>
                  </div>

                  <div className="text-xs text-slate-300">
                    <span className="text-blue-400 font-medium">Entry Setup:</span> {trade.entryCategory} — <span className="text-slate-400">{trade.entryReason}</span>
                  </div>

                  <div className="text-xs text-slate-300">
                    <span className="text-amber-400 font-medium">Exit Reason:</span> {trade.exitCategory} — <span className="text-slate-400">{trade.exitReason}</span>
                  </div>

                  <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-1 font-mono">
                    <span><strong className="text-slate-300 font-sans">Emotion:</strong> {trade.emotionBefore}</span>
                    <span>•</span>
                    <span><strong className="text-slate-300 font-sans">Discipline:</strong> {trade.disciplineScore}/5 ⭐</span>
                  </div>
                </div>

                <div className="text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                  <div className={`text-base font-bold font-mono ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {trade.pips >= 0 ? '+' : ''}{trade.pips} pips
                  </div>
                  <span className="text-xs text-blue-400 group-hover:text-blue-300 flex items-center gap-0.5 mt-1 font-medium">
                    Audit <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
