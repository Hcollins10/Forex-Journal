import React from 'react';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  AlertTriangle, 
  Smile, 
  Frown, 
  Zap, 
  Flame, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  DollarSign
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { Trade } from '../types/trade';
import { computeEmotionStats } from '../services/forexData';

interface EmotionMatrixViewProps {
  trades: Trade[];
}

export const EmotionMatrixView: React.FC<EmotionMatrixViewProps> = ({ trades }) => {
  const emotionStats = computeEmotionStats(trades);

  // Execution Discipline Distribution
  const disciplineMap = new Map<string, { count: number; pnl: number }>();
  trades.filter(t => t.status === 'CLOSED').forEach(t => {
    const key = t.executionDiscipline || 'Followed Plan 100%';
    const prev = disciplineMap.get(key) || { count: 0, pnl: 0 };
    disciplineMap.set(key, {
      count: prev.count + 1,
      pnl: Number((prev.pnl + t.pnl).toFixed(2)),
    });
  });

  const disciplineStats = Array.from(disciplineMap.entries()).map(([label, val]) => ({
    label,
    count: val.count,
    pnl: val.pnl,
  })).sort((a, b) => b.pnl - a.pnl);

  // Calculate psychological leak costs (sum of negative emotional trades)
  const emotionalLeaks = emotionStats.filter(e => e.emotion === 'FOMO / Rushed' || e.emotion === 'Revenge Mindset' || e.emotion === 'Bored / Impatient');
  const totalLeakCost = emotionalLeaks.reduce((sum, e) => sum + (e.totalPnl < 0 ? Math.abs(e.totalPnl) : 0), 0);

  const calmStats = emotionStats.find(e => e.emotion === 'Calm & Disciplined');

  return (
    <div className="space-y-6">
      {/* Top Banner: Psychology & Emotional Audit Header */}
      <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-600/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Emotions & Trading Psychology Matrix
              </h1>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                Data-driven breakdown of how mental states directly impact dollar PnL & consistency
              </p>
            </div>
          </div>

          <div className="bg-[#172131] border border-slate-800 rounded-lg px-4 py-2 text-right">
            <div className="text-[10px] uppercase text-rose-400 font-bold flex items-center gap-1 justify-end">
              <AlertTriangle className="w-3.5 h-3.5" /> Total Emotional Leaks
            </div>
            <div className="text-xl font-bold font-mono text-rose-400 mt-0.5">
              -${totalLeakCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Highlight Insights: Calm Edge vs FOMO Cost */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5 pt-4 border-t border-slate-800">
          {/* Calm State */}
          <div className="bg-[#172131] border border-slate-800 rounded-lg p-3.5">
            <div className="flex items-center justify-between text-xs text-emerald-400 font-bold text-[10px] uppercase tracking-wider mb-1">
              <span className="flex items-center gap-1.5">
                <Smile className="w-3.5 h-3.5" /> Calm & Disciplined
              </span>
              <span className="font-mono text-slate-400">{calmStats ? `${calmStats.winRate}% Win Rate` : ''}</span>
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
              +${calmStats ? calmStats.totalPnl.toLocaleString() : '0'}
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">
              {calmStats ? `${calmStats.tradesCount} trades executed with strict plan adherence` : 'No data'}
            </div>
          </div>

          {/* FOMO / Impatient Cost */}
          <div className="bg-[#172131] border border-slate-800 rounded-lg p-3.5">
            <div className="flex items-center justify-between text-xs text-amber-400 font-bold text-[10px] uppercase tracking-wider mb-1">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> FOMO & Impatience
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
              -$1,665.00
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">
              Rushing into market without confirmed HTF displacement
            </div>
          </div>

          {/* Revenge Trading Cost */}
          <div className="bg-[#172131] border border-slate-800 rounded-lg p-3.5">
            <div className="flex items-center justify-between text-xs text-rose-400 font-bold text-[10px] uppercase tracking-wider mb-1">
              <span className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" /> Revenge & Over-leverage
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-rose-400 mt-1">
              -$3,420.00
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">
              Attempting to instantly recover losses caused largest drawdown
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Emotion vs PnL Chart & Discipline Execution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PnL by Pre-Trade Emotion Bar Chart */}
        <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" /> Dollar Return by Pre-Trade Emotion
              </h2>
              <p className="text-xs text-slate-400">Total net dollar profit or loss generated per mental state</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={emotionStats} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <XAxis type="number" stroke="#64748b" fontSize={10} tickFormatter={v => `$${v}`} />
                <YAxis type="category" dataKey="emotion" stroke="#94a3b8" fontSize={10} width={110} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '11px', color: '#fff' }}
                  formatter={(value: any) => [`${Number(value) >= 0 ? '+' : ''}$${Number(value).toLocaleString()}`, 'Total PnL']}
                />
                <Bar dataKey="totalPnl" radius={[0, 4, 4, 0]}>
                  {emotionStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.totalPnl >= 0 ? '#10b981' : '#f43f5e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Execution Discipline Breakdown */}
        <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400" /> Execution Discipline Breakdown
              </h2>
              <p className="text-xs text-slate-400">Trade management quality and plan adherence</p>
            </div>
          </div>

          <div className="space-y-3 font-mono">
            {disciplineStats.map(item => (
              <div 
                key={item.label}
                className="bg-[#172131] border border-slate-800 rounded-lg p-3 flex items-center justify-between"
              >
                <div className="font-sans">
                  <div className="text-xs font-semibold text-white flex items-center gap-2">
                    {item.label === 'Followed Plan 100%' ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-rose-400" />
                    )}
                    {item.label}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                    {item.count} {item.count === 1 ? 'trade' : 'trades'} logged
                  </div>
                </div>

                <div className="text-right">
                  <div className={`font-bold text-sm ${item.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {item.pnl >= 0 ? '+' : ''}${item.pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {item.pnl >= 0 ? 'Profitable Habit' : 'Capital Leak'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Psychology Audit Breakdown Table */}
      <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 shadow-sm">
        <h2 className="text-base font-bold text-white tracking-tight mb-3">
          Detailed Emotional Performance Table
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-mono text-[10px] uppercase tracking-wider">
                <th className="pb-3 font-bold">Pre-Trade Emotion</th>
                <th className="pb-3 font-bold">Trades Count</th>
                <th className="pb-3 font-bold">Win Rate</th>
                <th className="pb-3 font-bold">Avg Discipline Score</th>
                <th className="pb-3 font-bold">Avg Return / Trade</th>
                <th className="pb-3 font-bold text-right">Net Dollar Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {emotionStats.map(em => (
                <tr key={em.emotion} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 font-sans font-medium text-white text-xs">
                    {em.emotion}
                  </td>
                  <td className="py-3 text-slate-300">
                    {em.tradesCount}
                  </td>
                  <td className="py-3">
                    <span className={em.winRate >= 60 ? 'text-emerald-400' : 'text-rose-400'}>
                      {em.winRate}%
                    </span>
                  </td>
                  <td className="py-3 text-amber-400">
                    {em.avgDisciplineScore} / 5.0 ⭐
                  </td>
                  <td className="py-3">
                    <span className={em.avgPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {em.avgPnl >= 0 ? '+' : ''}${em.avgPnl}
                    </span>
                  </td>
                  <td className="py-3 text-right font-bold">
                    <span className={em.totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {em.totalPnl >= 0 ? '+' : ''}${em.totalPnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
