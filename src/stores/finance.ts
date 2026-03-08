import { defineStore } from 'pinia';
import type {
  ClubFinance,
  IncomeDetail,
  ExpenseDetail,
  Balance,
  Valuation,
  Investment,
  FinanceTransaction,
} from '@/types/finance';
import {
  createDefaultIncomeDetail,
  createDefaultExpenseDetail,
  createDefaultBalance,
  createDefaultValuation,
  calculateTotalIncome,
  calculateTotalExpenses,
} from '@/types/finance';
import {
  initializeFinance,
  calculateValuation,
} from '@/core/services/financeService';

interface FinanceState {
  finances: Record<string, ClubFinance>;
  transactions: Record<string, FinanceTransaction[]>;
}

export const useFinanceStore = defineStore('finance', {
  state: (): FinanceState => ({
    finances: {},
    transactions: {},
  }),

  getters: {
    getFinance: (state) => (clubId: string): ClubFinance | undefined => {
      return state.finances[clubId];
    },

    getTransactions: (state) => (clubId: string): FinanceTransaction[] => {
      return state.transactions[clubId] || [];
    },

    getTotalIncome: (state) => (clubId: string): number => {
      const finance = state.finances[clubId];
      if (!finance) return 0;
      return calculateTotalIncome(finance.income);
    },

    getTotalExpenses: (state) => (clubId: string): number => {
      const finance = state.finances[clubId];
      if (!finance) return 0;
      return calculateTotalExpenses(finance.expenses);
    },

    getNetProfit: (state) => (clubId: string): number => {
      const finance = state.finances[clubId];
      if (!finance) return 0;
      return calculateTotalIncome(finance.income) - calculateTotalExpenses(finance.expenses);
    },

    getInvestments: (state) => (clubId: string): Investment[] => {
      return state.finances[clubId]?.investments || [];
    },

    getTotalEquitySold: (state) => (clubId: string): number => {
      const finance = state.finances[clubId];
      if (!finance) return 0;
      return finance.investments.reduce((sum, inv) => sum + inv.equitySold, 0);
    },

    getRecentTransactions: (state) => (clubId: string, limit: number = 10): FinanceTransaction[] => {
      const transactions = state.transactions[clubId] || [];
      return transactions
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, limit);
    },

    hasFinance: (state) => (clubId: string): boolean => {
      return !!state.finances[clubId];
    },
  },

  actions: {
    initFinance(clubId: string): ClubFinance {
      if (this.finances[clubId]) {
        return this.finances[clubId];
      }

      const finance = initializeFinance(clubId);
      this.finances[clubId] = finance;
      this.transactions[clubId] = [];
      return finance;
    },

    updateFinance(clubId: string, finance: Partial<ClubFinance>): void {
      if (this.finances[clubId]) {
        this.finances[clubId] = {
          ...this.finances[clubId],
          ...finance,
          updatedAt: new Date(),
        };
      }
    },

    updateIncome(clubId: string, income: IncomeDetail): void {
      if (this.finances[clubId]) {
        this.finances[clubId].income = income;
        this.finances[clubId].weeklyRevenue = calculateTotalIncome(income);
        this.finances[clubId].updatedAt = new Date();
      }
    },

    updateExpenses(clubId: string, expenses: ExpenseDetail): void {
      if (this.finances[clubId]) {
        this.finances[clubId].expenses = expenses;
        this.finances[clubId].weeklyExpenses = calculateTotalExpenses(expenses);
        this.finances[clubId].updatedAt = new Date();
      }
    },

    updateBalance(clubId: string, balance: Partial<Balance>): void {
      if (this.finances[clubId]) {
        this.finances[clubId].balance = {
          ...this.finances[clubId].balance,
          ...balance,
        };
        this.finances[clubId].updatedAt = new Date();
      }
    },

    updateValuation(clubId: string, valuation: Valuation): void {
      if (this.finances[clubId]) {
        this.finances[clubId].valuation = valuation;
        this.finances[clubId].updatedAt = new Date();
      }
    },

    updateProfitMargin(clubId: string, margin: number): void {
      if (this.finances[clubId]) {
        this.finances[clubId].profitMargin = margin;
        this.finances[clubId].updatedAt = new Date();
      }
    },

    addInvestment(clubId: string, investment: Investment): void {
      if (this.finances[clubId]) {
        this.finances[clubId].investments.push(investment);
        this.finances[clubId].updatedAt = new Date();
      }
    },

    addTransaction(
      clubId: string,
      type: 'income' | 'expense',
      category: string,
      amount: number,
      description: string
    ): FinanceTransaction {
      if (!this.transactions[clubId]) {
        this.transactions[clubId] = [];
      }

      const transaction: FinanceTransaction = {
        id: `trans_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        clubId,
        type,
        category: category as any,
        amount,
        description,
        date: new Date(),
      };

      this.transactions[clubId].push(transaction);
      return transaction;
    },

    addIncome(clubId: string, category: keyof IncomeDetail, amount: number, description: string): void {
      if (this.finances[clubId]) {
        this.finances[clubId].income[category] += amount;
        this.addTransaction(clubId, 'income', category, amount, description);
        this.finances[clubId].weeklyRevenue = calculateTotalIncome(this.finances[clubId].income);
        this.finances[clubId].updatedAt = new Date();
      }
    },

    addExpense(clubId: string, category: keyof ExpenseDetail, amount: number, description: string): void {
      if (this.finances[clubId]) {
        this.finances[clubId].expenses[category] += amount;
        this.addTransaction(clubId, 'expense', category, amount, description);
        this.finances[clubId].weeklyExpenses = calculateTotalExpenses(this.finances[clubId].expenses);
        this.finances[clubId].updatedAt = new Date();
      }
    },

    recalculateValuation(clubId: string): Valuation {
      const valuation = calculateValuation(clubId);
      this.updateValuation(clubId, valuation);
      return valuation;
    },

    clearFinance(clubId: string): void {
      delete this.finances[clubId];
      delete this.transactions[clubId];
    },

    getTransactionsByCategory(clubId: string, category: string): FinanceTransaction[] {
      const transactions = this.transactions[clubId] || [];
      return transactions.filter(t => t.category === category);
    },

    getTransactionsByDateRange(
      clubId: string,
      startDate: Date,
      endDate: Date
    ): FinanceTransaction[] {
      const transactions = this.transactions[clubId] || [];
      return transactions.filter(t => {
        const date = new Date(t.date);
        return date >= startDate && date <= endDate;
      });
    },
  },

  persist: true,
});
