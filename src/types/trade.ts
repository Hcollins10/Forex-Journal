export type AccountType = 'funded' | 'live' | 'eval' | 'demo' | 'FUNDED' | 'LIVE' | 'EVALUATION' | 'DEMO';
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD' | string;
export type TradeType = 'BUY' | 'SELL';
export type TradeStatus = 'CLOSED' | 'OPEN' | 'CANCELLED';

export interface TradingAccount {
  id: string;
  name: string;
  broker: string;
  accountNumber?: string;
  accountType: AccountType;
  currency: CurrencyCode;
  initialBalance: number;
  currentBalance: number;
  equity?: number;
  leverage: number; // e.g. 100 for 1:100
  maxDailyDrawdownPct: number; // e.g. 5%
  maxTotalDrawdownPct: number; // e.g. 10%
  profitTargetPct?: number; // e.g. 8%
  createdAt: string;
  isDefault?: boolean;
  notes?: string;
}

export type EntryCategory =
  | 'Liquidity Sweep'
  | 'Fair Value Gap (FVG)'
  | 'Order Block (OB)'
  | 'Break of Structure (BOS)'
  | 'Key Support/Resistance'
  | 'Support / Resistance Bounce'
  | 'Session High/Low Breakout'
  | 'Trendline Retest'
  | 'Trendline Continuation'
  | 'High Impact News'
  | 'High Impact News Release'
  | 'EMA 20/50 Cross'
  | 'Double Top/Bottom'
  | 'Fibonacci Golden Pocket'
  | 'Other'
  | string;

export type ExitCategory =
  | 'Hit Take Profit (TP)'
  | 'Hit Full Take Profit (TP)'
  | 'Hit Stop Loss (SL)'
  | 'Trailing Stop Hit'
  | 'Trailing Stop Loss Triggered'
  | 'Manual Discretionary Exit'
  | 'Market Structure Shift Against'
  | 'Closed Before High-Impact News'
  | 'Partial Target + Breakeven'
  | 'Breakeven Stop Hit'
  | 'Time / Session End Close'
  | 'Weekend Invalidation'
  | string;

export type TPCategory =
  | 'Previous Day High/Low (PDH/PDL)'
  | 'Previous Day High / Low (PDH/PDL)'
  | 'Opposing Supply/Demand Zone'
  | 'Fixed Risk-Reward (1:2 or 1:3)'
  | 'Major Psychological Key Level'
  | 'Asian Session Liquidity Pool'
  | 'Fibonacci Extension Target'
  | 'Equal Highs / Equal Lows (EQH/EQL)'
  | string;

export type SLCategory =
  | 'Below/Above Recent Swing'
  | 'Invalidation of FVG/OB'
  | 'Invalidation below Swing Low / High'
  | 'Fixed Pips / Account Risk %'
  | 'Beyond Key Support/Resistance'
  | 'Average True Range (ATR) Buffer'
  | string;

export type EmotionBefore =
  | 'Calm & Disciplined'
  | 'FOMO / Rushed'
  | 'Anxious / Hesitant'
  | 'Overconfident / Greedy'
  | 'Bored / Impatient'
  | 'Revenge Mindset'
  | string;

export type ExecutionDiscipline =
  | 'Followed Plan 100%'
  | 'Cut Winner Prematurely'
  | 'Cut Winner Early (Fear)'
  | 'Moved SL to Breakeven Too Early'
  | 'Moved Stop Loss to Breakeven Too Early'
  | 'Moved SL Further Back (Violated Risk)'
  | 'Moved Stop Loss Back (Risk Violation)'
  | 'Added to Losing Position'
  | 'Over-leveraged / Sized Too Big'
  | 'Over-leveraged / Oversized'
  | string;

export type EmotionAfter =
  | 'Satisfied & Calm'
  | 'Euphoric / Invincible'
  | 'Frustrated / Regretful'
  | 'Angry & Urge to Trade'
  | 'Neutral & Objective'
  | string;

export type ForexSession = 'London' | 'New York' | 'Asian' | 'London/NY Overlap';
export type TradingSession = ForexSession;
export type Timeframe = 'M1' | 'M5' | 'M15' | 'M30' | 'H1' | 'H4' | 'D1' | '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d';

export interface Trade {
  id: string;
  accountId: string;
  ticketNumber: string;
  pair: string;
  type: TradeType;
  lotSize: number;
  openPrice: number;
  closePrice: number;
  stopLoss: number;
  takeProfit: number;
  openTime: string; // ISO string
  closeTime: string; // ISO string
  pnl: number; // Net profit/loss in account currency
  grossPnl: number;
  pips: number;
  commission: number;
  swap: number;
  status: TradeStatus;
  plannedRR: number;
  realizedRR: number;
  timeframe: Timeframe;
  session: ForexSession;
  
  // Auditing Reasons
  entryCategory: EntryCategory;
  entryReason: string;
  exitCategory: ExitCategory;
  exitReason: string;
  tpCategory: TPCategory;
  tpReason: string;
  slCategory: SLCategory;
  slReason: string;

  // Psychology & Emotion tracking
  emotionBefore: EmotionBefore;
  executionDiscipline: ExecutionDiscipline;
  emotionAfter: EmotionAfter;
  disciplineScore: number; // 1 to 5
  mistakes: string[];

  // Attachments & Notes
  chartUrl?: string;
  notes?: string;
}

export interface DayPerformance {
  dateStr: string; // 'YYYY-MM-DD'
  dayOfWeek: string; // 'Mon', 'Tue', ...
  pnl: number;
  tradesCount: number;
  wins: number;
  losses: number;
  winRate: number;
  trades: Trade[];
  isBestDay?: boolean;
  isWorstDay?: boolean;
}

export interface MonthPerformance {
  monthKey: string; // 'YYYY-MM'
  monthName: string; // 'August 2026'
  totalPnl: number;
  profitableDaysCount: number;
  losingDaysCount: number;
  breakevenDaysCount: number;
  totalTradingDays: number;
  greenDayRatio: number; // % of trading days that were green
  bestDay: DayPerformance | null;
  worstDay: DayPerformance | null;
  days: DayPerformance[];
}

export interface ConsistencyMetrics {
  consistencyScore: number; // 0-100
  profitConsistencyRatio: number; // % of total profit from highest single profit day (Rule: < 30%)
  profitConsistencyPassed: boolean;
  maxDailyDrawdownDollar: number;
  maxDailyDrawdownPct: number;
  dailyDrawdownLimitPassed: boolean;
  maxHistoricalDrawdownPct: number;
  maxTotalDrawdownPassed: boolean;
  winStreak: number;
  lossStreak: number;
  avgDisciplineScore: number;
  disciplinedTradesPct: number;
  avgRR: number;
}

export interface PerformanceStats {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  breakevenTrades: number;
  winRate: number; // percentage
  lossRate: number;
  netProfit: number;
  grossProfit: number;
  grossLoss: number;
  profitFactor: number;
  expectancy: number;
  averageWin: number;
  averageLoss: number;
  winLossRatio: number;
  totalPips: number;
  highestProfitTrade: Trade | null;
  highestLossTrade: Trade | null;
  highestProfitDay: DayPerformance | null;
  highestLossDay: DayPerformance | null;
  consistency: ConsistencyMetrics;
}

export interface EmotionStatsItem {
  emotion: EmotionBefore;
  tradesCount: number;
  totalPnl: number;
  winRate: number;
  avgDisciplineScore: number;
  avgPnl: number;
}

export interface SetupStatsItem {
  category: string;
  tradesCount: number;
  totalPnl: number;
  winRate: number;
  profitFactor: number;
  avgRR: number;
}
