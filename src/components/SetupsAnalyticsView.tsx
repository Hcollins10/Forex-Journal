import React from 'react';
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  Globe, 
  Clock, 
  Award, 
  CheckCircle, 
  DollarSign, 
  BarChart2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell
} from 'recharts';
import { Trade } from '../types/trade';
import { computeSetupStats } from '../services/forexData';

interface SetupsAnalyticsViewProps {
  trades: Trade[];
}

export const SetupsAnalyticsView: React.FC<SetupsAnalyticsViewProps> = ({ trades }) => {
  const setupStats = computeSetupStats(trades);

  // Group by Exit Reason
  const exitMap = new Map<string, { count: number; pnl: number; wins: number }>();
  trades.filter(t => t.status === 'CLOSED').forEach(t => {
    const key = t.exitCategory || 'Manual Discretionary Exit';
    const prev = exitMap.get(key) || { count: 0, pnl: 0, wins: 0 };
    exitMap.set(key, {
      count: prev.count + 1,
      pnl: Number((prev.pnl + t.pnl).toFixed(2)),
      wins: prev.wins + (t.pnl > 0 ? 1 : 0),
    });
  });

  const exitStats = Array.from(exitMap.entries()).map(([label, val]) => ({
    label,
    count: val.count,
    pnl: val.pnl,
    winRate: Number(((val.wins / val.count) * 100).toFixed(1)),
  })).sort((a, b) => b.pnl - a.pnl);

  // Group by Currency Pair
  const pairMap = new Map<string, { count: number; pnl: number; wins: number; pips: number }>();
  trades.filter(t => t.status === 'CLOSED').forEach(t => {
    const key = t.pair;
    const prev = pairMap.get(key) || { count: 0, pnl: 0, wins: 0, pips: 0 };
    pairMap.set(key, {
      count: prev.count + 1,
      pnl: Number((prev.pnl + t.pnl).toFixed(2)),
      wins: prev.wins + (t.pnl > 0 ? 1 : 0),
      pips: Number((prev.pips + t.pips).toFixed(1)),
    });
  });

  const pairStats = Array.from(pairMap.entries()).map(([pair, val]) => ({
    pair,
    count: val.count,
    pnl: val.pnl,
    pips: val.pips,
    winRate: Number(((val.wins / val.count) * 100).toFixed(1)),
  })).sort((a, b) => b.pnl - a.pnl);

  // Group by Session
  const sessionMap = new Map<string, { count: number; pnl: number; wins: number }>();
  trades.filter(t => t.status === 'CLOSED').forEach(t => {
    const key = t.session || 'London';
    const prev = sessionMap.get(key) || { count: 0, pnl: 0, wins: 0 };
    sessionMap.set(key, {
      count: prev.count + 1,
      pnl: Number((prev.pnl + t.pnl).toFixed(2)),
      wins: prev.wins + (t.pnl > 0 ? 1 : 0),
    });
  });

  const sessionStats = Array.from(sessionMap.entries()).map(([session, val]) => ({
    session,
    count: val.count,
    pnl: val.pnl,
    winRate: Number(((val.wins / val.count) * 100).toFixed(1)),
  })).sort((a, b) => b.pnl - a.pnl);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Setups & Technical Edge Analytics
              </h1>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                Statistical audit of entry reasons, exit logic, TP/SL rules, and session profitability
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Entry Setups Performance Table & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Setup PnL Bar Chart (1 col) */}
        <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 shadow-sm">
          <h2 className="text-base font-bold text-white tracking-tight mb-1">
            Top Entry Setups by PnL
          </h2>
          <p className="text-xs text-slate-400 mb-4">Total return generated per model</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={setupStats} layout="vertical" margin={{ top: 5, right: 15, left: 30, bottom: 5 }}>
                <XAxis type="number" stroke="#64748b" fontSize={10} tickFormatter={v => `$${v}`} />
                <YAxis type="category" dataKey="category" stroke="#94a3b8" fontSize={10} width={100} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '11px', color: '#fff' }}
                  formatter={(value: any) => [`${Number(value) >= 0 ? '+' : ''}$${Number(value).toLocaleString()}`, 'PnL']}
                />
                <Bar dataKey="totalPnl" radius={[0, 4, 4, 0]}>
                  {setupStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.totalPnl >= 0 ? '#3b82f6' : '#f43f5e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Setups Breakdown Table (2 cols) */}
        <div className="lg:col-span-2 bg-[#1e293b] border border-slate-800 rounded-xl p-5 shadow-sm">
          <h2 className="text-base font-bold text-white tracking-tight mb-3">
            Entry Strategy & Model Performance
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-mono text-[10px] uppercase tracking-wider">
                  <th className="pb-3 font-bold">Entry Setup Model</th>
                  <th className="pb-3 font-bold">Trades</th>
                  <th className="pb-3 font-bold">Win Rate</th>
                  <th className="pb-3 font-bold">Profit Factor</th>
                  <th className="pb-3 font-bold">Avg R:R</th>
                  <th className="pb-3 font-bold text-right">Net Dollar Return</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {setupStats.map(s => (
                  <tr key={s.category} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 font-sans font-medium text-white text-xs">
                      {s.category}
                    </td>
                    <td className="py-3 text-slate-300">
                      {s.tradesCount}
                    </td>
                    <td className="py-3 font-bold">
                      <span className={s.winRate >= 60 ? 'text-emerald-400' : 'text-slate-300'}>
                        {s.winRate}%
                      </span>
                    </td>
                    <td className="py-3 text-blue-400">
                      {s.profitFactor}
                    </td>
                    <td className="py-3 text-slate-300">
                      1:{s.avgRR || 2.2}
                    </td>
                    <td className="py-3 text-right font-bold">
                      <span className={s.totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {s.totalPnl >= 0 ? '+' : ''}${s.totalPnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Grid: Reason for Exit Breakdown & Pair Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Reason for Exit Breakdown */}
        <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 shadow-sm">
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2 mb-3">
            <CheckCircle className="w-4 h-4 text-emerald-400" /> Reason for Exit Audit
          </h2>

          <div className="space-y-3 font-mono text-xs">
            {exitStats.map(item => (
              <div 
                key={item.label}
                className="bg-[#172131] border border-slate-800 rounded-lg p-3 flex items-center justify-between"
              >
                <div className="font-sans">
                  <div className="font-semibold text-white text-xs">
                    {item.label}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {item.count} trades • {item.winRate}% Win Rate
                  </div>
                </div>

                <div className="text-right">
                  <div className={`font-bold text-sm ${item.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {item.pnl >= 0 ? '+' : ''}${item.pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Currency Pair Analytics */}
        <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 shadow-sm">
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2 mb-3">
            <Globe className="w-4 h-4 text-blue-400" /> Performance by Forex Pair
          </h2>

          <div className="space-y-3 font-mono text-xs">
            {pairStats.map(item => (
              <div 
                key={item.pair}
                className="bg-[#172131] border border-slate-800 rounded-lg p-3 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-white text-xs">
                    {item.pair}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {item.count} trades • {item.winRate}% Win Rate • {item.pips > 0 ? '+' : ''}{item.pips} pips
                  </div>
                </div>

                <div className="text-right">
                  <div className={`font-bold text-sm ${item.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {item.pnl >= 0 ? '+' : ''}${item.pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trading Sessions Performance */}
      <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 shadow-sm">
        <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-blue-400" /> Performance by Forex Trading Session
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sessionStats.map(item => (
            <div key={item.session} className="bg-[#172131] border border-slate-800 rounded-lg p-4">
              <div className="text-[10px] uppercase text-slate-500 font-bold">{item.session} Session</div>
              <div className={`text-xl font-bold font-mono mt-1 ${item.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {item.pnl >= 0 ? '+' : ''}${item.pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-1 flex justify-between">
                <span>{item.count} trades</span>
                <span className={item.winRate >= 60 ? 'text-emerald-400' : ''}>{item.winRate}% Win</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
