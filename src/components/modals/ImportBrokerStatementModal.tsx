import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { Trade } from '../../types/trade';
import { parseBrokerStatementFile } from '../../services/forexData';

interface ImportBrokerStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportTrades: (trades: Trade[]) => void;
  accountId: string;
}

export const ImportBrokerStatementModal: React.FC<ImportBrokerStatementModalProps> = ({
  isOpen,
  onClose,
  onImportTrades,
  accountId,
}) => {
  if (!isOpen) return null;

  const [rawText, setRawText] = useState('');
  const [parsedTrades, setParsedTrades] = useState<Trade[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawText(content);
      const trades = parseBrokerStatementFile(content, accountId);
      if (trades.length > 0) {
        setParsedTrades(trades);
        setErrorMsg('');
      } else {
        setErrorMsg('Could not detect trade records in this format. Try pasting comma-separated or HTML values.');
      }
    };
    reader.readAsText(file);
  };

  const handleParseText = () => {
    if (!rawText.trim()) return;
    const trades = parseBrokerStatementFile(rawText, accountId);
    if (trades.length > 0) {
      setParsedTrades(trades);
      setErrorMsg('');
    } else {
      setErrorMsg('No valid trade rows detected. Ensure ticket, pair, lots, and PnL are present.');
    }
  };

  const handleConfirmImport = () => {
    if (parsedTrades.length > 0) {
      onImportTrades(parsedTrades);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1e293b] border border-slate-800 rounded-xl max-w-2xl w-full p-6 sm:p-7 space-y-5 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Import MT4/MT5 Broker Statement</h2>
              <p className="text-[10px] text-slate-400 font-mono">Upload HTML statement or CSV export from MetaTrader or cTrader</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* File Dropzone */}
        <div className="border-2 border-dashed border-slate-700 hover:border-blue-500/60 rounded-xl p-6 text-center space-y-2 cursor-pointer bg-[#172131] transition relative">
          <input
            type="file"
            accept=".csv,.htm,.html,.txt"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <FileText className="w-8 h-8 text-blue-400 mx-auto" />
          <div className="text-sm font-semibold text-white">Click or drag & drop broker statement file</div>
          <div className="text-[10px] text-slate-400 font-mono">Supports MT4/MT5 HTML reports and standard CSV tables</div>
        </div>

        {/* Or Paste Raw Text */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono uppercase">
            <span>Or paste raw statement text:</span>
            <button
              onClick={handleParseText}
              className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
            >
              Parse Text →
            </button>
          </div>
          <textarea
            rows={3}
            value={rawText}
            onChange={e => setRawText(e.target.value)}
            placeholder="e.g. 8492011, 2026.08.14 08:30, buy, 1.00, eurusd, 1.08500, 1.08900, 400.00"
            className="w-full bg-[#172131] border border-slate-800 rounded-lg p-3 text-xs text-slate-300 font-mono focus:outline-none focus:border-blue-500"
          />
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 text-rose-400 text-xs bg-rose-950/20 border border-rose-500/30 p-2.5 rounded-lg font-mono">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Preview of Parsed Trades */}
        {parsedTrades.length > 0 && (
          <div className="bg-[#172131] border border-emerald-500/30 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Successfully parsed {parsedTrades.length} trades!</span>
            </div>
            <div className="max-h-32 overflow-y-auto space-y-1 font-mono text-[11px] text-slate-300">
              {parsedTrades.map(t => (
                <div key={t.id} className="flex justify-between border-b border-slate-800/60 pb-1">
                  <span>#{t.ticketNumber} • {t.type} {t.pair} ({t.lotSize} lots)</span>
                  <span className={t.pnl >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {t.pnl >= 0 ? '+' : ''}${t.pnl}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#172131] border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-medium cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={parsedTrades.length === 0}
            onClick={handleConfirmImport}
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition disabled:opacity-40 shadow-sm cursor-pointer"
          >
            Import {parsedTrades.length} Trades to Journal
          </button>
        </div>
      </div>
    </div>
  );
};
