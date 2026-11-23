import React, { useState } from 'react';
import { 
  Wallet, 
  Plus, 
  ShieldCheck, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Check, 
  Trash2, 
  Building2, 
  DollarSign, 
  Target, 
  Activity 
} from 'lucide-react';
import { TradingAccount, AccountType } from '../types/trade';

interface AccountsManagerViewProps {
  accounts: TradingAccount[];
  activeAccount: TradingAccount;
  onSelectAccount: (account: TradingAccount) => void;
  onCreateAccount: (account: TradingAccount) => void;
  onUpdateBalance: (accountId: string, newBalance: number) => void;
}

export const AccountsManagerView: React.FC<AccountsManagerViewProps> = ({
  accounts,
  activeAccount,
  onSelectAccount,
  onCreateAccount,
  onUpdateBalance,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAccName, setNewAccName] = useState('');
  const [newBroker, setNewBroker] = useState('FTMO ECN');
  const [newAccType, setNewAccType] = useState<AccountType>('EVALUATION');
  const [newBalance, setNewBalance] = useState('100000');
  const [newLeverage, setNewLeverage] = useState('100');
  const [newDailyDD, setNewDailyDD] = useState('5');
  const [newTotalDD, setNewTotalDD] = useState('10');
  const [newProfitTarget, setNewProfitTarget] = useState('10');

  // Deposit/Withdrawal State
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustType, setAdjustType] = useState<'DEPOSIT' | 'WITHDRAWAL'>('DEPOSIT');
  const [selectedAccForAdjust, setSelectedAccForAdjust] = useState<TradingAccount | null>(null);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccName.trim()) return;

    const initial = parseFloat(newBalance) || 100000;
    const newAccount: TradingAccount = {
      id: `acc_${Date.now()}`,
      name: newAccName.trim(),
      broker: newBroker.trim() || 'Custom Broker',
      accountNumber: `FX-${Math.floor(100000 + Math.random() * 900000)}`,
      accountType: newAccType,
      currency: 'USD',
      initialBalance: initial,
      currentBalance: initial,
      leverage: parseInt(newLeverage) || 100,
      maxDailyDrawdownPct: parseFloat(newDailyDD) || 5,
      maxTotalDrawdownPct: parseFloat(newTotalDD) || 10,
      profitTargetPct: parseFloat(newProfitTarget) || 10,
      createdAt: new Date().toISOString(),
      notes: 'Created in ForexJournal Pro',
    };

    onCreateAccount(newAccount);
    setShowCreateModal(false);
    setNewAccName('');
  };

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccForAdjust) return;
    const amount = parseFloat(adjustAmount);
    if (!amount || isNaN(amount) || amount <= 0) return;

    const newBal = adjustType === 'DEPOSIT' 
      ? selectedAccForAdjust.currentBalance + amount 
      : selectedAccForAdjust.currentBalance - amount;

    onUpdateBalance(selectedAccForAdjust.id, Number(newBal.toFixed(2)));
    setSelectedAccForAdjust(null);
    setAdjustAmount('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Trading Account Management & Rule Auditor
              </h1>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                Manage multiple funded, evaluation, live, and demo accounts with drawdown parameters
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Connect / Add Account</span>
          </button>
        </div>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map(acc => {
          const isActive = acc.id === activeAccount.id;
          const returnPct = ((acc.currentBalance - acc.initialBalance) / acc.initialBalance) * 100;
          
          return (
            <div
              key={acc.id}
              className={`bg-[#1e293b] border rounded-xl p-5 transition-all flex flex-col justify-between space-y-4 shadow-sm ${
                isActive 
                  ? 'border-blue-500/80 ring-1 ring-blue-500/40' 
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold ${
                    acc.accountType === 'FUNDED'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : acc.accountType === 'EVALUATION'
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : 'bg-slate-800 text-slate-300'
                  }`}>
                    {acc.accountType}
                  </span>

                  {isActive ? (
                    <span className="text-xs text-blue-400 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Active Account
                    </span>
                  ) : (
                    <button
                      onClick={() => onSelectAccount(acc)}
                      className="text-xs text-slate-400 hover:text-white font-medium underline cursor-pointer"
                    >
                      Switch to this
                    </button>
                  )}
                </div>

                <h3 className="text-base font-bold text-white tracking-tight mt-2">{acc.name}</h3>
                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                  <Building2 className="w-3.5 h-3.5" /> {acc.broker} • 1:{acc.leverage}
                </div>
              </div>

              {/* Balance & Performance */}
              <div className="bg-[#172131] border border-slate-800 rounded-lg p-3.5 font-mono">
                <div className="text-[10px] uppercase font-bold text-slate-400">Current Balance</div>
                <div className="text-2xl font-bold text-white mt-0.5">
                  ${acc.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className="flex items-center justify-between text-xs mt-1 pt-1 border-t border-slate-800">
                  <span className="text-slate-400 text-[10px]">Initial: ${acc.initialBalance.toLocaleString()}</span>
                  <span className={`font-bold ${returnPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {returnPct >= 0 ? '+' : ''}{returnPct.toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* Drawdown Rules */}
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400 text-[10px] uppercase">Max Daily DD:</span>
                  <span>{acc.maxDailyDrawdownPct}% (${((acc.initialBalance * acc.maxDailyDrawdownPct) / 100).toLocaleString()})</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400 text-[10px] uppercase">Max Total DD:</span>
                  <span>{acc.maxTotalDrawdownPct}% (${((acc.initialBalance * acc.maxTotalDrawdownPct) / 100).toLocaleString()})</span>
                </div>
                {acc.profitTargetPct && (
                  <div className="flex justify-between text-emerald-400">
                    <span className="text-[10px] uppercase">Profit Target:</span>
                    <span>{acc.profitTargetPct}% (+${((acc.initialBalance * acc.profitTargetPct) / 100).toLocaleString()})</span>
                  </div>
                )}
              </div>

              {/* Bottom Actions: Adjust Balance or Switch */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => setSelectedAccForAdjust(acc)}
                  className="text-xs text-slate-300 hover:text-white font-medium flex items-center gap-1 cursor-pointer"
                >
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Adjust / Deposit
                </button>

                {!isActive && (
                  <button
                    onClick={() => onSelectAccount(acc)}
                    className="text-xs bg-[#172131] hover:bg-slate-800 text-slate-200 border border-slate-700 px-3 py-1 rounded-lg font-medium transition cursor-pointer"
                  >
                    Select
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Account Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e293b] border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h2 className="text-base font-bold text-white tracking-tight">Create / Connect Trading Account</h2>
            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-mono text-[10px] uppercase">Account Label</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FTMO 100k Challenge, IC Markets ECN"
                  value={newAccName}
                  onChange={e => setNewAccName(e.target.value)}
                  className="w-full bg-[#172131] border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono text-[10px] uppercase">Broker / Prop Firm</label>
                  <input
                    type="text"
                    value={newBroker}
                    onChange={e => setNewBroker(e.target.value)}
                    className="w-full bg-[#172131] border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono text-[10px] uppercase">Account Type</label>
                  <select
                    value={newAccType}
                    onChange={e => setNewAccType(e.target.value as AccountType)}
                    className="w-full bg-[#172131] border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="EVALUATION">Evaluation (Prop Firm)</option>
                    <option value="FUNDED">Funded Account</option>
                    <option value="LIVE">Live Personal</option>
                    <option value="DEMO">Demo Practice</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono text-[10px] uppercase">Starting Balance ($)</label>
                  <input
                    type="number"
                    value={newBalance}
                    onChange={e => setNewBalance(e.target.value)}
                    className="w-full bg-[#172131] border border-slate-800 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono text-[10px] uppercase">Leverage (1:X)</label>
                  <input
                    type="number"
                    value={newLeverage}
                    onChange={e => setNewLeverage(e.target.value)}
                    className="w-full bg-[#172131] border border-slate-800 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono text-[10px] uppercase">Daily DD %</label>
                  <input
                    type="number"
                    value={newDailyDD}
                    onChange={e => setNewDailyDD(e.target.value)}
                    className="w-full bg-[#172131] border border-slate-800 rounded-lg p-2 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono text-[10px] uppercase">Total DD %</label>
                  <input
                    type="number"
                    value={newTotalDD}
                    onChange={e => setNewTotalDD(e.target.value)}
                    className="w-full bg-[#172131] border border-slate-800 rounded-lg p-2 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono text-[10px] uppercase">Target %</label>
                  <input
                    type="number"
                    value={newProfitTarget}
                    onChange={e => setNewProfitTarget(e.target.value)}
                    className="w-full bg-[#172131] border border-slate-800 rounded-lg p-2 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-2 rounded-lg bg-[#172131] border border-slate-700 text-slate-300 hover:bg-slate-800 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 shadow-sm cursor-pointer"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Balance Modal */}
      {selectedAccForAdjust && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e293b] border border-slate-800 rounded-xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h2 className="text-base font-bold text-white tracking-tight">Adjust Account Balance</h2>
            <p className="text-xs text-slate-400">
              Record deposit or withdrawal for <strong className="text-white">{selectedAccForAdjust.name}</strong>
            </p>
            <form onSubmit={handleAdjustSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustType('DEPOSIT')}
                  className={`p-2 rounded-lg font-semibold text-center cursor-pointer transition ${adjustType === 'DEPOSIT' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-[#172131] text-slate-300 border border-slate-700'}`}
                >
                  + Deposit
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('WITHDRAWAL')}
                  className={`p-2 rounded-lg font-semibold text-center cursor-pointer transition ${adjustType === 'WITHDRAWAL' ? 'bg-rose-600 text-white shadow-sm' : 'bg-[#172131] text-slate-300 border border-slate-700'}`}
                >
                  - Withdrawal
                </button>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono text-[10px] uppercase">Amount ($)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 5000"
                  value={adjustAmount}
                  onChange={e => setAdjustAmount(e.target.value)}
                  className="w-full bg-[#172131] border border-slate-800 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedAccForAdjust(null)}
                  className="px-3 py-2 rounded-lg bg-[#172131] border border-slate-700 text-slate-300 hover:bg-slate-800 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 shadow-sm cursor-pointer"
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
