import React, { useState } from 'react';
import { 
  X, 
  Target, 
  Brain, 
  ShieldCheck, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  Bot, 
  AlertTriangle, 
  CheckCircle2, 
  DollarSign, 
  Layers, 
  RotateCcw 
} from 'lucide-react';
import { Trade } from '../../types/trade';
import { requestSingleTradeAnalysis, TradeAnalysisResponse } from '../../services/aiService';

interface TradeDetailModalProps {
  trade: Trade | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TradeDetailModal: React.FC<TradeDetailModalProps> = ({
  trade,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !trade) return null;

  const [aiAnalysis, setAiAnalysis] = useState<TradeAnalysisResponse | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const handleRunAiCritique = async () => {
    setLoadingAi(true);
    try {
      const res = await requestSingleTradeAnalysis(trade);
      if (res.success && res.analysis) {
        setAiAnalysis(res.analysis);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#1e293b] border border-slate-800 rounded-xl max-w-2xl w-full p-6 sm:p-7 space-y-5 shadow-2xl my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <span className={`text-[10px] font-bold font-mono px-2.5 py-1 rounded-md ${
              trade.type === 'BUY' 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}>
              {trade.type}
            </span>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2 tracking-tight">
                {trade.pair} <span className="text-xs text-slate-400 font-mono">#{trade.ticketNumber}</span>
              </h2>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                {new Date(trade.openTime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} • {trade.session} Session
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className={`text-xl font-bold font-mono ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              {trade.pips >= 0 ? '+' : ''}{trade.pips} pips
            </div>
          </div>
        </div>

        {/* Trade Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#172131] p-3.5 rounded-lg border border-slate-800 text-xs font-mono">
          <div>
            <div className="text-slate-500 text-[10px] uppercase">Lot Size</div>
            <div className="font-bold text-white text-sm mt-0.5">{trade.lotSize} lots</div>
          </div>
          <div>
            <div className="text-slate-500 text-[10px] uppercase">Open Price</div>
            <div className="font-bold text-white text-sm mt-0.5">{trade.openPrice}</div>
          </div>
          <div>
            <div className="text-slate-500 text-[10px] uppercase">Close Price</div>
            <div className="font-bold text-white text-sm mt-0.5">{trade.closePrice}</div>
          </div>
          <div>
            <div className="text-slate-500 text-[10px] uppercase">Realized R:R</div>
            <div className="font-bold text-blue-400 text-sm mt-0.5">1:{trade.realizedRR || 2.0}</div>
          </div>
        </div>

        {/* Technical Reasons Breakdown */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-bold uppercase text-slate-400 font-mono tracking-wider">
            Technical Audit & Execution Reasons
          </h3>

          {/* Reason for Entry */}
          <div className="bg-[#172131] border border-slate-800 rounded-lg p-3.5 space-y-1">
            <div className="text-[10px] font-bold text-blue-400 flex items-center gap-1.5 font-mono tracking-wider">
              <Target className="w-3.5 h-3.5" /> REASON FOR ENTRY ({trade.entryCategory})
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              {trade.entryReason}
            </p>
          </div>

          {/* Reason for Exit */}
          <div className="bg-[#172131] border border-slate-800 rounded-lg p-3.5 space-y-1">
            <div className="text-[10px] font-bold text-amber-400 flex items-center gap-1.5 font-mono tracking-wider">
              <Clock className="w-3.5 h-3.5" /> REASON FOR EXIT ({trade.exitCategory})
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              {trade.exitReason}
            </p>
          </div>

          {/* TP & SL Logic Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-[#172131] border border-slate-800 rounded-lg p-3 space-y-1">
              <div className="text-[10px] font-bold text-emerald-400 font-mono tracking-wider">
                TAKE PROFIT (TP) REASON
              </div>
              <div className="text-xs text-slate-300 font-sans">
                {trade.tpReason || trade.tpCategory || 'Planned target reached'}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                Level: {trade.takeProfit}
              </div>
            </div>

            <div className="bg-[#172131] border border-slate-800 rounded-lg p-3 space-y-1">
              <div className="text-[10px] font-bold text-rose-400 font-mono tracking-wider">
                STOP LOSS (SL) REASON
              </div>
              <div className="text-xs text-slate-300 font-sans">
                {trade.slReason || trade.slCategory || 'Invalidation level'}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                Level: {trade.stopLoss}
              </div>
            </div>
          </div>
        </div>

        {/* Psychology & Discipline Rating */}
        <div className="bg-[#172131] border border-slate-800 rounded-lg p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-mono text-blue-400 font-bold uppercase tracking-wider">
              <Brain className="w-3.5 h-3.5" /> Psychological State & Discipline
            </div>
            <div className="text-amber-400 font-mono text-xs">
              {'★'.repeat(trade.disciplineScore || 3)}{'☆'.repeat(5 - (trade.disciplineScore || 3))} ({trade.disciplineScore}/5)
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-400 font-mono text-[10px] uppercase">Pre-trade emotion:</span> <strong className="text-white">{trade.emotionBefore}</strong>
            </div>
            <div>
              <span className="text-slate-400 font-mono text-[10px] uppercase">Execution adherence:</span> <strong className="text-white">{trade.executionDiscipline || 'Followed Plan'}</strong>
            </div>
          </div>
        </div>

        {/* AI Trade Coaching Critique */}
        {aiAnalysis ? (
          <div className="bg-[#172131] border border-blue-500/30 rounded-lg p-4 space-y-2.5 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] font-bold text-blue-400 uppercase font-mono tracking-wider">
                <Bot className="w-3.5 h-3.5" /> AI Trade Coaching Verdict
              </div>
              <span className="text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-md">
                Risk Score: {aiAnalysis.riskScore}/100
              </span>
            </div>

            <div className="text-xs font-semibold text-white">
              {aiAnalysis.verdict}
            </div>

            <div className="text-xs text-slate-300 bg-[#0f172a] p-3 rounded-lg border border-slate-800">
              <span className="text-blue-400 font-semibold font-mono text-[10px] uppercase">Coach Note:</span> {aiAnalysis.coachingNote}
            </div>
          </div>
        ) : (
          <button
            onClick={handleRunAiCritique}
            disabled={loadingAi}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#172131] hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>{loadingAi ? 'AI Auditor is Analyzing Trade...' : 'Run AI Trade Critique (Gemini)'}</span>
          </button>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#172131] border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
