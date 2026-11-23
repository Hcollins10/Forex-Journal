import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { MonthlyCalendarView } from './components/MonthlyCalendarView';
import { TradeJournalView } from './components/TradeJournalView';
import { EmotionMatrixView } from './components/EmotionMatrixView';
import { SetupsAnalyticsView } from './components/SetupsAnalyticsView';
import { AccountsManagerView } from './components/AccountsManagerView';
import { PerformanceAuditReport } from './components/PerformanceAuditReport';
import { AICoachView } from './components/AICoachView';

import { LogTradeModal } from './components/modals/LogTradeModal';
import { QuickExecutionModal } from './components/modals/QuickExecutionModal';
import { ImportBrokerStatementModal } from './components/modals/ImportBrokerStatementModal';
import { TradeDetailModal } from './components/modals/TradeDetailModal';

import { 
  Trade, 
  TradingAccount 
} from './types/trade';
import { 
  initialSampleAccounts, 
  sampleTrades, 
  computePerformanceStats, 
  computeEmotionStats, 
  computeSetupStats 
} from './services/forexData';

export default function App() {
  // Accounts state with localStorage persistence
  const [accounts, setAccounts] = useState<TradingAccount[]>(() => {
    const saved = localStorage.getItem('fx_accounts');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return initialSampleAccounts;
  });

  const [activeAccount, setActiveAccount] = useState<TradingAccount>(() => accounts[0] || initialSampleAccounts[0]);

  // Trades state with localStorage persistence
  const [trades, setTrades] = useState<Trade[]>(() => {
    const saved = localStorage.getItem('fx_trades');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return sampleTrades;
  });

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Modals state
  const [isLogTradeOpen, setIsLogTradeOpen] = useState(false);
  const [isQuickTradeOpen, setIsQuickTradeOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedTradeDetail, setSelectedTradeDetail] = useState<Trade | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('fx_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('fx_trades', JSON.stringify(trades));
  }, [trades]);

  // Trades for current active account
  const currentAccountTrades = trades.filter(t => t.accountId === activeAccount.id);

  // Calculate live dynamic metrics
  const stats = computePerformanceStats(currentAccountTrades, activeAccount.initialBalance);
  const emotionStats = computeEmotionStats(currentAccountTrades);
  const setupStats = computeSetupStats(currentAccountTrades);

  // Recalculate account balance based on trades
  const updatedAccount: TradingAccount = {
    ...activeAccount,
    currentBalance: Number((activeAccount.initialBalance + stats.netProfit).toFixed(2)),
  };

  // Handlers
  const handleSaveTrade = (newTrade: Trade) => {
    setTrades(prev => [newTrade, ...prev]);
  };

  const handleDeleteTrade = (id: string) => {
    setTrades(prev => prev.filter(t => t.id !== id));
  };

  const handleImportTrades = (newTrades: Trade[]) => {
    setTrades(prev => [...newTrades, ...prev]);
  };

  const handleCreateAccount = (newAcc: TradingAccount) => {
    setAccounts(prev => [...prev, newAcc]);
    setActiveAccount(newAcc);
  };

  const handleUpdateBalance = (accId: string, newBal: number) => {
    setAccounts(prev => prev.map(a => a.id === accId ? { ...a, currentBalance: newBal } : a));
    if (activeAccount.id === accId) {
      setActiveAccount(prev => ({ ...prev, currentBalance: newBal }));
    }
  };

  const handleResetDemoData = () => {
    localStorage.removeItem('fx_accounts');
    localStorage.removeItem('fx_trades');
    setAccounts(initialSampleAccounts);
    setActiveAccount(initialSampleAccounts[0]);
    setTrades(sampleTrades);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navigation Bar */}
      <Navbar
        accounts={accounts}
        activeAccount={updatedAccount}
        onSelectAccount={setActiveAccount}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        stats={stats}
        onOpenLogTrade={() => setIsLogTradeOpen(true)}
        onOpenQuickTrade={() => setIsQuickTradeOpen(true)}
        onOpenImport={() => setIsImportOpen(true)}
        onOpenExport={() => setActiveTab('audit-report')}
        onResetDemo={handleResetDemoData}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            account={updatedAccount}
            trades={currentAccountTrades}
            stats={stats}
            onSelectTab={setActiveTab}
            onOpenTradeDetail={setSelectedTradeDetail}
            onOpenLogTrade={() => setIsLogTradeOpen(true)}
          />
        )}

        {activeTab === 'calendar' && (
          <MonthlyCalendarView
            trades={currentAccountTrades}
            onOpenTradeDetail={setSelectedTradeDetail}
          />
        )}

        {activeTab === 'journal' && (
          <TradeJournalView
            trades={currentAccountTrades}
            accountName={updatedAccount.name}
            onOpenTradeDetail={setSelectedTradeDetail}
            onOpenLogTrade={() => setIsLogTradeOpen(true)}
            onDeleteTrade={handleDeleteTrade}
          />
        )}

        {activeTab === 'emotions' && (
          <EmotionMatrixView
            trades={currentAccountTrades}
          />
        )}

        {activeTab === 'setups' && (
          <SetupsAnalyticsView
            trades={currentAccountTrades}
          />
        )}

        {activeTab === 'accounts' && (
          <AccountsManagerView
            accounts={accounts}
            activeAccount={updatedAccount}
            onSelectAccount={setActiveAccount}
            onCreateAccount={handleCreateAccount}
            onUpdateBalance={handleUpdateBalance}
          />
        )}

        {activeTab === 'audit-report' && (
          <PerformanceAuditReport
            account={updatedAccount}
            trades={currentAccountTrades}
            stats={stats}
            emotionStats={emotionStats}
            setupStats={setupStats}
          />
        )}

        {activeTab === 'ai-coach' && (
          <AICoachView
            account={updatedAccount}
            stats={stats}
            emotionStats={emotionStats}
            setupStats={setupStats}
          />
        )}
      </main>

      {/* Modals */}
      <LogTradeModal
        isOpen={isLogTradeOpen}
        onClose={() => setIsLogTradeOpen(false)}
        onSaveTrade={handleSaveTrade}
        accountId={activeAccount.id}
      />

      <QuickExecutionModal
        isOpen={isQuickTradeOpen}
        onClose={() => setIsQuickTradeOpen(false)}
        onExecuteTrade={handleSaveTrade}
        accountId={activeAccount.id}
        accountBalance={updatedAccount.currentBalance}
      />

      <ImportBrokerStatementModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportTrades={handleImportTrades}
        accountId={activeAccount.id}
      />

      <TradeDetailModal
        trade={selectedTradeDetail}
        isOpen={!!selectedTradeDetail}
        onClose={() => setSelectedTradeDetail(null)}
      />

      {/* Footer */}
      <footer className="no-print border-t border-slate-900 bg-slate-950 py-6 mt-12 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ForexJournal Pro • Automated Trading Account & Performance Auditor</span>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">Consistency: {stats.consistency.consistencyScore}/100</span>
            <span className="text-emerald-400">Prop Firm Risk Rules: Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
