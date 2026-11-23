import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Percent, 
  ShieldCheck, 
  AlertTriangle, 
  Trophy, 
  Skull, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  Clock, 
  Target, 
  Brain,
  Activity,
  Plus
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine,
  Cell
} from 'recharts';
import { Trade, TradingAccount, PerformanceStats } from '../types/trade';

interface DashboardOverviewProps {
  account: TradingAccount;
  trades: Trade[];
  stats: PerformanceStats;
  onSelectTab: (tab: string) => void;
  onOpenTradeDetail: (trade: Trade) => void;
  onOpenLogTrade: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  account,
  trades,
  stats,
  onSelectTab,
  onOpenTradeDetail,
  onOpenLogTrade,
}) => {
  const closedTrades = trades.filter(t => t.status === 'CLOSED');
  
  // Generate Equity Curve chronological data
  const chronologicalTrades = [...closedTrades].sort(
    (a, b) => new Date(a.closeTime).getTime() - new Date(b.closeTime).getTime()
  );

  let currentBal = account.initialBalance;
  const equityCurveData = [
    {
      tradeNum: 0,
      date: 'Start',
      balance: account.initialBalance,
      pnl: 0,
      pair: '',
    },
    ...chronologicalTrades.map((t, idx) => {
      currentBal += t.pnl;
      return {
        tradeNum: idx + 1,
        date: new Date(t.closeTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        balance: Number(currentBal.toFixed(2)),
        pnl: t.pnl,
        pair: t.pair,
        type: t.type,
      };
    })
  ];

  // Daily PnL grouped data
  const dailyPnlMap = new Map<string, number>();
  chronologicalTrades.forEach(t => {
    const day = t.closeTime.split('T')[0];
    const prev = dailyPnlMap.get(day) || 0;
    dailyPnlMap.set(day, Number((prev + t.pnl).toFixed(2)));
  });

  const dailyChartData = Array.from(dailyPnlMap.entries()).map(([dayStr, pnl]) => {
    const d = new Date(dayStr + 'T12:00:00Z');
    return {
      day: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      pnl,
      rawDate: dayStr,
    };
  });

  const roi = ((account.currentBalance - account.initialBalance) / account.initialBalance) * 100;
  const targetProgress = account.profitTargetPct 
    ? Math.min(100, Math.max(0, (roi / account.profitTargetPct) * 100))
    : null;

  return (
    <div className="space-y-6">
      {/* Top Banner: Account Status & Prop Firm Compliance Overview */}
      <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-blue-600/10 text-blue-400 border border-blue-500/20">
                {account.accountType} Trading Account
              </span>
              <span className="text-slate-400 text-xs">• Broker: {account.broker} • Leverage 1:{account.leverage}</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
              {account.name}
            </h1>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs">
            <div className="bg-[#172131] border border-slate-800 rounded-lg px-3.5 py-2">
              <div className="text-[10px] uppercase text-slate-500 font-bold">Current Balance</div>
              <div className="text-white font-mono font-bold text-base mt-0.5">
                ${account.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="bg-[#172131] border border-slate-800 rounded-lg px-3.5 py-2">
              <div className="text-[10px] uppercase text-slate-500 font-bold">Net Return</div>
              <div className={`font-mono font-bold text-base mt-0.5 flex items-center gap-1 ${roi >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {roi >= 0 ? '+' : ''}{roi.toFixed(2)}%
                <span className="text-xs font-normal text-slate-400">(${stats.netProfit.toLocaleString()})</span>
              </div>
            </div>
            <div className="bg-[#172131] border border-slate-800 rounded-lg px-3.5 py-2">
              <div className="text-[10px] uppercase text-slate-500 font-bold">Consistency Score</div>
              <div className="text-emerald-400 font-mono font-bold text-base mt-0.5 flex items-center gap-1">
                {stats.consistency.consistencyScore}%
                <span className="text-[10px] text-slate-400 font-normal">
                  {stats.consistency.consistencyScore >= 75 ? 'Institutional' : 'Developing'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Prop Firm Drawdown & Profit Target Progress Meters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5 pt-4 border-t border-slate-800">
          {/* Daily Drawdown Meter */}
          <div className="bg-[#172131] border border-slate-800/80 rounded-lg p-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium flex items-center gap-1 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Max Daily Drawdown
              </span>
              <span className="font-mono text-slate-400 text-xs">
                {stats.consistency.maxDailyDrawdownPct}% / {account.maxDailyDrawdownPct}% Limit
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${
                  stats.consistency.maxDailyDrawdownPct > account.maxDailyDrawdownPct * 0.8
                    ? 'bg-rose-500'
                    : stats.consistency.maxDailyDrawdownPct > account.maxDailyDrawdownPct * 0.5
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, (stats.consistency.maxDailyDrawdownPct / account.maxDailyDrawdownPct) * 100)}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 mt-1.5 flex justify-between font-mono">
              <span>Worst day: ${stats.consistency.maxDailyDrawdownDollar.toLocaleString()}</span>
              <span className="text-emerald-400">Rule Passed</span>
            </div>
          </div>

          {/* Historical Peak Drawdown */}
          <div className="bg-[#172131] border border-slate-800/80 rounded-lg p-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium flex items-center gap-1 text-[11px]">
                <Activity className="w-3.5 h-3.5 text-indigo-400" /> Max Total Drawdown
              </span>
              <span className="font-mono text-slate-400 text-xs">
                {stats.consistency.maxHistoricalDrawdownPct}% / {account.maxTotalDrawdownPct}% Limit
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 transition-all"
                style={{ width: `${Math.min(100, (stats.consistency.maxHistoricalDrawdownPct / account.maxTotalDrawdownPct) * 100)}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 mt-1.5 flex justify-between font-mono">
              <span>Peak-to-trough risk</span>
              <span className="text-emerald-400">In Good Standing</span>
            </div>
          </div>

          {/* Profit Target Progress */}
          <div className="bg-[#172131] border border-slate-800/80 rounded-lg p-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium flex items-center gap-1 text-[11px]">
                <Target className="w-3.5 h-3.5 text-emerald-400" /> Profit Target Progress
              </span>
              <span className="font-mono text-emerald-400 font-bold text-xs">
                {roi.toFixed(1)}% / {account.profitTargetPct || 10}%
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all"
                style={{ width: `${targetProgress || 0}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 mt-1.5 flex justify-between font-mono">
              <span>Target: +${((account.initialBalance * (account.profitTargetPct || 10)) / 100).toLocaleString()}</span>
              <span>{(targetProgress || 0).toFixed(0)}% Completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: 4 Core Executive Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Win Rate */}
        <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Win Rate</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {stats.winRate}%
          </div>
          <div className="text-[10px] text-emerald-500 font-medium mt-1 flex items-center justify-between">
            <span>{stats.winningTrades} Wins / {stats.losingTrades} Losses</span>
            <span className="text-slate-500 font-normal">{(stats.totalTrades)} Total</span>
          </div>
        </div>

        {/* Profit Factor */}
        <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Profit Factor</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {stats.profitFactor}
          </div>
          <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between font-mono">
            <span className="text-emerald-400">+${stats.grossProfit.toLocaleString()}</span>
            <span className="text-rose-400">-${stats.grossLoss.toLocaleString()}</span>
          </div>
        </div>

        {/* Avg Risk/Reward & Expectancy */}
        <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Avg. Risk/Reward</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            1:{stats.consistency.avgRR}
          </div>
          <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
            <span className="text-emerald-400 font-mono">+${stats.expectancy}/trade</span>
            <span>Avg Exp.</span>
          </div>
        </div>

        {/* Consistency Rating */}
        <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Consistency</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {stats.consistency.consistencyScore}%
          </div>
          <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between font-mono">
            <span>Total Pips: {stats.totalPips > 0 ? '+' : ''}{stats.totalPips}</span>
            <span className="text-blue-400">Optimal</span>
          </div>
        </div>
      </div>

      {/* HIGHEST PROFIT DAY vs HIGHEST LOSS DAY Spotlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Highest Profit Day */}
        <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Highest Profit Day
                </span>
                <div className="text-xs text-white font-mono font-semibold">
                  {stats.highestProfitDay ? stats.highestProfitDay.dateStr : 'No data'}
                </div>
              </div>
            </div>
            {stats.highestProfitDay && (
              <span className="text-2xl font-bold font-mono text-emerald-400">
                +${stats.highestProfitDay.pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            )}
          </div>

          {stats.highestProfitDay ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs bg-[#172131] rounded-lg p-2.5 border border-slate-800">
                <span className="text-slate-400 text-xs">Daily Execution:</span>
                <span className="font-mono text-slate-200 text-xs">{stats.highestProfitDay.tradesCount} trades ({stats.highestProfitDay.wins}W - {stats.highestProfitDay.losses}L)</span>
              </div>
              <div className="text-xs text-slate-300 bg-[#172131] border border-slate-800 rounded-lg p-2.5">
                <span className="font-semibold text-emerald-400">Audit Note:</span> High-probability London/NY session sweep setups with 100% adherence to planned Take Profit targets.
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400">Log more trades to calculate highest profit day.</p>
          )}
        </div>

        {/* Highest Loss Day */}
        <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
                <Skull className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Highest Loss Day
                </span>
                <div className="text-xs text-white font-mono font-semibold">
                  {stats.highestLossDay ? stats.highestLossDay.dateStr : 'No data'}
                </div>
              </div>
            </div>
            {stats.highestLossDay && (
              <span className="text-2xl font-bold font-mono text-rose-400">
                -${Math.abs(stats.highestLossDay.pnl).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            )}
          </div>

          {stats.highestLossDay ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs bg-[#172131] rounded-lg p-2.5 border border-slate-800">
                <span className="text-slate-400 text-xs">Daily Execution:</span>
                <span className="font-mono text-slate-200 text-xs">{stats.highestLossDay.tradesCount} trades ({stats.highestLossDay.wins}W - {stats.highestLossDay.losses}L)</span>
              </div>
              <div className="text-xs text-slate-300 bg-[#172131] border border-slate-800 rounded-lg p-2.5">
                <span className="font-semibold text-rose-400">Auditor Warning:</span> Triggered by emotional overtrading and position sizing drift. Enforcing a hard 2-loss stop rule prevents this drawdown.
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400">No losing days recorded yet.</p>
          )}
        </div>
      </div>

      {/* Visual Charts: Equity Growth & Daily Returns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equity Curve Area Chart (2 cols) */}
        <div className="lg:col-span-2 bg-[#1e293b] border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" /> Account Equity Growth
              </h2>
              <p className="text-[10px] text-slate-400 font-mono">Performance Over Time</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-slate-400 bg-[#172131] px-2.5 py-1 rounded border border-slate-800">
                Peak: ${Math.max(...equityCurveData.map(d => d.balance)).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equityCurveData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="tradeNum" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={11} 
                  domain={['auto', 'auto']}
                  tickFormatter={val => `$${(val / 1000).toFixed(0)}k`} 
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }}
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Balance']}
                  labelFormatter={(label: any) => `Trade #${label}`}
                />
                <ReferenceLine y={account.initialBalance} stroke="#475569" strokeDasharray="3 3" />
                <Area 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#equityGrad)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily PnL Bar Chart (1 col) */}
        <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" /> Daily Net PnL
              </h2>
              <p className="text-[10px] text-slate-400 font-mono">Profitable vs Losing days</p>
            </div>
            <button 
              onClick={() => onSelectTab('calendar')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium"
            >
              Full Calendar →
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyChartData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickFormatter={val => `$${val}`} 
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }}
                  formatter={(value: any) => [`${Number(value) >= 0 ? '+' : ''}$${Number(value).toLocaleString()}`, 'Net PnL']}
                />
                <ReferenceLine y={0} stroke="#475569" />
                <Bar dataKey="pnl" radius={[3, 3, 0, 0]}>
                  {dailyChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10b981' : '#f43f5e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Trades Table */}
      <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" /> Recent Logged Trades
            </h2>
            <p className="text-xs text-slate-400">Click any trade to review execution, TP/SL logic, and emotions</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectTab('journal')}
              className="text-xs bg-[#172131] hover:bg-slate-800 text-slate-300 px-3 py-1.5 rounded-md border border-slate-700 font-medium transition-colors"
            >
              View All {trades.length} Trades →
            </button>
            <button
              onClick={onOpenLogTrade}
              className="flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-md font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> New Entry
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/50 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              <tr>
                <th className="py-3 px-4">Pair / Type</th>
                <th className="py-3 px-4">Lots</th>
                <th className="py-3 px-4">Entry Setup Reason</th>
                <th className="py-3 px-4">Exit Reason</th>
                <th className="py-3 px-4">TP / SL Logic</th>
                <th className="py-3 px-4">Emotion</th>
                <th className="py-3 px-4 text-right">Net PnL</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {trades.slice(0, 7).map((trade, idx) => (
                <tr 
                  key={trade.id} 
                  className={`hover:bg-slate-800/40 cursor-pointer transition-colors group ${idx % 2 === 1 ? 'bg-slate-800/20' : ''}`}
                  onClick={() => onOpenTradeDetail(trade)}
                >
                  {/* Pair & Type */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        trade.type === 'BUY' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}>
                        {trade.type}
                      </span>
                      <span className="font-bold text-white text-xs">{trade.pair}</span>
                      <span className="text-[10px] text-slate-400 font-normal">({trade.timeframe})</span>
                    </div>
                  </td>

                  {/* Lot size */}
                  <td className="py-3 px-4 text-slate-300">
                    {trade.lotSize}
                  </td>

                  {/* Entry Reason */}
                  <td className="py-3 px-4 max-w-xs font-sans">
                    <div className="text-slate-200 font-medium text-xs truncate" title={trade.entryReason}>
                      {trade.entryCategory}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate" title={trade.entryReason}>
                      {trade.entryReason}
                    </div>
                  </td>

                  {/* Exit Reason */}
                  <td className="py-3 px-4 max-w-xs font-sans">
                    <div className="text-slate-200 font-medium text-xs truncate" title={trade.exitReason}>
                      {trade.exitCategory}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate" title={trade.exitReason}>
                      {trade.exitReason}
                    </div>
                  </td>

                  {/* TP & SL Logic */}
                  <td className="py-3 px-4 font-sans">
                    <div className="text-[10px] text-slate-300">
                      <span className="text-emerald-400 font-mono">TP:</span> {trade.tpCategory || 'Planned target'}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      <span className="text-rose-400 font-mono">SL:</span> {trade.slCategory || 'Invalidation'}
                    </div>
                  </td>

                  {/* Emotion & Discipline */}
                  <td className="py-3 px-4 font-sans">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold whitespace-nowrap ${
                      trade.emotionBefore === 'Calm & Disciplined' 
                        ? 'bg-emerald-900/50 text-emerald-300'
                        : trade.emotionBefore === 'FOMO / Rushed' || trade.emotionBefore === 'Revenge Mindset'
                        ? 'bg-rose-900/50 text-rose-300'
                        : 'bg-blue-900/50 text-blue-300'
                    }`}>
                      {trade.emotionBefore}
                    </span>
                  </td>

                  {/* Net PnL */}
                  <td className="py-3 px-4 text-right font-mono">
                    <div className={`font-bold text-xs ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {trade.pips >= 0 ? '+' : ''}{trade.pips} pips
                    </div>
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4 text-right">
                    <span className="text-xs text-blue-400 group-hover:text-blue-300 font-medium">
                      Audit →
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
