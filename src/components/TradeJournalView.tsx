import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Plus, 
  ArrowUpDown, 
  Trash2, 
  Eye, 
  LayoutList, 
  LayoutGrid, 
  CheckCircle, 
  XCircle, 
  Tag, 
  Brain, 
  Target, 
  Clock, 
  ShieldAlert,
  Download
} from 'lucide-react';
import { Trade, EntryCategory, ExitCategory, EmotionBefore } from '../types/trade';
import { exportTradesToCSV } from '../services/forexData';

interface TradeJournalViewProps {
  trades: Trade[];
  accountName: string;
  onOpenTradeDetail: (trade: Trade) => void;
  onOpenLogTrade: () => void;
  onDeleteTrade: (id: string) => void;
}

export const TradeJournalView: React.FC<TradeJournalViewProps> = ({
  trades,
  accountName,
  onOpenTradeDetail,
  onOpenLogTrade,
  onDeleteTrade,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState<'ALL' | 'WIN' | 'LOSS' | 'BREAKEVEN'>('ALL');
  const [setupFilter, setSetupFilter] = useState<string>('ALL');
  const [exitFilter, setExitFilter] = useState<string>('ALL');
  const [emotionFilter, setEmotionFilter] = useState<string>('ALL');
  const [pairFilter, setPairFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'pnl_desc' | 'pnl_asc' | 'discipline_desc'>('date_desc');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Extract unique pairs and setups for filter dropdowns
  const uniquePairs = useMemo(() => {
    return Array.from(new Set(trades.map(t => t.pair))).sort();
  }, [trades]);

  const uniqueSetups = useMemo(() => {
    return Array.from(new Set(trades.map(t => t.entryCategory))).sort();
  }, [trades]);

  const uniqueExitReasons = useMemo(() => {
    return Array.from(new Set(trades.map(t => t.exitCategory))).sort();
  }, [trades]);

  // Filter and sort trades
  const filteredTrades = useMemo(() => {
    return trades.filter(t => {
      // Search matching
      const matchesSearch = 
        t.pair.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.entryReason && t.entryReason.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.exitReason && t.exitReason.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.tpReason && t.tpReason.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.slReason && t.slReason.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.notes && t.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;

      // Outcome filter
      if (outcomeFilter === 'WIN' && t.pnl <= 0) return false;
      if (outcomeFilter === 'LOSS' && t.pnl >= 0) return false;
      if (outcomeFilter === 'BREAKEVEN' && t.pnl !== 0) return false;

      // Setup filter
      if (setupFilter !== 'ALL' && t.entryCategory !== setupFilter) return false;

      // Exit filter
      if (exitFilter !== 'ALL' && t.exitCategory !== exitFilter) return false;

      // Emotion filter
      if (emotionFilter !== 'ALL' && t.emotionBefore !== emotionFilter) return false;

      // Pair filter
      if (pairFilter !== 'ALL' && t.pair !== pairFilter) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'date_desc') {
        return new Date(b.closeTime).getTime() - new Date(a.closeTime).getTime();
      }
      if (sortBy === 'date_asc') {
        return new Date(a.closeTime).getTime() - new Date(b.closeTime).getTime();
      }
      if (sortBy === 'pnl_desc') {
        return b.pnl - a.pnl;
      }
      if (sortBy === 'pnl_asc') {
        return a.pnl - b.pnl;
      }
      if (sortBy === 'discipline_desc') {
        return (b.disciplineScore || 0) - (a.disciplineScore || 0);
      }
      return 0;
    });
  }, [trades, searchTerm, outcomeFilter, setupFilter, exitFilter, emotionFilter, pairFilter, sortBy]);

  const totalFilteredPnl = filteredTrades.reduce((acc, t) => acc + t.pnl, 0);

  return (
    <div className="space-y-6">
      {/* Header & Action Bar */}
      <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-400" /> Automated Forex Trade Journal
            </h1>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              Complete trade logs with reasons for entry, exit, TP/SL logic, and emotional auditing
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportTradesToCSV(filteredTrades, accountName)}
              className="flex items-center gap-1.5 text-xs bg-[#172131] hover:bg-slate-800 text-slate-200 border border-slate-800 px-3 py-2 rounded-lg font-medium transition-colors"
              title="Export filtered trades to CSV"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={onOpenLogTrade}
              className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold px-3.5 py-2 rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Log Trade</span>
            </button>
          </div>
        </div>

        {/* Search & Multi-Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 mt-4 pt-4 border-t border-slate-800 text-xs">
          {/* Search Input */}
          <div className="lg:col-span-2 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search pair, ticket, reason or notes..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-[#172131] border border-slate-800 rounded-lg pl-8 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Outcome Filter */}
          <div>
            <select
              value={outcomeFilter}
              onChange={e => setOutcomeFilter(e.target.value as any)}
              className="w-full bg-[#172131] border border-slate-800 rounded-lg px-2.5 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Outcomes</option>
              <option value="WIN">Winning Trades (Green)</option>
              <option value="LOSS">Losing Trades (Red)</option>
              <option value="BREAKEVEN">Breakeven</option>
            </select>
          </div>

          {/* Setup Category Filter */}
          <div>
            <select
              value={setupFilter}
              onChange={e => setSetupFilter(e.target.value)}
              className="w-full bg-[#172131] border border-slate-800 rounded-lg px-2.5 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Entry Setups</option>
              {uniqueSetups.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Exit Reason Filter */}
          <div>
            <select
              value={exitFilter}
              onChange={e => setExitFilter(e.target.value)}
              className="w-full bg-[#172131] border border-slate-800 rounded-lg px-2.5 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Exit Reasons</option>
              {uniqueExitReasons.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full bg-[#172131] border border-slate-800 rounded-lg px-2.5 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="date_desc">Date: Newest First</option>
              <option value="date_asc">Date: Oldest First</option>
              <option value="pnl_desc">PnL: Highest Win</option>
              <option value="pnl_asc">PnL: Highest Loss</option>
              <option value="discipline_desc">Discipline Score</option>
            </select>
          </div>
        </div>

        {/* Secondary Filter Badges & View Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-400 font-mono text-[10px]">
            <span>Showing <strong className="text-white">{filteredTrades.length}</strong> of {trades.length} trades</span>
            <span>•</span>
            <span>Filtered Net: <strong className={`font-mono ${totalFilteredPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {totalFilteredPnl >= 0 ? '+' : ''}${totalFilteredPnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </strong></span>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-[#172131] p-1 rounded-lg border border-slate-800 flex items-center gap-1">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Table View"
              >
                <LayoutList className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded ${viewMode === 'cards' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Card Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Trades List View */}
      {viewMode === 'table' ? (
        <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-mono text-[10px] uppercase tracking-wider">
                  <th className="pb-3 font-bold">Ticket / Date</th>
                  <th className="pb-3 font-bold">Pair & Lots</th>
                  <th className="pb-3 font-bold">Entry Price / SL / TP</th>
                  <th className="pb-3 font-bold">Reason for Entry</th>
                  <th className="pb-3 font-bold">Reason for Exit</th>
                  <th className="pb-3 font-bold">TP / SL Logic</th>
                  <th className="pb-3 font-bold">Emotion & Discipline</th>
                  <th className="pb-3 font-bold text-right">Net PnL</th>
                  <th className="pb-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {filteredTrades.map(trade => (
                  <tr 
                    key={trade.id}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors group"
                    onClick={() => onOpenTradeDetail(trade)}
                  >
                    {/* Ticket & Date */}
                    <td className="py-3.5">
                      <div className="text-white font-semibold text-xs">#{trade.ticketNumber}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(trade.closeTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {trade.session}
                      </div>
                    </td>

                    {/* Pair & Lots */}
                    <td className="py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          trade.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}>
                          {trade.type}
                        </span>
                        <span className="font-bold text-white text-xs">{trade.pair}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                        {trade.lotSize} lots • {trade.timeframe}
                      </div>
                    </td>

                    {/* Price Levels */}
                    <td className="py-3.5 text-[10px]">
                      <div className="text-slate-200">Open: {trade.openPrice}</div>
                      <div className="text-slate-400">
                        <span className="text-rose-400">SL:</span> {trade.stopLoss} | <span className="text-emerald-400">TP:</span> {trade.takeProfit}
                      </div>
                    </td>

                    {/* Reason for Entry */}
                    <td className="py-3.5 max-w-xs font-sans">
                      <div className="text-blue-400 font-medium text-xs truncate" title={trade.entryReason}>
                        {trade.entryCategory}
                      </div>
                      <div className="text-[10px] text-slate-400 line-clamp-1" title={trade.entryReason}>
                        {trade.entryReason}
                      </div>
                    </td>

                    {/* Reason for Exit */}
                    <td className="py-3.5 max-w-xs font-sans">
                      <div className="text-amber-400 font-medium text-xs truncate" title={trade.exitReason}>
                        {trade.exitCategory}
                      </div>
                      <div className="text-[10px] text-slate-400 line-clamp-1" title={trade.exitReason}>
                        {trade.exitReason}
                      </div>
                    </td>

                    {/* TP & SL Logic */}
                    <td className="py-3.5 max-w-xs font-sans">
                      <div className="text-[10px] text-slate-300 truncate" title={trade.tpReason}>
                        <span className="text-emerald-400 font-mono">TP:</span> {trade.tpCategory}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate" title={trade.slReason}>
                        <span className="text-rose-400 font-mono">SL:</span> {trade.slCategory}
                      </div>
                    </td>

                    {/* Emotion & Discipline */}
                    <td className="py-3.5 font-sans">
                      <div className="text-[10px] text-slate-200 font-medium">
                        {trade.emotionBefore}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-amber-400">
                        {'★'.repeat(trade.disciplineScore || 3)}
                        <span className="text-slate-600">{'★'.repeat(5 - (trade.disciplineScore || 3))}</span>
                      </div>
                    </td>

                    {/* Net PnL */}
                    <td className="py-3.5 text-right font-mono">
                      <div className={`font-bold text-sm ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {trade.pips >= 0 ? '+' : ''}{trade.pips} pips
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 text-right font-sans">
                      <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => onOpenTradeDetail(trade)}
                          className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                          title="View Trade Audit"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteTrade(trade.id)}
                          className="p-1.5 rounded-md hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 transition-colors"
                          title="Delete Trade"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Visual Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTrades.map(trade => (
            <div
              key={trade.id}
              onClick={() => onOpenTradeDetail(trade)}
              className="bg-[#1e293b] border border-slate-800 hover:border-slate-700 rounded-xl p-4 cursor-pointer transition-colors flex flex-col justify-between space-y-3 group shadow-sm"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded ${
                    trade.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  }`}>
                    {trade.type}
                  </span>
                  <span className="font-bold text-white text-sm">{trade.pair}</span>
                </div>
                <div className={`text-base font-bold font-mono ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>

              {/* Trade Price & Pips */}
              <div className="bg-[#172131] rounded-lg p-2.5 text-xs font-mono flex items-center justify-between border border-slate-800">
                <div>
                  <span className="text-slate-400">Lots:</span> <span className="text-white">{trade.lotSize}</span>
                </div>
                <div>
                  <span className="text-slate-400">Pips:</span> <span className={trade.pips >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{trade.pips}</span>
                </div>
                <div>
                  <span className="text-slate-400">R:R:</span> <span className="text-blue-400">1:{trade.realizedRR || 2}</span>
                </div>
              </div>

              {/* Reasons */}
              <div className="space-y-2 text-xs">
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Reason for Entry</div>
                  <div className="text-slate-300 text-xs font-medium line-clamp-2 mt-0.5">
                    <span className="text-blue-400 font-semibold">[{trade.entryCategory}]</span> {trade.entryReason}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Reason for Exit</div>
                  <div className="text-slate-300 text-xs line-clamp-2 mt-0.5">
                    <span className="text-amber-400 font-semibold">[{trade.exitCategory}]</span> {trade.exitReason}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="bg-[#172131] rounded-lg p-2 border border-slate-800">
                    <div className="text-[10px] text-emerald-400 font-mono uppercase font-bold">TP Logic</div>
                    <div className="text-[10px] text-slate-300 truncate mt-0.5">{trade.tpCategory}</div>
                  </div>
                  <div className="bg-[#172131] rounded-lg p-2 border border-slate-800">
                    <div className="text-[10px] text-rose-400 font-mono uppercase font-bold">SL Logic</div>
                    <div className="text-[10px] text-slate-300 truncate mt-0.5">{trade.slCategory}</div>
                  </div>
                </div>
              </div>

              {/* Card Footer: Emotion & Discipline Score */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Brain className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-slate-300 text-[10px] font-mono">{trade.emotionBefore}</span>
                </div>
                <div className="text-amber-400 font-mono text-[10px]">
                  {'★'.repeat(trade.disciplineScore || 3)} Score
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
