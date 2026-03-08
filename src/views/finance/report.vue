<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useClubStore } from '@/stores/club';
import { useFinanceStore } from '@/stores/finance';
import { generateFinanceReport } from '@/core/services/financeService';
import {
  INCOME_CATEGORY_NAMES,
  EXPENSE_CATEGORY_NAMES,
} from '@/types/finance';
import type { FinanceReport } from '@/types/finance';

const router = useRouter();
const clubStore = useClubStore();
const financeStore = useFinanceStore();

const selectedPeriod = ref<'weekly' | 'monthly' | 'season' | 'yearly'>('weekly');
const report = ref<FinanceReport | null>(null);

const clubId = computed(() => clubStore.currentClub?.id || '');
const finance = computed(() => financeStore.getFinance(clubId.value));

const periodNames = {
  weekly: '周报',
  monthly: '月报',
  season: '季报',
  yearly: '年报',
};

const formatNumber = (num: number) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  }
  return num.toLocaleString();
};

const formatDate = (date: Date | string) => {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '未知日期';
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
};

const getProfitColor = (value: number) => {
  if (value > 0) return '#52c41a';
  if (value < 0) return '#ff4d4f';
  return '#999';
};

const generateReport = () => {
  report.value = generateFinanceReport(clubId.value, selectedPeriod.value);
};

const goBack = () => {
  router.push('/finance');
};

onMounted(() => {
  if (clubId.value && !finance.value) {
    financeStore.initFinance(clubId.value);
  }
  generateReport();
});
</script>

<template>
  <div class="report-page">
    <div class="page-header">
      <button class="back-btn" @click="goBack">← 返回</button>
      <h2 class="page-title">财务报表</h2>
    </div>

    <div v-if="report" class="report-content">
      <div class="period-selector">
        <button
          v-for="(name, key) in periodNames"
          :key="key"
          class="period-btn"
          :class="{ active: selectedPeriod === key }"
          @click="selectedPeriod = key as any; generateReport()"
        >
          {{ name }}
        </button>
      </div>

      <div class="report-header">
        <div class="report-title">{{ periodNames[selectedPeriod] }}</div>
        <div class="report-date">
          {{ formatDate(report.startDate) }} - {{ formatDate(report.endDate) }}
        </div>
      </div>

      <div class="summary-cards">
        <div class="summary-card">
          <div class="summary-label">总收入</div>
          <div class="summary-value income">+{{ formatNumber(report.totalIncome) }}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">总支出</div>
          <div class="summary-value expense">-{{ formatNumber(report.totalExpenses) }}</div>
        </div>
        <div class="summary-card main">
          <div class="summary-label">净利润</div>
          <div class="summary-value" :style="{ color: getProfitColor(report.netProfit) }">
            {{ report.netProfit >= 0 ? '+' : '' }}{{ formatNumber(report.netProfit) }}
          </div>
        </div>
      </div>

      <div class="chart-section">
        <div class="chart-card">
          <h3>收入构成</h3>
          <div class="chart-bars">
            <div
              v-for="(value, key) in report.incomeBreakdown"
              :key="key"
              class="chart-item"
            >
              <div class="chart-label">{{ INCOME_CATEGORY_NAMES[key as keyof typeof INCOME_CATEGORY_NAMES] }}</div>
              <div class="chart-bar-wrapper">
                <div
                  class="chart-bar income"
                  :style="{ width: report.totalIncome > 0 ? (value / report.totalIncome * 100) + '%' : '0%' }"
                ></div>
              </div>
              <div class="chart-value">{{ formatNumber(value) }}</div>
            </div>
          </div>
        </div>

        <div class="chart-card">
          <h3>支出构成</h3>
          <div class="chart-bars">
            <div
              v-for="(value, key) in report.expenseBreakdown"
              :key="key"
              class="chart-item"
            >
              <div class="chart-label">{{ EXPENSE_CATEGORY_NAMES[key as keyof typeof EXPENSE_CATEGORY_NAMES] }}</div>
              <div class="chart-bar-wrapper">
                <div
                  class="chart-bar expense"
                  :style="{ width: report.totalExpenses > 0 ? (value / report.totalExpenses * 100) + '%' : '0%' }"
                ></div>
              </div>
              <div class="chart-value">{{ formatNumber(value) }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="transactions-section">
        <h3>交易明细</h3>
        <div class="transactions-list">
          <div
            v-for="transaction in report.transactions"
            :key="transaction.id"
            class="transaction-item"
          >
            <div class="transaction-info">
              <div class="transaction-category">
                {{ transaction.type === 'income' 
                  ? INCOME_CATEGORY_NAMES[transaction.category as keyof typeof INCOME_CATEGORY_NAMES]
                  : EXPENSE_CATEGORY_NAMES[transaction.category as keyof typeof EXPENSE_CATEGORY_NAMES] }}
              </div>
              <div class="transaction-desc">{{ transaction.description }}</div>
              <div class="transaction-date">{{ formatDate(transaction.date) }}</div>
            </div>
            <div
              class="transaction-amount"
              :class="transaction.type"
            >
              {{ transaction.type === 'income' ? '+' : '-' }}{{ transaction.amount }}万
            </div>
          </div>
          <div v-if="report.transactions.length === 0" class="no-transactions">
            该时段暂无交易记录
          </div>
        </div>
      </div>
    </div>

    <div v-else class="no-report">
      <p>暂无报表数据</p>
      <button class="generate-btn" @click="generateReport">
        生成报表
      </button>
    </div>
  </div>
</template>

<style scoped>
.report-page {
  padding: 15px;
  padding-bottom: 80px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.back-btn {
  padding: 8px 15px;
  border: none;
  border-radius: 8px;
  background: #f5f5f5;
  color: #666;
  font-size: 14px;
  cursor: pointer;
}

.page-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.period-selector {
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
}

.period-btn {
  flex: 1;
  padding: 10px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  background: white;
  color: #666;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.period-btn.active {
  border-color: #007bff;
  background: #007bff;
  color: white;
}

.report-header {
  text-align: center;
  margin-bottom: 15px;
}

.report-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.report-date {
  font-size: 12px;
  color: #999;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 15px;
}

.summary-card {
  background: white;
  border-radius: 10px;
  padding: 12px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.summary-card.main {
  grid-column: span 1;
}

.summary-label {
  font-size: 11px;
  color: #999;
  margin-bottom: 5px;
}

.summary-value {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.summary-value.income {
  color: #52c41a;
}

.summary-value.expense {
  color: #ff4d4f;
}

.chart-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 15px;
}

.chart-card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.chart-card h3 {
  font-size: 15px;
  color: #333;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.chart-bars {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chart-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.chart-label {
  width: 70px;
  font-size: 12px;
  color: #666;
}

.chart-bar-wrapper {
  flex: 1;
  height: 16px;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
}

.chart-bar {
  height: 100%;
  border-radius: 8px;
  transition: width 0.3s ease;
  min-width: 2px;
}

.chart-bar.income {
  background: linear-gradient(90deg, #52c41a 0%, #73d13d 100%);
}

.chart-bar.expense {
  background: linear-gradient(90deg, #ff4d4f 0%, #ff7875 100%);
}

.chart-value {
  width: 50px;
  font-size: 12px;
  color: #333;
  text-align: right;
}

.transactions-section {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.transactions-section h3 {
  font-size: 15px;
  color: #333;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.transactions-list {
  display: flex;
  flex-direction: column;
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.transaction-item:last-child {
  border-bottom: none;
}

.transaction-info {
  flex: 1;
}

.transaction-category {
  font-size: 11px;
  color: #999;
  margin-bottom: 2px;
}

.transaction-desc {
  font-size: 14px;
  color: #333;
  margin-bottom: 2px;
}

.transaction-date {
  font-size: 11px;
  color: #bbb;
}

.transaction-amount {
  font-size: 15px;
  font-weight: bold;
}

.transaction-amount.income {
  color: #52c41a;
}

.transaction-amount.expense {
  color: #ff4d4f;
}

.no-transactions {
  text-align: center;
  padding: 30px;
  color: #999;
}

.no-report {
  text-align: center;
  padding: 60px 20px;
}

.no-report p {
  color: #999;
  margin-bottom: 20px;
}

.generate-btn {
  padding: 12px 30px;
  border: none;
  border-radius: 8px;
  background: #007bff;
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}
</style>
