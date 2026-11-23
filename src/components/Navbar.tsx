import React, { useState } from 'react';
import { 
  BarChart3, 
  Calendar, 
  BookOpen, 
  Brain, 
  Target, 
  ShieldCheck, 
  FileText, 
  Bot, 
  Plus, 
  Upload, 
  Download, 
  Zap, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  ChevronDown, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { TradingAccount, PerformanceStats } from '../types/trade';

interface NavbarProps {
  accounts: TradingAccount[];
  activeAccount: TradingAccount;
  onSelectAccount: (account: TradingAccount) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  stats: PerformanceStats;
  onOpenLogTrade: () => void;
  onOpenQuickTrade: () => void;
  onOpenImport: () => void;
  onOpenExport: () => void;
  onResetDemo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  accounts,
  activeAccount,
  onSelectAccount,
  activeTab,
  onSelectTab,
  stats,
  onOpenLogTrade,
  onOpenQuickTrade,
  onOpenImport,
  onOpenExport,
  onResetDemo,
}) => {
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'calendar', label: 'Calendar & Consistency', icon: Calendar, badge: `${stats.consistency.consistencyScore}% Score` },
    { id: 'journal', label: 'Trade Journal', icon: BookOpen, badge: `${stats.totalTrades}` },
    { id: 'emotions', label: 'Emotions & Psychology', icon: Brain },
    { id: 'setups', label: 'Setups & TP/SL Audit', icon: Target },
    { id: 'accounts', label: 'Accounts', icon: Wallet },
    { id: 'audit-report', label: 'Audit Report', icon: FileText, highlight: true },
    { id: 'ai-coach', label: 'AI Auditor', icon: Bot, ai: true },
  ];

  return (
    <header className="no-print bg-[#1e293b] border-b border-slate-800 sticky top-0 z-40 shadow-sm">
      {/* Top Bar: Brand, Account Switcher, Live Ticker, Action Buttons */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Account Switcher */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onSelectTab('dashboard')}>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-sm shadow-sm tracking-wide">
                FX
              </div>
              <div>
                <span className="text-white font-bold tracking-tight text-base flex items-center gap-1.5">
                  AlphaJournal <span className="text-[10px] bg-blue-500/20 text-blue-400 font-bold px-1.5 py-0.2 rounded border border-blue-500/30">PRO</span>
                </span>
                <p className="text-[10px] text-slate-400 font-mono tracking-tight">Automated Performance Auditor</p>
              </div>
            </div>

            {/* Account Selector Dropdown */}
            <div className="relative">
              <button
                id="account-selector-btn"
                onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                className="flex items-center gap-2 bg-[#172131] hover:bg-slate-800 border border-slate-700/80 rounded-md px-3 py-1.5 text-xs text-left transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <div>
                  <div className="text-slate-200 font-semibold flex items-center gap-1.5 text-xs">
                    {activeAccount.name}
                    <span className="text-[9px] uppercase font-mono px-1 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {activeAccount.accountType}
                    </span>
                  </div>
                  <div className="text-slate-400 font-mono text-[10px]">
                    {activeAccount.currency} {activeAccount.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
              </button>

              {showAccountDropdown && (
                <div className="absolute left-0 mt-2 w-72 bg-[#1e293b] border border-slate-800 rounded-xl shadow-2xl p-2 z-50">
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Select Trading Account
                  </div>
                  <div className="space-y-1 mt-1">
                    {accounts.map(acc => (
                      <button
                        key={acc.id}
                        onClick={() => {
                          onSelectAccount(acc);
                          setShowAccountDropdown(false);
                        }}
                        className={`w-full text-left p-2 rounded-lg flex items-center justify-between transition-colors ${
                          acc.id === activeAccount.id ? 'bg-blue-600/10 border border-blue-500/30 text-blue-300' : 'hover:bg-slate-800/80 text-slate-300'
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-xs text-white">{acc.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {acc.broker} • {acc.currency} {acc.currentBalance.toLocaleString()}
                          </div>
                        </div>
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {acc.accountType}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-slate-800 mt-2 pt-2 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setShowAccountDropdown(false);
                        onSelectTab('accounts');
                      }}
                      className="text-xs text-blue-400 hover:text-blue-300 font-medium px-2 py-1"
                    >
                      Manage Accounts →
                    </button>
                    <button
                      onClick={() => {
                        setShowAccountDropdown(false);
                        onResetDemo();
                      }}
                      title="Reset demo data"
                      className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1 px-2 py-1"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center/Right Performance Ticker */}
          <div className="hidden lg:flex items-center gap-6 text-xs bg-[#172131] border border-slate-800 rounded-lg px-4 py-1.5">
            <div>
              <div className="text-[10px] uppercase text-slate-500 font-bold">Balance</div>
              <div className="font-mono font-bold text-white text-xs">
                ${activeAccount.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="w-px h-6 bg-slate-800" />
            <div>
              <div className="text-[10px] uppercase text-slate-500 font-bold">Net P&L</div>
              <div className={`font-mono font-bold text-xs ${stats.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {stats.netProfit >= 0 ? '+' : ''}${stats.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="w-px h-6 bg-slate-800" />
            <div>
              <div className="text-[10px] uppercase text-slate-500 font-bold">Win Rate</div>
              <div className="font-mono font-bold text-white text-xs">{stats.winRate}%</div>
            </div>
            <div className="w-px h-6 bg-slate-800" />
            <div>
              <div className="text-[10px] uppercase text-slate-500 font-bold">Consistency</div>
              <div className="font-mono font-bold text-emerald-400 text-xs">{stats.consistency.consistencyScore}%</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              id="quick-exec-btn"
              onClick={onOpenQuickTrade}
              className="hidden sm:flex items-center gap-1.5 bg-[#1e293b] hover:bg-slate-800 text-slate-200 text-xs font-medium px-3 py-2 rounded-md border border-slate-700 transition-colors"
              title="Simulate quick market execution with lot calculation"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Quick Order</span>
            </button>

            <button
              id="import-statement-btn"
              onClick={onOpenImport}
              className="hidden md:flex items-center gap-1.5 bg-[#1e293b] hover:bg-slate-800 text-slate-200 text-xs font-medium px-3 py-2 rounded-md border border-slate-700 transition-colors"
              title="Import MT4/MT5 HTML statement or CSV"
            >
              <Upload className="w-3.5 h-3.5 text-blue-400" />
              <span>Import</span>
            </button>

            <button
              id="log-trade-btn"
              onClick={onOpenLogTrade}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-3.5 py-2 rounded-md transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Entry</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <nav className="flex space-x-1 overflow-x-auto py-1.5 border-t border-slate-800 scrollbar-none">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`tab-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-blue-600/10 text-blue-400 border-b-2 border-blue-500 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-400' : item.ai ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {item.ai && (
                  <Sparkles className="w-3 h-3 text-amber-300" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
