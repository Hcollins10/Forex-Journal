import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  RefreshCw, 
  ShieldCheck, 
  AlertTriangle, 
  Brain, 
  Target, 
  CheckCircle2, 
  Lightbulb, 
  ArrowRight,
  Copy,
  Check
} from 'lucide-react';
import { TradingAccount, PerformanceStats, EmotionStatsItem, SetupStatsItem } from '../types/trade';
import { requestJournalAudit, AuditReportResponse } from '../services/aiService';

interface AICoachViewProps {
  account: TradingAccount;
  stats: PerformanceStats;
  emotionStats: EmotionStatsItem[];
  setupStats: SetupStatsItem[];
}

export const AICoachView: React.FC<AICoachViewProps> = ({
  account,
  stats,
  emotionStats,
  setupStats,
}) => {
  const [loading, setLoading] = useState(false);
  const [audit, setAudit] = useState<AuditReportResponse | null>(null);
  const [source, setSource] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const handleGenerateAudit = async () => {
    setLoading(true);
    try {
      const res = await requestJournalAudit(account, stats, emotionStats, setupStats);
      if (res.success && res.audit) {
        setAudit(res.audit);
        setSource(res.source);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!audit) return;
    const text = `
=== FOREX JOURNAL AUDIT ===
Account: ${account.name} (${account.broker})
Consistency Rating: ${audit.consistencyRating}

EXECUTIVE SUMMARY:
${audit.executiveSummary}

PSYCHOLOGICAL LEAKS:
${audit.psychologicalLeaks.map(l => `• ${l}`).join('\n')}

TECHNICAL EDGE:
${audit.technicalEdgeSummary || 'Solid liquidity sweep execution.'}

KEY RECOMMENDATIONS:
${audit.keyRecommendations.map(r => `• ${r}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">
                  AI Institutional Trading Coach & Auditor
                </h1>
                <span className="text-[10px] bg-blue-500/10 text-blue-400 font-mono px-2 py-0.5 rounded-md border border-blue-500/20 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-blue-400" /> Gemini Powered
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                Institutional-grade audit reviewing mental leaks, risk consistency, and technical edge
              </p>
            </div>
          </div>

          <button
            onClick={handleGenerateAudit}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Auditing Trades...' : 'Run Institutional Audit'}</span>
          </button>
        </div>
      </div>

      {/* Main Audit Display */}
      {audit ? (
        <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-6 sm:p-8 space-y-6 shadow-sm">
          {/* Audit Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 font-mono tracking-wider">
                Consistency Rating
              </span>
              <div className="text-2xl font-bold text-white flex items-center gap-2 mt-0.5 tracking-tight">
                {audit.consistencyRating}
                <span className="text-xs font-normal font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                  Score: {stats.consistency.consistencyScore}/100
                </span>
              </div>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs bg-[#172131] hover:bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-lg transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
            </button>
          </div>

          {/* Executive Summary */}
          <div className="bg-[#172131] border border-slate-800 rounded-lg p-4">
            <h3 className="text-[10px] font-bold uppercase text-slate-400 font-mono mb-2 flex items-center gap-1.5 tracking-wider">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Executive Performance Summary
            </h3>
            <p className="text-slate-200 text-xs leading-relaxed">
              {audit.executiveSummary}
            </p>
          </div>

          {/* Psychological Leaks & Inconsistencies */}
          <div className="bg-[#172131] border border-slate-800 rounded-lg p-4 space-y-2.5">
            <h3 className="text-[10px] font-bold uppercase text-rose-400 font-mono flex items-center gap-1.5 tracking-wider">
              <AlertTriangle className="w-3.5 h-3.5" /> Detected Psychological & Risk Leaks
            </h3>
            <div className="space-y-2 text-xs text-slate-200">
              {audit.psychologicalLeaks.map((leak, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span>{leak}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Edge Summary */}
          {audit.technicalEdgeSummary && (
            <div className="bg-[#172131] border border-slate-800 rounded-lg p-4 space-y-2">
              <h3 className="text-[10px] font-bold uppercase text-blue-400 font-mono flex items-center gap-1.5 tracking-wider">
                <Target className="w-3.5 h-3.5" /> Core Technical Edge & Setups
              </h3>
              <p className="text-slate-200 text-xs leading-relaxed">
                {audit.technicalEdgeSummary}
              </p>
            </div>
          )}

          {/* Recommendations / Action Plan */}
          <div className="bg-[#172131] border border-slate-800 rounded-lg p-4 space-y-2.5">
            <h3 className="text-[10px] font-bold uppercase text-emerald-400 font-mono flex items-center gap-1.5 tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5" /> Institutional Action Plan & Rules to Enforce
            </h3>
            <div className="space-y-2 text-xs text-slate-200">
              {audit.keyRecommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {source === 'local-heuristic' && (
            <div className="text-[10px] text-slate-500 font-mono text-center">
              Generated via local heuristics audit engine. Add a Gemini API key for advanced neural commentary.
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-lg bg-blue-600/10 text-blue-400 flex items-center justify-center mx-auto border border-blue-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Generate Your Institutional Trading Audit</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Click the button above to run an AI audit across your {stats.totalTrades} closed trades, analyzing profit consistency, emotional discipline, and execution habits.
            </p>
          </div>
          <button
            onClick={handleGenerateAudit}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-5 py-2.5 rounded-lg shadow-sm transition cursor-pointer"
          >
            {loading ? 'Analyzing Data...' : 'Run Audit Now'}
          </button>
        </div>
      )}
    </div>
  );
};
