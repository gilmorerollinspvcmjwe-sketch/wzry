export type InvestmentRound = 'seed' | 'series_a' | 'series_b' | 'series_c' | 'ipo';

export type InvestorType = 'angel' | 'vc' | 'corporate' | 'public';

export interface IncomeDetail {
  sponsors: number;
  matchPrizes: number;
  tickets: number;
  merchandise: number;
  streaming: number;
  transfers: number;
  investments: number;
}

export interface ExpenseDetail {
  salaries: number;
  facilities: number;
  transfers: number;
  operations: number;
}

export interface Balance {
  cash: number;
  assets: number;
  liabilities: number;
  equity: number;
}

export interface ValuationFactor {
  name: string;
  weight: number;
  score: number;
  contribution: number;
}

export interface Valuation {
  total: number;
  factors: ValuationFactor[];
}

export interface Investor {
  id: string;
  name: string;
  type: InvestorType;
  investment: number;
  equityPercentage: number;
  joinedDate: Date;
}

export interface Investment {
  id: string;
  round: InvestmentRound;
  amount: number;
  valuation: number;
  equitySold: number;
  investors: Investor[];
  date: Date;
  terms?: string;
}

export interface ClubFinance {
  id: string;
  clubId: string;
  income: IncomeDetail;
  expenses: ExpenseDetail;
  balance: Balance;
  valuation: Valuation;
  investments: Investment[];
  weeklyRevenue: number;
  weeklyExpenses: number;
  profitMargin: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FinanceTransaction {
  id: string;
  clubId: string;
  type: 'income' | 'expense';
  category: keyof IncomeDetail | keyof ExpenseDetail;
  amount: number;
  description: string;
  date: Date;
}

export interface FinanceReport {
  clubId: string;
  period: 'weekly' | 'monthly' | 'season' | 'yearly';
  startDate: Date;
  endDate: Date;
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  incomeBreakdown: IncomeDetail;
  expenseBreakdown: ExpenseDetail;
  transactions: FinanceTransaction[];
}

export const INVESTMENT_ROUND_NAMES: Record<InvestmentRound, string> = {
  seed: '种子轮',
  series_a: 'A轮',
  series_b: 'B轮',
  series_c: 'C轮',
  ipo: '上市',
};

export const INVESTOR_TYPE_NAMES: Record<InvestorType, string> = {
  angel: '天使投资人',
  vc: '风险投资',
  corporate: '企业投资',
  public: '公众投资',
};

export const INCOME_CATEGORY_NAMES: Record<keyof IncomeDetail, string> = {
  sponsors: '赞助收入',
  matchPrizes: '比赛奖金',
  tickets: '门票收入',
  merchandise: '周边销售',
  streaming: '直播分成',
  transfers: '转会收入',
  investments: '投资收入',
};

export const EXPENSE_CATEGORY_NAMES: Record<keyof ExpenseDetail, string> = {
  salaries: '薪资支出',
  facilities: '设施维护',
  transfers: '转会支出',
  operations: '运营支出',
};

export const INVESTMENT_ROUND_RANGES: Record<InvestmentRound, { min: number; max: number; equityRange: { min: number; max: number } }> = {
  seed: { min: 100, max: 500, equityRange: { min: 5, max: 15 } },
  series_a: { min: 500, max: 2000, equityRange: { min: 10, max: 25 } },
  series_b: { min: 2000, max: 5000, equityRange: { min: 10, max: 20 } },
  series_c: { min: 5000, max: 10000, equityRange: { min: 5, max: 15 } },
  ipo: { min: 10000, max: 50000, equityRange: { min: 10, max: 30 } },
};

export function createDefaultIncomeDetail(): IncomeDetail {
  return {
    sponsors: 0,
    matchPrizes: 0,
    tickets: 0,
    merchandise: 0,
    streaming: 0,
    transfers: 0,
    investments: 0,
  };
}

export function createDefaultExpenseDetail(): ExpenseDetail {
  return {
    salaries: 0,
    facilities: 0,
    transfers: 0,
    operations: 0,
  };
}

export function createDefaultBalance(cash: number = 0): Balance {
  return {
    cash,
    assets: 0,
    liabilities: 0,
    equity: cash,
  };
}

export function createDefaultValuation(): Valuation {
  return {
    total: 1000,
    factors: [
      { name: '战队实力', weight: 0.3, score: 50, contribution: 150 },
      { name: '品牌价值', weight: 0.2, score: 50, contribution: 100 },
      { name: '粉丝基础', weight: 0.2, score: 50, contribution: 100 },
      { name: '财务健康', weight: 0.15, score: 50, contribution: 75 },
      { name: '发展潜力', weight: 0.15, score: 50, contribution: 75 },
    ],
  };
}

export function calculateTotalIncome(income: IncomeDetail): number {
  return Object.values(income).reduce((sum, val) => sum + val, 0);
}

export function calculateTotalExpenses(expenses: ExpenseDetail): number {
  return Object.values(expenses).reduce((sum, val) => sum + val, 0);
}

export function calculateProfitMargin(income: IncomeDetail, expenses: ExpenseDetail): number {
  const totalIncome = calculateTotalIncome(income);
  const totalExpenses = calculateTotalExpenses(expenses);
  if (totalIncome === 0) return 0;
  return Math.round(((totalIncome - totalExpenses) / totalIncome) * 100);
}
