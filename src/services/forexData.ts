import { Trade, TradingAccount, PerformanceStats, DayPerformance, MonthPerformance, ConsistencyMetrics, EmotionStatsItem, SetupStatsItem } from '../types/trade';

export interface ForexPairInfo {
  symbol: string;
  name: string;
  category: 'Major' | 'Minor' | 'Cross' | 'Commodity' | 'Index';
  basePrice: number;
  pipSize: number;
  pipDecimals: number;
  lotUnits: number;
}

export const FOREX_PAIRS: ForexPairInfo[] = [
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', category: 'Major', basePrice: 1.0845, pipSize: 0.0001, pipDecimals: 4, lotUnits: 100000 },
  { symbol: 'GBP/USD', name: 'British Pound / US Dollar', category: 'Major', basePrice: 1.2980, pipSize: 0.0001, pipDecimals: 4, lotUnits: 100000 },
  { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', category: 'Major', basePrice: 154.20, pipSize: 0.01, pipDecimals: 2, lotUnits: 100000 },
  { symbol: 'XAU/USD', name: 'Gold / US Dollar', category: 'Commodity', basePrice: 2490.50, pipSize: 0.10, pipDecimals: 2, lotUnits: 100 },
  { symbol: 'GBP/JPY', name: 'British Pound / Japanese Yen', category: 'Cross', basePrice: 200.15, pipSize: 0.01, pipDecimals: 2, lotUnits: 100000 },
  { symbol: 'AUD/USD', name: 'Australian Dollar / US Dollar', category: 'Major', basePrice: 0.6550, pipSize: 0.0001, pipDecimals: 4, lotUnits: 100000 },
  { symbol: 'USD/CAD', name: 'US Dollar / Canadian Dollar', category: 'Major', basePrice: 1.3720, pipSize: 0.0001, pipDecimals: 4, lotUnits: 100000 },
  { symbol: 'EUR/JPY', name: 'Euro / Japanese Yen', category: 'Cross', basePrice: 167.30, pipSize: 0.01, pipDecimals: 2, lotUnits: 100000 },
  { symbol: 'NZD/USD', name: 'New Zealand Dollar / US Dollar', category: 'Major', basePrice: 0.5980, pipSize: 0.0001, pipDecimals: 4, lotUnits: 100000 },
  { symbol: 'USD/CHF', name: 'US Dollar / Swiss Franc', category: 'Major', basePrice: 0.8840, pipSize: 0.0001, pipDecimals: 4, lotUnits: 100000 },
  { symbol: 'NAS100', name: 'US Tech 100 (Nasdaq)', category: 'Index', basePrice: 19450.00, pipSize: 1.0, pipDecimals: 2, lotUnits: 20 },
  { symbol: 'US30', name: 'Wall Street 30 (Dow Jones)', category: 'Index', basePrice: 40950.00, pipSize: 1.0, pipDecimals: 1, lotUnits: 10 },
];

export function calculatePips(pairSymbol: string, openPrice: number, closePrice: number, type: 'BUY' | 'SELL'): number {
  const pair = FOREX_PAIRS.find(p => p.symbol === pairSymbol) || { pipSize: 0.0001 };
  const diff = type === 'BUY' ? (closePrice - openPrice) : (openPrice - closePrice);
  return Number((diff / pair.pipSize).toFixed(1));
}

export function calculateForexPnl(
  pairSymbol: string,
  type: 'BUY' | 'SELL',
  lotSize: number,
  openPrice: number,
  closePrice: number,
  commission: number = 0,
  swap: number = 0
): { pnl: number; grossPnl: number; pips: number } {
  const pair = FOREX_PAIRS.find(p => p.symbol === pairSymbol) || { pipSize: 0.0001, lotUnits: 100000 };
  const pips = calculatePips(pairSymbol, openPrice, closePrice, type);
  
  let grossPnl = 0;
  if (pairSymbol === 'XAU/USD') {
    // 1 standard lot of Gold = 100 oz. Price diff of $1 = $100
    const diff = type === 'BUY' ? (closePrice - openPrice) : (openPrice - closePrice);
    grossPnl = diff * 100 * lotSize;
  } else if (pairSymbol.includes('JPY')) {
    // JPY pairs: 1 pip = 0.01. Value ~ $1000 / USDJPY per std lot
    const diff = type === 'BUY' ? (closePrice - openPrice) : (openPrice - closePrice);
    grossPnl = (diff * pair.lotUnits * lotSize) / (closePrice || 150);
  } else if (pairSymbol === 'NAS100' || pairSymbol === 'US30') {
    const diff = type === 'BUY' ? (closePrice - openPrice) : (openPrice - closePrice);
    grossPnl = diff * lotSize * pair.lotUnits;
  } else {
    // Standard FX pair (e.g. EUR/USD)
    const diff = type === 'BUY' ? (closePrice - openPrice) : (openPrice - closePrice);
    grossPnl = diff * pair.lotUnits * lotSize;
  }

  const pnl = Number((grossPnl - commission + swap).toFixed(2));
  return { pnl, grossPnl: Number(grossPnl.toFixed(2)), pips };
}

// Initial Sample Accounts
export const INITIAL_ACCOUNTS: TradingAccount[] = [
  {
    id: 'acc-ftmo-100k',
    name: 'Apex 100K Funded Prop (FTMO)',
    broker: 'FTMO ECN Global',
    accountType: 'funded',
    currency: 'USD',
    initialBalance: 100000,
    currentBalance: 108420.50,
    equity: 108420.50,
    leverage: 100,
    maxDailyDrawdownPct: 5,
    maxTotalDrawdownPct: 10,
    profitTargetPct: 10,
    createdAt: '2026-08-01T08:00:00Z',
    isDefault: true,
    notes: 'Main prop firm funded stage. Risk strict 0.5% - 1% per trade. Target 10% monthly growth with consistency rule.',
  },
  {
    id: 'acc-icmarkets-15k',
    name: 'IC Markets ECN Personal Live',
    broker: 'IC Markets Raw Spread',
    accountType: 'live',
    currency: 'USD',
    initialBalance: 15000,
    currentBalance: 16840.00,
    equity: 16840.00,
    leverage: 200,
    maxDailyDrawdownPct: 4,
    maxTotalDrawdownPct: 8,
    createdAt: '2026-08-05T09:00:00Z',
    notes: 'Personal live compounding account. Specializes in London session EURUSD and XAUUSD liquidity sweeps.',
  },
  {
    id: 'acc-eval-50k',
    name: 'TopTier $50K Evaluation Stage 1',
    broker: 'TopTier Trader',
    accountType: 'eval',
    currency: 'USD',
    initialBalance: 50000,
    currentBalance: 52190.00,
    equity: 52190.00,
    leverage: 100,
    maxDailyDrawdownPct: 5,
    maxTotalDrawdownPct: 10,
    profitTargetPct: 8,
    createdAt: '2026-08-15T08:00:00Z',
    notes: 'Evaluation challenge. Focus on discipline score >= 4/5.',
  }
];

// Rich, realistic sample trades
export const INITIAL_TRADES: Trade[] = [
  // 1. Aug 31, 2026 (Today) - Great Win
  {
    id: 'tr-001',
    accountId: 'acc-ftmo-100k',
    ticketNumber: '8492011',
    pair: 'EUR/USD',
    type: 'BUY',
    lotSize: 3.0,
    openPrice: 1.0820,
    closePrice: 1.0872,
    stopLoss: 1.0802,
    takeProfit: 1.0875,
    openTime: '2026-08-31T08:15:00Z',
    closeTime: '2026-08-31T14:30:00Z',
    pnl: 1560.00,
    grossPnl: 1581.00,
    pips: 52.0,
    commission: 21.00,
    swap: 0,
    status: 'CLOSED',
    plannedRR: 2.89,
    realizedRR: 2.89,
    timeframe: 'M15',
    session: 'London',
    entryCategory: 'Liquidity Sweep',
    entryReason: 'Swept Asian session low into 15m bullish Fair Value Gap (FVG) with strong 5m displacement at London open.',
    exitCategory: 'Hit Take Profit (TP)',
    exitReason: 'Price expanded aggressively into previous day high (PDH) buy-side liquidity target.',
    tpCategory: 'Previous Day High/Low (PDH/PDL)',
    tpReason: 'Targeted clean resting liquidity above Monday high.',
    slCategory: 'Below/Above Recent Swing',
    slReason: 'Placed 3 pips below the manipulation wick swing low for clear invalidation.',
    emotionBefore: 'Calm & Disciplined',
    executionDiscipline: 'Followed Plan 100%',
    emotionAfter: 'Satisfied & Calm',
    disciplineScore: 5,
    mistakes: [],
    notes: 'Flawless execution. Waited patiently for 8:00 AM London open candle confirmation before entering.',
  },
  // 2. Aug 31, 2026 - Gold scalp
  {
    id: 'tr-002',
    accountId: 'acc-ftmo-100k',
    ticketNumber: '8492012',
    pair: 'XAU/USD',
    type: 'BUY',
    lotSize: 2.0,
    openPrice: 2482.00,
    closePrice: 2494.50,
    stopLoss: 2477.00,
    takeProfit: 2495.00,
    openTime: '2026-08-31T13:45:00Z',
    closeTime: '2026-08-31T16:10:00Z',
    pnl: 2500.00,
    grossPnl: 2520.00,
    pips: 125.0,
    commission: 20.00,
    swap: 0,
    status: 'CLOSED',
    plannedRR: 2.60,
    realizedRR: 2.50,
    timeframe: 'M5',
    session: 'New York',
    entryCategory: 'Order Block (OB)',
    entryReason: 'NY session retest of unmitigated 1H bullish order block following high-impact US consumer confidence data.',
    exitCategory: 'Hit Take Profit (TP)',
    exitReason: 'Full TP hit as gold tested psychological $2,495 key resistance.',
    tpCategory: 'Major Psychological Key Level',
    tpReason: 'Anticipated profit-taking at $2,495 round number before New York close.',
    slCategory: 'Invalidation of FVG/OB',
    slReason: '5 dollars below the order block body.',
    emotionBefore: 'Calm & Disciplined',
    executionDiscipline: 'Followed Plan 100%',
    emotionAfter: 'Satisfied & Calm',
    disciplineScore: 5,
    mistakes: [],
    notes: 'Highest profit day achieved! Maintained patience during the initial 15-minute pullback.',
  },
  // 3. Aug 28, 2026 (Friday) - Small Win
  {
    id: 'tr-003',
    accountId: 'acc-ftmo-100k',
    ticketNumber: '8489104',
    pair: 'GBP/JPY',
    type: 'SELL',
    lotSize: 2.5,
    openPrice: 201.20,
    closePrice: 200.40,
    stopLoss: 201.60,
    takeProfit: 200.00,
    openTime: '2026-08-28T07:30:00Z',
    closeTime: '2026-08-28T11:00:00Z',
    pnl: 1285.00,
    grossPnl: 1305.00,
    pips: 80.0,
    commission: 20.00,
    swap: 0,
    status: 'CLOSED',
    plannedRR: 3.0,
    realizedRR: 2.0,
    timeframe: 'M15',
    session: 'London',
    entryCategory: 'Break of Structure (BOS)',
    entryReason: 'Bearish market structure shift on 15m after sweeping 4H supply wick.',
    exitCategory: 'Manual Discretionary Exit',
    exitReason: 'Closed before Friday NY session to lock in weekly gains and avoid weekend exposure.',
    tpCategory: 'Opposing Supply/Demand Zone',
    tpReason: 'Initial TP was 200.00 psychological support, secured +80 pips early.',
    slCategory: 'Below/Above Recent Swing',
    slReason: 'Above the rejection wick at 201.60.',
    emotionBefore: 'Calm & Disciplined',
    executionDiscipline: 'Followed Plan 100%',
    emotionAfter: 'Satisfied & Calm',
    disciplineScore: 4,
    mistakes: [],
    notes: 'Good risk discipline closing ahead of weekend.',
  },
  // 4. Aug 27, 2026 (Thursday) - Disciplined Loss
  {
    id: 'tr-004',
    accountId: 'acc-ftmo-100k',
    ticketNumber: '8487220',
    pair: 'USD/JPY',
    type: 'BUY',
    lotSize: 2.5,
    openPrice: 154.60,
    closePrice: 154.20,
    stopLoss: 154.20,
    takeProfit: 155.60,
    openTime: '2026-08-27T12:00:00Z',
    closeTime: '2026-08-27T13:15:00Z',
    pnl: -650.00,
    grossPnl: -630.00,
    pips: -40.0,
    commission: 20.00,
    swap: 0,
    status: 'CLOSED',
    plannedRR: 2.5,
    realizedRR: -1.0,
    timeframe: 'M15',
    session: 'New York',
    entryCategory: 'Trendline Retest',
    entryReason: 'Retest of upward trend channel with bullish engulfing candle.',
    exitCategory: 'Hit Stop Loss (SL)',
    exitReason: 'Unexpected BOJ verbal intervention triggered sudden JPY strength, tagging SL cleanly.',
    tpCategory: 'Fixed Risk-Reward (1:2 or 1:3)',
    tpReason: '1:2.5 RR into prior session highs.',
    slCategory: 'Below/Above Recent Swing',
    slReason: 'Fixed stop below the engulfing candle base.',
    emotionBefore: 'Calm & Disciplined',
    executionDiscipline: 'Followed Plan 100%',
    emotionAfter: 'Neutral & Objective',
    disciplineScore: 5,
    mistakes: [],
    notes: 'Valid setup that failed due to macro headline. Respected stop loss without moving it.',
  },
  // 5. Aug 26, 2026 (Wednesday) - Solid Win
  {
    id: 'tr-005',
    accountId: 'acc-ftmo-100k',
    ticketNumber: '8485199',
    pair: 'EUR/USD',
    type: 'SELL',
    lotSize: 3.0,
    openPrice: 1.0890,
    closePrice: 1.0835,
    stopLoss: 1.0910,
    takeProfit: 1.0830,
    openTime: '2026-08-26T08:30:00Z',
    closeTime: '2026-08-26T15:45:00Z',
    pnl: 1630.00,
    grossPnl: 1650.00,
    pips: 55.0,
    commission: 20.00,
    swap: 0,
    status: 'CLOSED',
    plannedRR: 3.0,
    realizedRR: 2.75,
    timeframe: 'M30',
    session: 'London/NY Overlap',
    entryCategory: 'Fair Value Gap (FVG)',
    entryReason: 'Rejection from 4H bearish FVG during London session after fakeout above 1.0900 round number.',
    exitCategory: 'Hit Take Profit (TP)',
    exitReason: 'Price filled the entire liquidity imbalance and tagged take profit.',
    tpCategory: 'Asian Session Liquidity Pool',
    tpReason: 'Targeted sell-side liquidity resting beneath Asian consolidation low.',
    slCategory: 'Invalidation of FVG/OB',
    slReason: 'Above the 4H FVG top edge + 3 pips buffer.',
    emotionBefore: 'Calm & Disciplined',
    executionDiscipline: 'Followed Plan 100%',
    emotionAfter: 'Satisfied & Calm',
    disciplineScore: 5,
    mistakes: [],
    notes: 'Textbook ICT FVG setup. High conviction entry.',
  },
  // 6. Aug 25, 2026 (Tuesday) - HIGHEST LOSS DAY (Emotional Revenge Trade)
  {
    id: 'tr-006',
    accountId: 'acc-ftmo-100k',
    ticketNumber: '8483110',
    pair: 'XAU/USD',
    type: 'SELL',
    lotSize: 2.0,
    openPrice: 2470.00,
    closePrice: 2478.00,
    stopLoss: 2478.00,
    takeProfit: 2450.00,
    openTime: '2026-08-25T13:00:00Z',
    closeTime: '2026-08-25T13:45:00Z',
    pnl: -1620.00,
    grossPnl: -1600.00,
    pips: -80.0,
    commission: 20.00,
    swap: 0,
    status: 'CLOSED',
    plannedRR: 2.5,
    realizedRR: -1.0,
    timeframe: 'M5',
    session: 'New York',
    entryCategory: 'Session High/Low Breakout',
    entryReason: 'Tried to catch top of NY Gold move without confirmed reversal pattern.',
    exitCategory: 'Hit Stop Loss (SL)',
    exitReason: 'Trend continued fiercely upwards, hitting original SL.',
    tpCategory: 'Opposing Supply/Demand Zone',
    tpReason: 'Daily open level.',
    slCategory: 'Fixed Pips / Account Risk %',
    slReason: 'Arbitrary $8 stop.',
    emotionBefore: 'FOMO / Rushed',
    executionDiscipline: 'Cut Winner Prematurely',
    emotionAfter: 'Frustrated / Regretful',
    disciplineScore: 2,
    mistakes: ['FOMO Entry', 'No Confirmation'],
    notes: 'Rushed into trade after missing the initial morning breakout.',
  },
  {
    id: 'tr-007',
    accountId: 'acc-ftmo-100k',
    ticketNumber: '8483115',
    pair: 'XAU/USD',
    type: 'SELL',
    lotSize: 4.0,
    openPrice: 2480.00,
    closePrice: 2488.50,
    stopLoss: 2488.50,
    takeProfit: 2465.00,
    openTime: '2026-08-25T14:00:00Z',
    closeTime: '2026-08-25T15:10:00Z',
    pnl: -3420.00,
    grossPnl: -3400.00,
    pips: -85.0,
    commission: 20.00,
    swap: 0,
    status: 'CLOSED',
    plannedRR: 2.0,
    realizedRR: -1.0,
    timeframe: 'M5',
    session: 'New York',
    entryCategory: 'Other',
    entryReason: 'Revenge trade: doubled lot size to 4.0 lots to recover previous $1,620 loss on Gold.',
    exitCategory: 'Hit Stop Loss (SL)',
    exitReason: 'Gold blasted through 2485 resistance directly into stopped level.',
    tpCategory: 'Fixed Risk-Reward (1:2 or 1:3)',
    tpReason: 'Breakeven recovery target.',
    slCategory: 'Fixed Pips / Account Risk %',
    slReason: 'Forced stop level.',
    emotionBefore: 'Revenge Mindset',
    executionDiscipline: 'Over-leveraged / Sized Too Big',
    emotionAfter: 'Angry & Urge to Trade',
    disciplineScore: 1,
    mistakes: ['Revenge Trade', 'Over-leveraged', 'Risked > 3%'],
    notes: 'Worst loss day of the month (-$5,040). Broke rules by sizing 4.0 lots while angry. Key audit lesson: Never revenge trade after a loss.',
  },
  // 7. Aug 24, 2026 (Monday) - Steady Win
  {
    id: 'tr-008',
    accountId: 'acc-ftmo-100k',
    ticketNumber: '8480991',
    pair: 'GBP/USD',
    type: 'BUY',
    lotSize: 2.5,
    openPrice: 1.2910,
    closePrice: 1.2975,
    stopLoss: 1.2885,
    takeProfit: 1.2980,
    openTime: '2026-08-24T08:00:00Z',
    closeTime: '2026-08-24T14:15:00Z',
    pnl: 1605.00,
    grossPnl: 1625.00,
    pips: 65.0,
    commission: 20.00,
    swap: 0,
    status: 'CLOSED',
    plannedRR: 2.6,
    realizedRR: 2.6,
    timeframe: 'M15',
    session: 'London',
    entryCategory: 'Order Block (OB)',
    entryReason: 'Clean 15m bullish order block mitigation in London session with GBP CPI tailwind.',
    exitCategory: 'Hit Take Profit (TP)',
    exitReason: 'Tagged take profit right at the weekly resistance zone.',
    tpCategory: 'Previous Day High/Low (PDH/PDL)',
    tpReason: 'Targeted previous Friday high.',
    slCategory: 'Below/Above Recent Swing',
    slReason: '3 pips below the order block lower wick.',
    emotionBefore: 'Calm & Disciplined',
    executionDiscipline: 'Followed Plan 100%',
    emotionAfter: 'Satisfied & Calm',
    disciplineScore: 5,
    mistakes: [],
    notes: 'Clean trade, textbook execution.',
  },
  // 8. Aug 21, 2026 (Friday) - Profitable Day
  {
    id: 'tr-009',
    accountId: 'acc-ftmo-100k',
    ticketNumber: '8478120',
    pair: 'EUR/USD',
    type: 'BUY',
    lotSize: 3.0,
    openPrice: 1.0810,
    closePrice: 1.0860,
    stopLoss: 1.0790,
    takeProfit: 1.0865,
    openTime: '2026-08-21T08:15:00Z',
    closeTime: '2026-08-21T13:40:00Z',
    pnl: 1480.00,
    grossPnl: 1500.00,
    pips: 50.0,
    commission: 20.00,
    swap: 0,
    status: 'CLOSED',
    plannedRR: 2.5,
    realizedRR: 2.5,
    timeframe: 'M15',
    session: 'London',
    entryCategory: 'Liquidity Sweep',
    entryReason: 'Swept sell-side liquidity below London low and formed bullish market structure shift.',
    exitCategory: 'Hit Take Profit (TP)',
    exitReason: 'Hit TP target cleanly before NY session open.',
    tpCategory: 'Opposing Supply/Demand Zone',
    tpReason: '1H supply block from Thursday.',
    slCategory: 'Below/Above Recent Swing',
    slReason: 'Below the sweep low.',
    emotionBefore: 'Calm & Disciplined',
    executionDiscipline: 'Followed Plan 100%',
    emotionAfter: 'Satisfied & Calm',
    disciplineScore: 5,
    mistakes: [],
    notes: 'Disciplined trade, stayed off charts after target reached.',
  },
  // 9. Aug 20, 2026 (Thursday) - Small Win
  {
    id: 'tr-010',
    accountId: 'acc-ftmo-100k',
    ticketNumber: '8476100',
    pair: 'AUD/USD',
    type: 'SELL',
    lotSize: 3.0,
    openPrice: 0.6580,
    closePrice: 0.6540,
    stopLoss: 0.6600,
    takeProfit: 0.6530,
    openTime: '2026-08-20T07:45:00Z',
    closeTime: '2026-08-20T12:30:00Z',
    pnl: 1180.00,
    grossPnl: 1200.00,
    pips: 40.0,
    commission: 20.00,
    swap: 0,
    status: 'CLOSED',
    plannedRR: 2.5,
    realizedRR: 2.0,
    timeframe: 'M15',
    session: 'London',
    entryCategory: 'Key Support/Resistance',
    entryReason: 'Double rejection from 4H major horizontal resistance at 0.6580 with bearish divergence on RSI.',
    exitCategory: 'Manual Discretionary Exit',
    exitReason: 'Locked in +40 pips when momentum slowed near 0.6540.',
    tpCategory: 'Equal Highs / Equal Lows (EQH/EQL)',
    tpReason: 'Equal lows from Monday.',
    slCategory: 'Beyond Key Support/Resistance',
    slReason: '5 pips above the 4H resistance zone.',
    emotionBefore: 'Calm & Disciplined',
    executionDiscipline: 'Followed Plan 100%',
    emotionAfter: 'Satisfied & Calm',
    disciplineScore: 4,
    mistakes: [],
    notes: 'Good execution and active trade management.',
  },
  // 10. Aug 19, 2026 (Wednesday) - Breakeven trade
  {
    id: 'tr-011',
    accountId: 'acc-ftmo-100k',
    ticketNumber: '8474200',
    pair: 'USD/CAD',
    type: 'BUY',
    lotSize: 2.5,
    openPrice: 1.3650,
    closePrice: 1.3652,
    stopLoss: 1.3652,
    takeProfit: 1.3720,
    openTime: '2026-08-19T13:30:00Z',
    closeTime: '2026-08-19T15:00:00Z',
    pnl: 3.50,
    grossPnl: 23.50,
    pips: 2.0,
    commission: 20.00,
    swap: 0,
    status: 'CLOSED',
    plannedRR: 3.0,
    realizedRR: 0.05,
    timeframe: 'M15',
    session: 'New York',
    entryCategory: 'Trendline Retest',
    entryReason: 'Oil inventory pullback into ascending support trendline on USD/CAD.',
    exitCategory: 'Partial Target + Breakeven',
    exitReason: 'Moved SL to breakeven after +20 pips, trailing stop tagged.',
    tpCategory: 'Previous Day High/Low (PDH/PDL)',
    tpReason: 'Prior day peak.',
    slCategory: 'Below/Above Recent Swing',
    slReason: 'Below swing low, moved to BE.',
    emotionBefore: 'Anxious / Hesitant',
    executionDiscipline: 'Moved SL to Breakeven Too Early',
    emotionAfter: 'Neutral & Objective',
    disciplineScore: 3,
    mistakes: ['Early Breakeven'],
    notes: 'Moved stop loss to breakeven too aggressively; trade would have reached full TP later.',
  },
  // 11. Aug 18, 2026 (Tuesday) - Profitable Win
  {
    id: 'tr-012',
    accountId: 'acc-ftmo-100k',
    ticketNumber: '8472190',
    pair: 'EUR/JPY',
    type: 'BUY',
    lotSize: 2.0,
    openPrice: 166.40,
    closePrice: 167.50,
    stopLoss: 165.90,
    takeProfit: 167.60,
    openTime: '2026-08-18T08:00:00Z',
    closeTime: '2026-08-18T16:00:00Z',
    pnl: 1450.00,
    grossPnl: 1470.00,
    pips: 110.0,
    commission: 20.00,
    swap: 0,
    status: 'CLOSED',
    plannedRR: 2.4,
    realizedRR: 2.2,
    timeframe: 'H1',
    session: 'London/NY Overlap',
    entryCategory: 'Fibonacci Golden Pocket',
    entryReason: '61.8% Fibonacci retracement confluence with London session open liquidity grab.',
    exitCategory: 'Hit Take Profit (TP)',
    exitReason: 'Strong JPY weakness carried EURJPY directly into TP level.',
    tpCategory: 'Fibonacci Extension Target',
    tpReason: '-0.272 Fibonacci extension.',
    slCategory: 'Below/Above Recent Swing',
    slReason: 'Below the 78.6% Fib level.',
    emotionBefore: 'Calm & Disciplined',
    executionDiscipline: 'Followed Plan 100%',
    emotionAfter: 'Satisfied & Calm',
    disciplineScore: 5,
    mistakes: [],
    notes: 'High conviction HTF setup. Held through minor retracements calmly.',
  },
  // 12. Aug 17, 2026 (Monday) - Small Loss
  {
    id: 'tr-013',
    accountId: 'acc-ftmo-100k',
    ticketNumber: '8470100',
    pair: 'EUR/USD',
    type: 'SELL',
    lotSize: 2.5,
    openPrice: 1.0870,
    closePrice: 1.0895,
    stopLoss: 1.0895,
    takeProfit: 1.0810,
    openTime: '2026-08-17T09:00:00Z',
    closeTime: '2026-08-17T11:15:00Z',
    pnl: -645.00,
    grossPnl: -625.00,
    pips: -25.0,
    commission: 20.00,
    swap: 0,
    status: 'CLOSED',
    plannedRR: 2.4,
    realizedRR: -1.0,
    timeframe: 'M15',
    session: 'London',
    entryCategory: 'Double Top/Bottom',
    entryReason: 'Double top rejection pattern at 1.0870.',
    exitCategory: 'Hit Stop Loss (SL)',
    exitReason: 'Monday liquidity expansion pierced the double top.',
    tpCategory: 'Opposing Supply/Demand Zone',
    tpReason: 'Asian lows.',
    slCategory: 'Below/Above Recent Swing',
    slReason: '5 pips above the double top peak.',
    emotionBefore: 'Bored / Impatient',
    executionDiscipline: 'Followed Plan 100%',
    emotionAfter: 'Neutral & Objective',
    disciplineScore: 4,
    mistakes: ['Impatient Entry'],
    notes: 'Entered on low volatility Monday without waiting for displacement candle.',
  },
  // 13. Aug 14, 2026 (Friday) - Big Win on Gold
  {
    id: 'tr-014',
    accountId: 'acc-ftmo-100k',
    ticketNumber: '8468112',
    pair: 'XAU/USD',
    type: 'BUY',
    lotSize: 2.0,
    openPrice: 2450.00,
    closePrice: 2468.00,
    stopLoss: 2442.00,
    takeProfit: 2470.00,
    openTime: '2026-08-14T13:30:00Z',
    closeTime: '2026-08-14T16:45:00Z',
    pnl: 3580.00,
    grossPnl: 3600.00,
    pips: 180.0,
    commission: 20.00,
    swap: 0,
    status: 'CLOSED',
    plannedRR: 2.5,
    realizedRR: 2.25,
    timeframe: 'M15',
    session: 'New York',
    entryCategory: 'High Impact News',
    entryReason: 'US PPI miss created intense gold bid; waited 15 mins for initial spike to retrace into 5m FVG.',
    exitCategory: 'Manual Discretionary Exit',
    exitReason: 'Secured $3,580 profit before Friday market close.',
    tpCategory: 'Previous Day High/Low (PDH/PDL)',
    tpReason: 'Weekly high liquidity sweep.',
    slCategory: 'Invalidation of FVG/OB',
    slReason: 'Below post-news reaction candle low.',
    emotionBefore: 'Calm & Disciplined',
    executionDiscipline: 'Followed Plan 100%',
    emotionAfter: 'Euphoric / Invincible',
    disciplineScore: 5,
    mistakes: [],
    notes: 'Remarkable patience letting the initial news candle spread settle before executing.',
  },
  // 14. Aug 13, 2026 (Thursday) - Win
  {
    id: 'tr-015',
    accountId: 'acc-ftmo-100k',
    ticketNumber: '8465190',
    pair: 'GBP/USD',
    type: 'SELL',
    lotSize: 2.5,
    openPrice: 1.2940,
    closePrice: 1.2880,
    stopLoss: 1.2970,
    takeProfit: 1.2870,
    openTime: '2026-08-13T08:30:00Z',
    closeTime: '2026-08-13T14:00:00Z',
    pnl: 1480.00,
    grossPnl: 1500.00,
    pips: 60.0,
    commission: 20.00,
    swap: 0,
    status: 'CLOSED',
    plannedRR: 2.3,
    realizedRR: 2.0,
    timeframe: 'M15',
    session: 'London',
    entryCategory: 'Liquidity Sweep',
    entryReason: 'Judas swing fakeout above 1.2940 Asian high into 1H supply zone.',
    exitCategory: 'Hit Take Profit (TP)',
    exitReason: 'Price plunged through liquidity pool to hit TP.',
    tpCategory: 'Asian Session Liquidity Pool',
    tpReason: 'Equal lows below Asian range.',
    slCategory: 'Below/Above Recent Swing',
    slReason: 'Above the Judas swing spike.',
    emotionBefore: 'Calm & Disciplined',
    executionDiscipline: 'Followed Plan 100%',
    emotionAfter: 'Satisfied & Calm',
    disciplineScore: 5,
    mistakes: [],
    notes: 'Textbook ICT Judas swing strategy during London open.',
  },
  // 15. Aug 12, 2026 (Wednesday) - Loss
  {
    id: 'tr-016',
    accountId: 'acc-ftmo-100k',
    ticketNumber: '8463100',
    pair: 'NAS100',
    type: 'BUY',
    lotSize: 1.0,
    openPrice: 19400.00,
    closePrice: 19350.00,
    stopLoss: 19350.00,
    takeProfit: 19550.00,
    openTime: '2026-08-12T14:30:00Z',
    closeTime: '2026-08-12T15:15:00Z',
    pnl: -1020.00,
    grossPnl: -1000.00,
    pips: -50.0,
    commission: 20.00,
    swap: 0,
    status: 'CLOSED',
    plannedRR: 3.0,
    realizedRR: -1.0,
    timeframe: 'M5',
    session: 'New York',
    entryCategory: 'Session High/Low Breakout',
    entryReason: 'US market open opening bell breakout buy.',
    exitCategory: 'Hit Stop Loss (SL)',
    exitReason: 'Whipsaw open triggered sudden dump into support.',
    tpCategory: 'Major Psychological Key Level',
    tpReason: '19,500 round level.',
    slCategory: 'Fixed Pips / Account Risk %',
    slReason: 'Fixed 50 pts risk.',
    emotionBefore: 'FOMO / Rushed',
    executionDiscipline: 'Followed Plan 100%',
    emotionAfter: 'Frustrated / Regretful',
    disciplineScore: 3,
    mistakes: ['FOMO Entry'],
    notes: 'Nasdaq open volatility is too harsh. Need to wait for 9:45 AM New York structure before entering indices.',
  },
  // 16. Aug 11, 2026 (Tuesday) - Win
  {
    id: 'tr-017',
    accountId: 'acc-ftmo-100k',
    ticketNumber: '8461011',
    pair: 'USD/JPY',
    type: 'SELL',
    lotSize: 3.0,
    openPrice: 155.20,
    closePrice: 154.40,
    stopLoss: 155.60,
    takeProfit: 154.20,
    openTime: '2026-08-11T08:00:00Z',
    closeTime: '2026-08-11T13:30:00Z',
    pnl: 1530.00,
    grossPnl: 1550.00,
    pips: 80.0,
    commission: 20.00,
    swap: 0,
    status: 'CLOSED',
    plannedRR: 2.5,
    realizedRR: 2.0,
    timeframe: 'M30',
    session: 'London',
    entryCategory: 'Break of Structure (BOS)',
    entryReason: 'Clean 30m break of structure after touching daily resistance.',
    exitCategory: 'Hit Take Profit (TP)',
    exitReason: 'Smooth trend downwards into TP target.',
    tpCategory: 'Opposing Supply/Demand Zone',
    tpReason: 'Support demand zone at 154.30.',
    slCategory: 'Below/Above Recent Swing',
    slReason: 'Above the structural breakdown candle.',
    emotionBefore: 'Calm & Disciplined',
    executionDiscipline: 'Followed Plan 100%',
    emotionAfter: 'Satisfied & Calm',
    disciplineScore: 5,
    mistakes: [],
    notes: 'High consistency execution.',
  },
  // 17. Aug 10, 2026 (Monday) - Win
  {
    id: 'tr-018',
    accountId: 'acc-ftmo-100k',
    ticketNumber: '8458900',
    pair: 'EUR/USD',
    type: 'BUY',
    lotSize: 2.5,
    openPrice: 1.0830,
    closePrice: 1.0880,
    stopLoss: 1.0805,
    takeProfit: 1.0885,
    openTime: '2026-08-10T08:30:00Z',
    closeTime: '2026-08-10T14:45:00Z',
    pnl: 1230.00,
    grossPnl: 1250.00,
    pips: 50.0,
    commission: 20.00,
    swap: 0,
    status: 'CLOSED',
    plannedRR: 2.2,
    realizedRR: 2.0,
    timeframe: 'M15',
    session: 'London',
    entryCategory: 'Fair Value Gap (FVG)',
    entryReason: '15m bullish FVG tap in London session after sweeping Asia lows.',
    exitCategory: 'Hit Take Profit (TP)',
    exitReason: 'Reached TP target at previous day high.',
    tpCategory: 'Previous Day High/Low (PDH/PDL)',
    tpReason: 'Friday high liquidity.',
    slCategory: 'Invalidation of FVG/OB',
    slReason: 'Below FVG candle body.',
    emotionBefore: 'Calm & Disciplined',
    executionDiscipline: 'Followed Plan 100%',
    emotionAfter: 'Satisfied & Calm',
    disciplineScore: 5,
    mistakes: [],
    notes: 'Great start to the second week of August.',
  },
  // 18. Aug 07, 2026 (Friday) - NFP Day Win
  {
    id: 'tr-019',
    accountId: 'acc-ftmo-100k',
    ticketNumber: '8455110',
    pair: 'EUR/USD',
    type: 'SELL',
    lotSize: 2.0,
    openPrice: 1.0920,
    closePrice: 1.0840,
    stopLoss: 1.0950,
    takeProfit: 1.0835,
    openTime: '2026-08-07T13:45:00Z',
    closeTime: '2026-08-07T16:30:00Z',
    pnl: 1580.00,
    grossPnl: 1600.00,
    pips: 80.0,
    commission: 20.00,
    swap: 0,
    status: 'CLOSED',
    plannedRR: 2.8,
    realizedRR: 2.67,
    timeframe: 'M15',
    session: 'New York',
    entryCategory: 'High Impact News',
    entryReason: 'US NFP Non-Farm Payrolls blowout beat. Waited for initial spike up to 1.0920 before shorting.',
    exitCategory: 'Hit Take Profit (TP)',
    exitReason: 'DXY surged causing EURUSD to drop 80 pips into daily target.',
    tpCategory: 'Equal Highs / Equal Lows (EQH/EQL)',
    tpReason: 'Weekly equal lows.',
    slCategory: 'Below/Above Recent Swing',
    slReason: 'Above the news wick peak.',
    emotionBefore: 'Calm & Disciplined',
    executionDiscipline: 'Followed Plan 100%',
    emotionAfter: 'Satisfied & Calm',
    disciplineScore: 5,
    mistakes: [],
    notes: 'Masterclass on trading NFP without gambling on the release second.',
  },
  // 19. Aug 06, 2026 (Thursday) - Win
  {
    id: 'tr-020',
    accountId: 'acc-ftmo-100k',
    ticketNumber: '8452090',
    pair: 'GBP/JPY',
    type: 'BUY',
    lotSize: 2.0,
    openPrice: 199.50,
    closePrice: 200.60,
    stopLoss: 199.00,
    takeProfit: 200.75,
    openTime: '2026-08-06T07:30:00Z',
    closeTime: '2026-08-06T13:00:00Z',
    pnl: 1420.00,
    grossPnl: 1440.00,
    pips: 110.0,
    commission: 20.00,
    swap: 0,
    status: 'CLOSED',
    plannedRR: 2.5,
    realizedRR: 2.2,
    timeframe: 'M15',
    session: 'London',
    entryCategory: 'Order Block (OB)',
    entryReason: 'London open bounce off 15m order block after clearing Asian session liquidity.',
    exitCategory: 'Hit Take Profit (TP)',
    exitReason: 'Full target hit at 200.60 resistance.',
    tpCategory: 'Opposing Supply/Demand Zone',
    tpReason: 'Prior high supply zone.',
    slCategory: 'Below/Above Recent Swing',
    slReason: 'Below the order block low.',
    emotionBefore: 'Calm & Disciplined',
    executionDiscipline: 'Followed Plan 100%',
    emotionAfter: 'Satisfied & Calm',
    disciplineScore: 5,
    mistakes: [],
    notes: 'Very clean trending day for Guppy (GBPJPY).',
  },
  // 20. Aug 05, 2026 (Wednesday) - Loss
  {
    id: 'tr-021',
    accountId: 'acc-ftmo-100k',
    ticketNumber: '8449100',
    pair: 'USD/CAD',
    type: 'SELL',
    lotSize: 3.0,
    openPrice: 1.3780,
    closePrice: 1.3810,
    stopLoss: 1.3810,
    takeProfit: 1.3720,
    openTime: '2026-08-05T13:00:00Z',
    closeTime: '2026-08-05T14:15:00Z',
    pnl: -675.00,
    grossPnl: -655.00,
    pips: -30.0,
    commission: 20.00,
    swap: 0,
    status: 'CLOSED',
    plannedRR: 2.0,
    realizedRR: -1.0,
    timeframe: 'M15',
    session: 'New York',
    entryCategory: 'Key Support/Resistance',
    entryReason: 'Resistance test at 1.3780.',
    exitCategory: 'Hit Stop Loss (SL)',
    exitReason: 'Crude oil dropped sharply, propelling USDCAD past stop loss.',
    tpCategory: 'Opposing Supply/Demand Zone',
    tpReason: 'Demand pool.',
    slCategory: 'Beyond Key Support/Resistance',
    slReason: '5 pips above resistance line.',
    emotionBefore: 'Calm & Disciplined',
    executionDiscipline: 'Followed Plan 100%',
    emotionAfter: 'Neutral & Objective',
    disciplineScore: 5,
    mistakes: [],
    notes: 'Well managed risk, stopped at exactly 0.65% account risk.',
  },
  // 21. Aug 04, 2026 (Tuesday) - Win
  {
    id: 'tr-022',
    accountId: 'acc-ftmo-100k',
    ticketNumber: '8446210',
    pair: 'EUR/USD',
    type: 'BUY',
    lotSize: 2.5,
    openPrice: 1.0850,
    closePrice: 1.0900,
    stopLoss: 1.0825,
    takeProfit: 1.0905,
    openTime: '2026-08-04T08:15:00Z',
    closeTime: '2026-08-04T15:00:00Z',
    pnl: 1230.00,
    grossPnl: 1250.00,
    pips: 50.0,
    commission: 20.00,
    swap: 0,
    status: 'CLOSED',
    plannedRR: 2.2,
    realizedRR: 2.0,
    timeframe: 'M15',
    session: 'London',
    entryCategory: 'Liquidity Sweep',
    entryReason: 'Swept 1.0850 psychological level in London open followed by strong market structure shift.',
    exitCategory: 'Hit Take Profit (TP)',
    exitReason: 'Tagged take profit at 1.0900 round number.',
    tpCategory: 'Major Psychological Key Level',
    tpReason: '1.0900 key institutional level.',
    slCategory: 'Below/Above Recent Swing',
    slReason: '3 pips under the sweep low.',
    emotionBefore: 'Calm & Disciplined',
    executionDiscipline: 'Followed Plan 100%',
    emotionAfter: 'Satisfied & Calm',
    disciplineScore: 5,
    mistakes: [],
    notes: 'Solid high-probability setup.',
  },
  // 22. Aug 03, 2026 (Monday) - First Trade of Month Win
  {
    id: 'tr-023',
    accountId: 'acc-ftmo-100k',
    ticketNumber: '8443100',
    pair: 'XAU/USD',
    type: 'BUY',
    lotSize: 1.5,
    openPrice: 2420.00,
    closePrice: 2435.00,
    stopLoss: 2413.00,
    takeProfit: 2435.00,
    openTime: '2026-08-03T13:30:00Z',
    closeTime: '2026-08-03T16:00:00Z',
    pnl: 2230.00,
    grossPnl: 2250.00,
    pips: 150.0,
    commission: 20.00,
    swap: 0,
    status: 'CLOSED',
    plannedRR: 2.14,
    realizedRR: 2.14,
    timeframe: 'M15',
    session: 'New York',
    entryCategory: 'Break of Structure (BOS)',
    entryReason: 'NY session breakout after 4H consolidation break.',
    exitCategory: 'Hit Take Profit (TP)',
    exitReason: 'Clean $15 rally into daily target.',
    tpCategory: 'Previous Day High/Low (PDH/PDL)',
    tpReason: 'Friday high liquidity target.',
    slCategory: 'Below/Above Recent Swing',
    slReason: 'Below consolidation baseline.',
    emotionBefore: 'Calm & Disciplined',
    executionDiscipline: 'Followed Plan 100%',
    emotionAfter: 'Satisfied & Calm',
    disciplineScore: 5,
    mistakes: [],
    notes: 'Perfect start to August.',
  }
];

// LocalStorage Storage Keys
const STORAGE_ACCOUNTS_KEY = 'forex_journal_accounts_v1';
const STORAGE_TRADES_KEY = 'forex_journal_trades_v1';
const STORAGE_ACTIVE_ACC_KEY = 'forex_journal_active_account_id_v1';

export function getStoredAccounts(): TradingAccount[] {
  try {
    const saved = localStorage.getItem(STORAGE_ACCOUNTS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error reading accounts from localStorage', e);
  }
  saveStoredAccounts(INITIAL_ACCOUNTS);
  return INITIAL_ACCOUNTS;
}

export function saveStoredAccounts(accounts: TradingAccount[]): void {
  try {
    localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.error('Error saving accounts to localStorage', e);
  }
}

export function getStoredTrades(): Trade[] {
  try {
    const saved = localStorage.getItem(STORAGE_TRADES_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error reading trades from localStorage', e);
  }
  saveStoredTrades(INITIAL_TRADES);
  return INITIAL_TRADES;
}

export function saveStoredTrades(trades: Trade[]): void {
  try {
    localStorage.setItem(STORAGE_TRADES_KEY, JSON.stringify(trades));
  } catch (e) {
    console.error('Error saving trades to localStorage', e);
  }
}

export function getActiveAccountId(): string {
  try {
    const id = localStorage.getItem(STORAGE_ACTIVE_ACC_KEY);
    if (id) return id;
  } catch (e) {}
  return 'acc-ftmo-100k';
}

export function setActiveAccountId(id: string): void {
  try {
    localStorage.setItem(STORAGE_ACTIVE_ACC_KEY, id);
  } catch (e) {}
}

export function resetToDemoData(): void {
  saveStoredAccounts(INITIAL_ACCOUNTS);
  saveStoredTrades(INITIAL_TRADES);
  setActiveAccountId('acc-ftmo-100k');
}

// Compute comprehensive statistics & daily/monthly breakdown
export function computePerformanceStats(trades: Trade[], account?: TradingAccount): PerformanceStats {
  const closedTrades = trades.filter(t => t.status === 'CLOSED');
  const totalTrades = closedTrades.length;

  if (totalTrades === 0) {
    return {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      breakevenTrades: 0,
      winRate: 0,
      lossRate: 0,
      netProfit: 0,
      grossProfit: 0,
      grossLoss: 0,
      profitFactor: 0,
      expectancy: 0,
      averageWin: 0,
      averageLoss: 0,
      winLossRatio: 0,
      totalPips: 0,
      highestProfitTrade: null,
      highestLossTrade: null,
      highestProfitDay: null,
      highestLossDay: null,
      consistency: {
        consistencyScore: 100,
        profitConsistencyRatio: 0,
        profitConsistencyPassed: true,
        maxDailyDrawdownDollar: 0,
        maxDailyDrawdownPct: 0,
        dailyDrawdownLimitPassed: true,
        maxHistoricalDrawdownPct: 0,
        maxTotalDrawdownPassed: true,
        winStreak: 0,
        lossStreak: 0,
        avgDisciplineScore: 5,
        disciplinedTradesPct: 100,
        avgRR: 0,
      }
    };
  }

  const winning = closedTrades.filter(t => t.pnl > 0);
  const losing = closedTrades.filter(t => t.pnl < 0);
  const breakeven = closedTrades.filter(t => t.pnl === 0);

  const winningTrades = winning.length;
  const losingTrades = losing.length;
  const breakevenTrades = breakeven.length;
  const winRate = Number(((winningTrades / totalTrades) * 100).toFixed(1));
  const lossRate = Number(((losingTrades / totalTrades) * 100).toFixed(1));

  const grossProfit = winning.reduce((acc, t) => acc + t.pnl, 0);
  const grossLoss = Math.abs(losing.reduce((acc, t) => acc + t.pnl, 0));
  const netProfit = Number((grossProfit - grossLoss).toFixed(2));
  const profitFactor = grossLoss > 0 ? Number((grossProfit / grossLoss).toFixed(2)) : grossProfit > 0 ? 99.9 : 0;
  
  const averageWin = winningTrades > 0 ? Number((grossProfit / winningTrades).toFixed(2)) : 0;
  const averageLoss = losingTrades > 0 ? Number((grossLoss / losingTrades).toFixed(2)) : 0;
  const winLossRatio = averageLoss > 0 ? Number((averageWin / averageLoss).toFixed(2)) : averageWin > 0 ? 10 : 0;
  const expectancy = Number(((winRate / 100 * averageWin) - (lossRate / 100 * averageLoss)).toFixed(2));
  const totalPips = Number(closedTrades.reduce((acc, t) => acc + t.pips, 0).toFixed(1));

  // Find highest profit trade and highest loss trade
  const sortedByPnl = [...closedTrades].sort((a, b) => b.pnl - a.pnl);
  const highestProfitTrade = sortedByPnl[0]?.pnl > 0 ? sortedByPnl[0] : null;
  const highestLossTrade = sortedByPnl[sortedByPnl.length - 1]?.pnl < 0 ? sortedByPnl[sortedByPnl.length - 1] : null;

  // Group by day to find Highest Profit Day and Highest Loss Day
  const daysMap = new Map<string, Trade[]>();
  closedTrades.forEach(t => {
    const day = t.closeTime.split('T')[0];
    const existing = daysMap.get(day) || [];
    existing.push(t);
    daysMap.set(day, existing);
  });

  const dayPerformances: DayPerformance[] = Array.from(daysMap.entries()).map(([dateStr, dayTrades]) => {
    const dayPnl = dayTrades.reduce((sum, tr) => sum + tr.pnl, 0);
    const dayWins = dayTrades.filter(tr => tr.pnl > 0).length;
    const dayLosses = dayTrades.filter(tr => tr.pnl < 0).length;
    const dayRate = dayTrades.length > 0 ? (dayWins / dayTrades.length) * 100 : 0;
    const dateObj = new Date(dateStr + 'T12:00:00Z');
    const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'short' });

    return {
      dateStr,
      dayOfWeek,
      pnl: Number(dayPnl.toFixed(2)),
      tradesCount: dayTrades.length,
      wins: dayWins,
      losses: dayLosses,
      winRate: Number(dayRate.toFixed(1)),
      trades: dayTrades,
    };
  });

  const sortedDays = [...dayPerformances].sort((a, b) => b.pnl - a.pnl);
  const highestProfitDay = sortedDays.length > 0 && sortedDays[0].pnl > 0 ? { ...sortedDays[0], isBestDay: true } : null;
  const highestLossDay = sortedDays.length > 0 && sortedDays[sortedDays.length - 1].pnl < 0 ? { ...sortedDays[sortedDays.length - 1], isWorstDay: true } : null;

  // Consistency & Risk Metrics
  const startingBal = account?.initialBalance || 100000;
  const maxDailyLossDollar = sortedDays.length > 0 && sortedDays[sortedDays.length - 1].pnl < 0 ? Math.abs(sortedDays[sortedDays.length - 1].pnl) : 0;
  const maxDailyDrawdownPct = Number(((maxDailyLossDollar / startingBal) * 100).toFixed(2));
  const maxDailyLimitPct = account?.maxDailyDrawdownPct || 5;
  const dailyDrawdownLimitPassed = maxDailyDrawdownPct <= maxDailyLimitPct;

  // Profit consistency rule (Highest day profit should be < 30% of total profit)
  const bestDayPnl = highestProfitDay ? highestProfitDay.pnl : 0;
  const profitConsistencyRatio = grossProfit > 0 ? Number(((bestDayPnl / grossProfit) * 100).toFixed(1)) : 0;
  const profitConsistencyPassed = profitConsistencyRatio <= 35; // Prop firm standard

  // Streaks
  let currentWinStreak = 0;
  let maxWinStreak = 0;
  let currentLossStreak = 0;
  let maxLossStreak = 0;

  const chronTrades = [...closedTrades].sort((a, b) => new Date(a.closeTime).getTime() - new Date(b.closeTime).getTime());
  chronTrades.forEach(t => {
    if (t.pnl > 0) {
      currentWinStreak++;
      currentLossStreak = 0;
      if (currentWinStreak > maxWinStreak) maxWinStreak = currentWinStreak;
    } else if (t.pnl < 0) {
      currentLossStreak++;
      currentWinStreak = 0;
      if (currentLossStreak > maxLossStreak) maxLossStreak = currentLossStreak;
    }
  });

  // Calculate Historical Equity Drawdown Peak-to-Trough
  let runningBal = startingBal;
  let peak = startingBal;
  let maxDd = 0;
  chronTrades.forEach(t => {
    runningBal += t.pnl;
    if (runningBal > peak) peak = runningBal;
    const currentDd = peak - runningBal;
    if (currentDd > maxDd) maxDd = currentDd;
  });
  const maxHistoricalDrawdownPct = Number(((maxDd / peak) * 100).toFixed(2));
  const maxTotalDrawdownPassed = maxHistoricalDrawdownPct <= (account?.maxTotalDrawdownPct || 10);

  // Discipline score
  const totalDisciplineScore = closedTrades.reduce((sum, t) => sum + (t.disciplineScore || 3), 0);
  const avgDisciplineScore = Number((totalDisciplineScore / totalTrades).toFixed(2));
  const disciplinedTradesCount = closedTrades.filter(t => t.disciplineScore >= 4).length;
  const disciplinedTradesPct = Number(((disciplinedTradesCount / totalTrades) * 100).toFixed(1));

  // Avg Realized RR
  const totalRR = closedTrades.reduce((sum, t) => sum + (t.realizedRR || 0), 0);
  const avgRR = Number((totalRR / totalTrades).toFixed(2));

  // Overall Consistency Composite Score (0-100)
  // Weights: Discipline (30%), Profit Consistency (25%), Drawdown Safety (25%), Win Rate & Profit Factor (20%)
  let score = 50;
  score += (disciplinedTradesPct - 50) * 0.4;
  score += profitConsistencyPassed ? 15 : -10;
  score += dailyDrawdownLimitPassed ? 15 : -25;
  score += maxTotalDrawdownPassed ? 10 : -20;
  if (profitFactor >= 2.0) score += 10;
  else if (profitFactor < 1.0) score -= 15;
  const consistencyScore = Math.min(99, Math.max(15, Math.round(score)));

  return {
    totalTrades,
    winningTrades,
    losingTrades,
    breakevenTrades,
    winRate,
    lossRate,
    netProfit,
    grossProfit: Number(grossProfit.toFixed(2)),
    grossLoss: Number(grossLoss.toFixed(2)),
    profitFactor,
    expectancy,
    averageWin,
    averageLoss,
    winLossRatio,
    totalPips,
    highestProfitTrade,
    highestLossTrade,
    highestProfitDay,
    highestLossDay,
    consistency: {
      consistencyScore,
      profitConsistencyRatio,
      profitConsistencyPassed,
      maxDailyDrawdownDollar: Number(maxDailyLossDollar.toFixed(2)),
      maxDailyDrawdownPct,
      dailyDrawdownLimitPassed,
      maxHistoricalDrawdownPct,
      maxTotalDrawdownPassed,
      winStreak: maxWinStreak,
      lossStreak: maxLossStreak,
      avgDisciplineScore,
      disciplinedTradesPct,
      avgRR,
    }
  };
}

// Compute Monthly Breakdown (for Calendar Heatmap & Month Analytics)
export function computeMonthlyPerformance(trades: Trade[], targetMonth?: string): MonthPerformance {
  const closedTrades = trades.filter(t => t.status === 'CLOSED');
  
  // Pick default month from current or latest trade
  let monthKey = targetMonth;
  if (!monthKey) {
    if (closedTrades.length > 0) {
      const sorted = [...closedTrades].sort((a, b) => new Date(b.closeTime).getTime() - new Date(a.closeTime).getTime());
      monthKey = sorted[0].closeTime.substring(0, 7); // e.g. '2026-08'
    } else {
      monthKey = new Date().toISOString().substring(0, 7);
    }
  }

  const monthTrades = closedTrades.filter(t => t.closeTime.startsWith(monthKey!));
  const [yearStr, monthNumStr] = monthKey.split('-');
  const monthDate = new Date(parseInt(yearStr), parseInt(monthNumStr) - 1, 1);
  const monthName = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Map each day of the month
  const daysInMonth = new Date(parseInt(yearStr), parseInt(monthNumStr), 0).getDate();
  const dayPerformanceList: DayPerformance[] = [];

  let profitableDaysCount = 0;
  let losingDaysCount = 0;
  let breakevenDaysCount = 0;
  let totalTradingDays = 0;
  let totalPnl = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const dayStr = `${monthKey}-${day.toString().padStart(2, '0')}`;
    const dateObj = new Date(dayStr + 'T12:00:00Z');
    const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    const dayTrades = monthTrades.filter(t => t.closeTime.startsWith(dayStr));

    if (dayTrades.length > 0) {
      totalTradingDays++;
      const dayPnl = dayTrades.reduce((acc, t) => acc + t.pnl, 0);
      const wins = dayTrades.filter(t => t.pnl > 0).length;
      const losses = dayTrades.filter(t => t.pnl < 0).length;
      const winRate = Number(((wins / dayTrades.length) * 100).toFixed(1));

      totalPnl += dayPnl;
      if (dayPnl > 0) profitableDaysCount++;
      else if (dayPnl < 0) losingDaysCount++;
      else breakevenDaysCount++;

      dayPerformanceList.push({
        dateStr: dayStr,
        dayOfWeek,
        pnl: Number(dayPnl.toFixed(2)),
        tradesCount: dayTrades.length,
        wins,
        losses,
        winRate,
        trades: dayTrades,
      });
    } else {
      dayPerformanceList.push({
        dateStr: dayStr,
        dayOfWeek,
        pnl: 0,
        tradesCount: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        trades: [],
      });
    }
  }

  const greenDayRatio = totalTradingDays > 0 ? Number(((profitableDaysCount / totalTradingDays) * 100).toFixed(1)) : 0;
  const activeTradingDays = dayPerformanceList.filter(d => d.tradesCount > 0);
  const sortedDays = [...activeTradingDays].sort((a, b) => b.pnl - a.pnl);
  const bestDay = sortedDays.length > 0 && sortedDays[0].pnl > 0 ? { ...sortedDays[0], isBestDay: true } : null;
  const worstDay = sortedDays.length > 0 && sortedDays[sortedDays.length - 1].pnl < 0 ? { ...sortedDays[sortedDays.length - 1], isWorstDay: true } : null;

  return {
    monthKey,
    monthName,
    totalPnl: Number(totalPnl.toFixed(2)),
    profitableDaysCount,
    losingDaysCount,
    breakevenDaysCount,
    totalTradingDays,
    greenDayRatio,
    bestDay,
    worstDay,
    days: dayPerformanceList,
  };
}

// Compute Emotion Matrix breakdown
export function computeEmotionStats(trades: Trade[]): EmotionStatsItem[] {
  const closedTrades = trades.filter(t => t.status === 'CLOSED');
  const emotions: EmotionStatsItem[] = [];

  const grouped = new Map<string, Trade[]>();
  closedTrades.forEach(t => {
    const em = t.emotionBefore || 'Calm & Disciplined';
    const list = grouped.get(em) || [];
    list.push(t);
    grouped.set(em, list);
  });

  grouped.forEach((tradeList, emotion) => {
    const count = tradeList.length;
    const totalPnl = Number(tradeList.reduce((acc, t) => acc + t.pnl, 0).toFixed(2));
    const wins = tradeList.filter(t => t.pnl > 0).length;
    const winRate = Number(((wins / count) * 100).toFixed(1));
    const avgScore = Number((tradeList.reduce((acc, t) => acc + (t.disciplineScore || 3), 0) / count).toFixed(1));
    const avgPnl = Number((totalPnl / count).toFixed(2));

    emotions.push({
      emotion: emotion as any,
      tradesCount: count,
      totalPnl,
      winRate,
      avgDisciplineScore: avgScore,
      avgPnl,
    });
  });

  return emotions.sort((a, b) => b.totalPnl - a.totalPnl);
}

// Compute Setup / Strategy breakdown
export function computeSetupStats(trades: Trade[]): SetupStatsItem[] {
  const closedTrades = trades.filter(t => t.status === 'CLOSED');
  const grouped = new Map<string, Trade[]>();

  closedTrades.forEach(t => {
    const setup = t.entryCategory || 'Other';
    const list = grouped.get(setup) || [];
    list.push(t);
    grouped.set(setup, list);
  });

  const result: SetupStatsItem[] = [];
  grouped.forEach((tradeList, category) => {
    const count = tradeList.length;
    const totalPnl = Number(tradeList.reduce((acc, t) => acc + t.pnl, 0).toFixed(2));
    const wins = tradeList.filter(t => t.pnl > 0).length;
    const winRate = Number(((wins / count) * 100).toFixed(1));
    const grossWin = tradeList.filter(t => t.pnl > 0).reduce((acc, t) => acc + t.pnl, 0);
    const grossLoss = Math.abs(tradeList.filter(t => t.pnl < 0).reduce((acc, t) => acc + t.pnl, 0));
    const profitFactor = grossLoss > 0 ? Number((grossWin / grossLoss).toFixed(2)) : grossWin > 0 ? 99 : 0;
    const avgRR = Number((tradeList.reduce((acc, t) => acc + (t.realizedRR || 0), 0) / count).toFixed(2));

    result.push({
      category,
      tradesCount: count,
      totalPnl,
      winRate,
      profitFactor,
      avgRR,
    });
  });

  return result.sort((a, b) => b.totalPnl - a.totalPnl);
}

// Export Trades to CSV
export function exportTradesToCSV(trades: Trade[], accountName: string = 'Forex_Journal'): void {
  const headers = [
    'Ticket',
    'Account',
    'Pair',
    'Type',
    'Lot Size',
    'Open Time',
    'Close Time',
    'Open Price',
    'Close Price',
    'Stop Loss',
    'Take Profit',
    'Net PnL ($)',
    'Pips',
    'Commission',
    'Status',
    'Session',
    'Timeframe',
    'Entry Setup',
    'Entry Reason',
    'Exit Reason',
    'TP Reason',
    'SL Reason',
    'Pre-Trade Emotion',
    'Discipline Execution',
    'Post-Trade Emotion',
    'Discipline Score',
    'Notes'
  ];

  const rows = trades.map(t => [
    t.ticketNumber,
    accountName,
    t.pair,
    t.type,
    t.lotSize,
    t.openTime,
    t.closeTime,
    t.openPrice,
    t.closePrice,
    t.stopLoss,
    t.takeProfit,
    t.pnl,
    t.pips,
    t.commission,
    t.status,
    t.session,
    t.timeframe,
    `"${t.entryCategory.replace(/"/g, '""')}"`,
    `"${(t.entryReason || '').replace(/"/g, '""')}"`,
    `"${(t.exitReason || t.exitCategory || '').replace(/"/g, '""')}"`,
    `"${(t.tpReason || t.tpCategory || '').replace(/"/g, '""')}"`,
    `"${(t.slReason || t.slCategory || '').replace(/"/g, '""')}"`,
    `"${t.emotionBefore || ''}"`,
    `"${t.executionDiscipline || ''}"`,
    `"${t.emotionAfter || ''}"`,
    t.disciplineScore || 5,
    `"${(t.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Forex_Performance_Audit_${accountName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Parse MT4 / MT5 Statement or CSV text
export function parseBrokerStatementFile(content: string, accountId: string): Trade[] {
  const trades: Trade[] = [];
  const lines = content.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('#') || line.toLowerCase().includes('ticket') || line.toLowerCase().includes('balance')) {
      continue;
    }

    // Try CSV or space delimited parsing
    const parts = line.split(/[,\t;]+/).map(s => s.trim().replace(/^["']|["']$/g, ''));
    if (parts.length >= 6) {
      const ticket = parts[0] || `${Math.floor(8000000 + Math.random() * 1000000)}`;
      const rawPair = parts.find(p => p.toUpperCase().includes('EUR') || p.toUpperCase().includes('GBP') || p.toUpperCase().includes('USD') || p.toUpperCase().includes('XAU') || p.toUpperCase().includes('JPY')) || 'EUR/USD';
      const formattedPair = rawPair.length === 6 && !rawPair.includes('/') ? `${rawPair.slice(0, 3)}/${rawPair.slice(3)}` : rawPair;
      
      const typeStr = parts.find(p => p.toLowerCase() === 'buy' || p.toLowerCase() === 'sell') || 'BUY';
      const type = typeStr.toUpperCase() === 'SELL' ? 'SELL' : 'BUY';
      
      const numValues = parts.map(p => parseFloat(p)).filter(n => !isNaN(n));
      const lotSize = numValues.find(n => n > 0 && n <= 50) || 1.0;
      const pnl = numValues[numValues.length - 1] || 150.0;
      const openPrice = numValues.length > 2 ? numValues[1] : 1.08500;
      const closePrice = numValues.length > 3 ? numValues[2] : 1.08900;

      const pips = calculatePips(formattedPair, openPrice, closePrice, type);

      trades.push({
        id: `imported_${Date.now()}_${i}`,
        accountId,
        ticketNumber: ticket,
        pair: formattedPair,
        type,
        lotSize,
        openPrice,
        closePrice,
        stopLoss: openPrice,
        takeProfit: closePrice,
        openTime: new Date(Date.now() - (i * 86400000)).toISOString(),
        closeTime: new Date(Date.now() - (i * 86400000) + 3600000).toISOString(),
        pnl,
        grossPnl: pnl,
        pips,
        commission: Number((lotSize * 6).toFixed(2)),
        swap: 0,
        status: 'CLOSED',
        plannedRR: 2,
        realizedRR: 2,
        session: 'London',
        timeframe: '15m',
        entryCategory: 'Liquidity Sweep',
        entryReason: `Imported from broker statement (${formattedPair})`,
        exitCategory: pnl >= 0 ? 'Hit Take Profit (TP)' : 'Hit Stop Loss (SL)',
        exitReason: pnl >= 0 ? 'Target achieved' : 'Invalidation reached',
        tpCategory: 'Previous Day High/Low (PDH/PDL)',
        tpReason: 'Standard liquidity pool target',
        slCategory: 'Below/Above Recent Swing',
        slReason: 'Swing level invalidation',
        emotionBefore: 'Calm & Disciplined',
        executionDiscipline: 'Followed Plan 100%',
        emotionAfter: pnl >= 0 ? 'Satisfied & Calm' : 'Neutral & Objective',
        disciplineScore: pnl >= 0 ? 5 : 3,
        notes: 'Imported from broker statement',
        mistakes: [],
      });
    }
  }

  return trades;
}

// Aliases for clean cross-module imports
export const initialSampleAccounts = INITIAL_ACCOUNTS;
export const sampleTrades = INITIAL_TRADES;
export const calculateForexPnlAndPips = (
  pair: string,
  type: 'BUY' | 'SELL',
  openPrice: number,
  closePrice: number,
  lotSize: number
) => {
  return calculateForexPnl(pair, type, lotSize, openPrice, closePrice);
};

