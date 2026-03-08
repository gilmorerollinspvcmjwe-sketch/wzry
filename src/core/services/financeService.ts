import type {
  ClubFinance,
  IncomeDetail,
  ExpenseDetail,
  Investment,
  InvestmentRound,
  Investor,
  Valuation,
  ValuationFactor,
  FinanceTransaction,
  FinanceReport,
  INVESTMENT_ROUND_RANGES,
} from '@/types/finance';
import {
  createDefaultIncomeDetail,
  createDefaultExpenseDetail,
  createDefaultBalance,
  createDefaultValuation,
  calculateTotalIncome,
  calculateTotalExpenses,
  calculateProfitMargin,
  INVESTMENT_ROUND_NAMES,
  INVESTOR_TYPE_NAMES,
} from '@/types/finance';
import { useClubStore } from '@/stores/club';
import { useFinanceStore } from '@/stores/finance';
import { useHomeVenueStore } from '@/stores/homeVenue';
import { useSponsorStore } from '@/stores/sponsor';

function generateId(): string {
  return `fin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function initializeFinance(clubId: string): ClubFinance {
  const clubStore = useClubStore();
  const club = clubStore.getClub(clubId);
  
  const initialFunds = club?.funds || 1000;
  
  const finance: ClubFinance = {
    id: generateId(),
    clubId,
    income: createDefaultIncomeDetail(),
    expenses: createDefaultExpenseDetail(),
    balance: createDefaultBalance(initialFunds),
    valuation: createDefaultValuation(),
    investments: [],
    weeklyRevenue: 0,
    weeklyExpenses: 0,
    profitMargin: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  return finance;
}

export function calculateIncome(clubId: string): IncomeDetail {
  const clubStore = useClubStore();
  const sponsorStore = useSponsorStore();
  const homeVenueStore = useHomeVenueStore();
  
  const club = clubStore.getClub(clubId);
  const sponsor = sponsorStore.currentSponsor;
  const venue = homeVenueStore.getVenue(clubId);
  
  const income: IncomeDetail = createDefaultIncomeDetail();
  
  if (sponsor) {
    income.sponsors = sponsor.weeklyPayment || 0;
  }
  
  if (club) {
    income.matchPrizes = club.prizeMoney || 0;
    income.merchandise = Math.floor((club.fans || 0) * 0.01);
  }
  
  if (venue) {
    income.tickets = Math.floor(venue.matchDay.lastMatchRevenue?.total * 0.1 || 0);
  }
  
  income.streaming = Math.floor((club?.fans || 0) * 0.005);
  
  return income;
}

export function calculateExpenses(clubId: string): ExpenseDetail {
  const clubStore = useClubStore();
  const homeVenueStore = useHomeVenueStore();
  
  const club = clubStore.getClub(clubId);
  const venue = homeVenueStore.getVenue(clubId);
  
  const expenses: ExpenseDetail = createDefaultExpenseDetail();
  
  if (club) {
    expenses.salaries = club.roster?.reduce((sum: number, p: any) => sum + (p.contract?.salary || 0), 0) || 0;
    
    if (club.facilities) {
      expenses.facilities = (club.facilities.training + club.facilities.medical + 
        club.facilities.analysis + club.facilities.youth) * 5;
    }
    
    expenses.operations = Math.floor((club.fans || 0) * 0.002);
  }
  
  return expenses;
}

export function processMatchDayRevenue(clubId: string, matchImportance: 'regular' | 'playoff' | 'finals' = 'regular'): {
  tickets: number;
  vip: number;
  merchandise: number;
  catering: number;
  total: number;
} {
  const clubStore = useClubStore();
  const homeVenueStore = useHomeVenueStore();
  const financeStore = useFinanceStore();
  
  const club = clubStore.getClub(clubId);
  const venue = homeVenueStore.getVenue(clubId);
  
  if (!venue || !club) {
    return { tickets: 0, vip: 0, merchandise: 0, catering: 0, total: 0 };
  }
  
  const standsLevel = venue.facilities.stands.level;
  const vipLevel = venue.facilities.vipArea.level;
  const shopLevel = venue.commercial.merchandiseShop.level;
  const cateringLevel = venue.commercial.catering.level;
  
  const baseAttendance = venue.capacity * (0.6 + club.reputation * 0.004);
  const importanceMultiplier = matchImportance === 'playoff' ? 1.3 : matchImportance === 'finals' ? 1.5 : 1;
  
  const attendance = Math.min(venue.capacity, Math.floor(baseAttendance * importanceMultiplier));
  const vipSeats = Math.floor(attendance * 0.05 * (vipLevel / 10));
  const regularSeats = attendance - vipSeats;
  
  const ticketPrice = venue.matchDay.baseTicketPrice * (1 + standsLevel * 0.05);
  const vipPrice = venue.matchDay.vipTicketPrice * (1 + vipLevel * 0.1);
  
  const ticketsRevenue = Math.floor(regularSeats * ticketPrice);
  const vipRevenue = Math.floor(vipSeats * vipPrice);
  const merchandiseRevenue = Math.floor(attendance * 5 * shopLevel * 0.1);
  const cateringRevenue = Math.floor(attendance * 3 * cateringLevel * 0.1);
  
  const total = ticketsRevenue + vipRevenue + merchandiseRevenue + cateringRevenue;
  
  clubStore.addFunds(total);
  
  financeStore.addTransaction(clubId, 'income', 'tickets', ticketsRevenue, `比赛日门票收入 (${matchImportance})`);
  financeStore.addTransaction(clubId, 'income', 'merchandise', merchandiseRevenue, '比赛日周边销售');
  
  return {
    tickets: ticketsRevenue,
    vip: vipRevenue,
    merchandise: merchandiseRevenue,
    catering: cateringRevenue,
    total,
  };
}

export function processMerchandiseSales(clubId: string): number {
  const clubStore = useClubStore();
  const financeStore = useFinanceStore();
  
  const club = clubStore.getClub(clubId);
  if (!club) return 0;
  
  const baseSales = Math.floor((club.fans || 0) * 0.001);
  const reputationBonus = Math.floor(club.reputation * 0.5);
  const totalSales = baseSales + reputationBonus;
  
  clubStore.addFunds(totalSales);
  financeStore.addTransaction(clubId, 'income', 'merchandise', totalSales, '周边商品销售');
  
  return totalSales;
}

export function processStreamingRevenue(clubId: string): number {
  const clubStore = useClubStore();
  const financeStore = useFinanceStore();
  
  const club = clubStore.getClub(clubId);
  if (!club) return 0;
  
  const baseRevenue = Math.floor((club.fans || 0) * 0.002);
  const reputationBonus = Math.floor(club.reputation * 0.3);
  const totalRevenue = baseRevenue + reputationBonus;
  
  clubStore.addFunds(totalRevenue);
  financeStore.addTransaction(clubId, 'income', 'streaming', totalRevenue, '直播分成收入');
  
  return totalRevenue;
}

export function seekInvestment(clubId: string, round: InvestmentRound): {
  success: boolean;
  message: string;
  investment?: Investment;
} {
  const clubStore = useClubStore();
  const financeStore = useFinanceStore();
  
  const club = clubStore.getClub(clubId);
  const finance = financeStore.getFinance(clubId);
  
  if (!club || !finance) {
    return { success: false, message: '俱乐部或财务数据不存在' };
  }
  
  const existingRounds = finance.investments.map(i => i.round);
  const roundOrder: InvestmentRound[] = ['seed', 'series_a', 'series_b', 'series_c', 'ipo'];
  const currentRoundIndex = roundOrder.indexOf(round);
  
  if (round === 'seed' && existingRounds.length > 0) {
    return { success: false, message: '已有投资记录，无法进行种子轮融资' };
  }
  
  for (let i = 0; i < currentRoundIndex; i++) {
    if (!existingRounds.includes(roundOrder[i])) {
      return { success: false, message: `请先完成${INVESTMENT_ROUND_NAMES[roundOrder[i]]}融资` };
    }
  }
  
  const valuation = calculateValuation(clubId);
  const roundConfig = {
    seed: { min: 100, max: 500, equityRange: { min: 5, max: 15 } },
    series_a: { min: 500, max: 2000, equityRange: { min: 10, max: 25 } },
    series_b: { min: 2000, max: 5000, equityRange: { min: 10, max: 20 } },
    series_c: { min: 5000, max: 10000, equityRange: { min: 5, max: 15 } },
    ipo: { min: 10000, max: 50000, equityRange: { min: 10, max: 30 } },
  };
  
  const config = roundConfig[round];
  const amount = Math.floor(config.min + Math.random() * (config.max - config.min) * (valuation.total / 5000));
  const equitySold = Math.floor(config.equityRange.min + Math.random() * (config.equityRange.max - config.equityRange.min));
  
  const investorNames = [
    '红杉资本', 'IDG资本', '经纬中国', '真格基金', '创新工场',
    '腾讯投资', '阿里资本', '字节跳动投资', '网易资本', '哔哩哔哩投资',
  ];
  
  const investorTypes: Array<'angel' | 'vc' | 'corporate' | 'public'> = ['angel', 'vc', 'corporate', 'public'];
  const investorType = round === 'seed' ? 'angel' : round === 'ipo' ? 'public' : investorTypes[Math.floor(Math.random() * 3)];
  
  const investors: Investor[] = [{
    id: `inv_${Date.now()}`,
    name: investorNames[Math.floor(Math.random() * investorNames.length)],
    type: investorType,
    investment: amount,
    equityPercentage: equitySold,
    joinedDate: new Date(),
  }];
  
  const investment: Investment = {
    id: `invest_${Date.now()}`,
    round,
    amount,
    valuation: valuation.total,
    equitySold,
    investors,
    date: new Date(),
  };
  
  clubStore.addFunds(amount);
  financeStore.addInvestment(clubId, investment);
  financeStore.addTransaction(clubId, 'income', 'investments', amount, `${INVESTMENT_ROUND_NAMES[round]}融资`);
  
  return {
    success: true,
    message: `成功完成${INVESTMENT_ROUND_NAMES[round]}融资！获得 ${amount}万，出让 ${equitySold}% 股权`,
    investment,
  };
}

export function calculateValuation(clubId: string): Valuation {
  const clubStore = useClubStore();
  const homeVenueStore = useHomeVenueStore();
  const financeStore = useFinanceStore();
  
  const club = clubStore.getClub(clubId);
  const venue = homeVenueStore.getVenue(clubId);
  const finance = financeStore.getFinance(clubId);
  
  if (!club) {
    return createDefaultValuation();
  }
  
  const teamPower = club.getTotalPower ? club.getTotalPower() : 50;
  const teamScore = Math.min(100, teamPower);
  
  const brandScore = Math.min(100, club.reputation);
  
  const fanScore = Math.min(100, Math.log10((club.fans || 10000) + 1) * 20);
  
  const funds = club.funds || 0;
  const financialScore = Math.min(100, Math.log10(funds + 1) * 15 + 30);
  
  const facilityScore = club.facilities ? 
    Math.min(100, (club.facilities.training + club.facilities.medical + 
      club.facilities.analysis + club.facilities.youth) * 2.5) : 25;
  const venueScore = venue ? Math.min(100, venue.capacity / 500) : 25;
  const potentialScore = (facilityScore + venueScore) / 2;
  
  const factors: ValuationFactor[] = [
    { name: '战队实力', weight: 0.3, score: teamScore, contribution: 0 },
    { name: '品牌价值', weight: 0.2, score: brandScore, contribution: 0 },
    { name: '粉丝基础', weight: 0.2, score: fanScore, contribution: 0 },
    { name: '财务健康', weight: 0.15, score: financialScore, contribution: 0 },
    { name: '发展潜力', weight: 0.15, score: potentialScore, contribution: 0 },
  ];
  
  let totalValuation = 1000;
  factors.forEach(factor => {
    factor.contribution = Math.round(factor.weight * factor.score * 20);
    totalValuation += factor.contribution;
  });
  
  if (finance && finance.investments.length > 0) {
    const lastInvestment = finance.investments[finance.investments.length - 1];
    totalValuation = Math.max(totalValuation, lastInvestment.valuation * 1.2);
  }
  
  return {
    total: Math.round(totalValuation),
    factors,
  };
}

export function generateFinanceReport(
  clubId: string,
  period: 'weekly' | 'monthly' | 'season' | 'yearly'
): FinanceReport {
  const financeStore = useFinanceStore();
  const clubStore = useClubStore();
  
  const club = clubStore.getClub(clubId);
  const finance = financeStore.getFinance(clubId);
  const transactions = financeStore.getTransactions(clubId);
  
  const now = new Date();
  let startDate = new Date();
  
  switch (period) {
    case 'weekly':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'monthly':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'season':
      startDate.setMonth(now.getMonth() - 3);
      break;
    case 'yearly':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
  }
  
  const periodTransactions = transactions.filter(t => new Date(t.date) >= startDate);
  
  const incomeBreakdown = createDefaultIncomeDetail();
  const expenseBreakdown = createDefaultExpenseDetail();
  
  periodTransactions.forEach(t => {
    if (t.type === 'income') {
      incomeBreakdown[t.category as keyof IncomeDetail] += t.amount;
    } else {
      expenseBreakdown[t.category as keyof ExpenseDetail] += t.amount;
    }
  });
  
  const totalIncome = calculateTotalIncome(incomeBreakdown);
  const totalExpenses = calculateTotalExpenses(expenseBreakdown);
  
  return {
    clubId,
    period,
    startDate,
    endDate: now,
    totalIncome,
    totalExpenses,
    netProfit: totalIncome - totalExpenses,
    incomeBreakdown,
    expenseBreakdown,
    transactions: periodTransactions,
  };
}

export function updateWeeklyFinance(clubId: string): void {
  const financeStore = useFinanceStore();
  const clubStore = useClubStore();
  
  const income = calculateIncome(clubId);
  const expenses = calculateExpenses(clubId);
  
  const totalIncome = calculateTotalIncome(income);
  const totalExpenses = calculateTotalExpenses(expenses);
  
  financeStore.updateIncome(clubId, income);
  financeStore.updateExpenses(clubId, expenses);
  
  const club = clubStore.getClub(clubId);
  if (club) {
    const netChange = totalIncome - totalExpenses;
    financeStore.updateBalance(clubId, {
      cash: club.funds,
      assets: financeStore.getFinance(clubId)?.balance.assets || 0,
      liabilities: financeStore.getFinance(clubId)?.balance.liabilities || 0,
      equity: club.funds,
    });
  }
  
  const valuation = calculateValuation(clubId);
  financeStore.updateValuation(clubId, valuation);
  
  const profitMargin = calculateProfitMargin(income, expenses);
  financeStore.updateProfitMargin(clubId, profitMargin);
}
