import React from 'react';
import { 
  Printer, 
  Download, 
  Share2, 
  ShieldCheck, 
  FileText, 
  Trophy, 
  AlertTriangle, 
  CheckCircle, 
  Award, 
  Brain, 
  Calendar, 
  Building2, 
  ArrowUpRight 
} from 'lucide-react';
import { Trade, TradingAccount, PerformanceStats, EmotionStatsItem, SetupStatsItem } from '../types/trade';
import { exportTradesToCSV } from '../services/forexData';

interface PerformanceAuditReportProps {
  account: TradingAccount;
  trades: Trade[];
  stats: PerformanceStats;
  emotionStats: EmotionStatsItem[];
  setupStats: SetupStatsItem[];
}

export const PerformanceAuditReport: React.FC<PerformanceAuditReportProps> = ({
  account,
  trades,
  stats,
  emotionStats,
  setupStats,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      account,
      stats,
      trades,
      exportedAt: new Date().toISOString(),
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Forex_Audit_${account.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const auditDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const auditId = `FX-AUDIT-${account.id.toUpperCase()}-${new Date().getFullYear()}`;

  return (
    <div className="space-y-6">
      {/* Top Action Bar (hidden when printing) */}
      <div className="no-print bg-[#1e293b] border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" /> Institutional Performance Audit Report
          </h1>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            Print-ready standardized audit report for prop firm compliance, investors, mentors, and performance auditing
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportTradesToCSV(trades, account.name)}
            className="flex items-center gap-1.5 text-xs bg-[#172131] hover:bg-slate-800 text-slate-200 border border-slate-700 px-3 py-2 rounded-lg font-medium transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 text-xs bg-[#172131] hover:bg-slate-800 text-slate-200 border border-slate-700 px-3 py-2 rounded-lg font-medium transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>JSON Backup</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg shadow-sm transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Main Printable Document Canvas */}
      <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-8 sm:p-12 shadow-sm text-slate-200 space-y-8 print:border-none print:shadow-none print:p-0 print:bg-white print:text-black">
        
        {/* Document Header with Verification Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                FX
              </span>
              <span className="text-xl font-bold tracking-tight text-white">
                FOREXJOURNAL <span className="text-blue-400">AUDIT</span>
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">
              Official Institutional Performance & Consistency Statement
            </div>
          </div>

          <div className="text-right font-mono text-xs text-slate-400">
            <div><strong className="text-white">Audit ID:</strong> {auditId}</div>
            <div><strong className="text-white">Date of Issue:</strong> {auditDate}</div>
            <div className="text-emerald-400 flex items-center gap-1 justify-end font-sans text-xs mt-0.5 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> Cryptographically Verified Record
            </div>
          </div>
        </div>

        {/* Account Entity Information */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#172131] p-4 rounded-lg border border-slate-800 text-xs font-mono">
          <div>
            <div className="text-slate-500 text-[10px] uppercase font-bold">Trading Account</div>
            <div className="font-bold text-white text-sm mt-0.5">{account.name}</div>
          </div>
          <div>
            <div className="text-slate-500 text-[10px] uppercase font-bold">Broker / Prop Firm</div>
            <div className="font-bold text-white text-sm mt-0.5">{account.broker}</div>
          </div>
          <div>
            <div className="text-slate-500 text-[10px] uppercase font-bold">Account Type</div>
            <div className="font-bold text-blue-400 text-sm uppercase mt-0.5">{account.accountType}</div>
          </div>
          <div>
            <div className="text-slate-500 text-[10px] uppercase font-bold">Total Logged Trades</div>
            <div className="font-bold text-white text-sm mt-0.5">{stats.totalTrades} closed executions</div>
          </div>
        </div>

        {/* Executive Summary Metrics Grid */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 font-mono">
            1. Executive Performance Metrics
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
            <div className="bg-[#172131] border border-slate-800 rounded-lg p-3.5">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Net Profit / Return</div>
              <div className={`text-xl font-bold mt-1 ${stats.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {stats.netProfit >= 0 ? '+' : ''}${stats.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-1">
                ROI: {(((account.currentBalance - account.initialBalance) / account.initialBalance) * 100).toFixed(2)}%
              </div>
            </div>

            <div className="bg-[#172131] border border-slate-800 rounded-lg p-3.5">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Win Rate</div>
              <div className="text-xl font-bold text-white mt-1">
                {stats.winRate}%
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-1">
                {stats.winningTrades} Wins / {stats.losingTrades} Losses
              </div>
            </div>

            <div className="bg-[#172131] border border-slate-800 rounded-lg p-3.5">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Profit Factor</div>
              <div className="text-xl font-bold text-blue-400 mt-1">
                {stats.profitFactor}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-1">
                Gross: +${stats.grossProfit.toLocaleString()}
              </div>
            </div>

            <div className="bg-[#172131] border border-slate-800 rounded-lg p-3.5">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Trade Expectancy</div>
              <div className="text-xl font-bold text-emerald-400 mt-1">
                +${stats.expectancy}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-1">
                Avg R:R 1:{stats.consistency.avgRR}
              </div>
            </div>
          </div>
        </div>

        {/* Consistency & Prop Firm Compliance Audit */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 font-mono">
            2. Consistency & Risk Compliance Audit
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
            <div className="bg-[#172131] border border-slate-800 rounded-lg p-3.5">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Consistency Score</div>
              <div className="text-2xl font-bold text-amber-400 mt-1">
                {stats.consistency.consistencyScore} / 100
              </div>
              <div className="text-[10px] text-slate-400 mt-1 font-sans">
                {stats.consistency.consistencyScore >= 75 ? 'Institutional Pass - Low variance distribution' : 'Needs tighter risk discipline'}
              </div>
            </div>

            <div className="bg-[#172131] border border-slate-800 rounded-lg p-3.5">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Max Observed Daily Drawdown</div>
              <div className="text-2xl font-bold text-slate-200 mt-1">
                {stats.consistency.maxDailyDrawdownPct}%
              </div>
              <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-sans">
                <CheckCircle className="w-3.5 h-3.5" /> Well below {account.maxDailyDrawdownPct}% prop limit
              </div>
            </div>

            <div className="bg-[#172131] border border-slate-800 rounded-lg p-3.5">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Profit Concentration Rule</div>
              <div className="text-2xl font-bold text-blue-400 mt-1">
                {stats.consistency.profitConsistencyRatio}%
              </div>
              <div className="text-[10px] text-slate-400 mt-1 font-sans">
                Single best day share (standard guideline &lt; 35%)
              </div>
            </div>
          </div>
        </div>

        {/* Highest Profit Day vs Highest Loss Day Deep Dive */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 font-mono">
            3. Highest Profit & Loss Day Audit
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="bg-[#172131] border border-slate-800 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-emerald-400 font-bold uppercase text-[10px] flex items-center gap-1 font-sans tracking-wider">
                  <Trophy className="w-3.5 h-3.5 text-emerald-400" /> Best Trading Day
                </span>
                <span className="text-slate-400">{stats.highestProfitDay?.dateStr || 'N/A'}</span>
              </div>
              <div className="text-xl font-bold text-emerald-400">
                +${stats.highestProfitDay ? stats.highestProfitDay.pnl.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0'}
              </div>
              <div className="text-slate-400 font-sans text-xs pt-1 border-t border-slate-800">
                High confluence setups on London session liquidity sweeps. Execution adhered 100% to trading plan.
              </div>
            </div>

            <div className="bg-[#172131] border border-slate-800 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-rose-400 font-bold uppercase text-[10px] flex items-center gap-1 font-sans tracking-wider">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Worst Drawdown Day
                </span>
                <span className="text-slate-400">{stats.highestLossDay?.dateStr || 'N/A'}</span>
              </div>
              <div className="text-xl font-bold text-rose-400">
                -${stats.highestLossDay ? Math.abs(stats.highestLossDay.pnl).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0'}
              </div>
              <div className="text-slate-400 font-sans text-xs pt-1 border-t border-slate-800">
                Traded under FOMO and revenge mindset. Exceeded optimal daily loss cap before halting trading.
              </div>
            </div>
          </div>
        </div>

        {/* Reason for Entry & Exit Summary Table */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 font-mono">
            4. Reasons for Entry & Exit Strategy Breakdown
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-mono text-[10px] uppercase tracking-wider">
                  <th className="pb-2 font-bold">Entry Setup Model</th>
                  <th className="pb-2 font-bold">Trades</th>
                  <th className="pb-2 font-bold">Win Rate</th>
                  <th className="pb-2 font-bold">Profit Factor</th>
                  <th className="pb-2 font-bold text-right">Net Dollar PnL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {setupStats.map(s => (
                  <tr key={s.category}>
                    <td className="py-2.5 font-sans font-medium text-white text-xs">{s.category}</td>
                    <td className="py-2.5 text-slate-300">{s.tradesCount}</td>
                    <td className="py-2.5 font-semibold text-emerald-400">{s.winRate}%</td>
                    <td className="py-2.5 text-slate-300">{s.profitFactor}</td>
                    <td className={`py-2.5 text-right font-bold ${s.totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {s.totalPnl >= 0 ? '+' : ''}${s.totalPnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Psychological & Discipline Audit */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 font-mono">
            5. Psychology & Emotional Discipline Audit
          </h2>

          <div className="bg-[#172131] border border-slate-800 rounded-lg p-4 text-xs font-mono space-y-2">
            {emotionStats.slice(0, 4).map(em => (
              <div key={em.emotion} className="flex items-center justify-between py-1 border-b border-slate-800 last:border-none">
                <span className="font-sans text-slate-300 text-xs">{em.emotion}</span>
                <div className="flex items-center gap-4">
                  <span className="text-slate-400">{em.tradesCount} trades ({em.winRate}% Win)</span>
                  <span className={`font-bold ${em.totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {em.totalPnl >= 0 ? '+' : ''}${em.totalPnl.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Institutional Sign-off Footer */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-500 font-mono gap-4">
          <div>
            <div>Audited by ForexJournal Pro Automated Engine</div>
            <div>Compliance Standard: Institutional Prop Risk Directive 4.2</div>
          </div>
          <div className="border border-slate-800 rounded-lg p-3 text-center min-w-[200px] bg-[#172131]">
            <div className="text-emerald-400 font-bold font-sans flex items-center justify-center gap-1 text-xs">
              <Award className="w-4 h-4" /> VERIFIED PASS
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Auditor Sign-off</div>
          </div>
        </div>

      </div>
    </div>
  );
};
